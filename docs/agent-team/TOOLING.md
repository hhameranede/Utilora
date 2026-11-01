# OpenCode and MCP setup for UTILORA

## What this installs

OpenCode is the coding-agent runtime. The project config adds:
- **Playwright MCP** (pinned to `@playwright/mcp@0.0.83`): isolated, headless browser interaction.
- **Context7 MCP**: current framework and library documentation.
- **Firecrawl hosted MCP**: keyless, rate-limited public search/scrape/parse tools.
- **Cloudflare Docs MCP**: read-only Cloudflare documentation.
- **Optional Cloudflare API MCP** and **PostHog MCP**: preconfigured but disabled until explicitly enabled and authenticated.

MCP tools are loaded into the model context. Keep only the servers needed for a task enabled; large tool catalogs can reduce available context.

## Install OpenCode

Use the stable OpenCode 1 CLI documented at https://opencode.ai/docs:
```bash
npm install -g opencode-ai
opencode
```

From the UTILORA repository root, OpenCode reads `opencode.json`, `.opencode/agents/`, and `.opencode/skills/`.

## Connect NVIDIA

1. In OpenCode, run `/connect`.
2. Select **NVIDIA** and enter the existing NVIDIA NIM API key in the terminal prompt.
3. The project config exposes six NVIDIA NIM models through the `nvidia-nim` provider. Agent-specific defaults are assigned in `.opencode/agents/*.md`; use `opencode models` to inspect the configured catalogue.
4. Never paste the key into a chat, source file, issue, PR, or log.

For GitHub Actions, UTILORA reads a repository Actions secret named `NVIDIA_API_KEY`. To reuse the existing credential that was previously stored in another repository, add the same value directly in **UTILORA → Settings → Secrets and variables → Actions → New repository secret**. This is a one-time owner-side transfer because GitHub does not expose the plaintext value of an existing repository secret to another repository or to API clients. Do not send the key in chat, commit it, or create a new provider key unless the existing one is confirmed insufficient. The workflow runs inside UTILORA; it does not require a workflow caller or code changes in the credential-source repository.

## Authenticate optional account integrations

Cloudflare account access and PostHog are intentionally disabled in `opencode.json`. First review the scopes offered by each provider, then change the corresponding server's `enabled` value to `true` in your local, uncommitted config override and authenticate:

```bash
opencode mcp auth cloudflare-api
opencode mcp auth posthog
opencode mcp list
```

Grant the narrowest read-only permissions available. Cloudflare's API MCP can expose a broad account API surface; do not grant Workers write, DNS write, secret write, or destructive account scopes to a reviewer. PostHog's MCP includes both read and write operations; the UTILORA analytics agent is instructed to remain read-only, but the provider token should also be scoped narrowly.

Do not commit local credential files or tokens. OpenCode stores authentication outside the repository.

## Use the agents

OpenCode lists exactly eight project agents from `.opencode/agents/`:
- `project-lead` — Nemotron Ultra
- `problem-analyst` — DeepSeek
- `implementation-engineer` — MiniMax
- `fast-task-engineer` — GLM
- `visual-reviewer` — Nemotron Super VL
- `long-horizon-engineer` — Laguna
- `qa-engineer` — independent QA
- `security-auditor` — independent security review

OpenCode discovers project-local skills from `.opencode/skills/<name>/SKILL.md` and loads their full instructions on demand through its native `skill` tool. UTILORA now contains **exactly 50 skills: 9 first-party project skills and 41 carefully selected upstream skills**. The machine-readable provenance, pinned upstream commits, licences, and agent mapping live in `.opencode/skills/manifest.json`. See `docs/agent-team/SKILLS-CATALOG.md` for the role-by-role catalogue and `docs/agent-team/THIRD_PARTY_NOTICES.md` for the full third-party licence notices.

Every agent has an explicit `permission.skill` allow-list in its own frontmatter. The wildcard rule denies access by default, and only the skill IDs assigned to that role are allowed. Old or unrelated skill IDs are not retained. Loading a skill does not grant extra shell, edit, MCP, GitHub, Cloudflare, or deployment permissions; the agent's normal tool permissions remain in force.

Useful verification commands:
```bash
opencode agent list
opencode debug skill
opencode mcp list
npm run test:agent-config
npm run lint
npm run e2e
npm run build
```

CI installs OpenCode and runs CLI discovery checks for all eight agents and all 50 skills, plus deterministic checks for model routing, upstream commit pins, licences, and role permissions. The UTILORA-native model smoke workflow can be launched manually or runs when the agent configuration changes; it verifies the live NVIDIA catalogue, performs real inference, then makes each agent load its assigned skill, inspect repository evidence, and return a role-specific report. It writes sanitized per-agent reports and diagnostics as workflow artifacts. A green discovery check alone is not proof of model execution.

## Important limitations

- These files configure a developer agent; they do not create a persistent 24/7 service by themselves.
- OAuth is per OpenCode runtime and must be authorized by the repository owner. ChatGPT's connected apps do not automatically transfer credentials into OpenCode.
- Figma's official remote MCP documentation currently restricts connections to clients listed in its catalog and asks developers of other clients to join a waitlist. It is therefore not enabled here; use the existing Figma workflow until OpenCode support is officially confirmed.
- GitHub MCP is not enabled. Use normal Git/gh CLI workflows with scoped credentials instead of loading a very large GitHub tool catalog into every agent context.
- The Firecrawl keyless endpoint exposes only a reduced, rate-limited set of tools. Full crawling or mapping needs an authenticated account.
- NVIDIA free endpoints have quotas and are not an unlimited, guaranteed 24/7 production service.
- Never run an autonomous agent against untrusted pull-request code with secrets or production credentials available.
