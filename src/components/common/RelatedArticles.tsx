import React from 'react';
import { useI18n } from '../../i18n';
import { SAMPLE_ARTICLES, ArticleItem } from '../../data/articles.data';
import { Link } from '../../router';
import { BookOpen, ArrowUpRight } from 'lucide-react';

interface RelatedArticlesProps {
  articleSlugs?: string[];
  categoryFilter?: string;
  className?: string;
  title?: string;
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({
  articleSlugs,
  categoryFilter,
  className = '',
  title,
}) => {
  const { locale, t } = useI18n();

  let articles: ArticleItem[] = [];
  if (articleSlugs && articleSlugs.length > 0) {
    articles = SAMPLE_ARTICLES.filter((a) => articleSlugs.includes(a.slug));
  } else if (categoryFilter) {
    articles = SAMPLE_ARTICLES.filter((a) => a.category === categoryFilter);
  } else {
    articles = SAMPLE_ARTICLES.slice(0, 3);
  }

  if (articles.length === 0) return null;

  return (
    <section className={`pt-10 border-t border-stone-200/80 ${className}`}>
      <h3 className="text-base font-semibold text-stone-900 mb-6">
        {title || t('common.relatedArticles')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((art) => (
          <Link
            key={art.id}
            routeType="article-detail"
            slug={art.slug}
            className="group p-5 rounded-2xl bg-white hover:bg-white border border-stone-200/90 hover:border-orange-300 transition-all flex flex-col justify-between shadow-xs hover:shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-400 mb-3">
                <span className="capitalize">{art.category}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>{art.readingTimeMinutes} {t('articles.readTime')}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                {art.title[locale] || art.title.en}
              </h4>
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-stone-500 group-hover:text-orange-600 pt-4 border-t border-stone-100 mt-3">
              <span>Read article</span>
              <ArrowUpRight size={13} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
