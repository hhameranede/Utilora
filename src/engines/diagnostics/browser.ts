import type { ToolAdapter } from '../types';
import type {
  DomainAgeCheckerInput, DomainAgeCheckerOutput,
  DnsLookupInput, DnsLookupOutput,
  HttpHeadersCheckerInput, HttpHeadersCheckerOutput,
  RdapLookupInput, RdapLookupOutput,
  WebsiteStatusCheckerInput, WebsiteStatusCheckerOutput,
} from './contracts';

export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SOA';
export interface DnsRecord {
  type: DnsRecordType;
  name: string;
  value: string;
  ttl: number;
  priority?: number;
}
export interface DnsLookupResult {
  records: DnsRecord[];
  queriedTypes: DnsRecordType[];
  errors: Array<{ type: DnsRecordType; message: string }>;
}
export interface RdapDomainResult {
  domain: string;
  handle: string | null;
  status: string[];
  registrar: string | null;
  createdAt: string | null;
  expiresAt: string | null;
  updatedAt: string | null;
  ageDays: number | null;
  ageYears: number | null;
  entities: Array<{ role: string; name: string }>;
  events: Array<{ eventAction: string; eventDate: string }>;
  nameservers: string[];
}
export interface WebsiteStatusResult {
  isUp: boolean;
  statusCode: number | null;
  statusText: string;
  responseTimeMs: number;
  ipAddress?: string;
  redirected: boolean;
  url: string;
}
export interface HttpHeadersResult {
  statusCode: number | null;
  statusText: string;
  responseTimeMs: number;
  headers: Record<string, string>;
  redirectChain: Array<{ url: string; status: number | null }>;
  securityAudit: {
    hasHsts: boolean;
    hasCsp: boolean;
    hasXContentTypeOptions: boolean;
    hasXFrameOptions: boolean;
  };
  corsLimited: boolean;
  redirected: boolean;
  ipAddress?: string;
}

const DNS_TYPE_CODES: Record<DnsRecordType, number> = {
  A: 1, NS: 2, CNAME: 5, SOA: 6, MX: 15, TXT: 16, AAAA: 28,
};
const DNS_CODE_TYPES: Record<number, DnsRecordType> = {
  1: 'A', 2: 'NS', 5: 'CNAME', 6: 'SOA', 15: 'MX', 16: 'TXT', 28: 'AAAA',
};
const DNS_TYPES: DnsRecordType[] = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA'];
const RDAP_ACCEPT = 'application/rdap+json, application/json';
const RDAP_ENDPOINT = '/api/rdap';
const DNS_ENDPOINT = '/api/dns';
const REQUEST_TIMEOUT_MS = 12_000;

function parseIPv4(value: string): number[] | null {
  const parts = value.split('.');
  if (parts.length !== 4) return null;
  const octets = parts.map((part) => {
    if (!/^\d{1,3}$/.test(part)) return -1;
    return Number(part);
  });
  if (octets.some((part) => part < 0 || part > 255)) return null;
  return octets;
}

function expandIPv6(value: string): number[] | null {
  if (!value.includes(':') || value.includes('%')) return null;
  let address = value.toLowerCase();
  if (address.includes('.')) {
    const lastColon = address.lastIndexOf(':');
    if (lastColon < 0) return null;
    const ipv4 = parseIPv4(address.slice(lastColon + 1));
    if (!ipv4) return null;
    const high = ((ipv4[0] << 8) | ipv4[1]).toString(16);
    const low = ((ipv4[2] << 8) | ipv4[3]).toString(16);
    address = address.slice(0, lastColon + 1) + high + ':' + low;
  }
  if ((address.match(/::/g) || []).length > 1) return null;
  const compressed = address.includes('::');
  const [leftText, rightText = ''] = compressed ? address.split('::') : [address, ''];
  const left = leftText ? leftText.split(':') : [];
  const right = rightText ? rightText.split(':') : [];
  if ([...left, ...right].some((part) => !/^[a-f0-9]{1,4}$/.test(part))) return null;
  const missing = 8 - left.length - right.length;
  if (compressed ? missing < 1 : missing !== 0) return null;
  const groups = [...left, ...Array(compressed ? missing : 0).fill('0'), ...right].map((part) => parseInt(part, 16));
  return groups.length === 8 ? groups : null;
}

