import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from '../../router';
import { RouteType } from '../../router/types';

export interface BreadcrumbItem {
  label: string;
  routeType?: RouteType;
  slug?: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-stone-400 ${className}`}>
      <ol className="flex items-center space-x-1.5 rtl:space-x-reverse flex-wrap">
        <li className="flex items-center">
          <Link
            routeType="home"
            className="flex items-center text-stone-400 hover:text-orange-600 transition-colors"
            title="Home"
          >
            <Home size={13} className="shrink-0" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <ChevronRight size={12} className="text-stone-300 shrink-0 rtl:rotate-180" />
              {isLast || (!item.routeType && !item.to) ? (
                <span className="text-stone-800 font-medium truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  routeType={item.routeType}
                  slug={item.slug}
                  to={item.to}
                  className="text-stone-500 hover:text-orange-600 transition-colors truncate max-w-[150px] sm:max-w-xs"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
