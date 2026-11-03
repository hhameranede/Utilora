import React from 'react';
import { ToolDefinition } from '../../registry/tool-types';
import { useI18n } from '../../i18n';
import { Link } from '../../router';
import { Icon } from './Icon';
import { ArrowUpRight } from 'lucide-react';
import { getCategoryById } from '../../registry/categories.registry';

interface ToolCardProps {
  tool: ToolDefinition;
  className?: string;
  variant?: 'standard' | 'compact' | 'featured';
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, className = '', variant = 'standard' }) => {
  const { locale, t } = useI18n();
  const category = getCategoryById(tool.category);

  const name = tool.localizedName[locale] || tool.localizedName.en;
  const description = tool.localizedDescription[locale] || tool.localizedDescription.en;
  const categoryTitle = category ? category.localizedTitle[locale] || category.localizedTitle.en : tool.category;

  if (variant === 'compact') {
    return (
      <Link
        routeType="tool"
        slug={tool.slug}
        scrollTo="tool-workspace"
        className={`ul-tool-card group p-3.5 rounded-xl bg-white hover:bg-orange-50/40 border border-stone-200/80 hover:border-orange-300 transition-all flex items-center justify-between gap-3 shadow-xs hover:shadow-sm ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-orange-50 group-hover:bg-orange-700 flex items-center justify-center text-orange-700 group-hover:text-white shrink-0 transition-colors">
            <Icon name={tool.icon} size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-stone-900 group-hover:text-orange-700 truncate">
              {name}
            </h4>
            <span className="text-xs text-stone-500 truncate block">
              {categoryTitle}
            </span>
          </div>
        </div>
        <ArrowUpRight size={14} className="text-stone-500 group-hover:text-orange-700 shrink-0 transition-colors" />
      </Link>
    );
  }

  return (
    <Link
      routeType="tool"
      slug={tool.slug}
      scrollTo="tool-workspace"
      className={`ul-tool-card group p-5 rounded-2xl bg-white hover:bg-white border border-stone-200/80 hover:border-orange-300 transition-all flex flex-col justify-between relative shadow-xs hover:shadow-md hover:shadow-orange-500/5 ${className}`}
    >
      <div>
        {/* Header Icon + Metadata in Zero-Pill Unboxed Text */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-700 border border-orange-100 flex items-center justify-center text-orange-700 group-hover:text-white transition-all shadow-xs">
            <Icon name={tool.icon} size={19} />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <span className="font-medium text-stone-500 group-hover:text-orange-700 transition-colors">
              {categoryTitle}
            </span>
            {tool.isPopular && (
              <>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="text-orange-700 font-semibold">{t('common.popular')}</span>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-stone-900 group-hover:text-orange-700 transition-colors mb-1.5">
          {name}
        </h3>

        {/* Description */}
        <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed mb-4">
          {description}
        </p>
      </div>

      {/* Footer State: Formats or Engine preview reminder */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <span className="truncate">
          {tool.status !== 'functional' ? t('common.previewOnly') : tool.acceptedFormats ? tool.acceptedFormats.slice(0, 3).join(', ') : tool.category === 'website-domain' ? t('common.publicLookup') : t('common.runsLocally')}
        </span>
        <span className="inline-flex items-center justify-center gap-1.5 shrink-0 rounded-lg border border-orange-100 bg-orange-50 px-3 py-2 text-orange-800 font-semibold transition-all group-hover:border-orange-700 group-hover:bg-orange-700 group-hover:text-white">
          <span>{t('common.openTool')}</span>
          <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  );
};
