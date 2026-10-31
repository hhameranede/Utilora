import { SUPPORTED_LANGUAGES, SupportedLocale } from '../i18n';
import { CATEGORIES_LIST } from '../registry/categories.registry';
import { TOOLS_LIST } from '../registry/tools.registry';
import { SAMPLE_ARTICLES } from '../data/articles.data';
import { buildRoutePath } from '../router/matcher';

export interface SitemapEntry {
  url: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
  lastmod?: string;
}

/**
 * Generates XML sitemap content for production indexable routes.
 * In accordance with Phase 1 constraints, unfinished preview tool pages
 * and sample forum discussions are EXCLUDED from the sitemap.
 */
export function generateProductionSitemap(baseUrl = 'https://utilora.com'): string {
  const entries: SitemapEntry[] = [];
  const currentDate = new Date().toISOString().split('T')[0];

  // 1. Homepages in all 8 languages (High Priority)
  SUPPORTED_LANGUAGES.forEach((lang) => {
    entries.push({
      url: `${baseUrl}${buildRoutePath(lang.code, 'home')}`,
      changefreq: 'daily',
      priority: 1.0,
      lastmod: currentDate,
    });
  });

  // 2. Categories Index & Category Pages in 8 languages
  SUPPORTED_LANGUAGES.forEach((lang) => {
    entries.push({
      url: `${baseUrl}${buildRoutePath(lang.code, 'categories-index')}`,
      changefreq: 'weekly',
      priority: 0.9,
      lastmod: currentDate,
    });

    CATEGORIES_LIST.forEach((cat) => {
      entries.push({
        url: `${baseUrl}${buildRoutePath(lang.code, 'category', cat.slug)}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: currentDate,
      });
    });
  });

  // 3. Informational & Legal Pages
  const staticPages: Array<'about' | 'contact' | 'privacy' | 'terms' | 'copyright' | 'acceptable-use'> = [
    'about',
    'contact',
    'privacy',
    'terms',
    'copyright',
    'acceptable-use',
  ];

  SUPPORTED_LANGUAGES.forEach((lang) => {
    staticPages.forEach((page) => {
      entries.push({
        url: `${baseUrl}${buildRoutePath(lang.code, page)}`,
        changefreq: 'monthly',
        priority: 0.4,
        lastmod: currentDate,
      });
    });
  });

  // NOTE: Unfinished tool routes (288 localized URLs) are intentionally excluded from sitemap until Phase 2
  // and have <meta name="robots" content="noindex, nofollow" /> applied automatically.

  const xmlEntries = entries
    .map(
      (e) => `  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
}
