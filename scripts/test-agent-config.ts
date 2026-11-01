import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

type McpServer = { type?: string; url?: string; command?: string[]; enabled?: boolean };
type SkillRecord = {
  id: string; source: string; path: string; revision: string; license: string;
  assigned_agents: string[]; upstream_url: string;
};
type SkillCatalog = {
  schema_version: number; project: string; external_skill_count: number;
  internal_skill_count: number; total_skill_count: number; skills: SkillRecord[];
};

const root = process.cwd();
const config = JSON.parse(readFileSync(join(root, 'opencode.json'), 'utf8')) as {
  $schema?: string; default_agent?: string; mcp?: Record<string, McpServer>;
};
assert.equal(config.$schema, 'https://opencode.ai/config.json');
assert.ok(config.mcp);
assert.equal(config.default_agent, 'project-lead', 'Project lead must be the default primary agent');

const expectedRemote: Record<string, string> = {
  context7: 'https://mcp.context7.com/mcp',
  firecrawl: 'https://mcp.firecrawl.dev/v2/mcp',
  'cloudflare-docs': 'https://docs.mcp.cloudflare.com/mcp',
  'cloudflare-api': 'https://mcp.cloudflare.com/mcp',
  posthog: 'https://mcp.posthog.com/mcp',
};
for (const [name, url] of Object.entries(expectedRemote)) {
  const server: McpServer | undefined = config.mcp[name];
  assert.ok(server, 'Missing MCP server: ' + name);
  assert.equal(server.type, 'remote');
  assert.equal(server.url, url);
}
assert.equal(config.mcp['cloudflare-api']?.enabled, false);
assert.equal(config.mcp.posthog?.enabled, false);
const playwright = config.mcp.playwright;
assert.ok(playwright);
assert.equal(playwright.type, 'local');
assert.ok(playwright.command?.includes('@playwright/mcp@0.0.83'));
assert.ok(playwright.command?.includes('--headless'));
assert.ok(playwright.command?.includes('--isolated'));

function readFrontmatter(file: string, label: string): string[] {
  const normalized = readFileSync(file, 'utf8').replaceAll('\r', '');
  assert.ok(normalized.startsWith('---\n'), 'Missing YAML frontmatter in ' + label);
  const end = normalized.indexOf('\n---', 4);
  assert.ok(end > 4, 'Unterminated YAML frontmatter in ' + label);
  return normalized.slice(4, end).split('\n');
}
function hasNonEmptyField(lines: string[], field: string): boolean {
  const prefix = field + ':';
  return lines.some((line) => line.startsWith(prefix) && line.slice(prefix.length).trim().length > 0);
}
function parseSkillPermissions(lines: string[], label: string): Map<string, string> {
  const skillIndex = lines.findIndex((line) => line.trim() === 'skill:');
  assert.notEqual(skillIndex, -1, 'Missing per-agent skill permissions in ' + label);
  const permissions = new Map<string, string>();
  for (let i = skillIndex + 1; i < lines.length && lines[i].startsWith('    '); i += 1) {
    const match = lines[i].match(/^    "([^"]+)": (allow|deny|ask)$/);
    assert.ok(match, 'Invalid skill permission line in ' + label + ': ' + lines[i]);
    assert.ok(!permissions.has(match[1]), 'Duplicate permission in ' + label);
    permissions.set(match[1], match[2]);
  }
  assert.equal(permissions.get('*'), 'deny', 'Unlisted skills must be denied for ' + label);
  return permissions;
}

const expectedAgents = [
  'project-lead', 'implementation-engineer', 'qa-engineer', 'security-auditor',
  'seo-auditor', 'ux-reviewer', 'analytics-reviewer', 'release-reviewer',
] as const;
const agentDir = join(root, '.opencode', 'agents');
const agentFiles = readdirSync(agentDir).filter((name) => name.endsWith('.md'));
assert.equal(agentFiles.length, expectedAgents.length, 'Expected exactly eight agent definitions');
for (const agent of expectedAgents) assert.ok(agentFiles.includes(agent + '.md'), 'Missing agent ' + agent);

