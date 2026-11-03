import React from 'react';
import { ArrowRight, Workflow as WorkflowIcon } from 'lucide-react';
import { useI18n } from '../i18n';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { WorkflowCard } from '../components/common/WorkflowCard';
import { Head } from '../seo/Head';
import { WORKFLOWS_LIST, WORKFLOW_UI } from '../registry/workflows.registry';

export const WorkflowsIndexPage: React.FC = () => {
  const { locale } = useI18n();
  const ui = WORKFLOW_UI[locale];

  return (
    <>
      <Head
        title={ui.indexTitle + ' | UTILORA'}
        description={ui.indexDescription}
        locale={locale}
        routeType="workflows-index"
        isIndexable={true}
        schemaType="WebSite"
      />
      <div className="ul-content-page mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: ui.workflows }]} />
        <header className="overflow-hidden rounded-3xl border border-stone-200 bg-gradient-to-br from-white via-white to-orange-50/70 p-6 shadow-xs sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-700">
            <WorkflowIcon size={24} aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-orange-700">{ui.indexKicker}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight text-stone-950 sm:text-4xl">{ui.indexTitle}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600 sm:text-base">{ui.indexDescription}</p>
        </header>
        <section aria-label={ui.workflows} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WORKFLOWS_LIST.map((workflow) => (
            <WorkflowCard key={workflow.slug} workflow={workflow} />
          ))}
        </section>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm leading-7 text-stone-600">
          {locale === 'ar'
            ? 'كل مسار يستخدم أدوات موجودة فعلاً. راجع مدخلاتك ونتائج كل خطوة قبل الانتقال إلى الخطوة التالية.'
            : locale === 'fr'
              ? 'Chaque parcours utilise des outils déjà disponibles. Vérifiez les entrées et les résultats à chaque étape avant de continuer.'
              : locale === 'es'
                ? 'Cada flujo utiliza herramientas disponibles. Revisa las entradas y los resultados de cada paso antes de continuar.'
                : locale === 'pt'
                  ? 'Cada fluxo utiliza ferramentas disponíveis. Confira as entradas e os resultados de cada etapa antes de continuar.'
                  : locale === 'hi'
                    ? 'हर कार्यप्रवाह उपलब्ध टूल्स का उपयोग करता है। अगले चरण पर जाने से पहले इनपुट और परिणाम जाँचें।'
                    : locale === 'zh'
                      ? '每个流程都使用现有工具。进入下一步之前，请检查当前步骤的输入和结果。'
                      : locale === 'bn'
                        ? 'প্রতিটি কাজের ধাপ বিদ্যমান টুল ব্যবহার করে। পরের ধাপে যাওয়ার আগে ইনপুট ও ফলাফল পরীক্ষা করুন。'
                        : 'Each workflow uses tools that already exist. Review the input and result at every step before moving on.'}
        </div>
      </div>
    </>
  );
};