/** Conservative public-address check used before browser-originated HTTP probes. */
export function isPublicIpAddress(value: string): boolean {
  const ipv4 = parseIPv4(value);
  if (ipv4) {
    const [a, b, c] = ipv4;
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 192 && b === 0 && c === 0) return false;
    if (a === 192 && b === 0 && c === 2) return false;
    if (a === 192 && b === 88 && c === 99) return false;
    if (a === 198 && (b === 18 || b === 19)) return false;
    if (a === 198 && b === 51 && c === 100) return false;
    if (a === 203 && b === 0 && c === 113) return false;
    return true;
  }

  const ipv6 = expandIPv6(value);
  if (!ipv6) return false;
  const first = ipv6[0];
  // Only global unicast space (2000::/3) is accepted. This excludes loopback,
  // link-local, unique-local, multicast, IPv4-mapped and unspecified addresses.
  if ((first & 0xe000) !== 0x2000) return false;
  if (first === 0x2001 && (ipv6[1] <= 0x01ff || ipv6[1] === 0x0db8)) return false;
  if (first === 0x2002) return false; // 6to4 can encapsulate non-public IPv4 destinations.
  if (first === 0x3fff && (ipv6[1] & 0xf000) === 0) return false; // documentation prefix.
  return true;
}

function isIpLiteral(value: string): boolean {
  return Boolean(parseIPv4(value) || expandIPv6(value));
}

export function normalizeDomain(value: string): string {
  const input = value.trim();
  if (!input || /[\/?#@:\s]/u.test(input)) {
    throw new Error('Enter a domain name only, without a URL, path, port, or spaces.');
  }

  let hostname: string;
  try {
    const parsed = new URL('https://' + input);
    if (parsed.username || parsed.password || parsed.port || parsed.pathname !== '/') {
      throw new Error('Invalid domain format.');
    }
    hostname = parsed.hostname.toLowerCase().replace(/\.$/u, '');
  } catch {
    throw new Error('Enter a valid domain name such as example.com.');
  }

  if (!hostname || hostname.length > 253 || !hostname.includes('.') || isIpLiteral(hostname)) {
    throw new Error('Enter a public domain name, not an IP address or local hostname.');
  }
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new Error('Local and internal hostnames are not supported.');
  }

  const labels = hostname.split('.');
  if (labels.some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/u.test(label))) {
    throw new Error('The domain contains an invalid DNS label.');
  }
  if (!/^[a-z0-9-]{2,63}$/u.test(labels[labels.length - 1])) {
    throw new Error('The domain suffix is invalid.');
  }
  return hostname;
}

export function normalizeWebsiteUrl(value: string): string {
  const input = value.trim();
  if (!input || /\s/u.test(input)) throw new Error('Enter a valid website URL.');
  const hasScheme = /^[a-z][a-z0-9+.-]*:/iu.test(input);
  let parsed: URL;
  try {
    parsed = new URL(hasScheme ? input : 'https://' + input);
  } catch {
    throw new Error('Enter a valid website URL, such as https://example.com.');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Only HTTP and HTTPS website URLs are supported.');
  }
  if (parsed.username || parsed.password) throw new Error('URLs containing usernames or passwords are not allowed.');
  if (parsed.port && !((parsed.protocol === 'https:' && parsed.port === '443') || (parsed.protocol === 'http:' && parsed.port === '80'))) {
    throw new Error('Only the standard HTTP and HTTPS ports are supported.');
  }

  parsed.hostname = normalizeDomain(parsed.hostname);
  parsed.hash = '';
  return parsed.toString();
}

interface DnsAnswer {
  name?: string;
  type?: number;
  TTL?: number;
  data?: string;
}
interface DnsJsonResponse {
  Status?: number;
  Answer?: DnsAnswer[];
}

