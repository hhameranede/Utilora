# UTILORA agent admission register

Last updated: 2026-11-01

## Admission gate

No agent currently has active repository-task admission based on the latest verification cycle. Previous passes from older runs are historical only and must not be reused as current admission evidence.

The corrected full smoke run and dedicated recovery workflows have been triggered on the active branch. Admission remains paused until each role has a completed, successful run proving:
- its exact configured model route is used and responds to a real inference;
- its assigned native skill-tool call completed successfully (a denied/error tool event is not a pass);
- at least two real repository evidence reads completed;
- a complete, labeled, evidence-based final report was returned;
- the agent respected its read-only/limited role and left the checkout unchanged.

## Last completed full smoke evidence

Run [41356136034](https://github.com/hhameranede/Utilora/actions/runs/41356136034) did not admit the team:
- Project Lead and Problem Analyst returned no usable final report text.
- Implementation Engineer returned a report without the required labeled sections despite successful model inference and completed skill/evidence calls.
- Several matrix jobs were still queued or running when sampled; they were not counted as passes.
- Earlier reports exposed false-positive acceptance: a skill invocation marked as denied/error could be counted as successful merely because the tool was attempted.

## Corrections now in the active branch

- Smoke and recovery validators count a skill load only when the native tool event has status `completed`.
- Evidence counts include completed repository reads (`read`, `grep`, `glob`, `list`), not arbitrary shell commands.
- Agent prompts explicitly use the `@skill-id` trigger and may request one bounded continuation to produce the final report.
- Recovery outputs are isolated under the runner temporary directory and uploaded from that directory.
- Worktree validation now prints changed paths before failing, so harness-generated mutations can be distinguished from agent edits.
- Nemotron Super VL is explicitly configured for text and image input; the configuration test locks this capability in.
- Visual Reviewer acceptance now requires screenshot/viewport-specific evidence and rejects a report that says image input was unavailable.
- The Visual Reviewer recovery workflow uses the same shared read-only recovery harness as the other roles.

## Per-agent recovery paths

| Agent | Workflow |
|---|---|
| Project Lead | [Isolated recovery](https://github.com/hhameranede/Utilora/actions/workflows/agent-recovery-project-lead.yml) |
| Problem Analyst | [Isolated recovery](https://github.com/hhameranede/Utilora/actions/workflows/agent-recovery-problem-analyst.yml) |
| Implementation Engineer | [Isolated recovery](https://github.com/hhameranede/Utilora/actions/workflows/agent-recovery-implementation-engineer.yml) |
| Visual Reviewer | [Isolated recovery](https://github.com/hhameranede/Utilora/actions/workflows/agent-recovery-visual-reviewer.yml) |
| Long-Horizon Engineer | [Isolated recovery](https://github.com/hhameranede/Utilora/actions/workflows/agent-recovery-long-horizon-engineer.yml) |

Fast Task Engineer, QA Engineer, and Security Auditor are evaluated by the full smoke matrix. Create a dedicated recovery workflow for any one of them if its latest completed result is FAIL.

## Global restrictions

- The full eight-agent autonomous charter remains gated on all eight agents passing the corrected workflow.
- No always-on 24/7 orchestrator is claimed active until its scheduler, event handling, cost controls, alerting, and recovery are deployed and observed.
- No direct push to `main`, automatic merge, production deployment, or raw secret exposure.
- All engineering work remains branch-scoped and PR-based. Strategic decisions require documented options, trade-offs, dissent, and validation evidence.
