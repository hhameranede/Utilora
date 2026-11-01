import React from 'react';
import { TemplateVideoConversionWorkspace } from './TemplateVideoConversionWorkspace';

export const TemplateNMediaConverter: React.FC<{ toolName: string }> = ({ toolName }) => (
  <TemplateVideoConversionWorkspace toolName={toolName} mode="audio" />
);
