import React from 'react';
import { TemplateVideoConversionWorkspace } from './TemplateVideoConversionWorkspace';

export const TemplateMVideoEditor: React.FC<{ toolName: string; toolSlug: string }> = ({ toolName, toolSlug }) => (
  <TemplateVideoConversionWorkspace
    toolName={toolName}
    mode={toolSlug === 'video-trimmer' ? 'trim' : 'compress'}
  />
);
