import { SupportedLocale, SUPPORTED_LANGUAGES } from '../i18n';
import { RouteType } from '../router/types';
import { buildRoutePath } from '../router/matcher';

export interface PageMetadataConfig {
  title: string;
  description: string;
  locale: SupportedLocale;
  routeType: RouteType;
  slug?: string;
  isIndexable?: boolean; // Controlled indexability: default false for preview phase
  ogType?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  schemaType?: 'WebSite' | 'SoftwareApplication' | 'Article' | 'BreadcrumbList';
  schemaData?: Record<string, unknown>;
}

export function buildCanonicalUrl(locale: SupportedLocale, routeType: RouteType, slug?: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const path = buildRoutePath(locale, routeType, slug);
  return origin ? `${origin}${path}` : path;
}

export function generateHreflangLinks(routeType: RouteType, slug?: string): Array<{ lang: string; url: string }> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return SUPPORTED_LANGUAGES.map((lang) => {
    const path = buildRoutePath(lang.code, routeType, slug);
    return { lang: lang.code, url: origin ? `${origin}${path}` : path };
  });
}

export function applyDocumentMetadata(config: PageMetadataConfig) {
  if (typeof document === 'undefined') return;

  // 1. Update Title
  document.title = config.title;

  // 2. Helper to set or create meta tag
  const setMeta = (nameAttr: 'name' | 'property', attrValue: string, content: string) => {
    let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(nameAttr, attrValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Helper to set or create link tag
  const setLink = (rel: string, href: string, extraAttrs?: Record<string, string>) => {
    let selector = `link[rel="${rel}"]`;
    if (extraAttrs?.hreflang) {
      selector += `[hreflang="${extraAttrs.hreflang}"]`;
    }
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
    }
    element.setAttribute('href', href);
    if (extraAttrs) {
      Object.entries(extraAttrs).forEach(([k, v]) => element?.setAttribute(k, v));
    }
  };

  // Standard Descriptions
  setMeta('name', 'description', config.description);
  setMeta('property', 'og:title', config.title);
  setMeta('property', 'og:description', config.description);
  setMeta('property', 'og:type', config.ogType || 'website');
  setMeta('property', 'og:site_name', 'UTILORA');
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', config.title);
  setMeta('name', 'twitter:description', config.description);

  // Strict Robots: Unfinished preview tools & demo pages marked noindex, nofollow per specification
  const robotsDirective = config.isIndexable ? 'index, follow' : 'noindex, nofollow';
  setMeta('name', 'robots', robotsDirective);

  // Canonical link
  const canonicalUrl = buildCanonicalUrl(config.locale, config.routeType, config.slug);
  setLink('canonical', canonicalUrl);
  setMeta('property', 'og:url', canonicalUrl);

  // Hreflang alternates for all 8 languages
  const hreflangs = generateHreflangLinks(config.routeType, config.slug);
  hreflangs.forEach(({ lang, url }) => {
    setLink('alternate', url, { hreflang: lang });
  });
  // x-default hreflang pointing to English
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const englishPath = buildRoutePath('en', config.routeType, config.slug);
  setLink('alternate', origin ? `${origin}${englishPath}` : englishPath, {
    hreflang: 'x-default',
  });

  // Inject JSON-LD Schema
  let script = document.querySelector('script#utilora-schema-jsonld') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'utilora-schema-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
  let structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'UTILORA',
    ...(siteOrigin ? { url: siteOrigin } : {}),
    description: 'Every Digital Task. One Place.',
  };

  if (config.schemaType === 'SoftwareApplication') {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: config.title,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      ...config.schemaData,
    };
  } else if (config.schemaType === 'Article') {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: config.title,
      description: config.description,
      ...(config.publishedTime ? { datePublished: config.publishedTime } : {}),
      author: {
        '@type': 'Organization',
        name: config.author || 'UTILORA Editorial',
      },
      publisher: {
        '@type': 'Organization',
        name: 'UTILORA',
        ...(siteOrigin ? { url: siteOrigin } : {}),
      },
      ...config.schemaData,
    };
  }

  script.textContent = JSON.stringify(structuredData);
}