export function parseDnsAnswer(answer: DnsAnswer): DnsRecord | null {
  const type = DNS_CODE_TYPES[Number(answer.type)];
  if (!type || typeof answer.data !== 'string') return null;
  let value = answer.data.trim();
  let priority: number | undefined;

  if (type === 'MX') {
    const match = /^(\d+)\s+(.+)$/u.exec(value);
    if (match) {
      priority = Number(match[1]);
      value = match[2];
    }
  } else if (type === 'TXT' && value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }

  return {
    type,
    name: String(answer.name || '').replace(/\.$/u, '').toLowerCase(),
    value,
    ttl: Math.max(0, Number(answer.TTL) || 0),
    ...(priority === undefined ? {} : { priority }),
  };
}

async function fetchJson<T>(url: string, accept: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: accept },
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal,
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const providerMessage = payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message?: unknown }).message || '')
        : '';
      if (providerMessage) throw new Error(providerMessage);
      if (response.status === 404) throw new Error('No public registry data was found for this domain.');
      if (response.status === 429) throw new Error('The public lookup provider is rate-limiting requests. Try again shortly.');
      throw new Error('The lookup endpoint returned HTTP ' + response.status + '.');
    }
    if (!payload || typeof payload !== 'object') {
      throw new Error('The public lookup provider returned an invalid response.');
    }
    return payload as T;
  } catch (cause) {
    if (controller.signal.aborted) throw new Error('The lookup timed out. Please try again.');
    if (cause instanceof TypeError) {
      throw new Error('UTILORA’s public lookup endpoint could not be reached. Check your connection and try again.');
    }
    throw cause;
  } finally {
    clearTimeout(timeout);
  }
}

function validDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function readVcardName(entity: Record<string, unknown>): string | null {
  const vcard = entity.vcardArray;
  if (!Array.isArray(vcard) || !Array.isArray(vcard[1])) return null;
  const entries = vcard[1] as unknown[];
  for (const entry of entries) {
    if (!Array.isArray(entry) || !['fn', 'org'].includes(String(entry[0]).toLowerCase())) continue;
    const raw = entry[3];
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
    if (Array.isArray(raw)) {
      const joined = raw.map(String).filter(Boolean).join(' ').trim();
      if (joined) return joined;
    }
  }
  return null;
}

function firstEvent(events: Array<{ eventAction: string; eventDate: string }>, names: string[]): string | null {
  const event = events.find((item) => names.includes(item.eventAction.toLowerCase()));
  return event ? validDate(event.eventDate) : null;
}

export async function lookupDomainRdap(value: string): Promise<RdapDomainResult> {
  const domain = normalizeDomain(value);
  const payload = await fetchJson<Record<string, unknown>>(
    RDAP_ENDPOINT + '?domain=' + encodeURIComponent(domain),
    RDAP_ACCEPT,
  );

  const rawEvents = Array.isArray(payload.events) ? payload.events : [];
  const events = rawEvents.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const event = item as Record<string, unknown>;
    return typeof event.eventAction === 'string' && typeof event.eventDate === 'string'
      ? [{ eventAction: event.eventAction, eventDate: event.eventDate }]
      : [];
  });
  const rawEntities = Array.isArray(payload.entities) ? payload.entities : [];
  const entities = rawEntities.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const entity = item as Record<string, unknown>;
    const roles = Array.isArray(entity.roles) ? entity.roles.map(String) : [];
    const name = readVcardName(entity) || 'Name not disclosed';
    return roles.map((role) => ({ role, name }));
  });
  const registrarEntity = rawEntities.find((item) => {
    if (!item || typeof item !== 'object') return false;
    const roles = (item as Record<string, unknown>).roles;
    return Array.isArray(roles) && roles.some((role) => String(role).toLowerCase() === 'registrar');
  }) as Record<string, unknown> | undefined;

  const createdAt = firstEvent(events, ['registration', 'registered', 'creation']);
  const expiresAt = firstEvent(events, ['expiration', 'expiry']);
  const updatedAt = firstEvent(events, ['last changed', 'last update of rdap database', 'last update']);
  const ageDays = createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000))
    : null;
  const nameservers = Array.isArray(payload.nameservers)
    ? payload.nameservers.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const name = (item as Record<string, unknown>).ldhName;
      return typeof name === 'string' ? [name.toLowerCase()] : [];
    })
    : [];

  return {
    domain,
    handle: typeof payload.handle === 'string' ? payload.handle : null,
    status: Array.isArray(payload.status) ? payload.status.map(String) : [],
    registrar: registrarEntity ? readVcardName(registrarEntity) : null,
    createdAt,
    expiresAt,
    updatedAt,
    ageDays,
    ageYears: ageDays === null ? null : Math.floor(ageDays / 365.2425),
    entities,
    events,
    nameservers,
  };
}

