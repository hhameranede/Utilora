import { expect, test } from '@playwright/test';

const localizedMergeWorkspace = [
  {
    locale: 'en', direction: 'ltr', toolName: 'Merge PDF', suffix: 'settings',
    choose: 'Choose PDF files to merge', summary: 'PDF · Up to 100 MB per file · Processed locally',
    selected: 'Selected files (0)', clear: 'Clear list', empty: 'No files selected yet.', action: 'Merge PDFs',
  },
  {
    locale: 'ar', direction: 'rtl', toolName: 'دمج ملفات PDF', suffix: 'الإعدادات',
    choose: 'اختر ملفات PDF لدمجها', summary: 'PDF · حتى 100 ميغابايت لكل ملف · تتم المعالجة محلياً',
    selected: 'الملفات المحددة (0)', clear: 'مسح القائمة', empty: 'لم يتم اختيار أي ملفات بعد.', action: 'دمج ملفات PDF',
  },
  {
    locale: 'fr', direction: 'ltr', toolName: 'Fusionner PDF', suffix: 'paramètres',
    choose: 'Choisir les fichiers PDF à fusionner', summary: 'PDF · Jusqu’à 100 Mo par fichier · Traitement local',
    selected: 'Fichiers sélectionnés (0)', clear: 'Vider la liste', empty: 'Aucun fichier sélectionné pour le moment.', action: 'Fusionner les PDF',
  },
  {
    locale: 'es', direction: 'ltr', toolName: 'Unir PDF', suffix: 'ajustes',
    choose: 'Elegir archivos PDF para combinar', summary: 'PDF · Hasta 100 MB por archivo · Procesamiento local',
    selected: 'Archivos seleccionados (0)', clear: 'Vaciar lista', empty: 'Aún no hay archivos seleccionados.', action: 'Unir PDF',
  },
  {
    locale: 'pt', direction: 'ltr', toolName: 'Juntar PDF', suffix: 'configurações',
    choose: 'Selecionar arquivos PDF para juntar', summary: 'PDF · Até 100 MB por arquivo · Processamento local',
    selected: 'Arquivos selecionados (0)', clear: 'Limpar lista', empty: 'Nenhum arquivo selecionado ainda.', action: 'Juntar PDFs',
  },
  {
    locale: 'hi', direction: 'ltr', toolName: 'पीडीएफ मिलाएं', suffix: 'सेटिंग',
    choose: 'मर्ज करने के लिए PDF फ़ाइलें चुनें', summary: 'PDF · प्रति फ़ाइल अधिकतम 100 MB · स्थानीय रूप से संसाधित',
    selected: 'चयनित फ़ाइलें (0)', clear: 'सूची साफ़ करें', empty: 'अभी कोई फ़ाइल चयनित नहीं है।', action: 'PDF मर्ज करें',
  },
  {
    locale: 'zh', direction: 'ltr', toolName: '合并 PDF', suffix: '设置',
    choose: '选择要合并的 PDF 文件', summary: 'PDF · 每个文件最大 100 MB · 本地处理',
    selected: '已选文件 (0)', clear: '清空列表', empty: '尚未选择任何文件。', action: '合并 PDF',
  },
  {
    locale: 'bn', direction: 'ltr', toolName: 'পিডিএফ মার্জ করুন', suffix: 'সেটিংস',
    choose: 'মার্জ করার জন্য PDF ফাইল নির্বাচন করুন', summary: 'PDF · প্রতি ফাইলে সর্বোচ্চ 100 MB · স্থানীয়ভাবে প্রক্রিয়াকৃত',
    selected: 'নির্বাচিত ফাইল (0)', clear: 'তালিকা খালি করুন', empty: 'এখনও কোনো ফাইল নির্বাচন করা হয়নি।', action: 'PDF মার্জ করুন',
  },
] as const;

