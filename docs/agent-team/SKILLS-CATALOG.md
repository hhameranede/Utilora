# UTILORA Agent Skills Catalogue

This catalogue tracks exactly 100 external Agent Skills, pinned to immutable upstream commits and grouped by the eight project agents. The repository's 9 first-party UTILORA skills remain separate and are not included in the 100 count.

## Runtime behavior

- Skills live in `.opencode/skills/<name>/SKILL.md` and are discovered by OpenCode on demand.
- Agent-specific `permission.skill` rules expose only the skills assigned to that role. Unlisted skills are denied for that specialist.
- The project lead uses its cross-functional skill set; it does not grant specialists access to each other's entire collections.
- Skill instructions do not override shell, edit, external-directory, MCP, or deployment permissions.
- Cloudflare account API and PostHog remain disabled. No skill grants permission to deploy, push, merge, mutate DNS, alter analytics, or access secrets.
- External skill content is treated as untrusted documentation. Upstream reference files and scripts are not automatically vendored unless explicitly included in each skill folder.

## Provenance and licensing

Each catalogue record includes its upstream repository, immutable commit SHA, source path, licence, assigned agents, and immutable GitHub source URL. Copies include the upstream licence identifier in frontmatter. Original licence texts are stored in `docs/agent-team/third-party-licenses/`.

## Verification

The config test validates the 100 external catalogue records, unique names, pinned revisions, source metadata, SKILL.md frontmatter, agent assignment coverage, and permission allow-lists. CI also checks OpenCode's own discovery commands. Model-backed agent task execution requires a configured provider key and is intentionally not attempted in CI.
