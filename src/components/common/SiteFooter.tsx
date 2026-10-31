import React from 'react';
import { useI18n } from '../../i18n';
import { Link } from '../../router';
import { CATEGORIES_LIST } from '../../registry/categories.registry';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Shield, Sparkles, ExternalLink } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  const { locale, t } = useI18n();

  return (
    <footer className="w-full bg-white border-t border-stone-200/80 text-stone-500 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Grid: Brand & Categories & Platform Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link routeType="home" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-orange-500/20">
                U
              </div>
              <span className="text-base font-bold tracking-wider text-stone-900">UTILORA</span>
            </Link>
            <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
              {t('hero.subtitle', 'Powerful, simple, and free online utilities for your images, documents, text, code, websites, and videos.')}
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400 pt-2">
              <Shield size={14} className="text-orange-500" />
              <span>{t('footer.cookieNotice')}</span>
            </div>
          </div>

          {/* Categories 1-3 */}
          <div>
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
              {t('nav.categories')}
            </h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES_LIST.slice(0, 3).map((cat) => (
                <li key={cat.id}>
                  <Link
                    routeType="category"
                    slug={cat.slug}
                    className="hover:text-orange-600 transition-colors"
                  >
                    {cat.localizedTitle[locale] || cat.localizedTitle.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories 4-6 */}
          <div>
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
              {t('nav.categories')}
            </h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES_LIST.slice(3, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    routeType="category"
                    slug={cat.slug}
                    className="hover:text-orange-600 transition-colors"
                  >
                    {cat.localizedTitle[locale] || cat.localizedTitle.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Content */}
          <div>
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link routeType="tools-index" className="hover:text-orange-600 transition-colors">
                  {t('nav.allTools')} (36)
                </Link>
              </li>
              <li>
                <Link routeType="articles-index" className="hover:text-orange-600 transition-colors">
                  {t('nav.articles')}
                </Link>
              </li>
              <li>
                <Link routeType="community-index" className="hover:text-orange-600 transition-colors">
                  {t('nav.community')}
                </Link>
              </li>
              <li>
                <Link to="/dev/templates" className="hover:text-orange-600 transition-colors text-orange-600 font-medium">
                  {t('nav.devTemplates')} (Lab)
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
              Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link routeType="privacy" className="hover:text-orange-600 transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link routeType="terms" className="hover:text-orange-600 transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link routeType="copyright" className="hover:text-orange-600 transition-colors">
                  {t('footer.copyright')}
                </Link>
              </li>
              <li>
                <Link routeType="acceptable-use" className="hover:text-orange-600 transition-colors">
                  {t('footer.acceptableUse')}
                </Link>
              </li>
              <li>
                <Link routeType="about" className="hover:text-orange-600 transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link routeType="contact" className="hover:text-orange-600 transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Middle Divider & Language Selector */}
        <div className="pt-8 border-t border-stone-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <LanguageSwitcher variant="footer" />
          <div className="text-xs text-stone-400">
            © {new Date().getFullYear()} UTILORA. {t('footer.rights')}
          </div>
        </div>
      </div>
    </footer>
  );
};
