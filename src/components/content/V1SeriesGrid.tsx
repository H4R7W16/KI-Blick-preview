import { useMemo, useState } from 'react';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getV1Series, getV1ImagePath } from '../../data/v1Images';
import { resolveAssetPath } from '../../utils/assetPath';
import Lightbox from '../features/Lightbox';

interface V1SeriesGridProps {
  promptSlug?: string;
  maxImages?: number;
}

export default function V1SeriesGrid({ promptSlug = 'leuchtturm', maxImages }: V1SeriesGridProps) {
  const areaColor = getAreaColorVar(useArea());
  const series = useMemo(() => getV1Series(promptSlug), [promptSlug]);
  const [isOpen, setIsOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!series) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] p-4 text-sm dark:text-[var(--color-muted)] text-slate-500">
        Keine Bildserie gefunden.
      </div>
    );
  }

  const images = maxImages ? series.images.slice(0, maxImages) : series.images;
  const resolvedBasePath = resolveAssetPath(series.basePath);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsOpen(true);
  };

  return (
    <>
      <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900">
              {images.length} Bilder, ein Prompt
            </h4>
            <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">
              Prompt: <span className="font-medium" style={{ color: areaColor }}>„{series.prompt}“</span>
            </p>
          </div>
          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500">
            Bild anklicken: Zoom · ← → wechseln · Esc schliessen
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
          {images.map((img, index) => (
            <button
              key={img.seed}
              type="button"
              onClick={() => openLightbox(index)}
              className="relative rounded-lg overflow-hidden border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border)]"
              aria-label={`Bild ${index + 1} (Seed ${img.seed}) vergroessert anzeigen`}
            >
              <img
                src={getV1ImagePath(promptSlug, img.seed)}
                alt={`${series.prompt}, Seed ${img.seed}`}
                loading="lazy"
                className="w-full aspect-square object-cover"
              />
              <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 text-white">
                Seed {img.seed}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed">
          Gleicher Prompt, anderer Startpunkt im Rauschen: Jedes Bild ist eine Neuberechnung.
        </p>
      </section>

      <Lightbox
        images={images.map(image => ({ filename: image.filename }))}
        basePath={resolvedBasePath}
        subjectSlug={promptSlug}
        currentIndex={lightboxIndex}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </>
  );
}

