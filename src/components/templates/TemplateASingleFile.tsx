import React, { useState, useRef } from 'react';
import { Upload, File as FileIcon, X, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { useI18n } from '../../i18n';
import { DisabledAction } from '../common/DisabledAction';

interface TemplateASingleFileProps {
  toolName: string;
  acceptedFormats?: string[];
  maxFileSize?: string;
  actionLabel?: string;
  privacyText?: string;
}

export const TemplateASingleFile: React.FC<TemplateASingleFileProps> = ({
  toolName,
  acceptedFormats = ['.pdf', '.png', '.jpg', '.mp4'],
  maxFileSize = '100 MB',
  actionLabel = 'Process File',
  privacyText,
}) => {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type || file.name.split('.').pop() || 'Unknown',
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type || file.name.split('.').pop() || 'Unknown',
      });
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden ${
          isDragging
            ? 'border-orange-500 bg-orange-50/50 scale-[0.99]'
            : selectedFile
            ? 'border-stone-300 bg-white shadow-xs'
            : 'border-stone-200 hover:border-orange-300 bg-white hover:bg-orange-50/20 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200/80 mx-auto flex items-center justify-center text-orange-600 shadow-xs">
            <Upload size={24} />
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-semibold text-stone-900">
              {t('templates.dropzonePrompt')}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {t('templates.supports')}: {acceptedFormats.join(', ')} · {t('templates.maxSize')}: {maxFileSize}
            </p>
          </div>
        </div>
      </div>

      {/* Selected File Details State */}
      {selectedFile && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
              <FileIcon size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-stone-900 truncate">
                {selectedFile.name}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                {selectedFile.size} · {selectedFile.type}
              </div>
            </div>
          </div>

          <button
            onClick={handleClear}
            className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors shrink-0"
            title={t('templates.removeFile')}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Action Area & Disabled Processing Notice */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-600">
            <span className="font-semibold text-stone-900">{toolName}</span> workspace ready.
          </div>
          <div className="w-full sm:w-auto">
            <DisabledAction label={actionLabel} size="md" />
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-[11px] text-stone-500">
          <ShieldCheck size={14} className="text-orange-500 shrink-0" />
          <span>
            {privacyText || t('common.privacyStatementDesc')}
          </span>
        </div>
      </div>
    </div>
  );
};
