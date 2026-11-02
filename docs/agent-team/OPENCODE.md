# UTILORA Agent Tooling

This folder contains the project-local OpenCode setup: an eight-agent team and an optional shared skill library. See [TOOLING.md](./TOOLING.md) for installation and account setup.

The project config enables one shared NVIDIA NIM provider, Playwright in isolated headless mode, Context7, Firecrawl's keyless read-only subset, and Cloudflare documentation. The NVIDIA key is read from `NVIDIA_API_KEY` at runtime and is not committed. Cloudflare account administration and PostHog account tools remain disabled until a maintainer explicitly enables and authenticates them. Shell commands and edits are scoped per agent; access outside the repository and reads of .env files are denied.

OpenCode/MCP tooling is developer tooling and is not shipped to website visitors.
