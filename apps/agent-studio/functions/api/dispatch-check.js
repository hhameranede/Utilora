import { getConfig, json, requireOwner } from "../_lib/server.js";

function safeGitHubMessage(value) {
  return String(value || "GitHub returned an empty response body.")
    .replace(/Bearer\\s+\\S+/gi, "Bearer [redacted]")
    .replace(/gh[pousr]_[A-Za-z0-9]{20,}/gi, "[redacted GitHub token]")
    .replace(/github_pat_[A-Za-z0-9_]{20,}/gi, "[redacted GitHub token]")
    .replace(/[\\r\\n]+/g, " ")
    .slice(0, 320);
}

async function githubApi(config, path, method = "GET", body) {
  const response = await fetch("https://api.github.com" + path, {
    method,
    headers: {
      Authorization: "Bearer " + config.githubToken,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body === undefined ? {} : { "Content-Type": "application/json" })
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(10000)
  });

  const raw = await response.text();
  let payload = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    payload,
    message: safeGitHubMessage(payload?.message || raw),
    requestId: response.headers.get("x-github-request-id") || null,
    acceptedPermissions: response.headers.get("x-accepted-github-permissions") || null,
    rateLimitRemaining: response.headers.get("x-ratelimit-remaining") || null
  };
}

function explain(status, message) {
  if (status === 401) return "الرمز الذي وصل إلى Cloudflare غير صالح أو ملغى.";
  if (status === 403 && /rate limit|secondary rate limit/i.test(message)) return "GitHub فرض حدًا مؤقتًا للطلبات.";
  if (status === 403 && /resource not accessible by personal access token/i.test(message)) {
    return "GitHub تعرّف على الرمز لكنه رفض عملية الإطلاق. سنقارن صلاحيات المستودع وWorkflow أدناه؛ قد تكون هناك قيود تفويض على الرمز رغم ظهور Actions: Read and write في صفحة الإعدادات.";
  }
  if (status === 403) return "GitHub رفض الطلب. راجع الرسالة الخام ومعرّف الطلب أدناه بدل افتراض أن السبب هو Actions فقط.";
  if (status === 404) return "المستودع أو ملف Workflow غير متاح لهذا الرمز أو غير موجود على main.";
  if (status === 422) return "GitHub رفض مدخلات workflow_dispatch؛ راجع تعريف المدخلات في ملف Workflow.";
  if (status === 429) return "GitHub يقيّد الطلبات مؤقتًا.";
  if (status >= 500) return "خدمة GitHub تواجه عطلًا مؤقتًا.";
  return "تعذّر تأكيد صلاحية تشغيل Workflow.";
}

function diagnosticStep(result) {
  return {
    status: result.status,
    ok: result.ok,
    message: result.message,
    request_id: result.requestId,
    accepted_permissions: result.acceptedPermissions,
    rate_limit_remaining: result.rateLimitRemaining
  };
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

  try {
    const repoPath = "/repos/" + config.repository;
    const repo = await githubApi(config, repoPath);
    if (!repo.ok) {
      return json({
        error: "فشل فحص وصول الرمز إلى المستودع (HTTP " + repo.status + "): " + repo.message,
        diagnostics: { repository: diagnosticStep(repo) }
      }, 502);
    }

    const workflowPath = repoPath + "/actions/workflows/" + encodeURIComponent(config.workflow);
    const workflow = await githubApi(config, workflowPath);
    if (!workflow.ok) {
      return json({
        error: "تم الوصول إلى المستودع لكن فشل فحص ملف Workflow (HTTP " + workflow.status + "): " + workflow.message,
        diagnostics: {
          repository: {
            status: repo.status,
            ok: repo.ok,
            full_name: repo.payload?.full_name || null,
            admin: repo.payload?.permissions?.admin ?? null,
            push: repo.payload?.permissions?.push ?? null
          },
          workflow: diagnosticStep(workflow)
        }
      }, 502);
    }

    const dispatch = await githubApi(
      config,
      workflowPath + "/dispatches",
      "POST",
      {
        ref: config.ref,
        inputs: {
          run_id: "dispatch-probe-" + crypto.randomUUID(),
          mode: "private",
          target_agent: "__dispatch_probe__",
          dispatch_probe: "true"
        }
      }
    );

    const diagnostics = {
      repository: {
        status: repo.status,
        ok: repo.ok,
        full_name: repo.payload?.full_name || null,
        admin: repo.payload?.permissions?.admin ?? null,
        push: repo.payload?.permissions?.push ?? null
      },
      workflow: {
        status: workflow.status,
        ok: workflow.ok,
        name: workflow.payload?.name || null,
        state: workflow.payload?.state || null,
        path: workflow.payload?.path || null
      },
      dispatch: diagnosticStep(dispatch)
    };

    if (dispatch.ok) {
      return json({
        ok: true,
        message: "GitHub accepted workflow_dispatch. No AI agent or model was started.",
        diagnostics
      });
    }

    return json({
      error: "فشل GitHub في إطلاق الاختبار (HTTP " + dispatch.status + "): " +
        dispatch.message + " — " + explain(dispatch.status, dispatch.message),
      status: dispatch.status,
      request_id: dispatch.requestId,
      accepted_permissions: dispatch.acceptedPermissions,
      diagnostics
    }, 502);
  } catch (error) {
    const message = error?.name === "TimeoutError" || error?.name === "AbortError"
      ? "انتهت مهلة الاتصال بـGitHub أثناء فحص الرمز."
      : "تعذّر الاتصال بـGitHub من Cloudflare.";
    console.error("[Agent Studio] Dispatch preflight failed", {
      error_name: error?.name || "unknown"
    });
    return json({ error: message }, 502);
  }
}
