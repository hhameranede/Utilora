# UTILORA Premium Platform Foundation

**Status:** Proposal / implementation foundation  
**Created:** 2026-11-15  
**Target repository:** `hhameranede/Utilora`  
**Base commit:** `3046a46567180a4c6b684318973337c6cafac426`  
**Work branch:** `feat/premium-foundation-2026-11-15`

This document establishes a reviewable product and engineering boundary for Premium. It does not enable billing, create accounts, expose a public API, or change Cloudflare/Supabase production configuration.

## 1. Product principle

Keep UTILORA's useful core tools free. Charge for higher-value capabilities that save repeat users time, support developers, or serve teams:

1. **Developer access:** versioned REST API, MCP server, API keys, usage dashboard and predictable quotas.
2. **Batch workflows:** process many files with one configuration, progress, cancellation and packaged downloads.
3. **Automation:** chain existing tools into reusable workflows and run them again.
4. **Cloud workspace:** saved presets, job history and cross-device continuity.
5. **Team workspace:** shared presets, member roles and team-level usage controls.

Do not put basic single-file tools behind a paywall. A higher batch count or a saved workflow can be Premium, but the ordinary free tool should remain usable.

## 2. Verified repository baseline

Audited against the `main` tree after the V4 merge:

- UTILORA has **36 registered tools**: 35 functional tools and one explicitly preview-only `video-downloader`.
- Most image, PDF, text, developer and video processing runs in the browser. Files remain in browser memory; they are not sent to UTILORA by these local engines.
- Website and Domain checks use a small set of Cloudflare Pages Functions. The current public routes are `/api/dns` and `/api/rdap`; these are bounded read-only lookups, not a general tool API.
- Existing Supabase migrations create and lock down the Agent Studio `team_chat_*` tables. They do not provide a general UTILORA account, subscription, API-key or usage-metering system.
- The frontend package does not currently include `@supabase/supabase-js`. No general API-key lifecycle, usage ledger, checkout, subscription entitlement or MCP endpoint was found in the inspected `main` source.
- Cloudflare Pages is the canonical hosting target. New server endpoints should use Pages Functions and must not introduce Vercel.

**Implication:** Premium cannot safely be implemented as only a frontend badge or a client-side paywall. Authentication, server-side entitlements, quotas, abuse controls and usage accounting must exist before paid API access is offered.

## 3. Recommended first release: Developer Preview

Start with a deliberately small, low-cost surface that reuses existing utility logic.

### REST API candidate tools

Expose deterministic text and developer operations first:

- JSON formatter, validator and minifier.
- Word counter and character counter.
- Case converter.
- Base64 encoder/decoder.
- URL encoder/decoder.
- UUID generator.
- SHA-256 / SHA-384 / SHA-512 hashing.

Keep input and output schemas explicit, bound request body sizes, and return stable machine-readable error codes. Do not expose browser-only image/video/PDF adapters through the server API until they have a safe server-compatible implementation and resource limits.

Proposed versioned route:

`POST /api/v1/tools/{toolId}`

Example request shape:

```json
{
  "input": {
    "text": "{ \"utilora\": true }"
  },
  "options": {
    "indent": 2
  },
  "idempotencyKey": "client-generated-unique-value"
}
```

The exact schema is tool-specific; this example is illustrative, not a published contract.

### MCP server candidate tools

Expose the same execution functions and schemas through a single remote MCP endpoint:

- `/api/mcp`
- Tools mirror the deterministic REST operations.
- MCP tool metadata must describe limits, expected inputs, output shape and whether the action is read-only.
- MCP and REST calls must pass through the same authorization, entitlement, quota and usage-metering layer. Do not maintain separate implementations that can drift.

Use the current official Streamable HTTP protocol revision as the implementation baseline, while verifying client compatibility before release. The 2026-07-28 specification describes a stateless POST endpoint, one JSON-RPC message per POST and per-request JSON or SSE responses. The protocol version is carried in the request metadata/header; older supported clients may require a compatibility path.

