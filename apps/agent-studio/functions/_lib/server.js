import { createRemoteJWKSet, jwtVerify } from "jose";

export const AGENTS = [
  ["problem-analyst", "nvidia-nim/deepseek-v4-1-flash"],
  ["implementation-engineer", "nvidia-nim/minimax-m3-1-flash"],
  ["fast-task-engineer", "nvidia-nim/glm-5-3-flash"],
  ["visual-reviewer", "nvidia-nim/nemotron-super-vl"],
  ["long-horizon-engineer", "nvidia-nim/laguna-xs-2-1"],
  ["qa-engineer", "nvidia-nim/deepseek-v4-1-flash"],
  ["security-auditor", "nvidia-nim/nemotron-ultra"],
  ["project-lead", "nvidia-nim/nemotron-ultra"]
];

export const REQUIRED_ROOMS = [
  "main", "agent-problem-analyst", "agent-implementation-engineer",
  "agent-fast-task-engineer", "agent-visual-reviewer", "agent-long-horizon-engineer",
  "agent-qa-engineer", "agent-security-auditor", "agent-project-lead"
];

const jwksCache = new Map();

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0",
      "Vary": "Cookie, Authorization, Cf-Access-Jwt-Assertion",
      ...extraHeaders
    }
  });
}

function accessSettings(env) {
  const raw = String(env.CF_ACCESS_TEAM_DOMAIN || "").trim();
  const domain = raw.replace("https://", "").replace("http://", "").split("/")[0];
  return {
    domain,
    issuer: domain ? "https://" + domain : "",
    audience: String(env.CF_ACCESS_AUD || "").trim(),
    allowedEmail: String(env.STUDIO_ALLOWED_EMAIL || "hhameranede@gmail.com").trim().toLowerCase()
  };
}

export async function requireOwner(context) {
  const settings = accessSettings(context.env);
  if (!settings.domain || !settings.audience) {
    return { response: json({
      error: "لم تكتمل حماية Cloudflare Access بعد. لن يتم السماح بالوصول إلى بيانات المحادثة قبل ضبطها."
    }, 503) };
  }

  const token = context.request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return { response: json({ error: "يلزم تسجيل الدخول عبر Cloudflare Access." }, 401) };

  try {
    let jwks = jwksCache.get(settings.domain);
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL(settings.issuer + "/cdn-cgi/access/certs"));
      jwksCache.set(settings.domain, jwks);
    }
    const { payload } = await jwtVerify(token, jwks, {
      issuer: settings.issuer,
      audience: settings.audience
    });
    const email = String(payload.email || "").toLowerCase();
    if (!email || email !== settings.allowedEmail) {
      return { response: json({ error: "هذا الحساب غير مخوّل للدخول إلى مساحة UTILORA." }, 403) };
    }
    return { identity: { email } };
  } catch (error) {
    console.warn("[Agent Studio] Cloudflare Access verification failed", error?.code || error?.name || "unknown");
    return { response: json({ error: "تعذّر التحقق من جلسة Cloudflare Access. سجّل الدخول من جديد." }, 401) };
  }
}

export function getConfig(env) {
  let url = String(env.SUPABASE_URL || "");
  while (url.endsWith("/")) url = url.slice(0, -1);
  return {
    url,
    key: String(env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || ""),
    githubToken: String(env.UTILORA_GITHUB_TOKEN || ""),
    repository: String(env.UTILORA_GITHUB_REPOSITORY || "hhameranede/Utilora"),
    ref: String(env.UTILORA_AGENT_WORKFLOW_REF || "main"),
    workflow: String(env.UTILORA_AGENT_WORKFLOW_FILE || "agent-chat-execution.yml"),
    callbackUrl: String(env.AGENT_CHAT_CALLBACK_URL || "https://paleenigjkmjwinkblfv.supabase.co/functions/v1/agent-studio-callback")
  };
}

export function assertServerKey(config) {
  if (!config.url || !config.key || config.key.startsWith("sb_publishable_")) {
    const error = new Error("Server-side Supabase configuration is missing or invalid.");
    error.status = 503;
    throw error;
  }
}

export async function db(config, path, method = "GET", body) {
  assertServerKey(config);
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(config.url + "/rest/v1/" + path, {
        method,
        headers: {
          apikey: config.key,
          Authorization: "Bearer " + config.key,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        signal: AbortSignal.timeout(4500),
        ...(body === undefined ? {} : { body: JSON.stringify(body) })
      });
      const raw = await response.text();
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
      if (!response.ok) {
        const error = new Error(response.status === 409 ? "Room already exists." : "Database operation failed.");
        error.status = response.status;
        error.code = data?.code || null;
        console.error("[Agent Studio] Supabase REST failure", {
          route: path.split("?")[0], status: response.status, code: error.code
        });
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

export function parseRoomSlug(value) {
  const slug = typeof value === "string" ? value : "main";
  if (slug === "main") return { slug, kind: "group", agentId: null };
  if (slug.startsWith("agent-")) {
    const agentId = slug.slice(6);
    if (AGENTS.some(([id]) => id === agentId)) return { slug, kind: "private", agentId };
  }
  return null;
}

export async function getRoom(config, descriptor) {
  let rooms = await db(config,
    "team_chat_rooms?slug=eq." + encodeURIComponent(descriptor.slug) + "&select=id,slug,title&limit=1");
  if (rooms?.[0]) return rooms[0];

  const agent = AGENTS.find(([id]) => id === descriptor.agentId);
  const title = descriptor.kind === "group"
    ? "غرفة فريق UTILORA"
    : "محادثة خاصة · " + (agent?.[0] || descriptor.agentId);

  try {
    const created = await db(config, "team_chat_rooms?select=id,slug,title", "POST", {
      id: crypto.randomUUID(), slug: descriptor.slug, title
    });
    if (created?.[0]) return created[0];
  } catch (error) {
    if (error.status !== 409) throw error;
  }

  rooms = await db(config,
    "team_chat_rooms?slug=eq." + encodeURIComponent(descriptor.slug) + "&select=id,slug,title&limit=1");
  if (!rooms?.[0]) throw new Error("Room could not be created.");
  return rooms[0];
}

export async function getRoomSnapshot(config, room) {
  const roomId = encodeURIComponent(room.id);
  const [messages, runs] = await Promise.all([
    db(config, "team_chat_messages?room_id=eq." + roomId +
      "&select=id,room_id,run_id,role,agent_id,content,metadata,created_at&order=created_at.desc&limit=200"),
    db(config, "team_chat_runs?room_id=eq." + roomId +
      "&select=id,status,stage,progress,created_at,started_at,finished_at,error&order=created_at.desc&limit=1")
  ]);

  let agents = [];
  let events = [];
  if (runs?.[0]?.id) {
    const runId = encodeURIComponent(runs[0].id);
    [agents, events] = await Promise.all([
      db(config, "team_chat_agent_runs?run_id=eq." + runId +
        "&select=agent_id,status,status_text,progress,response,error,started_at,finished_at"),
      db(config, "team_chat_events?run_id=eq." + runId +
        "&select=id,agent_id,event_type,message,metadata,created_at&order=created_at.desc&limit=60")
    ]);
  }
  return { room, messages: (messages || []).reverse(), runs: runs || [], agents: agents || [], events: events || [] };
}
