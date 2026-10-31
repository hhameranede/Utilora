# Guide: Adding a Community Forum Category & Discussion

Community forum sections are declared in `src/data/community.data.ts`.

### 1. Adding a Forum Category
To add a new board (e.g. `showcase` or `security-audits`):
```typescript
{
  id: 'showcase',
  slug: 'showcase',
  title: {
    en: 'Workflows & Showcase',
    ar: 'معرض الأعمال وتجارب الاستخدام',
  },
  description: {
    en: 'Share scripts, automations, and projects built using UTILORA utilities.',
    ar: 'شارك السكربتات والأتمتة والمشاريع التي بنتها باستخدام أدوات يوتيلورا.',
  },
  topicCount: 0,
  postCount: 0,
}
```

### 2. Adding a Discussion Topic
Append to `SAMPLE_TOPICS` with:
- `slug`: Unique URL segment
- `categorySlug`: Matching category id
- `title`: Localized string
- `author`: Display name
- `authorRole`: 'Community Member' | 'Contributor' | 'Core Engineer'
- `content`: Markdown/plain text problem statement
- `replies`: List of reply objects
