import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ParsedRoute, RouteType } from './types';
import { parseRoute, buildRoutePath } from './matcher';
import { SupportedLocale, useI18n } from '../i18n';

interface RouterContextType {
  route: ParsedRoute;
  navigate: (pathOrType: string | { type: RouteType; slug?: string; locale?: SupportedLocale }) => void;
  switchLocaleInPath: (newLocale: SupportedLocale) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export const RouterProvider: React.FC<{ children: ReactNode; initialPath?: string }> = ({ children, initialPath }) => {
  const { locale, setLocale } = useI18n();

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (initialPath) return initialPath;
    if (typeof window !== 'undefined') return window.location.pathname || '/';
    return '/';
  });

  const parsedRoute = parseRoute(currentPath);

  // Sync locale from path if route specifies a valid locale and differs
  useEffect(() => {
    if (parsedRoute.locale && parsedRoute.locale !== locale && parsedRoute.type !== 'dev-templates') {
      setLocale(parsedRoute.locale);
    }
  }, [parsedRoute.locale, locale, setLocale, parsedRoute.type]);

  // Handle browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback(
    (target: string | { type: RouteType; slug?: string; locale?: SupportedLocale }) => {
      let nextPath: string;
      if (typeof target === 'string') {
        nextPath = target;
      } else {
        const targetLocale = target.locale || locale;
        nextPath = buildRoutePath(targetLocale, target.type, target.slug);
      }

      if (typeof window !== 'undefined' && nextPath !== window.location.pathname) {
        window.history.pushState({}, '', nextPath);
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
      setCurrentPath(nextPath);
    },
    [locale]
  );

  const switchLocaleInPath = useCallback(
    (newLocale: SupportedLocale) => {
      // Rebuild current route with the new locale
      if (parsedRoute.type === 'dev-templates') {
        // Keep dev templates path
        return;
      }

      let slug: string | undefined;
      if (parsedRoute.type === 'tool') slug = parsedRoute.toolSlug;
      else if (parsedRoute.type === 'category') slug = parsedRoute.categorySlug;
      else if (parsedRoute.type === 'article-detail') slug = parsedRoute.articleSlug;
      else if (parsedRoute.type === 'article-category') slug = parsedRoute.categorySlug;
      else if (parsedRoute.type === 'tool-guide') slug = parsedRoute.toolSlug;
      else if (parsedRoute.type === 'workflow') slug = parsedRoute.workflowSlug;

      const nextPath = buildRoutePath(newLocale, parsedRoute.type, slug);
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', nextPath);
      }
      setCurrentPath(nextPath);
      setLocale(newLocale);
    },
    [parsedRoute, setLocale]
  );

  return (
    <RouterContext.Provider
      value={{
        route: parsedRoute,
        navigate,
        switchLocaleInPath,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter(): RouterContextType {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export function useNavigate() {
  const { navigate } = useRouter();
  return navigate;
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  routeType?: RouteType;
  slug?: string;
  className?: string;
  children: ReactNode;
  scrollTo?: string;
}

export const Link: React.FC<LinkProps> = ({
  to,
  routeType,
  slug,
  className,
  children,
  onClick,
  scrollTo,
  ...rest
}) => {
  const { locale } = useI18n();
  const navigate = useNavigate();

  const href = to || (routeType ? buildRoutePath(locale, routeType, slug) : '#');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && href.startsWith('/')) {
      e.preventDefault();
      navigate(href);
      if (scrollTo && typeof window !== 'undefined') {
        window.setTimeout(() => {
          document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
};
