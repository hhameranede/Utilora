# Internationalization (i18n) & RTL Guidelines

UTILORA provides first-class support for eight international languages:

1. **English (`en`)** — Default
2. **Arabic (`ar`)** — Complete Right-to-Left (RTL) typography, bidirectional mirroring, and Cairo/Noto Sans Arabic fonts.
3. **French (`fr`)**
4. **Spanish (`es`)**
5. **Portuguese (`pt`)**
6. **Hindi (`hi`)**
7. **Chinese (`zh`)**
8. **Bengali (`bn`)**

## 1. Directory Structure

- Translation dictionaries: `src/i18n/locales/{en,ar,fr,es,pt,hi,zh,bn}.json`
- Provider & Context hook: `src/i18n/index.tsx`
- Document root sync:
  ```typescript
  document.documentElement.lang = locale;
  document.documentElement.dir = dir; // 'rtl' for 'ar', 'ltr' for others
  ```

## 2. Right-to-Left (RTL) Layout Rules

- Use logical utility classes where possible (`space-x-reverse`, `rtl:rotate-180`).
- Direction is automatically updated whenever the user selects a language in `SiteHeader` or `SiteFooter`.
- Slugs remain invariant in URL paths (`/en/tools/image-compressor` vs `/ar/tools/image-compressor`) to preserve clean bookmarking and analytics.
