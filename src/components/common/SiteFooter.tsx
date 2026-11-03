import React from 'react';
import { useI18n } from '../../i18n';
import { Link } from '../../router';
import { CATEGORIES_LIST } from '../../registry/categories.registry';
import { LanguageSwitcher } from './LanguageSwitcher';
import { BrandLogo } from './BrandLogo';
import { ArrowUpLeft, ShieldCheck } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  const { locale, t } = useI18n();

  return (
    <footer className="ul-footer w-full text-stone-500">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-9 md:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-2 space-y-4">
            <Link routeType="home" className="inline-flex rounded-xl">
              <BrandLogo />
            </Link>
            <p className="max-w-sm text-sm leading-7 text-stone-600">
              {t('hero.subtitle', 'Powerful, simple, and free online utilities for your images, documents, text, code, websites, and videos.')}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-800">
              <ShieldCheck size={15} />
              {t('hero.privacyBadge')}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-extrabold text-stone-900">{t('nav.categories')}</h3>
            <ul className="space-y-3 text-sm">
              {CATEGORIES_LIST.slice(0, 3).map((category) => (
                <li key={category.id}>
                  <Link routeType="category" slug={category.slug}>
                    {category.localizedTitle[locale] || category.localizedTitle.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-extrabold text-stone-900">{t('footer.moreCategories')}</h3>
            <ul className="space-y-3 text-sm">
              {CATEGORIES_LIST.slice(3).map((category) => (
                <li key={category.id}>
                  <Link routeType="category" slug={category.slug}>
                    {category.localizedTitle[locale] || category.localizedTitle.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-extrabold text-stone-900">{t('footer.platform')}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link routeType="tools-index">{t('nav.allTools')}</Link></li>
              <li><Link routeType="categories-index">{t('nav.categories')}</Link></li>
              <li><Link routeType="articles-index">{t('nav.articles')}</Link></li>
              <li><Link routeType="about">{t('nav.about')}</Link></li>
              <li><Link routeType="contact">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-extrabold text-stone-900">{t('footer.legal')}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link routeType="privacy">{t('footer.privacy')}</Link></li>
              <li><Link routeType="terms">{t('footer.terms')}</Link></li>
              <li><Link routeType="copyright">{t('footer.copyright')}</Link></li>
              <li><Link routeType="acceptable-use">{t('footer.acceptableUse')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-stone-200 pt-6 md:flex-row">
          <LanguageSwitcher variant="footer" />
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-500">
            <span>© {new Date().getFullYear()} UTILORA. {t('footer.rights')}</span>
            <Link routeType="home" className="inline-flex items-center gap-1 font-bold text-orange-700">
              UTILORA <ArrowUpLeft size={13} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
