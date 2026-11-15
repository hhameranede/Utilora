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
    },
    {
      locale: 'ar',
      title: 'يوتيلورا — كل مهمة رقمية. في مكان واحد.',
      description: 'أدوات متطورة، سريعة، ومجانية للتعامل مع الصور والمستندات والنصوص والشفرات البرمجية ومواقع الويب والفيديو.',
      imageCategory: 'أدوات الصور',
    },
    {
      locale: 'fr',
      title: 'UTILORA — Chaque tâche numérique. Un seul endroit.',
      description: 'Utilitaires en ligne puissants, rapides et gratuits pour vos images, documents, textes, codes, sites web et vidéos.',
      imageCategory: 'Outils Image',
    },
    {
      locale: 'es',
      title: 'UTILORA — Cada tarea digital. Un solo lugar.',
      description: 'Utilidades en línea potentes, rápidas y gratuitas para imágenes, documentos, texto, código, sitios web y videos.',
      imageCategory: 'Herramientas de Imagen',
    },
    {
      locale: 'pt',
      title: 'UTILORA — Cada tarefa digital. Um só lugar.',
      description: 'Utilitários online potentes, rápidos e gratuitos para imagens, documentos, texto, código, sites e vídeos.',
      imageCategory: 'Ferramentas de Imagem',
    },
    {
      locale: 'hi',
      title: 'UTILORA — हर डिजिटल कार्य। एक ही स्थान।',
      description: 'छवियों, दस्तावेजों, पाठ, कोड, वेबसाइटों और वीडियो के लिए शक्तिशाली, तेज़ और निःशुल्क ऑनलाइन उपकरण।',
      imageCategory: 'छवि उपकरण',
    },
    {
      locale: 'zh',
      title: 'UTILORA — 每一个数字任务。尽在一处。',
      description: '为图像、文档、文本、代码、网站和视频打造的强劲、纯净且永久免费的在线实用工具箱。',
      imageCategory: '图像工具',
    },
    {
      locale: 'bn',
      title: 'UTILORA — প্রতিটি ডিজিটাল কাজ। এক ঠিকানায়।',
      description: 'ছবি, ডকুমেন্ট, টেক্সট, কোড, ওয়েবসাইট এবং ভিডিওর জন্য শক্তিশালী, দ্রুত ও সম্পূর্ণ ফ্রি অনলাইন টুলস।',
      imageCategory: 'ছবি টুলস',
    },
  ];

  for (const locale of localizedHome) {
    await page.goto('/' + locale.locale);
    await expect(page).toHaveTitle(locale.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', locale.description);
    await expect(page.locator('.ulv4-preview-tile').first().locator('b')).toHaveText(locale.imageCategory);
  }
});
