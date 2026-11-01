import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { ArrowDown, ArrowUp, Download, FileText, RefreshCw, Upload, AlertCircle, X } from 'lucide-react';
import { countPdfPages, imagesToPdf, mergePdfFiles, renderPdfToImages, rotatePdfFile, splitPdfFile } from '../../engines/pdf/browser';

interface TemplatePdfToolsProps {
  toolName: string;
  toolSlug: string;
}

interface OutputFile { name: string; blob: Blob; note: string; }

export const TemplatePdfTools: React.FC<TemplatePdfToolsProps> = ({ toolName, toolSlug }) => {
  const { t } = useI18n();
  const [files, setFiles] = useState<File[]>([]);
  const [outputs, setOutputs] = useState<OutputFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [ranges, setRanges] = useState('1-3');
  const [burst, setBurst] = useState(false);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [targetPages, setTargetPages] = useState('');
  const [dpi, setDpi] = useState<150 | 300>(150);
  const [imageFormat, setImageFormat] = useState<'jpg' | 'png'>('jpg');
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('fit');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [margin, setMargin] = useState(10);

  const isMultiPdf = toolSlug === 'merge-pdf';
  const isImages = toolSlug === 'jpg-to-pdf';
  const isSplit = toolSlug === 'split-pdf';
  const isRotate = toolSlug === 'rotate-pdf';
  const isRender = toolSlug === 'pdf-to-jpg';

  const accept = isImages ? 'image/jpeg,image/png' : 'application/pdf,.pdf';
  const multiple = isMultiPdf || isImages;

  const chooseFiles = (selected: FileList | null) => {
    if (!selected) return;
    setFiles(Array.from(selected));
    setOutputs([]);
    setError('');
    setMessage('');
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= files.length) return;
    setFiles((previous) => {
      const next = [...previous];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setOutputs([]);
    setMessage('');
    setError('');
  };

  const removeFile = (index: number) => {
    setFiles((previous) => previous.filter((_, current) => current !== index));
    setOutputs([]);
    setMessage('');
  };

  const runTool = async () => {
    if (!files.length) {
      setError(isImages ? t('pdfWorkspace.errorChooseImage') : t('pdfWorkspace.errorChoosePdf'));
      return;
    }
    if (!multiple && files.length > 1) {
      setError(t('pdfWorkspace.errorSingleFile'));
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    setOutputs([]);
    try {
      if (toolSlug === 'merge-pdf') {
        const result = await mergePdfFiles(files);
        setOutputs([{ name: 'merged-document.pdf', blob: result.blob, note: `${result.pageCount} ${result.pageCount === 1 ? t('pdfWorkspace.page') : t('pdfWorkspace.pages')} · ${formatBytes(result.size)}` }]);
        setMessage(t('pdfWorkspace.successMerged'));
      } else if (toolSlug === 'jpg-to-pdf') {
        const result = await imagesToPdf(files, pageSize, margin, orientation);
        setOutputs([{ name: 'images-to-pdf.pdf', blob: result.blob, note: `${result.pageCount} ${result.pageCount === 1 ? t('pdfWorkspace.page') : t('pdfWorkspace.pages')}` }]);
        setMessage(t('pdfWorkspace.successImagesConverted'));
      } else if (toolSlug === 'split-pdf') {
        const result = await splitPdfFile(files[0], ranges, burst);
        setOutputs(result.map((item) => ({ name: item.filename, blob: item.blob, note: `${item.pageCount} ${item.pageCount === 1 ? t('pdfWorkspace.page') : t('pdfWorkspace.pages')}` })));
        setMessage(t('pdfWorkspace.createdOutputFiles').replace('{count}', String(result.length)));
      } else if (toolSlug === 'rotate-pdf') {
        const pageSelection = targetPages.trim().toLowerCase();
        const pages = !pageSelection || pageSelection === 'all'
          ? 'all'
          : targetPages.split(',').map((part) => Number(part.trim()) - 1);
        const result = await rotatePdfFile(files[0], rotation, pages);
        setOutputs([{ name: files[0].name.replace(/\.pdf$/i, '') + '-rotated.pdf', blob: result.blob, note: `${result.rotatedPageCount} ${result.rotatedPageCount === 1 ? t('pdfWorkspace.page') : t('pdfWorkspace.pages')} ${t('pdfWorkspace.rotated')}` }]);
        setMessage(t('pdfWorkspace.successRotationSaved'));
      } else if (toolSlug === 'pdf-to-jpg') {
        const result = await renderPdfToImages(files[0], dpi, imageFormat);
        setOutputs(result.map((item) => ({ name: item.filename, blob: item.blob, note: `${t('pdfWorkspace.page')} ${item.pageNumber}` })));
        setMessage(t('pdfWorkspace.renderedPageImages').replace('{count}', String(result.length)));
      } else if (toolSlug === 'pdf-page-counter') {
        const result = await countPdfPages(files[0]);
        setMessage(`${result.title}: ${result.pageCount} ${result.pageCount === 1 ? t('pdfWorkspace.page') : t('pdfWorkspace.pages')} · ${formatBytes(result.size)} · ${result.hasFormFields ? t('pdfWorkspace.containsFormFields') : t('pdfWorkspace.noFillableForms')}.`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('pdfWorkspace.errorProcessing'));
    } finally {
      setBusy(false);
    }
  };

  const downloadFile = (file: OutputFile) => {
    const url = URL.createObjectURL(file.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const downloadAll = () => outputs.forEach((item) => downloadFile(item));

  const inputLabel = isImages ? t('pdfWorkspace.chooseImages') : multiple ? t('pdfWorkspace.chooseMergeFiles') : t('pdfWorkspace.choosePdf');
  const actionLabel = {
    'merge-pdf': t('pdfWorkspace.mergeAction'),
    'split-pdf': burst ? t('pdfWorkspace.splitAllAction') : t('pdfWorkspace.extractAction'),
    'rotate-pdf': t('pdfWorkspace.rotateAction'),
    'jpg-to-pdf': t('pdfWorkspace.createPdfAction'),
    'pdf-to-jpg': t('pdfWorkspace.convertToImagesAction'),
    'pdf-page-counter': t('pdfWorkspace.countPagesAction'),
  }[toolSlug] ?? t('pdfWorkspace.processAction');

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5">
      <section className="lg:col-span-7 space-y-4 min-w-0">
        <label className="block p-7 sm:p-9 rounded-2xl border-2 border-dashed border-stone-300 hover:border-orange-400 bg-white text-center cursor-pointer transition-colors">
          <input type="file" accept={accept} multiple={multiple} onChange={(event) => chooseFiles(event.target.files)} className="hidden" />
          <span className="mx-auto w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center"><Upload size={22} /></span>
          <span className="block mt-3 text-sm font-semibold text-stone-900">{inputLabel}</span>
          <span className="block mt-1 text-xs text-stone-500">{isImages ? t('pdfWorkspace.imageSummary') : t('pdfWorkspace.pdfSummary')}</span>
        </label>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3"><h3 className="text-xs font-semibold text-stone-800">{t('pdfWorkspace.selectedFiles')} ({files.length})</h3><button type="button" onClick={() => { setFiles([]); setOutputs([]); setMessage(''); setError(''); }} className="text-[11px] text-stone-500 hover:text-red-600">{t('pdfWorkspace.clearList')}</button></div>
          {files.length === 0 ? <p className="text-xs text-stone-400 py-4 text-center">{t('pdfWorkspace.noFilesSelected')}</p> : (
            <ul className="space-y-2 max-h-72 overflow-y-auto">
              {files.map((file, index) => (
                <li key={file.name + file.size + index} className="flex items-center justify-between gap-2 rounded-xl bg-stone-50 border border-stone-100 p-3">
                  <div className="min-w-0">
                    <p className="text-xs text-stone-800 truncate">{index + 1}. {file.name}</p>
                    <p className="text-[11px] text-stone-500">{formatBytes(file.size)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {multiple && (
                      <>
                        <button type="button" onClick={() => moveFile(index, 'up')} disabled={index === 0} className="p-1.5 rounded-md hover:bg-stone-200 text-stone-500 disabled:opacity-30" title={t('pdfWorkspace.moveFileUp')}><ArrowUp size={14} /></button>
                        <button type="button" onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} className="p-1.5 rounded-md hover:bg-stone-200 text-stone-500 disabled:opacity-30" title={t('pdfWorkspace.moveFileDown')}><ArrowDown size={14} /></button>
                      </>
                    )}
                    <button type="button" onClick={() => removeFile(index)} className="p-1.5 rounded-md hover:bg-red-50 text-stone-400 hover:text-red-600" title={t('pdfWorkspace.removeFile')}><X size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {outputs.length > 0 && (
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-3">
            <div className="flex items-center justify-between gap-3"><h3 className="text-xs font-bold text-stone-900">{t('pdfWorkspace.outputFiles')} ({outputs.length})</h3>{outputs.length > 1 && <button type="button" onClick={downloadAll} className="text-xs font-semibold text-orange-800 underline">{t('pdfWorkspace.downloadAll')}</button>}</div>
            {outputs.map((output) => <div key={output.name} className="flex items-center justify-between gap-3 bg-white border border-stone-200 rounded-xl p-3"><div className="min-w-0"><p className="text-xs font-semibold text-stone-900 truncate">{output.name}</p><p className="text-[11px] text-stone-500">{output.note} · {formatBytes(output.blob.size)}</p></div><button type="button" onClick={() => downloadFile(output)} className="shrink-0 p-2 rounded-lg bg-stone-900 text-white" aria-label={`${t('pdfWorkspace.downloadFile')} ${output.name}`}><Download size={15} /></button></div>)}
          </div>
        )}
      </section>

      <aside className="lg:col-span-5 min-w-0">
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100"><FileText size={17} className="text-orange-600" /><h2 className="text-sm font-semibold text-stone-900">{toolName} · {t('pdfWorkspace.settingsSuffix')}</h2></div>

          {isSplit && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setBurst(false)} className={`px-3 py-2 rounded-lg border text-xs ${!burst ? 'bg-orange-50 border-orange-300 text-orange-800' : 'border-stone-200 text-stone-600'}`}>{t('pdfWorkspace.pageRanges')}</button><button type="button" onClick={() => setBurst(true)} className={`px-3 py-2 rounded-lg border text-xs ${burst ? 'bg-orange-50 border-orange-300 text-orange-800' : 'border-stone-200 text-stone-600'}`}>{t('pdfWorkspace.onePdfPerPage')}</button></div>
              {!burst && <label className="block space-y-1"><span className="text-xs font-semibold text-stone-700">{t('pdfWorkspace.pagesToExtract')}</span><input value={ranges} onChange={(event) => setRanges(event.target.value)} placeholder={t('pdfWorkspace.pageRangePlaceholder')} className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-sm text-stone-900" /><span className="text-[11px] text-stone-500">{t('pdfWorkspace.pageRangeHelp')}</span></label>}
            </div>
          )}

          {isRotate && (
            <div className="space-y-3">
              <label className="block space-y-1"><span className="text-xs font-semibold text-stone-700">{t('pdfWorkspace.pagesToRotate')}</span><input value={targetPages} onChange={(event) => setTargetPages(event.target.value)} placeholder={t('pdfWorkspace.allOrNumbersPlaceholder')} className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-sm text-stone-900" /><span className="text-[11px] text-stone-500">{t('pdfWorkspace.allOrNumbersHelp')}</span></label>
              <label className="block space-y-1"><span className="text-xs font-semibold text-stone-700">{t('pdfWorkspace.rotation')}</span><select value={rotation} onChange={(event) => setRotation(Number(event.target.value) as 90 | 180 | 270)} className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-sm text-stone-900"><option value={90}>{t('pdfWorkspace.rotation90')}</option><option value={180}>180°</option><option value={270}>{t('pdfWorkspace.rotation270')}</option></select></label>
            </div>
          )}

          {isImages && (
            <div className="space-y-3">
              <label className="block space-y-1"><span className="text-xs font-semibold text-stone-700">{t('pdfWorkspace.pageSize')}</span><select value={pageSize} onChange={(event) => setPageSize(event.target.value as typeof pageSize)} className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-sm text-stone-900"><option value="fit">{t('pdfWorkspace.fitImageDimensions')}</option><option value="a4">A4</option><option value="letter">{t('pdfWorkspace.letter')}</option></select></label>
              <label className="block space-y-1"><span className="text-xs font-semibold text-stone-700">{t('pdfWorkspace.orientation')}</span><select value={orientation} onChange={(event) => setOrientation(event.target.value as typeof orientation)} className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-sm text-stone-900"><option value="auto">{t('pdfWorkspace.matchEachImage')}</option><option value="portrait">{t('pdfWorkspace.portrait')}</option><option value="landscape">{t('pdfWorkspace.landscape')}</option></select></label>
              <label className="block space-y-1"><span className="text-xs font-semibold text-stone-700">{t('pdfWorkspace.marginMm')}</span><input type="number" min="0" max="30" value={margin} onChange={(event) => setMargin(Math.max(0, Math.min(30, Number(event.target.value) || 0)))} className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-sm text-stone-900" /></label>
              <p className="text-[11px] text-stone-500">{t('pdfWorkspace.oneImagePerPdfPage')}</p>
            </div>
          )}

          {isRender && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1"><span className="text-xs font-semibold text-stone-700">{t('pdfWorkspace.resolution')}</span><select value={dpi} onChange={(event) => setDpi(Number(event.target.value) as 150 | 300)} className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-sm text-stone-900"><option value={150}>150 DPI</option><option value={300}>300 DPI</option></select></label>
              <label className="block space-y-1"><span className="text-xs font-semibold text-stone-700">{t('pdfWorkspace.imageType')}</span><select value={imageFormat} onChange={(event) => setImageFormat(event.target.value as typeof imageFormat)} className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-sm text-stone-900"><option value="jpg">JPG</option><option value="png">PNG</option></select></label>
              <p className="col-span-2 text-[11px] text-stone-500">{t('pdfWorkspace.memoryLimit')}</p>
            </div>
          )}

          <button type="button" onClick={runTool} disabled={!files.length || busy} className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-2"><RefreshCw size={15} className={busy ? 'animate-spin' : ''} />{busy ? t('pdfWorkspace.processing') : actionLabel}</button>
          {message && <p role="status" className="text-xs text-emerald-700">{message}</p>}
          {error && <p role="alert" className="text-xs text-red-600 flex items-start gap-1.5"><AlertCircle size={14} className="shrink-0 mt-0.5" />{error}</p>}
          <p className="pt-3 border-t border-stone-100 text-[11px] leading-relaxed text-stone-500">{t('pdfWorkspace.privacyNotice')}</p>
        </div>
      </aside>
    </div>
  );
};

function formatBytes(value: number): string {
  if (value < 1024) return value + ' B';
  if (value < 1024 * 1024) return (value / 1024).toFixed(1) + ' KB';
  return (value / (1024 * 1024)).toFixed(2) + ' MB';
}
