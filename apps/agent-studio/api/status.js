const AGENTS = [
  "problem-analyst",
  "implementation-engineer",
  "fast-task-engineer",
  "visual-reviewer",
  "long-horizon-engineer",
  "qa-engineer",
  "security-auditor",
  "project-lead"
];

const noStore = (res) => {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Vary", "Cookie, Authorization");
};

function getConfig() {
  return {
    url: String(process.env.SUPABASE_URL || "").replace(/\/+$/, ""),
    key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    githubToken: process.env.UTILORA_GITHUB_TOKEN,
    callbackUrl: process.env.AGENT_CHAT_CALLBACK_URL
  };
}

async function db(config, path) {
  const headers = { apikey: config.key, Accept: "application/json" };
  if (!String(config.key).startsWith("sb_secret_")) {
    headers.Authorization = "Bearer " + config.key;
  }
  const response = await fetch(config.url + "/rest/v1/" + path, { headers });
  if (!response.ok) throw new Error("Database operation failed.");
  return response.json();
}

export default async function handler(req, res) {
  noStore(res);
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

  let agents = AGENTS.map((agent_id) => ({
    agent_id, status: "unknown", status_text: "بانتظار الربط", progress: 0
  }));
  let run = null;
  let events = [];

  if (integrations.database) {
    try {
      const runs = await db(
        config,
        "team_chat_runs?select=id,status,stage,progress,created_at,started_at,finished_at,error&order=created_at.desc&limit=1"
      );
      run = runs[0] || null;
      if (run?.id) {
        const [rows, eventRows] = await Promise.all([
          db(config, "team_chat_agent_runs?run_id=eq." + encodeURIComponent(run.id) +
            "&select=agent_id,status,status_text,progress,response,error,started_at,finished_at"),
          db(config, "team_chat_events?run_id=eq." + encodeURIComponent(run.id) +
            "&select=id,agent_id,event_type,message,metadata,created_at&order=created_at.desc&limit=40")
        ]);
        agents = agents.map((agent) => {
          const live = rows.find((row) => row.agent_id === agent.agent_id);
          return live ? {
            agent_id: live.agent_id,
            status: live.status,
            status_text: live.status_text,
            progress: live.progress,
            response: live.response || null,
            error: live.error || null,
            started_at: live.started_at || null,
            finished_at: live.finished_at || null
          } : agent;
        });
        events = Array.isArray(eventRows) ? eventRows : [];
      }
    } catch {
      integrations.database = false;
    }
  }

  return res.status(200).json({
    private: true,
    auth: "vercel-protected",
    integrations,
    run,
    events,
    agents
  });
}