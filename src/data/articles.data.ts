import { LocalizedString } from '../registry/tool-types';

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

export const SAMPLE_ARTICLES: ArticleItem[] = [
  {
    id: 'art-1',
    slug: 'png-vs-webp-compression-performance',
    category: 'comparisons',
    title: {
      en: 'PNG vs WebP: Comparing Modern Compression Ratios & Visual Fidelity',
      ar: 'مقارنة شاملة بين PNG و WebP: معدلات الضغط والدقة البصرية',
      fr: 'PNG vs WebP : Comparaison des ratios de compression et de la fidélité',
      es: 'PNG vs WebP: Comparativa de ratios de compresión y fidelidad visual',
      pt: 'PNG vs WebP: Comparando taxas de compressão e fidelidade visual',
      hi: 'PNG बनाम WebP: आधुनिक संपीड़न अनुपात और दृश्य स्पष्टता की तुलना',
      zh: 'PNG 与 WebP 深度对比：现代压缩算法与视觉保真度实测',
      bn: 'PNG বনাম WebP: আধুনিক কম্প্রেশন অনুপাত ও ভিজ্যুয়াল মানের তুলনা',
    },
    excerpt: {
      en: 'An engineering benchmark evaluating lossless alphachannel encoding, bandwidth savings on mobile networks, and cross-browser decoding speeds.',
      ar: 'دراسة هندسية تقارن بين ترميز القنوات اللونية الشفافة وتوفير استهلاك شبكات الهواتف وسرعة فك التشفير.',
    },
    author: 'UTILORA Media Engineering Group',
    publishedAt: '2026-02-14',
    readingTimeMinutes: 6,
    tags: ['WebP', 'PNG', 'Image Optimization', 'Performance'],
    relatedTools: ['image-converter', 'image-compressor', 'image-resizer'],
    contentHeadings: [
      '1. The Evolution of Lossless Raster Graphics',
      '2. Alpha Channel Transparency Benchmarks',
      '3. Decoding Latency and Mobile CPU Overhead',
      '4. Practical Guidelines for Production Deployment',
    ],
  },
  {
    id: 'art-2',
    slug: 'understanding-pdf-linearization-and-page-trees',
    category: 'explanations',
    title: {
      en: 'Understanding PDF Linearization, Page Trees, and Incremental Updates',
      ar: 'فهم معمارية ملفات PDF: شجرة الصفحات والتحميل التدريجي السريع',
      fr: 'Comprendre la linéarisation PDF et les arbres de pages',
      es: 'Comprendiendo la linealización de PDF y los árboles de páginas',
      pt: 'Entendendo a linearização de PDFs e árvores de páginas',
      hi: 'पीडीएफ रैखिककरण और पेज ट्री संरचना को समझना',
      zh: '深度解析 PDF 线性化流式传输、页面对象树与增量更新机制',
      bn: 'পিডিএফ লিনিয়ারাইজেশন এবং পেজ ট্রি আর্কিটেকচার বোঝা',
    },
    excerpt: {
      en: 'A deep architectural dive into the internal dictionary structure of PDF documents, fast web view byte-range requests, and safe merging.',
      ar: 'نظرة تفصيلية على بنية كائنات PDF الداخلية، وتنسيق العرض السريع على الويب، وآليات الدمج الآمن.',
    },
    author: 'UTILORA Document Standards Lab',
    publishedAt: '2026-01-20',
    readingTimeMinutes: 8,
    tags: ['PDF', 'Document Architecture', 'Byte-Range', 'Standards'],
    relatedTools: ['merge-pdf', 'split-pdf', 'pdf-page-counter'],
    contentHeadings: [
      '1. Anatomy of the PDF Document Catalog',
      '2. How Fast Web View (Linearization) Functions',
      '3. Cross-Reference Tables (Xref) and Object Streams',
      '4. Safe Merging Principles Without Cross-Contamination',
    ],
  },
  {
    id: 'art-3',
    slug: 'rfc-8259-json-strict-parsing-and-validation',
    category: 'guides',
    title: {
      en: 'RFC 8259 Guide: Strict JSON Parsing, BigInt Precision, and UTF-8 Safety',
      ar: 'دليل معيار RFC 8259: التحقق الصارم من JSON ودقة الأعداد الكبيرة',
      fr: 'Guide RFC 8259 : Analyse stricte du JSON et précision BigInt',
      es: 'Guía RFC 8259: Parseo estricto de JSON y seguridad UTF-8',
      pt: 'Guia RFC 8259: Análise estrita de JSON e precisão BigInt',
      hi: 'RFC 8259 गाइड: सख्त JSON पार्सिंग और UTF-8 सुरक्षा',
      zh: 'RFC 8259 规范实战：严格 JSON 校验、大整数精度与 UTF-8 安全编码',
      bn: 'RFC 8259 গাইড: নিখুঁত JSON পার্সিং এবং UTF-8 নিরাপত্তা',
    },
    excerpt: {
      en: 'Avoid silent payload corruption by understanding IEEE 754 floating point limitations, escaped surrogates, and schema compliance.',
      ar: 'تجنب تلف البيانات الصامت من خلال فهم قيود الفاصلة العائمة وسلاسل الهروب وتدقيق المخططات البرمجية.',
    },
    author: 'UTILORA Systems Architecture Team',
    publishedAt: '2026-02-02',
    readingTimeMinutes: 5,
    tags: ['JSON', 'RFC 8259', 'APIs', 'Developer Tools'],
    relatedTools: ['json-formatter', 'json-validator', 'json-minifier'],
    contentHeadings: [
      '1. The Strict Boundaries of RFC 8259 vs ECMAScript Objects',
      '2. The 53-Bit Integer Ceiling in Web Clients',
      '3. Handling Unicode Escaped Surrogates Correctly',
      '4. Automated Linting and Schema Validation Best Practices',
    ],
  },
  {
    id: 'art-4',
    slug: 'dns-records-propagation-doh-inspection',
    category: 'tutorials',
    title: {
      en: 'A Practical Guide to DNS Record Propagation, TTLs, and DoH Querying',
      ar: 'دليل عملي لانتشار سجلات DNS وأوقات الصلاحية (TTL) والاستعلام الآمن عبر DoH',
      fr: 'Guide pratique de la propagation DNS et des requêtes DoH',
      es: 'Guía práctica de propagación DNS, TTLs y consultas DoH',
      pt: 'Guia prático de propagação DNS, TTLs e consultas DoH',
      hi: 'DNS रिकॉर्ड प्रसार, TTL और DoH क्वेरी पर व्यावहारिक गाइड',
      zh: '实操指南：DNS 记录全球解析传播、TTL 缓存生命周期与 DoH 安全查询',
      bn: 'DNS রেকর্ড প্রপাগেশন, TTL এবং DoH অনুসন্ধানের ব্যবহারিক গাইড',
    },
    excerpt: {
      en: 'How modern authoritative nameservers handle caching, when to lower TTLs prior to migration, and inspecting DNS over HTTPS directly.',
      ar: 'كيف تتعامل خوادم النطاقات مع التخزين المؤقت، ومتى يجب خفض TTL قبل ترحيل السيرفرات، وفحص سجلات DoH.',
    },
    author: 'UTILORA Network Infrastructure Desk',
    publishedAt: '2026-02-18',
    readingTimeMinutes: 7,
    tags: ['DNS', 'Networking', 'Domains', 'DoH'],
    relatedTools: ['dns-lookup', 'domain-age-checker', 'rdap-lookup', 'website-status-checker'],
    contentHeadings: [
      '1. The Hierarchical DNS Resolution Pipeline',
      '2. Why TTL Values Matter Before Server Migrations',
      '3. Querying DNS over HTTPS (DoH) Without OS Caches',
      '4. Diagnostic Checklist for Mail (MX) and Security (TXT) Records',
    ],
  },
];
