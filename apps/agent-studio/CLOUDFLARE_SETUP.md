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
- Production deployments: enabled for changes under `apps/agent-studio/**`
- Preview deployments: disabled

## Only two Cloudflare secrets are required

Open Cloudflare Pages → `utilora-agent-studio` → Settings → Variables and Secrets. Add these two values as **Production secrets** before using private APIs. Preview secrets are not needed while preview deployments remain disabled.

| Name | Type | Purpose |
| --- | --- | --- |
| `SUPABASE_SECRET_KEY` | Secret | Supabase server-side key (`sb_secret_...`), or the legacy `service_role` key. Used only by Pages Functions for Auth, database access, and deriving the session-signing key. |
| `UTILORA_GITHUB_TOKEN` | Secret | Fine-grained GitHub token with Actions read/write permission on `hhameranede/Utilora`, used to start the agent workflow. |

That is the complete Cloudflare configuration. The Supabase URL, owner email, repository, workflow name/ref, and callback URL are fixed in the server code; no other Cloudflare variables are needed. The separate Supabase publishable key and a separate session secret are no longer required.

Until both secrets are added, private API routes deliberately fail closed and the login screen cannot authenticate. Do not enter secrets into chat, source code, browser variables, or commits.

## Supabase Auth owner account

1. Open Supabase project `paleenigjkmjwinkblfv` → Authentication → Users.
2. Ensure the owner account `hhameranede@gmail.com` exists and its email is confirmed. If it does not exist, create it from the dashboard and set a strong password there.
3. Disable public sign-ups in Authentication settings.
4. Use that account's password only in the Agent Studio sign-in form.

## Authentication design (no Cloudflare Access required)

- `POST /api/login` verifies the owner's password through Supabase Auth using the server-only Supabase key in the `apikey` header.
- The server accepts only `hhameranede@gmail.com`.
- On success, Pages Functions issue an 8-hour HMAC-signed `__Host-utilora_session` cookie with `Secure`, `HttpOnly`, `Path=/`, and `SameSite=Strict`.
- The HMAC key is derived from the Supabase secret using HKDF-SHA-256 with a dedicated context label. No additional session secret is needed; rotating the Supabase key invalidates active sessions.
- Every private API verifies the cookie signature, expiry, and exact owner email before accessing private data.
- The browser never receives the Supabase secret key or GitHub token.
- Logout clears the cookie. Login rate limiting is also enforced by Supabase Auth.

The Supabase secret key is used only in server-side Pages Functions. With new `sb_secret_...` keys, requests send the value through `apikey` only; legacy `service_role` JWT keys also use the Authorization bearer header.

Cloudflare Access / Zero Trust is not required.

## Existing services retained

- Supabase remains the database and callback host.
- GitHub Actions remains the agent execution engine.
- `NVIDIA_API_KEY` remains a GitHub Actions repository secret for the model provider. It is not a Cloudflare secret.
- Vercel remains available as a fallback until Cloudflare is fully tested.

## Safe rollout

- Unauthenticated requests to `/api/session`, `/api/status`, and `/api/chat` must return 401 (or 503 if the Supabase secret is missing).
- Wrong email/password must be rejected; only the owner account can log in.
- A valid login must set an HttpOnly, Secure, SameSite cookie.
- Chat history and status must load after login; sending a message must dispatch the existing GitHub Actions workflow.
- Logout must clear the cookie and private APIs must return 401 again.
- No secrets may appear in browser bundles, responses, or logs.

Do not change the public UTILORA deployment or its DNS as part of this setup.