for (const copy of localizedMergeWorkspace) {
  test(`Merge PDF workspace controls are localized for ${copy.locale}`, async ({ page }) => {
    await page.goto(`/${copy.locale}/tools/merge-pdf`);

    const workspace = page.locator('#tool-workspace');
    await expect(page.locator('html')).toHaveAttribute('lang', copy.locale);
    await expect(page.locator('html')).toHaveAttribute('dir', copy.direction);
    await expect(workspace).toContainText(copy.toolName);
    await expect(workspace).toContainText(`${copy.toolName} · ${copy.suffix}`);
    await expect(workspace).toContainText(copy.choose);
    await expect(workspace).toContainText(copy.summary);
    await expect(workspace).toContainText(copy.selected);
    await expect(workspace.getByRole('button', { name: copy.clear })).toBeVisible();
    await expect(workspace).toContainText(copy.empty);
    await expect(workspace.getByRole('button', { name: copy.action })).toBeVisible();

    if (copy.locale !== 'en') {
      await expect(workspace).not.toContainText('Choose PDF files to merge');
      await expect(workspace).not.toContainText('Selected files');
      await expect(workspace).not.toContainText('Merge PDF settings');
      await expect(workspace).not.toContainText('Processed locally');
    }
  });
}


const localizedPdfOptions = [
  {
    "locale": "en",
    "split": [
      "Page ranges",
      "One PDF per page",
      "Pages to extract",
      "Use page numbers and ranges separated by commas."
    ],
    "rotate": [
      "Pages to rotate",
      "Rotation"
    ],
    "images": [
      "Page size",
      "Fit image dimensions",
      "Orientation",
      "Match each image",
      "Margin (mm)",
      "One image per PDF page. JPG and PNG are supported."
    ],
    "render": [
      "Resolution",
      "Image type",
      "Up to 40 PDF pages per conversion to protect device memory."
    ]
  },
  {
    "locale": "ar",
    "split": [
      "نطاقات الصفحات",
      "ملف PDF لكل صفحة",
      "الصفحات المراد استخراجها",
      "استخدم أرقام الصفحات والنطاقات مفصولة بفواصل."
    ],
    "rotate": [
      "الصفحات المراد تدويرها",
      "التدوير"
    ],
    "images": [
      "حجم الصفحة",
      "ملاءمة أبعاد الصورة",
      "الاتجاه",
      "مطابقة كل صورة",
      "الهامش (مم)",
      "صورة واحدة في كل صفحة PDF. صيغتا JPG وPNG مدعومتان."
    ],
    "render": [
      "الدقة",
      "نوع الصورة",
      "حتى 40 صفحة PDF في كل تحويل لحماية ذاكرة الجهاز."
    ]
  },
  {
    "locale": "fr",
    "split": [
      "Plages de pages",
      "Un PDF par page",
      "Pages à extraire",
      "Utilisez des numéros ou plages de pages séparés par des virgules."
    ],
    "rotate": [
      "Pages à faire pivoter",
      "Rotation"
    ],
    "images": [
      "Format de page",
      "Adapter aux dimensions de l’image",
      "Orientation",
      "Adapter à chaque image",
      "Marge (mm)",
      "Une image par page PDF. JPG et PNG sont pris en charge."
    ],
    "render": [
      "Résolution",
      "Type d’image",
      "Jusqu’à 40 pages PDF par conversion afin de protéger la mémoire de l’appareil."
    ]
  },
  {
    "locale": "es",
    "split": [
      "Rangos de páginas",
      "Un PDF por página",
      "Páginas que extraer",
      "Usa números y rangos de páginas separados por comas."
    ],
    "rotate": [
      "Páginas que girar",
      "Rotación"
    ],
    "images": [
      "Tamaño de página",
      "Ajustar a las dimensiones de la imagen",
      "Orientación",
      "Ajustar a cada imagen",
      "Margen (mm)",
      "Una imagen por página PDF. Se admiten JPG y PNG."
    ],
    "render": [
      "Resolución",
      "Tipo de imagen",
      "Hasta 40 páginas PDF por conversión para proteger la memoria del dispositivo."
    ]
  },
  {
    "locale": "pt",
    "split": [
      "Intervalos de páginas",
      "Um PDF por página",
      "Páginas para extrair",
      "Use números e intervalos de páginas separados por vírgulas."
    ],
    "rotate": [
      "Páginas para girar",
      "Rotação"
    ],
    "images": [
      "Tamanho da página",
      "Ajustar às dimensões da imagem",
      "Orientação",
      "Ajustar a cada imagem",
      "Margem (mm)",
      "Uma imagem por página do PDF. JPG e PNG são aceitos."
    ],
    "render": [
      "Resolução",
      "Tipo de imagem",
      "Até 40 páginas PDF por conversão para proteger a memória do dispositivo."
    ]
  },
  {
    "locale": "hi",
    "split": [
      "पृष्ठ सीमाएँ",
      "हर पृष्ठ के लिए एक PDF",
      "निकालने के लिए पृष्ठ",
      "पृष्ठ संख्या और रेंज को अल्पविराम से अलग करें।"
    ],
    "rotate": [
      "घुमाने के लिए पृष्ठ",
      "घुमाव"
    ],
    "images": [
      "पृष्ठ आकार",
      "छवि के आयामों के अनुसार",
      "दिशा",
      "हर छवि से मिलाएँ",
      "मार्जिन (मिमी)",
      "हर PDF पृष्ठ पर एक छवि। JPG और PNG समर्थित हैं।"
    ],
    "render": [
      "रिज़ॉल्यूशन",
      "छवि प्रकार",
      "डिवाइस मेमोरी की सुरक्षा के लिए प्रति रूपांतरण अधिकतम 40 PDF पृष्ठ।"
    ]
  },
  {
    "locale": "zh",
    "split": [
      "页面范围",
      "每页一个 PDF",
      "要提取的页面",
      "请使用逗号分隔页码和页码范围。"
    ],
    "rotate": [
      "要旋转的页面",
      "旋转角度"
    ],
    "images": [
      "页面大小",
      "适合图片尺寸",
      "方向",
      "匹配每张图片",
      "页边距（毫米）",
      "每个 PDF 页面放置一张图片。支持 JPG 和 PNG。"
    ],
    "render": [
      "分辨率",
      "图像类型",
      "为保护设备内存，每次最多转换 40 个 PDF 页面。"
    ]
  },
  {
    "locale": "bn",
    "split": [
      "পৃষ্ঠার পরিসর",
      "প্রতি পৃষ্ঠার জন্য একটি PDF",
      "যে পৃষ্ঠাগুলো বের করবেন",
      "কমা দিয়ে পৃষ্ঠা নম্বর ও পরিসর আলাদা করুন।"
    ],
    "rotate": [
      "যে পৃষ্ঠাগুলো ঘোরাবেন",
      "ঘোরানোর কোণ"
    ],
    "images": [
      "পৃষ্ঠার আকার",
      "ছবির মাপ অনুযায়ী",
      "অভিমুখ",
      "প্রতিটি ছবির সঙ্গে মিলান",
      "মার্জিন (মিমি)",
      "প্রতি PDF পৃষ্ঠায় একটি ছবি। JPG ও PNG সমর্থিত।"
    ],
    "render": [
      "রেজোলিউশন",
      "ছবির ধরন",
      "ডিভাইসের মেমোরি সুরক্ষায় প্রতি রূপান্তরে সর্বোচ্চ ৪০টি PDF পৃষ্ঠা।"
    ]
  }
] as const;

for (const copy of localizedPdfOptions) {
  test(`PDF option controls are localized for ${copy.locale}`, async ({ page }) => {
    const workspace = page.locator('#tool-workspace');
    await page.goto(`/${copy.locale}/tools/split-pdf`);
    for (const label of copy.split) await expect(workspace).toContainText(label);
    await page.goto(`/${copy.locale}/tools/rotate-pdf`);
    for (const label of copy.rotate) await expect(workspace).toContainText(label);
    await page.goto(`/${copy.locale}/tools/jpg-to-pdf`);
    for (const label of copy.images) await expect(workspace).toContainText(label);
    await page.goto(`/${copy.locale}/tools/pdf-to-jpg`);
    for (const label of copy.render) await expect(workspace).toContainText(label);

    if (copy.locale !== 'en') {
      for (const englishLabel of ['Page ranges', 'Pages to extract', 'Pages to rotate', 'Page size', 'Orientation', 'Resolution', 'Image type']) {
        await expect(workspace).not.toContainText(englishLabel);
      }
    }
  });
}
