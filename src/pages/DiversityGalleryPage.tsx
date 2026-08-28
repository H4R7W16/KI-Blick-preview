import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_SERIES } from '../data/imageMetadata';
import { resolveAssetPath } from '../utils/assetPath';

const SKIN_TONE_LABELS: Record<string, string> = {
  medium: 'mittel',
  dark: 'dunkel',
};

interface DiversityImage {
  seriesId: string;
  prompt: string;
  model: string;
  modelId: string;
  basePath: string;
  subjectSlug: string;
  filename: string;
  index: number;
  skinTone: string;
}

const nonLightImages: DiversityImage[] = IMAGE_SERIES.flatMap(series =>
  series.images
    .filter(img => {
      const tone = img.attributes?.skinTone;
      return tone === 'medium' || tone === 'dark';
    })
    .map(img => ({
      seriesId: series.seriesId,
      prompt: series.prompt,
      model: series.model,
      modelId: series.modelId,
      basePath: series.basePath,
      subjectSlug: series.subjectSlug,
      filename: img.filename,
      index: img.index,
      skinTone: img.attributes.skinTone as string,
    })),
);

const MODEL_LABELS: Record<string, string> = {
  'flux2pro': 'FLUX2 PRO',
  'gpt-image-1-5': 'GPT Image-1.5',
  'nanobana': 'Nano Bana',
};

export default function DiversityGalleryPage() {
  const [selectedTone, setSelectedTone] = useState<'all' | 'medium' | 'dark'>('all');

  const filtered = nonLightImages.filter(
    img => selectedTone === 'all' || img.skinTone === selectedTone,
  );

  const mediumCount = nonLightImages.filter(i => i.skinTone === 'medium').length;
  const darkCount = nonLightImages.filter(i => i.skinTone === 'dark').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          to="/entdecken"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-area-entdecken)] no-underline hover:underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Entdecken
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-2">
          Nicht-helle Hauttöne – Übersicht
        </h1>
        <p className="dark:text-[var(--color-secondary)] text-slate-600 text-sm">
          {nonLightImages.length} Bilder mit Hautton „mittel" oder „dunkel" aus allen 30 Bildserien
        </p>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([['all', `Alle (${nonLightImages.length})`], ['medium', `Mittel (${mediumCount})`], ['dark', `Dunkel (${darkCount})`]] as const).map(([tone, label]) => (
          <button
            key={tone}
            onClick={() => setSelectedTone(tone)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedTone === tone
                ? 'bg-[var(--color-area-entdecken)] text-white'
                : 'border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:border-[var(--color-area-entdecken)]/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map(img => (
          <div
            key={`${img.seriesId}-${img.index}`}
            className="group relative"
          >
            <div className="aspect-square rounded-xl overflow-hidden border border-[var(--color-border)]">
              <img
                src={resolveAssetPath(`${img.basePath}/${img.filename}`)}
                alt={`${img.prompt}, ${img.model}, Bild ${img.index}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="mt-1.5 px-0.5">
              <p className="text-xs font-medium dark:text-[var(--color-primary)] text-slate-800 truncate">
                {img.prompt}
              </p>
              <p className="text-xs dark:text-[var(--color-muted)] text-slate-500">
                {MODEL_LABELS[img.modelId] ?? img.model} · #{img.index}
              </p>
              <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${
                img.skinTone === 'dark'
                  ? 'bg-amber-900/30 text-amber-400'
                  : 'bg-sky-900/30 text-sky-400'
              }`}>
                {SKIN_TONE_LABELS[img.skinTone] ?? img.skinTone}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center dark:text-[var(--color-muted)] text-slate-500 py-12">
          Keine Bilder gefunden.
        </p>
      )}
    </div>
  );
}
