# UTILORA Agent Studio

A private owner-only workspace for the UTILORA agent team, deployed as a separate Cloudflare Pages project. The public UTILORA tools website remains unchanged.

## Architecture

- **Frontend:** Vite application in this directory.
- **Private API:** Cloudflare Pages Functions in `functions/api/`.
- **Authentication:** Supabase Auth password verification followed by an HMAC-signed, HttpOnly owner session cookie.
- **Persistence:** Supabase `team_chat_*` tables, accessed with a server-side secret key. RLS is enabled and table grants are restricted to `service_role`.
- **Agent execution:** GitHub Actions workflow `.github/workflows/agent-chat-execution.yml`.
- **Callback:** Supabase Edge Function `agent-studio-callback`, which verifies GitHub Actions OIDC identity before reading tasks or writing agent results.
- **Models:** OpenCode's NVIDIA provider catalog, using the `NVIDIA_API_KEY` GitHub Actions secret.

The browser never receives Supabase secret keys, GitHub tokens, or the session-signing secret.

## Authentication and privacy

- Only `hhameranede@gmail.com` is authorized by default; configure `STUDIO_ALLOWED_EMAIL` explicitly.
- Supabase Auth verifies the owner's password. Public sign-ups must remain disabled.
- The server creates an 8-hour `__Host-utilora_session` cookie with `Secure`, `HttpOnly`, `Path=/`, and `SameSite=Strict`.
- Every private Pages Function validates the HMAC signature, expiry, and exact owner email before returning private data or dispatching work.
- Logout clears the cookie. Rotating `STUDIO_SESSION_SECRET` revokes all active sessions.
- Cloudflare Access / Zero Trust is not required.
- The chat runtime remains read-only with respect to project code; agent suggestions are proposals, not production changes.

## Required Cloudflare Pages configuration

See [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) for the full setup guide.

Required values:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` (or legacy `SUPABASE_ANON_KEY`)
- `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`)
- `STUDIO_SESSION_SECRET`
- `STUDIO_ALLOWED_EMAIL`
- `UTILORA_GITHUB_TOKEN`
- `UTILORA_GITHUB_REPOSITORY`
- `UTILORA_AGENT_WORKFLOW_REF`
- `UTILORA_AGENT_WORKFLOW_FILE`
- `AGENT_CHAT_CALLBACK_URL`

Also configure `NVIDIA_API_KEY` as a GitHub Actions repository secret.

## Local development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Local frontend preview does not grant access to private data unless the Pages Functions environment variables and owner session are configured. Never use production secret keys in browser code.

## Deployment

- Repository: `hhameranede/Utilora`
- Root directory: `apps/agent-studio`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

Keep Vercel as a rollback option until the Cloudflare deployment has passed the complete authentication, chat, workflow-dispatch, and callback tests. Do not alter the public UTILORA deployment or its DNS as part of this migration.
