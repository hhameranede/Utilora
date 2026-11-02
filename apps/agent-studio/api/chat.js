const AGENTS = [
  ["problem-analyst", "nvidia-nim/deepseek-v4-1-flash"],
  ["implementation-engineer", "nvidia-nim/minimax-m3-1-flash"],
  ["fast-task-engineer", "nvidia-nim/glm-5-3-flash"],
  ["visual-reviewer", "nvidia-nim/nemotron-super-vl"],
  ["long-horizon-engineer", "nvidia-nim/laguna-xs-2-1"],
  ["qa-engineer", "nvidia-nim/deepseek-v4-1-flash"],
  ["security-auditor", "nvidia-nim/nemotron-ultra"],
  ["project-lead", "nvidia-nim/nemotron-ultra"]
];

const json = (res, status, value) => {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Vary", "Cookie, Authorization");
  return res.status(status).json(value);
};

function getConfig() {
  return {
    url: process.env.SUPABASE_URL?.replace(/\/$/, ""),
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
    githubToken: process.env.UTILORA_GITHUB_TOKEN,
    repository: process.env.UTILORA_GITHUB_REPOSITORY || "hhameranede/Utilora",
    ref: process.env.UTILORA_AGENT_WORKFLOW_REF || "main",
    workflow: process.env.UTILORA_AGENT_WORKFLOW_FILE || "agent-chat-execution.yml"
  };
}

async function db(config, path, method = "GET", body) {
  const response = await fetch(config.url + "/rest/v1/" + path, {
    method,
    headers: {
      apikey: config.key,
      Authorization: "Bearer " + config.key,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!response.ok) throw new Error("Database operation failed.");
  return data;
}

export default async function handler(req, res) {
  const config = getConfig();

  if (req.method === "GET") {
    if (!config.url || !config.key) return json(res, 503, { error: "ربط قاعدة بيانات مساحة الفريق لم يكتمل بعد." });
    try {
      const slug = typeof req.query?.room === "string" ? req.query.room : "main";
      if (slug !== "main") return json(res, 404, { error: "غرفة المحادثة غير موجودة." });
      const rooms = await db(config, "team_chat_rooms?slug=eq.main&select=id,slug,title&limit=1");
      if (!rooms?.[0]) return json(res, 404, { error: "غرفة الفريق غير مهيأة في قاعدة البيانات." });
      const roomId = rooms[0].id;
      const messages = await db(config, "team_chat_messages?room_id=eq." + encodeURIComponent(roomId) + "&select=id,room_id,run_id,role,agent_id,content,metadata,created_at&order=created_at.asc&limit=150");
      const runs = await db(config, "team_chat_runs?room_id=eq." + encodeURIComponent(roomId) + "&select=id,status,stage,progress,created_at,finished_at&order=created_at.desc&limit=1");
      let agents = [];
      if (runs?.[0]?.id) agents = await db(config, "team_chat_agent_runs?run_id=eq." + encodeURIComponent(runs[0].id) + "&select=agent_id,status,status_text,progress");
      return json(res, 200, { room: rooms[0], messages: messages || [], runs: runs || [], agents: agents || [] });
    } catch {
      return json(res, 502, { error: "تعذّر جلب بيانات غرفة الفريق من قاعدة البيانات." });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Method not allowed." });
  }

  if (!config.url || !config.key) return json(res, 503, { error: "ربط Supabase غير مكتمل. لم تُحفظ رسالتك ولم يبدأ أي وكيل." });
  if (!config.githubToken) return json(res, 503, { error: "ربط تشغيل الوكلاء عبر GitHub Actions غير مكتمل. لم تُحفظ رسالتك ولم يبدأ أي تشغيل." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const roomSlug = body.room || "main";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (roomSlug !== "main") return json(res, 404, { error: "غرفة المحادثة غير موجودة." });
    if (!content) return json(res, 400, { error: "اكتب رسالة قبل الإرسال." });
    if (content.length > 12000) return json(res, 413, { error: "الرسالة طويلة جدًا؛ الحد الأقصى 12 ألف حرف." });

    const rooms = await db(config, "team_chat_rooms?slug=eq.main&select=id&limit=1");
    if (!rooms?.[0]) return json(res, 404, { error: "غرفة الفريق غير مهيأة في قاعدة البيانات." });
    const roomId = rooms[0].id;

    const createdMessages = await db(config, "team_chat_messages?select=id,room_id,role,content,created_at", "POST", {
      room_id: roomId, role: "user", content, metadata: { source: "private-agent-studio" }
    });
    const message = createdMessages?.[0];
    if (!message?.id) throw new Error("Message insert did not return an ID.");

    const createdRuns = await db(config, "team_chat_runs?select=id,status,created_at", "POST", {
      room_id: roomId, prompt_message_id: message.id, status: "queued", stage: "في قائمة الانتظار", progress: 0
    });
    const run = createdRuns?.[0];
    if (!run?.id) throw new Error("Run insert did not return an ID.");

    await db(config, "team_chat_messages?id=eq." + encodeURIComponent(message.id), "PATCH", { run_id: run.id });
    await db(config, "team_chat_agent_runs", "POST", AGENTS.map(([agent_id, model_id]) => ({
      run_id: run.id, agent_id, model_id, status: "queued", status_text: "في قائمة الانتظار", progress: 0
    })));

    const dispatchUrl = "https://api.github.com/repos/" + config.repository + "/actions/workflows/" + encodeURIComponent(config.workflow) + "/dispatches";
    const dispatch = await fetch(dispatchUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + config.githubToken,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ref: config.ref, inputs: { run_id: run.id } })
    });

    if (!dispatch.ok) {
      await db(config, "team_chat_runs?id=eq." + encodeURIComponent(run.id), "PATCH", {
        status: "failed", stage: "تعذّر تشغيل GitHub Actions", error: "workflow_dispatch_failed", finished_at: new Date().toISOString()
      });
      await db(config, "team_chat_agent_runs?run_id=eq." + encodeURIComponent(run.id), "PATCH", {
        status: "failed", status_text: "تعذّر بدء التشغيل"
      });
      return json(res, 502, { error: "تم حفظ المهمة، لكن GitHub Actions رفض بدء تشغيل الفريق. راجع صلاحية رمز GitHub في إعدادات الخادم." });
    }

    await db(config, "team_chat_runs?id=eq." + encodeURIComponent(run.id), "PATCH", {
      status: "running", stage: "يستعد الوكلاء للعمل", progress: 1, started_at: new Date().toISOString()
    });
    return json(res, 202, { message: { ...message, run_id: run.id }, run: { id: run.id, status: "running" } });
  } catch {
    return json(res, 502, { error: "حدث خطأ أثناء إرسال المهمة. لم يتم إظهار أي رد غير مؤكد." });
  }
}
