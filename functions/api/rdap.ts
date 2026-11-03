import { fetchTrustedLookupJson, jsonResponse, normalizePublicDomain } from "../_shared/diagnostics";

export async function onRequestGet({ request }: { request: Request }): Promise<Response> {
  const domain = normalizePublicDomain(new URL(request.url).searchParams.get("domain") || "");
  if (!domain) {
    return jsonResponse({ message: "Enter a valid public domain name, without a URL, port, or path." }, 400);
  }

  // The upstream origin is fixed. Only a validated hostname is used as the RDAP resource.
  const upstream = new URL("https://rdap.org/domain/" + encodeURIComponent(domain));
  return fetchTrustedLookupJson(upstream, "application/rdap+json, application/json", 300);
}
