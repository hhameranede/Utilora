import { getConfig, json, requireOwner } from "../_lib/server.js";

function safeGitHubMessage(value) {
  return String(value || "GitHub returned no error message.")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/gh[pousr]_[A-Za-z0-9]{20,}/gi, "[redacted GitHub token]")
    .replace(/github_pat_[A-Za-z0-9_]{20,}/gi, "[redacted GitHub token]")
    .replace(/[\r\n]+/g, " ")
    .slice(0, 320);
}

function explain(status, message) {
  if (status === 401) return "رمز UTILORA_GITHUB_TOKEN غير صالح أو منتهي الصلاحية.";
  if (status === 403 && /rate limit|secondary rate limit/i.test(message)) return "GitHub فرض حدًا مؤقتًا للطلبات.";
  if (status === 403) return "الرمز لا يملك صلاحية Actions: Read and write على hhameranede/Utilora.";
  if (status === 404) return "الرمز لا يصل إلى المستودع أو ملف Workflow غير موجود على main.";
  if (status === 422) return "GitHub رفض مدخلات الفحص؛ راجع تعريف workflow_dispatch في ملف Workflow.";
  if (status === 429) return "GitHub يقيّد الطلبات مؤقتًا.";
  if (status >= 500) return "خدمة GitHub تواجه عطلًا مؤقتًا.";
  return "تحقق من رمز GitHub وإعدادات Actions في المستودع.";
}

export async function onRequest(context) {
  const access = await requireOwner(context);
  if (access.response) return access.response;

  const request = context.request;
  const url = new URL(request.url);
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, { Allow: "POST" });
  if (request.headers.get("Origin") !== url.origin) return json({ error: "مصدر الطلب غير مصرح به." }, 403);

  const config = getConfig(context.env);
  if (!config.githubToken) return json({ error: "سر UTILORA_GITHUB_TOKEN غير موجود على Cloudflare Pages." }, 503);

  const dispatchUrl = "https://api.github.com/repos/" + config.repository +
    "/actions/workflows/" + encodeURIComponent(config.workflow) + "/dispatches";

  try {
    const response = await fetch(dispatchUrl, {
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
          run_id: "dispatch-probe-" + crypto.randomUUID(),
          mode: "private",
          target_agent: "__dispatch_probe__",
          dispatch_probe: "true"
        }
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      return json({
        ok: true,
        message: "GitHub accepted the permission probe. No AI agent or model was started."
      });
    }

    const payload = await response.json().catch(() => ({}));
    const message = safeGitHubMessage(payload?.message);
    const status = response.status;
    const requestId = response.headers.get("x-github-request-id") || "";
    return json({
      error: "رفض GitHub تشغيل الاختبار (HTTP " + status + "): " + message + " — " + explain(status, message),
      status,
      request_id: requestId || null
    }, 502);
  } catch (error) {
    const message = error?.name === "TimeoutError" || error?.name === "AbortError"
      ? "انتهت مهلة الاتصال بـGitHub."
      : "تعذّر الاتصال بـGitHub من Cloudflare.";
    console.error("[Agent Studio] Dispatch preflight failed", {
      error_name: error?.name || "unknown"
    });
    return json({ error: message }, 502);
  }
}
