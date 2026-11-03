import { appendFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SUPPORTED_LANGUAGES } from '../src/i18n';
import { SAMPLE_ARTICLES } from '../src/data/articles.data';
import { CATEGORIES_LIST } from '../src/registry/categories.registry';
import { TOOLS_LIST } from '../src/registry/tools.registry';
import { buildRoutePath } from '../src/router/matcher';
import { generateProductionSitemap } from '../src/seo/sitemap';

export type FindingLevel = 'error' | 'warning';
export interface AuditFinding {
  level: FindingLevel;
  code: string;
  message: string;
  path?: string;
}
interface XmlNode {
  name: string;
  attributes: Record<string, string>;
  text: string;
  children: XmlNode[];
}
export interface SitemapEntry {
  location: string;
  alternates: Array<{ language: string; href: string }>;
}
export interface HtmlAuditContext {
  siteOrigin: string;
  routePath: string;
  locales: string[];
  indexable: boolean;
}
export interface SeoAuditReport {
  siteOrigin: string;
  summary: {
    tools: number;
    functionalTools: number;
    categories: number;
    locales: number;
    prerenderedRoutes: number;
    sitemapUrls: number;
    errors: number;
    warnings: number;
  };
  findings: AuditFinding[];
}

function decodeXml(value: string): string {
  if (/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-f]+;)/i.test(value)) {
    throw new Error('XML contains an unescaped or unsupported entity.');
  }
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, token: string) => {
    if (token[0] === '#') {
      const point = token[1].toLowerCase() === 'x'
        ? Number.parseInt(token.slice(2), 16)
        : Number.parseInt(token.slice(1), 10);
      if (!Number.isFinite(point) || point < 0 || point > 0x10ffff) {
        throw new Error('XML contains an invalid numeric character reference.');
      }
      return String.fromCodePoint(point);
    }
    return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" } as Record<string, string>)[token.toLowerCase()];
  });
}

function findTagEnd(xml: string, start: number): number {
  let quote: '"' | "'" | null = null;
  for (let index = start; index < xml.length; index += 1) {
    const character = xml[index];
    if (quote) {
      if (character === quote) quote = null;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '>') {
      return index;
    }
  }
  throw new Error('XML contains an unterminated tag.');
}

function parseStartTag(tag: string): { name: string; attributes: Record<string, string>; selfClosing: boolean } {
  const opening = /^<([A-Za-z_][A-Za-z0-9_.:-]*)/.exec(tag);
  if (!opening) throw new Error('XML contains an invalid opening tag.');
  const name = opening[1];
  let cursor = opening[0].length;
  const end = tag.length - 1;
  const attributes: Record<string, string> = {};
  let selfClosing = false;

  while (cursor < end) {
    while (cursor < end && /\s/.test(tag[cursor])) cursor += 1;
    if (cursor >= end) break;
    if (tag[cursor] === '/') {
      selfClosing = true;
      cursor += 1;
      while (cursor < end && /\s/.test(tag[cursor])) cursor += 1;
      if (cursor !== end) throw new Error('Unexpected content in XML tag ' + name + '.');
      break;
    }

    const match = /^[A-Za-z_][A-Za-z0-9_.:-]*/.exec(tag.slice(cursor));
    if (!match) throw new Error('Invalid XML attribute in ' + name + '.');
    const attributeName = match[0];
    cursor += attributeName.length;
    while (cursor < end && /\s/.test(tag[cursor])) cursor += 1;
    if (tag[cursor] !== '=') throw new Error('Missing equals sign after XML attribute ' + attributeName + '.');
    cursor += 1;
    while (cursor < end && /\s/.test(tag[cursor])) cursor += 1;
    const quote = tag[cursor];
    if (quote !== '"' && quote !== "'") throw new Error('XML attribute ' + attributeName + ' must be quoted.');
    cursor += 1;
    const start = cursor;
    while (cursor < end && tag[cursor] !== quote) cursor += 1;
    if (cursor >= end) throw new Error('Unterminated XML attribute ' + attributeName + '.');
    if (Object.hasOwn(attributes, attributeName)) throw new Error('Duplicate XML attribute ' + attributeName + '.');
    attributes[attributeName] = decodeXml(tag.slice(start, cursor));
    cursor += 1;
  }
  return { name, attributes, selfClosing };
}

