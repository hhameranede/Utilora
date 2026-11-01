import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { SAMPLE_ARTICLES } from '../../data/articles.data';
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
            <section id="section-1" className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                {article.contentHeadings[0]}
              </h2>
              <p>
                Modern digital workflows require formats that balance minimal network transfer overhead with crisp visual fidelity across high-DPI displays. While legacy containers rely on fixed Huffman trees, modern codecs incorporate predictive spatial modeling to compress entropy without losing high-frequency detail.
              </p>
              <p>
                In client-side web environments, evaluating image and document operations means accounting for thread memory pressure, WebAssembly initialization latency, and hardware acceleration support.
              </p>
            </section>

            {/* Informational Callout */}
            <div className="p-5 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-orange-700">
                <Info size={15} />
                <span>Client Runtime Note</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                UTILORA executes compression transforms directly inside Web Workers, preventing interface freezing on main render threads. All processing happens locally on device silicon.
              </p>
            </div>

            <section id="section-2" className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                {article.contentHeadings[1]}
              </h2>
              <p>
                Alpha transparency in 32-bit raster formats has historically produced inflated file payloads. Modern predictive color transforms decompose ARGB channels independently, isolating flat transparent blocks from complex foreground vectors.
              </p>

              {/* Code Block Example */}
              <div className="rounded-2xl bg-stone-900 border border-stone-800 p-4 font-mono text-xs overflow-x-auto space-y-1 shadow-sm">
                <div className="text-stone-400">// Example Worker initialization pipeline</div>
                <div className="text-stone-200">
                  <span className="text-purple-400">const</span> worker = <span className="text-purple-400">new</span> Worker(<span className="text-emerald-400">'/workers/codec.worker.js'</span>, &#123; type: <span className="text-emerald-400">'module'</span> &#125;);
                </div>
                <div className="text-stone-200">
                  worker.postMessage(&#123; <span className="text-orange-400">action</span>: <span className="text-emerald-400">'TRANSCODE'</span>, format: <span className="text-emerald-400">'webp'</span>, quality: <span className="text-blue-400">82</span> &#125;);
                </div>
              </div>
            </section>

            <section id="section-3" className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                {article.contentHeadings[2]}
              </h2>
              <p>
                By profiling CPU cycles on both high-tier desktop workstations and constrained mobile processors, memory footprints remain well below 50MB per document transform.
              </p>

              {/* Data Table */}
              <div className="rounded-2xl border border-stone-200 overflow-hidden shadow-xs bg-white">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-4">Container</th>
                      <th className="py-2.5 px-4">Bandwidth Saving</th>
                      <th className="py-2.5 px-4">Decode Latency</th>
                      <th className="py-2.5 px-4">Alpha Support</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    <tr className="hover:bg-stone-50/70">
                      <td className="py-2.5 px-4 font-bold text-stone-900">PNG</td>
                      <td className="py-2.5 px-4">Baseline (0%)</td>
                      <td className="py-2.5 px-4">4.2 ms</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-semibold">Lossless 8-bit</td>
                    </tr>
                    <tr className="hover:bg-stone-50/70">
                      <td className="py-2.5 px-4 font-bold text-orange-600">WebP</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-semibold">-72.4%</td>
                      <td className="py-2.5 px-4">5.8 ms</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-semibold">Lossless & Lossy</td>
                    </tr>
                    <tr className="hover:bg-stone-50/70">
                      <td className="py-2.5 px-4 font-bold text-stone-900">AVIF</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-semibold">-81.1%</td>
                      <td className="py-2.5 px-4">12.1 ms</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-semibold">10/12-bit HDR</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="section-4" className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                {article.contentHeadings[3]}
              </h2>
              <p>
                When authoring assets for production web delivery, prioritize progressive fallback sequences that serve WebP to compliant browsers while keeping PNG as a safe legacy fallback.
              </p>
            </section>

            {/* Inactive Feedback Strip */}
            <div className="pt-8 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span>Was this article helpful? (Preview Mode)</span>
              <div className="flex gap-2">
                <button disabled className="px-3 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-400 cursor-not-allowed">
                  Yes
                </button>
                <button disabled className="px-3 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-400 cursor-not-allowed">
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar: Table of Contents & Referenced Tools (4 cols) */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Table of Contents */}
            <div className="sticky top-24 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {t('articles.tableOfContents')}
              </h3>
              <nav className="space-y-2 text-xs">
                {article.contentHeadings.map((heading, i) => (
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
