# UTILORA Agent Studio

A private owner-only workspace for the UTILORA agent team, deployed as a separate Cloudflare Pages project. The public UTILORA tools website remains unchanged.

## Architecture

- **Frontend:** Vite application in this directory.
- **Private API:** Cloudflare Pages Functions in `functions/api/`.
- **Authentication:** Supabase Auth password verification followed by an HKDF-derived HMAC-signed, HttpOnly owner session cookie.
- **Persistence:** Supabase `team_chat_*` tables, accessed with a server-side Supabase secret key. RLS is enabled and table grants are restricted to `service_role`.
- **Agent execution:** GitHub Actions workflow `.github/workflows/agent-chat-execution.yml`.
- **Callback:** Supabase Edge Function `agent-studio-callback`, which verifies GitHub Actions OIDC identity before reading tasks or writing agent results.
- **Models:** OpenCode's NVIDIA provider catalog, using the `NVIDIA_API_KEY` GitHub Actions secret.

The browser never receives Supabase secret keys or GitHub tokens.

## Authentication and privacy

- Only `hhameranede@gmail.com` is authorized.
- Supabase Auth verifies the owner's password. Public sign-ups must remain disabled.
- The server creates an 8-hour `__Host-utilora_session` cookie with `Secure`, `HttpOnly`, `Path=/`, and `SameSite=Strict`.
- The HMAC signing key is derived from the server-only Supabase secret using HKDF-SHA-256 and a dedicated context label. There is no separate session-signing secret to configure.
- Every private Pages Function validates the HMAC signature, expiry, and exact owner email before returning data or dispatching work.
- Rotating the Supabase secret invalidates active sessions.
- Cloudflare Access / Zero Trust is not required.
- The chat runtime remains read-only with respect to project code; agent suggestions are proposals, not production changes.

## Cloudflare configuration

Only two Cloudflare secrets are required. See [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) for setup and safe rollout:

- `SUPABASE_SECRET_KEY`
- `UTILORA_GITHUB_TOKEN`

The Supabase URL, owner email, repository, workflow ref/file, and callback URL are fixed in server-side code. `NVIDIA_API_KEY` remains configured separately in GitHub Actions.

## Local development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Local frontend preview does not grant access to private data unless the Pages Functions environment has the required server-only secrets and an owner session. Never use production secret keys in browser code.

## Deployment

- Repository: `hhameranede/Utilora`
- Root directory: `apps/agent-studio`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

Keep Vercel as a rollback option until the Cloudflare deployment has passed the complete authentication, chat, workflow-dispatch, and callback tests. Do not alter the public UTILORA deployment or its DNS as part of this migration.
