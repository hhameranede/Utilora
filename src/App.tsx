/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { I18nProvider } from './i18n';
import { RouterProvider, useRouter } from './router';
import { parseRoute } from './router/matcher';
import { SiteHeader } from './components/common/SiteHeader';
import { SiteFooter } from './components/common/SiteFooter';

import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { CategoriesIndexPage } from './pages/CategoriesIndexPage';
import { ToolPage } from './pages/ToolPage';
import { ToolsIndexPage } from './pages/ToolsIndexPage';
import { ArticlesIndexPage } from './pages/articles/ArticlesIndexPage';
import { ArticleCategoryPage } from './pages/articles/ArticleCategoryPage';
import { ArticleDetailPage } from './pages/articles/ArticleDetailPage';
import { CommunityIndexPage } from './pages/community/CommunityIndexPage';
import { CommunityCategoryPage } from './pages/community/CommunityCategoryPage';
import { CommunityTopicPage } from './pages/community/CommunityTopicPage';
import { AboutPage } from './pages/legal/AboutPage';
import { ContactPage } from './pages/legal/ContactPage';
import { PrivacyPage } from './pages/legal/PrivacyPage';
import { TermsPage, CopyrightPage, AcceptableUsePage } from './pages/legal/TermsPage';
import { TemplateGalleryPage } from './pages/dev/TemplateGalleryPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppContent: React.FC = () => {
  const { route } = useRouter();

  const renderCurrentView = () => {
    switch (route.type) {
      case 'home':
        return <HomePage />;
      case 'categories-index':
        return <CategoriesIndexPage />;
      case 'category':
        return <CategoryPage categorySlug={route.categorySlug!} />;
      case 'tools-index':
        return <ToolsIndexPage />;
      case 'tool':
        return <ToolPage toolSlug={route.toolSlug!} />;
      case 'articles-index':
        return <ArticlesIndexPage />;
      case 'article-category':
        return <ArticleCategoryPage categorySlug={route.categorySlug!} />;
      case 'article-detail':
        return <ArticleDetailPage articleSlug={route.articleSlug!} />;
      case 'community-index':
        return <CommunityIndexPage />;
      case 'community-category':
        return <CommunityCategoryPage categorySlug={route.categorySlug!} />;
      case 'community-topic':
        return <CommunityTopicPage topicSlug={route.topicSlug!} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'terms':
        return <TermsPage />;
      case 'copyright':
        return <CopyrightPage />;
      case 'acceptable-use':
        return <AcceptableUsePage />;
      case 'dev-templates':
        return <TemplateGalleryPage />;
      case 'not-found':
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-stone-900 selection:bg-orange-100 selection:text-orange-900">
      <SiteHeader />
      <main className="flex-1 py-8 sm:py-12">
        {renderCurrentView()}
      </main>
      <SiteFooter />
    </div>
  );
};

export interface AppProps {
  /** Initial URL path, supplied by the prerenderer and otherwise read from the browser. */
  initialPath?: string;
}

export default function App({ initialPath }: AppProps = {}) {
  const resolvedPath = initialPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const initialLocale = parseRoute(resolvedPath).locale;

  return (
    <I18nProvider initialLocale={initialLocale}>
      <RouterProvider initialPath={resolvedPath}>
        <AppContent />
      </RouterProvider>
    </I18nProvider>
  );
}
