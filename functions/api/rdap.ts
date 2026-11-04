import { fetchTrustedLookupJson, jsonResponse, normalizePublicDomain } from "../_shared/diagnostics";

const IANA_RDAP_BOOTSTRAP = new URL("https://data.iana.org/rdap/dns.json");
const RDAP_ACCEPT = "application/rdap+json, application/json";

type RdapBootstrap = {
  services?: unknown;
};

/**
 * Resolve the authoritative RDAP base URLs from IANA's DNS bootstrap registry.
 * Longer suffixes are checked first (for example, co.uk before uk).
 */
function getRdapServiceUrls(domain: string, payload: unknown): string[] {
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as RdapBootstrap).services)) {
    return [];
  }

  const services = (payload as { services: unknown[] }).services;
  const labels = domain.toLowerCase().split(".");

  for (let index = 0; index < labels.length; index += 1) {
    const suffix = labels.slice(index).join(".");
    const matches = services.filter((entry) => {
      if (!Array.isArray(entry) || !Array.isArray(entry[0]) || !Array.isArray(entry[1])) return false;
      return (entry[0] as unknown[]).some((value) => typeof value === "string" && value.toLowerCase() === suffix);
    });

    if (matches.length) {
      return [...new Set(matches.flatMap((entry) =>
        (entry[1] as unknown[]).filter((value): value is string => typeof value === "string" && value.length > 0),
      ))];
    }
  }

  return [];
}

/**
 * Only use public RDAP hosts published by IANA. Some bootstrap entries still
 * advertise HTTP; those are permitted without credentials because RDAP data is
 * public, while user input can never influence the provider host.
 */
function trustedRdapBase(value: string): URL | null {
  try {
    const base = new URL(value);
    if (
      (base.protocol !== "https:" && base.protocol !== "http:") ||
      base.username ||
      base.password ||
      base.port ||
      base.search ||
      base.hash ||
      !normalizePublicDomain(base.hostname)
    ) return null;

    if (!base.pathname.endsWith("/")) base.pathname += "/";
    return base;
  } catch {
    return null;
  }
}

async function fetchRdapDomain(domain: string): Promise<Response> {
  const bootstrapResponse = await fetchTrustedLookupJson(IANA_RDAP_BOOTSTRAP, "application/json", 3600);
  if (!bootstrapResponse.ok) return bootstrapResponse;

  let bootstrap: unknown;
  try {
    bootstrap = await bootstrapResponse.json();
  } catch {
    return jsonResponse({ message: "The IANA RDAP bootstrap registry returned invalid JSON." }, 502);
  }

  const serviceUrls = getRdapServiceUrls(domain, bootstrap);
  if (!serviceUrls.length) {
    return jsonResponse({ message: "IANA does not list a public RDAP service for this domain suffix." }, 404);
  }

  let lastFailure: Response | null = null;
  for (const serviceUrl of serviceUrls) {
    const base = trustedRdapBase(serviceUrl);
    if (!base) continue;

    const upstream = new URL("domain/" + encodeURIComponent(domain), base);
    const response = await fetchTrustedLookupJson(upstream, RDAP_ACCEPT, 300);
    if (response.ok) return response;
    lastFailure = response;
  }

  return lastFailure || jsonResponse({ message: "IANA listed no usable public RDAP servers for this domain." }, 502);
}

export async function onRequestGet({ request }: { request: Request }): Promise<Response> {
  const domain = normalizePublicDomain(new URL(request.url).searchParams.get("domain") || "");
  if (!domain) {
    return jsonResponse({ message: "Enter a valid public domain name, without a URL, port, or path." }, 400);
  }

  return fetchRdapDomain(domain);
}
