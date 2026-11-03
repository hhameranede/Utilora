import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { TOOLS_REGISTRY, TOOLS_LIST } from '../registry/tools.registry';
import { CATEGORIES_REGISTRY, CATEGORIES_LIST } from '../registry/categories.registry';
import { parseRoute, buildRoutePath } from '../router/matcher';

test('Tool Registry contains exactly 36 tools', () => {
  assert.equal(TOOLS_LIST.length, 36, 'Expected exactly 36 tools in registry');
  assert.equal(Object.keys(TOOLS_REGISTRY).length, 36);
});


test('every engine contract reference resolves to an exported symbol', async () => {
  const sourceCache = new Map<string, string>();

  for (const tool of TOOLS_LIST) {
    const [sourcePath, symbolName] = tool.engineContractRef.split('#');
    assert.ok(sourcePath && symbolName, tool.slug + ' must define a file#symbol engine contract reference');

    let source = sourceCache.get(sourcePath);
    if (!source) {
      source = await readFile(resolve(process.cwd(), sourcePath), 'utf8');
      sourceCache.set(sourcePath, source);
    }

    const exportPrefixes = ['export const ', 'export function ', 'export class ', 'export interface ', 'export type '];
    const isExported = exportPrefixes.some((prefix) => source!.includes(prefix + symbolName));
    assert.ok(isExported, tool.slug + ' points to missing export ' + symbolName + ' in ' + sourcePath);
  }
});

test('Category Registry contains exactly 6 categories', () => {
  assert.equal(CATEGORIES_LIST.length, 6, 'Expected exactly 6 categories in registry');
});

test('Every tool belongs to an existing category', () => {
  for (const tool of TOOLS_LIST) {
    assert.ok(
      CATEGORIES_REGISTRY[tool.category],
      `Tool ${tool.slug} has invalid category: ${tool.category}`
    );
  }
});

test('Tool distribution matches specified counts per category', () => {
  const counts: Record<string, number> = {};
  for (const tool of TOOLS_LIST) {
    counts[tool.category] = (counts[tool.category] || 0) + 1;
  }

  assert.equal(counts['image'], 6, 'Image Tools should have 6 tools');
  assert.equal(counts['pdf'], 6, 'PDF Tools should have 6 tools');
  assert.equal(counts['text'], 6, 'Text Tools should have 6 tools');
  assert.equal(counts['developer'], 7, 'Developer Tools should have 7 tools');
  assert.equal(counts['website-domain'], 5, 'Website & Domain should have 5 tools');
  assert.equal(counts['video'], 6, 'Video Tools should have 6 tools');
});

test('Every tool has a valid template from the 16 templates', () => {
  const validTemplates = new Set([
    'template-a-single-file',
    'template-b-multi-file',
    'template-c-image-workspace',
    'template-d-pdf-workspace',
    'template-e-text-editor',
    'template-f-two-panel-compare',
    'template-g-code-editor',
    'template-h-encoder-decoder',
    'template-i-generator',
    'template-j-domain-lookup',
    'template-k-dns-lookup',
    'template-l-website-diagnostics',
    'template-m-video-editor',
    'template-n-media-converter',
    'template-o-media-metadata',
    'template-p-thumbnail-extractor',
  ]);

  for (const tool of TOOLS_LIST) {
    assert.ok(
      validTemplates.has(tool.template),
      `Tool ${tool.slug} has invalid template: ${tool.template}`
    );
  }
});

test('Router matches home, categories, tools, and dev-templates paths', () => {
  // Home
  const rHome = parseRoute('/en');
  assert.equal(rHome.type, 'home');
  assert.equal(rHome.locale, 'en');

  // Arabic Home
  const rArHome = parseRoute('/ar');
  assert.equal(rArHome.type, 'home');
  assert.equal(rArHome.locale, 'ar');

  // Category
  const rCat = parseRoute('/en/categories/image');
  assert.equal(rCat.type, 'category');
  assert.equal(rCat.categorySlug, 'image');

  // Tool
  const rTool = parseRoute('/en/tools/merge-pdf');
  assert.equal(rTool.type, 'tool');
  assert.equal(rTool.toolSlug, 'merge-pdf');

  // Visual how-to guide route
  const guide = parseRoute('/ar/tools/image-converter/how-to');
  assert.equal(guide.type, 'tool-guide');
  assert.equal(guide.toolSlug, 'image-converter');
  assert.equal(buildRoutePath('ar', 'tool-guide', 'image-converter'), '/ar/tools/image-converter/how-to');

  // The removed community/forum is no longer a routable feature
  assert.equal(parseRoute('/en/community').type, 'not-found');
  assert.equal(parseRoute('/ar/community/topic/example').type, 'not-found');

  // Internal Lab
  const rDev = parseRoute('/dev/templates');
  assert.equal(rDev.type, 'dev-templates');

  // Curated workflow routes preserve the selected locale and slug.
  const workflow = parseRoute('/fr/workflows/prepare-images-for-web');
  assert.equal(workflow.type, 'workflow');
  assert.equal(workflow.workflowSlug, 'prepare-images-for-web');
  assert.equal(buildRoutePath('fr', 'workflow', 'prepare-images-for-web'), '/fr/workflows/prepare-images-for-web');
  assert.equal(parseRoute('/ar/workflows').type, 'workflows-index');
  assert.equal(parseRoute('/en/workflows/not-a-real-workflow').type, 'not-found');

  // Nonexistent tool -> 404
  const rInvalid = parseRoute('/en/tools/nonexistent-tool-xyz');
  assert.equal(rInvalid.type, 'not-found');
});
