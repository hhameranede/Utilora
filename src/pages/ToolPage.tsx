import React from 'react';
import { useI18n } from '../i18n';
import { getToolBySlug } from '../registry/tools.registry';
import { getCategoryById } from '../registry/categories.registry';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ToolWorkspaceResolver } from '../components/templates/ToolWorkspaceResolver';
import { RelatedTools } from '../components/common/RelatedTools';
import { RelatedArticles } from '../components/common/RelatedArticles';
import { FAQAccordion } from '../components/common/FAQAccordion';
import { Icon } from '../components/common/Icon';
import { Head } from '../seo/Head';
import { Shield, Sparkles, CheckCircle, Info, Lock } from 'lucide-react';

interface ToolPageProps {
  toolSlug: string;
}

export const ToolPage: React.FC<ToolPageProps> = ({ toolSlug }) => {
  const { locale, t } = useI18n();
  const tool = getToolBySlug(toolSlug);

  if (!tool) return null;

  const category = getCategoryById(tool.category);
  const toolName = tool.localizedName[locale] || tool.localizedName.en;
  const toolDesc = tool.localizedDescription[locale] || tool.localizedDescription.en;
  const isNetworkLookup = tool.category === 'website-domain';
  const categoryTitle = category ? category.localizedTitle[locale] || category.localizedTitle.en : tool.category;

  const defaultFaqs = [
    {
      question: {
        en: `Is ${toolName} safe to use with sensitive files?`,
        ar: `هل ${toolName} آمن للاستخدام مع المستندات الحساسة؟`,
      },
      answer: {
        en: tool.status === 'functional' ? (isNetworkLookup ? `This lookup sends only the domain or URL you enter to public DNS/RDAP services or directly to the target website. No files are uploaded.` : `Yes. This tool processes its input locally in your browser without uploading it to an intermediate server.`) : `This workspace is currently a visual preview. It does not process files yet.`,
        ar: tool.status === 'functional' ? (isNetworkLookup ? `ترسل هذه الأداة النطاق أو الرابط الذي تدخله إلى خدمات DNS/RDAP العامة أو إلى الموقع المستهدف مباشرةً. لا تُرفع أي ملفات.` : `نعم. تعالج هذه الأداة مدخلاتها محليًا داخل متصفحك دون رفعها إلى خادم وسيط.`) : `مساحة العمل هذه معاينة للواجهة حاليًا، ولم تُفعّل المعالجة فيها بعد.`,
      },
    },
    {
      question: {
        en: `What is the maximum file size for ${toolName}?`,
        ar: `ما هو الحد الأقصى لحجم الملفات في ${toolName}؟`,
      },
      answer: {
        en: `The tool comfortably accepts files up to ${tool.maxFileSize || '100 MB'}, bounded only by your local device memory.`,
        ar: `تدعم الأداة ملفات حتى ${tool.maxFileSize || '100 ميجابايت'}، وتعتمد حدود المعالجة على ذاكرة جهازك المحلي.`,
      },
    },
  ];

  return (
    <>
      <Head
        title={`${toolName} — Free Online Tool | UTILORA`}
        description={toolDesc}
        locale={locale}
        routeType="tool"
        slug={tool.slug}
        // Section 15: "all unfinished tool pages ... must initially be marked noindex and excluded from production sitemaps"
        isIndexable={false}
        schemaType="SoftwareApplication"
        schemaData={{
          operatingSystem: 'All Modern Browsers',
          fileFormat: tool.acceptedFormats || ['*/*'],
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: t('nav.tools'), routeType: 'tools-index' },
            { label: categoryTitle, routeType: 'category', slug: tool.category },
            { label: toolName },
          ]}
        />

        {/* Tool Header & Badge */}
        <div className="space-y-4 max-w-4xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-xs">
              <Icon name={tool.icon} size={24} />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span>{categoryTitle}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="text-orange-600 font-mono font-medium">{tool.status === "functional" ? "Functional" : "Preview only"}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 mt-1">
                {toolName}
              </h1>
            </div>
          </div>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            {toolDesc}
          </p>
        </div>

        {tool.status !== 'functional' && (
          <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200/90 flex items-center gap-3 text-xs text-orange-900 shadow-xs">
            <Info size={16} className="text-orange-600 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold text-stone-900">Preview only: </span>
              {t('common.previewNotice')}
            </div>
          </div>
        )}

        {/* Main Specialized Tool Workspace */}
        <section className="pt-2">
          <ToolWorkspaceResolver tool={tool} />
        </section>

        {/* Specifications & Instructions Section */}
        <section className="p-8 sm:p-10 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-8">
          <div>
            <h2 className="text-lg font-bold text-stone-900 mb-2">
              {t('common.howToUse')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-orange-600">STEP 01</span>
                <h4 className="text-sm font-semibold text-stone-900">Load Input</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Select, drop, or type your data directly into the active canvas workspace.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-orange-600">STEP 02</span>
                <h4 className="text-sm font-semibold text-stone-900">Adjust Configuration</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Fine-tune sliders, quality presets, target formats, or parameter toggles.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-orange-600">STEP 03</span>
                <h4 className="text-sm font-semibold text-stone-900">Save Local Output</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {tool.status === 'functional' ? (isNetworkLookup ? 'Review the live public lookup result here.' : 'Download or copy your result directly from this browser.') : 'This workspace is not active yet; processing will be enabled in a later release.'}
                </p>
              </div>
            </div>
          </div>

          {/* Supported Formats or Constraints */}
          {tool.acceptedFormats && (
            <div className="pt-6 border-t border-stone-100">
              <h3 className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                {t('common.supportedFormats')}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {tool.acceptedFormats.map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-xs font-mono text-stone-700"
                  >
                    {fmt}
                  </span>
                ))}
                {tool.maxFileSize && (
                  <span className="text-xs font-mono text-stone-400 ml-2">
                    Max size: {tool.maxFileSize}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Privacy & Guarantee Statement */}
          <div className="pt-6 border-t border-stone-100 flex items-start gap-3">
            <Lock size={16} className="text-orange-500 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-stone-600">
              <span className="font-semibold text-stone-900">{t('common.privacyStatement')}: </span>
              {isNetworkLookup ? 'Network lookup: only the domain or URL you submit is sent to public DNS/RDAP services or the target website. No files or cookies are collected by UTILORA.' : t('common.privacyStatementDesc')}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6 pt-6">
          <h2 className="text-xl font-bold text-stone-900">
            {t('common.faq')}
          </h2>
          <FAQAccordion faqs={tool.faqs || defaultFaqs} />
        </section>

        {/* Related Tools */}
        {tool.relatedTools && tool.relatedTools.length > 0 && (
          <RelatedTools toolSlugs={tool.relatedTools} />
        )}

        {/* Related Guides */}
        <RelatedArticles />
      </div>
    </>
  );
};
