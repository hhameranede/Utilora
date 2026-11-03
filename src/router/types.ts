import { SupportedLocale } from '../i18n';

export type RouteType =
  | 'home'
  | 'categories-index'
  | 'category'
  | 'tools-index'
  | 'tool'
  | 'tool-guide'
  | 'workflows-index'
  | 'workflow'
  | 'articles-index'
  | 'article-category'
  | 'article-detail'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'copyright'
  | 'acceptable-use'
  | 'dev-templates'
  | 'not-found';

export interface ParsedRoute {
  type: RouteType;
  locale: SupportedLocale;
  categorySlug?: string;
  toolSlug?: string;
  workflowSlug?: string;
  articleSlug?: string;
  rawPath: string;
}
