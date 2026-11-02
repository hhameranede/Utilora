# Cloudflare Agent Studio migration

This is a separate Cloudflare Pages project. It does not modify the public UTILORA tools project.

## Pages project

- Project: `utilora-agent-studio`
- Repository: `hhameranede/Utilora`
- Production branch: `main`
- Root directory: `/apps/agent-studio`
- Build command: `npm run build`
- Build output: `dist`
- Functions: `functions/api/chat.js` and `functions/api/status.js`

## Runtime variables and secrets

Set these for Preview and Production in Pages > Settings > Variables and Secrets.

| Name | Type | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | Variable | `https://paleenigjkmjwinkblfv.supabase.co` |
| `SUPABASE_SECRET_KEY` | Secret | Supabase server-side `sb_secret_` key; never use a publishable key |
| `UTILORA_GITHUB_TOKEN` | Secret | Fine-grained GitHub token with Actions: write on `hhameranede/Utilora` |
| `UTILORA_GITHUB_REPOSITORY` | Variable | `hhameranede/Utilora` |
| `UTILORA_AGENT_WORKFLOW_REF` | Variable | `main` |
| `UTILORA_AGENT_WORKFLOW_FILE` | Variable | `agent-chat-execution.yml` |
| `AGENT_CHAT_CALLBACK_URL` | Variable | `https://paleenigjkmjwinkblfv.supabase.co/functions/v1/agent-studio-callback` |
| `CF_ACCESS_TEAM_DOMAIN` | Variable | Cloudflare Zero Trust team hostname |
| `CF_ACCESS_AUD` | Variable | AUD tag from the Cloudflare Access application |
| `STUDIO_ALLOWED_EMAIL` | Variable | `hhameranede@gmail.com` |

Vercel does not reveal the existing secret values, so the Supabase key and GitHub token must be entered directly into Cloudflare's secret fields. Do not commit or send them in chat.

## Access protection (mandatory)

Cloudflare Access must be enabled before the API returns private data. Protect the production hostname `utilora-agent-studio.pages.dev` explicitly and allow only `hhameranede@gmail.com`. Protecting preview deployments alone is not sufficient.

Pages Functions independently verify the `Cf-Access-Jwt-Assertion` signature, issuer, application audience, and allowed email. Missing Access configuration fails closed with HTTP 503; missing/invalid JWT fails closed with HTTP 401.

## Existing services retained

- Supabase remains the database and callback host.
- GitHub Actions remains the agent execution engine.
- NVIDIA remains configured as a GitHub Actions secret.
- Vercel remains available as a fallback until Cloudflare is tested.
