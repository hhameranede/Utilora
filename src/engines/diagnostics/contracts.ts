import type { ToolAdapter } from '../types';

// The public lookup adapters are connected in browser.ts. These contracts keep
// their inputs and outputs stable for the tool UI and future diagnostics clients.
export interface DomainAgeCheckerInput { domain: string; }
export interface DomainAgeCheckerOutput {
  domain: string;
  createdDate: string | null;
  ageYears: number | null;
  ageDays: number | null;
  expiresDate: string | null;
  updatedDate: string | null;
  registrar: string | null;
}

export interface RdapLookupInput { domain: string; }
export interface RdapLookupOutput {
  domain: string;
  handle: string | null;
  status: string[];
  entities: Array<{ role: string; name: string }>;
  events: Array<{ eventAction: string; eventDate: string }>;
  nameservers: string[];
  registrar: string | null;
}

export interface DnsLookupInput {
  domain: string;
  recordTypes: Array<'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SOA'>;
}
export interface DnsLookupOutput {
  records: Array<{
    type: string;
    name: string;
    value: string;
    ttl: number;
    priority?: number;
  }>;
}

export interface WebsiteStatusCheckerInput { url: string; }
export interface WebsiteStatusCheckerOutput {
  isUp: boolean;
  statusCode: number | null;
  statusText: string;
  responseTimeMs: number;
  ipAddress?: string;
  redirected?: boolean;
  url?: string;
}

export interface HttpHeadersCheckerInput { url: string; }
export interface HttpHeadersCheckerOutput {
  statusCode: number | null;
  statusText?: string;
  responseTimeMs?: number;
  headers: Record<string, string>;
  redirectChain: Array<{ url: string; status: number | null }>;
  securityAudit: {
    hasHsts: boolean;
    hasCsp: boolean;
    hasXContentTypeOptions: boolean;
    hasXFrameOptions: boolean;
  };
  corsLimited?: boolean;
  redirected?: boolean;
  ipAddress?: string;
}

// Import the connected implementations from ./browser when an adapter is needed.
// Keeping the ToolAdapter type imported here documents the shared execution shape.
export type DiagnosticsAdapter<TInput, TOutput> = ToolAdapter<TInput, Record<string, never>, TOutput>;
