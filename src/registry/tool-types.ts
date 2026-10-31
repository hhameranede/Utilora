/**
 * UTILORA Tool & Category Registry Types
 * Central strongly-typed contracts for all 36 planned tools and 6 major categories.
 */

export type CategoryId =
  | 'image'
  | 'pdf'
  | 'text'
  | 'developer'
  | 'website-domain'
  | 'video';

export type ToolTemplateType =
  | 'template-a-single-file'       // Single file upload & process
  | 'template-b-multi-file'        // Multiple files queue & merge/batch
  | 'template-c-image-workspace'   // Image preview, canvas & resize/crop controls
  | 'template-d-pdf-workspace'     // PDF pages grid, reorder & arrangement
  | 'template-e-text-editor'       // Text stats, manipulation & transformation
  | 'template-f-two-panel-compare' // Side-by-side diff comparison
  | 'template-g-code-editor'       // Code syntax editor with formatting controls
  | 'template-h-encoder-decoder'   // Dual-box encoder/decoder with swap
  | 'template-i-generator'         // Configurable generator with batch output
  | 'template-j-domain-lookup'     // Domain registration & RDAP inspection
  | 'template-k-dns-lookup'        // DNS record querying & table viewer
  | 'template-l-website-diagnostics' // HTTP headers & status checker
  | 'template-m-video-editor'      // Video timeline, trimmer & compressor
  | 'template-n-media-converter'   // Audio/video format converter
  | 'template-o-media-metadata'    // Technical media metadata inspector
  | 'template-p-thumbnail-extractor'; // Video thumbnail scrubber & export

export type ToolStatus = 'planned' | 'ui-ready' | 'functional';

export interface LocalizedString {
  en: string;
  ar: string;
  fr?: string;
  es?: string;
  pt?: string;
  hi?: string;
  zh?: string;
  bn?: string;
  [key: string]: string | undefined;
}

export interface LocalizedSEO {
  metaTitle: LocalizedString;
  metaDescription: LocalizedString;
  keywords: string[];
}

export interface ToolDefinition {
  id: string;
  slug: string;
  category: CategoryId;
  icon: string; // Lucide icon identifier
  template: ToolTemplateType;
  localizedName: LocalizedString;
  localizedDescription: LocalizedString;
  longDescription?: LocalizedString;
  acceptedFormats?: string[];
  maxFileSize?: string;
  relatedTools: string[];
  seo: LocalizedSEO;
  status: ToolStatus;
  engineContractRef: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  privacyNotice?: LocalizedString;
  features?: string[];
  faqs?: Array<{
    question: LocalizedString;
    answer: LocalizedString;
  }>;
}

export interface CategoryDefinition {
  id: CategoryId;
  slug: string;
  icon: string;
  accentColor: string;
  localizedTitle: LocalizedString;
  localizedDescription: LocalizedString;
  localizedLongDescription: LocalizedString;
  toolCount: number;
}
