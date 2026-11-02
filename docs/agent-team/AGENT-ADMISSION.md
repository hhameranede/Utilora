# UTILORA agent team status

## No admission gate

All eight agents are available to contribute according to their roles. Smoke-test results, queued jobs, provider delays, recovery workflows, or this document must not block an agent from being invited to a task or team discussion.

The previous admission workflow imposed mandatory skill calls, fixed evidence counts, rigid report headings, and a serialized eight-agent queue. Those requirements have been retired because they tested compliance with a harness rather than useful collaboration. Skills are optional; each agent may choose any available skill or none.

## Team council

For every new feature or meaningful addition, the Project Lead convenes all seven specialists:
- Problem Analyst
- Implementation Engineer
- Fast Task Engineer
- Visual Reviewer
- Long-Horizon Engineer
- QA Engineer
- Security Auditor

Each specialist gives an independent opinion, alternatives, trade-offs, and relevant risks. Agents may disagree. The Project Lead summarizes the discussion and recommends a direction; unresolved strategic choices are brought to the user.

## Diagnostic workflows

Model smoke and recovery workflows may still be used as optional diagnostics for provider availability or agent configuration. A blocked, queued, failed, or slow diagnostic does not imply that the agent is unavailable for ordinary work. Never claim an agent completed a task without actual evidence.

## Safety boundaries

- No direct push to `main`, automatic merge, production deployment, or raw secret exposure.
- Reviewer roles remain read-only; implementation roles retain their role-specific permissions.
- Work remains branch-scoped and PR-based. The team council does not grant deployment or repository-administration rights.
