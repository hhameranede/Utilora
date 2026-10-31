import React, { useState } from 'react';
import { FileText, Check, RotateCw, Split, CheckSquare, Square, Trash2, ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n';
import { DisabledAction } from '../common/DisabledAction';

interface PdfPageItem {
  number: number;
  rotation: number;
  selected: boolean;
}

interface TemplateDPdfWorkspaceProps {
  toolName: string;
  actionLabel?: string;
}

export const TemplateDPdfWorkspace: React.FC<TemplateDPdfWorkspaceProps> = ({
  toolName,
  actionLabel = 'Extract Selected Pages',
}) => {
  const { t } = useI18n();

  const [pages, setPages] = useState<PdfPageItem[]>([
    { number: 1, rotation: 0, selected: true },
    { number: 2, rotation: 0, selected: true },
    { number: 3, rotation: 0, selected: false },
    { number: 4, rotation: 90, selected: true },
    { number: 5, rotation: 0, selected: true },
    { number: 6, rotation: 0, selected: false },
  ]);

  const togglePageSelection = (num: number) => {
    setPages((prev) =>
      prev.map((p) => (p.number === num ? { ...p, selected: !p.selected } : p))
    );
  };

  const rotatePage = (num: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPages((prev) =>
      prev.map((p) => (p.number === num ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const selectAll = (select: boolean) => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: select })));
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div className="w-full space-y-6">
      {/* Top Document Summary Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900 truncate">
              Annual-Financial-Report-2025.pdf
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              6 Pages · 4.18 MB · PDF 1.7 Spec
            </div>
          </div>
        </div>

        {/* Selection Bar Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => selectAll(true)}
            className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[11px] font-medium text-stone-700 transition-colors flex items-center gap-1.5"
          >
            <CheckSquare size={13} className="text-orange-600" />
            <span>Select All</span>
          </button>
          <button
            onClick={() => selectAll(false)}
            className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[11px] font-medium text-stone-700 transition-colors flex items-center gap-1.5"
          >
            <Square size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Pages Grid Workspace */}
      <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200/90 shadow-xs">
        <div className="text-xs font-semibold text-stone-700 mb-4 flex items-center justify-between">
          <span>Click page cards to toggle inclusion ({selectedCount} of {pages.length} selected)</span>
          <span className="font-mono text-[11px] text-stone-500">Document Arrangement</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {pages.map((page) => (
            <div
              key={page.number}
              onClick={() => togglePageSelection(page.number)}
              className={`group p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between aspect-[3/4] relative ${
                page.selected
                  ? 'bg-white border-orange-500 shadow-md ring-1 ring-orange-500/20'
                  : 'bg-white/70 border-stone-200 opacity-60 hover:opacity-100 hover:border-stone-300'
              }`}
            >
              {/* Header inside thumbnail card */}
              <div className="flex justify-between items-center text-[10px] font-mono text-stone-600">
                <span className="font-bold text-stone-900">P.{page.number}</span>
                <button
                  onClick={(e) => rotatePage(page.number, e)}
                  className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-orange-600 transition-colors"
                  title="Rotate page 90°"
                >
                  <RotateCw size={12} />
                </button>
              </div>

              {/* Graphic Simulation of PDF Page layout */}
              <div
                className="w-full flex-1 my-2 rounded-lg bg-stone-50 border border-stone-200 p-2 flex flex-col justify-center space-y-1.5 transition-transform duration-200 shadow-inner"
                style={{ transform: `rotate(${page.rotation}deg)` }}
              >
                <div className="h-1.5 w-3/4 bg-stone-300 rounded-sm" />
                <div className="h-1 w-full bg-stone-200 rounded-sm" />
                <div className="h-1 w-5/6 bg-stone-200 rounded-sm" />
                <div className="h-1 w-2/3 bg-stone-200 rounded-sm" />
                <div className="h-6 w-full rounded bg-stone-100 border border-stone-200 flex items-center justify-center text-[9px] font-mono text-stone-400">
                  CHART
                </div>
              </div>

              {/* Selection Checkmark */}
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-stone-500 font-mono">{page.rotation}°</span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                    page.selected
                      ? 'bg-orange-500 text-white font-bold shadow-xs'
                      : 'border border-stone-300'
                  }`}
                >
                  {page.selected && <Check size={10} strokeWidth={3} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Area */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-stone-600">
          Target selection: <strong className="text-stone-900">{selectedCount} pages</strong> ready for extraction/rotation.
        </div>
        <div className="w-full sm:w-auto">
          <DisabledAction label={actionLabel} size="md" />
        </div>
      </div>
    </div>
  );
};
