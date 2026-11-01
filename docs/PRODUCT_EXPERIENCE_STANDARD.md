# UTILORA Product Experience Standard

## Purpose

UTILORA is one parent brand with a catalog of focused browser tools. Each tool detail page should behave like a small product landing page for one clearly defined task, while keeping the real workspace immediately usable and keeping the parent UTILORA identity visible.

This standard deliberately does **not** create separate websites or subdomains for each tool. URL paths such as `/:lang/tools/:slug` remain part of the same site. Google may show each page as an individual search result for its task, but a folder under one domain is not a separate Google "site name".

## Product page anatomy

Every functional tool page should include:

1. A concise, task-specific product promise and localized H1.
2. A clear primary action that jumps to the real workspace.
3. The actual working tool, not a mockup or promotional substitute.
4. Three tool-specific capability highlights.
5. A short, accurate workflow describing how the tool really works.
6. One practical use case that helps a visitor recognize the task.
7. An honest privacy/connection explanation.
8. Supported formats and limits when they apply.
9. A screenshot-based how-to guide from the real workspace.
10. Tool-specific FAQs and a small set of relevant internal links.

The workspace remains prominent. Product copy must never push the utility below a long sales page.

## Product content registry

`src/registry/tool-experience.registry.ts` is the single source of task-specific page content. Each registry entry contains:

- `positioning`: a unique value proposition in English and Arabic.
- `benefits`: three task-specific capability highlights in both languages.
- `steps`: three accurate workflow steps in both languages.
- `example`: a practical scenario in both languages.
- `eyebrow`: a compact category label for the product header.

The registry must have exact one-to-one coverage with `TOOLS_LIST`: no missing tools and no orphan content. When adding a new tool, update its experience entry and its tests in the same change.

For locales other than Arabic, the initial product-specific content currently falls back to English while the tool name and core description use the localized tool registry. Expand product copy into the other six locales as reviewed human-quality translations; do not create machine-generated filler simply to make every field look translated.

## SEO rules

- Use each tool's own `seo.metaTitle` and `seo.metaDescription`; do not replace them with a shared generic title.
- Keep one canonical URL per localized tool page and its matching `hreflang` alternates.
- Keep preview-only or non-functional tools out of the production sitemap and set them to `noindex, nofollow`.
- Structured data must describe the actual free utility product. Never invent ratings, reviews, downloads, users, endorsements, performance claims, or unsupported capabilities.
- Write page copy for the task and search intent, not for keyword density.
- Do not generate near-identical doorway pages or create subdomains just to make one product appear to be a separate Google site.
- A distinct tool page can compete for relevant queries, but search rankings and rich-result display are not guaranteed.

## Accuracy and privacy rules

- Distinguish browser-local processing tools from public network lookups.
- For browser-local tools, state that user files/text are processed in the browser only where that is verified by the engine.
- For Website & Domain tools, explain that the submitted hostname or URL is sent to the relevant public DNS/RDAP endpoint or target website. Do not imply that these lookups are offline.
- Do not infer private website availability from a CORS-blocked response; label it unknown where appropriate.
- Show actual supported formats, limits, outputs, and processing behaviour from the tool registry and engine contracts.
- The current `video-downloader` remains a preview. Its page must not imply that download execution is enabled.

## Quality gates

The product-content test suite verifies:

- All 36 currently registered tools have one product experience.
- No experience entry refers to an unknown tool.
- Positioning statements are unique.
- Each product has three English and Arabic highlights and workflow steps.
- Each product has an English and Arabic practical use case.
- The downloader remains explicitly preview-only.

Visual and functional quality still requires the project CI suite, browser E2E tests, responsive viewport checks, and separate manual device checks. A successful build alone does not prove that a product is complete.
