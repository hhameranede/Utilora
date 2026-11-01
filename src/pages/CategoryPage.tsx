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
import { matchesSearch } from '../utils/search';

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
    ? tools.filter((tool) => matchesSearch(filterQuery, tool.localizedName, tool.localizedDescription, tool.slug, tool.acceptedFormats))
    : tools.filter((tool) => tool.id !== featuredTool?.id);

  const title = category.localizedTitle[locale] || category.localizedTitle.en;
  const description = category.localizedDescription[locale] || category.localizedDescription.en;

  const categoryFaqs = [
  {
    "question": {
      "en": "Are all tools in this category free to use?",
      "ar": "هل أدوات هذه الفئة مجانية؟",
      "fr": "Les outils de cette catégorie sont-ils gratuits ?",
      "es": "¿Las herramientas de esta categoría son gratuitas?",
      "pt": "As ferramentas desta categoria são gratuitas?",
      "hi": "क्या इस श्रेणी के टूल मुफ़्त हैं?",
      "zh": "此类别中的工具可以免费使用吗？",
      "bn": "এই বিভাগের টুলগুলো কি বিনামূল্যে?"
    },
    "answer": {
      "en": "Available tools can be used without a subscription. A tool marked as a preview is not yet operational; its page explains that limitation.",
      "ar": "يمكن استخدام الأدوات المتاحة دون اشتراك. أما الأداة التي تحمل علامة «معاينة» فهي غير مكتملة بعد، وتوضح صفحتها ذلك.",
      "fr": "Les outils disponibles sont accessibles sans abonnement. Un outil marqué « Aperçu » n’est pas encore opérationnel ; sa page précise cette limite.",
      "es": "Las herramientas disponibles se pueden usar sin suscripción. Una herramienta marcada como «Vista previa» aún no funciona y su página lo indica.",
      "pt": "As ferramentas disponíveis podem ser usadas sem assinatura. Uma ferramenta marcada como «Prévia» ainda não está operacional; a página explica essa limitação.",
      "hi": "उपलब्ध टूल बिना सदस्यता के उपयोग किए जा सकते हैं। «पूर्वावलोकन» चिह्नित टूल अभी काम नहीं करता; उसका पृष्ठ यह सीमा बताता है।",
      "zh": "可用工具无需订阅即可使用。标记为“预览”的工具尚未投入使用，其页面会说明这一限制。",
      "bn": "উপলব্ধ টুলগুলো সাবস্ক্রিপশন ছাড়াই ব্যবহার করা যায়। “প্রিভিউ” চিহ্নিত টুলটি এখনো কার্যকর নয়; তার পৃষ্ঠায় সীমাবদ্ধতা জানানো আছে।"
    }
  },
  {
    "question": {
      "en": "What happens to my files or lookup requests?",
      "ar": "ماذا يحدث لملفاتي أو طلبات الاستعلام؟",
      "fr": "Que deviennent mes fichiers ou mes requêtes ?",
      "es": "¿Qué ocurre con mis archivos o consultas?",
      "pt": "O que acontece com meus arquivos ou consultas?",
      "hi": "मेरी फ़ाइलों या खोज अनुरोधों के साथ क्या होता है?",
      "zh": "我的文件或查询请求会如何处理？",
      "bn": "আমার ফাইল বা অনুসন্ধানের অনুরোধের সঙ্গে কী ঘটে？"
    },
    "answer": {
      "en": "File and text operations run in your browser. Website and domain checks send the hostname or URL you submit to the relevant public service or target website.",
      "ar": "تُنفّذ عمليات الملفات والنصوص داخل متصفحك. أما فحوصات المواقع والنطاقات فترسل اسم النطاق أو الرابط الذي أدخلته إلى الخدمة العامة المعنية أو الموقع المستهدف.",
      "fr": "Les opérations sur les fichiers et le texte s’exécutent dans votre navigateur. Les vérifications web et de domaine transmettent le nom d’hôte ou l’URL saisi au service public concerné ou au site cible.",
      "es": "Las operaciones con archivos y texto se ejecutan en tu navegador. Las comprobaciones web y de dominios envían el nombre de host o la URL al servicio público correspondiente o al sitio de destino.",
      "pt": "As operações com arquivos e texto são executadas no navegador. As verificações de sites e domínios enviam o host ou a URL ao serviço público relevante ou ao site de destino.",
      "hi": "फ़ाइल और टेक्स्ट के काम आपके ब्राउज़र में होते हैं। वेबसाइट और डोमेन जाँच आपके दिए गए होस्टनाम या URL को संबंधित सार्वजनिक सेवा या लक्षित वेबसाइट पर भेजती है।",
      "zh": "文件和文本操作在浏览器中运行。网站和域名检查会将您提交的主机名或 URL 发送给相关公共服务或目标网站。",
      "bn": "ফাইল ও টেক্সটের কাজ আপনার ব্রাউজারে সম্পন্ন হয়। ওয়েবসাইট ও ডোমেইন পরীক্ষা করতে আপনার দেওয়া হোস্টনেম বা URL সংশ্লিষ্ট পাবলিক সার্ভিস বা লক্ষ্য ওয়েবসাইটে পাঠানো হয়。"
    }
  }
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
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-white via-white to-orange-50/40 border border-stone-200/90 shadow-xs relative">
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
              <span>{tools.length} {t('category.toolsInSuite')}</span>
              <span aria-hidden="true">·</span>
              <span>{tools.filter((tool) => tool.status === 'functional').length} {t('category.functionalCount')}</span>
            </div>
          </div>
        </div>

        {/* Featured Tool Spotlight */}
        {featuredTool && !filterQuery.trim() && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
              {t('category.featuredWorkspace')}
            </h2>
            <FeaturedToolCard tool={featuredTool} />
          </section>
        )}

        {/* Category Tool List with Filter Bar */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                {title} · {t('category.allTools')} ({filteredTools.length})
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {t('category.chooseWorkspace')}
              </p>
            </div>

            {/* Quick in-category filter input */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-orange-500" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={t('category.searchPlaceholder')}
                className="w-full ps-9 pe-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.length === 0 ? (
              <p className="col-span-full rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-600">{t('common.noResults')}</p>
            ) : filteredTools.map((tool) => (
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
