const AGENT_IDS = new Set([
  "problem-analyst", "implementation-engineer", "fast-task-engineer",
  "visual-reviewer", "long-horizon-engineer", "qa-engineer",
  "security-auditor", "project-lead"
]);
const REQUIRED_ROOMS = [
  "main",
  "agent-problem-analyst",
  "agent-implementation-engineer",
  "agent-fast-task-engineer",
  "agent-visual-reviewer",
  "agent-long-horizon-engineer",
  "agent-qa-engineer",
  "agent-security-auditor",
  "agent-project-lead"
];

function getServerKeyIssue(config) {
  const key = String(config.key || "");
  if (!key) return "مفتاح Supabase الخادمي غير مضبوط في Vercel.";
  if (key.startsWith("sb_secret_")) return "";
  if (key.startsWith("sb_publishable_")) {
    return "مفتاح Supabase في Vercel من نوع Publishable وليس Secret. استبدل SUPABASE_SECRET_KEY بمفتاح Secret يبدأ بـ sb_secret_ ثم أعد النشر.";
  }
  const parts = key.split(".");
  if (parts.length === 3 && parts[1]) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
      const expectedRef = config.url ? new URL(config.url).hostname.split(".")[0] : "";
      if (payload.role === "service_role" && (!payload.ref || payload.ref === expectedRef)) return "";
      if (payload.role === "anon") return "مفتاح Supabase مضبوط كـ anon وليس service_role. استخدم مفتاح الخادم في Vercel.";
    } catch {
      // Invalid legacy key; fail closed.
    }
  }
  return "قيمة SUPABASE_SECRET_KEY ليست مفتاح Supabase خادمياً صالحاً.";
}

function getConfig() {
  return {
    url: process.env.SUPABASE_URL?.replace(/\/$/, ""),
    key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    githubToken: process.env.UTILORA_GITHUB_TOKEN,
    repository: process.env.UTILORA_GITHUB_REPOSITORY || "hhameranede/Utilora",
    workflow: process.env.UTILORA_AGENT_WORKFLOW_FILE || "agent-chat-execution.yml",
    callbackUrl: process.env.AGENT_CHAT_CALLBACK_URL,
    siteUrl: process.env.SITE_URL || "https://utilora-chat.vercel.app"
  };
}

async function db(config, path) {
  const headers = {
    apikey: config.key,
    Authorization: "Bearer " + config.key,
    Accept: "application/json"
  };
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(config.url + "/rest/v1/" + path, {
        headers,
        signal: AbortSignal.timeout(4500)
      });
      if (!response.ok) {
        const error = new Error("Database operation failed.");
        error.status = response.status;
        console.error("[Agent Studio] Supabase health check failed", { route: path.split("?")[0], status: response.status });
        if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          lastError = error;
          continue;
        }
        throw error;
      }
      return response.json();
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

async function checkDatabase(config) {
  if (!config.url || !config.key) return false;
  const rows = await db(config, "team_chat_rooms?select=slug");
  const available = new Set((Array.isArray(rows) ? rows : []).map((row) => row.slug));
  return REQUIRED_ROOMS.every((slug) => available.has(slug));
}

async function checkGitHubWorkflow(config) {
  if (!config.githubToken) return false;
  const workflowPath = ".github/workflows/" + config.workflow;
  const url = "https://api.github.com/repos/" + config.repository +
    "/actions/workflows/" + encodeURIComponent(config.workflow);
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + config.githubToken,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      signal: AbortSignal.timeout(6000)
    });
    if (!response.ok) return false;
    const workflow = await response.json();
    return workflow.state === "active" && workflow.path === workflowPath;
  } catch {
    return false;
  }
}

async function checkCallback(config) {
  if (!config.callbackUrl) return false;
  try {
    const origin = new URL(config.siteUrl).origin;
    const response = await fetch(config.callbackUrl, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type"
      },
      signal: AbortSignal.timeout(6000)
    });
    return response.ok && response.headers.get("access-control-allow-origin") === origin;
  } catch {
    return false;
  }
}

function parseRoom(value) {
  const slug = typeof value === "string" ? value : "main";
  if (slug === "main") return slug;
  if (slug.startsWith("agent-") && AGENT_IDS.has(slug.slice(6))) return slug;
  return null;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Vary", "Cookie, Authorization");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const config = getConfig();
  const roomSlug = parseRoom(req.query?.room);
  if (!roomSlug) return res.status(404).json({ error: "غرفة المحادثة غير موجودة." });

  const integrations = {
    database: Boolean(config.url && !getServerKeyIssue(config)),
    databaseError: getServerKeyIssue(config) || null,
    dispatcher: Boolean(config.githubToken),
    callback: Boolean(config.callbackUrl),
    checked: false
  };

  // Do the slower, external integration checks on page load or manual refresh,
  // not on every seven-second progress poll.
  if (req.query?.health === "1") {
    const [database, dispatcher, callback] = await Promise.all([
      checkDatabase(config).catch(() => false),
      checkGitHubWorkflow(config),
      checkCallback(config)
    ]);
    integrations.database = database;
    integrations.dispatcher = dispatcher;
    integrations.callback = callback;
    integrations.checked = true;
  }

  let agents = [];
  let run = null;
  let events = [];
  if (integrations.database) {
    try {
      const rooms = await db(config, "team_chat_rooms?slug=eq." + encodeURIComponent(roomSlug) + "&select=id,slug,title&limit=1");
      if (!rooms[0]) throw new Error("Chat room is missing.");
      const runs = await db(config, "team_chat_runs?room_id=eq." + encodeURIComponent(rooms[0].id) +
        "&select=id,status,stage,progress,created_at,started_at,finished_at,error&order=created_at.desc&limit=1");
      run = runs[0] || null;
      if (run?.id) {
        const runId = encodeURIComponent(run.id);
        const [rows, eventRows] = await Promise.all([
          db(config, "team_chat_agent_runs?run_id=eq." + runId +
            "&select=agent_id,status,status_text,progress,response,error,started_at,finished_at"),
          db(config, "team_chat_events?run_id=eq." + runId +
            "&select=id,agent_id,event_type,message,metadata,created_at&order=created_at.desc&limit=40")
        ]);
        agents = Array.isArray(rows) ? rows : [];
        events = Array.isArray(eventRows) ? eventRows : [];
      }
    } catch {
      integrations.database = false;
      run = null;
      agents = [];
      events = [];
    }
  }

  return res.status(200).json({
    private: true,
    auth: "vercel-protected",
    integrations,
    room: roomSlug,
    run,
    events,
    agents
  });
}
