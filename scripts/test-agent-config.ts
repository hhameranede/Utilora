import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

type McpServer = { type?: string; url?: string; command?: string[]; enabled?: boolean };
type SkillRecord = {
  name: string;
  path: string;
  assignedTo: string[];
  source: {
    type: string;
    repository: string;
    commit: string;
    path: string;
    license: string;
    copyright: string;
  };
};
type SkillManifest = {
  version: number;
  totalSkillCount: number;
  projectSpecificCount: number;
  curatedExternalCount: number;
  agents: string[];
  assignmentsByAgent: Record<string, string[]>;
  modelAssignments: Record<string, string>;
  skills: SkillRecord[];
};
type ProviderModel = {
  id?: string;
  name?: string;
  limit?: { context?: number; output?: number };
  modalities?: { input?: string[]; output?: string[] };
};
type OpenCodeProvider = {
  npm?: string;
  name?: string;
  options?: { baseURL?: string; apiKey?: string };
  models?: Record<string, ProviderModel>;
};

const root = process.cwd();
const config = JSON.parse(readFileSync(join(root, 'opencode.json'), 'utf8')) as {
  $schema?: string; default_agent?: string; mcp?: Record<string, McpServer>;
  provider?: Record<string, OpenCodeProvider>;
};
assert.equal(config.$schema, 'https://opencode.ai/config.json');
assert.ok(config.mcp);
assert.equal(config.default_agent, 'project-lead', 'Project lead must be the default primary agent');

const nvidia = config.provider?.['nvidia-nim'];
assert.ok(nvidia, 'Missing shared NVIDIA NIM provider');
assert.equal(nvidia.npm, '@ai-sdk/openai-compatible');
assert.equal(nvidia.options?.baseURL, 'https://integrate.api.nvidia.com/v1');
assert.equal(nvidia.options?.apiKey, '{env:NVIDIA_API_KEY}', 'NVIDIA key must be injected from the runtime environment');
const expectedModelIds: Record<string, string> = {
  'nemotron-ultra': 'nvidia/nemotron-3-ultra-550b-a55b',
  'deepseek-v4-1-flash': 'deepseek-ai/deepseek-v4.1-flash',
  'minimax-m3-1-flash': 'minimaxai/minimax-m3.1-flash',
  'glm-5-3-flash': 'z-ai/glm-5.3-flash',
  'nemotron-super-vl': 'nvidia/nemotron-3.5-super-vl-120b-a12b',
  'laguna-xs-2-1': 'poolside/laguna-xs-2.1',
};
assert.deepEqual(Object.keys(nvidia.models ?? {}).sort(), Object.keys(expectedModelIds).sort());
for (const [alias, id] of Object.entries(expectedModelIds)) {
  assert.equal(nvidia.models?.[alias]?.id, id, 'Unexpected NVIDIA model mapping for ' + alias);
}
assert.deepEqual(
  nvidia.models?.['nemotron-super-vl']?.modalities,
  { input: ['text', 'image'], output: ['text'] },
  'The Visual Reviewer model must advertise image input to OpenCode',
);

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
  'project-lead', 'problem-analyst', 'implementation-engineer', 'fast-task-engineer',
  'visual-reviewer', 'long-horizon-engineer', 'qa-engineer', 'security-auditor',
] as const;
const agentDir = join(root, '.opencode', 'agents');
const agentFiles = readdirSync(agentDir).filter((name) => name.endsWith('.md'));
assert.equal(agentFiles.length, expectedAgents.length, 'Expected exactly eight agent definitions');
for (const agent of expectedAgents) assert.ok(agentFiles.includes(agent + '.md'), 'Missing agent ' + agent);

const skillsDir = join(root, '.opencode', 'skills');
const skillDirs = readdirSync(skillsDir)
  .filter((name) => statSync(join(skillsDir, name)).isDirectory())
  .sort();
assert.equal(skillDirs.length, 50, 'UTILORA must contain exactly 50 skill directories');

