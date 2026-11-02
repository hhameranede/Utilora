import {
  AGENTS, db, getConfig, getRoom, getRoomSnapshot, json, parseRoomSlug, requireOwner
} from "../_lib/server.js";

export async function onRequest(context) {
  const access = await requireOwner(context);
  if (access.response) return access.response;

  const request = context.request;
  const config = getConfig(context.env);
  const url = new URL(request.url);

  if (request.method === "GET") {
    try {
      const descriptor = parseRoomSlug(url.searchParams.get("room"));
      if (!descriptor) return json({ error: "غرفة المحادثة غير موجودة." }, 404);
      const room = await getRoom(config, descriptor);
      return json({
        ...(await getRoomSnapshot(config, room)),
        kind: descriptor.kind,
        agentId: descriptor.agentId
      });
    } catch (error) {
      console.error("[Agent Studio] Chat history request failed", error?.status || error?.name || "unknown");
      return json({ error: "تعذّر جلب سجل المحادثة من قاعدة البيانات." }, 502);
    }
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405, { Allow: "GET, POST" });
  }

  if (request.headers.get("Origin") !== url.origin) {
    return json({ error: "مصدر الطلب غير مصرح به." }, 403);
  }
  if (!config.url || !config.key || config.key.startsWith("sb_publishable_")) {
    return json({ error: "ربط قاعدة بيانات المحادثة غير مكتمل أو يستخدم مفتاحًا عامًا." }, 503);
  }
  if (!config.githubToken) {
    return json({ error: "ربط تشغيل الوكلاء عبر GitHub Actions غير مكتمل." }, 503);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const descriptor = parseRoomSlug(body.room);
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!descriptor) return json({ error: "غرفة المحادثة غير موجودة." }, 404);
    if (!content) return json({ error: "اكتب رسالة قبل الإرسال." }, 400);
    if (content.length > 12000) return json({ error: "الرسالة طويلة جدًا؛ الحد الأقصى 12 ألف حرف." }, 413);

    const room = await getRoom(config, descriptor);
    const createdMessages = await db(config,
      "team_chat_messages?select=id,room_id,role,content,created_at", "POST", {
        room_id: room.id,
        role: "user",
        content,
        metadata: { source: "private-agent-studio", mode: descriptor.kind }
      });
    const message = createdMessages?.[0];
    if (!message?.id) throw new Error("Message insert did not return an ID.");

    const createdRuns = await db(config, "team_chat_runs?select=id,status,created_at", "POST", {
      room_id: room.id,
      prompt_message_id: message.id,
      status: "queued",
      stage: descriptor.kind === "group" ? "قائد الفريق يوزع المهمة" : "تم توجيه الرسالة إلى الوكيل المختار",
      progress: 0
    });
    const run = createdRuns?.[0];
    if (!run?.id) throw new Error("Run insert did not return an ID.");

    await db(config, "team_chat_messages?id=eq." + encodeURIComponent(message.id), "PATCH", {
      run_id: run.id
    });

    const participants = descriptor.kind === "group"
      ? AGENTS
      : AGENTS.filter(([id]) => id === descriptor.agentId);
    await db(config, "team_chat_agent_runs", "POST", participants.map(([agent_id, model_id]) => ({
      run_id: run.id,
      agent_id,
      model_id,
      status: "queued",
      status_text: "في قائمة الانتظار",
      progress: 0
    })));

    await db(config, "team_chat_runs?id=eq." + encodeURIComponent(run.id), "PATCH", {
      status: "running",
      stage: descriptor.kind === "group"
        ? "يختار الوكلاء المتخصصون من لديه إضافة مفيدة"
        : "الوكيل يقرأ سياق محادثتك الخاصة",
      progress: 1,
      started_at: new Date().toISOString()
    });

    const dispatchUrl = "https://api.github.com/repos/" + config.repository +
      "/actions/workflows/" + encodeURIComponent(config.workflow) + "/dispatches";
    let dispatch = null;
    try {
      dispatch = await fetch(dispatchUrl, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + config.githubToken,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ref: config.ref,
          inputs: {
            run_id: run.id,
            mode: descriptor.kind,
            target_agent: descriptor.agentId || "none"
          }
        }),
        signal: AbortSignal.timeout(10000)
      });
    } catch {
      dispatch = null;
    }

    if (!dispatch?.ok) {
      await db(config, "team_chat_runs?id=eq." + encodeURIComponent(run.id), "PATCH", {
        status: "failed",
        stage: "تعذّر تشغيل GitHub Actions",
        error: "workflow_dispatch_failed",
        finished_at: new Date().toISOString()
      });
      await db(config, "team_chat_agent_runs?run_id=eq." + encodeURIComponent(run.id), "PATCH", {
        status: "failed",
        status_text: "تعذّر بدء التشغيل",
        progress: 100
      });
      return json({
        error: "تم حفظ الرسالة، لكن GitHub Actions رفض تشغيل الوكيل. راجع صلاحية رمز GitHub في إعدادات Cloudflare."
      }, 502);
    }

    return json({
      message: { ...message, run_id: run.id },
      run: { id: run.id, status: "running" }
    }, 202);
  } catch (error) {
    console.error("[Agent Studio] Message submission failed", error?.status || error?.name || "unknown");
    return json({ error: "حدث خطأ أثناء إرسال الرسالة. لم يتم إظهار أي رد غير مؤكد." }, 502);
  }
}
