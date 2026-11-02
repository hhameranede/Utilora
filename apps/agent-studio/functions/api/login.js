import {
  allowLoginAttempt, createOwnerSessionCookie, getConfig, json
} from "../_lib/server.js";

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, { Allow: "POST" });
  if (request.headers.get("Origin") !== url.origin) {
    return json({ error: "مصدر الطلب غير مصرح به." }, 403);
  }
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > 8192) return json({ error: "حجم الطلب أكبر من المسموح." }, 413);

  const config = getConfig(context.env);
  if (!config.url || !config.publishableKey || !config.sessionSecret || config.sessionSecret.length < 32) {
    return json({ error: "إعداد تسجيل الدخول غير مكتمل على Cloudflare." }, 503);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!allowLoginAttempt(ip)) {
    return json({ error: "محاولات كثيرة. انتظر 15 دقيقة ثم حاول مجددًا." }, 429, { "Retry-After": "900" });
  }

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (email !== config.allowedEmail || !password || password.length > 1024) {
      return json({ error: "بيانات الدخول غير صحيحة." }, 401);
    }

    const authResponse = await fetch(config.url + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: {
        apikey: config.publishableKey,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(10000)
    });
    const authData = await authResponse.json().catch(() => ({}));
    if (!authResponse.ok || !authData.access_token ||
        String(authData.user?.email || "").toLowerCase() !== config.allowedEmail) {
      return json({ error: "تعذّر تسجيل الدخول. تحقق من كلمة المرور أو من تفعيل حساب المالك في Supabase." }, 401);
    }

    const cookie = await createOwnerSessionCookie(config.allowedEmail, context.env);
    return json({ ok: true, user: { email: config.allowedEmail } }, 200, { "Set-Cookie": cookie });
  } catch (error) {
    console.error("[Agent Studio] Login failed", error?.name || "unknown");
    return json({ error: "تعذّر إكمال تسجيل الدخول حاليًا." }, 502);
  }
}
