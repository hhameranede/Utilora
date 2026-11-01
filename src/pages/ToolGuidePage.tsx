import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, ChevronRight, CircleHelp, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n';
import { getToolBySlug } from '../registry/tools.registry';
import { getCategoryById } from '../registry/categories.registry';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ToolWorkspaceResolver } from '../components/templates/ToolWorkspaceResolver';
import { Head } from '../seo/Head';
import { Link } from '../router';

interface GuideAnnotationPoint { x: number; y: number }

const GUIDE_CAPTURE_WIDTH = 1080;

function findGuideAnnotationPoints(node: HTMLDivElement): { points: GuideAnnotationPoint[]; height: number } {
  const nodeRect = node.getBoundingClientRect();
  const scale = GUIDE_CAPTURE_WIDTH / Math.max(1, nodeRect.width);
  const height = Math.max(900, Math.ceil(Math.max(node.scrollHeight, nodeRect.height) * scale));
  const points: GuideAnnotationPoint[] = [];
  const used = new Set<Element>();

  const isVisible = (element: Element): boolean => {
    const rect = element.getBoundingClientRect();
    return rect.width >= 18 && rect.height >= 14 &&
      rect.bottom > nodeRect.top && rect.top < nodeRect.bottom + node.scrollHeight;
  };

  const visualAnchor = (element: Element | null): Element | null => {
    let current = element;
    while (current && current !== node) {
      const rect = current.getBoundingClientRect();
      if (rect.width >= 80 && rect.height >= 28) return current;
      current = current.parentElement;
    }
    return element;
  };

  const addPoint = (element: Element | null): void => {
    if (!element) return;
    const anchor = visualAnchor(element);
    if (!anchor || used.has(anchor) || !isVisible(anchor)) return;
    const rect = anchor.getBoundingClientRect();
    const x = Math.max(34, Math.min(GUIDE_CAPTURE_WIDTH - 34, (rect.left - nodeRect.left + rect.width / 2) * scale));
    const y = Math.max(34, Math.min(height - 34, (rect.top - nodeRect.top + rect.height / 2) * scale));
    if (points.some((point) => Math.abs(point.x - x) < 26 && Math.abs(point.y - y) < 26)) return;
    used.add(anchor);
    points.push({ x, y });
  };

  const fileInput = node.querySelector<HTMLInputElement>('input[type="file"]');
  const editor = node.querySelector('textarea, [contenteditable="true"], input:not([type="hidden"]):not([type="checkbox"]):not([type="range"]):not([type="file"])');
  const primaryInput = fileInput
    ? fileInput.closest('label, button, [role="button"]') || fileInput.parentElement
    : editor;
  addPoint(primaryInput);

  const options = Array.from(node.querySelectorAll('select, input[type="range"], input[type="number"], input[type="checkbox"], [role="combobox"]'))
    .filter((element) => isVisible(element) && !used.has(element));
  addPoint(options[0] || null);

  const actionPattern = /\b(process|convert|compress|inspect|extract|generate|validate|format|sort|merge|split|rotate|resize|crop|lookup|check|search|analy[sz]e|apply|export|create|trim|compare|run|transform|encode|decode)\b/i;
  const buttons = Array.from(node.querySelectorAll('button, [role="button"]')).filter(isVisible);
  const action = buttons.find((button) => actionPattern.test([
    button.textContent || '',
    button.getAttribute('aria-label') || '',
    button.getAttribute('title') || '',
  ].join(' ')));
  addPoint(action || buttons.find((button) => /copy|result|output/i.test([
    button.textContent || '',
    button.getAttribute('aria-label') || '',
    button.getAttribute('title') || '',
  ].join(' '))) || buttons[0] || null);

  return { points: points.slice(0, 3), height };
}

interface ToolGuidePageProps { toolSlug: string }

interface GuideStep { title: string; description: string; annotation: string }

