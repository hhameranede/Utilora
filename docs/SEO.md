# Search Engine Optimization (SEO) & Prerendering Architecture

## 1. Controlled Indexation Strategy

Per the project specification, **unfinished tool pages, placeholder articles, demo forum discussions, and developer lab routes must initially be marked `noindex, nofollow` and excluded from production sitemaps.**

- **Public / Indexable Pages:**
  - Homepage in all 8 languages (`/:lang/`)
  - Category Hubs in all 8 languages (`/:lang/categories/:slug`)
  - Informational / Legal Pages (`/:lang/about`, `/:lang/privacy`, etc.)
- **Unfinished / Preview Pages (noindex):**
  - All 36 tool pages (until Phase 2 engines connect)
  - `/dev/templates` (Internal Lab)
  - Sample discussion topics

## 2. Dynamic Tag Generation (`src/seo/meta.ts`)

Every view declaratively invokes `<Head>`:
- `<title>` and `<meta name="description">`
- Canonical URL (`<link rel="canonical" href="...">`)
- Alternate hreflang tags for all 8 languages + `x-default`
- Open Graph (`og:title`, `og:description`, `og:url`, `og:site_name`, `og:type`)
- Twitter Cards (`twitter:card`, `twitter:title`, `twitter:description`)
- Injected Schema.org JSON-LD (`WebSite`, `SoftwareApplication`, `Article`, `BreadcrumbList`)

## 3. Sitemap Generator (`src/seo/sitemap.ts`)
Run `generateProductionSitemap()` to produce production-compliant `sitemap.xml` entries excluding non-indexable routes.
