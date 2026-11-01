import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { useRouter, Link } from '../../router';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { GlobalSearch } from './GlobalSearch';
import { BrandLogo } from './BrandLogo';
import { CATEGORIES_LIST } from '../../registry/categories.registry';
import { Icon } from './Icon';

export const SiteHeader: React.FC = () => {
  const { locale, t } = useI18n();
  const { route } = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1 sm:gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link
              routeType="home"
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg"
            >
              <BrandLogo />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
              <Link
                routeType="tools-index"
                className={`transition-colors hover:text-orange-700 ${
                  route.type === 'tools-index' || route.type === 'tool' || route.type === 'tool-guide' ? 'text-orange-700 font-semibold' : ''
                }`}
              >
                {t('nav.tools')}
              </Link>

              {/* Categories Mega Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsCategoryMenuOpen(true)}
                onMouseLeave={() => setIsCategoryMenuOpen(false)}
                onKeyDown={(event) => { if (event.key === 'Escape') setIsCategoryMenuOpen(false); }}
                onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsCategoryMenuOpen(false); }}
              >
                <button
                  type="button"
                  onClick={() => setIsCategoryMenuOpen((open) => !open)}
                  aria-haspopup="true"
                  aria-expanded={isCategoryMenuOpen}
                  aria-controls="utilora-category-menu"
                  className={`flex items-center gap-1 transition-colors hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 focus-visible:ring-offset-4 rounded-md ${route.type === 'categories-index' || route.type === 'category' ? 'text-orange-700 font-semibold' : ''}`}
                >
                  <span>{t('nav.categories')}</span>
                  <ChevronDown size={12} aria-hidden="true" className={`transition-transform text-stone-500 ${isCategoryMenuOpen ? 'rotate-180 text-orange-700' : ''}`} />
                </button>

                {isCategoryMenuOpen && (
                  <div id="utilora-category-menu" className="absolute start-0 mt-2 w-72 rounded-2xl bg-white border border-stone-200 shadow-xl shadow-stone-200/50 p-2 z-50">
                    <Link routeType="categories-index" onClick={() => setIsCategoryMenuOpen(false)} className="mb-1 flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-orange-800 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700">
                      <span>{t('nav.categories')}</span><span aria-hidden="true">→</span>
                    </Link>
                    <div className="space-y-1">
                      {CATEGORIES_LIST.map((cat) => (
                        <Link key={cat.id} routeType="category" slug={cat.slug} onClick={() => setIsCategoryMenuOpen(false)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50/70 text-stone-700 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 transition-colors group">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center group-hover:bg-orange-700 group-hover:text-white transition-colors"><Icon name={cat.icon} size={15} /></div>
                          <div><div className="text-xs font-semibold text-stone-800 group-hover:text-orange-700">{cat.localizedTitle[locale] || cat.localizedTitle.en}</div><div className="text-xs text-stone-500">{cat.toolCount} {t('nav.tools').toLowerCase()}</div></div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                routeType="articles-index"
                className={`transition-colors hover:text-orange-700 ${
                  route.type.startsWith('article') ? 'text-orange-700 font-semibold' : ''
                }`}
              >
                {t('nav.articles')}
              </Link>

              <Link
                routeType="about"
                className={`transition-colors hover:text-orange-700 ${
                  route.type === 'about' ? 'text-orange-700 font-semibold' : ''
                }`}
              >
                {t('nav.about')}
              </Link>
            </nav>
          </div>

          {/* Right Controls: Search, Language, Dev Lab, Mobile Toggle */}
          <div className="flex items-center gap-1 sm:gap-2.5">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-stone-300 text-xs text-stone-500 hover:text-stone-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              aria-label={t('nav.searchShort')}
              aria-haspopup="dialog"
              aria-controls="utilora-global-search"
              aria-expanded={isSearchOpen}
              aria-keyshortcuts="Control+K Meta+K"
            >
              <Search size={14} className="text-orange-600" />
              <span className="hidden sm:inline">{t('nav.searchShort')}</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-stone-500 bg-white border border-stone-200 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Language Selector */}
            <LanguageSwitcher variant="header" />

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label={t("nav.toggleNavigation")}
              aria-expanded={isMobileMenuOpen}
              aria-controls="utilora-mobile-navigation"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearch isOpen={isSearchOpen} onOpen={() => setIsSearchOpen(true)} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div id="utilora-mobile-navigation" role="navigation" aria-label={t('nav.toggleNavigation')} className="fixed inset-0 top-16 z-30 bg-white md:hidden overflow-y-auto p-4 border-b border-stone-200 animate-fadeIn">
          <div className="space-y-4">
            {/* Quick search input */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-500"
            >
              <div className="flex items-center gap-2">
                <Search size={15} className="text-orange-600" />
                <span>{t('nav.search')}</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-stone-500 bg-white border border-stone-200 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              <Link
                routeType="home"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-stone-800 hover:text-orange-700"
              >
                {t('brand.name')}
              </Link>
              <Link
                routeType="tools-index"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-stone-800 hover:text-orange-700"
              >
                {t('nav.tools')} (36)
              </Link>
              <Link
                routeType="categories-index"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-stone-800 hover:text-orange-700"
              >
                {t('nav.categories')}
              </Link>
              <div className="ps-4 space-y-1">
                {CATEGORIES_LIST.map((cat) => (
                  <Link
                    key={cat.id}
                    routeType="category"
                    slug={cat.slug}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-stone-600 hover:text-orange-700"
                  >
                    <Icon name={cat.icon} size={13} className="text-orange-600" />
                    <span>{cat.localizedTitle[locale] || cat.localizedTitle.en}</span>
                  </Link>
                ))}
              </div>
              <Link
                routeType="articles-index"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-stone-800 hover:text-orange-700"
              >
                {t('nav.articles')}
              </Link>
              <Link
                routeType="about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-stone-800 hover:text-orange-700"
              >
                {t('nav.about')}
              </Link>
            </div>

            {/* Mobile Language Selector */}
            <div className="pt-4 border-t border-stone-200">
              <div className="text-xs font-semibold text-stone-600 mb-2">{t('nav.switchLanguage')}</div>
              <LanguageSwitcher variant="footer" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
