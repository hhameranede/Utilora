import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { SAMPLE_ARTICLES } from '../../data/articles.data';
import { getArticleContent } from '../../data/article-content.data';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Head } from '../../seo/Head';
import { Link } from '../../router';
import { RelatedTools } from '../../components/common/RelatedTools';
import { RelatedArticles } from '../../components/common/RelatedArticles';
import { NotFoundPage } from '../NotFoundPage';
import {
  Calendar,
  Clock,
  User,
  Share2,
  Bookmark,
  Check,
  ArrowLeft,
  ArrowRight,
  Info,
  Terminal,
  ExternalLink,
} from 'lucide-react';

interface ArticleDetailPageProps {
  articleSlug: string;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ articleSlug }) => {
  const { locale, t } = useI18n();
  const [copiedShare, setCopiedShare] = useState(false);

  const article = SAMPLE_ARTICLES.find((a) => a.slug === articleSlug);
  if (!article) return <NotFoundPage />;
  const title = article.title[locale] || article.title.en;
  const excerpt = article.excerpt[locale] || article.excerpt.en;
  const bodyContent = getArticleContent(article.slug, locale);
  const displayContentHeadings = bodyContent?.sections.map((section) => section.heading) || article.contentHeadings;

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <>
      <Head
        title={`${title} — UTILORA Guide`}
        description={excerpt}
        locale={locale}
        routeType="article-detail"
        slug={article.slug}
        ogType="article"
        publishedTime={article.publishedAt}
        author={article.author}
        isIndexable={false}
        schemaType="Article"
      />

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: t('nav.articles'), routeType: 'articles-index' },
            { label: article.category.toUpperCase(), routeType: 'article-category', slug: article.category },
            { label: title },
          ]}
        />

        {/* Article Header */}
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center gap-3 text-xs text-stone-400">
            <span className="text-orange-600 font-mono uppercase font-semibold">
              {article.category}
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{article.readingTimeMinutes} {t('articles.readTime')}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{article.publishedAt}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
            {title}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
            {excerpt}
          </p>

          {/* Author Strip & Share */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold shadow-xs">
                U
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-800">{article.author}</div>
                <div className="text-[11px] text-stone-400">Technical Standards & Architecture</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs text-stone-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {copiedShare ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
                <span>{copiedShare ? 'URL Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Featured Graphic Hero */}
        <div className="w-full aspect-[21/9] rounded-3xl bg-gradient-to-tr from-orange-50/70 via-stone-50 to-orange-50/50 border border-stone-200 flex items-center justify-center p-8 relative overflow-hidden shadow-xs">
          <div className="absolute inset-0 bg-radial from-orange-500/10 to-transparent pointer-events-none" />
          <div className="text-center space-y-2 relative z-10">
            <div className="text-xs font-mono tracking-widest text-orange-600 uppercase font-semibold">
              TECHNICAL ARCHITECTURE BENCHMARK
            </div>
            <div className="text-xl sm:text-2xl font-bold text-stone-900">
              {title}
            </div>
          </div>
        </div>

        {/* Content Layout: 8 cols content + 4 cols Table of Contents & Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Article Body (8 cols) */}
          <div className="lg:col-span-8 space-y-8 text-stone-700 leading-relaxed text-sm sm:text-base">
            {locale !== 'en' && locale !== 'ar' && (
              <p className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-600">
                {({
                  fr: 'Le contenu technique complet de cet article est actuellement disponible en anglais.',
                  es: 'El contenido técnico completo de este artículo está disponible actualmente en inglés.',
                  pt: 'O conteúdo técnico completo deste artigo está disponível atualmente em inglês.',
                  hi: 'इस लेख की पूरी तकनीकी सामग्री फिलहाल अंग्रेज़ी में उपलब्ध है।',
                  zh: '本文的完整技术内容目前以英文提供。',
                  bn: 'এই নিবন্ধের সম্পূর্ণ প্রযুক্তিগত বিষয়বস্তু বর্তমানে ইংরেজিতে উপলব্ধ।',
                } as Record<string, string>)[locale] || 'The full technical article is currently available in English.'}
              </p>
            )}

            {bodyContent?.sections.map((section, index) => (
              <section key={index} id={`section-${index + 1}`} className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                  {displayContentHeadings[index] || title}
                </h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </section>
            ))}

            {bodyContent && (
              <>
                <aside className="rounded-2xl border border-orange-200/80 bg-orange-50/70 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-orange-800">
                    <Info size={15} />
                    <span>{locale === 'ar' ? 'ملاحظة عملية' : 'Practical note'}</span>
                  </div>
                  <p className="text-sm leading-6 text-stone-700">{bodyContent.note}</p>
                </aside>

                <div className="rounded-2xl border border-stone-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-stone-900">
                    {locale === 'ar' ? 'الخلاصة' : 'Key takeaway'}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-700">{bodyContent.takeaway}</p>
                </div>
              </>
            )}
          </div>

          {/* Sticky Sidebar: Table of Contents & Referenced Tools (4 cols) */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Table of Contents */}
            <div className="sticky top-24 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {t('articles.tableOfContents')}
              </h3>
              <nav className="space-y-2 text-xs">
                {displayContentHeadings.map((heading, i) => (
                  <a
                    key={i}
                    href={`#section-${i + 1}`}
                    className="block text-stone-600 hover:text-orange-600 transition-colors leading-relaxed"
                  >
                    {heading}
                  </a>
                ))}
              </nav>

              {/* Related Tools Box */}
              {article.relatedTools && article.relatedTools.length > 0 && (
                <div className="pt-6 border-t border-stone-100 space-y-2">
                  <h4 className="text-xs font-semibold text-stone-800">
                    Mentioned Utilities
                  </h4>
                  <div className="space-y-1">
                    {article.relatedTools.map((slug) => (
                      <Link
                        key={slug}
                        routeType="tool"
                        slug={slug}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-orange-50/70 text-xs text-stone-700 hover:text-orange-600 transition-colors"
                      >
                        <span className="font-mono">{slug}</span>
                        <ArrowRight size={12} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </aside>
        </div>

        {/* Related Articles Strip */}
        <RelatedArticles />
      </article>
    </>
  );
};
