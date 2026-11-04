import { DNS_RECORD_TYPES, fetchTrustedLookupJson, jsonResponse, normalizePublicDomain } from "../_shared/diagnostics";

export async function onRequestGet({ request }: { request: Request }): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const domain = normalizePublicDomain(params.get("name") || "");
  const type = (params.get("type") || "").toUpperCase();

  if (!domain) {
    return jsonResponse({ message: "Enter a valid public domain or hostname, without a URL, port, or path." }, 400);
  }
  if (!DNS_RECORD_TYPES.has(type)) {
    return jsonResponse({ message: "Choose a supported DNS record type: A, AAAA, CNAME, MX, TXT, NS, or SOA." }, 400);
  }

  // The upstream origin is fixed and the record type is allow-listed.
  const upstream = new URL("https://cloudflare-dns.com/dns-query");
  upstream.searchParams.set("name", domain);
  upstream.searchParams.set("type", type);
  return fetchTrustedLookupJson(upstream, "application/dns-json", 60);
}
