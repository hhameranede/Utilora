import {
  AGENTS, db, getConfig, getRoom, getRoomSnapshot, json, parseRoomSlug, requireOwner
} from "../_lib/server.js";

function safeGitHubMessage(value) {
  return String(value || "GitHub returned no error message.")
    .replace(/Bearer\s+[A-Za-z0-9._~+\\/-]+=*/gi, "Bearer [redacted]")
    .replace(/gh[pousr]_[A-Za-z0-9]{20,}/gi, "[redacted GitHub token]")
    .replace(/github_pat_[A-Za-z0-9_]{20,}/gi, "[redacted GitHub token]")
    .replace(/[\r\n]+/g, " ")
    .slice(0, 320);
}

function explainDispatchFailure(status, message) {
  if (status === 401) return "تحقق من صلاحية الرمز UTILORA_GITHUB_TOKEN؛ قد يكون منتهيًا أو ملغى.";
  if (status === 403 && /rate limit|secondary rate limit/i.test(message)) {
    return "تجاوزت طلبات GitHub الحد المسموح مؤقتًا؛ انتظر قليلًا ثم أعد المحاولة.";
  }
  if (status === 403) {
    return "الاحتمال الأقوى أن الرمز يفتقد صلاحية المستودع Actions: Read and write. في Fine-grained token اختر hhameranede/Utilora ثم Repository permissions → Actions → Read and write.";
  }
  if (status === 404) return "تحقق من أن الرمز يملك وصولًا إلى hhameranede/Utilora وأن ملف .github/workflows/agent-chat-execution.yml موجود على main.";
  if (status === 422) return "GitHub رفض بيانات التشغيل؛ تحقق من inputs ووجود workflow_dispatch في ملف Workflow.";
  if (status === 429) return "GitHub يقيّد الطلبات مؤقتًا؛ أعد المحاولة بعد فترة قصيرة.";
  if (status >= 500) return "حدث خطأ مؤقت لدى GitHub؛ أعد المحاولة لاحقًا.";
  return "افحص صلاحية الرمز وإعدادات GitHub Actions في المستودع.";
}


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

  const diagnosticId = crypto.randomUUID();
  let runIdForRecovery = "";
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
    runIdForRecovery = run.id;

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
    let networkFailure = "";
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
    } catch (error) {
      dispatch = null;
      networkFailure = error?.name === "TimeoutError" || error?.name === "AbortError"
        ? "انتهت مهلة الاتصال بـGitHub قبل تأكيد تشغيل المهمة."
        : "تعذّر الاتصال بـGitHub لإرسال أمر التشغيل.";
    }

    if (!dispatch?.ok) {
      const githubPayload = dispatch ? await dispatch.json().catch(() => ({})) : {};
      const status = dispatch?.status || 0;
      const githubMessage = safeGitHubMessage(githubPayload?.message || networkFailure || "لم يصل رد من GitHub.");
      const guidance = status ? explainDispatchFailure(status, githubMessage) : networkFailure;
      const requestId = dispatch?.headers?.get("x-github-request-id") || "";
      const dispatchError = [
        "فشل تشغيل GitHub Actions" + (status ? " (HTTP " + status + ")" : ""),
        githubMessage,
        guidance,
        requestId ? "GitHub Request ID: " + requestId : ""
      ].filter(Boolean).join(" — ").slice(0, 900);

      await db(config, "team_chat_runs?id=eq." + encodeURIComponent(run.id), "PATCH", {
        status: "failed",
        stage: "تعذّر تشغيل GitHub Actions",
        error: dispatchError,
        finished_at: new Date().toISOString()
      });
      await db(config, "team_chat_agent_runs?run_id=eq." + encodeURIComponent(run.id), "PATCH", {
        status: "failed",
        status_text: "تعذّر بدء التشغيل",
        progress: 100,
        error: dispatchError
      });
      console.error("[Agent Studio] GitHub workflow dispatch rejected", {
        diagnostic_id: diagnosticId,
        http_status: status || null,
        github_request_id: requestId || null,
        github_message: githubMessage
      });
      return json({
        error: "تم حفظ رسالتك لكن تعذّر تشغيل الوكلاء. " + dispatchError,
        diagnostic_id: diagnosticId
      }, 502);
    }

    return json({
      message: { ...message, run_id: run.id },
      run: { id: run.id, status: "running" }
    }, 202);
  } catch (error) {
    if (runIdForRecovery) {
      try {
        await db(config, "team_chat_runs?id=eq." + encodeURIComponent(runIdForRecovery), "PATCH", {
          status: "failed",
          stage: "تعذّر تجهيز تشغيل الوكلاء",
          error: "request_failed_" + diagnosticId,
          finished_at: new Date().toISOString()
        });
        await db(config, "team_chat_agent_runs?run_id=eq." + encodeURIComponent(runIdForRecovery), "PATCH", {
          status: "failed",
          status_text: "تعذّر بدء التشغيل",
          progress: 100,
          error: "request_failed_" + diagnosticId
        });
      } catch (recoveryError) {
        console.error("[Agent Studio] Failed to mark incomplete run", diagnosticId, recoveryError?.status || recoveryError?.name || "unknown");
      }
    }
    const detail = [
      error?.status ? "HTTP " + error.status : "",
      error?.code ? "DB " + error.code : ""
    ].filter(Boolean).join(" · ");
    console.error("[Agent Studio] Message submission failed", {
      diagnostic_id: diagnosticId,
      status: error?.status || null,
      code: error?.code || null,
      name: error?.name || "unknown"
    });
    return json({
      error: "تعذّر إرسال المهمة. مرجع التشخيص: " + diagnosticId.slice(0, 8) + (detail ? " (" + detail + ")" : "") + ". بقي نص الرسالة في مربع الكتابة.",
      diagnostic_id: diagnosticId
    }, 502);
  }
}
