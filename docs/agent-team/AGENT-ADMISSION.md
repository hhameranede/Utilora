# UTILORA agent admission register

Last updated: 2026-11-01

This register records the outcome of the current UTILORA-native model smoke run and determines who may receive bounded repository tasks while the remaining agents are still being evaluated.

## Admitted for bounded repository work

These agents completed their own model-backed OpenCode smoke job successfully in run [41353774664](https://github.com/hhameranede/Utilora/actions/runs/41353774664):

| Agent | Status | Initial task scope |
|---|---|---|
| Project Lead | PASS — admitted | Inspect repository state, plan work, delegate to specialists, and enforce acceptance criteria. It remains read-only and cannot edit code. |
| Fast Task Engineer | PASS — admitted | Small, low-risk, explicitly scoped file edits and focused tests. |
| Long-Horizon Engineer | PASS — admitted | Multi-file implementation and architecture work on an assigned task branch, with tests and a documented hand-off. |

Admission means the agent passed its isolated baseline smoke test. It does not grant direct pushes to `main`, PR merging, production deployment, secrets access, or unrestricted repository administration. Existing per-agent permissions remain authoritative.

## Recovery required — separate workflows

| Agent | Observed failure | Dedicated workflow |
|---|---|---|
| Implementation Engineer | Live inference, route resolution, assigned skill call, and seven completed evidence/tool calls passed; the report failed the required structure check. | [Implementation Engineer recovery](https://github.com/hhameranede/Utilora/actions/workflows/agent-recovery-implementation-engineer.yml) |
| Visual Reviewer | Live inference, route resolution, screenshot capture, and two evidence calls passed; the run did not prove use of the assigned native skill tool. | [Visual Reviewer recovery](https://github.com/hhameranede/Utilora/actions/workflows/agent-recovery-visual-reviewer.yml) |

Each recovery workflow is independently dispatchable and calls the shared in-repository recovery implementation. It has read-only GitHub permissions, performs its own model and OpenCode checks, and uploads only sanitized reports/diagnostics.

## Awaiting current smoke result

- Problem Analyst — OpenCode task still in progress at the last status check.
- Independent QA — inference/agent task still in progress at the last status check.
- Security Auditor — queued; no result yet.

Do not classify an in-progress or queued agent as successful or failed. When its job completes, record the actual conclusion. If it fails, create an agent-specific recovery workflow using the shared recovery implementation; if it passes, admit it for bounded repository work under its existing permissions.

## Global restrictions while admission is partial

- The full eight-agent autonomous charter remains gated on all eight agents passing.
- No always-on 24/7 orchestrator is claimed to be active until its scheduler, event handling, cost controls, alerting, and recovery are deployed and observed.
- Agents must work on isolated task branches and leave a PR/review trail.
- No direct push to `main`, automatic merge, production deploy, or secret exposure.
- Strategic decisions require documented options, trade-offs, dissent, and validation evidence.
