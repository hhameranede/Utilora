import React from 'react';
import { Info, Film, Image as ImageIcon, Camera, MapPin, Cpu, HardDrive } from 'lucide-react';
import { useI18n } from '../../i18n';
import { DisabledAction } from '../common/DisabledAction';

export const TemplateOMediaMetadata: React.FC<{ toolName: string; isVideo?: boolean }> = ({
  toolName,
  isVideo = false,
}) => {
  const { t } = useI18n();

  const metadataRows = isVideo
    ? [
        { label: 'Container Format', value: 'ISO Media, MP4 Base Media v1 [IS0 14496-12]' },
        { label: 'Video Codec', value: 'High 4:2:2 Profile (avc1.640028 / H.264)' },
        { label: 'Resolution', value: '3840 × 2160 (4K UHD 16:9)' },
        { label: 'Frame Rate', value: '59.940 fps (Constant)' },
        { label: 'Color Space', value: 'BT.709 Standard Dynamic Range' },
        { label: 'Audio Codec', value: 'Advanced Audio Coding (mp4a.40.2 / AAC-LC)' },
        { label: 'Audio Channels', value: 'Stereo 2.0 (Front: L R) · 48,000 Hz' },
        { label: 'Overall Bitrate', value: '28.4 Mb/s' },
        { label: 'Duration', value: '00:04:18.234 (15,482 frames)' },
        { label: 'File Size', value: '879.4 MB (922,123,450 bytes)' },
      ]
    : [
        { label: 'Image Dimensions', value: '6000 × 4000 (24.0 Megapixels)' },
        { label: 'File Type', value: 'JPEG / JFIF 1.02 Standard' },
        { label: 'Color Depth', value: '8-bit RGB (sRGB IEC61966-2.1)' },
        { label: 'Camera Model', value: 'Sony Alpha ILCE-7M4' },
        { label: 'Lens Specification', value: 'FE 24-70mm F2.8 GM II' },
        { label: 'Focal Length', value: '35.0 mm (35mm equivalent)' },
        { label: 'Exposure / Shutter', value: '1/320 sec at f/2.8, ISO 100' },
        { label: 'Metering Mode', value: 'Multi-segment Pattern' },
        { label: 'Flash Mode', value: 'Did not fire, compulsory flash mode' },
        { label: 'GPS Coordinates', value: '37°46\'38.2"N 122°25\'12.5"W (Approx)' },
      ];

  return (
    <div className="w-full space-y-6">
      {/* File Card Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shadow-xs">
            {isVideo ? <Film size={22} /> : <ImageIcon size={22} />}
          </div>
          <div>
            <div className="text-sm font-semibold text-stone-900">
              {isVideo ? 'Cinematic-Landscape-Master.mp4' : 'Portrait-Photography-RAW-Export.jpg'}
            </div>
            <div className="text-xs text-stone-500 mt-0.5 font-mono">
              {isVideo ? '4K 60fps Master Stream' : 'EXIF 2.32 Embedded Metadata'}
            </div>
          </div>
        </div>

        <span className="text-[11px] font-mono text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg font-medium">
          {t('common.sampleData')}
        </span>
      </div>

      {/* Structured Metadata Grid */}
      <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs">
        <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-900">Technical Properties</span>
          <span className="text-[11px] font-mono text-stone-400">Atomic Byte Parsing</span>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {metadataRows.map((row, idx) => (
            <div
              key={idx}
              className="p-3.5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-stone-50/50 transition-colors"
            >
              <span className="text-stone-600 font-medium">{row.label}</span>
              <span className="font-mono text-stone-900 text-right font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-stone-600">
          Inspection engine will extract EXIF/MP4 atoms in browser memory.
        </div>
        <div className="w-full sm:w-auto">
          <DisabledAction label="Export Raw Metadata JSON" size="md" />
        </div>
      </div>
    </div>
  );
};
