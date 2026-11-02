import {
  db, getConfig, json, parseRoomSlug, requireOwner, REQUIRED_ROOMS
} from "../_lib/server.js";

async function checkDatabase(config) {
  if (!config.url || !config.key || config.key.startsWith("sb_publishable_")) return false;
  try {
    const rows = await db(config, "team_chat_rooms?select=slug");
    const available = new Set((Array.isArray(rows) ? rows : []).map((row) => row.slug));
    return REQUIRED_ROOMS.every((slug) => available.has(slug));
  } catch {
    return false;
  }
}

async function checkGitHubWorkflow(config) {
  if (!config.githubToken) return false;
  const url = "https://api.github.com/repos/" + config.repository +
    "/actions/workflows/" + encodeURIComponent(config.workflow);
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + config.githubToken,
        "User-Agent": "UTILORA-Agent-Studio/1.0",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      signal: AbortSignal.timeout(6000)
    });
    if (!response.ok) return false;
    const workflow = await response.json();
    return workflow.state === "active" &&
      workflow.path === ".github/workflows/" + config.workflow;
  } catch {
    return false;
  }
}

async function checkCallback(config) {
  if (!config.callbackUrl) return false;
  try {
    // The callback is invoked server-to-server by GitHub Actions; browser CORS is not required.
    const response = await fetch(config.callbackUrl, {
      method: "OPTIONS",
      headers: {
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type"
      },
      signal: AbortSignal.timeout(6000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function onRequest(context) {
  const access = await requireOwner(context);
  if (access.response) return access.response;

  const request = context.request;
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405, { Allow: "GET" });

  const config = getConfig(context.env);
  const url = new URL(request.url);
  const room = parseRoomSlug(url.searchParams.get("room"));
  if (!room) return json({ error: "غرفة المحادثة غير موجودة." }, 404);

  const integrations = {
    database: Boolean(config.url && config.key && !config.key.startsWith("sb_publishable_")),
    dispatcher: Boolean(config.githubToken),
    callback: Boolean(config.callbackUrl),
    checked: false
  };

  if (url.searchParams.get("health") === "1") {
    const [database, dispatcher, callback] = await Promise.all([
      checkDatabase(config), checkGitHubWorkflow(config), checkCallback(config)
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
      const rooms = await db(config,
        "team_chat_rooms?slug=eq." + encodeURIComponent(room.slug) + "&select=id,slug,title&limit=1");
      if (!rooms?.[0]) throw new Error("Chat room is missing.");
      const runs = await db(config,
        "team_chat_runs?room_id=eq." + encodeURIComponent(rooms[0].id) +
        "&select=id,status,stage,progress,created_at,started_at,finished_at,error&order=created_at.desc&limit=1");
      run = runs?.[0] || null;
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

  return json({
    private: true,
    auth: "supabase-auth-session",
    identity: { email: access.identity.email },
    integrations,
    room: room.slug,
    run,
    events,
    agents
  });
}
