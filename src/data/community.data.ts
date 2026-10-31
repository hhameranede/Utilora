import { LocalizedString } from '../registry/tool-types';

export interface ForumCategory {
  id: string;
  slug: string;
  title: LocalizedString;
  description: LocalizedString;
  topicCount: number;
  postCount: number;
}

export interface ForumTopic {
  id: string;
  slug: string;
  categorySlug: string;
  title: LocalizedString;
  author: string;
  authorRole: 'Community Member' | 'Contributor' | 'Core Engineer';
  createdAt: string;
  replyCount: number;
  viewCount: number;
  lastActivity: string;
  isPinned?: boolean;
  content: string;
  replies?: Array<{
    id: string;
    author: string;
    authorRole: string;
    createdAt: string;
    content: string;
    isSolution?: boolean;
  }>;
}

export const FORUM_CATEGORIES: ForumCategory[] = [
  {
    id: 'general',
    slug: 'general',
    title: {
      en: 'General Discussion',
      ar: 'نقاشات عامة',
      fr: 'Discussion Générale',
      es: 'Discusión General',
      pt: 'Discussão Geral',
      hi: 'सामान्य चर्चा',
      zh: '综合讨论',
      bn: 'সাধারণ আলোচনা',
    },
    description: {
      en: 'Platform announcements, welcome introductions, and community discussions.',
      ar: 'إعلانات المنصة والترحيب بالأعضاء الجدد والنقاشات الرقمية المتنوعة.',
    },
    topicCount: 42,
    postCount: 184,
  },
  {
    id: 'tools',
    slug: 'tools',
    title: {
      en: 'Tool Feature Requests & Feedback',
      ar: 'اقتراحات وملاحظات الأدوات',
      fr: 'Suggestions et retours sur les outils',
      es: 'Solicitudes de funciones y comentarios',
      pt: 'Sugestões de ferramentas e feedback',
      hi: 'उपकरण सुविधा अनुरोध और प्रतिक्रिया',
      zh: '工具功能建议与需求征集',
      bn: 'টুল ফিচার অনুরোধ ও প্রতিক্রিয়া',
    },
    description: {
      en: 'Suggest new utilities, vote on planned features, and discuss template usability.',
      ar: 'اقترح أدوات جديدة وصوّت على الميزات المخططة وناقش سهولة استخدام القوالب.',
    },
    topicCount: 88,
    postCount: 412,
  },
  {
    id: 'technical-support',
    slug: 'technical-support',
    title: {
      en: 'Technical Questions & Architecture',
      ar: 'الأسئلة التقنية والمعمارية',
      fr: 'Questions Techniques et Architecture',
      es: 'Preguntas Técnicas y Arquitectura',
      pt: 'Dúvidas Técnicas e Arquitetura',
      hi: 'तकनीकी प्रश्न और वास्तुकला',
      zh: '技术架构与客户端处理探讨',
      bn: 'কারিগরি প্রশ্ন ও স্থাপত্য',
    },
    description: {
      en: 'In-browser WASM compilation, privacy verification, and browser sandbox constraints.',
      ar: 'مناقشة تجميع WASM في المتصفح والتحقق من الخصوصية وقيود بيئة المتصفح الآمنة.',
    },
    topicCount: 65,
    postCount: 290,
  },
];

export const SAMPLE_TOPICS: ForumTopic[] = [
  {
    id: 'topic-1',
    slug: 'proposal-avif-support-in-image-converter',
    categorySlug: 'tools',
    isPinned: true,
    title: {
      en: 'Proposal: AVIF Image Encoding & Decoding Pipeline in Phase 2',
      ar: 'مقترح: دعم ترميز وفك تشفير صور AVIF في المرحلة الثانية',
      fr: 'Proposition : Pipeline d’encodage et décodage AVIF en Phase 2',
      es: 'Propuesta: Soporte de codificación y decodificación AVIF en Fase 2',
      pt: 'Proposta: Pipeline de codificação e decodificação AVIF na Fase 2',
      hi: 'प्रस्ताव: चरण 2 में AVIF इमेज एन्कोडिंग और डिकोडिंग पाइपलाइन',
      zh: '功能倡议：在第二阶段加入 AVIF 图像格式的高效编解码管线',
      bn: 'প্রস্তাবনা: ফেজ ২ তে AVIF ইমেজ এনকোডিং ও ডিকোডিং পাইপলাইন যুক্ত করা',
    },
    author: 'alex_webdev',
    authorRole: 'Contributor',
    createdAt: '2026-02-19',
    replyCount: 14,
    viewCount: 620,
    lastActivity: '3 hours ago',
    content:
      'With browser support for AVIF now exceeding 93% globally, having AVIF output in the Image Converter workspace alongside PNG/JPG/WebP would provide immense compression benefits for modern hero assets. Are there plans to bundle libaom or libsvtav1 via WebAssembly?',
    replies: [
      {
        id: 'rep-1',
        author: 'utilora_core',
        authorRole: 'Core Engineer',
        createdAt: '2026-02-19',
        content:
          'Great suggestion! In our engine integration contract (`src/engines/image/contracts.ts`), `targetFormat: "avif"` is already defined in the options contract. We are evaluating a modular WASM loader so users only download the AVIF codec chunk on demand.',
        isSolution: true,
      },
      {
        id: 'rep-2',
        author: 'sarah_m',
        authorRole: 'Community Member',
        createdAt: '2026-02-20',
        content:
          'Seconding this! For HDR web assets, 10-bit AVIF is noticeably cleaner than 8-bit WebP.',
      },
    ],
  },
  {
    id: 'topic-2',
    slug: 'local-only-execution-and-content-security-policy',
    categorySlug: 'technical-support',
    title: {
      en: 'How UTILORA Enforces Zero Server Uploads: Local Sandbox Invariants',
      ar: 'كيف تضمن منصة يوتيلورا عدم رفع الملفات إلى الخوادم: ضوابط الأمان المحلية',
      fr: 'Comment UTILORA garantit le zéro upload : Invariants du bac à sable',
      es: 'Cómo UTILORA garantiza cero subidas al servidor: Invariantes locales',
      pt: 'Como a UTILORA garante zero envio para servidores: Invariantes locais',
      hi: 'UTILORA शून्य सर्वर अपलोड कैसे सुनिश्चित करता है: स्थानीय सैंडबॉक्स सिद्धांत',
      zh: 'UTILORA 如何实现零服务端文件上传：客户端沙箱机制深度解析',
      bn: 'UTILORA যেভাবে কোনো সার্ভার আপলোড ছাড়াই শতভাগ লোকাল সিকিউরিটি দেয়',
    },
    author: 'crypto_dan',
    authorRole: 'Community Member',
    createdAt: '2026-02-15',
    replyCount: 9,
    viewCount: 450,
    lastActivity: '1 day ago',
    content:
      'Can someone elaborate on how network isolation will be verified once WASM engines are active? Will strict Content-Security-Policy connect-src directives be published for auditing?',
    replies: [
      {
        id: 'rep-3',
        author: 'utilora_core',
        authorRole: 'Core Engineer',
        createdAt: '2026-02-16',
        content:
          'Yes. All file manipulation tools run in Web Workers isolated from telemetry or external endpoints. In the future production manifest, `connect-src self` will prevent any outbound socket or HTTP transport of user payloads.',
        isSolution: true,
      },
    ],
  },
];