function getGuideSteps(category: string, locale: string, name: string, formats: string, translate: (key: string) => string): GuideStep[] {
  if (locale !== 'ar' && locale !== 'en') {
    return [
      { title: translate('product.step1'), description: translate('guide.step1Desc'), annotation: translate('guide.inputArea') },
      { title: translate('product.step2'), description: translate('guide.step2Desc'), annotation: translate('guide.settingsArea') },
      { title: translate('product.step3'), description: translate('guide.step3Desc'), annotation: translate('guide.resultArea') },
    ];
  }
  const arabic = locale === 'ar';
  const labels = {
    image: arabic
      ? [
          ['أضف الصورة', 'اضغط على منطقة الرفع أو اسحب الصورة من جهازك. الصيغ المقبولة: ' + formats, 'منطقة رفع الصورة'],
          ['اضبط الخيارات', 'اختر الصيغة أو الأبعاد أو الجودة أو مساحة القص بحسب الأداة.', 'إعدادات المعالجة'],
          ['نفّذ واحفظ', 'راجع النتيجة ثم نزّل الملف الناتج إلى جهازك.', 'زر المعالجة والتنزيل'],
        ]
      : [
          ['Add your image', 'Choose the upload area or drag a picture from your device. Accepted formats: ' + formats, 'Image upload area'],
          ['Adjust the options', 'Choose the output format, dimensions, quality, or crop area available in this tool.', 'Processing settings'],
          ['Process and save', 'Review the result and download the generated file to your device.', 'Process and download controls'],
        ],
    pdf: arabic
      ? [
          ['أضف ملفات PDF', 'اختر ملف PDF أو الملفات المطلوبة، ثم تأكد من ظهورها في مساحة العمل.', 'منطقة إضافة ملفات PDF'],
          ['رتّب الصفحات والخيارات', 'عدّل ترتيب الملفات أو الصفحات والإعدادات التي توفرها الأداة.', 'ترتيب الملفات وخيارات PDF'],
          ['أنشئ الملف النهائي', 'ابدأ المعالجة ثم نزّل ملف PDF الجديد بعد اكتمالها.', 'زر تنفيذ العملية'],
        ]
      : [
          ['Add your PDF files', 'Select the PDF file or files and make sure they appear in the workspace.', 'PDF upload area'],
          ['Arrange pages and options', 'Change file or page order and configure the options shown by this tool.', 'File order and PDF options'],
          ['Create the final file', 'Run the operation and download your new PDF when it is ready.', 'Run and download controls'],
        ],
    text: arabic
      ? [
          ['أدخل النص', 'الصق النص أو اكتبه في حقل الإدخال داخل مساحة العمل.', 'مربع إدخال النص'],
          ['اختر طريقة التعديل', 'حدّد الخيارات أو نوع التحويل الذي تحتاجه.', 'خيارات النص'],
          ['انسخ النتيجة', 'راجع النص الناتج ثم انسخه أو نزّله حسب الخيارات المتاحة.', 'منطقة النتيجة'],
        ]
      : [
          ['Enter your text', 'Paste or type your content into the input field in the workspace.', 'Text input field'],
          ['Choose how to transform it', 'Select the available options or transformation mode you need.', 'Text options'],
          ['Copy your result', 'Review the output, then copy or download it using the available controls.', 'Output area'],
        ],
    developer: arabic
      ? [
          ['أدخل البيانات أو الشيفرة', 'الصق النص أو الشيفرة التي تريد العمل عليها في المحرر.', 'محرر الإدخال'],
          ['اضبط المعلمات', 'اختر الترميز أو اللغة أو الخيارات المناسبة للأداة.', 'إعدادات الأداة'],
          ['احصل على النتيجة', 'نفّذ العملية ثم انسخ أو نزّل النتيجة.', 'زر التنفيذ والنتيجة'],
        ]
      : [
          ['Enter data or code', 'Paste the text or code you want to work with into the editor.', 'Input editor'],
          ['Configure parameters', 'Choose the encoding, language, or settings relevant to this tool.', 'Tool configuration'],
          ['Get the result', 'Run the operation, then copy or download the result.', 'Run button and result'],
        ],
    'website-domain': arabic
      ? [
          ['أدخل النطاق أو الرابط', 'اكتب اسم النطاق أو رابط الموقع الذي تريد فحصه.', 'حقل النطاق أو الرابط'],
          ['ابدأ الفحص', 'اضغط زر الفحص لطلب بيانات DNS أو RDAP أو استجابة الموقع العامة.', 'زر بدء الفحص'],
          ['اقرأ التفاصيل', 'راجع السجلات والحقول وحالة الطلب التي أعادتها المصادر العامة.', 'جدول نتائج الفحص'],
        ]
      : [
          ['Enter a domain or URL', 'Type the domain name or website URL you want to inspect.', 'Domain or URL field'],
          ['Start the lookup', 'Run the check to request public DNS, RDAP, or website response information.', 'Start lookup button'],
          ['Review the details', 'Inspect the records, fields, and request status returned by public sources.', 'Lookup results table'],
        ],
    video: arabic
      ? [
          ['ارفع الفيديو', 'اختر ملف فيديو مدعومًا من جهازك وانتظر قراءة معلوماته.', 'منطقة رفع الفيديو'],
          ['حدّد الإعدادات أو المقطع', 'اختر الجودة والدقة أو وقت البداية والنهاية أو صيغة الصوت.', 'إعدادات الفيديو'],
          ['عالج ونزّل', 'ابدأ المعالجة المحلية، تابع التقدم، ثم نزّل الملف الناتج.', 'شريط التقدم وزر التنزيل'],
        ]
      : [
          ['Upload your video', 'Choose a supported video file from your device and let the browser read its details.', 'Video upload area'],
          ['Set the options or clip', 'Choose quality and resolution, start and end times, or an audio format.', 'Video settings'],
          ['Process and download', 'Start local processing, follow the progress, and download the output file.', 'Progress and download controls'],
        ],
    fallback: arabic
      ? [
          ['أدخل البيانات', 'أضف المدخلات التي تطلبها ' + name + ' في مساحة العمل.', 'منطقة الإدخال'],
          ['اضبط الخيارات', 'راجع الإعدادات واختر القيم التي تناسب النتيجة المطلوبة.', 'إعدادات الأداة'],
          ['راجع الناتج', 'نفّذ العملية المتاحة ثم راجع النتائج أو نزّلها.', 'منطقة النتائج'],
        ]
      : [
          ['Provide the input', 'Add the information requested by ' + name + ' to its workspace.', 'Input area'],
          ['Configure the options', 'Review the settings and choose values that match your intended result.', 'Tool settings'],
          ['Review the output', 'Run the available operation, then inspect or download the result.', 'Results area'],
        ],
  };
  return (labels[category as keyof typeof labels] || labels.fallback).map(([title, description, annotation]) => ({ title, description, annotation }));
}

