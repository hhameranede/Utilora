import React from 'react';
import { CategoryDefinition } from '../../registry/tool-types';
import { useI18n } from '../../i18n';
import { Link } from '../../router';
import { Icon } from './Icon';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  category: CategoryDefinition;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, className = '' }) => {
  const { locale, t } = useI18n();

  const title = category.localizedTitle[locale] || category.localizedTitle.en;
  const description = category.localizedDescription[locale] || category.localizedDescription.en;

  return (
    <Link
      routeType="category"
      slug={category.slug}
      className={`group p-6 rounded-2xl bg-white hover:bg-white border border-stone-200/80 hover:border-orange-300 transition-all flex flex-col justify-between relative shadow-xs hover:shadow-md hover:shadow-orange-500/5 ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-700 border border-orange-100 flex items-center justify-center text-orange-600 group-hover:text-white transition-all shadow-xs">
            <Icon name={category.icon} size={22} />
          </div>
          <span className="text-xs font-mono text-stone-500">
            {category.toolCount} {t('nav.tools').toLowerCase()}
          </span>
        </div>

        <h3 className="text-base font-semibold text-stone-900 group-hover:text-orange-600 transition-colors mb-2">
          {title}
        </h3>

        <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed mb-6">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs font-medium text-stone-500 group-hover:text-orange-600 transition-colors pt-4 border-t border-stone-100">
        <span>{t('hero.browseCategories')}</span>
        <ArrowRight size={14} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};
