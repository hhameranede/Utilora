import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { TOOLS_LIST } from '../registry/tools.registry';
import { CATEGORIES_LIST } from '../registry/categories.registry';
import { ToolCard } from '../components/common/ToolCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Head } from '../seo/Head';
import { Search, Filter } from 'lucide-react';
import { CategoryId } from '../registry/tool-types';
import { matchesSearch } from '../utils/search';

export const ToolsIndexPage: React.FC = () => {
  const { locale, t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTools = TOOLS_LIST.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesQuery = matchesSearch(searchQuery, tool.localizedName, tool.localizedDescription, tool.slug, tool.acceptedFormats);
    return matchesCategory && matchesQuery;
  });

  return (
    <>
      <Head
        title="All 36 Online Digital Tools — UTILORA"
        description="Browse the complete catalog of 36 free digital tools: Image converter, PDF merger, JSON formatter, DNS lookup, Video trimmer, and more."
        locale={locale}
        routeType="tools-index"
        isIndexable={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <Breadcrumbs items={[{ label: t('nav.tools') }]} />

        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
            {t('nav.allTools')} (36)
          </h1>
          <p className="text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
            {t('tools.description')}
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setSelectedCategory('all')}
              aria-pressed={selectedCategory === 'all'}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-orange-700 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('common.all')} (36)
            </button>
            {CATEGORIES_LIST.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={selectedCategory === cat.id}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-orange-700 text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat.localizedTitle[locale] || cat.localizedTitle.en}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-orange-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.searchPlaceholder')}
              className="w-full ps-9 pe-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs transition-all"
            />
          </div>
        </div>

        <p className="-mt-6 text-xs text-stone-500">{t('tools.scrollHint')}</p>

        {/* Tool Cards Grid */}
        {filteredTools.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-sm">
            {t('common.noResults')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};