const manifestPath = join(skillsDir, 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as SkillManifest;
assert.equal(manifest.version, 1);
assert.equal(manifest.totalSkillCount, 50);
assert.equal(manifest.projectSpecificCount, 9);
assert.equal(manifest.curatedExternalCount, 41);
assert.equal(manifest.skills.length, 50);
assert.deepEqual([...manifest.agents].sort(), [...expectedAgents].sort());
assert.deepEqual(Object.keys(manifest.modelAssignments).sort(), [...expectedAgents].sort(), 'Every agent must have exactly one model assignment');

const skillNames = manifest.skills.map((skill) => skill.name).sort();
assert.equal(new Set(skillNames).size, 50, 'Skill IDs must be unique');
assert.deepEqual(skillNames, skillDirs, 'Manifest and installed skill directories must match exactly');

const projectSkills = manifest.skills.filter((skill) => skill.source.type === 'project');
const externalSkills = manifest.skills.filter((skill) => skill.source.type === 'external');
assert.equal(projectSkills.length, 9);
assert.equal(externalSkills.length, 41);

const licenseFiles: Record<string, string> = {
  'mattpocock/skills': 'mattpocock-skills-MIT.txt',
  'obra/superpowers': 'obra-superpowers-MIT.txt',
  'addyosmani/agent-skills': 'addyosmani-agent-skills-MIT.txt',
  'coreyhaines31/marketingskills': 'coreyhaines31-marketingskills-MIT.txt',
  'addyosmani/web-quality-skills': 'addyosmani-web-quality-skills-MIT.txt',
  'cloudflare/skills': 'cloudflare-skills-Apache-2.0.txt',
  'cloudflare/security-audit-skill': 'cloudflare-security-audit-MIT.txt',
  'emilkowalski/skills': 'emilkowalski-skills-MIT.txt',
};

for (const skill of manifest.skills) {
  assert.match(skill.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid skill ID: ' + skill.name);
  assert.equal(skill.path, join('.opencode', 'skills', skill.name, 'SKILL.md'), 'Manifest path mismatch: ' + skill.name);
  assert.ok(skill.assignedTo.length > 0, 'Skill is not assigned: ' + skill.name);
  assert.equal(new Set(skill.assignedTo).size, skill.assignedTo.length, 'Duplicate agent assignment: ' + skill.name);

  const skillPath = join(root, skill.path);
  const raw = readFileSync(skillPath, 'utf8');
  const lines = readFrontmatter(skillPath, skill.name);
  const declaredName = lines.find((line) => line.startsWith('name:'))?.slice(5).trim().replace(/^["']|["']$/g, '');
  assert.equal(declaredName, skill.name, 'Skill folder and frontmatter names differ: ' + skill.name);
  const description = lines.find((line) => line.startsWith('description:'))?.slice(12).trim();
  assert.ok(description && description.length > 0 && description.length <= 1024, 'Invalid description in ' + skill.name);

  if (skill.source.type === 'external') {
    assert.match(skill.source.commit, /^[a-f0-9]{40}$/, 'External skill revision is not pinned: ' + skill.name);
    assert.ok(skill.source.repository && skill.source.path && skill.source.copyright, 'Incomplete provenance: ' + skill.name);
    assert.ok(['MIT', 'Apache-2.0'].includes(skill.source.license), 'Unapproved licence: ' + skill.name);
    assert.ok(lines.some((line) => line.trim() === 'license: ' + skill.source.license), 'Missing licence frontmatter: ' + skill.name);
    const provenance = 'Third-party source: https://github.com/' + skill.source.repository + '/blob/' + skill.source.commit + '/' + skill.source.path;
    assert.ok(raw.includes(provenance), 'Missing immutable source attribution: ' + skill.name);
    const noticeFile = licenseFiles[skill.source.repository];
    assert.ok(noticeFile, 'No licence notice mapped for ' + skill.source.repository);
    const noticeText = readFileSync(join(root, 'docs', 'agent-team', 'third-party-licenses', noticeFile), 'utf8');
    assert.ok(noticeText.length > 500, 'Missing complete upstream licence text: ' + noticeFile);
  } else {
    assert.equal(skill.source.type, 'project');
    assert.equal(skill.source.license, 'Project');
  }

  for (const agent of skill.assignedTo) {
    assert.ok(expectedAgents.includes(agent as (typeof expectedAgents)[number]), 'Unknown assigned agent: ' + agent);
    assert.ok(manifest.assignmentsByAgent[agent]?.includes(skill.name), 'Reverse assignment missing: ' + skill.name);
  }
}

for (const agentFile of agentFiles) {
  const agent = agentFile.replace(/\.md$/, '');
  const lines = readFrontmatter(join(agentDir, agentFile), agentFile);
  assert.ok(hasNonEmptyField(lines, 'description'), 'Missing description in ' + agentFile);
  const mode = lines.find((line) => line.startsWith('mode:'))?.slice(5).trim();
  assert.ok(mode === 'primary' || mode === 'subagent', 'Invalid mode in ' + agentFile);
  const agentModel = lines.find((line) => line.startsWith('model:'))?.slice(6).trim();
  assert.equal(agentModel, manifest.modelAssignments[agent], 'Wrong model assignment for ' + agent);
  assert.ok(
    Object.keys(nvidia.models ?? {}).some((alias) => agentModel === 'nvidia-nim/' + alias),
    'Agent model alias is not registered for ' + agent,
  );

  const permissions = parseSkillPermissions(lines, agentFile);
  const allowed = [...permissions.entries()]
    .filter(([name, effect]) => name !== '*' && effect === 'allow')
    .map(([name]) => name)
    .sort();
  const expected = [...(manifest.assignmentsByAgent[agent] ?? [])].sort();
  assert.deepEqual(allowed, expected, 'Skill allow-list differs from manifest for ' + agent);
  assert.equal(permissions.size, expected.length + 1, 'Unexpected permission for ' + agent);
}

for (const agent of expectedAgents) {
  const assigned = manifest.skills.filter((skill) => skill.assignedTo.includes(agent)).map((skill) => skill.name).sort();
  assert.deepEqual(
    [...(manifest.assignmentsByAgent[agent] ?? [])].sort(),
    assigned,
    'Manifest reverse index mismatch for ' + agent,
  );
}

const publicConfigFiles = [
  'opencode.json',
  ...agentFiles.map((name) => join('.opencode', 'agents', name)),
  ...skillDirs.map((name) => join('.opencode', 'skills', name, 'SKILL.md')),
  join('.opencode', 'skills', 'manifest.json'),
];
const joined = publicConfigFiles.map((file) => readFileSync(join(root, file), 'utf8')).join('\n');
assert.doesNotMatch(joined, /nvapi-[A-Za-z0-9_-]{20,}/);
assert.doesNotMatch(joined, /gh[pousr]_[A-Za-z0-9]{20,}/);
assert.doesNotMatch(joined, /github_pat_[A-Za-z0-9_]{20,}/);

if (process.env.OPENCODE_RUNTIME_TEST === '1') {
  const resolvedConfigCommand = spawnSync('opencode', ['debug', 'config'], { encoding: 'utf8', timeout: 45_000 });
  assert.equal(resolvedConfigCommand.status, 0, 'OpenCode could not resolve project config: ' + (resolvedConfigCommand.stderr || resolvedConfigCommand.stdout));
  const resolvedProjectConfig = JSON.parse(resolvedConfigCommand.stdout) as { default_agent?: string };
  assert.equal(resolvedProjectConfig.default_agent, 'project-lead', 'OpenCode did not load project-lead as the default agent');

  const agentCommand = spawnSync('opencode', ['agent', 'list'], { encoding: 'utf8', timeout: 45_000 });
  assert.equal(agentCommand.status, 0, 'OpenCode agent listing failed: ' + (agentCommand.stderr || agentCommand.stdout));
  const agentOutput = agentCommand.stdout + '\n' + agentCommand.stderr;
  for (const agent of expectedAgents) assert.ok(agentOutput.includes(agent), 'OpenCode did not discover ' + agent);

  // Resolve each agent independently and validate the effective skill permission rules.
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

    const allowedAll = manifest.skills.filter((skill) => skill.assignedTo.includes(agent)).map((skill) => skill.name);
    const skillRules = resolved.permission.filter((rule) => rule.permission === 'skill');
    assert.ok(
      skillRules.some((rule) => rule.pattern === '*' && rule.action === 'deny'),
      'OpenCode must deny unlisted skills for ' + agent,
    );
    for (const name of allowedAll) {
      assert.ok(
        skillRules.some((rule) => rule.pattern === name && rule.action === 'allow'),
        'OpenCode did not allow assigned skill ' + name + ' for ' + agent,
      );
    }

    const denied = manifest.skills.filter((skill) => !skill.assignedTo.includes(agent)).map((skill) => skill.name);
    for (const name of denied) {
      assert.ok(
        !skillRules.some((rule) => rule.pattern === name && rule.action === 'allow'),
        'OpenCode explicitly allowed unassigned skill ' + name + ' for ' + agent,
      );
    }
  }

  const skills = spawnSync('opencode', ['debug', 'skill'], { encoding: 'utf8', timeout: 45_000 });
  assert.equal(skills.status, 0, 'OpenCode skill diagnostic failed: ' + (skills.stderr || skills.stdout));
  // The command emits full skill contents; CI output limits may truncate its JSON body.
  // Per-agent availability is checked above using the resolved, effective skill permission rules.
  assert.ok(skills.stdout.trimStart().startsWith('['), 'OpenCode skill diagnostic did not return its JSON list');
  assert.ok(skills.stdout.includes('"name":'), 'OpenCode skill diagnostic returned no skill entries');
  console.log('OpenCode resolved all eight agents and their scoped skill permissions.');
}
console.log('Agent configuration verified: 8 model-specialized agents, exactly 50 skills (9 first-party + 41 upstream), 6 NVIDIA NIM models, and ' + Object.keys(config.mcp).length + ' MCP servers.');
