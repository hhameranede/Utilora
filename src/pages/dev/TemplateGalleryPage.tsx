import React, { useState } from 'react';
import { Head } from '../../seo/Head';
import { useI18n } from '../../i18n';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import {
  TemplateASingleFile,
} from '../../components/templates/TemplateASingleFile';
import {
  TemplateBMultiFile,
} from '../../components/templates/TemplateBMultiFile';
import {
  TemplateCImageWorkspace,
} from '../../components/templates/TemplateCImageWorkspace';
import {
  TemplateDPdfWorkspace,
} from '../../components/templates/TemplateDPdfWorkspace';
import {
  TemplateETextEditor,
} from '../../components/templates/TemplateETextEditor';
import {
  TemplateFTwoPanelCompare,
} from '../../components/templates/TemplateFTwoPanelCompare';
import {
  TemplateGCodeEditor,
} from '../../components/templates/TemplateGCodeEditor';
import {
  TemplateHEncoderDecoder,
} from '../../components/templates/TemplateHEncoderDecoder';
import {
  TemplateIGenerator,
} from '../../components/templates/TemplateIGenerator';
import {
  TemplateJDomainLookup,
} from '../../components/templates/TemplateJDomainLookup';
import {
  TemplateKDnsLookup,
} from '../../components/templates/TemplateKDnsLookup';
import {
  TemplateLWebsiteDiagnostics,
} from '../../components/templates/TemplateLWebsiteDiagnostics';
import {
  TemplateMVideoEditor,
} from '../../components/templates/TemplateMVideoEditor';
import {
  TemplateNMediaConverter,
} from '../../components/templates/TemplateNMediaConverter';
import {
  TemplateOMediaMetadata,
} from '../../components/templates/TemplateOMediaMetadata';
import {
  TemplatePThumbnailExtractor,
} from '../../components/templates/TemplatePThumbnailExtractor';
import {
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../components/common/EmptyState';
import {
  Sparkles,
  Layout,
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle,
  FileText,
  Sliders,
  Code,
  Globe,
  Video,
} from 'lucide-react';

interface TemplateSpec {
  id: string;
  code: string;
  name: string;
  useCase: string;
  associatedTools: string[];
  render: () => React.ReactNode;
}

export const TemplateGalleryPage: React.FC = () => {
  const { locale } = useI18n();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('template-a');
  const [activeStateTab, setActiveStateTab] = useState<'interactive' | 'empty' | 'loading' | 'error'>('interactive');
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);

  const TEMPLATES: TemplateSpec[] = [
    {
      id: 'template-a',
      code: 'Template A',
      name: 'Single File Upload Workspace',
      useCase: 'Used for single-document analysis, format converters, and permitted direct video savers.',
      associatedTools: ['pdf-page-counter', 'video-downloader'],
      render: () => <TemplateASingleFile toolName="Single File Demo" />,
    },
    {
      id: 'template-b',
      code: 'Template B',
      name: 'Multiple File Upload & Queue Workspace',
      useCase: 'Used for document merging, batch image packaging, and bulk PDF assembly with reordering controls.',
      associatedTools: ['merge-pdf', 'jpg-to-pdf'],
      render: () => <TemplateBMultiFile toolName="Merge Documents Demo" />,
    },
    {
      id: 'template-c',
      code: 'Template C',
      name: 'Image Workspace (Canvas & Parameters)',
      useCase: 'Used for image converters, compressors, resizers, croppers, and rotators with live before/after view.',
      associatedTools: ['image-converter', 'image-compressor', 'image-resizer', 'image-cropper', 'image-rotator'],
      render: () => <TemplateCImageWorkspace toolName="Image Transformer Demo" showCropperGrid={true} />,
    },
    {
      id: 'template-d',
      code: 'Template D',
      name: 'PDF Workspace (Pages Grid & Extraction)',
      useCase: 'Used for splitting, rotating, and rendering PDF pages as high-resolution images.',
      associatedTools: ['split-pdf', 'rotate-pdf', 'pdf-to-jpg'],
      render: () => <TemplateDPdfWorkspace toolName="Split / Rotate PDF Demo" />,
    },
    {
      id: 'template-e',
      code: 'Template E',
      name: 'Text Editor Workspace (Metrics & Formatting)',
      useCase: 'Used for word counts, character limits, case conversions, line sorting, and deduplication.',
      associatedTools: ['word-counter', 'character-counter', 'case-converter', 'duplicate-lines-remover', 'sort-text-lines'],
      render: () => <TemplateETextEditor toolName="Text Analysis Demo" showCaseOptions={true} />,
    },
    {
      id: 'template-f',
      code: 'Template F',
      name: 'Two-Panel Compare Workspace (Side-by-Side Diff)',
      useCase: 'Used for comparing document drafts, code changes, and configuration files.',
      associatedTools: ['text-diff-checker'],
      render: () => <TemplateFTwoPanelCompare toolName="Text Diff Demo" />,
    },
    {
      id: 'template-g',
      code: 'Template G',
      name: 'Code Editor Workspace (Syntax & Formatting)',
      useCase: 'Used for JSON formatting, validation, and minification with line gutter and syntax styling.',
      associatedTools: ['json-formatter', 'json-validator', 'json-minifier'],
      render: () => <TemplateGCodeEditor toolName="JSON Code Workspace Demo" />,
    },
    {
      id: 'template-h',
      code: 'Template H',
      name: 'Encoder / Decoder Workspace (Bidirectional)',
      useCase: 'Used for Base64 and URL encoding/decoding with live swap and copy tools.',
      associatedTools: ['base64-encoder-decoder', 'url-encoder-decoder'],
      render: () => <TemplateHEncoderDecoder toolName="Base64 / URL Encoder Demo" />,
    },
    {
      id: 'template-i',
      code: 'Template I',
      name: 'Generator Workspace (Batch & Entropic Output)',
      useCase: 'Used for cryptographically secure UUID v4/v7 and cryptographic hash calculations.',
      associatedTools: ['uuid-generator', 'hash-generator'],
      render: () => <TemplateIGenerator toolName="UUID / Hash Generator Demo" />,
    },
    {
      id: 'template-j',
      code: 'Template J',
      name: 'Domain Lookup Workspace (Registration Intelligence)',
      useCase: 'Used for querying domain age, RDAP ownership data, and registrar status codes.',
      associatedTools: ['domain-age-checker', 'rdap-lookup'],
      render: () => <TemplateJDomainLookup toolName="Domain RDAP Demo" toolSlug="rdap-lookup" />,
    },
    {
      id: 'template-k',
      code: 'Template K',
      name: 'DNS Lookup Workspace (Authoritative Records)',
      useCase: 'Used for querying and filtering A, AAAA, MX, CNAME, TXT, NS, and SOA records.',
      associatedTools: ['dns-lookup'],
      render: () => <TemplateKDnsLookup toolName="DNS Query Demo" />,
    },
    {
      id: 'template-l',
      code: 'Template L',
      name: 'Website Diagnostics Workspace (HTTP Probe)',
      useCase: 'Used for auditing server uptime, response latency, and HTTP security headers.',
      associatedTools: ['website-status-checker', 'http-headers-checker'],
      render: () => <TemplateLWebsiteDiagnostics toolName="HTTP Diagnostic Demo" toolSlug="website-status-checker" />,
    },
    {
      id: 'template-m',
      code: 'Template M',
      name: 'Video Editor Workspace (Timeline & Trimmer)',
      useCase: 'Used for trimming video clips or compressing supported files with quality and resolution controls.',
      associatedTools: ['video-compressor', 'video-trimmer'],
      render: () => <TemplateMVideoEditor toolName="Video Trimmer Demo" toolSlug="video-trimmer" />,
    },
    {
      id: 'template-n',
      code: 'Template N',
      name: 'Media Converter Workspace (Audio Extraction)',
      useCase: 'Used for isolating audio tracks from video and transcoding to MP3, WAV, or AAC.',
      associatedTools: ['video-to-audio'],
      render: () => <TemplateNMediaConverter toolName="Video to Audio Demo" />,
    },
    {
      id: 'template-o',
      code: 'Template O',
      name: 'Video Metadata Workspace (Browser Metadata)',
      useCase: 'Used to inspect browser-exposed video duration, dimensions, aspect ratio, and estimated average bitrate.',
      associatedTools: ['video-metadata-viewer'],
      render: () => <TemplateOMediaMetadata toolName="Video Metadata Demo" />,
    },
    {
      id: 'template-p',
      code: 'Template P',
      name: 'Thumbnail Extraction Workspace (Frame Grabber)',
      useCase: 'Used for frame-by-frame filmstrip scrubbing and exporting high-res PNG/JPG stills.',
      associatedTools: ['thumbnail-extractor'],
      render: () => <TemplatePThumbnailExtractor toolName="Thumbnail Extractor Demo" />,
    },
  ];

  const currentTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  return (
    <>
      <Head
        title="Internal Template Gallery — UTILORA Lab"
        description="Non-public development showcase of all 16 reusable tool UI templates and states."
        locale={locale}
        routeType="dev-templates"
        isIndexable={false} // CRITICAL: Section 16 "must not be indexed, and must not be included in sitemap"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Gallery Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-orange-600 font-semibold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Internal Engineering Lab (Non-Public & Noindex)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            UTILORA Reusable Template Lab
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
            This internal gallery showcases all 16 standardized tool workspaces (Templates A through P) alongside their empty, interactive, loading, and error states. Use this lab to preview components when adding new tools.
          </p>
        </div>

        {/* Template Selector Horizontal Strip */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Select Template Variant (16 Available)
          </span>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplateId(tmpl.id)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-medium shrink-0 transition-all ${
                  selectedTemplateId === tmpl.id
                    ? 'bg-orange-500 text-white font-bold shadow-xs'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-300 shadow-xs'
                }`}
              >
                {tmpl.code}
              </button>
            ))}
          </div>
        </div>

        {/* Template Overview Card */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <div className="text-xs font-mono text-orange-600 font-semibold">{currentTemplate.code}</div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 mt-0.5">
                {currentTemplate.name}
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                {currentTemplate.useCase}
              </p>
            </div>

            {/* Viewport & State Controls */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Responsive Frame Toggle */}
              <button
                onClick={() => setIsMobilePreview(!isMobilePreview)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
                  isMobilePreview
                    ? 'bg-orange-50 text-orange-700 border-orange-300 font-semibold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:text-stone-900'
                }`}
                title="Toggle Mobile Viewport Simulation"
              >
                {isMobilePreview ? <Smartphone size={15} /> : <Monitor size={15} />}
                <span className="hidden sm:inline">{isMobilePreview ? 'Mobile Width (390px)' : 'Full Desktop'}</span>
              </button>
            </div>
          </div>

          {/* State Mode Toggles (Interactive, Empty, Loading, Error) */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl max-w-md">
            {(['interactive', 'empty', 'loading', 'error'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setActiveStateTab(st)}
                className={`flex-1 py-1 text-xs font-medium capitalize rounded-lg transition-colors ${
                  activeStateTab === st
                    ? 'bg-white text-orange-600 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {st} State
              </button>
            ))}
          </div>

          {/* Associated Tools Tags */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-stone-500 pt-2">
            <span className="text-stone-500 font-medium">Mapped Tools:</span>
            {currentTemplate.associatedTools.map((slug) => (
              <span key={slug} className="font-mono text-[11px] px-2 py-0.5 bg-stone-100 rounded border border-stone-200 text-stone-700">
                {slug}
              </span>
            ))}
          </div>
        </div>

        {/* Live Template Render Sandbox Container */}
        <div className={`mx-auto transition-all duration-300 ${isMobilePreview ? 'max-w-[420px] border-4 border-stone-300 p-3 rounded-[36px] bg-stone-50 shadow-lg' : 'w-full'}`}>
          {activeStateTab === 'interactive' && currentTemplate.render()}
          {activeStateTab === 'empty' && (
            <EmptyState
              title={`No Data Loaded in ${currentTemplate.name}`}
              description="Upload files or provide input payload to initialize this workspace."
            />
          )}
          {activeStateTab === 'loading' && (
            <LoadingState message="Initializing isolated client-side WebAssembly sandbox..." />
          )}
          {activeStateTab === 'error' && (
            <ErrorState
              title="Corrupted File Header Detected"
              message="The provided file payload contains invalid Magic Bytes and cannot be safely parsed."
            />
          )}
        </div>
      </div>
    </>
  );
};