/** Strict, dependency-free XML validation for the sitemap document. */
export function parseSitemapXml(xml: string): { root: XmlNode; entries: SitemapEntry[] } {
  if (!xml.trim()) throw new Error('Sitemap is empty.');
  const stack: XmlNode[] = [];
  let root: XmlNode | null = null;
  let cursor = 0;

  while (cursor < xml.length) {
    if (xml.startsWith('<!--', cursor)) {
      const end = xml.indexOf('-->', cursor + 4);
      if (end < 0) throw new Error('XML contains an unterminated comment.');
      cursor = end + 3;
      continue;
    }
    if (xml.startsWith('<?', cursor)) {
      const end = xml.indexOf('?>', cursor + 2);
      if (end < 0) throw new Error('XML contains an unterminated processing instruction.');
      cursor = end + 2;
      continue;
    }
    if (xml.startsWith('<![CDATA[', cursor)) {
      const end = xml.indexOf(']]>', cursor + 9);
      if (end < 0 || stack.length === 0) throw new Error('XML contains invalid CDATA.');
      stack[stack.length - 1].text += xml.slice(cursor + 9, end);
      cursor = end + 3;
      continue;
    }
    if (xml[cursor] === '<') {
      const end = findTagEnd(xml, cursor);
      const tag = xml.slice(cursor, end + 1);
      if (/^<!DOCTYPE/i.test(tag) || /^<!ENTITY/i.test(tag)) {
        throw new Error('Sitemap must not contain a DOCTYPE or custom entity declarations.');
      }
      if (tag.startsWith('</')) {
        const closing = /^<\/([A-Za-z_][A-Za-z0-9_.:-]*)\s*>$/.exec(tag);
        if (!closing) throw new Error('XML contains an invalid closing tag.');
        const current = stack.pop();
        if (!current || current.name !== closing[1]) {
          throw new Error('Mismatched XML closing tag: ' + closing[1] + '.');
        }
      } else {
        const parsed = parseStartTag(tag);
        const node: XmlNode = { name: parsed.name, attributes: parsed.attributes, text: '', children: [] };
        if (stack.length) stack[stack.length - 1].children.push(node);
        else if (!root) root = node;
        else throw new Error('XML contains more than one root element.');
        if (!parsed.selfClosing) stack.push(node);
      }
      cursor = end + 1;
      continue;
    }
    const next = xml.indexOf('<', cursor);
    const end = next < 0 ? xml.length : next;
    const value = xml.slice(cursor, end);
    if (!stack.length && value.trim()) throw new Error('XML contains text outside its root element.');
    if (stack.length) stack[stack.length - 1].text += decodeXml(value);
    cursor = end;
  }

  if (stack.length) throw new Error('XML element ' + stack[stack.length - 1].name + ' is not closed.');
  if (!root || root.name !== 'urlset') throw new Error('Sitemap root element must be <urlset>.');

  const entries: SitemapEntry[] = root.children.map((urlNode) => {
    if (urlNode.name !== 'url') throw new Error('Unexpected <' + urlNode.name + '> inside sitemap <urlset>.');
    const locations = urlNode.children.filter((child) => child.name === 'loc');
    if (locations.length !== 1 || !locations[0].text.trim()) {
      throw new Error('Every sitemap <url> must contain exactly one non-empty <loc>.');
    }
    const unexpected = urlNode.children.find((child) => child.name !== 'loc' && child.name !== 'xhtml:link');
    if (unexpected) throw new Error('Unexpected <' + unexpected.name + '> inside <url>.');
    return {
      location: locations[0].text.trim(),
      alternates: urlNode.children
        .filter((child) => child.name === 'xhtml:link')
        .map((child) => ({ language: child.attributes.hreflang || '', href: child.attributes.href || '' })),
    };
  });
  return { root, entries };
}

