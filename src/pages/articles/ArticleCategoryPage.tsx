import React from 'react';
import { useI18n } from '../../i18n';
import { SAMPLE_ARTICLES } from '../../data/articles.data';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Head } from '../../seo/Head';
import { Link } from '../../router';
import { ArrowRight } from 'lucide-react';
import { NotFoundPage } from '../NotFoundPage';

interface ArticleCategoryPageProps {
  categorySlug: string;
}

export const ArticleCategoryPage: React.FC<ArticleCategoryPageProps> = ({ categorySlug }) => {
  const { locale, t } = useI18n();

  const articles = SAMPLE_ARTICLES.filter((a) => a.category === categorySlug);
  if (articles.length === 0) return <NotFoundPage />;
  const categoryTitle = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  return (
    <>
      <Head
        title={`${categoryTitle} — Articles & Guides | UTILORA`}
        description={`Explore editorial guides, technical tutorials, and format benchmarks in the ${categoryTitle} category.`}
        locale={locale}
        routeType="article-category"
        slug={categorySlug}
        isIndexable={false}
      />

      <div className="ul-content-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <Breadcrumbs
          items={[
            { label: t('nav.articles'), routeType: 'articles-index' },
            { label: categoryTitle },
          ]}
        />

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-orange-600 font-semibold">
            Editorial Category
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-1">
            {categoryTitle}
          </h1>
          <p className="text-sm text-stone-600 mt-2">
            Curated technical write-ups and implementation notes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <Link
              key={art.id}
              routeType="article-detail"
              slug={art.slug}
              className="group p-6 rounded-3xl bg-white hover:bg-white border border-stone-200/90 hover:border-orange-300 transition-all flex flex-col justify-between shadow-xs hover:shadow-md hover:shadow-orange-500/5"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-400 mb-3">
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
      </div>
    </>
  );
};
