import React from 'react';
import { useI18n } from '../i18n';
import { CATEGORIES_LIST } from '../registry/categories.registry';
import { CategoryCard } from '../components/common/CategoryCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Head } from '../seo/Head';

export const CategoriesIndexPage: React.FC = () => {
  const { locale, t } = useI18n();

  return (
    <>
      <Head
        title="Tool Categories — UTILORA"
        description="Explore 36 digital utilities organized into six purpose-built tool suites: Image, PDF, Text, Developer, Website & Domain, and Video."
        locale={locale}
        routeType="categories-index"
        isIndexable={true}
      />

      <div className="ul-content-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7 sm:space-y-10 lg:space-y-12">
        <Breadcrumbs items={[{ label: t('nav.categories') }]} />

        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
            {t('nav.categories')}
          </h1>
          <p className="text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
            {t('categories.description')}
          </p>
        </div>

        <div className="ul-categories-grid grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES_LIST.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>
    </>
  );
};