export function validateSitemapEntries(
  actual: SitemapEntry[],
  expected: SitemapEntry[],
  siteOrigin: string,
  locales: string[],
  findings: AuditFinding[],
): void {
  const locations = actual.map((entry) => entry.location);
  const unique = new Set(locations);
  if (unique.size !== locations.length) {
    findings.push({ level: 'error', code: 'SITEMAP_DUPLICATE_URL', message: 'Sitemap contains duplicate <loc> URLs.' });
  }
  const expectedLocations = new Set(expected.map((entry) => entry.location));

  for (const entry of actual) {
    let parsed: URL;
    try {
      parsed = new URL(entry.location);
    } catch {
      findings.push({ level: 'error', code: 'SITEMAP_INVALID_URL', message: 'Invalid absolute sitemap URL: ' + entry.location });
      continue;
    }
    if (parsed.origin !== siteOrigin || parsed.search || parsed.hash ||
        (parsed.pathname.length > 1 && parsed.pathname.endsWith('/'))) {
      findings.push({
        level: 'error',
        code: 'SITEMAP_NON_CANONICAL_URL',
        message: 'Sitemap URL must use ' + siteOrigin + ', omit query and fragment, and have no trailing slash: ' + entry.location,
      });
    }
    if (!expectedLocations.has(entry.location)) {
      findings.push({ level: 'error', code: 'SITEMAP_UNEXPECTED_URL', message: 'Unexpected URL in sitemap: ' + entry.location });
    }

    const locale = parsed.pathname.split('/').filter(Boolean)[0];
    if (!locale || !locales.includes(locale)) {
      findings.push({ level: 'error', code: 'SITEMAP_UNKNOWN_LOCALE', message: 'Unsupported locale prefix: ' + entry.location });
      continue;
    }
    const suffix = parsed.pathname.slice(locale.length + 1);
    const expectedAlternates = new Map<string, string>(
      locales.map((language) => [language, siteOrigin + '/' + language + suffix]),
    );
    expectedAlternates.set('x-default', siteOrigin + '/en' + suffix);

    const languageCodes = entry.alternates.map((alternate) => alternate.language);
    if (new Set(languageCodes).size !== languageCodes.length) {
      findings.push({ level: 'error', code: 'SITEMAP_DUPLICATE_HREFLANG', message: 'Duplicate hreflang entries for ' + entry.location + '.' });
    }
    if (entry.alternates.length !== expectedAlternates.size) {
      findings.push({
        level: 'error',
        code: 'SITEMAP_HREFLANG_COUNT',
        message: entry.location + ' must contain ' + expectedAlternates.size + ' alternate links; found ' + entry.alternates.length + '.',
      });
    }
    for (const [language, href] of expectedAlternates) {
      const alternate = entry.alternates.find((item) => item.language === language);
      if (!alternate || alternate.href !== href) {
        findings.push({ level: 'error', code: 'SITEMAP_HREFLANG_MISMATCH', message: entry.location + ' has a missing or incorrect ' + language + ' alternate.' });
      }
    }
  }

  for (const location of expectedLocations) {
    if (!unique.has(location)) {
      findings.push({ level: 'error', code: 'SITEMAP_MISSING_URL', message: 'Expected indexable URL is missing: ' + location });
    }
  }
}

function readHtmlAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const expression = /([A-Za-z_:][A-Za-z0-9_.:-]*)\s*=\s*(["'])([\s\S]*?)\2/g;
  for (const match of tag.matchAll(expression)) {
    attributes[match[1].toLowerCase()] = match[3]
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  return attributes;
}

function getMetaValues(html: string, attribute: 'name' | 'property', value: string): string[] {
  return [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => readHtmlAttributes(match[0]))
    .filter((attributes) => attributes[attribute] === value)
    .map((attributes) => attributes.content || '');
}

export function auditHtmlDocument(html: string, context: HtmlAuditContext, findings: AuditFinding[]): void {
  const add = (level: FindingLevel, code: string, message: string) => {
    findings.push({ level, code, message, path: context.routePath });
  };
  const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((match) => match[1].replace(/<[^>]+>/g, '').trim());
  const descriptions = getMetaValues(html, 'name', 'description');
  const robots = getMetaValues(html, 'name', 'robots');
  const linkAttributes = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => readHtmlAttributes(match[0]));
  const canonicals = linkAttributes.filter((attributes) => attributes.rel === 'canonical').map((attributes) => attributes.href || '');
  const alternates = linkAttributes
    .filter((attributes) => attributes.rel === 'alternate' && attributes.hreflang)
    .map((attributes) => ({ language: attributes.hreflang, href: attributes.href || '' }));
  const htmlTag = /<html\b[^>]*>/i.exec(html)?.[0] || '';
  const htmlAttributes = readHtmlAttributes(htmlTag);

  if (titles.length !== 1 || !titles[0].trim()) add('error', 'HTML_TITLE_MISSING', 'Expected exactly one non-empty title element.');
  if (descriptions.length !== 1 || !descriptions[0].trim()) add('error', 'HTML_DESCRIPTION_MISSING', 'Expected exactly one non-empty meta description.');
  if (robots.length !== 1 || !robots[0].trim()) add('error', 'HTML_ROBOTS_MISSING', 'Expected exactly one robots meta directive.');
  if (canonicals.length !== 1) add('error', 'HTML_CANONICAL_COUNT', 'Expected exactly one canonical link; found ' + canonicals.length + '.');

  const canonical = context.siteOrigin + context.routePath;
  if (canonicals.length === 1 && canonicals[0] !== canonical) {
    add('error', 'HTML_CANONICAL_MISMATCH', 'Canonical must be ' + canonical + '; found ' + canonicals[0] + '.');
  }

  const locale = context.routePath.split('/').filter(Boolean)[0];
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  if (htmlAttributes.lang !== locale) add('error', 'HTML_LANGUAGE_MISMATCH', 'HTML lang must be ' + locale + '.');
  if (htmlAttributes.dir !== direction) add('error', 'HTML_DIRECTION_MISMATCH', 'HTML dir must be ' + direction + '.');

  const expectedRobots = context.indexable ? 'index, follow' : 'noindex, nofollow';
  if (robots.length === 1 && robots[0].toLowerCase().replace(/\s+/g, ' ').trim() !== expectedRobots) {
    add('error', 'HTML_ROBOTS_MISMATCH', 'Expected robots directive "' + expectedRobots + '"; found "' + robots[0] + '".');
  }

  const suffix = context.routePath.slice(locale.length + 1);
  const expectedAlternates = new Map<string, string>(
    context.locales.map((language) => [language, context.siteOrigin + '/' + language + suffix]),
  );
  expectedAlternates.set('x-default', context.siteOrigin + '/en' + suffix);
  const codes = alternates.map((alternate) => alternate.language);
  if (new Set(codes).size !== codes.length) add('error', 'HTML_DUPLICATE_HREFLANG', 'HTML contains duplicate hreflang attributes.');
  if (alternates.length !== expectedAlternates.size) {
    add('error', 'HTML_HREFLANG_COUNT', 'Expected ' + expectedAlternates.size + ' hreflang links; found ' + alternates.length + '.');
  }
  for (const [language, href] of expectedAlternates) {
    const alternate = alternates.find((item) => item.language === language);
    if (!alternate || alternate.href !== href) add('error', 'HTML_HREFLANG_MISMATCH', 'Missing or incorrect ' + language + ' hreflang link.');
  }

  const ogUrls = getMetaValues(html, 'property', 'og:url');
  if (ogUrls.length !== 1 || ogUrls[0] !== canonical) add('error', 'HTML_OG_URL_MISMATCH', 'Open Graph URL must equal the canonical URL.');
  if (getMetaValues(html, 'property', 'og:image').length !== 1) add('warning', 'HTML_OG_IMAGE_MISSING', 'Expected one Open Graph image.');
  if (getMetaValues(html, 'name', 'twitter:card').length !== 1) add('warning', 'HTML_TWITTER_CARD_MISSING', 'Expected one Twitter card declaration.');

  const schemas = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (schemas.length !== 1) {
    add('error', 'HTML_JSONLD_COUNT', 'Expected exactly one JSON-LD script; found ' + schemas.length + '.');
  } else {
    try {
      const schema = JSON.parse(schemas[0][1]) as Record<string, unknown>;
      if (!schema['@context'] || !schema['@type']) add('error', 'HTML_JSONLD_FIELDS', 'JSON-LD must include @context and @type.');
    } catch {
      add('error', 'HTML_JSONLD_INVALID', 'JSON-LD script is not valid JSON.');
    }
  }

  if (!/<div\b[^>]*id=["']root["'][^>]*>[\s\S]*\S[\s\S]*<\/div>/i.test(html)) {
    add('error', 'HTML_SSR_BODY_MISSING', 'The prerendered document has no server-rendered application content.');
  }
  if (titles[0] && (titles[0].length < 20 || titles[0].length > 70)) {
    add('warning', 'HTML_TITLE_LENGTH', 'Title length is ' + titles[0].length + ' characters; review search-result readability.');
  }
  if (descriptions[0] && (descriptions[0].length < 60 || descriptions[0].length > 180)) {
    add('warning', 'HTML_DESCRIPTION_LENGTH', 'Description length is ' + descriptions[0].length + ' characters; review search-result readability.');
  }
}

function getPrerenderedRoutes(): string[] {
  const routes = new Set<string>();
  const add = (locale: (typeof SUPPORTED_LANGUAGES)[number]['code'], type: string, slug?: string) => {
    routes.add(buildRoutePath(locale, type as never, slug));
  };
  for (const language of SUPPORTED_LANGUAGES) {
    const locale = language.code;
    add(locale, 'home');
    add(locale, 'tools-index');
    add(locale, 'categories-index');
    CATEGORIES_LIST.forEach((category) => add(locale, 'category', category.slug));
    TOOLS_LIST.forEach((tool) => {
      add(locale, 'tool', tool.slug);
      add(locale, 'tool-guide', tool.slug);
    });
    ['about', 'contact', 'privacy', 'terms', 'copyright', 'acceptable-use'].forEach((page) => add(locale, page));
    add(locale, 'articles-index');
    [...new Set(SAMPLE_ARTICLES.map((article) => article.category))].forEach((category) => add(locale, 'article-category', category));
    SAMPLE_ARTICLES.forEach((article) => add(locale, 'article-detail', article.slug));
  }
  return [...routes];
}

async function collectHtmlFiles(directory: string, baseDirectory = directory): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(fullPath, baseDirectory));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(relative(baseDirectory, fullPath).replace(/\\/g, '/'));
  }
  return files;
}

