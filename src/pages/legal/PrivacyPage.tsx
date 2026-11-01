import React from 'react';
import { LegalLayout } from './LegalLayout';
import { useI18n } from '../../i18n';

export const PrivacyPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <LegalLayout
      title={t('privacy.title')}
      subtitle={t('privacy.subtitle')}
      routeType="privacy"
    >
      <div className="space-y-6">
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-stone-900">{t('privacy.processingTitle')}</h2>
          <p>{t('privacy.processing')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-stone-900">{t('privacy.networkTitle')}</h2>
          <p>{t('privacy.network')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-stone-900">{t('privacy.infrastructureTitle')}</h2>
          <p>{t('privacy.infrastructure')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-stone-900">{t('privacy.preferencesTitle')}</h2>
          <p>{t('privacy.preferences')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-stone-900">{t('privacy.externalTitle')}</h2>
          <p>{t('privacy.external')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-stone-900">{t('privacy.accountsTitle')}</h2>
          <p>{t('privacy.accounts')}</p>
        </section>
      </div>
    </LegalLayout>
  );
};
