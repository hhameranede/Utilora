const DOMAIN_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/u;
const PUBLIC_SUFFIX = /^[a-z0-9-]{2,63}$/u;

export const DNS_RECORD_TYPES = new Set(["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA"]);

export function jsonResponse(
  body: unknown,
  status = 200,
  cacheControl = "no-store",
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cacheControl,
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    },
  });
}

/** Accept a hostname only; never accept a URL, IP literal, port, or local target. */
export function normalizePublicDomain(value: string): string | null {
  const input = value.trim();
  if (
    !input ||
    /\s/u.test(input) ||
    input.includes("/") ||
    input.includes("\\") ||
    /[?#@:]/u.test(input)
  ) return null;

  let hostname: string;
  try {
    const parsed = new URL("https://" + input);
    if (parsed.username || parsed.password || parsed.port || parsed.pathname !== "/") return null;
    hostname = parsed.hostname.toLowerCase().replace(/\.$/u, "");
  } catch {
    return null;
  }

  if (!hostname || hostname.length > 253 || !hostname.includes(".")) return null;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/u.test(hostname) || hostname.includes(":")) return null;
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".invalid")
  ) return null;

  const labels = hostname.split(".");
  if (labels.some((label) => !DOMAIN_LABEL.test(label))) return null;
  if (!PUBLIC_SUFFIX.test(labels[labels.length - 1])) return null;
  return hostname;
}

/**
 * Fetches JSON only from a fixed, trusted public lookup provider.
 * Callers must never pass a user-supplied URL or hostname as the upstream origin.
 * The abort timer remains active while the upstream response body is consumed.
 */
export async function fetchTrustedLookupJson(
  url: URL,
  accept: string,
  maxAgeSeconds: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const upstream = await fetch(url, {
      method: "GET",
      headers: { Accept: accept },
      credentials: "omit",
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });
    const text = await upstream.text();

    if (text.length > 1_000_000) {
      return jsonResponse({ message: "The public lookup provider returned an unexpectedly large response." }, 502);
    }

    const providerFailure = (statusCode: number, responseBody: unknown): Response => {
      const providerMessage = responseBody && typeof responseBody === "object" && "description" in responseBody
        ? String((responseBody as { description?: unknown }).description || "")
        : "";
      const message = statusCode === 404
        ? "No public registry data was found for this domain."
        : statusCode === 429
          ? "The public lookup provider is rate-limiting requests. Try again shortly."
          : providerMessage || "The public lookup provider returned HTTP " + statusCode + ".";
      return jsonResponse({ message }, statusCode === 404 || statusCode === 429 ? statusCode : 502);
    };

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      if (!upstream.ok) return providerFailure(upstream.status, null);
      return jsonResponse({ message: "The public lookup provider returned an invalid JSON response." }, 502);
    }

    if (!upstream.ok) return providerFailure(upstream.status, payload);
    return jsonResponse(payload, 200, "public, max-age=" + maxAgeSeconds + ", s-maxage=" + (maxAgeSeconds * 2));
  } catch {
    const timedOut = controller.signal.aborted;
    return jsonResponse(
      { message: timedOut ? "The public lookup provider timed out. Try again shortly." : "The public lookup provider could not be reached." },
      timedOut ? 504 : 502,
    );
  } finally {
    clearTimeout(timeout);
  }
}
