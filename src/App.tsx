/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import posthog from 'posthog-js';
import { I18nProvider, useI18n } from './i18n';
import { RouterProvider, useRouter } from './router';
import { parseRoute } from './router/matcher';
import { SiteHeader } from './components/common/SiteHeader';
import { SiteFooter } from './components/common/SiteFooter';

import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { CategoriesIndexPage } from './pages/CategoriesIndexPage';
import { ToolPage } from './pages/ToolPage';
import { ToolGuidePage } from './pages/ToolGuidePage';
import { ToolsIndexPage } from './pages/ToolsIndexPage';
import { WorkflowsIndexPage } from './pages/WorkflowsIndexPage';
import { WorkflowPage } from './pages/WorkflowPage';
import { ArticlesIndexPage } from './pages/articles/ArticlesIndexPage';
import { ArticleCategoryPage } from './pages/articles/ArticleCategoryPage';
import { ArticleDetailPage } from './pages/articles/ArticleDetailPage';
import { AboutPage } from './pages/legal/AboutPage';
import { ContactPage } from './pages/legal/ContactPage';
import { PrivacyPage } from './pages/legal/PrivacyPage';
import { TermsPage, CopyrightPage, AcceptableUsePage } from './pages/legal/TermsPage';
import { TemplateGalleryPage } from './pages/dev/TemplateGalleryPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppContent: React.FC = () => {
  const { route } = useRouter();
  const { locale } = useI18n();

  useEffect(() => {
    if (!import.meta.env.VITE_POSTHOG_PROJECT_TOKEN) return;

    if (route.type === 'tool' && route.toolSlug) {
      posthog.capture('tool_page_viewed', { tool_slug: route.toolSlug, locale });
    } else if (route.type === 'tool-guide' && route.toolSlug) {
      posthog.capture('tool_guide_viewed', { tool_slug: route.toolSlug, locale });
    } else if (route.type === 'category' && route.categorySlug) {
      posthog.capture('category_page_viewed', { category_slug: route.categorySlug, locale });
    } else if (route.type === 'workflow' && route.workflowSlug) {
      posthog.capture('workflow_page_viewed', { workflow_slug: route.workflowSlug, locale });
    }
  }, [route.type, route.toolSlug, route.categorySlug, route.workflowSlug, locale]);

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
      case 'workflows-index':
        return <WorkflowsIndexPage />;
      case 'workflow':
        return <WorkflowPage workflowSlug={route.workflowSlug!} />;
      case 'tool':
        return <ToolPage toolSlug={route.toolSlug!} />;
      case 'tool-guide':
        return <ToolGuidePage toolSlug={route.toolSlug!} />;
      case 'articles-index':
        return <ArticlesIndexPage />;
      case 'article-category':
        return <ArticleCategoryPage categorySlug={route.categorySlug!} />;
      case 'article-detail':
        return <ArticleDetailPage articleSlug={route.articleSlug!} />;
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
    <div className="ulx-site-shell min-h-screen flex flex-col bg-[#f8f9fc] text-stone-900 selection:bg-orange-100 selection:text-orange-900">
      <SiteHeader />
      <main className="flex-1 py-5 sm:py-8">
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
