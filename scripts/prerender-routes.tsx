import React from 'react';
import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { SUPPORTED_LANGUAGES } from '../src/i18n';
import { CATEGORIES_LIST } from '../src/registry/categories.registry';
import { TOOLS_LIST } from '../src/registry/tools.registry';
import { SAMPLE_ARTICLES } from '../src/data/articles.data';
import { FORUM_CATEGORIES, SAMPLE_TOPICS } from '../src/data/community.data';
import { buildRoutePath } from '../src/router/matcher';

type Locale = (typeof SUPPORTED_LANGUAGES)[number]['code'];
interface RouteEntry { path: string; locale: Locale; type: string; slug?: string }
interface PageMetadata {
  title: string; description: string; locale: string; routeType: string; slug?: string;
  isIndexable?: boolean; ogType?: 'website' | 'article'; publishedTime?: string;
  author?: string; schemaType?: string; schemaData?: Record<string, unknown>;
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char] as string);

function createHead(meta: PageMetadata, origin: string): string {
  const routePath = buildRoutePath(meta.locale as Locale, meta.routeType as never, meta.slug);
  const canonical = origin + routePath;
  const altLinks = SUPPORTED_LANGUAGES.map((language) => {
    const href = origin + buildRoutePath(language.code, meta.routeType as never, meta.slug);
    return '<link rel="alternate" hreflang="' + language.code + '" href="' + escapeHtml(href) + '" />';
  }).join('\n');
  const xDefault = origin + buildRoutePath('en', meta.routeType as never, meta.slug);
  const robots = meta.isIndexable ? 'index, follow' : 'noindex, nofollow';

  let schema: Record<string, unknown> = {
    '@context': 'https://schema.org', '@type': 'WebSite', name: 'UTILORA',
    url: origin, description: 'Every Digital Task. One Place.',
  };
  if (meta.schemaType === 'SoftwareApplication') {
    schema = {
      '@context': 'https://schema.org', '@type': 'SoftwareApplication',
      name: meta.title, applicationCategory: 'UtilityApplication', operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, ...meta.schemaData,
    };
  } else if (meta.schemaType === 'Article') {
    schema = {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: meta.title, description: meta.description,
      ...(meta.publishedTime ? { datePublished: meta.publishedTime } : {}),
      author: { '@type': 'Organization', name: meta.author || 'UTILORA Editorial' },
      publisher: { '@type': 'Organization', name: 'UTILORA', url: origin },
      ...meta.schemaData,
    };
  }

  const jsonLd = JSON.stringify(schema).replace(/</g, '\\u003c');
  return [
    '<title>' + escapeHtml(meta.title) + '</title>',
    '<meta name="description" content="' + escapeHtml(meta.description) + '" />',
    '<meta name="robots" content="' + robots + '" />',
    '<link rel="canonical" href="' + escapeHtml(canonical) + '" />',
    '<meta property="og:title" content="' + escapeHtml(meta.title) + '" />',
    '<meta property="og:description" content="' + escapeHtml(meta.description) + '" />',
    '<meta property="og:type" content="' + (meta.ogType || 'website') + '" />',
    '<meta property="og:site_name" content="UTILORA" />',
    '<meta property="og:url" content="' + escapeHtml(canonical) + '" />',
    '<meta property="og:image" content="' + escapeHtml(origin) + '/og-utilora.svg" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    '<meta name="twitter:title" content="' + escapeHtml(meta.title) + '" />',
    '<meta name="twitter:description" content="' + escapeHtml(meta.description) + '" />',
    '<meta name="twitter:image" content="' + escapeHtml(origin) + '/og-utilora.svg" />',
    altLinks,
    '<link rel="alternate" hreflang="x-default" href="' + escapeHtml(xDefault) + '" />',
    '<script id="utilora-schema-jsonld" type="application/ld+json">' + jsonLd + '</script>',
  ].join('\n');
}

function injectMetadata(template: string, meta: PageMetadata, origin: string): string {
  const direction = meta.locale === 'ar' ? 'rtl' : 'ltr';
  const cleaned = template
    .replace(/<html\b[^>]*>/i, '<html lang="' + meta.locale + '" dir="' + direction + '">')
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+)"[^>]*\/?\s*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*\/?\s*>/gi, '')
    .replace(/<link\s+rel="alternate"[^>]*hreflang="[^"]+"[^>]*\/?\s*>/gi, '');
  return cleaned.replace('</head>', '\n' + createHead(meta, origin) + '\n</head>');
}

