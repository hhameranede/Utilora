export interface LocalizedArticleSection {
  en: string;
  ar: string;
}

export interface ArticleBodySection {
  paragraphs: LocalizedArticleSection[];
}

export interface ArticleBody {
  sections: ArticleBodySection[];
  note: LocalizedArticleSection;
  takeaway: LocalizedArticleSection;
}

export const ARTICLE_CONTENT: Record<string, ArticleBody> = {
  'png-vs-webp-compression-performance': {
    sections: [
      { paragraphs: [
        { en: 'PNG stores image data losslessly, so saving a PNG does not introduce the compression artefacts associated with lossy formats. WebP supports both lossy and lossless encoding. The best choice depends on the image, the intended use, and the quality setting—not on a universal file-size ratio.',
          ar: 'يحفظ PNG بيانات الصورة دون فقدان، لذلك لا يضيف آثار الضغط المرتبطة بالتنسيقات ذات الضغط الفاقد. أما WebP فيدعم الضغط الفاقد وغير الفاقد. يعتمد الاختيار الأنسب على نوع الصورة والغرض منها وإعداد الجودة، وليس على نسبة حجم ثابتة تصلح لكل الحالات.' },
        { en: 'Photographs, screenshots, diagrams, and interface assets have different visual characteristics. Compare the exported result at its intended display size before replacing the source file.',
          ar: 'تختلف الصور الفوتوغرافية ولقطات الشاشة والرسومات وأصول الواجهات في خصائصها البصرية. قارن النتيجة المصدّرة بالحجم الذي ستُعرض به فعلياً قبل استبدال الملف الأصلي.' },
      ] },
      { paragraphs: [
        { en: 'Both PNG and WebP can preserve transparency. JPEG does not support an alpha channel, so it is not a direct replacement when transparent areas must remain transparent. Check the output against a contrasting background to catch unexpected halos or colour changes.',
          ar: 'يدعم كل من PNG وWebP الحفاظ على الشفافية. أما JPEG فلا يدعم قناة ألفا، ولذلك لا يصلح بديلاً مباشراً عندما يجب إبقاء المناطق الشفافة كما هي. افحص النتيجة فوق خلفية متباينة لاكتشاف أي هالات أو تغيّر غير متوقع في الألوان.' },
      ] },
      { paragraphs: [
        { en: 'File size is affected by pixel dimensions, image content, encoder implementation, and quality settings. A smaller file is not automatically a better result: inspect fine text, gradients, edges, and transparency after conversion.',
          ar: 'يتأثر حجم الملف بأبعاد الصورة ومحتواها وطريقة عمل أداة الترميز وإعدادات الجودة. لا يعني الملف الأصغر تلقائياً نتيجة أفضل؛ افحص النصوص الدقيقة والتدرجات والحواف والشفافية بعد التحويل.' },
      ] },
      { paragraphs: [
        { en: 'Keep an untouched source copy, export a candidate in the target format, and compare both visual quality and file size. Use lossless output when exact pixels matter; use lossy output only when the visible trade-off is acceptable for the destination.',
          ar: 'احتفظ بنسخة أصلية دون تعديل، ثم صدّر نسخة بالتنسيق المستهدف وقارن الجودة البصرية وحجم الملف معاً. استخدم الإخراج غير الفاقد عندما تكون مطابقة البكسلات مهمة، ولا تستخدم الضغط الفاقد إلا عندما يكون التنازل البصري مقبولاً للغرض المقصود.' },
      ] },
    ],
    note: {
      en: 'Compression results vary with the source image and encoder settings. The values shown by a tool for your own file are more useful than a generic benchmark.',
      ar: 'تختلف نتائج الضغط باختلاف الصورة الأصلية وإعدادات الترميز. القيم التي تعرضها الأداة لملفك الفعلي أكثر فائدة من أرقام اختبار عامة.',
    },
    takeaway: {
      en: 'Choose a format by balancing visual fidelity, transparency needs, compatibility, and the actual size of your exported file.',
      ar: 'اختر التنسيق بموازنة الدقة البصرية والحاجة إلى الشفافية والتوافق والحجم الفعلي للملف بعد التصدير.',
    },
  },
  'understanding-pdf-linearization-and-page-trees': {
    sections: [
      { paragraphs: [
        { en: 'A PDF file is a collection of indirect objects. Its document catalog is the entry point, and the page tree organizes page objects and inherited page attributes. Readers follow these references to find page contents, resources, fonts, and other document features.',
          ar: 'ملف PDF عبارة عن مجموعة من الكائنات غير المباشرة. يمثّل فهرس المستند نقطة البداية، بينما تنظّم شجرة الصفحات كائنات الصفحات والخصائص الموروثة. يتبع قارئ PDF هذه المراجع للوصول إلى المحتوى والموارد والخطوط وبقية خصائص المستند.' },
      ] },
      { paragraphs: [
        { en: 'A linearized PDF is arranged to support efficient display of the first page while the rest of the file is still being transferred. Linearization does not make the document smaller by itself; it changes the organization of data and the information available to a reader early in the download.',
          ar: 'يُرتب ملف PDF الخطي بطريقة تساعد على عرض الصفحة الأولى بكفاءة بينما لا يزال باقي الملف قيد النقل. لا يؤدي هذا الترتيب وحده إلى تصغير المستند؛ بل يغيّر تنظيم البيانات والمعلومات التي يستطيع القارئ الوصول إليها مبكراً أثناء التنزيل.' },
      ] },
      { paragraphs: [
        { en: 'Cross-reference information lets a reader locate indirect objects without scanning the entire file. Traditional files commonly use a cross-reference table; newer files may use cross-reference streams and object streams. Readers must follow the structure actually present in the file.',
          ar: 'تساعد معلومات المراجع المتقاطعة القارئ على تحديد مواقع الكائنات غير المباشرة دون فحص الملف كاملاً. تستخدم الملفات التقليدية غالباً جدول مراجع، بينما قد تستخدم الملفات الأحدث تدفقات للمراجع وتدفقات للكائنات. يجب على القارئ التعامل مع البنية الموجودة فعلياً في الملف.' },
      ] },
      { paragraphs: [
        { en: 'Incremental updates append changed objects and a new cross-reference section instead of rewriting every earlier byte. This can preserve prior revisions and is relevant to digital signatures. When modifying a signed document, do not assume that saving or merging it preserves the original signature validity.',
          ar: 'تضيف التحديثات التزايدية الكائنات المعدلة وقسماً جديداً للمراجع بدلاً من إعادة كتابة جميع البايتات السابقة. وقد يحافظ ذلك على المراجعات السابقة، وهو أمر مهم للتوقيعات الرقمية. عند تعديل مستند موقّع، لا تفترض أن حفظه أو دمجه سيحافظ على صلاحية التوقيع الأصلي.' },
      ] },
    ],
    note: {
      en: 'PDF internals vary by version and producer. A simple merge workflow should be tested with the specific documents you need to combine, especially when forms, bookmarks, metadata, or signatures matter.',
      ar: 'تختلف البنية الداخلية لملفات PDF حسب الإصدار والبرنامج الذي أنشأها. اختبر عملية الدمج مع مستنداتك الفعلية، خصوصاً عندما تكون النماذج أو الإشارات المرجعية أو البيانات الوصفية أو التوقيعات مهمة.',
    },
    takeaway: {
      en: 'Understanding the catalog, page tree, cross-reference data, and update model helps explain why PDF readers and editing tools must preserve more than visible page images.',
      ar: 'يساعد فهم فهرس المستند وشجرة الصفحات والمراجع المتقاطعة وآلية التحديث على إدراك أن قارئات وأدوات تحرير PDF يجب أن تحافظ على أكثر من صور الصفحات الظاهرة.',
    },
  },
  'rfc-8259-json-strict-parsing-and-validation': {
    sections: [
      { paragraphs: [
        { en: 'RFC 8259 defines JSON syntax: objects, arrays, strings, numbers, booleans, and null. A valid JSON document must follow that grammar. Comments, trailing commas, and unquoted property names are not part of standard JSON, even if some developer tools accept them as extensions.',
          ar: 'يحدد RFC 8259 صياغة JSON: الكائنات والمصفوفات والسلاسل النصية والأرقام والقيم المنطقية وnull. يجب أن يتبع المستند الصحيح هذه القواعد. التعليقات والفواصل الزائدة وأسماء الخصائص غير الموضوعة بين علامتي اقتباس ليست جزءاً من JSON القياسي، حتى لو قبلتها بعض أدوات التطوير كامتدادات.' },
      ] },
      { paragraphs: [
        { en: 'JSON has a number grammar, but JavaScript commonly parses numbers into IEEE 754 double-precision values. Integers outside JavaScript’s safe-integer range can lose exact precision. When exact large integers are important, preserve them as strings or use a parser and data model designed for arbitrary precision.',
          ar: 'يمتلك JSON قواعد لصياغة الأرقام، لكن JavaScript يحولها عادةً إلى قيم مزدوجة الدقة وفق IEEE 754. قد تفقد الأعداد الصحيحة الكبيرة جداً دقتها خارج نطاق الأعداد الصحيحة الآمنة في JavaScript. عندما تكون الدقة التامة للأعداد الكبيرة ضرورية، احتفظ بها كسلاسل نصية أو استخدم محللاً ونموذج بيانات يدعمان الدقة الاعتباطية.' },
      ] },
      { paragraphs: [
        { en: 'JSON text is Unicode. Escaped Unicode sequences use four hexadecimal digits after \\u. Characters outside the Basic Multilingual Plane are represented with a UTF-16 surrogate pair. Applications should validate and handle malformed or unpaired surrogate sequences deliberately rather than silently changing data.',
          ar: 'نص JSON مبني على Unicode. تستخدم تسلسلات Unicode المهروبة أربعة أرقام سداسية عشرية بعد \\u. وتمثّل المحارف خارج المستوى متعدد اللغات الأساسي بزوج من بدائل UTF-16. ينبغي للتطبيقات التحقق من التسلسلات التالفة أو غير المزدوجة ومعالجتها بوضوح بدلاً من تغيير البيانات بصمت.' },
      ] },
      { paragraphs: [
        { en: 'Formatting changes whitespace to make a document easier to read; minifying removes unnecessary whitespace to reduce its textual size. Validation checks whether the input follows JSON syntax. Schema validation is a separate step that checks whether the valid JSON data has the expected structure and value constraints.',
          ar: 'يغيّر التنسيق المسافات البيضاء لتسهيل قراءة المستند، بينما يزيل التصغير المسافات غير الضرورية لتقليل حجمه النصي. يتحقق فحص الصياغة من اتباع المدخل لقواعد JSON. أما التحقق من المخطط فهو خطوة منفصلة تفحص مطابقة البيانات الصحيحة للبنية والقيود المتوقعة.' },
      ] },
    ],
    note: {
      en: 'A formatter can make valid JSON readable, but formatting alone does not prove that the data matches an API contract or application schema.',
      ar: 'يمكن لأداة التنسيق جعل JSON الصحيح أسهل قراءة، لكن التنسيق وحده لا يثبت أن البيانات تطابق عقد API أو مخطط التطبيق.',
    },
    takeaway: {
      en: 'Separate syntax validation, schema validation, and numeric-precision decisions; they solve different classes of JSON problems.',
      ar: 'افصل بين التحقق من الصياغة والتحقق من المخطط وقرارات دقة الأرقام؛ فكل منها يعالج نوعاً مختلفاً من مشكلات JSON.',
    },
  },
  'dns-records-propagation-doh-inspection': {
    sections: [
      { paragraphs: [
        { en: 'DNS resolution follows a hierarchy. A recursive resolver can consult cached data or query the DNS hierarchy, starting with root servers, then the relevant top-level domain servers, and finally the domain’s authoritative nameservers. The authoritative answer depends on the records published for that name.',
          ar: 'يتبع حل أسماء DNS تسلسلاً هرمياً. يستطيع المحلل التكراري استخدام البيانات المخزنة مؤقتاً أو الاستعلام من تسلسل DNS، بدءاً من خوادم الجذر، ثم خوادم النطاق الأعلى، وأخيراً خوادم الأسماء الموثوقة للنطاق. وتعتمد الإجابة الموثوقة على السجلات المنشورة لذلك الاسم.' },
      ] },
      { paragraphs: [
        { en: 'The TTL tells caching resolvers how long a record may remain in cache. After a record changes, different resolvers may continue returning earlier cached answers until their cached entries expire or are refreshed. “Propagation” is therefore not a single switch that updates every cache at once.',
          ar: 'تحدد قيمة TTL المدة التي يمكن أن يبقى فيها السجل في ذاكرة المحلل المؤقتة. بعد تغيير السجل، قد تستمر محاللات مختلفة في إرجاع الإجابات القديمة المخزنة حتى تنتهي صلاحيتها أو يتم تحديثها. لذلك فإن «الانتشار» ليس مفتاحاً واحداً يحدّث جميع الذاكرات المؤقتة في اللحظة نفسها.' },
      ] },
      { paragraphs: [
        { en: 'DNS over HTTPS (DoH) sends DNS queries over an HTTPS connection to a chosen resolver. This protects the query from being read or modified by some on-path observers, but the DoH resolver still receives the query. Resolver choice and its privacy policy remain important.',
          ar: 'يرسل DNS عبر HTTPS (DoH) استعلامات DNS ضمن اتصال HTTPS إلى محلل تختاره. يحمي ذلك الاستعلام من القراءة أو التعديل بواسطة بعض الجهات الواقعة على مسار الاتصال، لكن محلل DoH نفسه يستقبل الاستعلام. لذلك يظل اختيار المحلل وسياسة الخصوصية الخاصة به أمراً مهماً.' },
      ] },
      { paragraphs: [
        { en: 'A records map names to IPv4 addresses, AAAA records to IPv6 addresses, CNAME records provide aliases, MX records identify mail exchangers, and TXT records carry text data used by many services. NS and SOA records describe authoritative DNS information. Check the queried name, record type, answer, and TTL together.',
          ar: 'تربط سجلات A الأسماء بعناوين IPv4، وسجلات AAAA بعناوين IPv6، وتوفر CNAME أسماء مستعارة، وتحدد MX خوادم البريد، بينما تحمل TXT بيانات نصية تستخدمها خدمات عديدة. وتصف سجلات NS وSOA معلومات DNS الموثوقة. افحص الاسم المستعلم عنه ونوع السجل والإجابة وTTL معاً.' },
      ] },
    ],
    note: {
      en: 'A DNS lookup reports the answer returned by the resolver you queried at that moment. It does not guarantee that every network, ISP, or device has the same cached answer.',
      ar: 'يعرض استعلام DNS الإجابة التي أعادها المحلل الذي استعلمت منه في تلك اللحظة. ولا يضمن أن جميع الشبكات أو مزودي الإنترنت أو الأجهزة تمتلك الإجابة المخزنة نفسها.',
    },
    takeaway: {
      en: 'To investigate a DNS change, compare authoritative records, several recursive resolvers, record TTLs, and the exact hostname and record type.',
      ar: 'لتحليل تغيير في DNS، قارن السجلات الموثوقة وعدة محاللات تكرارية وقيم TTL واسم المضيف ونوع السجل المطلوب بدقة.',
    },
  },
};

export function getArticleContent(slug: string, locale: string) {
  const content = ARTICLE_CONTENT[slug];
  if (!content) return undefined;
  const language = locale === 'ar' ? 'ar' : 'en';
  return {
    sections: content.sections.map((section) => ({
      paragraphs: section.paragraphs.map((paragraph) => paragraph[language]),
    })),
    note: content.note[language],
    takeaway: content.takeaway[language],
  };
}
