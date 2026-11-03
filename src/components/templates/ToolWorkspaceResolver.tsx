import React from 'react';
import { useI18n } from '../../i18n';
import { TemplatePdfTools } from './TemplatePdfTools';
import { ToolDefinition } from '../../registry/tool-types';
import { TemplateASingleFile } from './TemplateASingleFile';
import { TemplateBMultiFile } from './TemplateBMultiFile';
import { TemplateCImageWorkspace } from './TemplateCImageWorkspace';
import { TemplateDPdfWorkspace } from './TemplateDPdfWorkspace';
import { TemplateETextEditor } from './TemplateETextEditor';
import { TemplateFTwoPanelCompare } from './TemplateFTwoPanelCompare';
import { TemplateGCodeEditor } from './TemplateGCodeEditor';
import { TemplateHEncoderDecoder } from './TemplateHEncoderDecoder';
import { TemplateIGenerator } from './TemplateIGenerator';
import { TemplateJDomainLookup } from './TemplateJDomainLookup';
import { TemplateKDnsLookup } from './TemplateKDnsLookup';
import { TemplateLWebsiteDiagnostics } from './TemplateLWebsiteDiagnostics';
import { TemplateMVideoEditor } from './TemplateMVideoEditor';
import { TemplateNMediaConverter } from './TemplateNMediaConverter';
import { TemplateOMediaMetadata } from './TemplateOMediaMetadata';
import { TemplatePThumbnailExtractor } from './TemplatePThumbnailExtractor';

interface ToolWorkspaceResolverProps {
  tool: ToolDefinition;
}

export const ToolWorkspaceResolver: React.FC<ToolWorkspaceResolverProps> = ({ tool }) => {
  const { locale, t } = useI18n();
  const toolName = tool.localizedName[locale] || tool.localizedName.en;

  // This item is intentionally a non-interactive preview until a real direct-media engine exists.
  // Do not expose the generic file uploader: it suggests support for PDFs and images that this tool does not provide.
  if (tool.slug === 'video-downloader') {
    return (
      <div className="rounded-2xl border border-dashed border-orange-300 bg-orange-50/50 p-5 sm:p-7" role="status">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-white text-orange-700">
            <span aria-hidden="true" className="text-lg">▶</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">{t('product.previewOnly')}</p>
            <p className="mt-0.5 text-xs text-orange-800">{t('product.notAvailable')}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-stone-700">{tool.localizedDescription[locale] || tool.localizedDescription.en}</p>
        <p className="mt-3 text-xs leading-5 text-stone-600">{t('product.previewNotWorking')}</p>
      </div>
    );
  }

  if (tool.category === 'image') {
    return (
      <TemplateCImageWorkspace
        toolName={toolName}
        toolSlug={tool.slug}
        defaultFormat={tool.slug === 'image-converter' ? 'webp' : 'jpeg'}
      />
    );
  }

  if (tool.category === 'pdf') {
    return <TemplatePdfTools toolName={toolName} toolSlug={tool.slug} />;
  }

  switch (tool.template) {
    case 'template-a-single-file':
      return (
        <TemplateASingleFile
          toolName={toolName}
          acceptedFormats={tool.acceptedFormats}
          maxFileSize={tool.maxFileSize}
        />
      );

    case 'template-b-multi-file':
      return (
        <TemplateBMultiFile
          toolName={toolName}
          acceptedFormats={tool.acceptedFormats}
        />
      );

    case 'template-c-image-workspace':
      return (
        <TemplateCImageWorkspace
          toolName={toolName}
          toolSlug={tool.slug}
          defaultFormat={tool.slug === 'image-converter' ? 'webp' : 'jpeg'}
          showCropperGrid={tool.slug === 'image-cropper'}
        />
      );

    case 'template-d-pdf-workspace':
      return <TemplateDPdfWorkspace toolName={toolName} />;

    case 'template-e-text-editor':
      return (
        <TemplateETextEditor
          toolName={toolName}
          toolSlug={tool.slug}
          defaultText=""
          showCaseOptions={tool.slug === 'case-converter'}
          showDedupeOptions={tool.slug === 'duplicate-lines-remover'}
          showSortOptions={tool.slug === 'sort-text-lines'}
        />
      );

    case 'template-f-two-panel-compare':
      return <TemplateFTwoPanelCompare toolName={toolName} />;

    case 'template-g-code-editor':
      return <TemplateGCodeEditor toolName={toolName} toolSlug={tool.slug} />;

    case 'template-h-encoder-decoder':
      return <TemplateHEncoderDecoder toolName={toolName} toolSlug={tool.slug} />;

    case 'template-i-generator':
      return (
        <TemplateIGenerator
          toolName={toolName}
          type={tool.slug === 'hash-generator' ? 'hash' : 'uuid'}
        />
      );

    case 'template-j-domain-lookup':
      return <TemplateJDomainLookup toolName={toolName} toolSlug={tool.slug} />;

    case 'template-k-dns-lookup':
      return <TemplateKDnsLookup toolName={toolName} />;

    case 'template-l-website-diagnostics':
      return <TemplateLWebsiteDiagnostics toolName={toolName} toolSlug={tool.slug} />;

    case 'template-m-video-editor':
      return <TemplateMVideoEditor toolName={toolName} toolSlug={tool.slug} />;

    case 'template-n-media-converter':
      return <TemplateNMediaConverter toolName={toolName} />;

    case 'template-o-media-metadata':
      return (
        <TemplateOMediaMetadata toolName={toolName} />
      );

    case 'template-p-thumbnail-extractor':
      return <TemplatePThumbnailExtractor toolName={toolName} />;

    default:
      return <TemplateASingleFile toolName={toolName} />;
  }
};
