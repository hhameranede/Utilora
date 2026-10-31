import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { getCategoryById, CATEGORIES_LIST } from '../registry/categories.registry';
import { getToolsByCategory } from '../registry/tools.registry';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ToolCard } from '../components/common/ToolCard';
import { FeaturedToolCard } from '../components/common/FeaturedToolCard';
import { CategoryCard } from '../components/common/CategoryCard';
import { RelatedArticles } from '../components/common/RelatedArticles';
import { FAQAccordion } from '../components/common/FAQAccordion';
import { Icon } from '../components/common/Icon';
import { Head } from '../seo/Head';
import { Search, Filter, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from '../router';

interface CategoryPageProps {
  categorySlug: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categorySlug }) => {
  const { locale, t } = useI18n();
  const [filterQuery, setFilterQuery] = useState('');

  const category = getCategoryById(categorySlug);
  if (!category) return null;

  const tools = getToolsByCategory(category.id);
  const featuredTool = tools.find((t) => t.isFeatured) || tools[0];
  const relatedCategories = CATEGORIES_LIST.filter((c) => c.id !== category.id).slice(0, 3);

  const filteredTools = filterQuery.trim()
    ? tools.filter((tool) => {
        const name = (tool.localizedName[locale] || tool.localizedName.en).toLowerCase();
        const desc = (tool.localizedDescription[locale] || tool.localizedDescription.en).toLowerCase();
        return name.includes(filterQuery.toLowerCase()) || desc.includes(filterQuery.toLowerCase());
      })
    : tools;

  const title = category.localizedTitle[locale] || category.localizedTitle.en;
  const description = category.localizedDescription[locale] || category.localizedDescription.en;

  const categoryFaqs = [
    {
      question: {
        en: `Are ${title} completely free to use?`,
        ar: `هل جميع ${title} مجانية بالكامل؟`,
      },
      answer: {
        en: `Yes. All utilities in the ${title} category are built to be accessible to everyone without paywalls, subscriptions, or hidden charges.`,
        ar: `نعم. جميع الأدوات في قسم ${title} مصممة لتكون متاحة للجميع بدون رسوم أو اشتراكات مخفية.`,
      },
    },
    {
      question: {
        en: `How are files in ${title} processed?`,
        ar: `كيف يتم التعامل مع الملفات ومعالجتها في ${title}؟`,
      },
      answer: {
        en: `UTILORA follows a local-first architecture. When processing engines are connected, file manipulations are executed within your browser sandbox via WebAssembly and client APIs.`,
        ar: `تعتمد يوتيلورا على معمارية معالجة محلية؛ عند ربط المحركات المستقبلية تظل الملفات في متصفحك عبر تقنيات WebAssembly دون رفعها لسيرفرات وسيطة.`,
      },
    },
  ];

  return (
    <>
      <Head
        title={`${title} — Online Digital Utilities | UTILORA`}
        description={description}
        locale={locale}
        routeType="category"
        slug={category.slug}
        isIndexable={true}
        schemaType="BreadcrumbList"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: t('nav.categories'), routeType: 'categories-index' },
            { label: title },
          ]}
        />

        {/* Category Hero Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-white via-white to-orange-50/40 border border-stone-200/90 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-xs">
              <Icon name={category.icon} size={28} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              {description}
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-stone-400">
              <span>{tools.length} Tools in Suite</span>
              <span aria-hidden="true">·</span>
              <span>Local In-Browser Ready</span>
            </div>
          </div>
        </div>

        {/* Featured Tool Spotlight */}
        {featuredTool && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
              Featured Workspace
            </h2>
            <FeaturedToolCard tool={featuredTool} />
          </section>
        )}

        {/* Category Tool List with Filter Bar */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                All {title} ({tools.length})
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Select any workspace below to configure your files.
              </p>
            </div>

            {/* Quick in-category filter input */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter these tools..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* Relevant Educational Guides */}
        <RelatedArticles title={`Guides & Reading for ${title}`} />

        {/* FAQs Section */}
        <section className="space-y-6 pt-10 border-t border-stone-200/80">
          <h3 className="text-xl font-bold text-stone-900">
            {t('common.faq')}
          </h3>
          <FAQAccordion faqs={categoryFaqs} />
        </section>

        {/* Related Categories */}
        <section className="space-y-6 pt-10 border-t border-stone-200/80">
          <h3 className="text-xl font-bold text-stone-900">
            Related Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedCategories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
};
