import { SupportedLocale } from '../i18n';
import { CategoryId } from './tool-types';
import { getToolBySlug } from './tools.registry';

export interface WorkflowCopy {
  title: string;
  description: string;
  introduction: string;
  outcome: string;
  note: string;
}

export interface WorkflowDefinition {
  slug: string;
  category: CategoryId;
  toolSlugs: string[];
  localized: Record<SupportedLocale, WorkflowCopy>;
}

export const WORKFLOWS_LIST: WorkflowDefinition[] = [
  {
    slug: 'prepare-images-for-web',
    category: 'image',
    toolSlugs: ['image-resizer', 'image-converter', 'image-compressor'],
    localized: {
      en: {
        title: 'Prepare images for the web',
        description: 'Resize, convert, and compress images in a practical workflow for faster, lighter web pages.',
        introduction: 'Image delivery is a sequence, not a single setting. Start with the dimensions your layout needs, choose a format that suits the image, then reduce file size while checking the visual result.',
        outcome: 'A correctly sized image in a suitable format, with a smaller file to review before you publish it.',
        note: 'Keep the original file. Re-encoding and lossy compression can change fine detail, colour, or transparency; compare the output at its intended display size.',
      },
      ar: {
        title: 'جهّز الصور للنشر على الويب',
        description: 'غيّر أبعاد الصور وحوّل صيغها واضغطها ضمن خطوات عملية لتجهيز صفحات ويب أخف.',
        introduction: 'تجهيز الصور ليس إعداداً واحداً. ابدأ بالأبعاد التي يحتاجها تصميمك، ثم اختر الصيغة المناسبة لنوع الصورة، وبعدها قلّل حجم الملف مع فحص النتيجة بصرياً.',
        outcome: 'صورة بأبعاد مناسبة وصيغة ملائمة وحجم أقل، جاهزة للمراجعة قبل نشرها.',
        note: 'احتفظ بالملف الأصلي. قد تؤثر إعادة الترميز والضغط الفاقد في التفاصيل الدقيقة أو الألوان أو الشفافية؛ قارن النتيجة بالحجم الذي ستُعرض به.',
      },
      fr: {
        title: 'Préparer des images pour le web',
        description: 'Redimensionnez, convertissez et compressez vos images pour alléger les pages web.',
        introduction: 'La préparation d’une image comporte plusieurs étapes. Commencez par définir les dimensions nécessaires, choisissez un format adapté, puis réduisez le poids du fichier en vérifiant le rendu.',
        outcome: 'Une image aux bonnes dimensions, dans un format adapté et avec un poids réduit à vérifier avant publication.',
        note: 'Conservez le fichier original. Le réencodage et la compression avec perte peuvent modifier les détails, les couleurs ou la transparence.',
      },
      es: {
        title: 'Preparar imágenes para la web',
        description: 'Cambia el tamaño, convierte y comprime imágenes para crear páginas web más ligeras.',
        introduction: 'Preparar una imagen requiere varios pasos. Define primero las dimensiones, elige un formato adecuado y después reduce el tamaño del archivo comprobando el resultado visual.',
        outcome: 'Una imagen con dimensiones y formato adecuados y un archivo más ligero que puedes revisar antes de publicarlo.',
        note: 'Conserva el archivo original. La recompresión y la compresión con pérdida pueden cambiar detalles, colores o transparencia.',
      },
      pt: {
        title: 'Preparar imagens para a web',
        description: 'Redimensione, converta e comprima imagens para deixar páginas web mais leves.',
        introduction: 'Preparar uma imagem envolve várias etapas. Primeiro defina as dimensões necessárias, escolha um formato adequado e depois reduza o tamanho do arquivo conferindo o resultado visual.',
        outcome: 'Uma imagem com dimensões e formato adequados e um arquivo menor para revisar antes da publicação.',
        note: 'Guarde o arquivo original. A recompactação e a compressão com perdas podem alterar detalhes, cores ou transparência.',
      },
      hi: {
        title: 'वेब के लिए इमेज तैयार करें',
        description: 'हल्के वेब पेजों के लिए इमेज का आकार बदलें, फ़ॉर्मैट बदलें और फ़ाइल को संपीड़ित करें।',
        introduction: 'इमेज तैयार करने के कई चरण होते हैं। पहले आवश्यक पिक्सेल आकार चुनें, फिर उपयुक्त फ़ॉर्मैट चुनें और अंत में दृश्य परिणाम जाँचते हुए फ़ाइल का आकार कम करें।',
        outcome: 'उचित आयाम और फ़ॉर्मैट वाली छोटी इमेज, जिसे प्रकाशित करने से पहले जाँचा जा सकता है।',
        note: 'मूल फ़ाइल सुरक्षित रखें। दोबारा एन्कोडिंग और lossy compression से बारीक विवरण, रंग या पारदर्शिता बदल सकती है।',
      },
      zh: {
        title: '为网页准备图片',
        description: '按顺序调整图片尺寸、转换格式并压缩文件，让网页资源更轻量。',
        introduction: '图片优化通常需要多个步骤。先确定页面所需尺寸，再选择适合图片内容的格式，最后在检查视觉效果的同时减小文件体积。',
        outcome: '获得尺寸合适、格式恰当且文件更小的图片，并在发布前检查结果。',
        note: '请保留原始文件。重新编码和有损压缩可能改变细节、颜色或透明度。',
      },
      bn: {
        title: 'ওয়েবের জন্য ছবি প্রস্তুত করুন',
        description: 'ওয়েব পেজ হালকা রাখতে ছবির আকার বদলান, ফরম্যাট পরিবর্তন করুন এবং কমপ্রেস করুন।',
        introduction: 'ছবি প্রস্তুত করার জন্য কয়েকটি ধাপ দরকার। প্রথমে প্রয়োজনীয় পিক্সেল মাপ ঠিক করুন, তারপর উপযুক্ত ফরম্যাট বেছে নিন এবং ফলাফল দেখে ফাইলের আকার কমান।',
        outcome: 'সঠিক মাপ ও উপযুক্ত ফরম্যাটে ছোট আকারের ছবি, যা প্রকাশের আগে যাচাই করা যায়।',
        note: 'মূল ফাইলটি রেখে দিন। পুনরায় এনকোডিং ও lossy compression সূক্ষ্ম বিবরণ, রং বা স্বচ্ছতা বদলে দিতে পারে।',
      },
    },
  },
  {
    slug: 'assemble-a-pdf-pack',
    category: 'pdf',
    toolSlugs: ['jpg-to-pdf', 'rotate-pdf', 'merge-pdf', 'pdf-page-counter'],
    localized: {
      en: {
        title: 'Assemble and check a PDF pack',
        description: 'Turn images into PDF pages, correct page orientation, combine documents, and check the final page count.',
        introduction: 'Build a document pack in a deliberate order: create PDF pages from images when needed, correct the orientation of existing pages, combine the files, and verify the result.',
        outcome: 'One combined PDF with checked page orientation and a page count you can confirm.',
        note: 'Keep source files until you have opened and checked the final PDF. Document restrictions and unusual source files may limit what a browser-based tool can process.',
      },
      ar: {
        title: 'أنشئ حزمة PDF وراجعها',
        description: 'حوّل الصور إلى صفحات PDF، وصحّح اتجاه الصفحات، واجمع المستندات ثم تحقق من عدد الصفحات.',
        introduction: 'أنشئ ملفاً منظماً بخطوات واضحة: حوّل الصور إلى صفحات PDF عند الحاجة، وصحّح اتجاه الصفحات، ثم ادمج الملفات وتحقق من النتيجة النهائية.',
        outcome: 'ملف PDF واحد مدمج مع اتجاه صفحات مضبوط وعدد صفحات يمكنك التحقق منه.',
        note: 'احتفظ بالملفات الأصلية حتى تفتح ملف PDF النهائي وتراجعه. قد تحد قيود المستندات أو الملفات غير المعتادة مما تستطيع الأداة معالجته.',
      },
      fr: {
        title: 'Assembler et vérifier un dossier PDF',
        description: 'Convertissez des images en pages PDF, corrigez leur orientation, fusionnez les documents et vérifiez le nombre de pages.',
        introduction: 'Construisez votre dossier dans un ordre précis : créez des pages PDF à partir d’images si nécessaire, corrigez l’orientation, fusionnez les fichiers puis vérifiez le résultat.',
        outcome: 'Un seul PDF fusionné, avec une orientation vérifiée et un nombre de pages contrôlé.',
        note: 'Conservez les fichiers sources jusqu’à ce que vous ayez ouvert et vérifié le PDF final. Certaines restrictions de documents peuvent limiter le traitement.',
      },
      es: {
        title: 'Crear y revisar un paquete PDF',
        description: 'Convierte imágenes en páginas PDF, corrige la orientación, combina documentos y comprueba el número de páginas.',
        introduction: 'Organiza el paquete en un orden claro: crea páginas PDF a partir de imágenes si hace falta, corrige la orientación, combina los archivos y revisa el resultado.',
        outcome: 'Un único PDF combinado, con la orientación revisada y el número de páginas comprobado.',
        note: 'Conserva los archivos originales hasta abrir y revisar el PDF final. Algunas restricciones del documento pueden limitar el procesamiento.',
      },
      pt: {
        title: 'Montar e conferir um conjunto de PDFs',
        description: 'Converta imagens em páginas PDF, corrija a orientação, combine documentos e confira a quantidade de páginas.',
        introduction: 'Monte o conjunto em uma ordem clara: crie páginas PDF a partir de imagens quando necessário, corrija a orientação, una os arquivos e confira o resultado.',
        outcome: 'Um único PDF combinado, com orientação revisada e número de páginas conferido.',
        note: 'Mantenha os arquivos de origem até abrir e conferir o PDF final. Restrições do documento podem limitar o processamento.',
      },
      hi: {
        title: 'PDF दस्तावेज़ों का पैक बनाएँ और जाँचें',
        description: 'इमेज को PDF पेज में बदलें, पेज का रुख ठीक करें, दस्तावेज़ जोड़ें और पेज संख्या जाँचें।',
        introduction: 'दस्तावेज़ों को सही क्रम में तैयार करें: ज़रूरत होने पर इमेज से PDF पेज बनाएँ, पेज का रुख ठीक करें, फ़ाइलें जोड़ें और अंतिम परिणाम जाँचें।',
        outcome: 'एक संयुक्त PDF, जिसकी पेज दिशा और कुल पेज संख्या जाँची जा सकती है।',
        note: 'अंतिम PDF खोलकर जाँचने तक मूल फ़ाइलें सुरक्षित रखें। कुछ दस्तावेज़ प्रतिबंध या असामान्य फ़ाइलें प्रोसेसिंग को सीमित कर सकती हैं।',
      },
      zh: {
        title: '整理并检查 PDF 文件包',
        description: '将图片转换为 PDF 页面，调整页面方向，合并文档并核对最终页数。',
        introduction: '按清晰顺序整理文档：需要时先把图片转换为 PDF 页面，调整现有页面方向，再合并文件并检查最终结果。',
        outcome: '得到一个合并后的 PDF，并能检查页面方向和最终页数。',
        note: '打开并检查最终 PDF 之前，请保留源文件。文档限制或特殊文件可能影响浏览器工具的处理能力。',
      },
      bn: {
        title: 'PDF প্যাক তৈরি ও যাচাই করুন',
        description: 'ছবি থেকে PDF পৃষ্ঠা তৈরি করুন, পৃষ্ঠার দিক ঠিক করুন, নথি একত্র করুন এবং পৃষ্ঠা সংখ্যা যাচাই করুন।',
        introduction: 'একটি পরিষ্কার ক্রমে নথি সাজান: প্রয়োজনে ছবি থেকে PDF পৃষ্ঠা তৈরি করুন, পৃষ্ঠার দিক ঠিক করুন, ফাইলগুলো একত্র করুন এবং ফলাফল পরীক্ষা করুন।',
        outcome: 'একটি একত্রিত PDF, যার পৃষ্ঠার দিক ও মোট পৃষ্ঠা সংখ্যা যাচাই করা যায়।',
        note: 'চূড়ান্ত PDF খুলে পরীক্ষা না করা পর্যন্ত মূল ফাইলগুলো রেখে দিন। নথির সীমাবদ্ধতা বা অস্বাভাবিক ফাইল প্রক্রিয়াকরণে বাধা দিতে পারে।',
      },
    },
  },
  {
    slug: 'validate-and-optimize-json',
    category: 'developer',
    toolSlugs: ['json-validator', 'json-formatter', 'json-minifier'],
    localized: {
      en: {
        title: 'Validate and optimize JSON',
        description: 'Check JSON syntax, format the structure for debugging, and create a compact version when needed.',
        introduction: 'A reliable JSON workflow starts with validation. Once the input parses successfully, format it to inspect nested data, then create a minified copy only when a compact payload is useful.',
        outcome: 'A syntax-checked JSON document that is easier to inspect, plus an optional compact copy.',
        note: 'Minification removes whitespace, not data by design. Keep a readable source copy and verify the exact payload expected by the receiving application.',
      },
      ar: {
        title: 'تحقق من JSON وحسّن بنيته',
        description: 'افحص صحة صياغة JSON، ونسّق بنيته لتسهيل التصحيح، وأنشئ نسخة مضغوطة عند الحاجة.',
        introduction: 'يبدأ العمل الموثوق مع JSON بالتحقق من الصياغة. بعد نجاح التحليل، نسّق البيانات لقراءة العناصر المتداخلة، ثم أنشئ نسخة مختصرة عندما تحتاج إلى حمولة أصغر.',
        outcome: 'مستند JSON تم التحقق من صياغته وأصبح أسهل للفحص، مع إمكانية إنشاء نسخة مختصرة.',
        note: 'يزيل التصغير المسافات البيضاء ولا يُفترض أن يحذف البيانات. احتفظ بنسخة مقروءة وتحقق من الحمولة التي يتوقعها التطبيق المستقبِل.',
      },
      fr: {
        title: 'Valider et optimiser du JSON',
        description: 'Vérifiez la syntaxe JSON, formatez la structure pour le débogage et créez une version compacte si nécessaire.',
        introduction: 'Un flux JSON fiable commence par la validation. Après une analyse réussie, formatez les données imbriquées pour les examiner, puis créez une copie minifiée si un payload compact est utile.',
        outcome: 'Un document JSON dont la syntaxe est vérifiée et la structure lisible, avec une copie compacte facultative.',
        note: 'La minification supprime les espaces, pas les données par conception. Gardez une copie lisible et vérifiez le payload attendu par l’application destinataire.',
      },
      es: {
        title: 'Validar y optimizar JSON',
        description: 'Comprueba la sintaxis JSON, formatea la estructura para depurarla y crea una versión compacta cuando sea necesario.',
        introduction: 'Un flujo fiable de JSON empieza por validar. Cuando la entrada se analiza correctamente, formatea los datos anidados para revisarlos y crea una copia minificada solo cuando necesites un payload compacto.',
        outcome: 'Un documento JSON con sintaxis comprobada y estructura legible, además de una copia compacta opcional.',
        note: 'La minificación elimina espacios en blanco, no datos por diseño. Conserva una copia legible y comprueba el payload que espera la aplicación receptora.',
      },
      pt: {
        title: 'Validar e otimizar JSON',
        description: 'Verifique a sintaxe JSON, formate a estrutura para depuração e crie uma versão compacta quando necessário.',
        introduction: 'Um fluxo confiável de JSON começa pela validação. Quando a entrada for analisada corretamente, formate os dados aninhados para inspeção e crie uma cópia minificada apenas quando precisar de um payload compacto.',
        outcome: 'Um documento JSON com sintaxe verificada e estrutura legível, além de uma cópia compacta opcional.',
        note: 'A minificação remove espaços em branco, não dados por definição. Guarde uma cópia legível e confira o payload esperado pelo aplicativo de destino.',
      },
      hi: {
        title: 'JSON को वैलिडेट और ऑप्टिमाइज़ करें',
        description: 'JSON सिंटैक्स जाँचें, डिबगिंग के लिए संरचना फ़ॉर्मैट करें और ज़रूरत पड़ने पर छोटा संस्करण बनाएँ।',
        introduction: 'विश्वसनीय JSON कार्यप्रवाह की शुरुआत वैलिडेशन से होती है। इनपुट सही तरह पार्स होने के बाद nested डेटा देखने के लिए उसे फ़ॉर्मैट करें और compact payload की आवश्यकता होने पर ही minified कॉपी बनाएँ।',
        outcome: 'सिंटैक्स-जाँचा हुआ, पढ़ने योग्य JSON दस्तावेज़ और वैकल्पिक compact कॉपी।',
        note: 'Minification whitespace हटाती है, डेटा नहीं। पढ़ने योग्य मूल प्रति रखें और प्राप्त करने वाले ऐप की अपेक्षित payload जाँचें।',
      },
      zh: {
        title: '验证并优化 JSON',
        description: '检查 JSON 语法，格式化结构以便调试，并在需要时生成紧凑版本。',
        introduction: '可靠的 JSON 工作流程应从语法验证开始。确认输入可以解析后，再格式化嵌套数据以便检查；只有在确实需要紧凑载荷时才生成压缩副本。',
        outcome: '得到语法已验证、结构清晰的 JSON 文档，并可选择生成紧凑副本。',
        note: '压缩格式会移除空白字符，设计上不应删除数据。请保留可读源文件，并核对接收应用实际需要的载荷。',
      },
      bn: {
        title: 'JSON যাচাই ও অপ্টিমাইজ করুন',
        description: 'JSON সিনট্যাক্স পরীক্ষা করুন, ডিবাগের জন্য গঠন ফরম্যাট করুন এবং প্রয়োজনে ছোট সংস্করণ তৈরি করুন।',
        introduction: 'নির্ভরযোগ্য JSON কাজ শুরু হয় যাচাই দিয়ে। ইনপুট সঠিকভাবে পার্স হলে nested ডেটা দেখার জন্য ফরম্যাট করুন, তারপর compact payload দরকার হলেই minified কপি তৈরি করুন।',
        outcome: 'সিনট্যাক্স-যাচাইকৃত ও সহজে পড়া যায় এমন JSON নথি, সঙ্গে ঐচ্ছিক compact কপি।',
        note: 'Minification ফাঁকা স্থান সরায়, ডেটা নয়। পড়ার উপযোগী মূল কপি রাখুন এবং গ্রহণকারী অ্যাপের প্রত্যাশিত payload পরীক্ষা করুন।',
      },
    },
  },
  {
    slug: 'clean-and-compare-text',
    category: 'text',
    toolSlugs: ['duplicate-lines-remover', 'sort-text-lines', 'text-diff-checker'],
    localized: {
      en: {
        title: 'Clean and compare text lists',
        description: 'Remove repeated lines, sort a text list into a consistent order, and compare revisions for changes.',
        introduction: 'When a pasted list contains repeated or inconsistently ordered entries, clean it before reviewing changes. Remove duplicates, choose a stable line order, then compare the cleaned version with another draft.',
        outcome: 'A cleaner, consistently ordered list and a clear comparison against another text version.',
        note: 'Sorting changes the original sequence. Keep the source text when line order carries meaning, and use the diff step to review what changed.',
      },
      ar: {
        title: 'نظّف قوائم النصوص وقارنها',
        description: 'احذف الأسطر المكررة، ورتّب القائمة بترتيب موحّد، ثم قارن النسخ لاكتشاف التغييرات.',
        introduction: 'عندما تحتوي القائمة المنسوخة على عناصر متكررة أو ترتيب غير منتظم، نظّفها قبل مراجعة التغييرات. احذف التكرار، واختر ترتيباً ثابتاً للأسطر، ثم قارن النسخة النظيفة بمسودة أخرى.',
        outcome: 'قائمة أنظف ومرتبة بشكل ثابت، مع مقارنة واضحة بينها وبين نسخة نصية أخرى.',
        note: 'قد يؤدي الترتيب إلى تغيير تسلسل النص الأصلي. احتفظ بالمصدر عندما يكون ترتيب الأسطر مهماً، واستخدم المقارنة لمراجعة ما تغيّر.',
      },
      fr: {
        title: 'Nettoyer et comparer des listes de texte',
        description: 'Supprimez les lignes répétées, triez une liste dans un ordre cohérent et comparez les versions.',
        introduction: 'Lorsqu’une liste collée contient des répétitions ou un ordre irrégulier, nettoyez-la avant d’examiner les modifications. Supprimez les doublons, choisissez un ordre stable, puis comparez le résultat à une autre version.',
        outcome: 'Une liste plus propre et ordonnée, avec une comparaison claire par rapport à une autre version.',
        note: 'Le tri modifie l’ordre d’origine. Conservez le texte source si l’ordre des lignes a un sens et utilisez la comparaison pour vérifier les changements.',
      },
      es: {
        title: 'Limpiar y comparar listas de texto',
        description: 'Elimina líneas duplicadas, ordena una lista de forma coherente y compara versiones para detectar cambios.',
        introduction: 'Si una lista pegada contiene entradas repetidas o un orden irregular, límpiala antes de revisar los cambios. Elimina duplicados, establece un orden estable y compara el resultado con otro borrador.',
        outcome: 'Una lista más limpia y ordenada, junto con una comparación clara frente a otra versión del texto.',
        note: 'Ordenar cambia la secuencia original. Conserva el texto fuente cuando el orden de las líneas importe y usa la comparación para revisar los cambios.',
      },
      pt: {
        title: 'Limpar e comparar listas de texto',
        description: 'Remova linhas repetidas, ordene uma lista de forma consistente e compare versões para identificar alterações.',
        introduction: 'Quando uma lista colada contém itens repetidos ou uma ordem irregular, limpe-a antes de revisar as mudanças. Remova duplicatas, escolha uma ordem estável e compare o resultado com outra versão.',
        outcome: 'Uma lista mais limpa e organizada, com uma comparação clara em relação a outra versão do texto.',
        note: 'A ordenação altera a sequência original. Guarde o texto de origem quando a ordem das linhas for importante e use a comparação para revisar as mudanças.',
      },
      hi: {
        title: 'टेक्स्ट सूची साफ़ करें और तुलना करें',
        description: 'दोहराई गई पंक्तियाँ हटाएँ, सूची को एक समान क्रम में रखें और बदलाव देखने के लिए संस्करणों की तुलना करें।',
        introduction: 'यदि चिपकाई गई सूची में दोहराए गए आइटम या असंगत क्रम हैं, तो बदलाव देखने से पहले उसे साफ़ करें। डुप्लिकेट हटाएँ, स्थिर क्रम चुनें और साफ़ सूची की दूसरे मसौदे से तुलना करें।',
        outcome: 'अधिक साफ़ और व्यवस्थित सूची तथा दूसरे टेक्स्ट संस्करण के साथ स्पष्ट तुलना।',
        note: 'सॉर्ट करने से मूल क्रम बदलता है। जहाँ पंक्तियों का क्रम अर्थपूर्ण हो वहाँ मूल पाठ रखें और बदलाव जाँचने के लिए diff का उपयोग करें।',
      },
      zh: {
        title: '清理并比较文本列表',
        description: '删除重复行、按一致顺序整理文本列表，并比较不同版本以查看变化。',
        introduction: '粘贴的列表如果含有重复条目或顺序不一致，可以先清理再检查修改。删除重复行，选择稳定的排序方式，然后将清理后的文本与另一份草稿比较。',
        outcome: '得到更整洁、顺序一致的列表，并清楚查看它与另一版本之间的差异。',
        note: '排序会改变原始顺序。如果行顺序本身有意义，请保留源文本，并通过差异比较检查改动。',
      },
      bn: {
        title: 'টেক্সট তালিকা পরিষ্কার ও তুলনা করুন',
        description: 'ডুপ্লিকেট লাইন সরান, তালিকাকে একই ক্রমে সাজান এবং পরিবর্তন দেখতে সংস্করণগুলোর তুলনা করুন।',
        introduction: 'পেস্ট করা তালিকায় পুনরাবৃত্তি বা অসংগত ক্রম থাকলে পরিবর্তন দেখার আগে পরিষ্কার করুন। ডুপ্লিকেট সরান, স্থির ক্রম বেছে নিন এবং পরিষ্কার তালিকাটি অন্য খসড়ার সঙ্গে তুলনা করুন।',
        outcome: 'আরও পরিষ্কার ও সাজানো তালিকা এবং অন্য টেক্সট সংস্করণের সঙ্গে স্পষ্ট তুলনা।',
        note: 'সাজালে মূল ক্রম বদলে যায়। লাইনের ক্রম গুরুত্বপূর্ণ হলে মূল লেখা রেখে দিন এবং কী বদলেছে দেখতে diff ব্যবহার করুন।',
      },
    },
  },
  {
    slug: 'inspect-a-domain',
    category: 'website-domain',
    toolSlugs: ['rdap-lookup', 'dns-lookup', 'website-status-checker', 'http-headers-checker'],
    localized: {
      en: {
        title: 'Inspect a domain and website',
        description: 'Review public registration data, DNS records, website response status, and HTTP headers in one investigation flow.',
        introduction: 'A domain check is more useful when several signals are reviewed together. Start with public registration information, inspect DNS records, then check the website response and the headers it returns.',
        outcome: 'A practical snapshot of registration, DNS, reachability, and response headers for the hostname you entered.',
        note: 'These checks query public RDAP/DNS services or the target website. Results can be affected by caching, network rules, redirects, and service availability; they are not a security certification.',
      },
      ar: {
        title: 'افحص النطاق والموقع',
        description: 'راجع بيانات التسجيل العامة وسجلات DNS وحالة استجابة الموقع وترويسات HTTP ضمن مسار فحص واحد.',
        introduction: 'يصبح فحص النطاق أكثر فائدة عند مراجعة عدة مؤشرات معاً. ابدأ ببيانات التسجيل العامة، ثم افحص سجلات DNS، وبعدها تحقق من استجابة الموقع والترويسات التي يعيدها.',
        outcome: 'صورة عملية عن التسجيل وDNS وإمكانية الوصول وترويسات الاستجابة لاسم النطاق الذي أدخلته.',
        note: 'تستعلم هذه الفحوصات من خدمات RDAP وDNS العامة أو من الموقع المستهدف. قد تتأثر النتائج بالتخزين المؤقت وقواعد الشبكة والتحويلات وتوفر الخدمات، ولا تُعد شهادة أمنية.',
      },
      fr: {
        title: 'Inspecter un domaine et un site web',
        description: 'Consultez les données publiques d’enregistrement, les enregistrements DNS, le statut HTTP et les en-têtes.',
        introduction: 'Un contrôle de domaine est plus utile lorsque plusieurs indicateurs sont examinés ensemble. Commencez par les données d’enregistrement publiques, inspectez le DNS, puis vérifiez la réponse du site et ses en-têtes.',
        outcome: 'Un aperçu pratique de l’enregistrement, du DNS, de l’accessibilité et des en-têtes du nom d’hôte saisi.',
        note: 'Ces vérifications interrogent des services RDAP/DNS publics ou le site cible. Le cache, les règles réseau, les redirections et la disponibilité peuvent influencer les résultats.',
      },
      es: {
        title: 'Inspeccionar un dominio y un sitio web',
        description: 'Consulta datos públicos de registro, registros DNS, estado de respuesta del sitio y cabeceras HTTP.',
        introduction: 'La revisión de un dominio es más útil cuando se analizan varias señales juntas. Empieza por los datos públicos de registro, revisa DNS y después comprueba la respuesta del sitio y sus cabeceras.',
        outcome: 'Una vista práctica del registro, DNS, accesibilidad y cabeceras de respuesta del nombre de host indicado.',
        note: 'Estas comprobaciones consultan servicios públicos RDAP/DNS o el sitio de destino. La caché, las reglas de red, las redirecciones y la disponibilidad pueden afectar los resultados.',
      },
      pt: {
        title: 'Inspecionar um domínio e um site',
        description: 'Consulte dados públicos de registro, registros DNS, status de resposta do site e cabeçalhos HTTP.',
        introduction: 'A verificação de um domínio é mais útil quando vários sinais são analisados em conjunto. Comece pelos dados públicos de registro, consulte o DNS e depois confira a resposta do site e seus cabeçalhos.',
        outcome: 'Uma visão prática do registro, DNS, acessibilidade e cabeçalhos de resposta do host informado.',
        note: 'Essas verificações consultam serviços públicos RDAP/DNS ou o site de destino. Cache, regras de rede, redirecionamentos e disponibilidade podem afetar os resultados.',
      },
      hi: {
        title: 'डोमेन और वेबसाइट का निरीक्षण करें',
        description: 'सार्वजनिक रजिस्ट्रेशन डेटा, DNS रिकॉर्ड, वेबसाइट प्रतिक्रिया स्थिति और HTTP हेडर जाँचें।',
        introduction: 'डोमेन जाँच तब अधिक उपयोगी होती है जब कई संकेत एक साथ देखे जाएँ। सार्वजनिक रजिस्ट्रेशन जानकारी से शुरू करें, DNS रिकॉर्ड देखें और फिर वेबसाइट की प्रतिक्रिया तथा उसके हेडर जाँचें।',
        outcome: 'दर्ज किए गए होस्टनाम के रजिस्ट्रेशन, DNS, पहुँच और प्रतिक्रिया हेडर का व्यावहारिक सार।',
        note: 'ये जाँच सार्वजनिक RDAP/DNS सेवाओं या लक्षित वेबसाइट से जानकारी लेती हैं। कैश, नेटवर्क नियम, रीडायरेक्ट और सेवा उपलब्धता परिणामों को प्रभावित कर सकते हैं।',
      },
      zh: {
        title: '检查域名与网站',
        description: '依次查看公开注册信息、DNS 记录、网站响应状态和 HTTP 标头。',
        introduction: '同时查看多个信号，域名检查才更有参考价值。先查看公开注册信息，再检查 DNS 记录，最后查看网站响应和返回的 HTTP 标头。',
        outcome: '获得所输入主机名的注册信息、DNS、可访问性和响应标头的实用概览。',
        note: '这些检查会查询公共 RDAP/DNS 服务或目标网站。缓存、网络规则、重定向和服务可用性都可能影响结果；这并不构成安全认证。',
      },
      bn: {
        title: 'ডোমেইন ও ওয়েবসাইট পরীক্ষা করুন',
        description: 'পাবলিক রেজিস্ট্রেশন তথ্য, DNS রেকর্ড, ওয়েবসাইটের রেসপন্স স্ট্যাটাস এবং HTTP হেডার দেখুন।',
        introduction: 'একাধিক সংকেত একসঙ্গে দেখলে ডোমেইন পরীক্ষা বেশি কার্যকর হয়। পাবলিক রেজিস্ট্রেশন তথ্য দিয়ে শুরু করুন, DNS রেকর্ড দেখুন, তারপর ওয়েবসাইটের রেসপন্স ও হেডার পরীক্ষা করুন।',
        outcome: 'দেওয়া হোস্টনামের রেজিস্ট্রেশন, DNS, প্রবেশযোগ্যতা ও রেসপন্স হেডারের একটি ব্যবহারিক চিত্র।',
        note: 'এই পরীক্ষাগুলো পাবলিক RDAP/DNS সার্ভিস বা লক্ষ্য ওয়েবসাইটে অনুরোধ পাঠায়। ক্যাশ, নেটওয়ার্ক নিয়ম, রিডাইরেক্ট এবং সার্ভিসের প্রাপ্যতা ফলাফলে প্রভাব ফেলতে পারে।',
      },
    },
  },
  {
    slug: 'prepare-video-clips',
    category: 'video',
    toolSlugs: ['video-trimmer', 'video-compressor', 'thumbnail-extractor'],
    localized: {
      en: {
        title: 'Prepare video clips and thumbnails',
        description: 'Trim a clip, reduce its file size, and extract a frame for a thumbnail or preview image.',
        introduction: 'Prepare a short video asset in a useful order: remove the section you do not need, compress the resulting clip if a smaller file is required, then capture a frame for its thumbnail.',
        outcome: 'A trimmed video, an optional smaller export, and a still frame that can be used as a preview.',
        note: 'Video processing depends on browser codec support, available memory, and device performance. Keep the source clip and test the exported file before sharing it.',
      },
      ar: {
        title: 'جهّز مقاطع الفيديو والصور المصغّرة',
        description: 'اقتطع المقطع المطلوب، وقلّل حجم الفيديو، واستخرج إطاراً لاستخدامه كصورة مصغّرة أو معاينة.',
        introduction: 'جهّز مادة فيديو قصيرة بترتيب عملي: احذف الجزء غير المطلوب، واضغط المقطع الناتج عند الحاجة إلى ملف أصغر، ثم استخرج إطاراً للصورة المصغّرة.',
        outcome: 'فيديو مقتطع، ونسخة أصغر اختيارية، وصورة ثابتة يمكن استخدامها للمعاينة.',
        note: 'تعتمد معالجة الفيديو على دعم المتصفح للترميزات والذاكرة المتاحة وأداء الجهاز. احتفظ بالمقطع الأصلي واختبر الملف الناتج قبل مشاركته.',
      },
      fr: {
        title: 'Préparer des clips vidéo et des miniatures',
        description: 'Découpez un clip, réduisez sa taille et extrayez une image pour créer une miniature ou un aperçu.',
        introduction: 'Préparez un élément vidéo dans un ordre pratique : retirez la partie inutile, compressez le clip si un fichier plus léger est nécessaire, puis capturez une image pour sa miniature.',
        outcome: 'Une vidéo découpée, une exportation éventuellement plus légère et une image fixe pour l’aperçu.',
        note: 'Le traitement dépend des codecs pris en charge par le navigateur, de la mémoire disponible et des performances de l’appareil. Conservez la vidéo source.',
      },
      es: {
        title: 'Preparar clips de vídeo y miniaturas',
        description: 'Recorta un clip, reduce su tamaño y extrae un fotograma para usarlo como miniatura o vista previa.',
        introduction: 'Prepara el recurso de vídeo en un orden práctico: elimina la parte que no necesitas, comprime el clip si quieres un archivo más ligero y captura un fotograma para la miniatura.',
        outcome: 'Un vídeo recortado, una exportación opcional de menor tamaño y una imagen fija para la vista previa.',
        note: 'El procesamiento depende de los códecs compatibles con el navegador, la memoria disponible y el rendimiento del dispositivo. Conserva el vídeo original.',
      },
      pt: {
        title: 'Preparar clipes de vídeo e miniaturas',
        description: 'Recorte um clipe, reduza o tamanho do arquivo e extraia um quadro para usar como miniatura ou prévia.',
        introduction: 'Prepare o vídeo em uma ordem prática: remova o trecho desnecessário, compacte o clipe se precisar de um arquivo menor e capture um quadro para a miniatura.',
        outcome: 'Um vídeo recortado, uma exportação opcional menor e uma imagem estática para a prévia.',
        note: 'O processamento depende dos codecs compatíveis com o navegador, da memória disponível e do desempenho do dispositivo. Guarde o vídeo original.',
      },
      hi: {
        title: 'वीडियो क्लिप और थंबनेल तैयार करें',
        description: 'क्लिप को ट्रिम करें, फ़ाइल का आकार घटाएँ और थंबनेल या प्रीव्यू के लिए एक फ़्रेम निकालें।',
        introduction: 'वीडियो सामग्री को उपयोगी क्रम में तैयार करें: अनावश्यक हिस्सा हटाएँ, छोटी फ़ाइल चाहिए तो क्लिप को संपीड़ित करें और फिर थंबनेल के लिए एक फ़्रेम निकालें।',
        outcome: 'ट्रिम किया हुआ वीडियो, वैकल्पिक रूप से छोटा निर्यात और प्रीव्यू के लिए स्थिर फ़्रेम।',
        note: 'वीडियो प्रोसेसिंग ब्राउज़र के codec समर्थन, उपलब्ध मेमोरी और डिवाइस के प्रदर्शन पर निर्भर करती है। मूल क्लिप रखें और साझा करने से पहले निर्यात की जाँच करें।',
      },
      zh: {
        title: '准备视频片段和缩略图',
        description: '裁剪视频片段、减小文件体积，并提取一帧作为缩略图或预览图。',
        introduction: '按实用顺序准备视频素材：先去掉不需要的片段；需要更小文件时再压缩；最后提取一帧作为缩略图。',
        outcome: '得到裁剪后的视频、可选的较小文件，以及一张可用于预览的静态画面。',
        note: '视频处理取决于浏览器编解码器支持、可用内存和设备性能。请保留源视频，并在分享前测试导出文件。',
      },
      bn: {
        title: 'ভিডিও ক্লিপ ও থাম্বনেইল প্রস্তুত করুন',
        description: 'ক্লিপ ট্রিম করুন, ফাইলের আকার কমান এবং থাম্বনেইল বা প্রিভিউর জন্য একটি ফ্রেম বের করুন।',
        introduction: 'ব্যবহারিক ক্রমে ভিডিও প্রস্তুত করুন: অপ্রয়োজনীয় অংশ বাদ দিন, ছোট ফাইল দরকার হলে ক্লিপ কমপ্রেস করুন, তারপর থাম্বনেইলের জন্য একটি ফ্রেম নিন।',
        outcome: 'ট্রিম করা ভিডিও, ঐচ্ছিক ছোট এক্সপোর্ট এবং প্রিভিউর জন্য একটি স্থির ফ্রেম।',
        note: 'ভিডিও প্রসেসিং ব্রাউজারের codec সমর্থন, উপলব্ধ মেমরি এবং ডিভাইসের পারফরম্যান্সের ওপর নির্ভর করে। মূল ভিডিও রেখে দিন এবং শেয়ার করার আগে এক্সপোর্ট পরীক্ষা করুন।',
      },
    },
  },
];