function getRoutes(): RouteEntry[] {
  const routes: RouteEntry[] = [];
  const add = (locale: Locale, type: string, slug?: string) => {
    routes.push({ locale, type, slug, path: buildRoutePath(locale, type as never, slug) });
  };

  for (const language of SUPPORTED_LANGUAGES) {
    const locale = language.code;
    add(locale, 'home');
    add(locale, 'tools-index');
    add(locale, 'categories-index');
    CATEGORIES_LIST.forEach((item) => add(locale, 'category', item.slug));
    TOOLS_LIST.forEach((item) => add(locale, 'tool', item.slug));
    ['about', 'contact', 'privacy', 'terms', 'copyright', 'acceptable-use'].forEach((page) => add(locale, page));

    add(locale, 'articles-index');
    Array.from(new Set(SAMPLE_ARTICLES.map((item) => item.category))).forEach((category) => add(locale, 'article-category', category));
    SAMPLE_ARTICLES.forEach((item) => add(locale, 'article-detail', item.slug));
    add(locale, 'community-index');
    FORUM_CATEGORIES.forEach((item) => add(locale, 'community-category', item.slug));
    SAMPLE_TOPICS.forEach((item) => add(locale, 'community-topic', item.slug));
  }
  return routes;
}

async function main() {
  const rawSiteUrl = process.env.SITE_URL?.trim();
  if (!rawSiteUrl) {
    console.warn('SITE_URL is not configured. Route prerendering skipped; set SITE_URL to the verified production origin.');
    return;
  }

  const parsed = new URL(rawSiteUrl);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.pathname !== '/' ||
      parsed.search || parsed.hash || parsed.username || parsed.password) {
    throw new Error('SITE_URL must be an HTTP(S) origin only, for example https://example.com.');
  }

  const origin = parsed.origin;
  const dist = resolve(process.cwd(), 'dist');
  const template = await readFile(resolve(dist, 'index.html'), 'utf8');
  const vite = await createServer({
    configFile: resolve(process.cwd(), 'vite.config.ts'),
    mode: 'production',
    appType: 'custom',
    server: { middlewareMode: true },
    logLevel: 'error',
  });

  try {
    const loaded = await Promise.all([
      vite.ssrLoadModule('/src/App.tsx'),
      vite.ssrLoadModule('/src/seo/Head.tsx'),
    ]);
    const App = loaded[0].default;
    const reset = loaded[1].resetPrerenderMetadata as () => void;
    const readMetadata = loaded[1].getPrerenderMetadata as () => PageMetadata | null;
    const routes = getRoutes();

    for (const route of routes) {
      reset();
      const body = renderToString(React.createElement(App, { initialPath: route.path }));
      const meta = readMetadata();
      if (!meta) throw new Error('Route ' + route.path + ' did not register SEO metadata.');

      const html = injectMetadata(template, meta, origin)
        .replace('<div id="root"></div>', '<div id="root">' + body + '</div>');
      const cleanPath = route.path.replace(/^\/+|\/+$/g, '');
      // Cloudflare Pages maps /route to dist/route.html. Do not also emit
      // dist/route/index.html: that creates a second URL (/route/) for the
      // same page and conflicts with the no-trailing-slash canonical URL.
      const cleanUrlFile = resolve(dist, (cleanPath || 'index') + '.html');
      await mkdir(dirname(cleanUrlFile), { recursive: true });
      await writeFile(cleanUrlFile, html, 'utf8');
    }

    const notFound = template
      .replace(/<title>[\s\S]*?<\/title>/i, '<title>Page Not Found — UTILORA</title>')
      .replace('</head>', '<meta name="robots" content="noindex, nofollow" />\n</head>')
      .replace('<div id="root"></div>', '<div id="root"><main class="min-h-screen bg-[#0a1020] text-slate-100 flex items-center justify-center p-8"><section class="max-w-xl text-center"><p class="text-sm font-semibold tracking-widest text-amber-500">404</p><h1 class="mt-3 text-3xl font-bold">Page not found</h1><p class="mt-3 text-slate-400">The page you requested does not exist.</p><a class="mt-6 inline-block text-amber-500 underline" href="/en">Return to UTILORA</a></section></main></div>');
    await writeFile(resolve(dist, '404.html'), notFound, 'utf8');
    console.log('Prerendered ' + routes.length + ' localized routes for ' + origin);
  } finally {
    await vite.close();
  }
}

main().catch((error) => {
  console.error('Route prerendering failed:', error);
  process.exitCode = 1;
});
