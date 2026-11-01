import React from 'react';
import { ArrowRight, CheckCircle2, FileText, Info, Lock, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { useI18n } from '../i18n';
import { getToolBySlug } from '../registry/tools.registry';
import { getCategoryById } from '../registry/categories.registry';
import { getToolExperience, localizedExperience } from '../registry/tool-experience.registry';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Link } from '../router';
import { ToolWorkspaceResolver } from '../components/templates/ToolWorkspaceResolver';
import { RelatedTools } from '../components/common/RelatedTools';
import { FAQAccordion, FAQItem } from '../components/common/FAQAccordion';
import { Icon } from '../components/common/Icon';
import { Head } from '../seo/Head';

interface ToolPageProps {
  toolSlug: string;
}

export const ToolPage: React.FC<ToolPageProps> = ({ toolSlug }) => {
  const { locale, t } = useI18n();
  const tool = getToolBySlug(toolSlug);
  if (!tool) return null;

  const experience = getToolExperience(tool.slug);
  const category = getCategoryById(tool.category);
  const toolName = tool.localizedName[locale] || tool.localizedName.en;
  const toolDesc = tool.localizedDescription[locale] || tool.localizedDescription.en;
  const categoryTitle = category ? category.localizedTitle[locale] || category.localizedTitle.en : tool.category;
  const isNetworkLookup = tool.category === 'website-domain';
  const isFunctional = tool.status === 'functional';
  const hasCuratedExperience = locale === 'en' || locale === 'ar';
  const positioning = experience && hasCuratedExperience
    ? localizedExperience(experience.positioning, locale)
    : toolDesc;
  const benefits = experience && hasCuratedExperience
    ? localizedExperience(experience.benefits, locale)
    : [t('product.benefit1'), t('product.benefit2'), t('product.benefit3')];
  const steps = experience && hasCuratedExperience
    ? localizedExperience(experience.steps, locale)
    : [t('product.step1'), t('product.step2'), t('product.step3')];
  const example = experience && hasCuratedExperience
    ? localizedExperience(experience.example, locale)
    : toolDesc;
  const localizedTitleSuffix: Record<string, string> = {
    en: 'Free Online Tool | UTILORA',
    ar: 'أداة مجانية عبر الإنترنت | يوتيلورا',
    fr: 'Outil en ligne gratuit | UTILORA',
    es: 'Herramienta en línea gratuita | UTILORA',
    pt: 'Ferramenta online gratuita | UTILORA',
    hi: 'मुफ़्त ऑनलाइन टूल | UTILORA',
    zh: '免费在线工具 | UTILORA',
    bn: 'বিনামূল্যে অনলাইন টুল | UTILORA',
  };
  const seoTitle = tool.seo.metaTitle[locale] || `${toolName} — ${localizedTitleSuffix[locale] || localizedTitleSuffix.en}`;
  const seoDescription = tool.seo.metaDescription[locale] || toolDesc;
  const localProcessingText = t('product.localProcessing');
  const networkProcessingText = t('product.networkProcessing');
  const previewText = t('product.previewMessage');

  const baseFaqs: FAQItem[] = tool.faqs || [
    {
      question: {
        en: `What is ${toolName} designed to do?`,
        ar: `ما المهمة التي صُممت لها أداة ${toolName}؟`,
      },
      answer: { en: positioning, ar: positioning },
    },
    {
      question: {
        en: `How do I use ${toolName}?`,
        ar: `كيف أستخدم أداة ${toolName}؟`,
      },
      answer: {
        en: steps.length ? steps.map((step, index) => `${index + 1}. ${step}`).join(' ') : toolDesc,
        ar: steps.length ? steps.map((step, index) => `${index + 1}. ${step}`).join(' ') : toolDesc,
      },
    },
    {
      question: {
        en: 'Are my files uploaded to UTILORA?',
        ar: 'هل تُرفع ملفاتي إلى خوادم UTILORA؟',
      },
      answer: {
        en: isFunctional ? (isNetworkLookup ? networkProcessingText : localProcessingText) : previewText,
        ar: isFunctional ? (isNetworkLookup ? networkProcessingText : localProcessingText) : previewText,
      },
    },
    ...(tool.acceptedFormats && isFunctional ? [{
      question: {
        en: 'Which file formats and size limits are supported?',
        ar: 'ما صيغ الملفات وحدود الحجم المدعومة؟',
      },
      answer: {
        en: `Supported formats: ${tool.acceptedFormats.join(', ')}. Maximum file size: ${tool.maxFileSize || 'The limit shown in the workspace'}.`,
        ar: `الصيغ المدعومة: ${tool.acceptedFormats.join('، ')}. الحد الأقصى للحجم: ${tool.maxFileSize || 'الحد الموضح في مساحة العمل'}.`,
      },
    }] : []),
  ];

  const faqs: FAQItem[] = baseFaqs.map((faq, index) => {
    const fallbackQuestions = [
      t('product.whatHelps'),
      t('product.howItWorks'),
      t('product.whatHappensInput'),
      t('product.supportedFormats'),
    ];
    const fallbackAnswers = [
      positioning,
      steps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join(' '),
      isFunctional ? (isNetworkLookup ? networkProcessingText : localProcessingText) : previewText,
      tool.acceptedFormats
        ? `${tool.acceptedFormats.join(', ')}. ${t('product.maximumSize')} ${tool.maxFileSize || t('product.workspace')}`
        : toolDesc,
    ];
    return {
      ...faq,
      question: {
        ...faq.question,
        [locale]: faq.question[locale] || `${fallbackQuestions[index] || t('product.faq')}?`,
      },
      answer: {
        ...faq.answer,
        [locale]: faq.answer[locale] || fallbackAnswers[index] || positioning,
      },
    };
  });

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <Head
        title={seoTitle}
        description={seoDescription}
        locale={locale}
        routeType="tool"
        slug={tool.slug}
        isIndexable={isFunctional}
        schemaType="SoftwareApplication"
        schemaData={{
          name: toolName,
          description: seoDescription,
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'Any',
          isAccessibleForFree: true,
          featureList: benefits,
          ...(tool.acceptedFormats ? { fileFormat: tool.acceptedFormats } : {}),
        }}
      />

      <Breadcrumbs
        items={[
          { label: t('nav.tools'), routeType: 'tools-index' },
          { label: categoryTitle, routeType: 'category', slug: tool.category },
          { label: toolName },
        ]}
      />

      <header className="overflow-hidden rounded-[2rem] border border-stone-200 bg-gradient-to-br from-white via-white to-orange-50/70 p-6 shadow-sm sm:p-9">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-orange-700">UTILORA</span>
          <span>{categoryTitle}</span>
          <span aria-hidden="true">/</span>
          <span>{categoryTitle}</span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-white text-orange-700 shadow-sm">
                <Icon name={tool.icon} size={25} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-stone-500">
                  {t('product.focusedTool')}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-orange-700">
                  {isFunctional
                    ? t('product.ready')
                    : t('product.previewOnly')}
                </p>
              </div>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-stone-950 sm:text-5xl">
              {toolName}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
              {positioning}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-500">
              {toolDesc}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700">
                <CheckCircle2 size={14} className="text-orange-700" />
                {isFunctional
                  ? t('product.free')
                  : t('product.freePreview')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700">
                <ShieldCheck size={14} className="text-orange-700" />
                {!isFunctional
                  ? t('product.previewOnly')
                  : isNetworkLookup
                    ? t('product.publicLookups')
                    : t('product.browserProcessing')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700">
                <Sparkles size={14} className="text-orange-700" />
                {isFunctional
                  ? t('product.noInstall')
                  : t('product.notAvailable')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <a
              href="#tool-workspace"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-700 focus:ring-offset-2"
            >
              {t('product.openTool')}
              <ArrowRight size={16} />
            </a>
            <Link
              routeType="tool-guide"
              slug={tool.slug}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-orange-300 hover:text-orange-700"
            >
              <FileText size={16} />
              {t('product.howToUse')}
            </Link>
          </div>
        </div>

        <nav aria-label={t('product.toolPageSections')} className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-stone-200/80 pt-5 text-xs font-semibold text-stone-500">
          <a className="transition hover:text-orange-700" href="#tool-workspace">{t('product.workspace')}</a>
          <a className="transition hover:text-orange-700" href="#tool-features">{t('product.features')}</a>
          <a className="transition hover:text-orange-700" href="#how-it-works">{t('product.workflow')}</a>
          <a className="transition hover:text-orange-700" href="#tool-faq">{t('product.faq')}</a>
        </nav>
      </header>

      {!isFunctional && (
        <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50/80 p-4 text-sm text-orange-950">
          <Info size={18} className="mt-0.5 shrink-0 text-orange-700" />
          <div>
            <p className="font-semibold">{t('product.previewNotWorking')}</p>
            <p className="mt-1 leading-6">{previewText}</p>
          </div>
        </div>
      )}

      <section id="tool-workspace" className="scroll-mt-6 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
              {t('product.workspace')}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-stone-950 sm:text-3xl">
              {t('product.useTool').replace('{tool}', toolName)}
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            {isNetworkLookup
              ? t('product.connectsPublicServices')
              : t('product.processesOnDevice')}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-3 shadow-sm sm:p-5">
          <ToolWorkspaceResolver tool={tool} />
        </div>
      </section>

      {benefits.length > 0 && (
        <section id="tool-features" className="scroll-mt-6 space-y-5">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
              {t('product.builtForTask')}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-stone-950 sm:text-3xl">
              {t('product.whatHelps')}
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div key={benefit} className="rounded-2xl border border-stone-200 bg-white p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-sm font-bold text-orange-700">
                  0{index + 1}
                </div>
                <p className="mt-4 text-sm font-semibold leading-6 text-stone-800">{benefit}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section id="how-it-works" className="scroll-mt-6 rounded-[1.75rem] border border-stone-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <Workflow size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
                {t('product.simpleWorkflow')}
              </p>
              <h2 className="mt-1 text-xl font-bold text-stone-950 sm:text-2xl">
                {t('product.howItWorks')}
              </h2>
            </div>
          </div>
          <ol className="mt-7 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step} className="relative border-s-2 border-orange-200 ps-4">
                <span className="text-xs font-bold text-orange-700">
                  {t('product.stepLabel').replace('{number}', String(index + 1))}
                </span>
                <p className="mt-2 text-sm leading-7 text-stone-700">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-2 text-orange-700">
            <Sparkles size={17} />
            <p className="text-xs font-bold uppercase tracking-[0.14em]">
              {t('product.useCase')}
            </p>
          </div>
          <h2 className="mt-3 text-xl font-bold text-stone-950">
            {t('product.whenToUse')}
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">{example}</p>
        </div>

        <div className="rounded-[1.75rem] border border-stone-200 bg-stone-50/80 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-orange-700">
            <Lock size={17} />
            <p className="text-xs font-bold uppercase tracking-[0.14em]">
              {t('product.privacyConnection')}
            </p>
          </div>
          <h2 className="mt-3 text-xl font-bold text-stone-950">
            {t('product.whatHappensInput')}
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            {isFunctional
              ? (isNetworkLookup ? networkProcessingText : localProcessingText)
              : previewText}
          </p>
        </div>
      </section>

      {tool.acceptedFormats && (
        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-stone-950">
            {t('product.supportedFormats')}
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {tool.acceptedFormats.map((format) => (
              <span key={format} className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-xs text-stone-700">
                {format}
              </span>
            ))}
            {tool.maxFileSize && (
              <span className="text-xs text-stone-500">
                {t('product.maximumSize')} {tool.maxFileSize}
              </span>
            )}
          </div>
        </section>
      )}

      <section className="rounded-[1.75rem] border border-orange-200 bg-orange-50/60 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
              {t('product.visualGuide')}
            </p>
            <h2 className="mt-2 text-xl font-bold text-stone-950">
              {t('product.learnStepByStep').replace('{tool}', toolName)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {t('product.screenshotNote')}
            </p>
          </div>
          <Link
            routeType="tool-guide"
            slug={tool.slug}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-orange-300 bg-white px-5 py-3 text-sm font-bold text-orange-800 transition hover:bg-orange-100"
          >
            {t('product.openUsageGuide')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section id="tool-faq" className="scroll-mt-6 space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
            {t('product.help')}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-stone-950">
            {t('product.frequentlyAsked')}
          </h2>
        </div>
        <FAQAccordion faqs={faqs} />
      </section>

      {tool.relatedTools?.length > 0 && (
        <RelatedTools
          toolSlugs={tool.relatedTools}
          title={t('product.relatedTools')}
        />
      )}
    </article>
  );
};