export async function runSeoAudit(distDirectory: string, siteUrl: string): Promise<SeoAuditReport> {
  const findings: AuditFinding[] = [];
  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(siteUrl);
  } catch {
    throw new Error('SITE_URL must be a valid HTTP(S) origin.');
  }
  if (!['http:', 'https:'].includes(parsedOrigin.protocol) || parsedOrigin.pathname !== '/' ||
      parsedOrigin.search || parsedOrigin.hash || parsedOrigin.username || parsedOrigin.password) {
    throw new Error('SITE_URL must be an HTTP(S) origin only, such as https://example.com.');
  }

  const siteOrigin = parsedOrigin.origin;
  const locales = SUPPORTED_LANGUAGES.map((language) => language.code);
  let robots = '';
  let sitemap = '';
  try {
    robots = await readFile(join(distDirectory, 'robots.txt'), 'utf8');
  } catch {
    findings.push({ level: 'error', code: 'ROBOTS_FILE_MISSING', message: 'dist/robots.txt was not generated.' });
  }
  try {
    sitemap = await readFile(join(distDirectory, 'sitemap.xml'), 'utf8');
  } catch {
    findings.push({ level: 'error', code: 'SITEMAP_FILE_MISSING', message: 'dist/sitemap.xml was not generated.' });
  }

  const robotLines = robots.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!robotLines.includes('User-agent: *')) findings.push({ level: 'error', code: 'ROBOTS_USER_AGENT', message: 'robots.txt must include User-agent: *.' });
  if (!robotLines.includes('Allow: /')) findings.push({ level: 'error', code: 'ROBOTS_ALLOW_ROOT', message: 'robots.txt must include Allow: /.' });
  if (!robotLines.includes('Disallow: /dev/')) findings.push({ level: 'error', code: 'ROBOTS_DEV_BLOCK', message: 'robots.txt must disallow /dev/.' });
  if (!robotLines.includes('Sitemap: ' + siteOrigin + '/sitemap.xml')) {
    findings.push({ level: 'error', code: 'ROBOTS_SITEMAP_REFERENCE', message: 'robots.txt must reference ' + siteOrigin + '/sitemap.xml.' });
  }

  let actualEntries: SitemapEntry[] = [];
  let expectedEntries: SitemapEntry[] = [];
  try {
    actualEntries = parseSitemapXml(sitemap).entries;
  } catch (error) {
    findings.push({ level: 'error', code: 'SITEMAP_XML_INVALID', message: error instanceof Error ? error.message : String(error) });
  }
  try {
    expectedEntries = parseSitemapXml(generateProductionSitemap(siteOrigin)).entries;
  } catch (error) {
    findings.push({ level: 'error', code: 'SITEMAP_EXPECTATION_INVALID', message: error instanceof Error ? error.message : String(error) });
  }
  if (actualEntries.length && expectedEntries.length) {
    validateSitemapEntries(actualEntries, expectedEntries, siteOrigin, locales, findings);
  }

  const sitemapUrls = new Set(actualEntries.map((entry) => entry.location));
  for (const entry of expectedEntries) {
    if (!sitemapUrls.has(entry.location)) continue;
    const pathname = new URL(entry.location).pathname;
    try {
      await readFile(join(distDirectory, pathname.replace(/^\/+/, '') + '.html'), 'utf8');
    } catch {
      findings.push({ level: 'error', code: 'SITEMAP_PAGE_FILE_MISSING', path: pathname, message: 'Sitemap URL has no prerendered HTML file.' });
    }
  }

  const prerenderedRoutes = getPrerenderedRoutes();
  for (const routePath of prerenderedRoutes) {
    const filePath = join(distDirectory, routePath.replace(/^\/+/, '') + '.html');
    try {
      const html = await readFile(filePath, 'utf8');
      const inSitemap = sitemapUrls.has(siteOrigin + routePath);
      const sampleContent = routePath.includes('/articles/') && !routePath.endsWith('/articles');
      const previewTool = routePath.includes('/tools/video-downloader');
      const mustNotIndex = sampleContent || previewTool;
      if (mustNotIndex && inSitemap) {
        findings.push({ level: 'error', code: 'NON_INDEXABLE_ROUTE_IN_SITEMAP', path: routePath, message: 'Preview-only or sample article route must not appear in the sitemap.' });
      }
      auditHtmlDocument(html, { siteOrigin, routePath, locales, indexable: inSitemap }, findings);
      if (mustNotIndex) {
        const directives = getMetaValues(html, 'name', 'robots');
        if (directives.length !== 1 || directives[0].toLowerCase() !== 'noindex, nofollow') {
          findings.push({ level: 'error', code: 'PREVIEW_ROUTE_NOT_NOINDEX', path: routePath, message: 'Preview-only and sample article routes must be noindex, nofollow.' });
        }
      }
    } catch {
      findings.push({ level: 'error', code: 'PRERENDER_ROUTE_MISSING', path: routePath, message: 'Expected prerendered HTML file is missing: ' + filePath });
    }
  }

  const expectedRouteSet = new Set(prerenderedRoutes);
  let htmlFiles: string[] = [];
  try {
    htmlFiles = await collectHtmlFiles(distDirectory);
  } catch {
    findings.push({ level: 'error', code: 'DIST_DIRECTORY_MISSING', message: 'Build output directory does not exist: ' + distDirectory });
  }
  for (const file of htmlFiles) {
    if (file === 'index.html' || file === '404.html') continue;
    const routePath = '/' + file.slice(0, -5);
    if (!expectedRouteSet.has(routePath)) {
      findings.push({ level: 'warning', code: 'UNTRACKED_HTML_ROUTE', path: routePath, message: 'HTML output exists outside the prerender route registry.' });
    }
  }

  try {
    const notFound = await readFile(join(distDirectory, '404.html'), 'utf8');
    const directives = getMetaValues(notFound, 'name', 'robots');
    if (directives.length !== 1 || directives[0].toLowerCase() !== 'noindex, nofollow') {
      findings.push({ level: 'error', code: '404_NOT_NOINDEX', path: '/404.html', message: '404 document must be noindex, nofollow.' });
    }
    if (/<link\b[^>]*rel=["']canonical["']/i.test(notFound)) {
      findings.push({ level: 'error', code: '404_HAS_CANONICAL', path: '/404.html', message: '404 document must not carry a canonical URL.' });
    }
    if (/<script\b[^>]*type=["']application\/ld\+json["']/i.test(notFound)) {
      findings.push({ level: 'error', code: '404_HAS_JSONLD', path: '/404.html', message: '404 document must not inherit homepage structured data.' });
    }
  } catch {
    findings.push({ level: 'error', code: '404_FILE_MISSING', path: '/404.html', message: 'dist/404.html was not generated.' });
  }

  for (const tool of TOOLS_LIST) {
    const localizedSeo = (tool as typeof tool & { seo?: { metaTitle?: Record<string, string>; metaDescription?: Record<string, string> } }).seo;
    for (const locale of locales) {
      if (!localizedSeo?.metaTitle?.[locale]) {
        findings.push({ level: 'warning', code: 'SEO_TITLE_LOCALE_FALLBACK', path: '/tools/' + tool.slug, message: tool.slug + ' has no dedicated ' + locale + ' SEO title.' });
      }
      if (!localizedSeo?.metaDescription?.[locale]) {
        findings.push({ level: 'warning', code: 'SEO_DESCRIPTION_LOCALE_FALLBACK', path: '/tools/' + tool.slug, message: tool.slug + ' has no dedicated ' + locale + ' SEO description.' });
      }
    }
  }

  const errors = findings.filter((finding) => finding.level === 'error').length;
  const warnings = findings.filter((finding) => finding.level === 'warning').length;
  const report: SeoAuditReport = {
    siteOrigin,
    summary: {
      tools: TOOLS_LIST.length,
      functionalTools: TOOLS_LIST.filter((tool) => tool.status === 'functional').length,
      categories: CATEGORIES_LIST.length,
      locales: locales.length,
      prerenderedRoutes: prerenderedRoutes.length,
      sitemapUrls: actualEntries.length,
      errors,
      warnings,
    },
    findings,
  };

  const reportDirectory = join(process.cwd(), '.artifacts', 'seo-audit');
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(join(reportDirectory, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  const markdown = [
    '# UTILORA SEO audit',
    '',
    '- Origin: ' + siteOrigin,
    '- Tools: ' + report.summary.tools + ' (' + report.summary.functionalTools + ' functional)',
    '- Categories: ' + report.summary.categories,
    '- Locales: ' + report.summary.locales,
    '- Prerendered routes: ' + report.summary.prerenderedRoutes,
    '- Sitemap URLs: ' + report.summary.sitemapUrls,
    '- Errors: ' + errors,
    '- Warnings: ' + warnings,
    '',
    '| Level | Code | Path | Finding |',
    '|---|---|---|---|',
    ...findings.map((finding) => '| ' + finding.level + ' | ' + finding.code + ' | ' + (finding.path || '') + ' | ' + finding.message.replace(/\|/g, '\\|') + ' |'),
    '',
  ].join('\n');
  await writeFile(join(reportDirectory, 'report.md'), markdown, 'utf8');

  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, [
      '## UTILORA SEO audit',
      '',
      '- **Errors:** ' + errors,
      '- **Warnings:** ' + warnings,
      '- **Sitemap URLs:** ' + actualEntries.length,
      '- **Prerendered routes:** ' + prerenderedRoutes.length,
      '',
      'Full JSON and Markdown reports are uploaded as the seo-audit-report workflow artifact.',
      '',
    ].join('\n'), 'utf8');
  }
  return report;
}

async function main(): Promise<void> {
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) throw new Error('SITE_URL is required for a production SEO audit.');
  const report = await runSeoAudit(process.argv[2] || 'dist', siteUrl);
  console.log([
    'UTILORA SEO audit: ' + report.summary.errors + ' errors, ' + report.summary.warnings + ' warnings',
    'Routes: ' + report.summary.prerenderedRoutes + '; sitemap URLs: ' + report.summary.sitemapUrls,
    'Tools: ' + report.summary.tools + ' (' + report.summary.functionalTools + ' functional), categories: ' + report.summary.categories + ', locales: ' + report.summary.locales,
    'Reports: .artifacts/seo-audit/report.json and report.md',
  ].join('\n'));
  if (report.summary.errors > 0) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('SEO audit failed:', error);
    process.exitCode = 1;
  });
}
