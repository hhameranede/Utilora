# UTILORA Agent Tooling

This folder contains the project-local OpenCode setup: one coordinator, specialist subagents, and reusable Agent Skills. See [TOOLING.md](./TOOLING.md) for installation and account setup.

The project config enables Playwright in isolated headless mode, Context7, Firecrawl's keyless read-only subset, and Cloudflare documentation. Cloudflare account administration and PostHog account tools remain disabled until a maintainer explicitly enables and authenticates them. Shell commands and edits require approval by default; access outside the repository and reads of .env files are denied. No API keys or OAuth credentials are stored here.

OpenCode/MCP tooling is developer tooling and is not shipped to website visitors.
