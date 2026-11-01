# UTILORA Agent Skills Catalogue

**Selection policy:** 50 optional skills are available to every agent: 9 first-party project skills and 41 selected upstream skills. Agents choose freely which skills, if any, help with a task.

## Optional skills

| Skill | Source |
|---|---|---|
| `accessibility` | addyosmani/web-quality-skills @ afa8da9 (MIT) |
| `accessibility-ux` | UTILORA project |
| `ai-seo` | coreyhaines31/marketingskills @ 88c79f6 (MIT) |
| `analytics` | coreyhaines31/marketingskills @ 88c79f6 (MIT) |
| `animation-performance` | emilkowalski/skills @ a81dbca (MIT) |
| `api-and-interface-design` | addyosmani/agent-skills @ 301b02b (MIT) |
| `browser-qa` | UTILORA project |
| `ci-cd-and-automation` | addyosmani/agent-skills @ 301b02b (MIT) |
| `code-review` | mattpocock/skills @ 4ae2317 (MIT) |
| `code-simplification` | addyosmani/agent-skills @ 301b02b (MIT) |
| `codebase-design` | mattpocock/skills @ 4ae2317 (MIT) |
| `content-strategy` | coreyhaines31/marketingskills @ 88c79f6 (MIT) |
| `context-engineering` | addyosmani/agent-skills @ 301b02b (MIT) |
| `core-web-vitals` | addyosmani/web-quality-skills @ afa8da9 (MIT) |
| `diagnosing-bugs` | mattpocock/skills @ 4ae2317 (MIT) |
| `dispatching-parallel-agents` | obra/superpowers @ 2ce8aa1 (MIT) |
| `documentation-and-adrs` | addyosmani/agent-skills @ 301b02b (MIT) |
| `domain-modeling` | mattpocock/skills @ 4ae2317 (MIT) |
| `frontend-ui-engineering` | addyosmani/agent-skills @ 301b02b (MIT) |
| `git-workflow-and-versioning` | addyosmani/agent-skills @ 301b02b (MIT) |
| `handoff` | mattpocock/skills @ 4ae2317 (MIT) |
| `improve-codebase-architecture` | mattpocock/skills @ 4ae2317 (MIT) |
| `incremental-implementation` | addyosmani/agent-skills @ 301b02b (MIT) |
| `observability-and-instrumentation` | addyosmani/agent-skills @ 301b02b (MIT) |
| `performance-optimization` | addyosmani/agent-skills @ 301b02b (MIT) |
| `planning-and-task-breakdown` | addyosmani/agent-skills @ 301b02b (MIT) |
| `pr` | mattpocock/skills @ 4ae2317 (MIT) |
| `programmatic-seo` | coreyhaines31/marketingskills @ 88c79f6 (MIT) |
| `quality-validation` | UTILORA project |
| `release-safety` | UTILORA project |
| `research` | mattpocock/skills @ 4ae2317 (MIT) |
| `research-sources` | UTILORA project |
| `retro` | mattpocock/skills @ 4ae2317 (MIT) |
| `safe-implementation` | UTILORA project |
| `schema` | coreyhaines31/marketingskills @ 88c79f6 (MIT) |
| `security-and-hardening` | addyosmani/agent-skills @ 301b02b (MIT) |
| `security-audit` | cloudflare/security-audit-skill @ c1c8a8c (MIT) |
| `security-review` | UTILORA project |
| `seo-audit` | coreyhaines31/marketingskills @ 88c79f6 (MIT) |
| `seo-review` | UTILORA project |
| `site-architecture` | coreyhaines31/marketingskills @ 88c79f6 (MIT) |
| `source-driven-development` | addyosmani/agent-skills @ 301b02b (MIT) |
| `spec-driven-development` | addyosmani/agent-skills @ 301b02b (MIT) |
| `systematic-debugging` | obra/superpowers @ 2ce8aa1 (MIT) |
| `tdd` | mattpocock/skills @ 4ae2317 (MIT) |
| `using-agent-skills` | addyosmani/agent-skills @ 301b02b (MIT) |
| `utilora-project-rules` | UTILORA project |
| `verification-before-completion` | obra/superpowers @ 2ce8aa1 (MIT) |
| `web-perf` | cloudflare/skills @ 1a33048 (Apache-2.0) |
| `writing-plans` | obra/superpowers @ 2ce8aa1 (MIT) |

## Agent model assignments

| Agent | NVIDIA model | Responsibility |
|---|---|---|
| `project-lead` | Planning and coordination |
| `problem-analyst` | Problem analysis and solution review, including SEO, analytics and release findings |
| `implementation-engineer` | Standard code implementation and repairs |
| `fast-task-engineer` | Bounded quick fixes and small tasks |
| `visual-reviewer` | Visual UI review from browser screenshots |
| `long-horizon-engineer` | Longer multi-step coding tasks |
| `qa-engineer` | Independent tests and verification |
| `security-auditor` | Independent security and secret review |

## Skill availability










## Quality and safety rules

- Exactly 50 skill IDs remain installed: 9 first-party and 41 curated upstream.
- External skills are pinned to immutable upstream Git commit SHAs in `.opencode/skills/manifest.json`.
- Each external skill records its source repository, exact source path, copyright owner, and SPDX-style licence identifier.
- Third-party instructions are subordinate to UTILORA's agent definitions and repository policies.
- Every skill is available to all eight agents; skills are optional and chosen at the agent's discretion.
- The six NVIDIA NIM model endpoints use the same OpenAI-compatible endpoint and the same `NVIDIA_API_KEY` secret. Actual account access is verified by a live model-catalog and inference workflow, not assumed from public availability.
- QA and security remain independent read-only roles. Only implementation and bounded task agents receive scoped edit access.
- No agent can commit, push, merge, deploy, change DNS, or edit production secrets.

