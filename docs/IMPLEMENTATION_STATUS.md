# Implementation Status Checklist

This checklist separates repository implementation from CI verification, deployment, and real-device QA. The current registry contains 36 tools: 35 marked `functional` and one UI-only preview (`video-downloader`). The functional set consists of 30 browser-local tools and five public Website & Domain lookups. Five video tools now have working local processing or inspection flows. All 36 tools have localized `/how-to` guides with screenshots captured from their rendered workspaces and numbered orange SVG annotations. Community/forum pages, data, and public routes have been removed. The workflow is configured for type checks, engine tests, SEO/prerender checks, and Playwright E2E; confirm the latest run before merging. The connected Cloudflare Pages account currently reports production deployments enabled for `main`; use a preview branch for validation and do not merge unverified changes.

## Verification status
- [x] TypeScript check and Vite production build passed in GitHub Actions run #18.
- [x] Sitemap/robots output generated and validated in that build.
- [x] Static HTML prerendering generated 528 localized routes; CI checks sample route bodies, canonical URLs, RTL direction, preview noindex, and 404 output.
- [x] Automated responsive route audit covers all 36 tool routes at 360px, 768px, and 1280px, plus all eight locale routes at 360px. This is automated Chromium viewport coverage, not physical-device QA.
- [ ] Manual visual QA on real mobile and desktop devices completed.
- [x] Cloudflare Pages project connected; preview build and asset deployment succeeded (537 files uploaded).
- [ ] Direct HTTP/browser verification of localized routes, canonical tags, and 404 status still pending.
- [ ] Reconfirm the production deployment setting before merge; Cloudflare currently reports production deployments enabled for `main`.



- [ ] Application startup and production compilation successfully re-verified.
- [x] React 19 and TypeScript project structure exists; TypeScript strict mode is not enabled yet.
- [x] Brand palette uses warm white, white surfaces, stone-gray typography and borders, and orange accents; global browser color-scheme and brand SVG assets now match.
- [x] Responsive viewport regression coverage is enforced in Playwright at mobile, tablet, and desktop widths; real-device visual QA remains separate.
- [x] Home page is complete with Hero, 6 categories, popular tools, featured workspaces, how it works, trust, and article previews.
- [x] Six category pages exist (`image`, `pdf`, `text`, `developer`, `website-domain`, `video`).
- [x] All 36 tool definitions exist in `src/registry/tools.registry.ts`.
- [x] All 36 individual tool routes exist and map to appropriate templates.
- [x] Tool pages use specialized reusable templates (Templates A through P).
- [x] Multiple file, image, PDF, text, code, lookup, diagnostics, and video workspace templates exist.
- [x] Article landing page exists (`/:lang/articles`).
- [x] Article detail template exists (`/:lang/articles/:slug`) with Table of Contents, code blocks, callouts, and author metadata.
- [x] Article category templates exist (`/:lang/articles/category/:slug`).
- [x] Community/forum landing pages, category pages, discussion routes, and sample data have been removed from the public application.
- [x] Global Search UI exists; `Ctrl+K` / `Cmd+K` now toggles the search dialog.
- [x] Eight localization dictionaries exist (`en`, `ar`, `fr`, `es`, `pt`, `hi`, `zh`, `bn`).
- [x] Route metadata updates the document language and sets Arabic routes to `dir="rtl"`; visual RTL QA remains pending.
- [x] Client-side SEO metadata handles titles, descriptions, canonical URLs, hreflang links, robots directives, and JSON-LD.
- [x] Preview tool and sample content routes carry `noindex` directives in prerendered HTML.
- [x] Internal template gallery exists at non-public `/dev/templates` route with state toggles.
- [x] Browser-local engines are connected for 30 tools across image, PDF, text, developer, and video categories.
- [x] Five Website & Domain tools perform public RDAP, DNS-over-HTTPS, and credential-free browser-originated HTTP HEAD diagnostics; RDAP and DNS now use same-origin Pages Functions so registry CORS is not required.
- [x] Image tools: conversion, compression, resizing, crop, rotation, and basic pixel/file metadata inspection (EXIF camera/GPS extraction is not included).
- [x] PDF tools: merge, range/burst split, rotate, JPG/PNG to PDF, PDF to JPG/PNG, and page/form-field inspection.
- [x] Text and developer tools: all 13 utilities run in the browser using native browser APIs.
- [x] All 30 browser-local tools execute locally; the five Website & Domain tools use live, public read-only lookups. Five video tools are functional; only `video-downloader` remains UI-ready and is excluded from indexable routes.
- [x] The CI workflow is configured to run text/developer, PDF, and image-engine smoke-test commands; image coverage now includes all six image adapters and common invalid-input/resource-cleanup paths.
- [x] Playwright E2E coverage includes real video compression, trimming, audio extraction, metadata inspection, thumbnail extraction, all five Website & Domain flows, Arabic RTL, mobile crop interaction, and per-tool guide screenshot/annotation checks. RDAP/DNS UI tests mock the same-origin API responses; the Pages Functions have separate tests for upstream routing, validation, timeout/error handling, and allow-lists. Target-site HEAD checks remain subject to target CORS.
- [x] Website diagnostic probes use public-DNS preflight, reject local/private/reserved address ranges and non-standard ports, send HEAD only with credentials omitted, and never follow redirects. CORS-limited results are labeled unknown rather than offline.
- [x] No database has been added.
- [x] No external advertising scripts have been added (AdSlot/AffiliateSlot hidden by default).
- [x] README and architecture documentation exist in `docs/`.

- [x] Production sitemap includes localized home, tools-directory, category, legal, and tool-guide routes. It includes detail pages and guides for all 35 functional tools across eight locales; the `video-downloader` workspace and guide remain noindex and excluded.
- [x] Build-time SEO script generates robots.txt and generates sitemap.xml only when a verified SITE_URL is supplied.
- [x] Header/footer use a shared UTILORA brand mark and internal template links are removed from public navigation.
- [x] Browser tab icon assets include SVG and a 96×96 PNG.
- [x] Static route prerendering emits one extensionless-URL HTML file per localized route and a top-level `404.html`; Cloudflare Pages HTTP behavior is pending live deployment verification.

## Cloudflare Pages preview configuration
- [x] The `utilora` Pages project is connected to `hhameranede/Utilora`, with `npm run build`, output directory `dist`, and Node.js 22.
- [x] The current quality branch `fix/white-gray-orange-and-accurate-status-2026-11-01` is explicitly included in preview deployments.
- [ ] Production deployments are currently enabled for `main` in the Cloudflare Pages API; this task uses a non-production preview branch.
- [ ] The new branch preview deployment has completed and its localized routes and diagnostics endpoints have passed live HTTP/browser checks.


## PostHog analytics instrumentation
- [x] Optional PostHog browser SDK integration is initialized once from Vite environment variables.
- [x] SPA pageviews follow history changes; custom events record tool, usage-guide, and category page views with only route slug and locale.
- [x] Autocapture and page-leave capture are disabled; session replay remains disabled in the PostHog project. User-entered text, uploaded file names, and file contents are never attached to custom analytics events.
- [ ] Configure `VITE_POSTHOG_PROJECT_TOKEN` and `VITE_POSTHOG_HOST` in the Cloudflare Pages build environments, then verify the first events in PostHog.