References:
- [MCP Streamable HTTP specification (2026-07-28)](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/basic/transports/streamable-http.mdx)
- [OpenAI: Add a custom MCP server to ChatGPT](https://developers.openai.com/api/docs/guides/custom-mcp-server)
- [OpenAI Help: Connecting custom MCP servers in ChatGPT](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt)

**Distribution caveat:** ChatGPT custom MCP connection availability is plan/workspace-dependent. The current Help Center lists custom MCP server connections for Business and Enterprise/Edu on ChatGPT web. Do not promise that every ChatGPT user, Free user or mobile user can connect an external MCP server. A remote REST API remains independently usable by other clients.

## 4. Identity, authentication and data model

Use a single account identity across the website, Developer API and MCP. Supabase Auth is a candidate because the project already has a Supabase integration, but the existing Agent Studio tables are not a general account system and must not be repurposed.

Proposed logical data model (not yet migrated):

| Entity | Purpose | Important fields |
|---|---|---|
| `accounts` | Billing and usage owner | id, owner_user_id, status, created_at |
| `api_keys` | REST credentials | id, account_id, key_prefix, key_hash, scopes, created_at, last_used_at, expires_at, revoked_at |
| `subscriptions` | Provider-neutral entitlement state | account_id, provider, provider_customer_id, provider_subscription_id, status, current_period_start, current_period_end |
| `usage_events` | Auditable billable actions | account_id, api_key_id, request_id, idempotency_key, tool_id, units, outcome, duration_ms, created_at |
| `usage_periods` | Fast quota reads | account_id, period_start, units_used, updated_at |
| `plan_entitlements` | Server-side capability/limit map | plan_id, capability, limit_value, period |

Security invariants:

- Generate API keys with a cryptographically secure random source. Show the full secret once; store only a hash and a non-secret prefix. Never store or log a plaintext key.
- Keep Supabase service credentials exclusively in server-side Cloudflare bindings. Never expose a service-role key or billing secret in Vite variables or browser code.
- Keep key, subscription and usage tables inaccessible to `anon` and ordinary browser clients. Use RLS and narrowly scoped server-side access.
- Do not make authorization decisions from user-editable profile metadata.
- Use atomic quota reservation/settlement and idempotency so retries do not double-charge.
- Do not log user-supplied text, uploaded file names, file contents, document text, tracking data or other private inputs. Store only the minimum event metadata needed for limits, billing and debugging.
- Revoke keys immediately; support expiry, scopes, per-key limits and account-wide limits.

### API and MCP authentication are related but not identical

- REST API: use a scoped `Authorization: Bearer <api-key>` credential.
- ChatGPT MCP: implement an OAuth-compatible authorization flow after verifying the current ChatGPT client requirements. Do not assume a REST API key is automatically a compatible OAuth flow.
- Internal service-role credentials are never client credentials.

## 5. Usage metering and quota model

Use a provider-neutral **usage unit** rather than charging every endpoint equally. A simple JSON minification request and a large image batch do not have equal resource costs.

Suggested initial unit policy (values intentionally not assigned yet):

- Small text/developer operation: base unit.
- Large text payload: size-based unit.
- Batch operation: units per successfully processed file, with a bounded batch ceiling.
- MCP call: same unit weight as the equivalent REST operation.
- Failed validation before execution: no billable unit.
- Provider/runtime failure after execution begins: record the failure separately and apply an explicit refund policy.

Each request should produce one metering decision with an idempotency key, a stable operation ID, a success/failure result and a unit count. Quotas must be enforced server-side, not solely in the UI.

Do not publish requests-per-month, file-count limits, overage rates or prices until load tests and real Cloudflare/Supabase usage data establish a sustainable budget.

## 6. Batch Processing architecture

Batch is a strong user-facing Premium capability, but the first image/PDF batch experience should remain browser-local:

- Process files sequentially or with a small, measured concurrency limit to protect mobile memory.
- Validate accepted format, per-file bytes, total selected bytes and decoded dimensions before processing.
- Show per-file state, aggregate progress, failures, retry and cancellation.
- Package successful outputs into a ZIP only after profiling memory and archive size.
- Never upload source files merely to batch them.
- Preserve the existing single-file tools for Free users.

A client-only batch limit is not a reliable paid entitlement boundary because users can modify browser code. Treat the UI limit as convenience only. If a batch allowance is a paid quota, reserve the allowance against the signed-in account through a server-side entitlement check; keep file bytes on-device.

Initial batch candidates: image conversion/compression/resizing and PDF conversion/splitting. Build one workflow family at a time and reuse the existing browser engines.

## 7. Automation, Cloud Workspace and Teams

These should follow the Developer Preview rather than ship together:

- **Automation:** a typed workflow graph made from allow-listed existing tool actions; validate the graph before execution; support cancellation and bounded steps.
- **Cloud Workspace:** save presets and user-created workflow definitions first. Do not store source files by default. Add output storage only after a retention, deletion, encryption and storage-cost policy is approved.
- **Teams:** account membership, least-privilege roles, team-level keys, shared presets and consolidated usage. Do not introduce team access before ownership and RLS policies are tested.

## 8. Billing decision remains open

No payment provider, currency, pricing, free quota, paid quota or overage policy has been selected. Keep checkout and billing webhooks out of the first engineering slice.

Before implementation, compare providers for supported seller country, payout availability, recurring subscriptions, usage-based billing, tax handling, dispute/chargeback process, webhook signing and documentation. A payment provider must not be selected based only on its API convenience.

When a provider is selected, keep provider webhooks idempotent and verify signatures before updating subscription entitlements. Never grant paid access from a browser redirect or a client-supplied plan name.

## 9. Rollout sequence and acceptance gates

### Phase A — shared execution contracts
- Extract deterministic text/developer operations into pure, runtime-neutral functions.
- Define one schema per operation and test valid input, invalid input, Unicode, size boundaries and stable output.
- Preserve browser-local behavior and avoid duplicating transformation logic.

### Phase B — Developer API Preview
- Add versioned Pages Function routes, API-key creation/revocation and scoped authentication.
- Add server-side quota reservations, usage records, idempotency and bounded rate controls.
- Add a Developer Dashboard with key prefixes, last-used time, usage and revocation. Never show existing secrets again.

### Phase C — MCP Preview
- Add stateless Streamable HTTP handling at `/api/mcp`.
- Test initialize, protocol negotiation, ping, tools/list, tools/call, malformed JSON-RPC, notifications, unsupported versions and auth failures.
- Verify interoperability with at least one independent MCP client and the current ChatGPT connection flow before describing it as supported.

### Phase D — Batch + Automation
- Deliver one local batch workflow family with progress, cancellation, size/memory bounds, ZIP integrity tests and mobile tests.
- Add workflow composition only after individual steps have reliable contracts.

### Phase E — Billing + Teams
- Select a payment provider and approve pricing/quotas.
- Add signed webhook processing, subscription lifecycle, entitlements, refunds and customer-visible usage statements.
- Add teams only after account ownership and access-control tests pass.

### Release gates
- Every capability is marked separately as proposed, implemented, tested, preview-deployed or production-enabled.
- No production secrets, database migrations, billing settings, Cloudflare bindings or public paid endpoints are changed without explicit release approval.
- No paid API is advertised until authentication, global abuse controls, quotas, usage accounting and support/error behavior are verified.
- No claim of AI-powered or OpenAI-sponsored processing: deterministic utility calls should execute in UTILORA's own code unless a separately disclosed model service is actually used.

## 10. Decisions to obtain before paid checkout

1. Payment provider and legal seller/payout setup.
2. Currency and target market for the first paid launch.
3. Whether Premium is an individual subscription, credit wallet, or both.
4. Whether REST API and MCP share one account quota or have separate quotas.
5. Exact Free/Premium/Developer limits after resource-cost measurements.

Until these are resolved, build the Developer Preview infrastructure and local batch capability without activating checkout or charging users.
