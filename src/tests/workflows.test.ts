import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { TOOLS_LIST, getToolBySlug } from '../registry/tools.registry';
import { WORKFLOWS_LIST, WORKFLOW_UI, getWorkflowBySlug } from '../registry/workflows.registry';

test('every curated workflow has task-specific copy in all supported languages', () => {
  assert.equal(WORKFLOWS_LIST.length, 6);
  assert.equal(Object.keys(WORKFLOW_UI).length, SUPPORTED_LANGUAGES.length);

  for (const workflow of WORKFLOWS_LIST) {
    assert.equal(getWorkflowBySlug(workflow.slug)?.slug, workflow.slug);
    assert.ok(workflow.toolSlugs.length >= 3, workflow.slug + ' should connect multiple real tools');

    for (const language of SUPPORTED_LANGUAGES) {
      const copy = workflow.localized[language.code];
      assert.ok(copy, workflow.slug + ' is missing ' + language.code);
      const minimum = language.code === 'zh'
        ? { title: 6, description: 22, introduction: 38, outcome: 18, note: 20 }
        : { title: 8, description: 35, introduction: 60, outcome: 25, note: 25 };
      assert.ok(copy.title.trim().length >= minimum.title, workflow.slug + ' needs a localized title in ' + language.code);
      assert.ok(copy.description.trim().length >= minimum.description, workflow.slug + ' needs a localized description in ' + language.code);
      assert.ok(copy.introduction.trim().length >= minimum.introduction, workflow.slug + ' needs a useful introduction in ' + language.code);
      assert.ok(copy.outcome.trim().length >= minimum.outcome, workflow.slug + ' needs a clear outcome in ' + language.code);
      assert.ok(copy.note.trim().length >= minimum.note, workflow.slug + ' needs a practical caveat in ' + language.code);
    }

    for (const slug of workflow.toolSlugs) {
      const tool = getToolBySlug(slug);
      assert.ok(tool, workflow.slug + ' references missing tool ' + slug);
      assert.equal(tool?.status, 'functional', workflow.slug + ' must not reference a preview-only tool');
      assert.ok(TOOLS_LIST.includes(tool!), workflow.slug + ' references a tool outside the registry');
    }
  }
});
