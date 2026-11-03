import test from 'node:test';
import assert from 'node:assert/strict';
import { auditHtmlDocument, parseSitemapXml, validateSitemapEntries, type AuditFinding } from './seo-audit';

const locales = ['en', 'ar'];
const origin = 'https://example.test';

function validHtml(): string {
  return '<html lang="en" dir="ltr"><head>' +
    '<title>Example online utility tool | UTILORA</title>' +
    '<meta name="description" content="A useful online utility tool that performs one clear task quickly and securely." />' +
    '<meta name="robots" content="index, follow" />' +
    '<link rel="canonical" href="' + origin + '/en/example" />' +
    '<link rel="alternate" hreflang="en" href="' + origin + '/en/example" />' +
    '<link rel="alternate" hreflang="ar" href="' + origin + '/ar/example" />' +
    '<link rel="alternate" hreflang="x-default" href="' + origin + '/en/example" />' +
    '<meta property="og:url" content="' + origin + '/en/example" />' +
    '<meta property="og:image" content="' + origin + '/og-utilora.svg" />' +
    '<meta name="twitter:card" content="summary_large_image" />' +
    '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite"}</script>' +
    '</head><body><div id="root"><main><h1>Example tool</h1><p>Rendered page content.</p></main></div></body></html>';
}

function validSitemap(): string {
  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    '<url><loc>' + origin + '/en/example</loc>' +
    '<xhtml:link rel="alternate" hreflang="en" href="' + origin + '/en/example" />' +
    '<xhtml:link rel="alternate" hreflang="ar" href="' + origin + '/ar/example" />' +
    '<xhtml:link rel="alternate" hreflang="x-default" href="' + origin + '/en/example" />' +
    '</url></urlset>';
}

test('parses sitemap URLs and namespaced hreflang links', () => {
  const parsed = parseSitemapXml(validSitemap());
  assert.equal(parsed.root.name, 'urlset');
  assert.equal(parsed.entries.length, 1);
  assert.equal(parsed.entries[0].location, origin + '/en/example');
  assert.deepEqual(parsed.entries[0].alternates.map((item) => item.language), ['en', 'ar', 'x-default']);
});

test('rejects mismatched or unclosed XML elements', () => {
  assert.throws(
    () => parseSitemapXml('<urlset><url><loc>https://example.test/en</loc></urlset>'),
    /Mismatched XML closing tag|not closed/,
  );
});

test('validates reciprocal hreflang entries and detects a missing locale', () => {
  const actual = parseSitemapXml(validSitemap()).entries;
  const expected = parseSitemapXml(validSitemap()).entries;
  const findings: AuditFinding[] = [];
  validateSitemapEntries(actual, expected, origin, locales, findings);
  assert.equal(findings.filter((finding) => finding.level === 'error').length, 0);

  const incomplete = [{ ...actual[0], alternates: actual[0].alternates.filter((item) => item.language !== 'ar') }];
  const broken: AuditFinding[] = [];
  validateSitemapEntries(incomplete, expected, origin, locales, broken);
  assert.ok(broken.some((finding) => finding.code === 'SITEMAP_HREFLANG_COUNT'));
  assert.ok(broken.some((finding) => finding.code === 'SITEMAP_HREFLANG_MISMATCH'));
});

test('accepts a prerendered page with canonical, hreflang, robots, and JSON-LD', () => {
  const findings: AuditFinding[] = [];
  auditHtmlDocument(validHtml(), {
    siteOrigin: origin,
    routePath: '/en/example',
    locales,
    indexable: true,
  }, findings);
  assert.deepEqual(findings.filter((finding) => finding.level === 'error'), []);
});

test('detects duplicate canonicals and incorrect robots directives', () => {
  const broken = validHtml()
    .replace('</head>', '<link rel="canonical" href="' + origin + '/en/another" /></head>')
    .replace('content="index, follow"', 'content="noindex, nofollow"');
  const findings: AuditFinding[] = [];
  auditHtmlDocument(broken, {
    siteOrigin: origin,
    routePath: '/en/example',
    locales,
    indexable: true,
  }, findings);
  assert.ok(findings.some((finding) => finding.code === 'HTML_CANONICAL_COUNT'));
  assert.ok(findings.some((finding) => finding.code === 'HTML_ROBOTS_MISMATCH'));
});

test('uses localized length guidance and skips non-indexable documents', () => {
  const noindexFindings: AuditFinding[] = [];
  auditHtmlDocument(validHtml().replace('index, follow','noindex, nofollow'), {
    siteOrigin: origin,
    routePath: '/en/example',
    locales,
    indexable: false,
  }, noindexFindings);
  assert.equal(noindexFindings.some((finding) => finding.code === 'HTML_TITLE_LENGTH' || finding.code === 'HTML_DESCRIPTION_LENGTH'), false);

  const chineseOrigin = 'https://example.test';
  const chineseHtml = '<html lang="zh" dir="ltr"><head>' +
    '<title>在线图像压缩工具</title>' +
    '<meta name="description" content="快速压缩图像文件，调整输出质量，并比较压缩前后的文件大小。" />' +
    '<meta name="robots" content="index, follow" />' +
    '<link rel="canonical" href="' + chineseOrigin + '/zh/image-compressor" />' +
    '<link rel="alternate" hreflang="en" href="' + chineseOrigin + '/en/image-compressor" />' +
    '<link rel="alternate" hreflang="zh" href="' + chineseOrigin + '/zh/image-compressor" />' +
    '<link rel="alternate" hreflang="x-default" href="' + chineseOrigin + '/en/image-compressor" />' +
    '<meta property="og:url" content="' + chineseOrigin + '/zh/image-compressor" />' +
    '<meta property="og:image" content="' + chineseOrigin + '/og-utilora.svg" />' +
    '<meta name="twitter:card" content="summary_large_image" />' +
    '<script type="application/ld+json">{"@context":"https://schema.org","@type":"SoftwareApplication"}</script>' +
    '</head><body><div id="root"><main><h1>工具</h1><p>内容</p></main></div></body></html>';
  const chineseFindings: AuditFinding[] = [];
  auditHtmlDocument(chineseHtml, {
    siteOrigin: chineseOrigin,
    routePath: '/zh/image-compressor',
    locales: ['en', 'zh'],
    indexable: true,
  }, chineseFindings);
  assert.equal(chineseFindings.some((finding) => finding.code === 'HTML_TITLE_LENGTH' || finding.code === 'HTML_DESCRIPTION_LENGTH'), false);
});
