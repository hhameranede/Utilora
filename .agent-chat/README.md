# UTILORA Agent Team Chat

This is a lightweight group-chat interface powered by GitHub Issues and GitHub Actions. It does not require Codespaces, Railway, a continuously running server, or a public chat endpoint.

## Start chatting

1. Merge the agent-team PR that adds this workflow. GitHub only runs issue-comment workflows when the workflow file exists on the repository's default branch.
2. Open the UTILORA Agent Team Chat issue linked from the PR description.
3. Add a comment beginning with /team followed by your message. Example: /team Review the Arabic RTL experience on mobile.
4. GitHub Actions runs the seven specialists independently (two at a time), then asks Project Lead to synthesize their reports. The answer appears as a new comment in the same issue.

## Team members

- problem-analyst
- implementation-engineer
- fast-task-engineer
- visual-reviewer
- long-horizon-engineer
- qa-engineer
- security-auditor
- project-lead (synthesis)

## Safety and limits

- Only comments authored by the repository owner and beginning with /team trigger a run.
- Agent runs are read-only: they may inspect repository files but cannot edit, execute shell commands, push, merge, deploy, or change settings.
- The NVIDIA NIM API key is passed only to the OpenCode process. The GitHub token is used in separate GitHub Actions steps for reading the thread and posting the reply; it is not passed to the model process.
- Each message starts a fresh run. The latest 12 earlier issue comments are included as conversation context; this is not a persistent live model session.
- Seven specialist calls plus one Project Lead synthesis call use the configured NVIDIA NIM models and may consume provider quota.
- Replies are asynchronous GitHub comments, not a real-time Messenger clone. GitHub Actions runner availability and workflow limits apply.
