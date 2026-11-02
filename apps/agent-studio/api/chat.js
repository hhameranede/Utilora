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
const AGENT_IDS = new Set(AGENTS.map(([id]) => id));

const json = (res, status, value) => {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Vary", "Cookie, Authorization");
  return res.status(status).json(value);
};

function getConfig() {
  return {
    url: process.env.SUPABASE_URL?.replace(/\/$/, ""),
    key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    githubToken: process.env.UTILORA_GITHUB_TOKEN,
    repository: process.env.UTILORA_GITHUB_REPOSITORY || "hhameranede/Utilora",
    ref: process.env.UTILORA_AGENT_WORKFLOW_REF || "main",
    workflow: process.env.UTILORA_AGENT_WORKFLOW_FILE || "agent-chat-execution.yml",
    siteUrl: process.env.SITE_URL || "https://utilora-chat.vercel.app"
  };
}

async function db(config, path, method = "GET", body) {
  const headers = {
    apikey: config.key,
    Authorization: "Bearer " + config.key,
    "Content-Type": "application/json",
    Prefer: "return=representation"
  };
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(config.url + "/rest/v1/" + path, {
        method,
        headers,
        signal: AbortSignal.timeout(20000),
        ...(body === undefined ? {} : { body: JSON.stringify(body) })
      });
      const text = await response.text();
      let data;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }
      if (!response.ok) {
        const error = new Error(response.status === 409 ? "Room already exists." : "Database operation failed.");
        error.status = response.status;
        error.code = data?.code || null;
        console.error("[Agent Studio] Supabase REST failure", { route: path.split("?")[0], status: response.status, code: error.code });
        if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          lastError = error;
          continue;
        }
        throw error;
      }
      return data;
    } catch (error) {
      lastError = error;
      const retryable = error?.name === "AbortError" || error?.name === "TimeoutError" || !error?.status;
      if (attempt === 0 && retryable) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        continue;
      }
      throw error;
    }
  }
  throw lastError || new Error("Database operation failed.");
}

function parseRoomSlug(value) {
  const slug = typeof value === "string" ? value : "main";
  if (slug === "main") return { slug, kind: "group", agentId: null };
  if (slug.startsWith("agent-")) {
    const agentId = slug.slice(6);
    if (AGENT_IDS.has(agentId)) return { slug, kind: "private", agentId };
  }
  return null;
}

async function getRoom(config, descriptor) {
  let rooms = await db(config, "team_chat_rooms?slug=eq." + encodeURIComponent(descriptor.slug) + "&select=id,slug,title&limit=1");
  if (rooms?.[0]) return rooms[0];

  const agent = AGENTS.find(([id]) => id === descriptor.agentId);
  const title = descriptor.kind === "group" ? "غرفة فريق UTILORA" : "محادثة خاصة · " + (agent?.[0] || descriptor.agentId);
  try {
    const created = await db(config, "team_chat_rooms?select=id,slug,title", "POST", {
      id: crypto.randomUUID(), slug: descriptor.slug, title
    });
    if (created?.[0]) return created[0];
  } catch (error) {
    if (error.status !== 409) throw error;
  }
  rooms = await db(config, "team_chat_rooms?slug=eq." + encodeURIComponent(descriptor.slug) + "&select=id,slug,title&limit=1");
  if (!rooms?.[0]) throw new Error("Room could not be created.");
  return rooms[0];
}

async function getRoomSnapshot(config, room) {
  const roomId = encodeURIComponent(room.id);
  const [messages, runs] = await Promise.all([
    db(config, "team_chat_messages?room_id=eq." + roomId + "&select=id,room_id,run_id,role,agent_id,content,metadata,created_at&order=created_at.desc&limit=200"),
    db(config, "team_chat_runs?room_id=eq." + roomId + "&select=id,status,stage,progress,created_at,started_at,finished_at,error&order=created_at.desc&limit=1")
  ]);
  let agents = [];
  let events = [];
  if (runs?.[0]?.id) {
    const runId = encodeURIComponent(runs[0].id);
    [agents, events] = await Promise.all([
      db(config, "team_chat_agent_runs?run_id=eq." + runId + "&select=agent_id,status,status_text,progress,response,error,started_at,finished_at"),
      db(config, "team_chat_events?run_id=eq." + runId + "&select=id,agent_id,event_type,message,metadata,created_at&order=created_at.desc&limit=60")
    ]);
  }
  return { room, messages: (messages || []).reverse(), runs: runs || [], agents: agents || [], events: events || [] };
}

