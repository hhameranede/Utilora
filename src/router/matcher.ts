import { SupportedLocale } from '../i18n';
import { ParsedRoute, RouteType } from './types';
import { TOOLS_REGISTRY } from '../registry/tools.registry';
import { CATEGORIES_REGISTRY } from '../registry/categories.registry';

const VALID_LOCALES: SupportedLocale[] = ['en', 'ar', 'fr', 'es', 'pt', 'hi', 'zh', 'bn'];

export function parseRoute(pathname: string): ParsedRoute {
  // Normalize pathname: remove trailing slash, ensure leading slash
  let cleanPath = pathname.trim();
  if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  // Handle internal dev route /dev/templates (locale-independent)
  if (cleanPath === '/dev/templates' || cleanPath === '/dev/templates/') {
    return {
      type: 'dev-templates',
      locale: 'en',
      rawPath: cleanPath,
    };
  }

  // Split into segments
  const segments = cleanPath.split('/').filter(Boolean);

  // If root "/", default to home with English
  if (segments.length === 0) {
    return {
      type: 'home',
      locale: 'en',
      rawPath: '/',
    };
  }

  // Check first segment for locale
  let locale: SupportedLocale = 'en';
  let restSegments = segments;

  if (VALID_LOCALES.includes(segments[0] as SupportedLocale)) {
    locale = segments[0] as SupportedLocale;
    restSegments = segments.slice(1);
  }

  // If only locale, e.g. /en or /ar
  if (restSegments.length === 0) {
    return {
      type: 'home',
      locale,
      rawPath: cleanPath,
    };
  }

  const [first, second, third] = restSegments;

  // Static informational pages
  if (first === 'about' && restSegments.length === 1) {
    return { type: 'about', locale, rawPath: cleanPath };
  }
  if (first === 'contact' && restSegments.length === 1) {
    return { type: 'contact', locale, rawPath: cleanPath };
  }
  if (first === 'privacy' && restSegments.length === 1) {
    return { type: 'privacy', locale, rawPath: cleanPath };
  }
  if (first === 'terms' && restSegments.length === 1) {
    return { type: 'terms', locale, rawPath: cleanPath };
  }
  if (first === 'copyright' && restSegments.length === 1) {
    return { type: 'copyright', locale, rawPath: cleanPath };
  }
  if (first === 'acceptable-use' && restSegments.length === 1) {
    return { type: 'acceptable-use', locale, rawPath: cleanPath };
  }

  // Categories routes
  if (first === 'categories') {
    if (restSegments.length === 1) {
      return { type: 'categories-index', locale, rawPath: cleanPath };
    }
    if (restSegments.length === 2) {
      const catSlug = second;
      if (CATEGORIES_REGISTRY[catSlug as keyof typeof CATEGORIES_REGISTRY]) {
        return {
          type: 'category',
          locale,
          categorySlug: catSlug,
          rawPath: cleanPath,
        };
      }
      return { type: 'not-found', locale, rawPath: cleanPath };
    }
  }

  // Tools routes: /tools or /tools/:slug
  if (first === 'tools') {
    if (restSegments.length === 1) {
      return { type: 'tools-index', locale, rawPath: cleanPath };
    }
    if (restSegments.length === 3 && third === 'how-to') {
      return TOOLS_REGISTRY[second]
        ? { type: 'tool-guide', locale, toolSlug: second, rawPath: cleanPath }
        : { type: 'not-found', locale, rawPath: cleanPath };
    }
    if (restSegments.length === 2) {
      const toolSlug = second;
      if (TOOLS_REGISTRY[toolSlug]) {
        return {
          type: 'tool',
          locale,
          toolSlug,
          rawPath: cleanPath,
        };
      }
      return { type: 'not-found', locale, rawPath: cleanPath };
    }
  }

  // Articles routes: /articles, /articles/category/:cat, /articles/:slug
  if (first === 'articles') {
    if (restSegments.length === 1) {
      return { type: 'articles-index', locale, rawPath: cleanPath };
    }
    if (restSegments.length === 3 && second === 'category') {
      return {
        type: 'article-category',
        locale,
        categorySlug: third,
        rawPath: cleanPath,
      };
    }
    if (restSegments.length === 2) {
      return {
        type: 'article-detail',
        locale,
        articleSlug: second,
        rawPath: cleanPath,
      };
    }
  }

  // If nothing matched, 404
  return {
    type: 'not-found',
    locale,
    rawPath: cleanPath,
  };
}

export function buildRoutePath(
  locale: SupportedLocale,
  type: RouteType,
  slug?: string
): string {
  switch (type) {
    case 'home':
      return `/${locale}`;
    case 'categories-index':
      return `/${locale}/categories`;
    case 'category':
      return `/${locale}/categories/${slug || ''}`;
    case 'tools-index':
      return `/${locale}/tools`;
    case 'tool':
      return `/${locale}/tools/${slug || ''}`;
    case 'tool-guide':
      return `/${locale}/tools/${slug || ''}/how-to`;
    case 'articles-index':
      return `/${locale}/articles`;
    case 'article-category':
      return `/${locale}/articles/category/${slug || ''}`;
    case 'article-detail':
      return `/${locale}/articles/${slug || ''}`;
    case 'about':
      return `/${locale}/about`;
    case 'contact':
      return `/${locale}/contact`;
    case 'privacy':
      return `/${locale}/privacy`;
    case 'terms':
      return `/${locale}/terms`;
    case 'copyright':
      return `/${locale}/copyright`;
    case 'acceptable-use':
      return `/${locale}/acceptable-use`;
    case 'dev-templates':
      return `/dev/templates`;
    default:
      return `/${locale}`;
  }
}
