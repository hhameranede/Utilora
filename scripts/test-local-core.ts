import assert from 'node:assert/strict';
import {
  convertTextCase,
  createTextDiff,
  decodeBase64Utf8,
  encodeBase64Utf8,
  generateDigest,
  generateUuid,
  getTextMetrics,
  processJson,
  removeDuplicateTextLines,
  sortTextLines,
  transformUrl,
} from '../src/engines/local-core';

function run(name: string, operation: () => void | Promise<void>) {
  return Promise.resolve().then(operation).then(() => {
    process.stdout.write(`✓ ${name}\n`);
  });
}

await run('counts Arabic and Latin text without losing Unicode characters', () => {
  const metrics = getTextMetrics('Hello مرحبا\nUTILORA');
  assert.equal(metrics.words, 3);
  assert.equal(metrics.lines, 2);
  assert.equal(metrics.charactersTotal, Array.from('Hello مرحبا\nUTILORA').length);
  assert.equal(getTextMetrics('Hi🙂!').punctuation, 1);
  assert.equal(getTextMetrics('Hi🙂!').charactersTotal, 4);
});

await run('converts text cases', () => {
  assert.equal(convertTextCase('hello WORLD', 'upper'), 'HELLO WORLD');
  assert.equal(convertTextCase('hello world', 'snake'), 'hello_world');
  assert.equal(convertTextCase('hello world', 'camel'), 'helloWorld');
  assert.equal(convertTextCase('hello-world / utilora', 'title'), 'Hello-World / Utilora');
  assert.equal(convertTextCase("don't stop — BELIEVE", 'title'), "Don't Stop — Believe");
  assert.equal(convertTextCase('hello. world! next', 'sentence'), 'Hello. World! Next');
});

await run('removes duplicate lines with case and whitespace rules', () => {
  const result = removeDuplicateTextLines(' Alpha \nalpha\nBeta', {
    caseSensitive: false,
    trimWhitespace: true,
    removeEmptyLines: false,
  });
  assert.equal(result.text, 'Alpha\nBeta');
  assert.equal(result.duplicatesRemoved, 1);
});

await run('sorts lines by length and numeric order', () => {
  assert.equal(sortTextLines('long\nx\nmid', 'length'), 'x\nmid\nlong');
  assert.equal(sortTextLines('10\n2\n1', 'numeric'), '1\n2\n10');
  assert.equal(sortTextLines('abc\n🙂a', 'length'), '🙂a\nabc');
});

await run('creates diff blocks from user text', () => {
  const result = createTextDiff('alpha\nbeta', 'alpha\ngamma', 'lines');
  assert.equal(result.additions, 1);
  assert.equal(result.deletions, 1);
  assert.ok(result.blocks.some((block) => block.type === 'added' && block.value === 'gamma'));
  assert.ok(result.blocks.some((block) => block.type === 'removed' && block.value === 'beta'));
});

await run('formats, validates, and minifies JSON', () => {
  assert.equal(processJson('{"a":1}', 'format', 2).output, '{\n  "a": 1\n}');
  assert.equal(processJson('{"a":1}', 'validate', 2).valid, true);
  assert.equal(processJson('{ "a" : 1 }', 'minify', 2).output, '{"a":1}');
  assert.throws(() => processJson('{bad}', 'format', 2), SyntaxError);
});

await run('encodes and decodes Arabic Base64 using UTF-8', () => {
  const source = 'UTILORA مرحباً';
  assert.equal(decodeBase64Utf8(encodeBase64Utf8(source)), source);
});

await run('encodes and decodes URL components', () => {
  const source = 'search terms & مرحبا';
  assert.equal(transformUrl(transformUrl(source, 'encode'), 'decode'), source);
});

await run('generates UUID v4 and v7 values with correct version and variant bits', () => {
  const v4 = generateUuid('v4');
  const v7 = generateUuid('v7');
  assert.match(v4, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.match(v7, /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

await run('computes a known SHA-256 digest', async () => {
  assert.equal(
    await generateDigest('abc', 'SHA-256'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
});

process.stdout.write('All local-core smoke tests passed.\n');