export const ToolGuidePage: React.FC<ToolGuidePageProps> = ({ toolSlug }) => {
  const { locale, t } = useI18n();
  const tool = getToolBySlug(toolSlug);
  const captureRef = useRef<HTMLDivElement>(null);
  const [screenshot, setScreenshot] = useState('');
  const [captureError, setCaptureError] = useState(false);
  const [annotationTargets, setAnnotationTargets] = useState<GuideAnnotationPoint[]>([]);
  const [annotationHeight, setAnnotationHeight] = useState(1000);

  const toolName = tool ? (tool.localizedName[locale] || tool.localizedName.en) : toolSlug;
  const category = tool ? getCategoryById(tool.category) : undefined;
  const categoryName = category ? (category.localizedTitle[locale] || category.localizedTitle.en) : '';
  const formats = tool?.acceptedFormats?.join(', ') || t('guide.formatsShown');
  const steps = useMemo(
    () => tool ? getGuideSteps(tool.category, locale, toolName, formats, t) : [],
    [tool, locale, toolName, formats, t],
  );

  useEffect(() => {
    if (!tool || !captureRef.current) return;
    let active = true;
    setCaptureError(false);
    setScreenshot('');
    setAnnotationTargets([]);
    setAnnotationHeight(1000);

    const capture = async () => {
      try {
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        if (!active || !captureRef.current) return;
        const node = captureRef.current;
        const annotations = findGuideAnnotationPoints(node);
        const { toPng } = await import('html-to-image');
        const dataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio: 1.15,
          backgroundColor: '#fafaf9',
          width: GUIDE_CAPTURE_WIDTH,
          height: annotations.height,
          style: { transform: 'none', margin: '0' },
        });
        if (active) {
          setAnnotationTargets(annotations.points);
          setAnnotationHeight(annotations.height);
          setScreenshot(dataUrl);
        }
      } catch {
        if (active) setCaptureError(true);
      }
    };
    void capture();
    return () => { active = false; };
  }, [toolSlug, locale, tool]);

  if (!tool) return null;

  const title = `${t('guide.titlePrefix')} ${toolName}`;
  const description = t('guide.description').replace('{tool}', toolName);
  const guideIsIndexable = tool.status === 'functional';

  return (
    <>
      <Head
        title={title + ' | UTILORA'}
        description={description}
        locale={locale}
        routeType="tool-guide"
        slug={tool.slug}
        isIndexable={guideIsIndexable}
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: t('nav.tools'), routeType: 'tools-index' },
          { label: categoryName, routeType: 'category', slug: tool.category },
          { label: toolName, routeType: 'tool', slug: tool.slug },
          { label: t('guide.breadcrumb') },
        ]} />

        <header className="max-w-4xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-700">
            <CircleHelp size={15} />
            <span>{t('guide.kicker')}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">{title}</h1>
          <p className="max-w-3xl text-sm leading-7 text-stone-600">{description}</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
            <span className="rounded-lg border border-stone-200 bg-white px-2.5 py-1">{categoryName}</span>
            {tool.acceptedFormats && <span className="rounded-lg border border-stone-200 bg-white px-2.5 py-1">{formats}</span>}
            {tool.maxFileSize && <span className="rounded-lg border border-stone-200 bg-white px-2.5 py-1">{t('guide.maxSize')}: {tool.maxFileSize}</span>}
          </div>
        </header>

        {tool.status !== 'functional' && (
          <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50/70 p-4 text-xs leading-relaxed text-stone-700">
            <ShieldCheck size={17} className="mt-0.5 shrink-0 text-orange-600" />
            <span>{t('guide.previewNotice')}</span>
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-stone-50 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
              <Camera size={15} className="text-orange-600" />
              {t('guide.screenshotTitle')}
            </div>
            <span className="text-xs text-stone-500">{t('guide.screenshotCaption')}</span>
          </div>

          <div className="relative bg-[#fafaf9] p-2 sm:p-5">
            {screenshot ? (
              <div className="relative mx-auto max-w-[1080px] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <img data-guide-screenshot src={screenshot} alt={t('guide.screenshotAlt').replace('{tool}', toolName)} className="block h-auto w-full" />
                <svg
                  data-guide-annotations
                  data-guide-target-count={annotationTargets.length}
                  viewBox={`0 0 ${GUIDE_CAPTURE_WIDTH} ${annotationHeight}`}
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  <defs>
                    <marker id="guide-arrow-head" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">
                      <path d="M0,0 L8,4 L0,8 Z" fill="#f97316" />
                    </marker>
                  </defs>
                  {annotationTargets.map((target, index) => {
                    const startX = target.x >= GUIDE_CAPTURE_WIDTH / 2 ? GUIDE_CAPTURE_WIDTH - 34 : 34;
                    const startY = Math.max(34, Math.min(annotationHeight - 34, target.y + (index - 1) * 64));
                    const controlX = (startX + target.x) / 2;
                    return (
                      <g key={index} data-guide-target={index + 1}>
                        <path
                          d={`M ${startX} ${startY} Q ${controlX} ${startY} ${target.x} ${target.y}`}
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="5"
                          strokeLinecap="round"
                          markerEnd="url(#guide-arrow-head)"
                        />
                        <circle cx={target.x} cy={target.y} r="35" fill="#f97316" fillOpacity=".13" stroke="#f97316" strokeWidth="5" />
                        <circle cx={target.x} cy={target.y} r="23" fill="#ffffff" stroke="#f97316" strokeWidth="5" />
                        <text x={target.x} y={target.y + 10} fill="#c2410c" fontFamily="Arial,sans-serif" fontSize="27" fontWeight="700" textAnchor="middle">{index + 1}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : captureError ? (
              <div className="rounded-2xl border border-orange-200 bg-white p-5 text-center">
                <p className="text-sm font-semibold text-stone-800">{t('guide.captureUnavailable')}</p>
                <p className="mt-1 text-xs text-stone-500">{t('guide.liveWorkspace')}</p>
                <div className="mt-5 text-start"><ToolWorkspaceResolver tool={tool} /></div>
              </div>
            ) : (
              <div className="flex min-h-72 items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white text-xs text-stone-500" role="status">
                <LoaderCircle size={17} className="animate-spin text-orange-500" />
                {t('guide.captureLoading')}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 border-t border-stone-200 p-4 sm:grid-cols-3 sm:p-5">
            {steps.map((step, index) => (
              <div key={step.title} className="relative rounded-2xl border border-stone-200 bg-white p-4">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-700 text-xs font-bold text-white">{index + 1}</span>
                <h2 className="mt-3 text-sm font-bold text-stone-900">{step.title}</h2>
                <p className="mt-1.5 text-xs leading-6 text-stone-600">{step.description}</p>
                <p className="mt-3 border-t border-stone-100 pt-2 text-[10px] font-semibold text-orange-700">{step.annotation}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center sm:p-7">
          <div>
            <h2 className="text-base font-bold text-stone-900">{t('guide.readyTitle')}</h2>
            <p className="mt-1 text-xs text-stone-500">{t('guide.readyBody')}</p>
          </div>
          <Link routeType="tool" slug={tool.slug} className="inline-flex items-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-800">
            {t('guide.openTool')} <ChevronRight size={15} />
          </Link>
        </section>

        <div className="pointer-events-none fixed left-[-12000px] top-0 -z-10 w-[1080px]" aria-hidden="true">
          <div ref={captureRef} className="w-[1080px] bg-[#fafaf9] p-8 text-stone-900">
            <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-4">
              <span className="text-xl font-extrabold tracking-tight">UTILORA</span>
              <span className="text-xs text-stone-500">{t('guide.workspacePreview')}</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold">{toolName}</h2>
            <p className="mb-6 text-sm text-stone-600">{tool.localizedDescription[locale] || tool.localizedDescription.en}</p>
            <ToolWorkspaceResolver tool={tool} />
          </div>
        </div>
      </div>
    </>
  );
};
