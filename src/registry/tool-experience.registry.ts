import { SupportedLocale } from '../i18n';

export interface ToolExperience {
  eyebrow: string;
  positioning: { en: string; ar: string };
  benefits: { en: string[]; ar: string[] };
  steps: { en: string[]; ar: string[] };
  example: { en: string; ar: string };
}

const experience = {
  'image-converter': {
    eyebrow: 'IMAGE WORKSPACE',
    positioning: { en: 'Convert image formats without leaving your browser.', ar: 'حوّل صيغ الصور مباشرةً من متصفحك دون الحاجة إلى برنامج إضافي.' },
    benefits: { en: ['Choose PNG, JPG, or WebP output', 'Review the output before saving', 'Understand that re-encoding can affect quality and metadata'], ar: ['اختر صيغة PNG أو JPG أو WebP', 'راجع النتيجة قبل حفظها', 'اعرف أن إعادة الترميز قد تؤثر في الجودة والبيانات الوصفية'] },
    steps: { en: ['Add a supported image to the workspace', 'Choose the output format and available settings', 'Convert, review the result, and download it'], ar: ['أضف صورة مدعومة إلى مساحة العمل', 'اختر صيغة الإخراج والإعدادات المتاحة', 'حوّل الصورة وراجع النتيجة ثم نزّلها'] },
    example: { en: 'Prepare a JPG image as WebP for a lighter web page, or export a PNG when transparency matters.', ar: 'حوّل صورة JPG إلى WebP لتخفيف صفحة ويب، أو صدّر PNG عندما تكون الشفافية مهمة.' },
  },
  'image-compressor': {
    eyebrow: 'IMAGE WORKSPACE',
    positioning: { en: 'Reduce image file size while keeping control of output quality.', ar: 'قلّل حجم ملفات الصور مع التحكم في جودة النتيجة.' },
    benefits: { en: ['Adjust the available compression quality', 'Compare source and output file sizes', 'Save the converted result locally'], ar: ['اضبط مستوى جودة الضغط المتاح', 'قارن حجم الملف الأصلي بالنتيجة', 'احفظ الصورة الناتجة على جهازك'] },
    steps: { en: ['Add a supported image', 'Adjust the quality setting to balance size and appearance', 'Review the resulting size and download the image'], ar: ['أضف صورة مدعومة', 'اضبط الجودة لتحقيق توازن بين الحجم والمظهر', 'راجع الحجم الناتج ثم نزّل الصورة'] },
    example: { en: 'Create a smaller WebP image for a blog post, product page, or upload form.', ar: 'أنشئ صورة WebP أصغر لمقال أو صفحة منتج أو نموذج رفع ملفات.' },
  },
  'image-resizer': {
    eyebrow: 'IMAGE WORKSPACE',
    positioning: { en: 'Resize images to exact pixel dimensions or by percentage.', ar: 'غيّر أبعاد الصور بالبكسل بدقة أو باستخدام النسبة المئوية.' },
    benefits: { en: ['Set exact width and height', 'Scale by percentage when speed matters', 'Lock the aspect ratio to avoid distortion'], ar: ['حدّد العرض والارتفاع بدقة', 'استخدم النسبة المئوية للتغيير السريع', 'ثبّت نسبة الأبعاد لتجنب تشويه الصورة'] },
    steps: { en: ['Load the image you want to resize', 'Enter dimensions or choose a scale percentage', 'Check the preview and export the resized image'], ar: ['حمّل الصورة التي تريد تغيير أبعادها', 'أدخل المقاسات أو اختر نسبة التحجيم', 'افحص المعاينة ثم صدّر الصورة'] },
    example: { en: 'Prepare a 1200-pixel-wide image for a website or create a smaller copy for sharing.', ar: 'جهّز صورة بعرض 1200 بكسل لموقعك أو أنشئ نسخة أصغر للمشاركة.' },
  },
  'image-cropper': {
    eyebrow: 'IMAGE WORKSPACE',
    positioning: { en: 'Crop an image visually or define the crop with precise pixel values.', ar: 'اقتصّ الصورة بالسحب أو حدّد منطقة القص بإحداثيات دقيقة.' },
    benefits: { en: ['Select the crop area on the image', 'Use exact pixel coordinates where needed', 'Keep the composition focused on the subject'], ar: ['حدّد منطقة القص مباشرة على الصورة', 'استخدم إحداثيات البكسل عند الحاجة', 'ركّز التكوين على العنصر المهم'] },
    steps: { en: ['Load an image into the crop workspace', 'Drag to select an area or enter its pixel coordinates', 'Review the crop and export the result'], ar: ['حمّل الصورة داخل مساحة القص', 'اسحب لتحديد المنطقة أو أدخل إحداثياتها', 'راجع القص ثم صدّر النتيجة'] },
    example: { en: 'Trim empty space around a product photo or create a focused profile-picture crop.', ar: 'احذف المساحات الفارغة حول صورة منتج أو جهّز قصّة مناسبة لصورة شخصية.' },
  },
  'image-rotator': {
    eyebrow: 'IMAGE WORKSPACE',
    positioning: { en: 'Correct image orientation with precise rotation and flip controls.', ar: 'صحّح اتجاه الصورة باستخدام أدوات تدوير وقلب واضحة.' },
    benefits: { en: ['Rotate by common quarter-turn angles', 'Flip horizontally or vertically', 'Check orientation before exporting'], ar: ['دوّر الصورة بزوايا الدوران الشائعة', 'اقلبها أفقياً أو عمودياً', 'تحقق من الاتجاه قبل التصدير'] },
    steps: { en: ['Add the image to the workspace', 'Choose a rotation or flip operation', 'Inspect the preview and save the corrected image'], ar: ['أضف الصورة إلى مساحة العمل', 'اختر التدوير أو عملية القلب', 'افحص المعاينة واحفظ الصورة المصححة'] },
    example: { en: 'Fix a sideways photo or mirror a graphic for a layout.', ar: 'صحّح صورة مائلة أو اعكس رسماً لاستخدامه في تصميم.' },
  },
  'image-metadata-viewer': {
    eyebrow: 'IMAGE INSPECTOR',
    positioning: { en: 'Inspect image dimensions, format, size, and browser-readable properties.', ar: 'افحص أبعاد الصورة وصيغتها وحجمها والخصائص التي يتيحها المتصفح.' },
    benefits: { en: ['Read dimensions, format, and file size', 'Check aspect ratio and sampled transparency', 'See the limits of the metadata this tool can extract'], ar: ['اعرض الأبعاد والصيغة وحجم الملف', 'افحص نسبة الأبعاد وعينة الشفافية', 'اعرف حدود البيانات الوصفية التي تستطيع الأداة استخراجها'] },
    steps: { en: ['Select an image file', 'Review the detected file properties', 'Use the values to verify or document the image'], ar: ['اختر ملف صورة', 'راجع خصائص الملف التي تم اكتشافها', 'استخدم المعلومات للتحقق من الصورة أو توثيقها'] },
    example: { en: 'Check whether an image meets a website dimension requirement before uploading it.', ar: 'تحقق من مطابقة الصورة لمتطلبات أبعاد موقع قبل رفعها.' },
  },
  'merge-pdf': {
    eyebrow: 'PDF WORKSPACE',
    positioning: { en: 'Combine several PDF documents into one file in the order you choose.', ar: 'اجمع عدة مستندات PDF في ملف واحد وفق الترتيب الذي تختاره.' },
    benefits: { en: ['Add multiple PDF files to one queue', 'Arrange the documents before merging', 'Create one combined PDF for download'], ar: ['أضف عدة ملفات PDF إلى قائمة واحدة', 'رتّب المستندات قبل دمجها', 'أنشئ ملف PDF موحداً للتنزيل'] },
    steps: { en: ['Select the PDF files to combine', 'Arrange the files in the required order', 'Merge the documents and save the combined PDF'], ar: ['اختر ملفات PDF التي تريد جمعها', 'رتّب الملفات وفق التسلسل المطلوب', 'ادمج المستندات واحفظ ملف PDF الناتج'] },
    example: { en: 'Combine scanned pages, reports, or separate sections into one document.', ar: 'اجمع صفحات ممسوحة ضوئياً أو تقارير أو أجزاء منفصلة في مستند واحد.' },
  },
  'split-pdf': {
    eyebrow: 'PDF WORKSPACE',
    positioning: { en: 'Extract selected pages or split a PDF into separate page files.', ar: 'استخرج صفحات محددة أو قسّم ملف PDF إلى ملفات منفصلة.' },
    benefits: { en: ['Choose a page range to extract', 'Separate individual pages when required', 'Keep the original document unchanged'], ar: ['اختر نطاق الصفحات المراد استخراجه', 'افصل الصفحات الفردية عند الحاجة', 'احتفظ بالمستند الأصلي دون تغيير'] },
    steps: { en: ['Load a PDF document', 'Choose the page range or split mode', 'Run the split and download the generated files'], ar: ['حمّل مستند PDF', 'اختر نطاق الصفحات أو طريقة التقسيم', 'نفّذ التقسيم ثم نزّل الملفات الناتجة'] },
    example: { en: 'Extract a chapter or a signed page from a larger PDF.', ar: 'استخرج فصلاً أو صفحة موقّعة من ملف PDF كبير.' },
  },
  'rotate-pdf': {
    eyebrow: 'PDF WORKSPACE',
    positioning: { en: 'Correct PDF page orientation before sharing or printing.', ar: 'صحّح اتجاه صفحات PDF قبل المشاركة أو الطباعة.' },
    benefits: { en: ['Rotate pages to the correct orientation', 'Work with page-level controls', 'Export a corrected PDF copy'], ar: ['دوّر الصفحات إلى الاتجاه الصحيح', 'تحكم في الصفحات بصورة مستقلة', 'صدّر نسخة PDF مصححة'] },
    steps: { en: ['Open the PDF file', 'Select the pages and rotation direction', 'Review the page layout and download the updated PDF'], ar: ['افتح ملف PDF', 'اختر الصفحات واتجاه الدوران', 'راجع ترتيب الصفحات ونزّل ملف PDF المحدّث'] },
    example: { en: 'Fix landscape scans that were saved sideways in a portrait document.', ar: 'صحّح الصفحات الممسوحة أفقياً التي حُفظت بشكل جانبي داخل مستند عمودي.' },
  },
  'jpg-to-pdf': {
    eyebrow: 'PDF WORKSPACE',
    positioning: { en: 'Turn image files into a shareable PDF document.', ar: 'حوّل ملفات الصور إلى مستند PDF سهل المشاركة.' },
    benefits: { en: ['Add multiple supported images', 'Arrange image order before export', 'Build a single PDF document'], ar: ['أضف عدة صور مدعومة', 'رتّب الصور قبل التصدير', 'أنشئ مستند PDF واحداً'] },
    steps: { en: ['Choose the images to include', 'Arrange their order in the document', 'Create and download the PDF'], ar: ['اختر الصور التي تريد إدراجها', 'رتّب ظهور الصور داخل المستند', 'أنشئ ملف PDF ثم نزّله'] },
    example: { en: 'Combine photographed receipts or scanned notes into one PDF.', ar: 'اجمع صور الإيصالات أو الملاحظات الممسوحة ضوئياً في ملف PDF واحد.' },
  },
  'pdf-to-jpg': {
    eyebrow: 'PDF WORKSPACE',
    positioning: { en: 'Export PDF pages as image files for viewing and sharing.', ar: 'صدّر صفحات PDF كصور لتسهيل عرضها ومشاركتها.' },
    benefits: { en: ['Convert document pages into images', 'Choose the pages you need', 'Download image output for reuse'], ar: ['حوّل صفحات المستند إلى صور', 'اختر الصفحات التي تحتاجها', 'نزّل الصور لإعادة استخدامها'] },
    steps: { en: ['Upload a PDF document', 'Choose available page and export settings', 'Convert the pages and save the images'], ar: ['ارفع مستند PDF', 'اختر إعدادات الصفحات والتصدير المتاحة', 'حوّل الصفحات واحفظ الصور'] },
    example: { en: 'Create image previews of selected pages for a presentation or message.', ar: 'أنشئ معاينات مصورة لصفحات محددة لاستخدامها في عرض أو رسالة.' },
  },
  'pdf-page-counter': {
    eyebrow: 'PDF INSPECTOR',
    positioning: { en: 'Check PDF page count and inspect basic document information.', ar: 'اعرف عدد صفحات PDF وافحص المعلومات الأساسية للمستند.' },
    benefits: { en: ['Read the document page count', 'Inspect available PDF properties', 'Check a file before processing or printing'], ar: ['اعرض عدد صفحات المستند', 'افحص خصائص PDF المتاحة', 'تحقق من الملف قبل المعالجة أو الطباعة'] },
    steps: { en: ['Select a PDF file', 'Wait for the document to be inspected', 'Review the page count and available details'], ar: ['اختر ملف PDF', 'انتظر حتى تنتهي قراءة المستند', 'راجع عدد الصفحات والتفاصيل المتاحة'] },
    example: { en: 'Verify the page count of a scanned assignment before submitting it.', ar: 'تحقق من عدد صفحات واجب ممسوح ضوئياً قبل إرساله.' },
  },
  'word-counter': {
    eyebrow: 'TEXT WORKSPACE',
    positioning: { en: 'Measure the length and structure of text as you write.', ar: 'قِس طول النص وبنيته أثناء الكتابة.' },
    benefits: { en: ['Track words and characters live', 'Review sentence and paragraph counts', 'Use the totals to meet writing limits'], ar: ['تابع عدد الكلمات والأحرف مباشرة', 'راجع عدد الجمل والفقرات', 'استخدم الإحصاءات للالتزام بحدود الكتابة'] },
    steps: { en: ['Paste or type your text', 'Review the live writing statistics', 'Edit until the text meets your target'], ar: ['الصق النص أو اكتبه', 'راجع إحصاءات النص المباشرة', 'عدّل النص حتى يطابق هدفك'] },
    example: { en: 'Check an essay, article, application, or social post against a word limit.', ar: 'تحقق من عدد كلمات مقال أو طلب أو منشور قبل إرساله.' },
  },
  'character-counter': {
    eyebrow: 'TEXT WORKSPACE',
    positioning: { en: 'Count characters accurately, with a clear view of spaces.', ar: 'احسب الأحرف بدقة مع توضيح تأثير المسافات.' },
    benefits: { en: ['See total characters as you type', 'Distinguish counts with and without spaces', 'Check limits for forms and short messages'], ar: ['شاهد عدد الأحرف أثناء الكتابة', 'ميّز بين العد مع المسافات ودونها', 'تحقق من حدود النماذج والرسائل القصيرة'] },
    steps: { en: ['Enter or paste text', 'Choose the character count you need', 'Adjust the text to fit the required limit'], ar: ['أدخل النص أو الصقه', 'اختر نوع عدّ الأحرف المطلوب', 'عدّل النص ليلائم الحد المطلوب'] },
    example: { en: 'Check a title or short bio before entering it into a character-limited field.', ar: 'تحقق من عنوان أو نبذة قصيرة قبل وضعها في حقل محدود الأحرف.' },
  },
  'case-converter': {
    eyebrow: 'TEXT WORKSPACE',
    positioning: { en: 'Change text capitalization without rewriting the content.', ar: 'غيّر حالة أحرف النص دون إعادة كتابة المحتوى.' },
    benefits: { en: ['Convert between supported letter cases', 'Preview the transformed text immediately', 'Copy the result for reuse'], ar: ['حوّل النص بين أنماط الأحرف المدعومة', 'عاين النص بعد التحويل مباشرة', 'انسخ النتيجة لإعادة استخدامها'] },
    steps: { en: ['Paste the text you want to transform', 'Choose the capitalization style', 'Review and copy the converted result'], ar: ['الصق النص الذي تريد تحويله', 'اختر نمط الأحرف المناسب', 'راجع النتيجة المحوّلة ثم انسخها'] },
    example: { en: 'Standardize headings or convert a pasted title to sentence case.', ar: 'وحّد تنسيق العناوين أو حوّل عنواناً منسوخاً إلى حالة الجملة.' },
  },
  'duplicate-lines-remover': {
    eyebrow: 'TEXT WORKSPACE',
    positioning: { en: 'Remove repeated lines from lists while controlling how duplicates are matched.', ar: 'احذف الأسطر المكررة من القوائم مع التحكم في طريقة اكتشاف التكرار.' },
    benefits: { en: ['Remove duplicate entries from a text list', 'Choose how repeated lines are compared', 'Keep a clean list for copying or export'], ar: ['احذف العناصر المكررة من القائمة النصية', 'تحكم في طريقة مقارنة الأسطر المتكررة', 'احتفظ بقائمة نظيفة للنسخ أو التصدير'] },
    steps: { en: ['Paste a line-based list', 'Set the duplicate handling options', 'Review the cleaned list and copy it'], ar: ['الصق قائمة يتكون كل عنصر فيها من سطر', 'اضبط خيارات معالجة التكرار', 'راجع القائمة المنظّفة ثم انسخها'] },
    example: { en: 'Clean repeated email addresses, identifiers, or pasted inventory entries.', ar: 'نظّف عناوين بريد أو معرّفات أو عناصر مكررة من قائمة منسوخة.' },
  },
  'sort-text-lines': {
    eyebrow: 'TEXT WORKSPACE',
    positioning: { en: 'Sort a text list into a predictable order.', ar: 'رتّب قائمة نصية وفق ترتيب واضح يمكن التحكم فيه.' },
    benefits: { en: ['Sort lines alphabetically or numerically', 'Choose ascending or descending order', 'Prepare consistent lists for other tools'], ar: ['رتّب الأسطر أبجدياً أو رقمياً', 'اختر الترتيب التصاعدي أو التنازلي', 'جهّز قوائم متناسقة لأدوات أخرى'] },
    steps: { en: ['Paste the lines to organize', 'Choose the sorting mode and direction', 'Review and copy the sorted list'], ar: ['الصق الأسطر التي تريد تنظيمها', 'اختر طريقة الفرز واتجاهه', 'راجع القائمة المرتبة ثم انسخها'] },
    example: { en: 'Put names, filenames, or numeric entries into a consistent order.', ar: 'رتّب أسماء أو ملفات أو قيماً رقمية بطريقة موحدة.' },
  },
  'text-diff-checker': {
    eyebrow: 'TEXT COMPARISON',
    positioning: { en: 'Compare two text versions and identify what changed.', ar: 'قارن نسختين من النص وحدّد الأجزاء التي تغيّرت.' },
    benefits: { en: ['View two text versions side by side', 'Identify additions and removals', 'Review edits before accepting a revision'], ar: ['اعرض نسختين من النص جنباً إلى جنب', 'حدّد الإضافات والأجزاء المحذوفة', 'راجع التعديلات قبل اعتماد النسخة الجديدة'] },
    steps: { en: ['Paste the original text into the first panel', 'Paste the revised text into the second panel', 'Inspect the highlighted differences'], ar: ['الصق النص الأصلي في اللوحة الأولى', 'الصق النص المعدّل في اللوحة الثانية', 'افحص الاختلافات المظللة'] },
    example: { en: 'Review changes between two document drafts or configuration snippets.', ar: 'راجع التغييرات بين مسودتين لمستند أو مقطعين من الإعدادات.' },
  },
  'json-formatter': {
    eyebrow: 'DEVELOPER WORKSPACE',
    positioning: { en: 'Format JSON into a readable structure for debugging and development.', ar: 'نسّق JSON في بنية واضحة تسهّل القراءة وتصحيح الأخطاء.' },
    benefits: { en: ['Indent nested objects and arrays', 'Make large JSON payloads easier to inspect', 'Copy clean formatted output'], ar: ['نسّق الكائنات والمصفوفات المتداخلة', 'سهّل فحص بيانات JSON الكبيرة', 'انسخ النتيجة المنسّقة'] },
    steps: { en: ['Paste JSON into the editor', 'Run the formatting action', 'Inspect and copy the structured output'], ar: ['الصق JSON داخل المحرر', 'نفّذ عملية التنسيق', 'افحص النتيجة المنظمة ثم انسخها'] },
    example: { en: 'Make a compact API response readable before investigating a bug.', ar: 'حوّل استجابة API مضغوطة إلى صيغة مقروءة قبل البحث عن خطأ.' },
  },
  'json-validator': {
    eyebrow: 'DEVELOPER WORKSPACE',
    positioning: { en: 'Validate JSON syntax and locate parsing problems.', ar: 'تحقق من صحة صياغة JSON وحدّد مواضع أخطاء التحليل.' },
    benefits: { en: ['Check whether the input is valid JSON', 'Surface parser errors when syntax is invalid', 'Validate data before sending it to an API'], ar: ['تحقق من صلاحية JSON', 'اعرض أخطاء التحليل عند وجود صياغة غير صحيحة', 'افحص البيانات قبل إرسالها إلى API'] },
    steps: { en: ['Paste the JSON document', 'Run validation', 'Review the validation result and fix reported syntax errors'], ar: ['الصق مستند JSON', 'نفّذ التحقق', 'راجع النتيجة وأصلح أخطاء الصياغة المعروضة'] },
    example: { en: 'Check a request body or configuration file before using it in an application.', ar: 'افحص جسم طلب أو ملف إعدادات قبل استخدامه داخل تطبيق.' },
  },
  'json-minifier': {
    eyebrow: 'DEVELOPER WORKSPACE',
    positioning: { en: 'Remove unnecessary JSON whitespace while preserving valid JSON data.', ar: 'احذف المسافات غير الضرورية من JSON مع المحافظة على صحة البيانات.' },
    benefits: { en: ['Create a compact JSON representation', 'Reduce formatting whitespace', 'Keep the result ready to copy'], ar: ['أنشئ تمثيلاً مختصراً لـ JSON', 'قلّل مسافات التنسيق غير الضرورية', 'جهّز النتيجة للنسخ'] },
    steps: { en: ['Paste valid JSON', 'Run the minify action', 'Review and copy the compact output'], ar: ['الصق JSON صالحاً', 'نفّذ عملية التصغير', 'راجع النتيجة المختصرة ثم انسخها'] },
    example: { en: 'Compact a JSON payload for a test fixture or a constrained text field.', ar: 'اختصر بيانات JSON لاستخدامها في اختبار أو حقل نصي محدود.' },
  },
  'base64-encoder-decoder': {
    eyebrow: 'DEVELOPER WORKSPACE',
    positioning: { en: 'Encode text to Base64 or decode a Base64 string.', ar: 'رمّز النص إلى Base64 أو فك ترميز نص Base64.' },
    benefits: { en: ['Switch between encoding and decoding', 'Handle text input in a dedicated workspace', 'Copy the transformed string'], ar: ['بدّل بين الترميز وفك الترميز', 'عالج النص داخل مساحة مخصصة', 'انسخ السلسلة بعد التحويل'] },
    steps: { en: ['Enter the source text or Base64 string', 'Choose encode or decode', 'Review the output and copy it'], ar: ['أدخل النص الأصلي أو سلسلة Base64', 'اختر الترميز أو فك الترميز', 'راجع النتيجة ثم انسخها'] },
    example: { en: 'Inspect a Base64 value used in a test payload or configuration.', ar: 'افحص قيمة Base64 مستخدمة في بيانات اختبار أو إعدادات.' },
  },
  'url-encoder-decoder': {
    eyebrow: 'DEVELOPER WORKSPACE',
    positioning: { en: 'Encode or decode URL components for safe use in web addresses.', ar: 'رمّز مكونات الروابط أو فك ترميزها لاستخدامها بصورة صحيحة.' },
    benefits: { en: ['Encode reserved URL characters', 'Decode percent-encoded values', 'Check strings before building a URL'], ar: ['رمّز المحارف المحجوزة في الروابط', 'فك ترميز القيم المشفرة بالنسبة المئوية', 'افحص السلاسل قبل تكوين رابط'] },
    steps: { en: ['Paste a URL component or encoded value', 'Choose encode or decode', 'Copy the resulting string into your workflow'], ar: ['الصق مكوّناً من رابط أو قيمة مشفرة', 'اختر الترميز أو فك الترميز', 'انسخ السلسلة الناتجة إلى مشروعك'] },
    example: { en: 'Encode a search query before inserting it into a URL parameter.', ar: 'رمّز عبارة بحث قبل إدراجها في وسيط داخل رابط.' },
  },
  'uuid-generator': {
    eyebrow: 'DEVELOPER WORKSPACE',
    positioning: { en: 'Generate unique identifier values for development and testing.', ar: 'أنشئ معرّفات فريدة لاستخدامها في التطوير والاختبار.' },
    benefits: { en: ['Generate one or multiple identifiers', 'Choose the supported UUID version', 'Copy generated values for your project'], ar: ['أنشئ معرّفاً واحداً أو عدة معرّفات', 'اختر إصدار UUID المدعوم', 'انسخ القيم الناتجة إلى مشروعك'] },
    steps: { en: ['Choose the identifier options', 'Generate the requested values', 'Copy one value or the generated set'], ar: ['اختر إعدادات المعرّفات', 'أنشئ القيم المطلوبة', 'انسخ قيمة واحدة أو المجموعة الناتجة'] },
    example: { en: 'Create test IDs for mock records or development fixtures.', ar: 'أنشئ معرّفات اختبار لسجلات وهمية أو بيانات تطوير.' },
  },
  'hash-generator': {
    eyebrow: 'DEVELOPER WORKSPACE',
    positioning: { en: 'Generate a cryptographic hash from supported input.', ar: 'أنشئ بصمة تجزئة تشفيرية من المدخلات المدعومة.' },
    benefits: { en: ['Choose from the algorithms exposed by the tool', 'Generate a digest from the supplied input', 'Copy the result for comparison or testing'], ar: ['اختر من خوارزميات التجزئة التي تتيحها الأداة', 'أنشئ بصمة للمدخلات المقدمة', 'انسخ النتيجة للمقارنة أو الاختبار'] },
    steps: { en: ['Enter the supported source input', 'Select an available hash algorithm', 'Generate and copy the digest'], ar: ['أدخل المدخلات المدعومة', 'اختر خوارزمية تجزئة متاحة', 'أنشئ البصمة ثم انسخها'] },
    example: { en: 'Create a digest to compare test strings or verify a known value.', ar: 'أنشئ بصمة لمقارنة نصوص اختبار أو التحقق من قيمة معروفة.' },
  },
  'domain-age-checker': {
    eyebrow: 'DOMAIN INTELLIGENCE',
    positioning: { en: 'Estimate domain registration age using publicly available registration records.', ar: 'قدّر عمر النطاق اعتماداً على سجلات التسجيل العامة المتاحة.' },
    benefits: { en: ['Look up public registration dates', 'See the source-derived registration timeline', 'Understand when registry data is unavailable'], ar: ['استعلم عن تواريخ التسجيل العامة', 'اعرض التسلسل الزمني المستند إلى مصدر البيانات', 'اعرف متى تكون بيانات السجل غير متاحة'] },
    steps: { en: ['Enter a domain name', 'Run the public registration lookup', 'Review the returned dates and source limitations'], ar: ['أدخل اسم النطاق', 'نفّذ الاستعلام عن بيانات التسجيل العامة', 'راجع التواريخ وحدود المصدر'] },
    example: { en: 'Check the public registration history of a domain before evaluating it.', ar: 'افحص تاريخ تسجيل نطاق علني قبل تقييمه.' },
  },
  'rdap-lookup': {
    eyebrow: 'DOMAIN INTELLIGENCE',
    positioning: { en: 'Inspect public domain registration data through RDAP.', ar: 'افحص بيانات تسجيل النطاق العامة عبر بروتوكول RDAP.' },
    benefits: { en: ['Read available registrar and status fields', 'Inspect nameserver and date information when provided', 'View the returned public registry data'], ar: ['اعرض معلومات المسجّل والحالة المتاحة', 'افحص الخوادم الاسمية والتواريخ عند توفرها', 'راجع بيانات السجل العام المسترجعة'] },
    steps: { en: ['Enter the domain to inspect', 'Query the public RDAP service', 'Review the response fields and missing-data notes'], ar: ['أدخل النطاق المراد فحصه', 'استعلم من خدمة RDAP العامة', 'راجع حقول الاستجابة وملاحظات البيانات الناقصة'] },
    example: { en: 'Check the current public registration status and nameservers of a domain.', ar: 'تحقق من حالة التسجيل العامة والخوادم الاسمية لنطاق.' },
  },
  'dns-lookup': {
    eyebrow: 'DOMAIN INTELLIGENCE',
    positioning: { en: 'Query public DNS records and inspect the answers returned.', ar: 'استعلم عن سجلات DNS العامة وافحص الإجابات المسترجعة.' },
    benefits: { en: ['Query supported DNS record types', 'Inspect record values in a readable result view', 'Copy records for troubleshooting'], ar: ['استعلم عن أنواع سجلات DNS المدعومة', 'افحص القيم في عرض واضح', 'انسخ السجلات لأغراض استكشاف الأخطاء'] },
    steps: { en: ['Enter a hostname', 'Choose the DNS record type', 'Run the lookup and inspect the returned records'], ar: ['أدخل اسم المضيف', 'اختر نوع سجل DNS', 'نفّذ الاستعلام وافحص السجلات الناتجة'] },
    example: { en: 'Inspect A, AAAA, MX, TXT, or NS answers while diagnosing a domain.', ar: 'افحص سجلات A أو AAAA أو MX أو TXT أو NS أثناء تشخيص نطاق.' },
  },
  'website-status-checker': {
    eyebrow: 'WEBSITE DIAGNOSTICS',
    positioning: { en: 'Check the HTTP response available from a public website address.', ar: 'افحص استجابة HTTP المتاحة من عنوان موقع عام.' },
    benefits: { en: ['Review the response status when accessible', 'See timing and diagnostic details exposed by the request', 'Distinguish a confirmed response from a blocked or unknown result'], ar: ['راجع حالة الاستجابة عند توفرها', 'اعرض التوقيت والتفاصيل التشخيصية التي يتيحها الطلب', 'ميّز بين استجابة مؤكدة ونتيجة محجوبة أو غير معروفة'] },
    steps: { en: ['Enter a public website URL', 'Run the credential-free status check', 'Read the response and any browser/network limitations'], ar: ['أدخل رابط موقع عام', 'نفّذ فحص الحالة دون بيانات اعتماد', 'اقرأ الاستجابة وقيود المتصفح أو الشبكة إن وجدت'] },
    example: { en: 'Check whether a public website returns an HTTP response from your current browser network.', ar: 'تحقق مما إذا كان موقع عام يعيد استجابة HTTP من شبكة متصفحك الحالية.' },
  },
  'http-headers-checker': {
    eyebrow: 'WEBSITE DIAGNOSTICS',
    positioning: { en: 'Inspect accessible HTTP response headers and security-related policies.', ar: 'افحص ترويسات HTTP المتاحة وسياسات الأمان المرتبطة بها.' },
    benefits: { en: ['Review returned response headers', 'Look for security policies such as CSP and HSTS when exposed', 'Understand CORS and redirect visibility limitations'], ar: ['راجع ترويسات الاستجابة المسترجعة', 'ابحث عن سياسات مثل CSP وHSTS عند ظهورها', 'افهم حدود عرض CORS والتحويلات'] },
    steps: { en: ['Enter a public website URL', 'Request the accessible response headers', 'Inspect the values and note any CORS restrictions'], ar: ['أدخل رابط موقع عام', 'اطلب ترويسات الاستجابة المتاحة', 'افحص القيم وانتبه إلى قيود CORS'] },
    example: { en: 'Review public security headers during a basic website configuration check.', ar: 'راجع ترويسات الأمان العامة أثناء فحص أساسي لإعدادات موقع.' },
  },
  'video-compressor': {
    eyebrow: 'VIDEO WORKSPACE',
    positioning: { en: 'Reduce supported video file sizes with browser-based WebM export.', ar: 'قلّل حجم ملفات الفيديو المدعومة مع تصدير WebM داخل المتصفح.' },
    benefits: { en: ['Adjust available quality and resolution settings', 'Review the output before saving', 'Understand that compression time depends on device and source video'], ar: ['اضبط الجودة والدقة المتاحتين', 'راجع النتيجة قبل الحفظ', 'اعلم أن مدة الضغط تعتمد على الجهاز والفيديو الأصلي'] },
    steps: { en: ['Load a supported video file', 'Choose the available quality and resolution settings', 'Process the clip and save the WebM output'], ar: ['حمّل ملف فيديو مدعوماً', 'اختر إعدادات الجودة والدقة المتاحة', 'عالج المقطع واحفظ نتيجة WebM'] },
    example: { en: 'Create a smaller WebM copy for a website or a browser-friendly upload.', ar: 'أنشئ نسخة WebM أصغر لموقع أو لرفع متوافق مع المتصفح.' },
  },
  'video-to-audio': {
    eyebrow: 'VIDEO WORKSPACE',
    positioning: { en: 'Extract the audio track from a supported video file.', ar: 'استخرج المسار الصوتي من ملف فيديو مدعوم.' },
    benefits: { en: ['Extract audio from supported video containers', 'Choose an available audio export format', 'Save the extracted track locally'], ar: ['استخرج الصوت من حاويات الفيديو المدعومة', 'اختر صيغة تصدير صوتية متاحة', 'احفظ المسار الصوتي على جهازك'] },
    steps: { en: ['Add a supported video file', 'Select an available audio format and quality', 'Extract the track and download the audio file'], ar: ['أضف ملف فيديو مدعوماً', 'اختر صيغة الصوت والجودة المتاحتين', 'استخرج المسار ثم نزّل الملف الصوتي'] },
    example: { en: 'Save the speech or soundtrack from a video you own or are permitted to process.', ar: 'احفظ خطاباً أو مساراً صوتياً من فيديو تملكه أو تملك إذن معالجته.' },
  },
  'video-metadata-viewer': {
    eyebrow: 'VIDEO INSPECTOR',
    positioning: { en: 'Inspect video properties that your browser can read from the file.', ar: 'افحص خصائص الفيديو التي يستطيع متصفحك قراءتها من الملف.' },
    benefits: { en: ['Review duration and dimensions', 'Inspect container and estimated bitrate where available', 'See which technical fields the browser does not expose'], ar: ['راجع المدة والأبعاد', 'افحص الحاوية ومعدل البت التقديري عند توفرهما', 'اعرف الحقول التقنية التي لا يكشفها المتصفح'] },
    steps: { en: ['Select a supported video file', 'Wait for browser metadata inspection', 'Review the available technical properties'], ar: ['اختر ملف فيديو مدعوماً', 'انتظر فحص بيانات الملف داخل المتصفح', 'راجع الخصائص التقنية المتاحة'] },
    example: { en: 'Check a clip’s duration, dimensions, or estimated bitrate before editing.', ar: 'تحقق من مدة مقطع أو أبعاده أو معدل البت التقديري قبل تحريره.' },
  },
  'video-downloader': {
    eyebrow: 'VIDEO WORKSPACE PREVIEW',
    positioning: { en: 'A preview of a direct-media workflow for files you own or are authorized to download.', ar: 'معاينة لمسار تنزيل ملفات فيديو مباشرة تملكها أو تملك إذناً بتنزيلها.' },
    benefits: { en: ['Designed around direct media URLs only', 'Does not claim to bypass platform restrictions', 'Download processing is not enabled in this preview'], ar: ['مصممة للروابط المباشرة للوسائط فقط', 'لا تدّعي تجاوز قيود المنصات', 'وظيفة التنزيل غير مفعّلة في هذه المعاينة'] },
    steps: { en: ['Review the preview and its permitted-use scope', 'Use a direct media URL only when you have permission', 'Note that this preview does not currently fetch or download files'], ar: ['راجع المعاينة ونطاق الاستخدام المسموح', 'استخدم رابط وسائط مباشر فقط عند امتلاك الإذن', 'لاحظ أن هذه المعاينة لا تجلب الملفات أو تنزّلها حالياً'] },
    example: { en: 'The future workflow is limited to direct MP4/WebM media that the user is authorized to save.', ar: 'سيقتصر مسار العمل المستقبلي على ملفات MP4/WebM المباشرة التي يحق للمستخدم حفظها.' },
  },
  'video-trimmer': {
    eyebrow: 'VIDEO WORKSPACE',
    positioning: { en: 'Select a precise segment of a video and export the trimmed clip.', ar: 'حدّد جزءاً دقيقاً من الفيديو وصدّر المقطع بعد قصّه.' },
    benefits: { en: ['Set start and end points on the timeline', 'Preview the selected segment', 'Export the processed clip as WebM'], ar: ['حدّد نقطتي البداية والنهاية على الشريط الزمني', 'عاين الجزء المحدد', 'صدّر المقطع المعالج بصيغة WebM'] },
    steps: { en: ['Load a supported video', 'Set the exact start and end times', 'Process and download the trimmed clip'], ar: ['حمّل فيديو مدعوماً', 'حدّد وقت البداية والنهاية بدقة', 'عالج المقطع ثم نزّله'] },
    example: { en: 'Cut a short excerpt from a longer recording you own.', ar: 'اقتطع جزءاً قصيراً من تسجيل طويل تملكه.' },
  },
  'thumbnail-extractor': {
    eyebrow: 'VIDEO WORKSPACE',
    positioning: { en: 'Capture still frames from a video and export them as images.', ar: 'التقط إطارات ثابتة من الفيديو وصدّرها كصور.' },
    benefits: { en: ['Move through the video to find a frame', 'Choose a precise capture moment', 'Export the selected still as PNG or JPG'], ar: ['تنقّل داخل الفيديو للعثور على إطار مناسب', 'اختر لحظة الالتقاط بدقة', 'صدّر اللقطة كصورة PNG أو JPG'] },
    steps: { en: ['Load a supported video file', 'Scrub to the frame you want to capture', 'Export the frame as an image'], ar: ['حمّل ملف فيديو مدعوماً', 'تنقّل إلى الإطار الذي تريد التقاطه', 'صدّر الإطار كصورة'] },
    example: { en: 'Create a still preview or a thumbnail from a specific moment in your own video.', ar: 'أنشئ معاينة ثابتة أو صورة مصغرة من لحظة محددة في فيديو تملكه.' },
  },
} satisfies Record<string, ToolExperience>;

export const TOOL_EXPERIENCE_REGISTRY: Record<string, ToolExperience> = experience;

export function getToolExperience(slug: string): ToolExperience | undefined {
  return TOOL_EXPERIENCE_REGISTRY[slug];
}

export function localizedExperience<T extends { en: string; ar: string }>(
  value: T,
  locale: SupportedLocale,
): string {
  return locale === 'ar' ? value.ar : value.en;
}