export async function lookupDnsRecords(value: string, requestedTypes: DnsRecordType[]): Promise<DnsLookupResult> {
  const domain = normalizeDomain(value);
  const queriedTypes = [...new Set(requestedTypes.filter((type): type is DnsRecordType => DNS_TYPES.includes(type)))];
  if (!queriedTypes.length) throw new Error('Choose at least one DNS record type.');

  const settled = await Promise.allSettled(queriedTypes.map(async (type) => {
    const url = DNS_ENDPOINT + '?name=' + encodeURIComponent(domain) + '&type=' + DNS_TYPE_CODES[type];
    const payload = await fetchJson<DnsJsonResponse>(url, 'application/dns-json');
    if (payload.Status === 2) throw new Error('The DNS resolver could not complete this query (SERVFAIL).');
    if (payload.Status === 5) throw new Error('The DNS resolver refused this query.');
    return (payload.Answer || []).flatMap((answer) => {
      const record = parseDnsAnswer(answer);
      if (!record) return [];
      if (record.type !== type && record.type !== 'CNAME') return [];
      return [record];
    });
  }));

  const records: DnsRecord[] = [];
  const errors: Array<{ type: DnsRecordType; message: string }> = [];
  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      records.push(...result.value);
    } else {
      errors.push({
        type: queriedTypes[index],
        message: result.reason instanceof Error ? result.reason.message : 'This DNS record type could not be queried.',
      });
    }
  });

  if (errors.length === queriedTypes.length) {
    throw new Error(errors[0]?.message || 'The DNS lookup could not be completed.');
  }

  const unique = new Map<string, DnsRecord>();
  records.forEach((record) => {
    const key = [record.type, record.name, record.value, record.priority ?? ''].join('|');
    unique.set(key, record);
  });
  return {
    records: [...unique.values()].sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)),
    queriedTypes,
    errors,
  };
}

async function resolvePublicAddresses(hostname: string): Promise<string[]> {
  const result = await lookupDnsRecords(hostname, ['A', 'AAAA']);
  const addresses = result.records
    .filter((record) => record.type === 'A' || record.type === 'AAAA')
    .map((record) => record.value);
  if (!addresses.length) throw new Error('The hostname has no public A or AAAA records and cannot be checked.');
  if (addresses.some((address) => !isPublicIpAddress(address))) {
    throw new Error('The hostname resolves to a private, reserved, or non-public IP address. The request was blocked.');
  }
  return addresses;
}

async function sendHeadRequest(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
      credentials: 'omit',
      redirect: 'manual',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    });
  } catch (cause) {
    if (controller.signal.aborted) throw new Error('The website did not respond before the 12-second timeout.');
    if (cause instanceof TypeError) {
      throw new Error('The browser could not read a response. The website may block cross-origin checks with CORS, or the network may be unavailable. This does not prove the website is down.');
    }
    throw cause;
  } finally {
    clearTimeout(timeout);
  }
}

async function probeWebsite(value: string): Promise<{ url: string; addresses: string[]; response: Response; responseTimeMs: number }> {
  const url = normalizeWebsiteUrl(value);
  const hostname = new URL(url).hostname;
  const addresses = await resolvePublicAddresses(hostname);
  const started = performance.now();
  const response = await sendHeadRequest(url);
  return { url, addresses, response, responseTimeMs: Math.max(0, Math.round(performance.now() - started)) };
}

