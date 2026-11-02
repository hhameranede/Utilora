import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.10.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

const allowedAgents = new Set([
  "problem-analyst",
  "implementation-engineer",
  "fast-task-engineer",
  "visual-reviewer",
  "long-horizon-engineer",
  "qa-engineer",
  "security-auditor",
  "project-lead",
]);

const jwks = createRemoteJWKSet(
  new URL("https://token.actions.githubusercontent.com/.well-known/jwks")
);

function response(status: number, data: unknown) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

function getApiKey() {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return { key: legacy, legacy: true };

  const keysJson = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (keysJson) {
    try {
      const keys = JSON.parse(keysJson);
      if (typeof keys.default === "string") return { key: keys.default, legacy: false };
    } catch {
      // Fail closed below.
    }
  }
  throw new Error("Supabase server-side key is unavailable.");
}

async function verifyGitHubWorkflow(req: Request) {
  const authorization = req.headers.get("Authorization") || "";
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const token = bearer || req.headers.get("x-github-oidc-token") || "";
  if (!token) throw new Error("Missing workflow identity.");

  const { payload } = await jwtVerify(token, jwks, {
    issuer: "https://token.actions.githubusercontent.com",
    audience: "utilora-agent-studio",
  });

  const workflowRef = String(payload.workflow_ref || "");
  if (
    payload.repository !== "hhameranede/Utilora" ||
    Number(payload.repository_id) !== 1441109405 ||
    payload.actor !== "hhameranede" ||
    payload.ref !== "refs/heads/main" ||
    payload.event_name !== "workflow_dispatch" ||
    !workflowRef.endsWith("/.github/workflows/agent-chat-execution.yml@refs/heads/main")
  ) {
    throw new Error("Workflow identity is not authorized.");
  }

  return payload;
}

