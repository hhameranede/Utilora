import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import hi from './locales/hi.json';
import zh from './locales/zh.json';
import bn from './locales/bn.json';

export type SupportedLocale = 'en' | 'ar' | 'fr' | 'es' | 'pt' | 'hi' | 'zh' | 'bn';

export interface LanguageMeta {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: 'EN' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: 'عربي' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: 'FR' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: 'ES' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr', flag: 'PT' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', flag: 'हिं' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr', flag: '中' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', flag: 'বাং' },
];

const DICTIONARIES: Record<SupportedLocale, Record<string, unknown>> = {
  en,
  ar,
  fr,
  es,
  pt,
  hi,
  zh,
  bn,
};

interface I18nContextType {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
  languages: LanguageMeta[];
  currentLanguage: LanguageMeta;
  setLocale: (locale: SupportedLocale) => void;
  t: (path: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getNestedValue(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: SupportedLocale;
  onLocaleChange?: (locale: SupportedLocale) => void;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  initialLocale = 'en',
  onLocaleChange,
}) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    // Check localStorage if available, or use initialLocale
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('utilora_locale') as SupportedLocale;
      if (stored && DICTIONARIES[stored]) {
        return stored;
      }
    }
    return initialLocale;
  });

  const currentLanguage = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((lang) => lang.code === locale) || SUPPORTED_LANGUAGES[0];
  }, [locale]);

  const dir = currentLanguage.dir;

  const setLocale = (newLocale: SupportedLocale) => {
    if (DICTIONARIES[newLocale]) {
      setLocaleState(newLocale);
      if (typeof window !== 'undefined') {
        localStorage.setItem('utilora_locale', newLocale);
      }
      if (onLocaleChange) {
        onLocaleChange(newLocale);
      }
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = dir;
      if (dir === 'rtl') {
        document.documentElement.classList.add('rtl');
      } else {
        document.documentElement.classList.remove('rtl');
      }
    }
  }, [locale, dir]);

  const t = (path: string, fallback?: string): string => {
    // Try current locale
    const localized = getNestedValue(DICTIONARIES[locale], path);
    if (localized) return localized;

    // Fallback to English
    const fallbackEn = getNestedValue(DICTIONARIES.en, path);
    if (fallbackEn) return fallbackEn;

    return fallback ?? path;
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        dir,
        languages: SUPPORTED_LANGUAGES,
        currentLanguage,
        setLocale,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