export async function checkWebsiteStatus(value: string): Promise<WebsiteStatusResult> {
  const result = await probeWebsite(value);
  const redirected = result.response.type === 'opaqueredirect';
  const statusCode = redirected ? null : result.response.status;
  return {
    isUp: redirected || (statusCode !== null && statusCode >= 100 && statusCode <= 599),
    statusCode,
    statusText: redirected ? 'Redirect detected; not followed' : (result.response.statusText || 'HTTP response received'),
    responseTimeMs: result.responseTimeMs,
    ipAddress: result.addresses[0],
    redirected,
    url: result.url,
  };
}

export async function checkHttpHeaders(value: string): Promise<HttpHeadersResult> {
  const result = await probeWebsite(value);
  const redirected = result.response.type === 'opaqueredirect';
  const headers: Record<string, string> = {};
  result.response.headers.forEach((headerValue, key) => { headers[key.toLowerCase()] = headerValue; });
  const hasHsts = Boolean(headers['strict-transport-security']);
  const hasCsp = Boolean(headers['content-security-policy']);
  const hasXContentTypeOptions = Boolean(headers['x-content-type-options']);
  const hasXFrameOptions = Boolean(headers['x-frame-options']);
  const corsLimited = !hasHsts || !hasCsp || !hasXContentTypeOptions || !hasXFrameOptions;

  return {
    statusCode: redirected ? null : result.response.status,
    statusText: redirected ? 'Redirect detected; not followed' : (result.response.statusText || 'HTTP response received'),
    responseTimeMs: result.responseTimeMs,
    headers,
    redirectChain: [{ url: result.url, status: redirected ? null : result.response.status }],
    securityAudit: { hasHsts, hasCsp, hasXContentTypeOptions, hasXFrameOptions },
    corsLimited,
    redirected,
    ipAddress: result.addresses[0],
  };
}

function createConnectedAdapter<TInput, TOutput>(
  id: string,
  name: string,
  run: (input: TInput) => Promise<TOutput>,
): ToolAdapter<TInput, Record<string, never>, TOutput> {
  return {
    id,
    name,
    isConnected: true,
    async execute(input) {
      const started = Date.now();
      try {
        return { success: true, data: await run(input), durationMs: Date.now() - started };
      } catch (cause) {
        return {
          success: false,
          error: {
            code: 'LOOKUP_FAILED',
            message: cause instanceof Error ? cause.message : 'The lookup could not be completed.',
          },
          durationMs: Date.now() - started,
        };
      }
    },
  };
}

export const DomainAgeCheckerAdapter = createConnectedAdapter<DomainAgeCheckerInput, DomainAgeCheckerOutput>(
  'domain-age-checker',
  'Domain Age Checker',
  async ({ domain }) => {
    const result = await lookupDomainRdap(domain);
    return {
      domain: result.domain,
      createdDate: result.createdAt,
      ageYears: result.ageYears,
      ageDays: result.ageDays,
      expiresDate: result.expiresAt,
      updatedDate: result.updatedAt,
      registrar: result.registrar,
    };
  },
);
export const RdapLookupAdapter = createConnectedAdapter<RdapLookupInput, RdapLookupOutput>(
  'rdap-lookup',
  'RDAP Lookup',
  async ({ domain }) => {
    const result = await lookupDomainRdap(domain);
    return {
      domain: result.domain,
      handle: result.handle,
      status: result.status,
      entities: result.entities,
      events: result.events,
      nameservers: result.nameservers,
      registrar: result.registrar,
    };
  },
);
export const DnsLookupAdapter = createConnectedAdapter<DnsLookupInput, DnsLookupOutput>(
  'dns-lookup',
  'DNS Lookup',
  async ({ domain, recordTypes }) => {
    const result = await lookupDnsRecords(domain, recordTypes);
    return { records: result.records, errors: result.errors };
  },
);
export const WebsiteStatusCheckerAdapter = createConnectedAdapter<WebsiteStatusCheckerInput, WebsiteStatusCheckerOutput>(
  'website-status-checker',
  'Website Status Checker',
  ({ url }) => checkWebsiteStatus(url),
);
export const HttpHeadersCheckerAdapter = createConnectedAdapter<HttpHeadersCheckerInput, HttpHeadersCheckerOutput>(
  'http-headers-checker',
  'HTTP Headers Checker',
  ({ url }) => checkHttpHeaders(url),
);
