# Guide: Adding an Educational Article or Guide

Articles in UTILORA are structured through `src/data/articles.data.ts`:

```typescript
export interface ArticleItem {
  id: string;
  slug: string;
  category: 'guides' | 'tutorials' | 'tips' | 'comparisons' | 'explanations';
  title: LocalizedString;
  excerpt: LocalizedString;
  author: string;
  publishedAt: string;
  readingTimeMinutes: number;
  tags: string[];
  relatedTools: string[];
  contentHeadings: string[];
}
```

### Steps to Add an Article:
1. Append an article item to `SAMPLE_ARTICLES` in `src/data/articles.data.ts`.
2. Provide localized `title` and `excerpt` for English, Arabic, and other target locales.
3. List 2 to 4 related tools by their slugs in `relatedTools`.
4. The article will automatically be indexed in Global Search (`⌘K`), appear in the Articles Index (`/:lang/articles`), and have a dedicated route at `/:lang/articles/:slug`.
