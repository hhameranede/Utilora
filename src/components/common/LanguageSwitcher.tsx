import React, { useState, useRef, useEffect } from 'react';
import { useI18n, SupportedLocale } from '../../i18n';
import { useRouter } from '../../router';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer' | 'mobile';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'header', className = '' }) => {
  const { languages, currentLanguage, t } = useI18n();
  const { switchLocaleInPath } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (code: SupportedLocale) => {
    switchLocaleInPath(code);
    setIsOpen(false);
  };

  if (variant === 'footer') {
    return (
      <div className={`flex flex-wrap items-center gap-3 text-xs ${className}`}>
        <span className="text-stone-600 flex items-center gap-1.5">
          <Globe size={13} className="text-orange-500" />
          <span>{t('nav.switchLanguage')}</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`px-2 py-1 rounded-lg transition-colors text-xs font-medium ${
                lang.code === currentLanguage.code
                  ? 'bg-orange-50 text-orange-700 border border-orange-200 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
              title={lang.name}
            >
              {lang.nativeName}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={t("nav.switchLanguage")}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-stone-300 text-xs font-medium text-stone-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <Globe size={14} className="text-orange-500" />
        <span className="max-[359px]:hidden">{currentLanguage.nativeName}</span>
        <ChevronDown size={12} className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180 text-orange-600' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="group"
          aria-label={t('nav.switchLanguage')}
          className="absolute end-0 mt-1.5 w-44 rounded-xl bg-white border border-stone-200 shadow-xl shadow-stone-200/50 py-1.5 z-50"
        >
          {languages.map((lang) => {
            const isSelected = lang.code === currentLanguage.code;
            return (
              <button
                key={lang.code}
                aria-pressed={isSelected}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-start transition-colors ${
                  isSelected
                    ? 'text-orange-700 bg-orange-50 font-semibold'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <div className="flex flex-col">
                  <span>{lang.nativeName}</span>
                  <span className="text-xs text-stone-600">{lang.name}</span>
                </div>
                {isSelected && <Check size={13} className="text-orange-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
