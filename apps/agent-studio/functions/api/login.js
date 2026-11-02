import {
  allowLoginAttempt, assertServerKey, createOwnerSessionCookie, getConfig, json
} from "../_lib/server.js";

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, { Allow: "POST" });
  if (request.headers.get("Origin") !== url.origin) {
    return json({ error: "مصدر الطلب غير مصرح به." }, 403);
  }


  const config = getConfig(context.env);
  try {
    assertServerKey(config);
  } catch {
    return json({ error: "أضف SUPABASE_SECRET_KEY إلى أسرار Cloudflare أولًا." }, 503);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!allowLoginAttempt(ip)) {
    return json({ error: "محاولات كثيرة. انتظر 15 دقيقة ثم حاول مجددًا." }, 429, { "Retry-After": "900" });
  }

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 8192) {
      return json({ error: "حجم الطلب أكبر من المسموح." }, 413);
    }
    let body;
    try { body = JSON.parse(rawBody); } catch {
      return json({ error: "صيغة طلب تسجيل الدخول غير صالحة." }, 400);
    }
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (email !== config.allowedEmail || !password || password.length > 1024) {
      return json({ error: "بيانات الدخول غير صحيحة." }, 401);
    }

    const authResponse = await fetch(config.url + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: {
        apikey: config.key,
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
