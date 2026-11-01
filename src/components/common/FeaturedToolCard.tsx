import React from 'react';
import { ToolDefinition } from '../../registry/tool-types';
import { useI18n } from '../../i18n';
import { Link } from '../../router';
import { Icon } from './Icon';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getCategoryById } from '../../registry/categories.registry';

interface FeaturedToolCardProps {
  tool: ToolDefinition;
  className?: string;
}

export const FeaturedToolCard: React.FC<FeaturedToolCardProps> = ({ tool, className = '' }) => {
  const { locale, t } = useI18n();
  const category = getCategoryById(tool.category);

  const name = tool.localizedName[locale] || tool.localizedName.en;
  const description = tool.localizedDescription[locale] || tool.localizedDescription.en;
  const categoryTitle = category ? category.localizedTitle[locale] || category.localizedTitle.en : tool.category;

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-white to-orange-50/40 border border-stone-200/90 hover:border-orange-300 transition-all flex flex-col justify-between shadow-xs hover:shadow-md relative group ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-xs">
            <Icon name={tool.icon} size={24} />
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="font-medium text-stone-600">{categoryTitle}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="flex items-center gap-1 text-orange-600 font-medium">
              <Sparkles size={12} />
              <span>{t('common.featured')}</span>
            </span>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-stone-900 group-hover:text-orange-600 transition-colors mb-2">
          {name}
        </h3>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
          {description}
        </p>

        {tool.acceptedFormats && (
          <div className="text-xs text-stone-500 mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-stone-600 font-medium">{t('common.supported')}:</span>
            {tool.acceptedFormats.map((fmt) => (
              <span key={fmt} className="font-mono text-[11px] text-stone-600">
                {fmt}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-5 border-t border-stone-100 flex items-center justify-between">
        <span className="text-xs text-stone-400 font-mono">
          {tool.status !== 'functional' ? t('common.previewOnly') : tool.category === 'website-domain' ? t('common.publicLookup') : t('common.runsLocally')}
        </span>

        <Link
          routeType="tool"
          slug={tool.slug}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-sm font-semibold shadow-xs shadow-orange-500/20 transition-all hover:scale-102"
        >
          <span>{t('common.openTool')}</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
