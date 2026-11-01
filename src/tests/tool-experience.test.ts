import test from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS_LIST } from '../registry/tools.registry';
import { TOOL_EXPERIENCE_REGISTRY } from '../registry/tool-experience.registry';

test('every registered tool has a distinct product experience', () => {
  assert.equal(TOOLS_LIST.length, 36, 'the current catalog should contain 36 tools');

  const missing = TOOLS_LIST
    .filter((tool) => !TOOL_EXPERIENCE_REGISTRY[tool.slug])
    .map((tool) => tool.slug);
  assert.deepEqual(missing, [], 'all tool routes must have product-specific content');

  const extra = Object.keys(TOOL_EXPERIENCE_REGISTRY)
    .filter((slug) => !TOOLS_LIST.some((tool) => tool.slug === slug));
  assert.deepEqual(extra, [], 'product content must not point to unregistered tools');

  for (const tool of TOOLS_LIST) {
    const experience = TOOL_EXPERIENCE_REGISTRY[tool.slug];
    assert.ok(experience.positioning.en.trim().length >= 30, `${tool.slug} needs a meaningful English product promise`);
    assert.ok(experience.positioning.ar.trim().length >= 20, `${tool.slug} needs an Arabic product promise`);
    assert.equal(experience.benefits.en.length, 3, `${tool.slug} needs three English feature highlights`);
    assert.equal(experience.benefits.ar.length, 3, `${tool.slug} needs three Arabic feature highlights`);
    assert.equal(experience.steps.en.length, 3, `${tool.slug} needs three English workflow steps`);
    assert.equal(experience.steps.ar.length, 3, `${tool.slug} needs three Arabic workflow steps`);
    assert.ok(experience.example.en.trim().length >= 25, `${tool.slug} needs a practical English use case`);
    assert.ok(experience.example.ar.trim().length >= 15, `${tool.slug} needs a practical Arabic use case`);
  }

  const promises = TOOLS_LIST.map((tool) => TOOL_EXPERIENCE_REGISTRY[tool.slug].positioning.en);
  assert.equal(new Set(promises).size, TOOLS_LIST.length, 'each tool should have its own positioning statement');
});

test('preview-only tools are not described as working processors', () => {
  const downloader = TOOL_EXPERIENCE_REGISTRY['video-downloader'];
  assert.ok(downloader.positioning.en.toLowerCase().includes('preview'));
  assert.ok(downloader.benefits.en.some((item) => item.toLowerCase().includes('not enabled')));
});
