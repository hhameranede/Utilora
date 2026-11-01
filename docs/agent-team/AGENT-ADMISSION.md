# UTILORA agent admission register

Last updated: 2026-11-01

This register records the latest verified agent smoke/recovery evidence. Admission is based on the current workflow revision, not an older successful run.

## Current admission status

No agent is currently admitted on the basis of the latest full smoke run. Earlier baseline passes remain historical evidence only; the latest repeat run exposed unstable report compliance, so bounded task assignment is paused until the affected role passes the corrected smoke workflow.

| Agent | Latest verified result | Next step |
|---|---|---|
| Project Lead | FAIL — returned a text event with no usable assistant text; skill call and two evidence calls were recorded. | Re-run after report-format improvements. |
| Problem Analyst | FAIL — 130 assistant-text characters; report did not contain the required role/evidence section structure. | Re-run after report-format improvements. |
| Implementation Engineer | FAIL — assigned model returned HTTP 429 in the full smoke run. Its isolated recovery reached real MiniMax inference and recorded a native skill call plus ten evidence calls, but did not produce a complete labeled report. | Re-run with bounded inference retries and the corrected report prompt. |
| Fast Task Engineer | IN PROGRESS at the last captured job snapshot; do not infer success from an unfinished job. | Refresh the latest run and record its final conclusion. |
| Visual Reviewer | FAIL — full smoke recorded a completed assessment but later rejected repository-state validation; isolated recovery recorded two evidence calls but no native accessibility-ux skill-tool call. | Re-run after skill-first prompt and recovery-artifact isolation fixes. |
| Long-Horizon Engineer | FAIL — 416 assistant-text characters were returned, but the report lacked the required role/evidence section structure. | Re-run with the corrected report prompt. |
| Independent QA | IN PROGRESS at the last captured job snapshot; do not infer success from an unfinished job. | Refresh the latest run and record its final conclusion. |
| Security Auditor | QUEUED at the last captured job snapshot; no result exists yet. | Wait for its actual job conclusion, then record it. |

## Recovery workflow corrections in this revision

- Main smoke inference retries transient HTTP 429/500/502/503/504 and transport failures with bounded backoff; persistent errors still fail.
- Agent report prompts require six exact, separately labeled sections: ROLE, MODEL, SKILL_LOADED, EVIDENCE, FINDING, LIMITATION.
- Validators recognize Markdown-wrapped labels but still require every section, a native call to the assigned skill, and at least two completed evidence/tool calls.
- Recovery reports and diagnostics are written under the runner temporary directory, outside the checked-out repository, so the workflow does not misclassify its own artifacts as agent edits.
- Visual Reviewer instructions explicitly require loading accessibility-ux through the native skill tool before review.
- Secrets remain inaccessible to agent prompts and are never written to reports. Recovery jobs remain read-only.

## Global restrictions

- The full eight-agent autonomous charter remains gated on all eight agents passing the corrected workflow.
- No always-on 24/7 orchestrator is claimed to be active until its scheduler, event handling, cost controls, alerting, and recovery are deployed and observed.
- Agents must work on isolated task branches and leave a PR/review trail.
- No direct push to main, automatic merge, production deploy, or secret exposure.
- Strategic decisions require documented options, trade-offs, dissent, and validation evidence.
