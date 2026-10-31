import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { FORUM_CATEGORIES, SAMPLE_TOPICS } from '../../data/community.data';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Head } from '../../seo/Head';
import { Link } from '../../router';
import { MessageSquare, MessageCircle, ShieldCheck, Plus, Search, ArrowRight, Eye, Clock } from 'lucide-react';
import { DisabledAction } from '../../components/common/DisabledAction';

export const CommunityIndexPage: React.FC = () => {
  const { locale, t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = searchQuery.trim()
    ? SAMPLE_TOPICS.filter((top) => {
        const title = (top.title[locale] || top.title.en).toLowerCase();
        return title.includes(searchQuery.toLowerCase()) || top.content.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : SAMPLE_TOPICS;

  return (
    <>
      <Head
        title="Community & Discussions — UTILORA"
        description="Collaborate with developers and creators. Discuss in-browser WASM engines, suggest utility features, and share workflows."
        locale={locale}
        routeType="community-index"
        isIndexable={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <Breadcrumbs items={[{ label: t('nav.community') }]} />

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-200">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-orange-600 font-semibold">
              Global User Forum
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900">
              {t('community.title')}
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              {t('community.subtitle')}
            </p>
          </div>

          <div className="shrink-0">
            <button
              disabled
              className="px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-400 cursor-not-allowed flex items-center gap-2"
              title="Discussion posting will activate in Phase 2"
            >
              <Plus size={15} />
              <span>{t('community.newDiscussion')}</span>
            </button>
          </div>
        </div>

        {/* Forum Categories Cards */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900">
            {t('community.categories')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FORUM_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                routeType="community-category"
                slug={cat.slug}
                className="group p-6 rounded-3xl bg-white hover:bg-white border border-stone-200/90 hover:border-orange-300 transition-all flex flex-col justify-between shadow-xs hover:shadow-md hover:shadow-orange-500/5"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-500 flex items-center justify-center text-orange-600 group-hover:text-white mb-4 transition-colors shadow-xs">
                    <MessageSquare size={18} />
                  </div>
                  <h3 className="text-base font-semibold text-stone-900 group-hover:text-orange-600 transition-colors mb-1.5">
                    {cat.title[locale] || cat.title.en}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                    {cat.description[locale] || cat.description.en}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-mono text-stone-400">
                  <span>{cat.topicCount} topics · {cat.postCount} posts</span>
                  <ArrowRight size={13} className="group-hover:text-orange-600 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent & Pinned Discussions */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-200">
            <h2 className="text-xl font-bold text-stone-900">
              {t('community.recentDiscussions')}
            </h2>

            {/* Quick search */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredTopics.map((topic) => (
              <Link
                key={topic.id}
                routeType="community-topic"
                slug={topic.slug}
                className="group p-5 rounded-2xl bg-white hover:bg-white border border-stone-200/90 hover:border-orange-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-sm"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    {topic.isPinned && (
                      <span className="text-[10px] font-mono text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded font-semibold border border-orange-200/60">
                        PINNED
                      </span>
                    )}
                    <span className="text-orange-600 font-mono text-[11px] font-medium">#{topic.categorySlug}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="font-medium text-stone-600">{topic.author}</span>
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
                  <span className="text-stone-500 hidden sm:inline">{topic.lastActivity}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Community Principles Card */}
        <div className="p-6 rounded-3xl bg-orange-50/70 border border-orange-200/80 flex items-start gap-4 shadow-xs">
          <ShieldCheck size={20} className="text-orange-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 text-stone-700">
            <span className="font-semibold text-stone-900">{t('community.guidelines')}: </span>
            <span>{t('community.guidelinesDesc')} {t('community.joinNotice')}</span>
          </div>
        </div>
      </div>
    </>
  );
};
