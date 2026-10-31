import React, { useState, useRef } from 'react';
import { Upload, File as FileIcon, X, ArrowUp, ArrowDown, Trash2, Layers } from 'lucide-react';
import { useI18n } from '../../i18n';
import { DisabledAction } from '../common/DisabledAction';

interface FileQueueItem {
  id: string;
  name: string;
  size: string;
}

interface TemplateBMultiFileProps {
  toolName: string;
  acceptedFormats?: string[];
  actionLabel?: string;
}

export const TemplateBMultiFile: React.FC<TemplateBMultiFileProps> = ({
  toolName,
  acceptedFormats = ['.pdf'],
  actionLabel = 'Merge Documents',
}) => {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileQueueItem[]>([
    { id: '1', name: 'Document-Quarterly-Report-Q1.pdf', size: '2.4 MB' },
    { id: '2', name: 'Financial-Appendix-Exhibit-B.pdf', size: '1.1 MB' },
    { id: '3', name: 'Signed-Executive-Summary.pdf', size: '0.8 MB' },
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      const newItems: FileQueueItem[] = Array.from(selected).map((f, i) => ({
        id: `${Date.now()}-${i}`,
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
      }));
      setFiles((prev) => [...prev, ...newItems]);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= files.length) return;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[target];
    newFiles[target] = temp;
    setFiles(newFiles);
  };

  const removeItem = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  return (
    <div className="w-full space-y-6">
      {/* Multi-Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-8 sm:p-10 rounded-3xl border-2 border-dashed border-stone-200 hover:border-orange-300 bg-white hover:bg-orange-50/20 shadow-xs transition-all cursor-pointer text-center"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 mx-auto flex items-center justify-center text-orange-600 shadow-xs">
            <Layers size={22} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-stone-900">
              {t('templates.dropzoneMultiPrompt')}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {t('templates.supports')}: {acceptedFormats.join(', ')} · Batch processing
            </p>
          </div>
        </div>
      </div>

      {/* File List & Reorder Queue */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-900">
              {t('templates.totalFiles')}: {files.length}
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-[11px] text-stone-500">{t('templates.reorderTip')}</span>
          </div>

          {files.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-stone-500 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <Trash2 size={13} />
              <span>{t('templates.clearAll')}</span>
            </button>
          )}
        </div>

        {files.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            No files in queue. Add files above to begin.
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/80 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-stone-200 text-[11px] font-mono font-semibold flex items-center justify-center text-stone-700 shrink-0">
                    {index + 1}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
                    <FileIcon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-stone-900 truncate">{file.name}</div>
                    <div className="text-[11px] text-stone-500">{file.size}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded hover:bg-stone-200 text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === files.length - 1}
                    className="p-1.5 rounded hover:bg-stone-200 text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => removeItem(file.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-600 ml-1"
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-600">
            Files will be compiled in numerical sequence.
          </div>
          <div className="w-full sm:w-auto">
            <DisabledAction label={actionLabel} size="md" />
          </div>
        </div>
      </div>
    </div>
  );
};
