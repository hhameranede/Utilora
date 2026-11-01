# UTILORA Autonomous Engineering Team

## Mission

Operate as a disciplined, evidence-driven engineering team for the public `hhameranede/Utilora` repository. Improve reliability, accessibility, privacy, performance, SEO, and tool correctness without changing the approved product identity (warm white, stone gray, orange; Arabic RTL; restrained motion).

This document defines the intended architecture and safety boundaries. It does not claim that model credentials, external integrations, continuous agents, or production deployment have already been configured.

## Agent roles

| Role | Responsibility | Required evidence |
|---|---|---|
| Orchestrator / Planner | Break down findings, assign bounded tasks, track state and avoid duplicate work | Issue/PR plan and explicit acceptance criteria |
| Software Engineer | Implement small, reviewable code changes | Diff, type-check and relevant tests |
| QA Engineer | Reproduce bugs and test user journeys across tools/locales | Reproduction steps, test results, artifacts |
| UI/UX Reviewer | Review responsive layouts, accessibility, RTL and consistency | Screenshots or reproducible browser evidence |
| SEO Reviewer | Inspect metadata, canonical/hreflang, indexability, sitemap and content quality | URL samples and build assertions |
| Security & Privacy Reviewer | Inspect dependencies, input handling, secrets exposure, permissions and data flows | Findings with severity and remediation |
| Product/User Reviewer | Test the experience as a first-time visitor, including failure and empty states | Task-based observations |
| Release & Reliability Engineer | Validate release readiness, monitor deployment and coordinate rollback | Green gates, deployment health and rollback evidence |

## Candidate model pool

Model IDs and availability must be verified against the provider catalog and API before use. Do not hard-code a model based only on its display name.

- NVIDIA Nemotron Ultra: candidate planner / complex reasoning.
- DeepSeek V4 Flash family: candidate analysis and code review.
- MiniMax M3.1 Flash: candidate implementation and agentic coding.
- GLM Flash family: candidate fast, bounded tasks.
- Nemotron Super VL: candidate visual and multimodal review.
- Poolside Laguna: candidate longer coding tasks.

These are candidates, not benchmark winners. Before assigning production work, run the same representative UTILORA tasks against available models and compare correctness, test pass rate, tool-call reliability, security, latency, token usage, and provider limits.

## Execution phases

1. **Foundation:** scheduled repository quality checks, manual dispatch, documented roles and least-privilege permissions.
2. **Observability:** add live-site checks and deployment status checks after confirming the canonical production URL and Cloudflare project.
3. **Model gateway:** add a server-side adapter for NVIDIA's OpenAI-compatible API; credentials only in GitHub Actions Secrets or Cloudflare Secrets. Never commit keys or print them in logs.
4. **Bounded agents:** read-only audit first; then branch-scoped code changes and pull requests. Each task has a timeout, budget, allowed paths, and acceptance tests.
5. **Release automation:** only after deployment provider, health endpoint, rollback method and protection rules are verified.

## Non-negotiable safety rules

- Never expose secrets in source, artifacts, logs, issues, prompts, or public PRs.
- Public repository means every committed file and historical commit is public. Rotate any credential ever committed.
- Never give an LLM unrestricted repository administration, secrets access, or production credentials.
- Use short-lived tokens and least-privilege permissions. The current quality workflow requires only `contents: read`.
- Untrusted pull-request code must not receive secrets.
- Agents work on isolated branches. No direct pushes to `main`.
- No automatic merge or production deployment until required checks, security checks, deployment health checks, and rollback have been proven.
- Never auto-merge a change that modifies auth, billing, secrets, data deletion, deployment configuration, or security policy without a separate explicit review policy.
- Limit retries, runtime, concurrency and API spend. Free endpoints are not unlimited or guaranteed production capacity.
- Keep a human-readable audit trail of task, model, changed files, test results, and release outcome.

## Current status

- Repository visibility: public (verified 2026-11-01).
- Existing CI: TypeScript, product-content tests, local engine tests, SEO build assertions, and Chromium E2E.
- This foundation adds a six-hour scheduled run and manual dispatch to that existing CI.
- No AI model key, model gateway, live-site monitor, automatic merge, or production rollback is configured by this change.
