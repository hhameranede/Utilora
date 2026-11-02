# UTILORA Agent Studio

A private owner-only chat workspace for the UTILORA agent team. This is a separate Vercel project; the public UTILORA tools website remains on Cloudflare.

## Runtime architecture

- **Frontend:** Vite app in this directory.
- **Private API:** Vercel serverless functions in `api/`.
- **Persistence:** Supabase `team_chat_*` tables. RLS is enabled; the tables are accessed only with a server-side secret key.
- **Agent execution:** GitHub Actions workflow `.github/workflows/agent-chat-execution.yml`, with a group-council mode and one-to-one private mode.
- **Rooms:** one persistent group room plus a separate persistent room for each of the eight agents.
- **Callback:** Supabase Edge Function `agent-studio-callback`, which verifies GitHub Actions OIDC identity before reading tasks or writing agent results.
- **Models:** OpenCode's NVIDIA provider catalog, using the `NVIDIA_API_KEY` GitHub Actions secret.

The browser never receives Supabase secret keys, GitHub tokens, or NVIDIA API credentials.

## Required secrets and environment

### Vercel project environment variables

Project: **utilora-agent-studio** (root directory: `apps/agent-studio`).

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | `https://paleenigjkmjwinkblfv.supabase.co` |
| `SUPABASE_SECRET_KEY` | Supabase server-side secret key (`sb_secret_...`) |
| `UTILORA_GITHUB_TOKEN` | Fine-grained token used by the server to dispatch this repository's workflow |
| `SITE_URL` | `https://utilora-chat.vercel.app` |
| `AGENT_CHAT_CALLBACK_URL` | `https://paleenigjkmjwinkblfv.supabase.co/functions/v1/agent-studio-callback` |

For compatibility, `SUPABASE_SERVICE_ROLE_KEY` may be used instead of `SUPABASE_SECRET_KEY`. Do not set both unless intentionally rotating credentials.

`SUPABASE_SECRET_KEY` and `UTILORA_GITHUB_TOKEN` are configured as sensitive Vercel environment variables for Production. Add the same secrets to Preview only if preview deployments need to call the live backend; keep them out of browser-exposed `VITE_*` variables.

The GitHub token should be a fine-grained token scoped only to `hhameranede/Utilora` and granted **Actions: Read and write**. Keep it in Vercel environment variables only. It must never be committed to Git.

### GitHub Actions repository secret

In `hhameranede/Utilora` → Settings → Secrets and variables → Actions, configure:

- `NVIDIA_API_KEY`: API key created in the NVIDIA developer portal. It must not be pasted into chat or committed.

The workflow passes this secret only to the GitHub Actions runner. It is not exposed to the browser or written to logs.

## Supabase database

Project ref: `paleenigjkmjwinkblfv`.

The schema is versioned under `supabase/migrations/` and includes:

- `team_chat_rooms`
- `team_chat_messages`
- `team_chat_runs`
- `team_chat_agent_runs`
- `team_chat_events`

RLS is enabled on all five tables. Table grants are restricted to `service_role`; public `anon` and `authenticated` roles have no table access. The nine persistent room rows (one group room and eight private agent rooms) are seeded by the initial migration.

The Edge Function reads Supabase's built-in `SUPABASE_SECRET_KEYS` environment value (new secret-key format) or the legacy `SUPABASE_SERVICE_ROLE_KEY`. The browser and GitHub Actions never receive the Supabase secret.

## Access control

- Vercel SSO deployment protection must remain enabled for **all** deployments.
- Keep the Vercel team membership limited to the workspace owner.
- The API routes rely on Vercel's deployment protection; do not disable it for previews or production.
- The Supabase callback keeps JWT verification disabled at the gateway because it performs its own strict GitHub OIDC verification (issuer, audience, repository, actor, branch, event, and workflow path).
- Group room slug: `main`; private room slugs: `agent-<agent-id>`.
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

The local frontend can load without secrets, but message sending and live database status require the server-side Vercel environment variables. Never use production secret keys in browser code.

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
