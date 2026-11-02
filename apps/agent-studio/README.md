# UTILORA Agent Studio

A private owner-only chat workspace for the UTILORA agent team. This is a separate Vercel project; the public UTILORA tools website remains on Cloudflare.

## Runtime architecture

- **Frontend:** Vite app in this directory.
- **Private API:** Vercel serverless functions in `api/`.
- **Persistence:** Supabase `team_chat_*` tables. RLS is enabled; the tables are accessed only with a server-side secret/service-role key.
- **Agent execution:** GitHub Actions workflow `.github/workflows/agent-chat-execution.yml`, with a group-council mode and one-to-one private mode.
- **Rooms:** one persistent group room plus a separate persistent room for each of the eight agents.
- **Callback:** Supabase Edge Function `agent-studio-callback`, which verifies GitHub Actions OIDC identity before reading tasks or writing agent results.
- **Models:** OpenCode's NVIDIA provider catalog, using the `NVIDIA_API_KEY` secret.

The browser never receives Supabase secret keys, GitHub tokens, or NVIDIA API credentials.

## Required secrets

### Vercel project environment variables

Set the following on the **utilora-agent-studio** Vercel project, preferably Production and Preview:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Existing Supabase project URL |
| `SUPABASE_SECRET_KEY` | Supabase server-side secret key (`sb_secret_...`) |
| `UTILORA_GITHUB_TOKEN` | Fine-grained token for dispatching this repository's workflow |

For compatibility, `SUPABASE_SERVICE_ROLE_KEY` may be used instead of `SUPABASE_SECRET_KEY`. Do not set both unless intentionally rotating credentials.

The GitHub token should be a fine-grained token scoped only to `hhameranede/Utilora` and granted **Actions: Read and write**. Keep it in Vercel environment variables only. It must never be placed in Vite variables (for example, `VITE_*`) or committed to Git. This token is currently still missing from the connected Vercel project.

The following non-secret settings are already configured in the Vercel project:

- `SITE_URL=https://utilora-chat.vercel.app`
- `AGENT_CHAT_CALLBACK_URL=https://hfokwvgrqbzzunkhflhq.supabase.co/functions/v1/agent-studio-callback`
- `SUPABASE_URL=https://hfokwvgrqbzzunkhflhq.supabase.co`

### GitHub Actions repository secret

In `hhameranede/Utilora` → Settings → Secrets and variables → Actions, add:

- `NVIDIA_API_KEY`: API key created in the NVIDIA developer portal. This secret is required before any real model response can run; it must not be pasted into chat or committed.

The workflow passes this secret only to the GitHub Actions runner. It is not exposed to the browser or written to logs.

## Access control

- Vercel SSO deployment protection must remain enabled for **all** deployments.
- Keep the Vercel team membership limited to the workspace owner.
- The API routes rely on Vercel's deployment protection; do not disable it for previews or production.
- The Supabase callback keeps JWT verification disabled at the gateway because it performs its own strict GitHub OIDC verification (issuer, audience, repository, actor, branch, event, and workflow path).
- Group rooms use slug `main`; private rooms use `agent-<agent-id>`. These rows are pre-created in Supabase.
- The callback is not a browser API. Its CORS allow-list is restricted to the production chat origin.

## Local development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

The local frontend can load without secrets, but message sending and live database status require the server-side Vercel environment variables. Never use production service keys in browser code.

## Deployment

Vercel project settings:

- Repository: `hhameranede/Utilora`
- Root directory: `apps/agent-studio`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 22.x
- Primary domain: `utilora-chat.vercel.app`

This project's Vercel configuration must not change the root deployment or Cloudflare configuration of the main UTILORA tools site.


## Team command model

1. **Owner (you):** final authority for priorities, permissions, approvals, and production changes.
2. **Project Lead:** second-in-command for task framing, coordination, and the final team synthesis. It cannot overrule the owner.
3. **Specialists:** independent advisors. In the group room, each specialist decides whether its expertise adds meaningful value; a security concern can therefore bring in Security Auditor even during a design discussion. Specialists can disagree and can abstain when they have nothing useful to add.
4. **One-to-one rooms:** each agent has a persistent private conversation with its own history. Private messages are routed only to that agent; the group room is not mixed into the personal room.

The chat runtime intentionally runs agents in read-only mode. A suggested code change is a proposal, not an execution. Production-affecting actions remain outside agent authority.
