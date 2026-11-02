import { clearOwnerSessionCookie, json } from "../_lib/server.js";

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, { Allow: "POST" });
  if (request.headers.get("Origin") !== url.origin) {
    return json({ error: "مصدر الطلب غير مصرح به." }, 403);
  }
  return json({ ok: true }, 200, { "Set-Cookie": clearOwnerSessionCookie() });
}
