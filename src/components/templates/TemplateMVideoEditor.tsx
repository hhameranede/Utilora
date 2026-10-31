import React, { useState } from 'react';
import { Play, Pause, Scissors, Sliders, Volume2, Film, Clock, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n';
import { DisabledAction } from '../common/DisabledAction';

export const TemplateMVideoEditor: React.FC<{ toolName: string }> = ({ toolName }) => {
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(14.2);
  const [startMarker, setStartMarker] = useState<number>(5.0);
  const [endMarker, setEndMarker] = useState<number>(28.5);
  const [qualityCrf, setQualityCrf] = useState<number>(23);
  const [targetRes, setTargetRes] = useState<'1080p' | '720p' | '480p'>('1080p');

  const totalDuration = 45.0;

  return (
    <div className="w-full space-y-6">
      {/* Video Preview Canvas & Timeline Scrubber */}
      <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs">
        {/* Video Frame Display */}
        <div className="relative aspect-video w-full bg-gradient-to-tr from-stone-100 to-orange-50/30 flex items-center justify-center p-6 border-b border-stone-100">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200/80 mx-auto flex items-center justify-center text-orange-600 shadow-sm">
              <Film size={26} />
            </div>
            <div className="text-sm font-semibold text-stone-900">
              SAMPLE_FOOTAGE_4K.MP4
            </div>
            <div className="text-xs font-mono text-stone-500">
              00:{currentTime.toFixed(1).padStart(4, '0')} / 00:{totalDuration.toFixed(1)}
            </div>
          </div>

          {/* Quick Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute bottom-4 left-4 p-2.5 rounded-xl bg-white/90 border border-stone-200 text-stone-700 hover:text-orange-600 shadow-xs transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>

        {/* Timeline Scrubber Container */}
        <div className="p-4 bg-white space-y-3">
          <div className="flex justify-between items-center text-xs font-mono text-stone-600">
            <span>In: 00:{startMarker.toFixed(1).padStart(4, '0')}</span>
            <span className="text-orange-600 font-bold">Duration: {(endMarker - startMarker).toFixed(1)}s</span>
            <span>Out: 00:{endMarker.toFixed(1).padStart(4, '0')}</span>
          </div>

          {/* Timeline Bar with Markers */}
          <div className="relative h-10 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden p-1 flex items-center">
            {/* Visual clip region */}
            <div
              className="absolute top-1 bottom-1 bg-orange-500/20 border-x-2 border-orange-500 rounded"
              style={{
                left: `${(startMarker / totalDuration) * 100}%`,
                width: `${((endMarker - startMarker) / totalDuration) * 100}%`,
              }}
            />

            {/* Playhead Indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-stone-900 z-10"
              style={{ left: `${(currentTime / totalDuration) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-stone-400">
            <span>00:00.0</span>
            <span>Drag markers to adjust cut points (Interactive UI preview)</span>
            <span>00:{totalDuration.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Video Encoding Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4">
          <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <Sliders size={15} className="text-orange-600" />
            <span>Target Resolution</span>
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {(['1080p', '720p', '480p'] as const).map((res) => (
              <button
                key={res}
                onClick={() => setTargetRes(res)}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-medium transition-colors ${
                  targetRes === res
                    ? 'bg-orange-50 text-orange-700 border border-orange-300 font-semibold'
                    : 'bg-stone-50 text-stone-600 border border-stone-200 hover:border-stone-300'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-stone-500 block">
            Downscales video frames during WebCodecs/FFmpeg pipeline.
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-stone-900 uppercase tracking-wider">CRF Compression Level</span>
            <span className="font-mono text-orange-600 font-bold">CRF {qualityCrf}</span>
          </div>
          <input
            type="range"
            min="18"
            max="32"
            value={qualityCrf}
            onChange={(e) => setQualityCrf(Number(e.target.value))}
            className="w-full accent-orange-500 bg-stone-200 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-stone-500 font-mono">
            <span>High Fidelity (CRF 18)</span>
            <span>Balanced (CRF 23)</span>
            <span>Maximum Size Cut (CRF 32)</span>
          </div>
        </div>
      </div>

      {/* Execution Action Footer */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-stone-600">
          Video timeline workspace ready for Phase 2 client-side FFmpeg pipeline.
        </div>
        <div className="w-full sm:w-auto">
          <DisabledAction label="Render & Export Cut" size="md" />
        </div>
      </div>
    </div>
  );
};