export const WORKFLOWS_REGISTRY: Record<string, WorkflowDefinition> = Object.fromEntries(
  WORKFLOWS_LIST.map((workflow) => [workflow.slug, workflow]),
);

export function getWorkflowBySlug(slug: string): WorkflowDefinition | undefined {
  return WORKFLOWS_REGISTRY[slug];
}

export function getWorkflowsForTool(toolSlug: string): WorkflowDefinition[] {
  return WORKFLOWS_LIST.filter((workflow) => workflow.toolSlugs.includes(toolSlug));
}

export function getWorkflowsForCategory(category: CategoryId): WorkflowDefinition[] {
  return WORKFLOWS_LIST.filter((workflow) => workflow.category === category);
}

export function getWorkflowCopy(workflow: WorkflowDefinition, locale: SupportedLocale): WorkflowCopy {
  return workflow.localized[locale] || workflow.localized.en;
}

export interface WorkflowUiCopy {
  workflows: string;
  indexKicker: string;
  indexTitle: string;
  indexDescription: string;
  relatedWorkflows: string;
  stepLabel: string;
  openTool: string;
  privacyLocal: string;
  privacyNetwork: string;
  outcomeLabel: string;
  noteLabel: string;
  notFound: string;
}

export const WORKFLOW_UI: Record<SupportedLocale, WorkflowUiCopy> = {
  en: {
    workflows: 'Workflows', indexKicker: 'CONNECTED TASKS', indexTitle: 'Complete the task, not just one step',
    indexDescription: 'Follow practical paths that connect UTILORA tools into a clear sequence. Each step opens the real tool, so you stay in control of every file and result.',
    relatedWorkflows: 'Workflows that use this tool', stepLabel: 'Step', openTool: 'Open tool',
    privacyLocal: 'File processing in these workflows runs in your browser. Your files are not uploaded to UTILORA.',
    privacyNetwork: 'This workflow sends the hostname you enter to public RDAP/DNS services or the target website so it can retrieve public registration, DNS, status, and header information.',
    outcomeLabel: 'What you will have', noteLabel: 'Important to know', notFound: 'This workflow could not be found.',
  },
  ar: {
    workflows: 'مسارات العمل', indexKicker: 'مهام مترابطة', indexTitle: 'أنجز المهمة كاملة، لا خطوة واحدة فقط',
    indexDescription: 'اتبع مسارات عملية تربط أدوات UTILORA في تسلسل واضح. كل خطوة تفتح الأداة الفعلية لتبقى متحكماً في ملفاتك ونتائجك.',
    relatedWorkflows: 'مسارات عمل تستخدم هذه الأداة', stepLabel: 'الخطوة', openTool: 'افتح الأداة',
    privacyLocal: 'تُنفّذ معالجة الملفات في هذه المسارات داخل متصفحك، ولا تُرفع ملفاتك إلى UTILORA.',
    privacyNetwork: 'يرسل هذا المسار اسم النطاق الذي تدخله إلى خدمات RDAP وDNS العامة أو إلى الموقع المستهدف لاسترجاع بيانات التسجيل والسجلات والحالة والترويسات العامة.',
    outcomeLabel: 'النتيجة المتوقعة', noteLabel: 'ملاحظة مهمة', notFound: 'تعذر العثور على مسار العمل هذا.',
  },
  fr: {
    workflows: 'Parcours', indexKicker: 'TÂCHES CONNECTÉES', indexTitle: 'Terminez la tâche, pas seulement une étape',
    indexDescription: 'Suivez des parcours pratiques qui relient les outils UTILORA dans un ordre clair. Chaque étape ouvre l’outil réel et vous gardez le contrôle des fichiers et des résultats.',
    relatedWorkflows: 'Parcours utilisant cet outil', stepLabel: 'Étape', openTool: 'Ouvrir l’outil',
    privacyLocal: 'Le traitement des fichiers de ces parcours s’exécute dans votre navigateur. Vos fichiers ne sont pas envoyés à UTILORA.',
    privacyNetwork: 'Ce parcours transmet le nom d’hôte saisi aux services RDAP/DNS publics ou au site cible pour récupérer des informations publiques.',
    outcomeLabel: 'Résultat attendu', noteLabel: 'À savoir', notFound: 'Ce parcours est introuvable.',
  },
  es: {
    workflows: 'Flujos de trabajo', indexKicker: 'TAREAS CONECTADAS', indexTitle: 'Completa la tarea, no solo un paso',
    indexDescription: 'Sigue recorridos prácticos que conectan las herramientas de UTILORA en una secuencia clara. Cada paso abre la herramienta real y mantiene el control de tus archivos y resultados.',
    relatedWorkflows: 'Flujos que utilizan esta herramienta', stepLabel: 'Paso', openTool: 'Abrir herramienta',
    privacyLocal: 'El procesamiento de archivos de estos flujos se realiza en tu navegador. Tus archivos no se suben a UTILORA.',
    privacyNetwork: 'Este flujo envía el nombre de host introducido a servicios públicos RDAP/DNS o al sitio de destino para recuperar información pública.',
    outcomeLabel: 'Resultado esperado', noteLabel: 'Importante', notFound: 'No se encontró este flujo de trabajo.',
  },
  pt: {
    workflows: 'Fluxos de trabalho', indexKicker: 'TAREFAS CONECTADAS', indexTitle: 'Conclua a tarefa, não apenas uma etapa',
    indexDescription: 'Siga caminhos práticos que conectam as ferramentas da UTILORA em uma sequência clara. Cada etapa abre a ferramenta real e mantém você no controle dos arquivos e resultados.',
    relatedWorkflows: 'Fluxos que usam esta ferramenta', stepLabel: 'Etapa', openTool: 'Abrir ferramenta',
    privacyLocal: 'O processamento de arquivos nesses fluxos acontece no seu navegador. Seus arquivos não são enviados à UTILORA.',
    privacyNetwork: 'Este fluxo envia o nome do host informado a serviços públicos RDAP/DNS ou ao site de destino para obter informações públicas.',
    outcomeLabel: 'Resultado esperado', noteLabel: 'Importante', notFound: 'Este fluxo de trabalho não foi encontrado.',
  },
  hi: {
    workflows: 'कार्यप्रवाह', indexKicker: 'जुड़े हुए कार्य', indexTitle: 'सिर्फ़ एक चरण नहीं, पूरा काम पूरा करें',
    indexDescription: 'ऐसे व्यावहारिक क्रम अपनाएँ जो UTILORA टूल्स को स्पष्ट चरणों में जोड़ते हैं। हर चरण वास्तविक टूल खोलता है, ताकि फ़ाइलों और परिणामों पर आपका नियंत्रण रहे।',
    relatedWorkflows: 'इस टूल का उपयोग करने वाले कार्यप्रवाह', stepLabel: 'चरण', openTool: 'टूल खोलें',
    privacyLocal: 'इन कार्यप्रवाहों में फ़ाइल प्रोसेसिंग आपके ब्राउज़र में होती है। आपकी फ़ाइलें UTILORA पर अपलोड नहीं होतीं।',
    privacyNetwork: 'यह कार्यप्रवाह आपके द्वारा दर्ज होस्टनाम को सार्वजनिक RDAP/DNS सेवाओं या लक्ष्य वेबसाइट पर भेजता है ताकि सार्वजनिक जानकारी प्राप्त की जा सके।',
    outcomeLabel: 'आपको क्या मिलेगा', noteLabel: 'ध्यान दें', notFound: 'यह कार्यप्रवाह नहीं मिला।',
  },
  zh: {
    workflows: '工作流程', indexKicker: '关联任务', indexTitle: '完成整项任务，而不只是其中一步',
    indexDescription: '按照实用流程，将 UTILORA 工具串联成清晰步骤。每一步都会打开实际工具，让你掌控自己的文件和结果。',
    relatedWorkflows: '使用此工具的工作流程', stepLabel: '步骤', openTool: '打开工具',
    privacyLocal: '这些流程中的文件处理在浏览器内完成。文件不会上传到 UTILORA。',
    privacyNetwork: '此流程会将输入的主机名发送到公共 RDAP/DNS 服务或目标网站，以获取公开注册、DNS、状态和标头信息。',
    outcomeLabel: '预期结果', noteLabel: '注意事项', notFound: '找不到此工作流程。',
  },
  bn: {
    workflows: 'কাজের ধাপ', indexKicker: 'সংযুক্ত কাজ', indexTitle: 'শুধু একটি ধাপ নয়, পুরো কাজটি সম্পন্ন করুন',
    indexDescription: 'ব্যবহারিক ধাপ অনুসরণ করুন যা UTILORA টুলগুলোকে একটি পরিষ্কার ক্রমে যুক্ত করে। প্রতিটি ধাপ আসল টুলটি খোলে, তাই ফাইল ও ফলাফলের নিয়ন্ত্রণ আপনার কাছেই থাকে।',
    relatedWorkflows: 'এই টুল ব্যবহার করে এমন কাজের ধাপ', stepLabel: 'ধাপ', openTool: 'টুল খুলুন',
    privacyLocal: 'এই কাজের ধাপগুলোর ফাইল প্রসেসিং আপনার ব্রাউজারে হয়। আপনার ফাইল UTILORA-তে আপলোড হয় না।',
    privacyNetwork: 'এই ধাপটি আপনার দেওয়া হোস্টনাম পাবলিক RDAP/DNS সার্ভিস বা লক্ষ্য ওয়েবসাইটে পাঠায়, যাতে প্রকাশ্য তথ্য পাওয়া যায়।',
    outcomeLabel: 'আপনি যা পাবেন', noteLabel: 'জেনে রাখুন', notFound: 'এই কাজের ধাপটি পাওয়া যায়নি।',
  },
};
