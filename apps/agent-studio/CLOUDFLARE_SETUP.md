# Cloudflare Agent Studio setup

This is a separate private Cloudflare Pages project. It does not modify the public UTILORA tools website.

## Pages project

- Project: `utilora-agent-studio`
- Repository: `hhameranede/Utilora`
- Production branch: `main`
- Root directory: `apps/agent-studio`
- Build command: `npm run build`
- Build output: `dist`
- Pages Functions: `functions/api/*`

## Cloudflare Pages variables and secrets

Configure these for the environment you intend to test.

| Name | Type | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | Variable | `https://paleenigjkmjwinkblfv.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Variable | Supabase publishable key (or legacy anon key); used only by the server to authenticate the owner against Supabase Auth |
| `SUPABASE_SECRET_KEY` | Secret | Supabase server-side `sb_secret_` key; never use a publishable key here |
| `STUDIO_SESSION_SECRET` | Secret | Random secret with at least 32 characters, used to sign owner-only session cookies |
| `STUDIO_ALLOWED_EMAIL` | Variable | `hhameranede@gmail.com` |
| `UTILORA_GITHUB_TOKEN` | Secret | Fine-grained GitHub token with Actions: read/write on `hhameranede/Utilora` |
| `UTILORA_GITHUB_REPOSITORY` | Variable | `hhameranede/Utilora` |
| `UTILORA_AGENT_WORKFLOW_REF` | Variable | `main` |
| `UTILORA_AGENT_WORKFLOW_FILE` | Variable | `agent-chat-execution.yml` |
| `AGENT_CHAT_CALLBACK_URL` | Variable | `https://paleenigjkmjwinkblfv.supabase.co/functions/v1/agent-studio-callback` |

Do not put passwords, session secrets, Supabase secret keys, or GitHub tokens in source code, browser variables, commits, or chat messages. Generate the session secret locally (for example, with `openssl rand -base64 48`) and paste it directly into the Cloudflare secret field.

## Supabase Auth owner account

1. Open Supabase project `paleenigjkmjwinkblfv` → Authentication → Users.
2. Ensure the owner account `hhameranede@gmail.com` exists and its email is confirmed. If it does not exist, create the user from the dashboard and set a strong password there.
3. Disable public sign-ups in Authentication settings. Do not expose any public registration endpoint.
4. Use that account's password only in the Agent Studio sign-in form.

## Authentication design (no Cloudflare Access required)

- `POST /api/login` checks the submitted password through Supabase Auth's password grant.
- The server accepts only `STUDIO_ALLOWED_EMAIL`.
- On success, Pages Functions issue an 8-hour HMAC-signed `__Host-utilora_session` cookie with `Secure`, `HttpOnly`, `Path=/`, and `SameSite=Strict`.
- Every private API (`session`, `status`, and `chat`) verifies the cookie signature, expiry, and exact owner email before accessing private data.
- The browser never receives Supabase secret keys, GitHub tokens, or the session-signing secret.
- Logout clears the cookie. Rotating `STUDIO_SESSION_SECRET` immediately invalidates all existing sessions.
- Login also has an isolate-local attempt guard; Supabase Auth's own rate limits remain the authoritative cross-instance protection.

Cloudflare Access / Zero Trust is not required for this application.

## Existing services retained

- Supabase remains the database and callback host.
- GitHub Actions remains the agent execution engine.
- NVIDIA remains configured as a GitHub Actions secret.
- Vercel remains available as a fallback until Cloudflare is fully tested.

## Safe rollout

Do not merge or switch production traffic until all required variables are configured and the following are tested on a non-production Pages deployment:

- Unauthenticated requests to `/api/session`, `/api/status`, and `/api/chat` return 401 (or 503 if session configuration is missing).
- Wrong email/password is rejected; only the owner account can log in.
- A valid login sets an HttpOnly, Secure, SameSite cookie.
- Chat history and status load after login; sending a message dispatches the existing GitHub Actions workflow.
- Logout clears the cookie and private APIs return 401 again.
- No secrets appear in browser bundles, responses, or logs.
