import React from 'react';
import { useI18n } from '../../i18n';
import { getToolBySlug } from '../../registry/tools.registry';
import { ToolCard } from './ToolCard';

interface RelatedToolsProps {
  toolSlugs: string[];
  className?: string;
  title?: string;
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({ toolSlugs, className = '', title }) => {
  const { t } = useI18n();
  const tools = toolSlugs.map((slug) => getToolBySlug(slug)).filter(Boolean);

  if (tools.length === 0) return null;

  return (
    <section className={`pt-10 border-t border-stone-200/80 ${className}`}>
      <h3 className="text-base font-semibold text-stone-900 mb-6">
        {title || t('common.relatedTools')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <ToolCard key={tool!.id} tool={tool!} />
        ))}
      </div>
    </section>
  );
};
