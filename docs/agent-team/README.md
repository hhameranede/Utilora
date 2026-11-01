# UTILORA Autonomous Engineering Team

## Mission

Operate as a disciplined, evidence-driven engineering team for the public `hhameranede/Utilora` repository. Improve reliability, accessibility, privacy, performance, SEO, and tool correctness without changing the approved product identity (warm white, stone gray, orange; Arabic RTL; restrained motion).

The repository configures one NVIDIA NIM provider with six model IDs using the `NVIDIA_API_KEY` environment variable. The model smoke workflow runs inside UTILORA and reads a repository-level Actions secret with that name. To reuse a credential previously stored elsewhere, the owner must add the same value in UTILORA repository settings; GitHub does not expose secret values for automatic cross-repository copying. Public model-catalog availability does not guarantee that the credential can access every model; live inference results are the source of truth. No continuous 24/7 worker or production deployment is implied.

## Agent roles

| Agent | Model | Responsibility |
|---|---|---|
| Project Lead | NVIDIA Nemotron 3 Ultra 550B | Planning, delegation and coordination |
| Problem Analyst | DeepSeek V4.1 Flash | Root-cause analysis, solution review, SEO/analytics/release evidence |
| Implementation Engineer | MiniMax M3.1 Flash | Standard code implementation and repairs |
| Fast Task Engineer | GLM 5.3 Flash | Small, bounded, low-risk engineering tasks |
| Visual Reviewer | Nemotron 3.5 Super VL 120B | Screenshot-based UI, responsive and RTL review |
| Long-Horizon Engineer | Poolside Laguna XS 2.1 | Multi-stage coding and architecture tasks |
| QA Engineer | DeepSeek V4.1 Flash | Independent reproduction, regression and end-to-end testing |
| Security Auditor | NVIDIA Nemotron 3 Ultra 550B | Independent read-only security and privacy review |

SEO, analytics and release-review skills remain in the 50-skill library and are assigned to the Problem Analyst and other relevant agents; they are capabilities, not separate extra workers.

## Skill library

UTILORA uses exactly **50 reusable skills**: 9 first-party project skills and 41 curated upstream skills. Skills are shared on disk, pinned to their upstream commit, and assigned through least-privilege per-agent allow-lists. See the [skill catalogue](SKILLS-CATALOG.md), [machine-readable manifest](../../.opencode/skills/manifest.json), and [third-party notices](THIRD_PARTY_NOTICES.md).

## Shared NVIDIA model provider

All six configured models use NVIDIA's OpenAI-compatible NIM endpoint `https://integrate.api.nvidia.com/v1` and one secret, `NVIDIA_API_KEY`. Model aliases and exact upstream IDs are defined in `opencode.json`. The model assignments are fixed in each agent's frontmatter and mirrored in the skill manifest.

NVIDIA advertises free trial endpoints for these models, but quota, account entitlement, throttling and service availability can vary. The UTILORA-native smoke workflow first checks the live `/v1/models` catalogue and then performs one inference for each assigned model. Results—not the public catalogue alone—determine which models the configured credential can actually use. Do not assume that all eight roles imply eight different models: QA shares DeepSeek and Security shares Nemotron Ultra, but remain separate agents with independent instructions and permissions.

NVIDIA's trial terms may record prompts and outputs for service operation and improvement. Never send credentials, personal data, user uploads, or confidential production content through the trial endpoint.

## Execution phases

1. **Foundation:** scheduled repository quality checks, manual dispatch, documented roles and least-privilege permissions.
2. **Observability:** add live-site checks and deployment status checks after confirming the canonical production URL and Cloudflare project.
3. **Model verification:** run the UTILORA-native workflow using the repository-level `NVIDIA_API_KEY` secret; verify catalog availability and one inference request per assigned agent. Never copy the key into source or log values.
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
- The branch configures the six-hour quality workflow, manual dispatch, eight model-specialized OpenCode agents, and one shared NVIDIA NIM provider.
- The model smoke workflow is owned and executed by UTILORA; it does not use a workflow caller in another repository.
- The existing API credential must be added as a repository-level `NVIDIA_API_KEY` Actions secret in UTILORA before live inference can run. The latest smoke attempt correctly stopped at credential preflight because that repository secret was not present.
- No always-on worker, automatic merge, live-site monitor, or production deployment/rollback is configured.
