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

All eight agents are available as contributors. A model smoke result is diagnostic information only; it never blocks a role from participating in the team. The eight roles collaborate on new features and meaningful additions through the Project Lead's team council.

## Official repository registration

All eight are first-class UTILORA agents, not a shortlist or a temporary test group. Each role has a checked-in OpenCode definition under `.opencode/agents/`, a model mapping in `opencode.json`, and a role entry in the shared skill manifest. The Project Lead can convene all seven specialists regardless of any smoke-test outcome.

| Agent ID | Registered definition | Default model |
|---|---|---|
| `project-lead` | `.opencode/agents/project-lead.md` | `nvidia/nemotron-3-ultra-550b-a55b` |
| `problem-analyst` | `.opencode/agents/problem-analyst.md` | `deepseek-ai/deepseek-v4.1-flash` |
| `implementation-engineer` | `.opencode/agents/implementation-engineer.md` | `minimaxai/minimax-m3.1-flash` |
| `fast-task-engineer` | `.opencode/agents/fast-task-engineer.md` | `z-ai/glm-5.3-flash` |
| `visual-reviewer` | `.opencode/agents/visual-reviewer.md` | `nvidia/nemotron-3.5-super-vl-120b-a12b` |
| `long-horizon-engineer` | `.opencode/agents/long-horizon-engineer.md` | `poolside/laguna-xs-2.1` |
| `qa-engineer` | `.opencode/agents/qa-engineer.md` | `deepseek-ai/deepseek-v4.1-flash` |
| `security-auditor` | `.opencode/agents/security-auditor.md` | `nvidia/nemotron-3-ultra-550b-a55b` |

The eight roles are registered together. Diagnostic response checks measure routing and completion quality; they are not admission, activation, or availability gates.

SEO, analytics and release-review skills remain available in the shared library. No skill is assigned to a role; agents choose freely.

## Skill library

UTILORA uses exactly **50 reusable skills**: 9 first-party project skills and 41 curated upstream skills. Skills are shared on disk and available to every agent. They are optional references: each agent chooses whether a skill helps, and may use any skill or none. See the [skill catalogue](SKILLS-CATALOG.md), [machine-readable manifest](../../.opencode/skills/manifest.json), and [third-party notices](THIRD_PARTY_NOTICES.md).

## Shared NVIDIA model provider

All six configured models use NVIDIA's OpenAI-compatible NIM endpoint `https://integrate.api.nvidia.com/v1` and one secret, `NVIDIA_API_KEY`. Model aliases and exact upstream IDs are defined in `opencode.json`. Each agent has a role-appropriate default model in its frontmatter.

NVIDIA advertises free trial endpoints for these models, but quota, account entitlement, throttling and service availability can vary. The optional, manually triggered UTILORA capability check runs a real response through each agent's configured model. Results—not the public catalogue alone—show which models the configured credential can actually use. Do not assume that all eight roles imply eight different models: QA shares DeepSeek and Security shares Nemotron Ultra, but remain separate agents with independent instructions and permissions.

NVIDIA's trial terms may record prompts and outputs for service operation and improvement. Never send credentials, personal data, user uploads, or confidential production content through the trial endpoint.

## Team workflow

For every new feature or meaningful addition, the Project Lead invites all seven specialists to discuss the proposal. Each contributes from their role, challenges assumptions, and offers alternatives. The team records agreement, dissent and trade-offs before implementation. No fixed skill, mandatory tool sequence, admission gate or rigid response template is required.

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
- The branch configures quality workflows, eight role-specialized OpenCode agents, and one shared NVIDIA NIM provider.
- The model smoke workflow is a lightweight diagnostic of model routing and agent response; it does not determine whether an agent may participate.
- The existing API credential must be added as a repository-level `NVIDIA_API_KEY` Actions secret in UTILORA before live inference can run. If it is missing, the credential preflight fails once before starting any agent jobs.
- No always-on worker, automatic merge, live-site monitor, or production deployment/rollback is configured.
