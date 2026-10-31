import React from 'react';
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
  const toolName = tool.localizedName.en;

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
          defaultFormat={tool.slug === 'image-converter' ? 'webp' : 'jpg'}
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
      return <TemplateJDomainLookup toolName={toolName} />;

    case 'template-k-dns-lookup':
      return <TemplateKDnsLookup toolName={toolName} />;

    case 'template-l-website-diagnostics':
      return <TemplateLWebsiteDiagnostics toolName={toolName} />;

    case 'template-m-video-editor':
      return <TemplateMVideoEditor toolName={toolName} />;

    case 'template-n-media-converter':
      return <TemplateNMediaConverter toolName={toolName} />;

    case 'template-o-media-metadata':
      return (
        <TemplateOMediaMetadata
          toolName={toolName}
          isVideo={tool.category === 'video'}
        />
      );

    case 'template-p-thumbnail-extractor':
      return <TemplatePThumbnailExtractor toolName={toolName} />;

    default:
      return <TemplateASingleFile toolName={toolName} />;
  }
};
