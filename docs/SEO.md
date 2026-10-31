# Search Engine Optimization (SEO)

## Indexation policy

Only routes with complete, useful content should be listed in the production sitemap. The current sitemap generator includes:
- Localized home pages for all eight supported locales.
- Localized tools directory and categories index pages.
- Localized category hub pages.
- Localized informational and legal pages.

The following routes stay out of the sitemap until their content is production-ready:
- Individual tool workspaces (the processing engines are not connected yet).
- Sample articles and article categories.
- Sample community categories and discussions.
- The internal `/dev/templates` route.

Article and community preview pages are marked `noindex, nofollow` by their page metadata. Unknown sample article/topic/category slugs render the not-found page rather than silently falling back to the first sample record.

## Generate sitemap.xml and robots.txt

The sitemap is generated from `src/seo/sitemap.ts` by `scripts/generate-seo-files.ts` and runs before the Vite production build.

Set `SITE_URL` to the verified production origin:

```bash
SITE_URL=https://your-real-domain.example npm run build
```

The value must be an origin only: HTTP(S) scheme and hostname, without a path, query, fragment, username, or password. The script generates:
- `public/sitemap.xml`, with localized URLs and eight-language hreflang alternate links plus `x-default`.
- `public/robots.txt`, allowing public routes, disallowing `/dev/`, and referencing the generated sitemap when `SITE_URL` is set.

When `SITE_URL` is omitted, the build does not guess a domain: stale sitemap output is removed, a robots file is still generated without a sitemap directive, and a warning is printed. The Vite HTML transform also removes social-image tags that would otherwise contain an unresolved domain placeholder. Configure the real domain in the production build environment.

## Runtime metadata

`src/seo/Head.tsx` applies route metadata through `useEffect`:
- Page title and description.
- Canonical URL and hreflang alternate links.
- Open Graph and Twitter metadata.
- Robots directives for indexable and preview pages.
- JSON-LD structured data.

The document `lang` is updated for each locale, and Arabic routes set `dir="rtl"`. Canonical URLs and JSON-LD use the active browser origin; they do not assume a hard-coded production domain.

## Important prerendering limitation

The app is currently a client-rendered Vite SPA. Route-specific metadata is applied after JavaScript executes. A generated sitemap does not make the initial HTML contain each route's title, description, canonical, robots directive, or page content.

Before relying on organic indexing for route-level pages, implement and verify static prerendering, SSR, or edge HTML rendering for the intended public routes. Validate the resulting HTML source and HTTP status codes, not only the browser DOM after React loads.
