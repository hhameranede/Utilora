import React from 'react';
import { useI18n } from '../../i18n';
import { SAMPLE_TOPICS, FORUM_CATEGORIES } from '../../data/community.data';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Head } from '../../seo/Head';
import { Link } from '../../router';
import {
  MessageSquare,
  CheckCircle,
  Eye,
  Clock,
  Shield,
  Send,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CommunityTopicPageProps {
  topicSlug: string;
}

export const CommunityTopicPage: React.FC<CommunityTopicPageProps> = ({ topicSlug }) => {
  const { locale, t } = useI18n();

  const topic = SAMPLE_TOPICS.find((t) => t.slug === topicSlug) || SAMPLE_TOPICS[0];
  const category = FORUM_CATEGORIES.find((c) => c.slug === topic.categorySlug);
  const title = topic.title[locale] || topic.title.en;

  return (
    <>
      <Head
        title={`${title} — UTILORA Community`}
        description={topic.content.slice(0, 160)}
        locale={locale}
        routeType="community-topic"
        slug={topic.slug}
        // Demo topics marked noindex per specification
        isIndexable={false}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <Breadcrumbs
          items={[
            { label: t('nav.community'), routeType: 'community-index' },
            {
              label: category ? (category.title[locale] || category.title.en) : topic.categorySlug,
              routeType: 'community-category',
              slug: topic.categorySlug,
            },
            { label: title },
          ]}
        />

        {/* Discussion Header */}
        <div className="space-y-4 pb-6 border-b border-stone-200">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="text-orange-600 font-mono text-[11px] font-semibold">
              #{topic.categorySlug}
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Started {topic.createdAt}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{topic.viewCount} views</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 leading-snug">
            {title}
          </h1>
        </div>

        {/* Original Post */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center font-mono text-xs text-orange-600 font-bold shadow-xs">
                {topic.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-900">{topic.author}</div>
                <div className="text-[10px] text-stone-400">{topic.authorRole}</div>
              </div>
            </div>

            <span className="text-[11px] font-mono text-stone-400">Original Post</span>
          </div>

          <div className="text-sm text-stone-700 leading-relaxed space-y-4">
            <p>{topic.content}</p>
          </div>
        </div>

        {/* Replies Thread */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 px-1">
            <span>{topic.replyCount} Responses in Thread</span>
            <span className="text-stone-400 font-mono">Sample Discussion Data</span>
          </div>

          {topic.replies?.map((reply) => (
            <div
              key={reply.id}
              className={`p-6 rounded-3xl border space-y-3 transition-colors shadow-xs ${
                reply.isSolution
                  ? 'bg-orange-50/50 border-orange-300/80 shadow-orange-500/5'
                  : 'bg-white border-stone-200/90'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-mono text-xs text-stone-600 font-medium">
                    {reply.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-stone-900 flex items-center gap-2">
                      <span>{reply.author}</span>
                      <span className="text-[10px] font-mono text-stone-400">· {reply.authorRole}</span>
                    </div>
                    <div className="text-[10px] text-stone-400">{reply.createdAt}</div>
                  </div>
                </div>

                {reply.isSolution && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-100 border border-orange-200 text-[10px] font-mono font-semibold text-orange-800">
                    <CheckCircle size={12} className="text-orange-600" />
                    <span>ACCEPTED RESOLUTION</span>
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                {reply.content}
              </div>
            </div>
          ))}
        </div>

        {/* Inactive Reply Composer Placeholder */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4">
          <h3 className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
            Leave a Reply (Preview Mode)
          </h3>
          <textarea
            disabled
            rows={4}
            placeholder={t('community.replyPlaceholder')}
            className="w-full p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-400 cursor-not-allowed resize-none"
          />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-stone-400">
              {t('community.joinNotice')}
            </span>
            <button
              disabled
              className="px-4 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-400 cursor-not-allowed"
            >
              {t('community.replySubmit')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
