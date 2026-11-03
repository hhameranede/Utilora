import React, { useState } from 'react';
import {
  ArrowRight, CheckCircle2, FileImage, FileText, Globe2, Image as ImageIcon,
  LockKeyhole, Search, ShieldCheck, Sparkles, WandSparkles, Zap,
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

const HeroArtwork: React.FC<{ locale: string }> = ({ locale }) => (
  <div className="ul-hero-visual" data-testid="utilora-hero-art" aria-label="UTILORA image editing workspace illustration">
    <div className="ul-hero-orbit" />
    <div className="ul-device">
      <div className="ul-device-screen">
        <div className="ul-device-toolbar"><i /><i /><i /><span className="ms-2 text-[9px] font-semibold text-slate-300">UTILORA Studio</span></div>
        <div className="ul-editor">
          <div className="ul-editor-rail" aria-hidden="true"><ImageIcon size={16}/><FileText size={16}/><WandSparkles size={16}/><LockKeyhole size={16}/><Sparkles size={16}/></div>
          <div className="ul-editor-canvas">
            <svg viewBox="0 0 520 300" role="img" aria-label="Mountain lake image preview" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="ul-sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#C8DEEF"/><stop offset="100%" stopColor="#F5E9D9"/></linearGradient>
                <linearGradient id="ul-water" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8BAFBE"/><stop offset="100%" stopColor="#D6E5E2"/></linearGradient>
              </defs>
              <rect width="520" height="300" fill="url(#ul-sky)"/><circle cx="400" cy="68" r="30" fill="#FFD49B"/>
              <path d="M0 191 87 90l57 57L247 35l125 146 77-81 71 81v119H0Z" fill="#738997"/>
              <path d="m179 102 68-67 125 146-46-21-36 19-45-34-32 21Z" fill="#F8FBFC"/>
              <path d="M0 204 94 157l90 44 107-39 83 49 75-42 71 33v98H0Z" fill="#657F8B"/>
              <path d="M0 225 104 206l99 24 91-27 105 30 121-25v92H0Z" fill="url(#ul-water)"/>
              <path d="m0 246 120-12 89 27 110-20 85 24 116-13v48H0Z" fill="#E7EFEC" opacity=".72"/>
            </svg>
            <div className="ul-crop-outline"/>
          </div>
        </div>
      </div>
      <div className="ul-device-base"/>
    </div>
    <div className="ul-floating-panel" aria-hidden="true">
      <h3>{locale === 'ar' ? 'إعدادات الصورة' : 'Image settings'}</h3>
      <label>{locale === 'ar' ? 'السطوع' : 'Brightness'}<div className="ul-slider"><span style={{width:'68%'}}/></div></label>
      <label>{locale === 'ar' ? 'التباين' : 'Contrast'}<div className="ul-slider"><span style={{width:'46%'}}/></div></label>
      <label>{locale === 'ar' ? 'التشبع' : 'Saturation'}<div className="ul-slider"><span style={{width:'82%'}}/></div></label>
    </div>
    <div className="ul-floating-image" aria-hidden="true">
      <svg viewBox="0 0 220 130">
        <defs><linearGradient id="ul-thumb-sky" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#C8DEEF"/><stop offset="1" stopColor="#F5E9D9"/></linearGradient></defs>
        <rect width="220" height="130" rx="8" fill="url(#ul-thumb-sky)"/>
        <path d="M0 82 52 30l30 34 46-52 54 66 38-36v88H0Z" fill="#879CA4"/>
        <path d="M0 95 58 70l49 21 42-22 71 29v32H0Z" fill="#91B6BD"/><path d="M0 111 80 96l64 18 76-10v26H0Z" fill="#E1EAE5"/>
      </svg>
    </div>
    <div className="ul-image-badge" aria-hidden="true"><ImageIcon size={32}/></div>
    <div className="ul-hero-proof" aria-hidden="true">
      <span><CheckCircle2 size={15}/> مجاني بالكامل</span><span><CheckCircle2 size={15}/> سريع وسهل</span><span><CheckCircle2 size={15}/> معالجة محلية</span>
    </div>
  </div>
);

export const HomePage: React.FC = () => {
  const { locale, t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const popularTools = getPopularTools().slice(0, 6);
  const featuredTools = getFeaturedTools().slice(0, 2);
  const filteredTools = searchQuery.trim()
    ? TOOLS_LIST.filter((tool) => matchesSearch(searchQuery, tool.localizedName, tool.localizedDescription, tool.slug, tool.acceptedFormats)).slice(0, 8)
    : [];
  const heroTitle = locale === 'ar'
    ? <>{'كل ما تحتاجه من أدوات'} <span>{'في مكان واحد'}</span></>
    : t('hero.title');
  const trusts = locale === 'ar'
    ? [
        { icon: ShieldCheck, title: 'آمن وموثوق', detail: 'خصوصيتك تهمنا' },
        { icon: Zap, title: 'سريع وفعال', detail: 'نتائج فورية للأدوات المحلية' },
        { icon: LockKeyhole, title: 'معالجة محلية', detail: 'ملفاتك تبقى على جهازك' },
        { icon: Globe2, title: 'متعدد اللغات', detail: 'ثماني لغات مدعومة' },
      ]
    : [
        { icon: ShieldCheck, title: 'Privacy-aware', detail: 'Your data matters' },
        { icon: Zap, title: 'Fast and simple', detail: 'Useful results, without clutter' },
        { icon: LockKeyhole, title: 'Local processing', detail: 'Files stay on your device' },
        { icon: Globe2, title: 'Multilingual', detail: 'Eight supported languages' },
      ];

  return (
    <>
      <Head title="UTILORA — Every Digital Task. One Place." description="Free online tools for images, documents, text, code, websites and everyday digital tasks." locale={locale} routeType="home" isIndexable schemaType="WebSite"/>
      <div className="ul-home ulx-home-experience w-full">
        <section data-testid="utilora-home-hero" className="ul-hero-grid" aria-labelledby="utilora-hero-title">
          <div className="ul-hero-copy">
            <div className="ul-hero-kicker"><Sparkles size={15}/>{t('hero.badge')}</div>
            <h1 id="utilora-hero-title" className="ul-hero-title">{heroTitle}</h1>
            <p className="ul-hero-description">{t('hero.subtitle')}</p>
            <div className="ul-hero-search">
              <Search className="ul-hero-search-icon" size={20} aria-hidden="true"/>
              <input type="search" value={searchQuery} onChange={(event)=>setSearchQuery(event.target.value)} placeholder={t('hero.searchPlaceholder')} aria-label={t('hero.searchPlaceholder')}/>
              {searchQuery.trim() && <div className="absolute start-0 end-0 top-[calc(100%+9px)] z-30 max-h-80 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-2 text-start shadow-2xl">
                {filteredTools.length===0 ? <p className="p-4 text-center text-xs text-stone-500">{t('common.noResults')}</p> : filteredTools.map((tool)=><Link key={tool.id} routeType="tool" slug={tool.slug} scrollTo="tool-workspace" className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm hover:bg-orange-50">
                  <span className="font-bold text-stone-800">{tool.localizedName[locale]||tool.localizedName.en}</span>
                  <span className="shrink-0 text-xs font-semibold text-orange-700">{getCategoryById(tool.category)?.localizedTitle[locale]||tool.category}</span>
                </Link>)}
              </div>}
            </div>
            <div className="ul-hero-actions">
              <Link routeType="tools-index" className="ul-button-primary">{t('nav.allTools')} <ArrowRight size={16}/></Link>
              <Link routeType="categories-index" className="ul-button-secondary">{t('hero.browseCategories')}</Link>
            </div>
            <div className="ul-hero-shortcuts" aria-label={t('nav.categories')}>
              {CATEGORIES_LIST.slice(0,4).map((category)=><Link key={category.id} routeType="category" slug={category.slug}>{category.localizedTitle[locale]||category.localizedTitle.en}</Link>)}
            </div>
          </div>
          <HeroArtwork locale={locale}/>
        </section>

        <section id="quick-tools" className="ul-home-section" aria-labelledby="quick-tools-heading">
          <div className="ul-section-heading">
            <div><h2 id="quick-tools-heading">{t('home.popularHeading')}</h2><p>{t('home.popularSub')}</p></div>
            <Link routeType="tools-index" className="ul-button-secondary">{t('nav.allTools')} <ArrowRight size={14}/></Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
            {popularTools.map((tool)=><ToolCard key={tool.id} tool={tool} variant="compact"/>)}
          </div>
        </section>

        <section className="ul-trust-strip" aria-label={locale==='ar'?'مزايا UTILORA':'UTILORA benefits'}>
          {trusts.map((item)=>{const TrustIcon=item.icon;return <div className="ul-trust-item" key={item.title}><span className="ul-trust-icon"><TrustIcon size={19}/></span><span><strong>{item.title}</strong><small>{item.detail}</small></span></div>;})}
        </section>

        <section className="ul-home-section" aria-labelledby="home-categories-heading">
          <div className="ul-section-heading">
            <div><h2 id="home-categories-heading">{t('home.categoriesHeading')}</h2><p>{t('home.categoriesSub')}</p></div>
            <Link routeType="categories-index" className="text-sm font-extrabold text-orange-700">{t('nav.categories')} <ArrowRight size={14} className="inline"/></Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
            {CATEGORIES_LIST.map((category)=><CategoryCard key={category.id} category={category}/>)}
          </div>
        </section>

        {featuredTools.length>0 && <section className="ul-home-section" aria-labelledby="home-featured-heading">
          <div className="ul-section-heading"><div><h2 id="home-featured-heading">{t('home.featuredHeading')}</h2><p>{t('home.featuredSub')}</p></div></div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{featuredTools.map((tool)=><FeaturedToolCard key={tool.id} tool={tool}/>)}</div>
        </section>}

        <section className="ul-home-section rounded-[28px] border border-orange-100 bg-gradient-to-l from-orange-50/80 via-white to-white p-6 sm:p-10">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-2xl"><span className="ul-page-kicker"><ShieldCheck size={14}/>{t('home.privacyKicker')}</span><h2 className="mt-4 text-2xl font-extrabold text-stone-900">{t('home.trustHeading')}</h2><p className="mt-2 text-sm leading-7 text-stone-600">{t('common.privacyStatementDesc')}</p></div>
            <div className="flex flex-wrap gap-3"><Link routeType="privacy" className="ul-button-primary">{t('footer.privacy')}</Link><Link routeType="about" className="ul-button-secondary">{t('footer.about')}</Link></div>
          </div>
        </section>

        <section className="ul-home-section" aria-labelledby="home-articles-heading">
          <div className="ul-section-heading"><div><h2 id="home-articles-heading">{t('home.articlesPreviewHeading')}</h2><p>{t('home.articlesPreviewSub')}</p></div><Link routeType="articles-index" className="text-sm font-bold text-orange-700">{t('nav.articles')}</Link></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {SAMPLE_ARTICLES.slice(0,3).map((article)=><Link key={article.id} routeType="article-detail" slug={article.slug} className="group rounded-2xl border border-stone-200 bg-white p-5 no-underline shadow-xs transition hover:border-orange-300">
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><FileImage size={19}/></span>
              <h3 className="text-base font-extrabold text-stone-900 group-hover:text-orange-700">{article.title[locale]||article.title.en}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{article.excerpt[locale]||article.excerpt.en}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-orange-700">{t('articles.readMore')} <ArrowRight size={13}/></span>
            </Link>)}
          </div>
        </section>
      </div>
    </>
  );
};
