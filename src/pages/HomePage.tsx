import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { Link } from '../router';
import { CATEGORIES_LIST } from '../registry/categories.registry';
import { getPopularTools, getFeaturedTools, TOOLS_LIST } from '../registry/tools.registry';
import { CategoryCard } from '../components/common/CategoryCard';
import { ToolCard } from '../components/common/ToolCard';
import { FeaturedToolCard } from '../components/common/FeaturedToolCard';
import { Head } from '../seo/Head';
import { Search, Shield, Zap, Sparkles, ArrowRight, CheckCircle2, Lock, Cpu, Globe } from 'lucide-react';
import { SAMPLE_ARTICLES } from '../data/articles.data';

export const HomePage: React.FC = () => {
  const { locale, t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  const popularTools = getPopularTools();
  const featuredTools = getFeaturedTools().slice(0, 2);

  const filteredTools = searchQuery.trim()
    ? TOOLS_LIST.filter((tool) => {
        const name = (tool.localizedName[locale] || tool.localizedName.en).toLowerCase();
        const desc = (tool.localizedDescription[locale] || tool.localizedDescription.en).toLowerCase();
        const q = searchQuery.toLowerCase();
        return name.includes(q) || desc.includes(q) || tool.slug.includes(q);
      })
    : [];

  return (
    <>
      <Head
        title="UTILORA — Every Digital Task. One Place."
        description="Global, free online digital tools platform. 36 specialized utilities for images, documents, text, code, websites, and videos."
        locale={locale}
        routeType="home"
        isIndexable={true}
        schemaType="WebSite"
      />

      <div className="w-full space-y-24 sm:space-y-32">
        {/* ========================================== */}
        {/* HERO SECTION                               */}
        {/* ========================================== */}
        <section className="relative pt-12 sm:pt-20 pb-8 text-center max-w-4xl mx-auto px-4">
          {/* Subtle orange glow behind hero title */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Clean Unboxed Category Kicker */}
          <div className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-4 font-semibold">
            {t('hero.badge')}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.1] mb-6">
            {t('hero.title')}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed mb-10">
            {t('hero.subtitle')}
          </p>

          {/* Hero Search Field */}
          <div className="max-w-2xl mx-auto relative mb-6">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-4 text-orange-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('hero.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-stone-200 text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-lg shadow-stone-200/50 transition-all"
              />
            </div>

            {/* Quick Live Search Results Dropdown */}
            {searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white border border-stone-200 p-2 shadow-2xl z-20 text-left max-h-80 overflow-y-auto">
                {filteredTools.length === 0 ? (
                  <div className="p-4 text-xs text-stone-500 text-center">
                    {t('common.noResults')}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTools.map((tool) => (
                      <Link
                        key={tool.id}
                        routeType="tool"
                        slug={tool.slug}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50/70 text-xs transition-colors"
                      >
                        <span className="font-semibold text-stone-800">
                          {tool.localizedName[locale] || tool.localizedName.en}
                        </span>
                        <span className="text-[11px] font-mono text-orange-600">
                          {tool.category}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Privacy & Guarantee Sub-badge (clean typography) */}
          <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
            <Lock size={13} className="text-orange-500" />
            <span>{t('hero.privacyBadge')}</span>
          </div>

          {/* Platform Metrics (Clean unboxed statistics) */}
          <div className="pt-12 grid grid-cols-3 max-w-lg mx-auto border-t border-stone-200 mt-12 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900">36</div>
              <div className="text-[11px] text-stone-500 mt-0.5">{t('hero.statsTools')}</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-orange-600">6</div>
              <div className="text-[11px] text-stone-500 mt-0.5">{t('hero.statsCategories')}</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900">8</div>
              <div className="text-[11px] text-stone-500 mt-0.5">{t('hero.statsGlobal')}</div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* SIX MAIN PRODUCT CATEGORIES                */}
        {/* ========================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                {t('home.categoriesHeading')}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                {t('home.categoriesSub')}
              </p>
            </div>

            <Link
              routeType="categories-index"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
            >
              <span>{t('nav.categories')}</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES_LIST.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>

        {/* ========================================== */}
        {/* POPULAR TOOLS SECTION                      */}
        {/* ========================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                {t('home.popularHeading')}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                {t('home.popularSub')}
              </p>
            </div>

            <Link
              routeType="tools-index"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
            >
              <span>{t('nav.allTools')}</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTools.slice(0, 6).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* ========================================== */}
        {/* FEATURED WORKSPACES                        */}
        {/* ========================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {t('home.featuredHeading')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {t('home.featuredSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredTools.map((tool) => (
              <FeaturedToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* ========================================== */}
        {/* HOW IT WORKS                               */}
        {/* ========================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200/90 shadow-xs">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-xl sm:text-3xl font-bold text-stone-900 mb-2">
                {t('home.howItWorksHeading')}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">
                {t('home.howItWorksSub')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-mono text-sm font-bold shadow-xs">
                  01
                </div>
                <h3 className="text-base font-semibold text-stone-900">
                  {t('home.step1Title')}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t('home.step1Desc')}
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-mono text-sm font-bold shadow-xs">
                  02
                </div>
                <h3 className="text-base font-semibold text-stone-900">
                  {t('home.step2Title')}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t('home.step2Desc')}
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-mono text-sm font-bold shadow-xs">
                  03
                </div>
                <h3 className="text-base font-semibold text-stone-900">
                  {t('home.step3Title')}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t('home.step3Desc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* PRIVACY & TRUST ARCHITECTURE               */}
        {/* ========================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-orange-50/60 via-white to-orange-50/40 border border-orange-200/80 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-orange-600 uppercase tracking-wider font-semibold">
                <Shield size={14} />
                <span>Zero Server Storage Architecture</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
                {t('home.trustHeading')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {t('common.privacyStatementDesc')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                routeType="privacy"
                className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-xs font-semibold text-white transition-colors text-center shadow-xs"
              >
                {t('footer.privacy')}
              </Link>
              <Link
                routeType="about"
                className="px-4 py-2.5 rounded-xl border border-stone-300 hover:border-orange-500 text-xs font-semibold text-stone-700 hover:text-orange-600 transition-colors text-center bg-white"
              >
                {t('footer.about')}
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* ARTICLES & GUIDES PREVIEW                  */}
        {/* ========================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                {t('home.articlesPreviewHeading')}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                {t('home.articlesPreviewSub')}
              </p>
            </div>

            <Link
              routeType="articles-index"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
            >
              <span>{t('articles.allGuides')}</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_ARTICLES.slice(0, 3).map((art) => (
              <Link
                key={art.id}
                routeType="article-detail"
                slug={art.slug}
                className="group p-6 rounded-2xl bg-white hover:bg-white border border-stone-200/90 hover:border-orange-300 transition-all flex flex-col justify-between shadow-xs hover:shadow-md hover:shadow-orange-500/5"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-400 mb-3">
                    <span className="capitalize">{art.category}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span>{art.readingTimeMinutes} {t('articles.readTime')}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                    {art.title[locale] || art.title.en}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {art.excerpt[locale] || art.excerpt.en}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-stone-500 group-hover:text-orange-600 pt-4 border-t border-stone-100 mt-4">
                  <span>Read Guide</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </>
  );
};
