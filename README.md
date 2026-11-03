# UTILORA — Global Digital Tools Platform

> **Official Slogan:** Every Digital Task. One Place.

UTILORA is a premium, free online digital tools platform engineered to unify high-frequency utilities across **Images, Documents (PDF), Text, Code, Websites & Domains, and Video** into one fast, elegant, and confidential experience.

---

## 1. Project Scope & Architecture Phase

This repository contains the **complete frontend foundation, UI system, reusable workspace templates, internationalization, routing, and future engine integration contracts**.

### Scope Invariants & Anti-Deception Guardrails
- **35 Functional Tools:** 30 browser-local tools across Image, PDF, Text, Developer, and Video categories, plus five live, read-only Website & Domain lookups. Video processing includes compression, trimming, audio extraction, metadata inspection, and thumbnail extraction.
- **One Video Preview:** `video-downloader` remains a clearly labelled UI preview until a safe, rights-respecting source workflow is available. It does not fabricate downloads or claim unsupported processing.
- **Privacy First:** Files handled by the 30 browser-local tools stay in browser memory and are not uploaded to UTILORA. Website lookups send only the submitted hostname or URL to public DNS-over-HTTPS, RDAP, or a credential-free HEAD request; CORS restrictions are reported honestly.
- **Quality Gates:** TypeScript, browser-engine tests, PDF/image tests, lookup-security tests, SEO build assertions, and real Chromium E2E flows run in GitHub Actions.

---

## 2. Technology Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 8 + Tailwind CSS v4
- **Icons:** Lucide React
- **Design Direction:** Warm white (`#FAFAF9`) and white surfaces, stone-gray borders and typography, and a clear orange accent (`#F97316`). Keep the interface calm, readable, responsive, and free of heavy glass effects. Zero-pill metadata discipline.
- **Routing:** Path-based client router with direct link, browser back/forward, and locale persistence (`/:lang/...`).
- **Internationalization (i18n):** 8 fully translated languages (English, Arabic RTL, French, Spanish, Portuguese, Hindi, Chinese, Bengali).
- **SEO & Search:** Centralized dynamic metadata, hreflang links for all 8 languages, JSON-LD structured schemas, and controlled `noindex, nofollow` exclusion for unfinished preview tools.

---

## 3. Getting Started

### Development Server
```bash
npm install
npm run dev
```
The application runs on `http://localhost:3000`.

### Production Build
Set the real production origin before building so the sitemap, robots sitemap reference, and social preview image use the correct domain:

```bash
SITE_URL=https://your-real-domain.example npm run build
```

On PowerShell:
```powershell
$env:SITE_URL = "https://your-real-domain.example"
npm run build
```

`SITE_URL` must be an origin only (scheme + hostname, no path). When it is not configured, the build still runs, but sitemap generation is skipped and the generated robots.txt omits its sitemap reference. Replace the example domain with the verified production domain.

### Installable PWA and offline support
UTILORA includes a web app manifest and a production-only service worker. The service worker uses network-first navigation with a bounded cache of recently visited pages, cache-first handling for versioned build assets, and an offline fallback page. It does not cache cross-origin requests, API calls, or non-GET requests. User files and tool outputs remain in browser memory and are never written to the service worker cache. See `docs/PWA.md` for the caching and privacy boundaries.

### SEO file generation
```bash
SITE_URL=https://your-real-domain.example npm run seo:generate
```

This writes `public/sitemap.xml` and `public/robots.txt`. The sitemap contains localized home, tool-directory, category, legal, and curated workflow routes, plus every functional tool detail page and its usage guide across all eight languages. The single preview-only tool and sample article routes remain excluded.

**Static route rendering:** `npm run build` prerenders 824 localized routes into HTML files in `dist`, including page content and route-specific metadata before JavaScript runs. Each localized route is emitted once as `dist/<route>.html`; Cloudflare Pages serves that file at its extensionless URL (for example, `/en/tools`). We intentionally do not also emit `<route>/index.html`, because that would create a second trailing-slash URL for the same content. The build also creates a top-level `404.html`, so Cloudflare Pages returns a real 404 for unknown routes instead of falling back to the SPA shell. The root `/` still uses the Vite root document; the localized pages are the prerendered SEO routes.

### Run Unit Tests
```bash
npx --yes tsx --test src/tests/registry.test.ts
```

---

## 4. The Six Main Categories & 36 Registered Tools

