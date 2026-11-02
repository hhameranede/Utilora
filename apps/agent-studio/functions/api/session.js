import { json, requireOwner } from "../_lib/server.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return json({ error: "Method not allowed." }, 405, { Allow: "GET" });
  }
  const access = await requireOwner(context);
  if (access.response) return access.response;
  return json({ authenticated: true, email: access.identity.email });
}
