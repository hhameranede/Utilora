import React from 'react';
import { useI18n } from '../i18n';
import { Link } from '../router';
import { Head } from '../seo/Head';
import { AlertCircle, ArrowLeft, Home, Search } from 'lucide-react';
import { CATEGORIES_LIST } from '../registry/categories.registry';

export const NotFoundPage: React.FC = () => {
  const { locale, t } = useI18n();

  return (
    <>
      <Head
        title="404 — Page Not Found | UTILORA"
        description="The requested digital utility or page does not exist."
        locale={locale}
        routeType="not-found"
        isIndexable={false}
      />

      <div className="ul-content-page max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 border border-orange-100 mx-auto flex items-center justify-center text-orange-600 shadow-xs">
          <AlertCircle size={32} />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-orange-600 font-semibold">
            Status 404 Error
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900">
            {t('common.pageNotFound')}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-md mx-auto leading-relaxed">
            {t('common.pageNotFoundDesc')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            routeType="home"
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-xs shadow-orange-500/20 transition-all flex items-center gap-2 hover:scale-102"
          >
            <Home size={14} />
            <span>{t('common.returnHome')}</span>
          </Link>
          <Link
            routeType="tools-index"
            className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
          >
            {t('nav.allTools')} (36)
          </Link>
        </div>

        {/* Category suggestions */}
        <div className="pt-12 border-t border-stone-200 space-y-4">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Or browse by category
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES_LIST.map((cat) => (
              <Link
                key={cat.id}
                routeType="category"
                slug={cat.slug}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50/70 border border-stone-200 text-xs text-stone-700 hover:text-orange-600 shadow-xs transition-colors"
              >
                {cat.localizedTitle[locale] || cat.localizedTitle.en}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