| Category | Slug | Registered tools | Key Slug Examples |
| :--- | :--- | :--- | :--- |
| **Image Tools** | `image` | 6 tools | `image-converter`, `image-compressor`, `image-resizer`, `image-cropper`, `image-rotator`, `image-metadata-viewer` |
| **PDF Tools** | `pdf` | 6 tools | `merge-pdf`, `split-pdf`, `rotate-pdf`, `jpg-to-pdf`, `pdf-to-jpg`, `pdf-page-counter` |
| **Text Tools** | `text` | 6 tools | `word-counter`, `character-counter`, `case-converter`, `duplicate-lines-remover`, `sort-text-lines`, `text-diff-checker` |
| **Developer Tools** | `developer` | 7 tools | `json-formatter`, `json-validator`, `json-minifier`, `base64-encoder-decoder`, `url-encoder-decoder`, `uuid-generator`, `hash-generator` |
| **Website & Domain** | `website-domain` | 5 tools | `domain-age-checker`, `rdap-lookup`, `dns-lookup`, `website-status-checker`, `http-headers-checker` |
| **Video Tools** | `video` | 6 tools | `video-compressor`, `video-to-audio`, `video-metadata-viewer`, `video-downloader`, `video-trimmer`, `thumbnail-extractor` |

**Total: Exactly 36 Tools registered across 6 categories.**

---

## 5. Reusable Workspace Templates (A through P)

All 36 tools are built upon 16 specialized, reusable workspace templates located in `src/components/templates/`:

1. **Template A (Single File):** Dropzone, file info, format restrictions, disabled action. (`pdf-page-counter`, `video-downloader`)
2. **Template B (Multi-File):** Multi-file queue, drag-reorder, item removal, batch merge. (`merge-pdf`, `jpg-to-pdf`)
3. **Template C (Image Workspace):** Interactive canvas, before/after compare, quality & dimensions sidebar. (`image-converter`, `image-compressor`, `image-resizer`, `image-cropper`, `image-rotator`)
4. **Template D (PDF Workspace):** Document page thumbnails grid, rotation, page extraction. (`split-pdf`, `rotate-pdf`, `pdf-to-jpg`)
5. **Template E (Text Editor):** Live word/char/sentence analytics strip, case options, line sorters. (`word-counter`, `character-counter`, `case-converter`, `duplicate-lines-remover`, `sort-text-lines`)
6. **Template F (Two-Panel Compare):** Side-by-side desktop / stacked mobile diff viewer. (`text-diff-checker`)
7. **Template G (Code Editor):** Syntax styling, line number gutter, indent spacing. (`json-formatter`, `json-validator`, `json-minifier`)
8. **Template H (Encoder/Decoder):** Dual panels, encode/decode tabs, swap direction. (`base64-encoder-decoder`, `url-encoder-decoder`)
9. **Template I (Generator Workspace):** Entropic quantity controls, UUID v4/v7 toggles, copy-all. (`uuid-generator`, `hash-generator`)
10. **Template J (Domain Lookup):** Domain input, RDAP registration records, nameservers. (`domain-age-checker`, `rdap-lookup`)
11. **Template K (DNS Lookup):** Record type filtering (A, AAAA, MX, CNAME, TXT, NS, SOA). (`dns-lookup`)
12. **Template L (Website Diagnostics):** Latency probe, HTTP response status, headers table. (`website-status-checker`, `http-headers-checker`)
13. **Template M (Video Editor):** Video frame preview, timeline visual scrubber, start/end markers, CRF slider. (`video-compressor`, `video-trimmer`)
14. **Template N (Media Converter):** Audio demuxing, format selector (MP3, WAV, AAC), bitrate picker. (`video-to-audio`)
15. **Template O (Media Metadata):** Deep EXIF camera tags and MP4 atom container parameters. (`image-metadata-viewer`, `video-metadata-viewer`)
16. **Template P (Thumbnail Extractor):** Filmstrip scrubber, frame timestamp selection, format export. (`thumbnail-extractor`)

---

## 6. Internal Template Lab (Non-Public)

To inspect any of the 16 templates with real-time state toggles (Interactive, Empty, Loading, Error, Mobile view), visit:
```
/dev/templates
```
*(This route is excluded from public navigation, excluded from sitemaps, and marked with noindex).*

---

## 7. Documentation Index

Comprehensive guides for development and extension:
- `docs/ARCHITECTURE.md` — System architecture and client routing
- `docs/DESIGN_SYSTEM.md` — Visual tokens, zero-pill rules, and typography
- `docs/TOOL_REGISTRY.md` — Central registry schema and validation
- `docs/ADDING_A_TOOL.md` — Step-by-step guide to add Tool #37
- `docs/ADDING_AN_ARTICLE.md` — Content schema and authoring guides
- `docs/ENGINE_INTEGRATION.md` — Phase 2 adapter contracts and WASM binding
- `docs/LOCALIZATION.md` — 8-language translations and Arabic RTL handling
- `docs/SEO.md` — Meta tags, structured JSON-LD, and noindex rules
- `docs/GLOBAL_SEARCH_GROWTH.md` — Search-intent workflow hubs, internal distribution, and global growth quality gates
- `docs/PRODUCT_EXPERIENCE_STANDARD.md` — Product-page anatomy, tool-specific content, SEO accuracy, privacy rules, and quality gates
- `docs/IMPLEMENTATION_STATUS.md` — Verified feature checklist

Every registered tool has a localized usage guide at `/:lang/tools/:slug/how-to`. The guide captures the rendered tool workspace at runtime and adds numbered orange annotations; automated browser coverage checks all 36 guides.
