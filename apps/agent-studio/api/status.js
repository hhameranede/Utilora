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

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Vary", "Cookie, Authorization");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const githubToken = process.env.UTILORA_GITHUB_TOKEN;
  const callbackUrl = process.env.AGENT_CHAT_CALLBACK_URL;

  const integrations = {
    database: Boolean(supabaseUrl && serviceKey),
    dispatcher: Boolean(githubToken),
    callback: Boolean(callbackUrl)
  };

  let agents = AGENTS.map((agent_id) => ({
    agent_id,
    status: "unknown",
    statusText: "بانتظار الربط",
    progress: 0
  }));

  if (integrations.database) {
    try {
      const base = supabaseUrl.replace(/\/$/, "");
      const headers = {
        apikey: serviceKey,
        Authorization: "Bearer " + serviceKey
      };
      const runsResponse = await fetch(
        base + "/rest/v1/team_chat_runs?select=id,status,created_at&order=created_at.desc&limit=1",
        { headers }
      );
      if (runsResponse.ok) {
        const runs = await runsResponse.json();
        if (runs[0]?.id) {
          const agentResponse = await fetch(
            base + "/rest/v1/team_chat_agent_runs?run_id=eq." + encodeURIComponent(runs[0].id) +
              "&select=agent_id,status,status_text,progress",
            { headers }
          );
          if (agentResponse.ok) {
            const rows = await agentResponse.json();
            agents = agents.map((agent) => {
              const live = rows.find((row) => row.agent_id === agent.agent_id);
              return live ? {
                agent_id: live.agent_id,
                status: live.status,
                statusText: live.status_text,
                progress: live.progress
              } : agent;
            });
          }
        }
      }
    } catch {
      // Never expose connection strings, keys, or provider error details to the browser.
    }
  }

  return res.status(200).json({
    private: true,
    auth: "vercel-protected",
    integrations,
    agents
  });
}
