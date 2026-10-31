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

## Static route HTML and Cloudflare Pages

The production build runs `scripts/prerender-routes.tsx` after Vite and renders each localized route into its own initial HTML document. The generated file includes the route's rendered body, title, description, canonical URL, hreflang alternates, robots directive, and JSON-LD before client JavaScript runs.

Each route is emitted as `dist/<route>.html`. Cloudflare Pages maps an extensionless request such as `/en/tools` to `dist/en/tools.html`. Do not emit both `dist/en/tools.html` and `dist/en/tools/index.html`: Pages maps those to different extensionless and trailing-slash URLs, which would expose duplicate copies while the canonical tag points to only one. The build creates a top-level `dist/404.html`; Cloudflare Pages uses that file for unmatched requests and does not apply its automatic SPA fallback when a top-level 404 page exists.

For a Cloudflare Pages deployment, use `npm run build` as the build command, `dist` as the output directory, and set `SITE_URL` to the verified production origin in the production build environment. The root `/` remains the Vite root document; SEO-critical localized routes are prerendered.

**Deployment verification remains pending:** the connected Cloudflare account currently has no UTILORA Pages project, so direct HTTP route status, canonical redirects, and production HTML source have not yet been checked against a live deployment. Do not treat CI output validation as proof of a deployed site.

## Cloudflare Pages preview environment

The repository is connected to the Cloudflare Pages project `utilora`.
- Build command: `npm run build`
- Output directory: `dist`
- Node.js build version: `22`
- Project hostname: `https://utilora-cn6.pages.dev`
- `SITE_URL` is configured to that Pages hostname for preview and production builds until a verified custom domain is attached.
- The `main` branch is designated as production, but production deployments are disabled. Only `fix/seo-branding-hardening-2026-10-31` is allowed to create preview deployments.

The Pages project has been provisioned; confirm the first preview build and inspect its deployed HTML/HTTP responses before enabling production deployments or attaching a custom domain.
