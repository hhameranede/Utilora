# Central Tool Registry (`src/registry/tools.registry.ts`)

## 1. Schema Contract

Each of the 36 tools is declared through the strongly-typed `ToolDefinition` interface:

```typescript
export interface ToolDefinition {
  id: string;                      // Unique machine identifier (e.g. 'image-converter')
  slug: string;                    // URL routing slug (e.g. 'image-converter')
  category: CategoryId;            // One of the 6 categories ('image' | 'pdf' | 'text' | 'developer' | 'website-domain' | 'video')
  icon: string;                    // Lucide icon identifier (e.g. 'RefreshCw')
  template: ToolTemplateType;      // One of the 16 templates ('template-a-single-file' ... 'template-p-thumbnail-extractor')
  localizedName: LocalizedString;  // 8-language localized tool name
  localizedDescription: LocalizedString; // Short explanation for cards & search
  acceptedFormats?: string[];      // Supported extensions (e.g. ['.png', '.jpg', '.webp'])
  maxFileSize?: string;            // Default file limitation (e.g. '50 MB')
  relatedTools: string[];          // Slugs of related tools for cross-linking
  seo: LocalizedSEO;               // Page title, meta description, keywords
  status: 'planned' | 'ui-ready' | 'functional';
  engineContractRef: string;       // Path to Phase 2 adapter interface
}
```

## 2. Registry Guarantees

1. **Deterministic Slugs:** Slugs remain invariant across all 8 languages (`/en/tools/json-formatter`, `/ar/tools/json-formatter`).
2. **Template Decoupling:** Adding or modifying a tool requires zero changes to route handlers or layout trees.
3. **Automated Search Indexing:** The `GlobalSearch` dialog automatically indexes all registered tools, their categories, and supported formats.
