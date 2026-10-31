import { SUPPORTED_LANGUAGES } from '../i18n';
import { CATEGORIES_LIST } from '../registry/categories.registry';
import { buildRoutePath } from '../router/matcher';

type PublicRoute = 'home' | 'tools-index' | 'categories-index' | 'category' |
  'about' | 'contact' | 'privacy' | 'terms' | 'copyright' | 'acceptable-use';

interface SitemapRoute {
  type: PublicRoute;
  slug?: string;
}

const PUBLIC_ROUTES: SitemapRoute[] = [
  { type: 'home' },
  { type: 'tools-index' },
  { type: 'categories-index' },
  ...CATEGORIES_LIST.map((category) => ({ type: 'category' as const, slug: category.slug })),
  { type: 'about' },
  { type: 'contact' },
  { type: 'privacy' },
  { type: 'terms' },
  { type: 'copyright' },
  { type: 'acceptable-use' },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a sitemap for completed, indexable routes only.
 * Individual tool workspaces, sample articles and sample community routes
 * are intentionally excluded until their content and engines are production-ready.
 */
export function generateProductionSitemap(siteUrl: string): string {
  const parsedUrl = new URL(siteUrl);
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('SITE_URL must use HTTP or HTTPS.');
  }
  if (parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash ||
      parsedUrl.username || parsedUrl.password) {
    throw new Error('SITE_URL must be an origin only, such as https://example.com.');
  }

  const origin = parsedUrl.origin;
  const languages = SUPPORTED_LANGUAGES.map((language) => language.code);
  const urlBlocks = PUBLIC_ROUTES.flatMap((route) =>
    languages.map((locale) => {
      const url = `${origin}${buildRoutePath(locale, route.type, route.slug)}`;
      const alternates = languages.map((alternateLocale) => {
        const alternateUrl = `${origin}${buildRoutePath(alternateLocale, route.type, route.slug)}`;
        return `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternateLocale)}" href="${escapeXml(alternateUrl)}" />`;
      }).join('\n');
      const englishUrl = `${origin}${buildRoutePath('en', route.type, route.slug)}`;
      return `  <url>\n    <loc>${escapeXml(url)}</loc>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(englishUrl)}" />\n  </url>`;
    }),
  );

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlBlocks.join('\n')}\n</urlset>`;
}