const catalog = JSON.parse(readFileSync(join(root, 'docs', 'agent-team', 'skills-catalog.json'), 'utf8')) as SkillCatalog;
assert.equal(catalog.schema_version, 1);
assert.equal(catalog.project, 'UTILORA');
assert.equal(catalog.external_skill_count, 100);
assert.equal(catalog.skills.length, 100);
assert.equal(catalog.internal_skill_count, 9);
assert.equal(catalog.total_skill_count, 109);

const externalIds = catalog.skills.map((skill) => skill.id);
assert.equal(new Set(externalIds).size, 100, 'External skill IDs must be unique');
const skillsDir = join(root, '.opencode', 'skills');
const skillDirs = readdirSync(skillsDir).filter((name) => statSync(join(skillsDir, name)).isDirectory());
assert.equal(skillDirs.length, catalog.total_skill_count);

for (const skill of catalog.skills) {
  assert.match(skill.id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  assert.ok(skill.id.length <= 64);
  assert.ok(skillDirs.includes(skill.id), 'Missing installed skill folder: ' + skill.id);
  assert.match(skill.revision, /^[a-f0-9]{40}$/);
  assert.ok(['MIT', 'Apache-2.0'].includes(skill.license), 'Unapproved licence for ' + skill.id);
  assert.ok(skill.assigned_agents.length > 0, 'No agent assigned to ' + skill.id);
  assert.ok(skill.assigned_agents.every((agent) => expectedAgents.includes(agent as (typeof expectedAgents)[number])));
  assert.equal(skill.upstream_url, 'https://github.com/' + skill.source + '/blob/' + skill.revision + '/' + skill.path);
  const lines = readFrontmatter(join(skillsDir, skill.id, 'SKILL.md'), skill.id);
  const declaredName = lines.find((line) => line.startsWith('name:'))?.slice(5).trim().replace(/^["']|["']$/g, '');
  assert.equal(declaredName, skill.id);
  const description = lines.find((line) => line.startsWith('description:'))?.slice(12).trim();
  assert.ok(description && description.length > 0 && description.length <= 1024, 'Invalid description in ' + skill.id);
  assert.ok(lines.some((line) => line.trim() === 'source: "github.com/' + skill.source + '/' + skill.path + '"'));
  assert.ok(lines.some((line) => line.trim() === 'revision: "' + skill.revision + '"'));
}

const internalSkills = [
  'accessibility-ux', 'browser-qa', 'quality-validation', 'release-safety',
  'research-sources', 'safe-implementation', 'security-review', 'seo-review',
  'utilora-project-rules',
];
for (const name of internalSkills) {
  assert.ok(skillDirs.includes(name), 'Missing first-party skill: ' + name);
  const lines = readFrontmatter(join(skillsDir, name, 'SKILL.md'), name);
  assert.equal(lines.find((line) => line.startsWith('name:'))?.slice(5).trim(), name);
  assert.ok(hasNonEmptyField(lines, 'description'));
}

const expectedInternalAssignments: Record<string, string[]> = {
  'project-lead': ['utilora-project-rules', 'research-sources', 'release-safety', 'safe-implementation'],
  'implementation-engineer': ['utilora-project-rules', 'safe-implementation', 'quality-validation'],
  'qa-engineer': ['utilora-project-rules', 'browser-qa', 'quality-validation', 'accessibility-ux'],
  'security-auditor': ['utilora-project-rules', 'security-review', 'research-sources'],
  'seo-auditor': ['utilora-project-rules', 'seo-review', 'research-sources'],
  'ux-reviewer': ['utilora-project-rules', 'accessibility-ux', 'browser-qa'],
  'analytics-reviewer': ['utilora-project-rules', 'research-sources'],
  'release-reviewer': ['utilora-project-rules', 'release-safety', 'quality-validation', 'security-review', 'research-sources'],
};
for (const agent of expectedAgents) {
  const file = agent + '.md';
  const lines = readFrontmatter(join(agentDir, file), file);
  assert.ok(hasNonEmptyField(lines, 'description'));
  const mode = lines.find((line) => line.startsWith('mode:'))?.slice(5).trim();
  assert.ok(mode === 'primary' || mode === 'subagent');
  const permissions = parseSkillPermissions(lines, file);
  const external = catalog.skills.filter((skill) => skill.assigned_agents.includes(agent)).map((skill) => skill.id);
  const expected = [...new Set([...expectedInternalAssignments[agent], ...external])].sort();
  const actual = [...permissions.entries()].filter(([name, effect]) => name !== '*' && effect === 'allow').map(([name]) => name).sort();
  assert.deepEqual(actual, expected, 'Skill allow-list differs from catalogue for ' + agent);
}

const publicConfigFiles = [
  'opencode.json',
  ...agentFiles.map((name) => join('.opencode', 'agents', name)),
  ...skillDirs.map((name) => join('.opencode', 'skills', name, 'SKILL.md')),
];
const joined = publicConfigFiles.map((file) => readFileSync(join(root, file), 'utf8')).join('\n');
assert.doesNotMatch(joined, /nvapi-[A-Za-z0-9_-]{20,}/);
assert.doesNotMatch(joined, /gh[pousr]_[A-Za-z0-9]{20,}/);
assert.doesNotMatch(joined, /github_pat_[A-Za-z0-9_]{20,}/);

if (process.env.OPENCODE_RUNTIME_TEST === '1') {
  const agents = spawnSync('opencode', ['agent', 'list'], { encoding: 'utf8', timeout: 45_000 });
  assert.equal(agents.status, 0, 'OpenCode agent discovery failed: ' + (agents.stderr || agents.stdout));
  const agentOutput = agents.stdout + '\n' + agents.stderr;
  for (const agent of expectedAgents) assert.ok(agentOutput.includes(agent), 'OpenCode did not discover agent ' + agent);

  // OpenCode resolves each allowed skill to a scoped project path in the effective agent permissions.
  // Verify each role independently instead of assuming debug skill uses the project default agent.
  for (const agent of expectedAgents) {
    const debug = spawnSync('opencode', ['debug', 'agent', agent], { encoding: 'utf8', timeout: 45_000 });
    assert.equal(debug.status, 0, 'OpenCode could not resolve agent ' + agent + ': ' + (debug.stderr || debug.stdout));
    const resolved = JSON.parse(debug.stdout) as {
      name?: string;
      mode?: string;
      permission?: Array<{ permission?: string; pattern?: string; action?: string }>;
    };
    assert.equal(resolved.name, agent, 'OpenCode resolved the wrong agent');
    assert.ok(Array.isArray(resolved.permission), 'OpenCode did not expose resolved permissions for ' + agent);

    const allowedExternal = catalog.skills.filter((skill) => skill.assigned_agents.includes(agent)).map((skill) => skill.id);
    const allowedAll = [...new Set([...expectedInternalAssignments[agent], ...allowedExternal])];
    const externalRules = resolved.permission.filter((rule) => rule.permission === 'external_directory' && rule.action === 'allow');
    for (const name of allowedAll) {
      const expectedPath = join(root, '.opencode', 'skills', name, '*');
      assert.ok(
        externalRules.some((rule) => rule.pattern === expectedPath),
        'OpenCode did not grant ' + agent + ' access to assigned skill ' + name,
      );
    }

    const deniedExternal = catalog.skills.filter((skill) => !skill.assigned_agents.includes(agent)).map((skill) => skill.id);
    for (const name of deniedExternal) {
      const deniedPath = join(root, '.opencode', 'skills', name, '*');
      assert.ok(
        !externalRules.some((rule) => rule.pattern === deniedPath),
        'OpenCode granted ' + agent + ' access to unassigned skill ' + name,
      );
    }
  }

  // Confirm the native skill diagnostic command itself starts and returns valid JSON.
  const skills = spawnSync('opencode', ['debug', 'skill'], { encoding: 'utf8', timeout: 45_000 });
  assert.equal(skills.status, 0, 'OpenCode skill diagnostic failed: ' + (skills.stderr || skills.stdout));
  const skillOutput = JSON.parse(skills.stdout) as Array<{ name?: string; description?: string }>;
  assert.ok(Array.isArray(skillOutput), 'OpenCode skill diagnostic did not return a skill list');
  assert.ok(skillOutput.every((skill) => typeof skill.name === 'string' && typeof skill.description === 'string'));

  console.log('OpenCode resolved all eight agents and their scoped skill permissions.');
}
console.log('Agent configuration verified: 8 agents, 100 external + 9 first-party skills, and 6 MCP servers.');
