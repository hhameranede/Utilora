# Guide: How to Add Tool Number 37 to UTILORA

Adding a new tool (e.g. Tool #37: `audio-pitch-shifter` or `svg-optimizer`) to UTILORA follows an organized, registry-driven workflow that requires **zero routing or header modifications**.

---

## Step 1: Select or Create a Reusable Template

Inspect the 16 existing templates in `/dev/templates` (Template A through P).
- If your tool fits an existing template (e.g. `Template C` for visual adjustments or `Template N` for audio processing), use that template type:
  ```ts
  template: 'template-n-media-converter'
  ```
- If a new specialized layout is required, create `src/components/templates/TemplateQYourWorkspace.tsx`, register its type in `src/registry/tool-types.ts`, and map it inside `src/components/templates/ToolWorkspaceResolver.tsx`.

---

## Step 2: Define the Engine Contract

Create the typed adapter contract in `src/engines/<category>/contracts.ts`:

```typescript
export interface SvgOptimizerInput {
  file: File;
}
export interface SvgOptimizerOptions {
  stripComments?: boolean;
  precision?: number;
}
export interface SvgOptimizerOutput {
  optimizedSvgText: string;
  bytesSaved: number;
}

export const SvgOptimizerAdapter: ToolAdapter<SvgOptimizerInput, SvgOptimizerOptions, SvgOptimizerOutput> = {
  id: 'svg-optimizer',
  name: 'SVG Optimizer Adapter',
  isConnected: false,
  async execute() {
    // Phase 2: Connect SVGO WebAssembly / JS engine
    throw new Error('Engine not connected.');
  },
};
```

---

## Step 3: Register the Tool in `src/registry/tools.registry.ts`

Add Tool #37 to `TOOLS_REGISTRY`:

```typescript
'svg-optimizer': {
  id: 'svg-optimizer',
  slug: 'svg-optimizer',
  category: 'image',
  icon: 'FileCode',
  template: 'template-c-image-workspace',
  status: 'ui-ready',
  engineContractRef: 'src/engines/image/contracts.ts#SvgOptimizerAdapter',
  acceptedFormats: ['.svg'],
  maxFileSize: '20 MB',
  localizedName: {
    en: 'SVG Optimizer',
    ar: 'محسن ومقلص ملفات SVG',
    fr: 'Optimiseur SVG',
    es: 'Optimizador SVG',
    pt: 'Otimizador SVG',
    hi: 'एसवीजी अनुकूलक',
    zh: 'SVG 矢量图优化与体积压缩器',
    bn: 'এসভিজি অপ্টিমাইজার',
  },
  localizedDescription: {
    en: 'Clean SVG XML markup, remove metadata, and shrink vector file size without visual loss.',
    ar: 'تنقية شفرة SVG وحذف البيانات الوصفية الزائدة وتقليص الحجم دون فقدان الدقة.',
  },
  relatedTools: ['image-compressor', 'image-converter'],
  seo: {
    metaTitle: { en: 'SVG Optimizer — Minify Vector Graphics | UTILORA', ar: 'محسن SVG أونلاين | يوتيلورا' },
    metaDescription: { en: 'Clean up and minify SVG vector graphics in your browser.', ar: 'تنظيف وتقليص ملفات SVG في المتصفح.' },
    keywords: ['svg optimizer', 'svgo online', 'compress svg'],
  },
},
```

---

## Step 4: Verify Live Availability

Once added to the registry:
1. The new tool route automatically resolves at `/:lang/tools/svg-optimizer` in all 8 languages.
2. It appears in the Category page (`/:lang/categories/image`) and catalog (`/:lang/tools`).
3. It is immediately searchable via Global Search (`⌘K`).
4. Unit tests (`npx --yes tsx --test src/tests/registry.test.ts`) verify registry integrity.
