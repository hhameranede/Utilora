import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ArrowRight, CornerDownLeft, FileText, Layers, MessageSquare, Zap } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useNavigate } from '../../router';
import { TOOLS_LIST } from '../../registry/tools.registry';
import { CATEGORIES_LIST } from '../../registry/categories.registry';
import { SAMPLE_ARTICLES } from '../../data/articles.data';
import { SAMPLE_TOPICS } from '../../data/community.data';
import { Icon } from './Icon';

interface GlobalSearchProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onOpen, onClose }) => {
  const { locale, t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setQuery('');
    setSelectedIndex(0);
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  // Global hotkey Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onOpen();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onOpen, onClose]);

  // Filtered results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default: Return popular tools and categories
      return {
        tools: TOOLS_LIST.slice(0, 6),
        categories: CATEGORIES_LIST,
        articles: SAMPLE_ARTICLES.slice(0, 2),
        topics: [],
      };
    }

    const matchedTools = TOOLS_LIST.filter((tool) => {
      const name = (tool.localizedName[locale] || tool.localizedName.en).toLowerCase();
      const desc = (tool.localizedDescription[locale] || tool.localizedDescription.en).toLowerCase();
      const slug = tool.slug.toLowerCase();
      const formats = (tool.acceptedFormats || []).join(' ').toLowerCase();
      return name.includes(q) || desc.includes(q) || slug.includes(q) || formats.includes(q);
    });

    const matchedCategories = CATEGORIES_LIST.filter((cat) => {
      const title = (cat.localizedTitle[locale] || cat.localizedTitle.en).toLowerCase();
      const desc = (cat.localizedDescription[locale] || cat.localizedDescription.en).toLowerCase();
      return title.includes(q) || desc.includes(q);
    });

    const matchedArticles = SAMPLE_ARTICLES.filter((art) => {
      const title = (art.title[locale] || art.title.en).toLowerCase();
      const tags = art.tags.join(' ').toLowerCase();
      return title.includes(q) || tags.includes(q);
    });

    const matchedTopics = SAMPLE_TOPICS.filter((top) => {
      const title = (top.title[locale] || top.title.en).toLowerCase();
      return title.includes(q);
    });

    return {
      tools: matchedTools,
      categories: matchedCategories,
      articles: matchedArticles,
      topics: matchedTopics,
    };
  }, [query, locale]);

  // Flatten for keyboard navigation
  const flatItems = useMemo(() => {
    const items: Array<{
      type: 'tool' | 'category' | 'article' | 'topic';
      id: string;
      title: string;
      subtitle?: string;
      icon: string;
      action: () => void;
    }> = [];

    searchResults.tools.forEach((tool) => {
      items.push({
        type: 'tool',
        id: `tool-${tool.slug}`,
        title: tool.localizedName[locale] || tool.localizedName.en,
        subtitle: tool.localizedDescription[locale] || tool.localizedDescription.en,
        icon: tool.icon,
        action: () => {
          navigate({ type: 'tool', slug: tool.slug, locale });
          onClose();
        },
      });
    });

    searchResults.categories.forEach((cat) => {
      items.push({
        type: 'category',
        id: `cat-${cat.slug}`,
        title: cat.localizedTitle[locale] || cat.localizedTitle.en,
        subtitle: `${cat.toolCount} tools`,
        icon: cat.icon,
        action: () => {
          navigate({ type: 'category', slug: cat.slug, locale });
          onClose();
        },
      });
    });

    searchResults.articles.forEach((art) => {
      items.push({
        type: 'article',
        id: `art-${art.slug}`,
        title: art.title[locale] || art.title.en,
        subtitle: `${art.readingTimeMinutes} min read`,
        icon: 'BookOpen',
        action: () => {
          navigate({ type: 'article-detail', slug: art.slug, locale });
          onClose();
        },
      });
    });

    searchResults.topics.forEach((top) => {
      items.push({
        type: 'topic',
        id: `topic-${top.slug}`,
        title: top.title[locale] || top.title.en,
        subtitle: `${top.replyCount} replies`,
        icon: 'MessageSquare',
        action: () => {
          navigate({ type: 'community-topic', slug: top.slug, locale });
          onClose();
        },
      });
    });

    return items;
  }, [searchResults, locale, navigate, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== inputRef.current) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (flatItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % (flatItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        flatItems[selectedIndex].action();
      }
    }
  };

  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (first && last) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    handleKeyDown(e);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-stone-900/40 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.search')}
        className="w-full max-w-2xl rounded-2xl bg-white border border-stone-200 shadow-2xl shadow-stone-900/20 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleDialogKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-stone-200 gap-3 bg-stone-50/70">
          <Search size={18} className="text-orange-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            aria-label={t('nav.search')}
            aria-autocomplete="list"
            aria-controls={flatItems.length ? 'utilora-search-results' : undefined}
            aria-activedescendant={flatItems[selectedIndex] ? 'utilora-search-option-' + flatItems[selectedIndex].id : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={t('hero.searchPlaceholder', 'Search 36 tools, guides, topics...')}
            className="w-full bg-transparent text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-400 hover:text-stone-600 p-1"
              aria-label="Clear query"
            >
              <X size={15} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono text-stone-400 bg-white border border-stone-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-3 space-y-4">
          {flatItems.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <Zap size={28} className="mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-medium text-stone-700">{t('common.noResults')}</p>
              <p className="text-xs text-stone-400 mt-1">{t('common.tryAnother')}</p>
            </div>
          ) : (
            <div>
              {!query && (
                <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  {t('hero.explorePopular')}
                </div>
              )}
              <div id="utilora-search-results" role="listbox" aria-label={t('nav.search')} className="space-y-1">
                {flatItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      id={'utilora-search-option-' + item.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-orange-50 text-stone-900 border border-orange-200'
                          : 'text-stone-700 hover:bg-stone-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          <Icon name={item.icon} size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate flex items-center gap-2">
                            <span>{item.title}</span>
                            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">
                              {item.type}
                            </span>
                          </div>
                          {item.subtitle && (
                            <div className="text-[11px] text-stone-500 truncate mt-0.5">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center pl-3">
                        {isSelected ? (
                          <CornerDownLeft size={14} className="text-orange-600" />
                        ) : (
                          <ArrowRight size={13} className="text-stone-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center gap-3">
            <span>
              Navigate <kbd className="px-1 py-0.5 bg-white border border-stone-200 rounded text-stone-600">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 bg-white border border-stone-200 rounded text-stone-600">↓</kbd>
            </span>
            <span>
              Select <kbd className="px-1 py-0.5 bg-white border border-stone-200 rounded text-stone-600">↵</kbd>
            </span>
          </div>
          <span>36 Tools · 8 Languages</span>
        </div>
      </div>
    </div>
  );
};
