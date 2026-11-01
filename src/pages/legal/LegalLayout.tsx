import React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Head } from '../../seo/Head';
import { useI18n } from '../../i18n';
import { RouteType } from '../../router/types';

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  routeType: RouteType;
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  subtitle,
  lastUpdated = '',
  routeType,
  children,
}) => {
  const { locale, t } = useI18n();

  return (
    <>
      <Head
        title={`${title} — UTILORA`}
        description={subtitle || `${title} document for UTILORA global digital tools platform.`}
        locale={locale}
        routeType={routeType}
        isIndexable={true}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <Breadcrumbs items={[{ label: title }]} />

        <div className="space-y-3 pb-6 border-b border-stone-200">
          <span className="text-xs font-mono uppercase tracking-widest text-orange-700 font-semibold">
            {t('legal.kicker')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              {subtitle}
            </p>
          )}
          <div className="text-xs font-mono text-stone-500 pt-1">
            {t('legal.lastUpdated')}: {lastUpdated || t('legal.updatedDate')} · {t('legal.effective')}
          </div>
        </div>

        <div className="prose max-w-none text-stone-700 space-y-8 text-sm sm:text-base leading-relaxed">
          {children}
        </div>
      </div>
    </>
  );
};
