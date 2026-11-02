const AGENT_IDS = new Set([
  "problem-analyst", "implementation-engineer", "fast-task-engineer",
  "visual-reviewer", "long-horizon-engineer", "qa-engineer",
  "security-auditor", "project-lead"
]);

function getConfig() {
  return {
    url: process.env.SUPABASE_URL?.replace(/\/$/, ""),
    key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    githubToken: process.env.UTILORA_GITHUB_TOKEN,
    callbackUrl: process.env.AGENT_CHAT_CALLBACK_URL
  };
}

async function db(config, path) {
  const headers = { apikey: config.key, Accept: "application/json" };
  if (!String(config.key).startsWith("sb_secret_")) headers.Authorization = "Bearer " + config.key;
  const response = await fetch(config.url + "/rest/v1/" + path, { headers });
  if (!response.ok) throw new Error("Database operation failed.");
  return response.json();
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
  const integrations = {
    database: Boolean(config.url && config.key),
    dispatcher: Boolean(config.githubToken),
    callback: Boolean(config.callbackUrl)
  };
  const roomSlug = parseRoom(req.query?.room);
  if (!roomSlug) return res.status(404).json({ error: "غرفة المحادثة غير موجودة." });

  let agents = [];
  let run = null;
  let events = [];
  if (integrations.database) {
    try {
      const rooms = await db(config, "team_chat_rooms?slug=eq." + encodeURIComponent(roomSlug) + "&select=id,slug,title&limit=1");
      if (rooms[0]) {
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
      }
    } catch {
      integrations.database = false;
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