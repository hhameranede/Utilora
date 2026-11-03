import React from 'react';
import { ArrowRight, CheckCircle2, Info, Workflow as WorkflowIcon } from 'lucide-react';
import { useI18n } from '../i18n';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Head } from '../seo/Head';
import { Link } from '../router';
import { getToolBySlug } from '../registry/tools.registry';
import { getWorkflowBySlug, getWorkflowCopy, getWorkflowsForCategory, WORKFLOW_UI } from '../registry/workflows.registry';
import { WorkflowCard } from '../components/common/WorkflowCard';

interface WorkflowPageProps {
  workflowSlug: string;
}

export const WorkflowPage: React.FC<WorkflowPageProps> = ({ workflowSlug }) => {
  const { locale } = useI18n();
  const workflow = getWorkflowBySlug(workflowSlug);

  if (!workflow) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-stone-900">{WORKFLOW_UI[locale].notFound}</h1>
        <Link routeType="workflows-index" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-bold text-white">
          {WORKFLOW_UI[locale].workflows}<ArrowRight size={16} />
        </Link>
      </main>
    );
  }

  const ui = WORKFLOW_UI[locale];
  const copy = getWorkflowCopy(workflow, locale);
  const tools = workflow.toolSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((tool) => tool && tool.status === 'functional');
  const howToSteps = tools.map((tool, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: tool!.localizedName[locale] || tool!.localizedName.en,
    text: tool!.localizedDescription[locale] || tool!.localizedDescription.en,
  }));
  const relatedWorkflows = getWorkflowsForCategory(workflow.category)
    .filter((item) => item.slug !== workflow.slug);

  return (
    <article className="ul-content-page mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <Head
        title={copy.title + ' | UTILORA'}
        description={copy.description}
        locale={locale}
        routeType="workflow"
        slug={workflow.slug}
        isIndexable={true}
        schemaType="HowTo"
        schemaData={{ name: copy.title, description: copy.description, step: howToSteps }}
      />
      <Breadcrumbs items={[
        { label: ui.workflows, routeType: 'workflows-index' },
        { label: copy.title },
      ]} />

      <header className="rounded-3xl border border-stone-200 bg-gradient-to-br from-white via-white to-orange-50/70 p-6 shadow-xs sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-700">
          <WorkflowIcon size={24} aria-hidden="true" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-orange-700">{ui.workflows}</p>
        <h1 className="mt-2 max-w-4xl text-3xl font-extrabold tracking-tight text-stone-950 sm:text-4xl">{copy.title}</h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-stone-700">{copy.introduction}</p>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-stone-500">{copy.description}</p>
      </header>

      <section className="space-y-5" aria-labelledby="workflow-steps-title">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">{ui.indexKicker}</p>
          <h2 id="workflow-steps-title" className="mt-2 text-2xl font-bold text-stone-950">{copy.title}</h2>
        </div>
        <ol className="grid gap-4 lg:grid-cols-2">
          {tools.map((tool, index) => {
            const name = tool!.localizedName[locale] || tool!.localizedName.en;
            const description = tool!.localizedDescription[locale] || tool!.localizedDescription.en;
            return (
              <li key={tool!.slug} className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-sm font-extrabold text-orange-800">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-stone-500">{ui.stepLabel} {index + 1}</p>
                  <h3 className="mt-1 text-base font-bold text-stone-900">{name}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
                  <Link routeType="tool" slug={tool!.slug} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-800 transition hover:bg-orange-100">
                    {ui.openTool}<ArrowRight size={14} />
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-6">
          <div className="flex items-center gap-2 text-orange-800"><CheckCircle2 size={18} /><h2 className="text-sm font-bold">{ui.outcomeLabel}</h2></div>
          <p className="mt-3 text-sm leading-7 text-stone-700">{copy.outcome}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-center gap-2 text-stone-700"><Info size={18} /><h2 className="text-sm font-bold">{ui.noteLabel}</h2></div>
          <p className="mt-3 text-sm leading-7 text-stone-600">{copy.note}</p>
        </div>
      </section>

      <aside className="rounded-2xl border border-stone-200 bg-white p-5 text-sm leading-7 text-stone-600">
        {workflow.category === 'website-domain' ? ui.privacyNetwork : ui.privacyLocal}
      </aside>

      {relatedWorkflows.length > 0 && (
        <section className="space-y-4 border-t border-stone-200 pt-8">
          <h2 className="text-xl font-bold text-stone-900">{ui.relatedWorkflows}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedWorkflows.map((item) => <WorkflowCard key={item.slug} workflow={item} />)}
          </div>
        </section>
      )}
      <div className="border-t border-stone-200 pt-6">
        <Link routeType="workflows-index" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-orange-800 hover:text-orange-950">
          {ui.workflows}<ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
};
