import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { SAMPLE_ARTICLES } from '../../data/articles.data';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Head } from '../../seo/Head';
import { Link } from '../../router';
import { BookOpen, Clock, ArrowRight, Search, Mail } from 'lucide-react';

export const ArticlesIndexPage: React.FC = () => {
  const { locale, t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'guides', 'tutorials', 'tips', 'comparisons', 'explanations'];

  const filteredArticles = SAMPLE_ARTICLES.filter((art) => {
    const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;
    const title = (art.title[locale] || art.title.en).toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q || title.includes(q) || art.tags.join(' ').toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const featured = SAMPLE_ARTICLES[0];

  return (
    <>
      <Head
        title="Articles, Guides & Documentation — UTILORA"
        description="Comprehensive technical tutorials, image compression benchmarks, and web standard guides authored by UTILORA."
        locale={locale}
        routeType="articles-index"
        isIndexable={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <Breadcrumbs items={[{ label: t('nav.articles') }]} />

        {/* Hero Section */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-xs font-mono uppercase tracking-widest text-orange-600 font-semibold">
            UTILORA Editorial Desk
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900">
            {t('articles.title')}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            {t('articles.subtitle')}
          </p>
        </div>

        {/* Featured Article Spotlight */}
        {featured && (
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-orange-50/60 via-white to-orange-50/40 border border-orange-200/90 shadow-xs relative overflow-hidden group">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span className="text-orange-600 font-mono uppercase font-semibold">Featured Guide</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="capitalize">{featured.category}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>{featured.readingTimeMinutes} {t('articles.readTime')}</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-bold text-stone-900 group-hover:text-orange-600 transition-colors">
                {featured.title[locale] || featured.title.en}
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {featured.excerpt[locale] || featured.excerpt.en}
              </p>

              <div className="pt-2">
                <Link
                  routeType="article-detail"
                  slug={featured.slug}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs shadow-orange-500/20 transition-all hover:scale-102"
                >
                  <span>Read Full Article</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 bg-stone-100 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('articles.searchPlaceholder')}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs transition-all"
            />
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <Link
              key={art.id}
              routeType="article-detail"
              slug={art.slug}
              className="group p-6 rounded-3xl bg-white hover:bg-white border border-stone-200/90 hover:border-orange-300 transition-all flex flex-col justify-between shadow-xs hover:shadow-md hover:shadow-orange-500/5"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-400 mb-3">
                  <span className="capitalize text-stone-600 font-medium">{art.category}</span>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span>{art.readingTimeMinutes} {t('articles.readTime')}</span>
                </div>

                <h3 className="text-base font-semibold text-stone-900 group-hover:text-orange-600 transition-colors mb-2 leading-snug">
                  {art.title[locale] || art.title.en}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
                  {art.excerpt[locale] || art.excerpt.en}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-medium text-stone-500 group-hover:text-orange-600">
                <span>Read Guide</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter Subscription Area (Inactive UI Placeholder) */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-stone-200/90 shadow-xs text-center max-w-2xl mx-auto space-y-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 mx-auto flex items-center justify-center text-orange-600">
            <Mail size={18} />
          </div>
          <h3 className="text-lg font-bold text-stone-900">
            {t('articles.newsletterTitle')}
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {t('articles.newsletterDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              disabled
              placeholder={t('articles.newsletterPlaceholder')}
              className="flex-1 px-4 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-500 cursor-not-allowed"
            />
            <button
              disabled
              className="px-4 py-2 rounded-xl bg-stone-200 border border-stone-300 text-xs font-semibold text-stone-600 cursor-not-allowed"
            >
              {t('articles.subscribe')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
