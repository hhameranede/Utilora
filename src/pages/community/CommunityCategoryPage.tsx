import React from 'react';
import { useI18n } from '../../i18n';
import { FORUM_CATEGORIES, SAMPLE_TOPICS } from '../../data/community.data';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Head } from '../../seo/Head';
import { Link } from '../../router';
import { MessageCircle, Eye, ArrowRight } from 'lucide-react';
import { NotFoundPage } from '../NotFoundPage';

interface CommunityCategoryPageProps {
  categorySlug: string;
}

export const CommunityCategoryPage: React.FC<CommunityCategoryPageProps> = ({ categorySlug }) => {
  const { locale, t } = useI18n();

  const category = FORUM_CATEGORIES.find((c) => c.slug === categorySlug);
  if (!category) return <NotFoundPage />;
  const topics = SAMPLE_TOPICS.filter((t) => t.categorySlug === categorySlug);
  const title = category.title[locale] || category.title.en;

  return (
    <>
      <Head
        title={`${title} — UTILORA Community`}
        description={category.description[locale] || category.description.en}
        locale={locale}
        routeType="community-category"
        slug={categorySlug}
        isIndexable={false}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <Breadcrumbs
          items={[
            { label: t('nav.community'), routeType: 'community-index' },
            { label: title },
          ]}
        />

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-orange-600 font-semibold">
            Forum Board
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
            {title}
          </h1>
          <p className="text-sm text-stone-600">
            {category.description[locale] || category.description.en}
          </p>
        </div>

        <div className="space-y-3">
          {topics.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center text-xs text-stone-400 shadow-xs">
              No topics in this category yet.
            </div>
          ) : (
            topics.map((topic) => (
              <Link
                key={topic.id}
                routeType="community-topic"
                slug={topic.slug}
                className="group p-5 rounded-2xl bg-white hover:bg-white border border-stone-200/90 hover:border-orange-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-sm"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <span className="font-medium text-stone-600">{topic.author}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span>{topic.createdAt}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-stone-900 group-hover:text-orange-600 transition-colors truncate">
                    {topic.title[locale] || topic.title.en}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-stone-400 shrink-0">
                  <span className="flex items-center gap-1">
                    <MessageCircle size={13} />
                    <span>{topic.replyCount}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={13} />
                    <span>{topic.viewCount}</span>
                  </span>
                  <span className="text-stone-500">{topic.lastActivity}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
};
