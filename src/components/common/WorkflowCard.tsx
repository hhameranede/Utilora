import React from 'react';
import { ArrowUpRight, Workflow as WorkflowIcon } from 'lucide-react';
import { useI18n } from '../../i18n';
import { Link } from '../../router';
import { WorkflowDefinition, getWorkflowCopy } from '../../registry/workflows.registry';

interface WorkflowCardProps {
  workflow: WorkflowDefinition;
  className?: string;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, className = '' }) => {
  const { locale } = useI18n();
  const copy = getWorkflowCopy(workflow, locale);

  return (
    <Link
      routeType="workflow"
      slug={workflow.slug}
      className={`group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-700">
          <WorkflowIcon size={19} aria-hidden="true" />
        </span>
        <ArrowUpRight size={17} className="text-stone-400 transition group-hover:text-orange-700 rtl:rotate-[-90deg]" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-bold leading-6 text-stone-900 group-hover:text-orange-800">{copy.title}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-stone-600">{copy.description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-orange-800">
        {locale === 'ar' ? 'عرض الخطوات' : locale === 'fr' ? 'Voir les étapes' : locale === 'es' ? 'Ver pasos' : locale === 'pt' ? 'Ver etapas' : locale === 'hi' ? 'चरण देखें' : locale === 'zh' ? '查看步骤' : locale === 'bn' ? 'ধাপ দেখুন' : 'View steps'}
      </span>
    </Link>
  );
};
