# UTILORA System Architecture

## 1. Directory Structure

```
/
├── src/
│   ├── components/
│   │   ├── common/              # Shared design system components
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── DisabledAction.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── FAQAccordion.tsx
│   │   │   ├── FeaturedToolCard.tsx
│   │   │   ├── GlobalSearch.tsx
│   │   │   ├── Icon.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── RelatedArticles.tsx
│   │   │   ├── RelatedTools.tsx
│   │   │   ├── SiteFooter.tsx
│   │   │   ├── SiteHeader.tsx
│   │   │   └── ToolCard.tsx
│   │   └── templates/           # 16 Reusable Tool Workspaces (A through P)
│   │       ├── TemplateASingleFile.tsx
│   │       ├── TemplateBMultiFile.tsx
│   │       ├── TemplateCImageWorkspace.tsx
│   │       ├── TemplateDPdfWorkspace.tsx
│   │       ├── TemplateETextEditor.tsx
│   │       ├── TemplateFTwoPanelCompare.tsx
│   │       ├── TemplateGCodeEditor.tsx
│   │       ├── TemplateHEncoderDecoder.tsx
│   │       ├── TemplateIGenerator.tsx
│   │       ├── TemplateJDomainLookup.tsx
│   │       ├── TemplateKDnsLookup.tsx
│   │       ├── TemplateLWebsiteDiagnostics.tsx
│   │       ├── TemplateMVideoEditor.tsx
│   │       ├── TemplateNMediaConverter.tsx
│   │       ├── TemplateOMediaMetadata.tsx
│   │       ├── TemplatePThumbnailExtractor.tsx
│   │       └── ToolWorkspaceResolver.tsx
│   ├── data/                    # Sample data for editorial & community
│   │   ├── articles.data.ts
│   │   └── community.data.ts
│   ├── engines/                 # Phase 2 Typed Engine Integration Contracts
│   │   ├── developer/contracts.ts
│   │   ├── diagnostics/contracts.ts
│   │   ├── image/contracts.ts
│   │   ├── pdf/contracts.ts
│   │   ├── text/contracts.ts
│   │   ├── video/contracts.ts
│   │   └── types.ts
│   ├── i18n/                    # 8-language localization system
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   ├── ar.json
│   │   │   ├── fr.json
│   │   │   ├── es.json
│   │   │   ├── pt.json
│   │   │   ├── hi.json
│   │   │   ├── zh.json
│   │   │   └── bn.json
│   │   └── index.tsx
│   ├── pages/                   # Application views
│   │   ├── articles/
│   │   ├── community/
│   │   ├── dev/
│   │   ├── legal/
│   │   ├── CategoryPage.tsx
│   │   ├── CategoriesIndexPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── ToolPage.tsx
│   │   └── ToolsIndexPage.tsx
│   ├── registry/                # Central registries for tools and categories
│   │   ├── categories.registry.ts
│   │   ├── tool-types.ts
│   │   └── tools.registry.ts
│   ├── router/                  # Path-based client router
│   │   ├── index.tsx
│   │   ├── matcher.ts
│   │   └── types.ts
│   ├── seo/                     # Metadata, hreflang, JSON-LD, sitemap
│   │   ├── Head.tsx
│   │   ├── meta.ts
│   │   └── sitemap.ts
│   ├── tests/                   # Pure logic unit tests
│   │   └── registry.test.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
```

## 2. Separation of Concerns
1. **Registry (`src/registry/`):** Strongly-typed metadata source of truth for tools, slugs, categories, icons, accepted file extensions, and template bindings.
2. **Template Library (`src/components/templates/`):** 16 reusable UI layouts. Tool pages do not duplicate UI; they invoke `ToolWorkspaceResolver` with their specific tool definition.
3. **Engines (`src/engines/`):** Pure TypeScript interfaces (`ToolAdapter`) specifying input formats, options, progress callbacks, and output structures. Zero WASM binaries or heavy libraries are bundled in Phase 1.
4. **Router (`src/router/`):** Decoupled path parsing with locale awareness (`/:lang/...`), popstate synchronization, and 404 fallback routing.
