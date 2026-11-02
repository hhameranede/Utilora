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

const SESSION_COOKIE = "__Host-utilora_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();
const loginBuckets = new Map();

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0",
      "Vary": "Cookie, Authorization",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders
    }
  });
}

export function getConfig(env) {
  let url = String(env.SUPABASE_URL || "");
  while (url.endsWith("/")) url = url.slice(0, -1);
  return {
    url,
    key: String(env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || ""),
    publishableKey: String(env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || ""),
    sessionSecret: String(env.STUDIO_SESSION_SECRET || ""),
    allowedEmail: String(env.STUDIO_ALLOWED_EMAIL || "hhameranede@gmail.com").trim().toLowerCase(),
    githubToken: String(env.UTILORA_GITHUB_TOKEN || ""),
    repository: String(env.UTILORA_GITHUB_REPOSITORY || "hhameranede/Utilora"),
    ref: String(env.UTILORA_AGENT_WORKFLOW_REF || "main"),
    workflow: String(env.UTILORA_AGENT_WORKFLOW_FILE || "agent-chat-execution.yml"),
    callbackUrl: String(env.AGENT_CHAT_CALLBACK_URL || "https://paleenigjkmjwinkblfv.supabase.co/functions/v1/agent-studio-callback")
  };
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function sessionKey(secret) {
  if (secret.length < 32) throw new Error("STUDIO_SESSION_SECRET must contain at least 32 characters.");
  return crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]
  );
}

function readCookie(request) {
  const cookieHeader = request.headers.get("Cookie") || "";
  for (const part of cookieHeader.split(";")) {
    const item = part.trim();
    if (item.startsWith(SESSION_COOKIE + "=")) return item.slice(SESSION_COOKIE.length + 1);
  }
  return "";
}

export async function createOwnerSessionCookie(email, env) {
  const config = getConfig(env);
  if (!config.sessionSecret || config.sessionSecret.length < 32) {
    throw new Error("Session signing secret is not configured.");
  }
  if (email.toLowerCase() !== config.allowedEmail) throw new Error("Owner account is not allowed.");
  const now = Math.floor(Date.now() / 1000);
  const payload = { email: config.allowedEmail, iat: now, exp: now + SESSION_TTL_SECONDS };
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signingInput = encoder.encode(encodedPayload);
  const signature = await crypto.subtle.sign("HMAC", await sessionKey(config.sessionSecret), signingInput);
  return SESSION_COOKIE + "=" + encodedPayload + "." + toBase64Url(new Uint8Array(signature)) +
    "; Path=/; Max-Age=" + SESSION_TTL_SECONDS + "; Secure; HttpOnly; SameSite=Strict";
}

export function clearOwnerSessionCookie() {
  return SESSION_COOKIE + "=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Strict";
}

export async function requireOwner(context) {
  const config = getConfig(context.env);
  if (!config.sessionSecret || config.sessionSecret.length < 32) {
    return { response: json({ error: "لم يكتمل إعداد مفتاح جلسات الدخول على Cloudflare." }, 503) };
  }
  const token = readCookie(context.request);
  if (!token) return { response: json({ error: "سجّل الدخول للمتابعة." }, 401) };

  try {
    const parts = token.split(".");
    if (parts.length !== 2) throw new Error("Invalid session format.");
    const payloadBytes = fromBase64Url(parts[0]);
    const signature = fromBase64Url(parts[1]);
    const valid = await crypto.subtle.verify(
      "HMAC", await sessionKey(config.sessionSecret), signature, encoder.encode(parts[0])
    );
    if (!valid) throw new Error("Invalid session signature.");
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    const now = Math.floor(Date.now() / 1000);
    if (payload.email !== config.allowedEmail || !Number.isInteger(payload.exp) ||
        !Number.isInteger(payload.iat) || payload.exp <= now ||
        payload.iat > now + 60 || payload.exp - payload.iat > SESSION_TTL_SECONDS) {
      throw new Error("Expired or unauthorized session.");
    }
    return { identity: { email: payload.email } };
  } catch (error) {
    console.warn("[Agent Studio] Session verification failed", error?.name || "unknown");
    return { response: json({ error: "انتهت الجلسة أو لم تعد صالحة. سجّل الدخول مجددًا." }, 401) };
  }
}

export function allowLoginAttempt(ip) {
  const now = Date.now();
  const key = String(ip || "unknown").slice(0, 80);
  let bucket = loginBuckets.get(key);
  if (!bucket || now - bucket.startedAt > 15 * 60 * 1000) {
    bucket = { startedAt: now, count: 0 };
  }
  if (bucket.count >= 8) return false;
  bucket.count += 1;
  loginBuckets.set(key, bucket);
  if (loginBuckets.size > 2000) {
    for (const [entry, value] of loginBuckets) {
      if (now - value.startedAt > 15 * 60 * 1000) loginBuckets.delete(entry);
    }
  }
  return true;
}

export function assertServerKey(config) {
  let legacyServiceRole = false;
  try {
    const parts = config.key.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[1])));
      legacyServiceRole = payload.role === "service_role";
    }
  } catch {
    legacyServiceRole = false;
  }
  const validServerKey = config.key.startsWith("sb_secret_") || legacyServiceRole;
  if (!config.url || !validServerKey) {
    const error = new Error("A Supabase secret key or legacy service_role key is required on the server.");
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