export default async function handler(req, res) {
  const config = getConfig();

  if (req.method === "GET") {
    if (!config.url || !config.key) return json(res, 503, { error: "ربط قاعدة بيانات مساحة الفريق لم يكتمل بعد." });
    try {
      const descriptor = parseRoomSlug(req.query?.room);
      if (!descriptor) return json(res, 404, { error: "غرفة المحادثة غير موجودة." });
      const room = await getRoom(config, descriptor);
      return json(res, 200, { ...(await getRoomSnapshot(config, room)), kind: descriptor.kind, agentId: descriptor.agentId });
    } catch {
      return json(res, 502, { error: "تعذّر جلب سجل المحادثة من قاعدة البيانات." });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Method not allowed." });
  }

  const origin = req.headers.origin;
  // A state-changing request must come from the dedicated chat origin.
  // Reject missing Origin too: the browser always sends it for this JSON POST.
  if (!origin || origin !== new URL(config.siteUrl).origin) {
    return json(res, 403, { error: "مصدر الطلب غير مصرح به." });
  }
  if (!config.url || !config.key) return json(res, 503, { error: "ربط قاعدة بيانات المحادثة غير مكتمل." });
  if (!config.githubToken) return json(res, 503, { error: "ربط تشغيل الوكلاء عبر GitHub Actions غير مكتمل." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const descriptor = parseRoomSlug(body.room);
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!descriptor) return json(res, 404, { error: "غرفة المحادثة غير موجودة." });
    if (!content) return json(res, 400, { error: "اكتب رسالة قبل الإرسال." });
    if (content.length > 12000) return json(res, 413, { error: "الرسالة طويلة جدًا؛ الحد الأقصى 12 ألف حرف." });

    const room = await getRoom(config, descriptor);
    const roomId = room.id;
    const createdMessages = await db(config, "team_chat_messages?select=id,room_id,role,content,created_at", "POST", {
      room_id: roomId, role: "user", content,
      metadata: { source: "private-agent-studio", mode: descriptor.kind }
    });
    const message = createdMessages?.[0];
    if (!message?.id) throw new Error("Message insert did not return an ID.");

    const createdRuns = await db(config, "team_chat_runs?select=id,status,created_at", "POST", {
      room_id: roomId, prompt_message_id: message.id, status: "queued",
      stage: descriptor.kind === "group" ? "قائد الفريق يوزع المهمة" : "تم توجيه الرسالة إلى الوكيل المختار",
      progress: 0
    });
    const run = createdRuns?.[0];
    if (!run?.id) throw new Error("Run insert did not return an ID.");

    await db(config, "team_chat_messages?id=eq." + encodeURIComponent(message.id), "PATCH", { run_id: run.id });
    const participants = descriptor.kind === "group"
      ? AGENTS
      : AGENTS.filter(([id]) => id === descriptor.agentId);
    await db(config, "team_chat_agent_runs", "POST", participants.map(([agent_id, model_id]) => ({
      run_id: run.id, agent_id, model_id, status: "queued",
      status_text: "في قائمة الانتظار", progress: 0
    })));

    // Set the run live before dispatch to avoid a fast callback being
    // overwritten by a late "running" update after dispatch returns.
    await db(config, "team_chat_runs?id=eq." + encodeURIComponent(run.id), "PATCH", {
      status: "running",
      stage: descriptor.kind === "group" ? "يختار الوكلاء المتخصصون من لديه إضافة مفيدة" : "الوكيل يقرأ سياق محادثتك الخاصة",
      progress: 1, started_at: new Date().toISOString()
    });

    const dispatchUrl = "https://api.github.com/repos/" + config.repository + "/actions/workflows/" + encodeURIComponent(config.workflow) + "/dispatches";
    let dispatch;
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
      })
      });
    } catch {
      dispatch = null;
    }

    if (!dispatch?.ok) {
      await db(config, "team_chat_runs?id=eq." + encodeURIComponent(run.id), "PATCH", {
        status: "failed", stage: "تعذّر تشغيل GitHub Actions",
        error: "workflow_dispatch_failed", finished_at: new Date().toISOString()
      });
      await db(config, "team_chat_agent_runs?run_id=eq." + encodeURIComponent(run.id), "PATCH", {
        status: "failed", status_text: "تعذّر بدء التشغيل", progress: 100
      });
      return json(res, 502, { error: "تم حفظ الرسالة، لكن GitHub Actions رفض تشغيل الوكيل. راجع صلاحية رمز GitHub في الخادم." });
    }

    return json(res, 202, { message: { ...message, run_id: run.id }, run: { id: run.id, status: "running" } });
  } catch {
    return json(res, 502, { error: "حدث خطأ أثناء إرسال الرسالة. لم يتم إظهار أي رد غير مؤكد." });
  }
}
