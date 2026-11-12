import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Braces,
  CheckCircle2,
  FileImage,
  FileText,
  Globe2,
  Image as ImageIcon,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Video,
  WandSparkles,
  Zap,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { Link } from '../router';
import { CATEGORIES_LIST, getCategoryById } from '../registry/categories.registry';
import { getPopularTools, getFeaturedTools, TOOLS_LIST } from '../registry/tools.registry';
import { CategoryCard } from '../components/common/CategoryCard';
import { ToolCard } from '../components/common/ToolCard';
import { FeaturedToolCard } from '../components/common/FeaturedToolCard';
import { Head } from '../seo/Head';
import { SAMPLE_ARTICLES } from '../data/articles.data';
import { matchesSearch } from '../utils/search';

const previewTools = [
  { key: 'image', icon: ImageIcon, title: 'Image tools', subtitle: 'Convert · Resize · Compress' },
  { key: 'pdf', icon: FileText, title: 'PDF workspace', subtitle: 'Merge · Split · Organize' },
  { key: 'text', icon: FileImage, title: 'Text utilities', subtitle: 'Count · Clean · Compare' },
  { key: 'code', icon: Braces, title: 'Developer tools', subtitle: 'Format · Validate · Encode' },
];

const HeroWorkspace: React.FC<{ locale: string }> = ({ locale }) => {
  const arabic = locale === 'ar';

  return (
    <div className="ulv4-hero-visual" aria-hidden="true">
      <div className="ulv4-visual-glow" />
      <div className="ulv4-window">
        <div className="ulv4-window-bar">
          <div className="ulv4-window-brand"><i />UTILORA <span>WORKSPACE</span></div>
          <div className="ulv4-window-dots"><i /><i /><i /></div>
        </div>
        <div className="ulv4-window-content">
          <div className="ulv4-window-rail">
            <span className="ulv4-rail-icon is-active"><ImageIcon size={15} /></span>
            <span className="ulv4-rail-icon"><FileText size={15} /></span>
            <span className="ulv4-rail-icon"><Braces size={15} /></span>
            <span className="ulv4-rail-icon"><Globe2 size={15} /></span>
            <span className="ulv4-rail-icon"><Video size={15} /></span>
          </div>
          <div className="ulv4-window-main">
            <div className="ulv4-window-heading">
              <strong>{arabic ? 'مساحة الأدوات' : 'Your tool workspace'}</strong>
              <span>{arabic ? 'اختر المهمة' : 'CHOOSE A TASK'}</span>
            </div>
            <div className="ulv4-preview-grid">
              {previewTools.map(({ key, icon: PreviewIcon, title, subtitle }) => (
                <div className="ulv4-preview-tile" key={key}>
                  <span className="ulv4-preview-icon"><PreviewIcon size={16} /></span>
                  <span><b>{title}</b><small>{subtitle}</small></span>
                </div>
              ))}
            </div>
            <div className="ulv4-window-bottom">
              <span>{arabic ? 'أدوات واضحة لمهام يومية' : 'Useful tools, without the clutter'}</span>
              <strong>{arabic ? 'استكشف الأدوات ←' : 'EXPLORE TOOLS ↗'}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="ulv4-visual-float ulv4-visual-float--top">
        <span className="ulv4-float-symbol"><ShieldCheck size={16} /></span>
        <span><strong>{arabic ? 'خصوصية أوضح' : 'Privacy-aware'}</strong><small>{arabic ? 'اعرف أين تتم المعالجة' : 'Know where work happens'}</small></span>
      </div>
      <div className="ulv4-visual-float ulv4-visual-float--bottom">
        <span className="ulv4-float-symbol"><Zap size={16} /></span>
        <span><strong>{arabic ? 'سير عمل بسيط' : 'Simple workflows'}</strong><small>{arabic ? 'أداة مناسبة لكل مهمة' : 'The right tool for the task'}</small></span>
      </div>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const { locale, t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const popularTools = getPopularTools().slice(0, 6);
  const featuredTools = getFeaturedTools().slice(0, 2);
  const filteredTools = searchQuery.trim()
    ? TOOLS_LIST.filter((tool) => matchesSearch(
        searchQuery,
        tool.localizedName,
        tool.localizedDescription,
        tool.slug,
        tool.acceptedFormats,
      )).slice(0, 8)
    : [];

  const isArabic = locale === 'ar';
  const heroTitle = isArabic
    ? <>{'كل مهامك الرقمية'} <span>{'في مكان واحد.'}</span></>
    : t('hero.title');

  const trustItems = isArabic
    ? [
        { icon: ShieldCheck, title: 'خصوصية واضحة', detail: 'نعرض أين تتم معالجة بياناتك' },
        { icon: LockKeyhole, title: 'بدون حساب', detail: 'ابدأ مباشرة دون تسجيل' },
        { icon: Zap, title: 'أدوات متخصصة', detail: 'مساحات عمل حسب نوع المهمة' },
        { icon: Globe2, title: 'ثماني لغات', detail: 'واجهة متعددة اللغات' },
      ]
    : [
        { icon: ShieldCheck, title: 'Clear privacy', detail: 'Know how each tool handles data' },
        { icon: LockKeyhole, title: 'No account needed', detail: 'Start with the task, not a signup' },
        { icon: Zap, title: 'Purpose-built tools', detail: 'Workspaces matched to each task' },
        { icon: Globe2, title: 'Eight languages', detail: 'A multilingual experience' },
      ];

  const proofItems = isArabic
    ? ['بدون تسجيل', 'الأدوات والقيود واضحة', 'يعمل على الهاتف والحاسوب']
    : ['No sign-up', 'Clear tool limitations', 'Desktop and mobile ready'];

  const howSteps = [
    { number: '01', title: t('home.step1Title'), description: t('home.step1Desc') },
    { number: '02', title: t('home.step2Title'), description: t('home.step2Desc') },
    { number: '03', title: t('home.step3Title'), description: t('home.step3Desc') },
  ];

  return (
    <>
      <Head
        title="UTILORA — Every Digital Task. One Place."
        description="Free online tools for images, documents, text, code, websites and everyday digital tasks."
        locale={locale}
        routeType="home"
        isIndexable
        schemaType="WebSite"
      />

      <div className="ulv4-home">
        <section data-testid="utilora-home-hero" className="ulv4-hero" aria-labelledby="utilora-hero-title">
          <div className="ulv4-hero-copy">
            <div className="ulv4-eyebrow">
              <Sparkles size={14} />
              {isArabic ? 'منصة أدوات رقمية متكاملة' : t('hero.badge')}
            </div>

            <h1 id="utilora-hero-title" className="ulv4-hero-title">{heroTitle}</h1>
            <p className="ulv4-hero-description">{t('hero.subtitle')}</p>

            <div className="ulv4-search">
              <Search size={19} aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('hero.searchPlaceholder')}
                aria-label={t('hero.searchPlaceholder')}
                aria-controls="utilora-home-search-results"
                aria-expanded={Boolean(searchQuery.trim())}
              />
              {searchQuery.trim() && (
                <div id="utilora-home-search-results" className="ulv4-search-results" role="listbox">
                  {filteredTools.length === 0 ? (
                    <p className="p-4 text-center text-xs text-stone-500" role="status">{t('common.noResults')}</p>
                  ) : filteredTools.map((tool) => (
                    <Link
                      key={tool.id}
                      routeType="tool"
                      slug={tool.slug}
                      scrollTo="tool-workspace"
                      role="option"
                      aria-selected="false"
                    >
                      <span>{tool.localizedName[locale] || tool.localizedName.en}</span>
                      <span>{getCategoryById(tool.category)?.localizedTitle[locale] || tool.category}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="ulv4-actions">
              <Link routeType="tools-index" className="ul-button-primary">
                {t('nav.allTools')} <ArrowUpRight size={16} />
              </Link>
              <Link routeType="categories-index" className="ul-button-secondary">
                {t('hero.browseCategories')}
              </Link>
            </div>

            <div className="ulv4-quick-links" aria-label={t('nav.categories')}>
              <span>{isArabic ? 'ابدأ من:' : 'Explore:'}</span>
              {CATEGORIES_LIST.slice(0, 4).map((category) => (
                <Link key={category.id} routeType="category" slug={category.slug}>
                  {category.localizedTitle[locale] || category.localizedTitle.en}
                </Link>
              ))}
            </div>

            <div className="ulv4-proof-row">
              {proofItems.map((item) => (
                <span key={item}><CheckCircle2 size={14} />{item}</span>
              ))}
            </div>
          </div>

          <HeroWorkspace locale={locale} />
        </section>

        <section id="quick-tools" className="ulv4-section" aria-labelledby="quick-tools-heading">
          <div className="ulv4-section-head">
            <div>
              <h2 id="quick-tools-heading">{t('home.popularHeading')}</h2>
              <p>{t('home.popularSub')}</p>
            </div>
            <Link routeType="tools-index" className="ulv4-section-link">
              {t('nav.allTools')} <ArrowRight size={14} className="inline" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
            {popularTools.map((tool) => <ToolCard key={tool.id} tool={tool} variant="compact" />)}
          </div>
        </section>

        <section className="ulv4-trust" aria-label={isArabic ? 'مزايا UTILORA' : 'UTILORA benefits'}>
          {trustItems.map((item) => {
            const TrustIcon = item.icon;
            return (
              <div className="ulv4-trust-item" key={item.title}>
                <span className="ulv4-trust-icon"><TrustIcon size={18} /></span>
                <span><strong>{item.title}</strong><small>{item.detail}</small></span>
              </div>
            );
          })}
        </section>

        <section className="ulv4-section" aria-labelledby="home-categories-heading">
          <div className="ulv4-section-head">
            <div>
              <h2 id="home-categories-heading">{t('home.categoriesHeading')}</h2>
              <p>{t('home.categoriesSub')}</p>
            </div>
            <Link routeType="categories-index" className="ulv4-section-link">
              {t('nav.categories')} <ArrowRight size={14} className="inline" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
            {CATEGORIES_LIST.map((category) => <CategoryCard key={category.id} category={category} />)}
          </div>
        </section>

        <section className="ulv4-section" aria-labelledby="how-it-works-heading">
          <div className="ulv4-section-head">
            <div>
              <h2 id="how-it-works-heading">{t('home.howItWorksHeading')}</h2>
              <p>{t('home.howItWorksSub')}</p>
            </div>
          </div>
          <div className="ulv4-how">
            {howSteps.map((step) => (
              <article className="ulv4-how-card" key={step.number}>
                <span className="ulv4-how-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        {featuredTools.length > 0 && (
          <section className="ulv4-section" aria-labelledby="home-featured-heading">
            <div className="ulv4-section-head">
              <div>
                <h2 id="home-featured-heading">{t('home.featuredHeading')}</h2>
                <p>{t('home.featuredSub')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {featuredTools.map((tool) => <FeaturedToolCard key={tool.id} tool={tool} />)}
            </div>
          </section>
        )}

        <section className="ulv4-section ulv4-privacy" aria-labelledby="privacy-heading">
          <div>
            <span className="ulv4-eyebrow">
              <ShieldCheck size={14} />
              {t('home.privacyKicker')}
            </span>
            <h2 id="privacy-heading">{t('home.trustHeading')}</h2>
            <p>{t('common.privacyStatementDesc')}</p>
          </div>
          <div className="ulv4-privacy-actions">
            <Link routeType="privacy" className="ul-button-primary">{t('footer.privacy')}</Link>
            <Link routeType="about" className="ul-button-secondary">{t('footer.about')}</Link>
          </div>
        </section>

        <section className="ulv4-section" aria-labelledby="home-articles-heading">
          <div className="ulv4-section-head">
            <div>
              <h2 id="home-articles-heading">{t('home.articlesPreviewHeading')}</h2>
              <p>{t('home.articlesPreviewSub')}</p>
            </div>
            <Link routeType="articles-index" className="ulv4-section-link">
              {t('nav.articles')} <ArrowRight size={14} className="inline" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {SAMPLE_ARTICLES.slice(0, 3).map((article) => (
              <Link
                key={article.id}
                routeType="article-detail"
                slug={article.slug}
                className="ulv4-article-card"
              >
                <span className="ulv4-article-icon"><FileImage size={19} /></span>
                <h3>{article.title[locale] || article.title.en}</h3>
                <p>{article.excerpt[locale] || article.excerpt.en}</p>
                <span>{t('articles.readMore')} <ArrowRight size={13} /></span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};