async function supabase(path: string, method = "GET", body?: unknown) {
  const base = Deno.env.get("SUPABASE_URL");
  if (!base) throw new Error("Supabase URL is unavailable.");
  const { key, legacy } = getApiKey();
  const headers: Record<string, string> = {
    apikey: key,
    "Content-Type": "application/json",
    Prefer: method === "POST" && path.includes("on_conflict") ? "resolution=merge-duplicates,return=representation" : "return=representation",
  };
  if (legacy) headers.Authorization = "Bearer " + key;

  const res = await fetch(base.replace(/\/$/, "") + "/rest/v1/" + path, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const raw = await res.text();
  let data: any = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  if (!res.ok) {
    console.error("Supabase REST request failed:", res.status);
    throw new Error("Database operation failed.");
  }
  return data;
}

async function readRun(body: any) {
  const runId = String(body.run_id || "");
  const agentId = String(body.agent_id || "");
  if (!runId || !allowedAgents.has(agentId)) return response(400, { error: "Invalid run or agent." });

  const runs = await supabase(
    "team_chat_runs?id=eq." + encodeURIComponent(runId) +
      "&select=id,room_id,prompt_message_id,status,created_at&limit=1"
  );
  const run = runs?.[0];
  if (!run) return response(404, { error: "Run not found." });

  const prompts = await supabase(
    "team_chat_messages?id=eq." + encodeURIComponent(run.prompt_message_id) +
      "&select=id,content,created_at,room_id&limit=1"
  );
  const prompt = prompts?.[0];
  if (!prompt || prompt.room_id !== run.room_id) return response(404, { error: "Prompt not found." });

  const history = await supabase(
    "team_chat_messages?room_id=eq." + encodeURIComponent(run.room_id) +
      "&select=role,agent_id,content,created_at&order=created_at.asc&limit=30"
  );
  const agentRuns = await supabase(
    "team_chat_agent_runs?run_id=eq." + encodeURIComponent(runId) +
      "&select=agent_id,status,status_text,progress,response,error"
  );

  return response(200, {
    run,
    prompt,
    history: history || [],
    agent_runs: agentRuns || [],
    current_agent: agentId,
  });
}

async function writeCallback(body: any) {
  const runId = String(body.run_id || "");
  const agentId = String(body.agent_id || "");
  const status = String(body.status || "");
  const statusText = String(body.status_text || "").slice(0, 200);
  const progress = Math.max(0, Math.min(100, Number(body.progress) || 0));
  const responseText = typeof body.response === "string" ? body.response.slice(0, 18000) : "";
  const errorText = typeof body.error === "string" ? body.error.slice(0, 1000) : null;

  if (!runId || !allowedAgents.has(agentId) || !["running", "completed", "failed"].includes(status)) {
    return response(400, { error: "Invalid callback payload." });
  }

  const existing = await supabase(
    "team_chat_agent_runs?run_id=eq." + encodeURIComponent(runId) +
      "&agent_id=eq." + encodeURIComponent(agentId) +
      "&select=run_id,agent_id,response&limit=1"
  );
  const previousResponse = existing?.[0]?.response || null;

  await supabase(
    "team_chat_agent_runs?on_conflict=run_id,agent_id",
    "POST",
    [{
      run_id: runId,
      agent_id: agentId,
      status,
      status_text: statusText || status,
      progress,
      ...(responseText ? { response: responseText } : {}),
      ...(errorText ? { error: errorText } : {}),
      ...(status === "running" ? { started_at: new Date().toISOString() } : {}),
      ...(["completed", "failed"].includes(status) ? { finished_at: new Date().toISOString() } : {}),
    }]
  );

  if (responseText && responseText !== previousResponse) {
    await supabase("team_chat_messages", "POST", [{
      room_id: (await supabase("team_chat_runs?id=eq." + encodeURIComponent(runId) + "&select=room_id&limit=1"))?.[0]?.room_id,
      run_id: runId,
      role: "agent",
      agent_id: agentId,
      content: responseText,
      metadata: { source: "agent-studio-workflow" },
    }]);
  }

  const eventType = String(body.event_type || "agent." + status).slice(0, 80);
  const eventMessage = String(body.message || statusText || agentId + " " + status).slice(0, 1000);
  await supabase("team_chat_events", "POST", [{
    run_id: runId,
    agent_id: agentId,
    event_type: eventType,
    message: eventMessage,
    metadata: { progress },
  }]);

  const all = await supabase(
    "team_chat_agent_runs?run_id=eq." + encodeURIComponent(runId) +
      "&select=agent_id,status,progress"
  );
  const rows = Array.isArray(all) ? all : [];
  const done = rows.filter((row: any) => ["completed", "failed", "skipped"].includes(row.status)).length;
  const average = rows.length ? Math.round(rows.reduce((sum: number, row: any) => sum + (Number(row.progress) || 0), 0) / rows.length) : 0;

  if (agentId === "project-lead" && status === "completed") {
    await supabase("team_chat_runs?id=eq." + encodeURIComponent(runId), "PATCH", {
      status: "completed",
      stage: "اكتمل رد الفريق",
      progress: 100,
      finished_at: new Date().toISOString(),
      error: null,
    });
  } else if (agentId === "project-lead" && status === "failed") {
    await supabase("team_chat_runs?id=eq." + encodeURIComponent(runId), "PATCH", {
      status: "failed",
      stage: "تعذّر إعداد الخلاصة النهائية",
      progress: average,
      finished_at: new Date().toISOString(),
      error: errorText || "project_lead_failed",
    });
  } else {
    await supabase("team_chat_runs?id=eq." + encodeURIComponent(runId), "PATCH", {
      status: "running",
      stage: done >= 7 ? "يجمع Project Lead تقارير الفريق" : "يعمل الوكلاء المتخصصون",
      progress: Math.min(95, average),
    });
  }

  return response(200, { ok: true, status, completed_agents: done, agent_count: rows.length });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return response(405, { error: "Method not allowed." });

  try {
    await verifyGitHubWorkflow(req);
    const body = await req.json();
    if (body.action === "read") return await readRun(body);
    if (body.action === "callback") return await writeCallback(body);
    return response(400, { error: "Unknown action." });
  } catch (error) {
    console.error("Agent Studio callback rejected or failed.");
    const message = error instanceof Error ? error.message : "";
    const unauthorized = message.includes("identity") || message.includes("authorized") || message.includes("JWT") || message.includes("token");
    return response(unauthorized ? 401 : 500, { error: unauthorized ? "Unauthorized workflow identity." : "Agent callback failed." });
  }
});
