import test from 'node:test';
import assert from 'node:assert/strict';
import { bindBountyHunter } from '../src/bounty-hunter.js';

test('bounty analysis remains available after the initial results refresh', async () => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const originalFetch = globalThis.fetch;
  let renderedHtml = '';
  let analyzeClick;
  const refreshButton = {
    disabled: false,
    textContent: '',
    addEventListener() {},
  };
  const analyzeButton = {
    dataset: { analyze: 'bounty-42' },
    addEventListener(type, handler) {
      if (type === 'click') analyzeClick = handler;
    },
  };
  const root = {
    set outerHTML(value) {
      renderedHtml = value;
    },
  };

  globalThis.document = {
    querySelector(selector) {
      if (selector === '#bh-refresh') return refreshButton;
      if (selector === '.bounty-hunter-view') return root;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-analyze]') return [analyzeButton];
      return [];
    },
  };
  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return {
        sources: [],
        activePrograms: [],
        opportunities: [{
          id: 'bounty-42',
          title: 'Regression test bounty',
          url: 'https://github.com/example/project/issues/42',
          repository: 'example/project',
          body: 'A test-only public issue lead.',
          verification: 'unverified',
        }],
        discovery: { status: 'ok', message: 'One unverified lead found.' },
        generatedAt: new Date().toISOString(),
      };
    },
  });

  try {
    let analyzed = null;
    bindBountyHunter({
      onAnalyze(item) {
        analyzed = item;
      },
    });

    await new Promise((resolve) => setImmediate(resolve));

    assert.match(renderedHtml, /data-analyze="bounty-42"/);
    assert.equal(typeof analyzeClick, 'function', 'the refreshed card must have a click handler');

    analyzeClick();

    assert.equal(analyzed?.id, 'bounty-42');
    assert.equal(analyzed?.title, 'Regression test bounty');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});
