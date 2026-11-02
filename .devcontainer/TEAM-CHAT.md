# UTILORA Agent Team Chat (Codespaces)

This setup runs the existing eight-agent OpenCode team in a browser, without Railway.

## One-time setup

1. Open [GitHub Codespaces secrets](https://github.com/settings/codespaces).
2. Add a secret named `NVIDIA_API_KEY` and paste your NVIDIA NIM API key into its value.
3. In **Repository access**, allow `hhameranede/Utilora`, then save.
4. Open the UTILORA repository, select branch `feat/utilora-agent-chat-codespaces-2026-11-02`, choose **Code → Codespaces → Create codespace**.
5. Wait for the container setup to finish.

Do not put the API key in a source file, terminal command, chat message, or commit. Codespaces secrets are exposed to the running development environment as environment variables.

## Start the browser chat

In the Codespace terminal, run:

```bash
bash scripts/start-agent-team-chat.sh
```

The script checks that `NVIDIA_API_KEY` is present, asks you to create a strong OpenCode server password, and starts the web interface on port `49374`.

In the **Ports** panel, open **UTILORA Agent Chat**. Keep its visibility set to **Private**. GitHub authentication protects the forwarded port, and OpenCode adds its own password check.

## Talk to the team

- Start with `project-lead` for planning and coordination.
- Mention a specialist directly in a message, for example `@problem-analyst`, `@implementation-engineer`, `@fast-task-engineer`, `@visual-reviewer`, `@long-horizon-engineer`, `@qa-engineer`, or `@security-auditor`.
- Ask Project Lead to convene the whole specialist council when you want a coordinated discussion.

OpenCode keeps conversations as sessions, with specialist agents available as subagents. This is the quickest way to talk to the existing agents; it is **not yet a custom single-room Messenger clone** where every agent posts automatically into one shared timeline.

## Security and costs

- The Codespaces port is configured as **Private**. Do not change it to Public.
- The API key is a Codespaces secret; the server password is entered at runtime and is not saved in the repository.
- Stop the Codespace when you finish. GitHub Free personal accounts currently include 120 core-hours and 15 GB-month of Codespaces storage; compute usage depends on the selected machine size.
- Chat requests to NVIDIA NIM may have separate provider limits or costs under your NVIDIA account. GitHub's Codespaces quota does not include model inference.
