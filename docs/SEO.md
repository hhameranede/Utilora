# Search Engine Optimization (SEO)

## Indexation policy

Only routes with complete, useful content should be listed in the production sitemap. The current sitemap generator includes:
- Localized home pages for all eight supported locales.
- Localized tools directory and categories index pages.
- Localized category hub pages.
- Localized detail pages and `/how-to` guides for all tools whose registry status is `functional` (currently 35 tools across eight locales).
- Localized informational and legal pages.

The following routes stay out of the sitemap until their content is production-ready:
- The `video-downloader` preview workspace and its guide. The other 35 functional tool pages and their guides are indexable and included in the sitemap.
- Sample articles and article categories.
- The internal `/dev/templates` route.

Sample article preview pages are marked `noindex, nofollow` by their page metadata. Community/forum pages and routes have been removed. Unknown sample article/topic/category slugs render the not-found page rather than silently falling back to the first sample record.

## Generate sitemap.xml and robots.txt

The sitemap is generated from `src/seo/sitemap.ts` by `scripts/generate-seo-files.ts` and runs before the Vite production build.

Set `SITE_URL` to the verified canonical production origin:

```bash
SITE_URL=https://utilora.l.cd npm run build
```

The value must be an origin only: HTTP(S) scheme and hostname, without a path, query, fragment, username, or password. The script generates:
- `public/sitemap.xml`, with localized URLs and eight-language hreflang alternate links plus `x-default`.
- `public/robots.txt`, allowing public routes, disallowing `/dev/`, and referencing the generated sitemap when `SITE_URL` is set.

The current sitemap contains 680 unique, indexable URLs across eight locales. It remains a single XML sitemap because its URL count and file size are comfortably below protocol limits. Each URL includes reciprocal `hreflang` links for all supported locales plus `x-default`. Preview-only tools, sample articles, internal routes, and not-found URLs are excluded. Do not add `lastmod` values unless the build can supply a reliable last-modified date for each route.

When `SITE_URL` is omitted, the build does not guess a domain: stale sitemap output is removed, a robots file is still generated without a sitemap directive, and a warning is printed. The Vite HTML transform also removes social-image tags that would otherwise contain an unresolved domain placeholder. Configure the real domain in the production build environment.

## Automated build-output audit

The repository includes a dependency-free sitemap parser and a generated-site auditor:

```bash
SITE_URL=https://utilora.l.cd npm run build
SITE_URL=https://utilora.l.cd npm run seo:audit
npm run test:seo-audit
```

The audit compares the generated sitemap with the route registry, validates XML structure and URL uniqueness, verifies reciprocal hreflang links for all supported locales plus `x-default`, and checks that sitemap URLs have prerendered HTML files. It also checks each prerendered route for a unique title and description, robots directive, canonical URL, locale and text direction, hreflang set, Open Graph URL, JSON-LD validity, and server-rendered page content. Preview-only and sample article routes must remain `noindex, nofollow`; the generated 404 page must not contain a canonical URL or inherited homepage JSON-LD.

Warnings identify review opportunities such as title/description length and missing per-language SEO title or description entries. Errors fail the CI job. The JSON and Markdown reports are written to `.artifacts/seo-audit/` and uploaded by the quality workflow. This is a build-output check; it does not replace live HTTP checks for deployed status codes, response headers, or search-engine indexing.

## Runtime metadata

`src/seo/Head.tsx` applies route metadata through `useEffect`:
- Page title and description.
- Canonical URL and hreflang alternate links.
- Open Graph and Twitter metadata.
- Robots directives for preview and unfinished pages.
- JSON-LD structured data.

The document `lang` is updated for each locale, and Arabic routes set `dir="rtl"`. Canonical, hreflang, Open Graph, and JSON-LD URLs all use the build-time `SITE_URL` origin so that the `pages.dev` service hostname and the verified custom domain do not produce competing canonical URLs. Local development falls back to the current browser origin when `SITE_URL` is not configured. Not-found routes remain `noindex, nofollow` and intentionally omit canonical, hreflang, Open Graph URL, and JSON-LD signals rather than pointing at the localized homepage.

## Static route HTML and Cloudflare Pages

The production build runs `scripts/prerender-routes.tsx` after Vite and renders each localized route into its own initial HTML document. The generated file includes the route's rendered body, title, description, canonical URL, hreflang alternates, robots directive, and JSON-LD before client JavaScript runs.

Each route is emitted as `dist/<route>.html`. Cloudflare Pages maps an extensionless request such as `/en/tools` to `dist/en/tools.html`. Do not emit both `dist/en/tools.html` and `dist/en/tools/index.html`: Pages maps those to different extensionless and trailing-slash URLs, which would expose duplicate copies while the canonical tag points to only one. The build creates a top-level `dist/404.html`; Cloudflare Pages uses that file for unmatched requests and does not apply its automatic SPA fallback when a top-level 404 page exists.

For a Cloudflare Pages deployment, use `npm run build` as the build command, `dist` as the output directory, and set `SITE_URL=https://utilora.l.cd` for the production build environment. The project hostname `https://utilora-cn6.pages.dev` remains a Cloudflare service alias and must not be used as the production canonical origin. Cloudflare preview deployments add `X-Robots-Tag: noindex`; their metadata should still reference the production canonical origin.

## Cloudflare Pages custom domain

The verified custom domain for the existing `utilora` Pages project is `https://utilora.l.cd`. It is attached to the same project as `utilora-cn6.pages.dev`; no separate hosting project or DNS migration is required. The current Cloudflare production and preview build configurations have both been verified to use `SITE_URL=https://utilora.l.cd`. Preserve this setting for future builds so the generated sitemap, robots directive, prerendered HTML, social cards, and runtime metadata continue to use the canonical domain.

**Live HTTP verification remains separate from a successful build:** after each production deployment, check the deployed root, localized routes, sitemap, robots file, canonical tags, 404 behavior, and HTTPS response in a normal browser. CI output validation is not proof that deployed route status or production HTML is correct.
