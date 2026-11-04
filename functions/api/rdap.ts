import { fetchTrustedLookupJson, jsonResponse, normalizePublicDomain } from "../_shared/diagnostics";

const IANA_RDAP_BOOTSTRAP = new URL("https://data.iana.org/rdap/dns.json");
const RDAP_ACCEPT = "application/rdap+json, application/json";
const BOOTSTRAP_ACCEPT = "application/json";

type RdapBootstrap = {
  services?: unknown;
};

/**
 * Select the authoritative HTTPS RDAP base URL(s) using the label-wise
 * longest-match rule from RFC 9224. Only HTTPS, public hostnames from IANA's
 * official bootstrap file are accepted.
 */
export function resolveRdapBaseUrls(domain: string, bootstrap: unknown): URL[] {
  if (!normalizePublicDomain(domain) || !bootstrap || typeof bootstrap !== "object") return [];
  const services = (bootstrap as RdapBootstrap).services;
  if (!Array.isArray(services)) return [];

  const matches: Array<{ labelCount: number; urls: URL[] }> = [];
  for (const service of services) {
    if (!Array.isArray(service) || service.length < 2) continue;
    const [entries, rawUrls] = service;
    if (!Array.isArray(entries) || !Array.isArray(rawUrls)) continue;

    const matchingEntries = entries.filter((entry): entry is string => {
      if (typeof entry !== "string") return false;
      const suffix = entry.toLowerCase().replace(/\.$/u, "");
      const labels = suffix.split(".");
      if (!suffix || labels.some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/u.test(label))) return false;
      return domain === suffix || domain.endsWith("." + suffix);
    });
    if (!matchingEntries.length) continue;

    const labelCount = Math.max(...matchingEntries.map((entry) => entry.split(".").length));
    const urls = rawUrls.flatMap((value): URL[] => {
      if (typeof value !== "string") return [];
      try {
        const url = new URL(value);
        const hostname = normalizePublicDomain(url.hostname);
        if (
          url.protocol !== "https:" ||
          !hostname ||
          url.username ||
          url.password ||
          url.port ||
          url.search ||
          url.hash ||
          !url.pathname.endsWith("/")
        ) return [];
        return [url];
      } catch {
        return [];
      }
    });

    matches.push({ labelCount, urls });
  }

  if (!matches.length) return [];
  const longestMatch = Math.max(...matches.map((match) => match.labelCount));
  const unique = new Map<string, URL>();
  for (const match of matches) {
    if (match.labelCount !== longestMatch) continue;
    for (const url of match.urls) unique.set(url.href, url);
  }
  return [...unique.values()];
}

export async function onRequestGet({ request }: { request: Request }): Promise<Response> {
  const domain = normalizePublicDomain(new URL(request.url).searchParams.get("domain") || "");
  if (!domain) {
    return jsonResponse({ message: "Enter a valid public domain name, without a URL, port, or path." }, 400);
  }

  // IANA is the trusted source of authoritative registry endpoints. The short
  // timeout keeps the two-step lookup within the browser tool's request budget.
  const bootstrapResponse = await fetchTrustedLookupJson(
    IANA_RDAP_BOOTSTRAP,
    BOOTSTRAP_ACCEPT,
    3600,
    3000,
  );
  if (!bootstrapResponse.ok) return bootstrapResponse;

  const bootstrap = await bootstrapResponse.json().catch(() => null);
  const baseUrls = resolveRdapBaseUrls(domain, bootstrap);
  if (!baseUrls.length) {
    return jsonResponse({
      message: "IANA does not list a secure HTTPS RDAP service for this domain suffix.",
    }, 503);
  }

  let lastResponse: Response | null = null;
  // Most IANA records list one service URL; try at most one alternate when a
  // registry is unavailable or refuses the request.
  for (const baseUrl of baseUrls.slice(0, 2)) {
    const upstream = new URL("domain/" + encodeURIComponent(domain), baseUrl);
    const response = await fetchTrustedLookupJson(upstream, RDAP_ACCEPT, 300, 4000);
    if (response.status === 200 || response.status === 404) return response;
    lastResponse = response;
  }

  return lastResponse || jsonResponse({ message: "The authoritative RDAP registry could not be reached." }, 502);
}
