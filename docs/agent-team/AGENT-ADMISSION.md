# UTILORA agent admission register

Last updated: 2026-11-01

This register separates historical baseline evidence from the current corrected validation. A PASS from an older run is not treated as proof that a later run succeeded.

## Current staged admission

| Agent | Admission state | Evidence / scope |
|---|---|---|
| Fast Task Engineer | ADMITTED — bounded scope | Passed its baseline smoke job in run [41353774664](https://github.com/hhameranede/Utilora/actions/runs/41353774664). The latest full rerun had not completed this job at the last captured snapshot. It may continue only small, low-risk, explicitly scoped work on isolated branches with tests and PR hand-off. |
| Project Lead | TEMPORARILY SUSPENDED | Passed the earlier baseline, but run [41355360006](https://github.com/hhameranede/Utilora/actions/runs/41355360006) failed final-report validation despite a native skill call and two evidence calls. Resume coordination/delegation after corrected validation passes. Edit permission remains denied. |
| Long-Horizon Engineer | TEMPORARILY SUSPENDED | Passed the earlier baseline, but the repeat run returned a 416-character response without the required report structure. Resume multi-file implementation only after corrected validation passes. |
| Problem Analyst | RECOVERY REQUIRED | Repeat run returned a short response without the required report structure. |
| Implementation Engineer | RECOVERY REQUIRED | Full smoke encountered NVIDIA HTTP 429; isolated recovery reached real MiniMax inference and recorded a native skill call plus evidence reads, but its final report was incomplete. |
| Visual Reviewer | RECOVERY REQUIRED | Isolated recovery recorded evidence reads but no native accessibility-ux skill-tool call; the earlier full smoke also hit a repository-state false failure caused by recovery artifacts. |
| Independent QA | PENDING | No completed PASS/FAIL result was present in the last captured full smoke snapshot. |
| Security Auditor | PENDING | Job was queued in the last captured full smoke snapshot; no result was inferred. |

## Dedicated recovery workflows

| Agent | Workflow |
|---|---|
| Project Lead | [Project Lead recovery](https://github.com/hhameranede/Utilora/actions/workflows/agent-recovery-project-lead.yml) |
| Problem Analyst | [Problem Analyst recovery](https://github.com/hhameranede/Utilora/actions/workflows/agent-recovery-problem-analyst.yml) |
| Implementation Engineer | [Implementation Engineer recovery](https://github.com/hhameranede/Utilora/actions/workflows/agent-recovery-implementation-engineer.yml) |
| Visual Reviewer | [Visual Reviewer recovery](https://github.com/hhameranede/Utilora/actions/workflows/agent-recovery-visual-reviewer.yml) |
| Long-Horizon Engineer | [Long-Horizon Engineer recovery](https://github.com/hhameranede/Utilora/actions/workflows/agent-recovery-long-horizon-engineer.yml) |

Each recovery workflow calls the shared read-only assessment, checks the model catalogue and a real inference response, resolves the selected OpenCode agent/model route, verifies the assigned native skill call and evidence-inspection calls, and uploads only a sanitized report or diagnostic. The recovery report directory is outside the Git checkout so the workflow cannot mistake its own artifact for an agent edit.

## Corrective changes in the current branch

- Main model smoke retries transient NVIDIA HTTP 429/500/502/503/504 and transport failures with bounded backoff; persistent provider failures still fail.
- Agent prompts require six exact, separately labeled sections: ROLE, MODEL, SKILL_LOADED, EVIDENCE, FINDING, LIMITATION.
- Report validation requires all six labels, the assigned native skill tool, and at least two completed evidence/tool calls. It accepts common Markdown wrappers without accepting missing sections.
- Recovery reports and diagnostics are stored under the runner temporary directory; only those files are uploaded.
- Visual Reviewer instructions explicitly require loading accessibility-ux through the native skill tool before review.
- Recovery workflows now exist for each role that had an observed report/skill failure in the repeat run.

## Global restrictions

- The full eight-agent autonomous charter remains gated on all eight agents passing current, verifiable validation.
- No always-on 24/7 orchestrator is claimed to be active until its scheduler, event handling, cost controls, alerting, and recovery are deployed and observed.
- Agents must work on isolated task branches and leave a PR/review trail.
- No direct push to main, automatic merge, production deploy, or secret exposure.
- Strategic decisions require documented options, trade-offs, dissent, decision owner, and validation evidence.
