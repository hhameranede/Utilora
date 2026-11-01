import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const config = JSON.parse(readFileSync(join(root, 'opencode.json'), 'utf8')) as {
  $schema?: string;
  mcp?: Record<string, { type?: string; url?: string; command?: string[]; enabled?: boolean }>;
};

assert.equal(config.$schema, 'https://opencode.ai/config.json', 'OpenCode schema must be declared');
assert.ok(config.mcp, 'MCP configuration must exist');

const expectedRemote: Record<string, string> = {
  context7: 'https://mcp.context7.com/mcp',
  firecrawl: 'https://mcp.firecrawl.dev/v2/mcp',
  'cloudflare-docs': 'https://docs.mcp.cloudflare.com/mcp',
  'cloudflare-api': 'https://mcp.cloudflare.com/mcp',
  posthog: 'https://mcp.posthog.com/mcp',
};

for (const [name, url] of Object.entries(expectedRemote)) {
  const server = config.mcp[name];
  assert.ok(server, `Missing MCP server: ${name}`);
  assert.equal(server.type, 'remote', `${name} must use remote transport`);
  assert.equal(server.url, url, `${name} endpoint changed unexpectedly`);
}

assert.equal(config.mcp['cloudflare-api'].enabled, false, 'Cloudflare account API must remain opt-in');
assert.equal(config.mcp.posthog.enabled, false, 'PostHog account MCP must remain opt-in');

const playwright = config.mcp.playwright;
assert.ok(playwright, 'Playwright MCP must exist');
assert.equal(playwright.type, 'local');
assert.ok(playwright.command?.includes('@playwright/mcp@0.0.83'), 'Playwright MCP must stay pinned');
assert.ok(playwright.command?.includes('--headless'), 'Playwright MCP must be headless');
assert.ok(playwright.command?.includes('--isolated'), 'Playwright MCP must use an isolated profile');

const agentDir = join(root, '.opencode', 'agents');
const agentFiles = readdirSync(agentDir).filter((name) => name.endsWith('.md'));
assert.ok(agentFiles.length >= 7, 'Expected the lead and specialist agent definitions');
for (const file of agentFiles) {
  const contents = readFileSync(join(agentDir, file), 'utf8');
  const frontmatter = contents.match(/^---\\r?\\n([\\s\\S]*?)\\r?\\n---/);
  assert.ok(frontmatter, `Missing YAML frontmatter in agent ${file}`);
  assert.match(frontmatter[1], /^description:\\s*.+$/m, `Missing description in ${file}`);
  assert.match(frontmatter[1], /^mode:\\s*(primary|subagent)\\s*$/m, `Invalid mode in ${file}`);
}

const skillsDir = join(root, '.opencode', 'skills');
const skillDirs = readdirSync(skillsDir).filter((name) => statSync(join(skillsDir, name)).isDirectory());
assert.ok(skillDirs.length >= 8, 'Expected project-specific Agent Skills');
for (const dir of skillDirs) {
  const file = join(skillsDir, dir, 'SKILL.md');
  const contents = readFileSync(file, 'utf8');
  const frontmatter = contents.match(/^---\\r?\\n([\\s\\S]*?)\\r?\\n---/);
  assert.ok(frontmatter, `Missing YAML frontmatter in skill ${dir}`);
  const declaredName = frontmatter[1].split(/\\r?\\n/).find((line) => line.startsWith('name:'));
  assert.equal(declaredName, `name: ${dir}`, `Skill name must match folder ${dir}`);
  assert.match(frontmatter[1], /^description:\\s*.+$/m, `Missing description in skill ${dir}`);
}

const publicConfigFiles = [
  'opencode.json',
  ...agentFiles.map((name) => join('.opencode', 'agents', name)),
  ...skillDirs.map((name) => join('.opencode', 'skills', name, 'SKILL.md')),
];
const joined = publicConfigFiles.map((file) => readFileSync(join(root, file), 'utf8')).join('\\n');
assert.doesNotMatch(joined, /nvapi-[A-Za-z0-9_-]{20,}/, 'NVIDIA API key must never be committed');
assert.doesNotMatch(joined, /gh[pousr]_[A-Za-z0-9]{20,}/, 'GitHub token must never be committed');
assert.doesNotMatch(joined, /github_pat_[A-Za-z0-9_]{20,}/, 'GitHub fine-grained token must never be committed');

console.log(`Agent tooling configuration verified: ${agentFiles.length} agents, ${skillDirs.length} skills, ${Object.keys(config.mcp).length} MCP servers.`);
