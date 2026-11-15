import { expect, test } from '@playwright/test';

test('V4 visual system is active and keeps the homepage inside mobile viewports', async ({ page }) => {
  for (const width of [320, 360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 820 });
    await page.goto('/en');
    await expect(page.locator('[data-testid="utilora-home-hero"]')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const metrics = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      accent: getComputedStyle(document.querySelector('.ulx-site-shell')!).getPropertyValue('--ul-v4-primary').trim(),
    }));

    expect(metrics.accent).toBe('#4658d8');
    expect(Math.max(metrics.document, metrics.body)).toBeLessThanOrEqual(metrics.viewport + 1);
  }
});

test('V4 homepage remains RTL-aware and searchable in Arabic', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/ar');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('searchbox')).toBeVisible();
  await expect(page.locator('#quick-tools')).toBeVisible();
});

test('Arabic image workspace keeps its primary controls localized', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ar/tools/image-converter');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('button', { name: /اختر صورة للبدء/ })).toBeVisible();
  await expect(page.getByText('ستظهر معاينة صورتك هنا')).toBeVisible();
  await expect(page.getByRole('heading', { name: /إعدادات/ })).toBeVisible();
  await expect(page.getByText('Select an image to begin', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Your image preview will appear here', { exact: true })).toHaveCount(0);

  await page.goto('/ar/tools/image-cropper');
  await expect(page.getByRole('spinbutton', { name: 'X', exact: true })).toBeVisible();
  await expect(page.getByRole('spinbutton', { name: 'Y', exact: true })).toBeVisible();
  await expect(page.getByRole('spinbutton', { name: 'العرض', exact: true })).toBeVisible();
  await expect(page.getByRole('spinbutton', { name: 'الارتفاع', exact: true })).toBeVisible();
});


test('V4 homepage localizes SEO metadata and workspace preview across all supported locales', async ({ page }) => {
  const localizedHome = [
    {
      locale: 'en',
      title: 'UTILORA — Every Digital Task. One Place.',
      description: 'Powerful, simple, and free online utilities for your images, documents, text, code, websites, and videos.',
      imageCategory: 'Image Tools',
      toolsTitle: "All Tools (36) — UTILORA",
      toolsDescription: "Explore all 36 utilities. Search across tool names, descriptions and supported formats, or filter by category. Preview-only tools are clearly marked.",
      categoriesTitle: "Categories — UTILORA",
      categoriesDescription: "Explore the available tools by category. Each suite groups related browser-based utilities in one place.",
    },
    {
      locale: 'ar',
      title: 'يوتيلورا — كل مهمة رقمية. في مكان واحد.',
      description: 'أدوات متطورة، سريعة، ومجانية للتعامل مع الصور والمستندات والنصوص والشفرات البرمجية ومواقع الويب والفيديو.',
      imageCategory: 'أدوات الصور',
      toolsTitle: "جميع الأدوات (36) — يوتيلورا",
      toolsDescription: "استكشف الأدوات الـ36. ابحث حسب اسم الأداة أو وصفها أو صيغ الملفات المدعومة، أو صفِّ النتائج حسب الفئة. ستجد أدوات المعاينة موسومة بوضوح.",
      categoriesTitle: "الفئات — يوتيلورا",
      categoriesDescription: "استكشف الأدوات المتاحة حسب الفئة. تجمع كل فئة الأدوات المتقاربة في مكان واحد لتسهيل الوصول إليها.",
    },
    {
      locale: 'fr',
      title: 'UTILORA — Chaque tâche numérique. Un seul endroit.',
      description: 'Utilitaires en ligne puissants, rapides et gratuits pour vos images, documents, textes, codes, sites web et vidéos.',
      imageCategory: 'Outils Image',
      toolsTitle: "Tous les outils (36) — UTILORA",
      toolsDescription: "Explorez les 36 utilitaires. Recherchez par nom, description ou format pris en charge, ou filtrez par catégorie. Les outils en aperçu sont clairement signalés.",
      categoriesTitle: "Catégories — UTILORA",
      categoriesDescription: "Explorez les outils disponibles par catégorie. Chaque espace regroupe des utilitaires associés accessibles dans le navigateur.",
    },
    {
      locale: 'es',
      title: 'UTILORA — Cada tarea digital. Un solo lugar.',
      description: 'Utilidades en línea potentes, rápidas y gratuitas para imágenes, documentos, texto, código, sitios web y videos.',
      imageCategory: 'Herramientas de Imagen',
      toolsTitle: "Todas las herramientas (36) — UTILORA",
      toolsDescription: "Explora las 36 herramientas. Busca por nombre, descripción o formato compatible, o filtra por categoría. Las herramientas en vista previa están claramente identificadas.",
      categoriesTitle: "Categorías — UTILORA",
      categoriesDescription: "Explora las herramientas disponibles por categoría. Cada grupo reúne utilidades relacionadas que funcionan en el navegador.",
    },
    {
      locale: 'pt',
      title: 'UTILORA — Cada tarefa digital. Um só lugar.',
      description: 'Utilitários online potentes, rápidos e gratuitos para imagens, documentos, texto, código, sites e vídeos.',
      imageCategory: 'Ferramentas de Imagem',
      toolsTitle: "Todas as ferramentas (36) — UTILORA",
      toolsDescription: "Explore as 36 ferramentas. Pesquise por nome, descrição ou formato compatível, ou filtre por categoria. Ferramentas em prévia são identificadas claramente.",
      categoriesTitle: "Categorias — UTILORA",
      categoriesDescription: "Explore as ferramentas disponíveis por categoria. Cada grupo reúne utilitários relacionados que funcionam no navegador.",
    },
    {
      locale: 'hi',
      title: 'UTILORA — हर डिजिटल कार्य। एक ही स्थान।',
      description: 'छवियों, दस्तावेजों, पाठ, कोड, वेबसाइटों और वीडियो के लिए शक्तिशाली, तेज़ और निःशुल्क ऑनलाइन उपकरण।',
      imageCategory: 'छवि उपकरण',
      toolsTitle: "सभी उपकरण (36) — UTILORA",
      toolsDescription: "सभी 36 टूल देखें। नाम, विवरण या समर्थित फ़ॉर्मेट से खोजें, या श्रेणी के अनुसार फ़िल्टर करें। पूर्वावलोकन वाले टूल स्पष्ट रूप से चिह्नित हैं।",
      categoriesTitle: "श्रेणियाँ — UTILORA",
      categoriesDescription: "उपलब्ध टूल को श्रेणी के अनुसार देखें। हर समूह संबंधित ब्राउज़र-आधारित उपयोगिताओं को एक जगह रखता है।",
    },
    {
      locale: 'zh',
      title: 'UTILORA — 每一个数字任务。尽在一处。',
      description: '为图像、文档、文本、代码、网站和视频打造的强劲、纯净且永久免费的在线实用工具箱。',
      imageCategory: '图像工具',
      toolsTitle: "全部工具 (36) — UTILORA",
      toolsDescription: "浏览全部 36 个工具。可按名称、描述或支持的格式搜索，也可按类别筛选。仅供预览的工具会明确标记。",
      categoriesTitle: "分类导航 — UTILORA",
      categoriesDescription: "按类别浏览可用工具。每个类别将相关的浏览器工具集中在一起，方便查找。",
    },
    {
      locale: 'bn',
      title: 'UTILORA — প্রতিটি ডিজিটাল কাজ। এক ঠিকানায়।',
      description: 'ছবি, ডকুমেন্ট, টেক্সট, কোড, ওয়েবসাইট এবং ভিডিওর জন্য শক্তিশালী, দ্রুত ও সম্পূর্ণ ফ্রি অনলাইন টুলস।',
      imageCategory: 'ছবি টুলস',
      toolsTitle: "সকল টুলস (36) — UTILORA",
      toolsDescription: "সব ৩৬টি টুল দেখুন। নাম, বিবরণ বা সমর্থিত ফরম্যাট দিয়ে খুঁজুন, অথবা বিভাগ অনুযায়ী ফিল্টার করুন। প্রিভিউ টুলগুলো স্পষ্টভাবে চিহ্নিত।",
      categoriesTitle: "বিভাগসমূহ — UTILORA",
      categoriesDescription: "বিভাগ অনুযায়ী উপলভ্য টুল দেখুন। প্রতিটি বিভাগ সম্পর্কিত ব্রাউজারভিত্তিক ইউটিলিটিগুলো এক জায়গায় রাখে।",
    },
  ];

  for (const locale of localizedHome) {
    await page.goto('/' + locale.locale);
    await expect(page).toHaveTitle(locale.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', locale.description);
    await expect(page.locator('.ulv4-preview-tile').first().locator('b')).toHaveText(locale.imageCategory);
    await page.goto('/' + locale.locale + '/tools');
    await expect(page).toHaveTitle(locale.toolsTitle);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', locale.toolsDescription);

    await page.goto('/' + locale.locale + '/categories');
    await expect(page).toHaveTitle(locale.categoriesTitle);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', locale.categoriesDescription);
  }
});
