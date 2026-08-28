import { useMemo, useState } from 'react';
import { getSeries } from '../../data/imageMetadata';
import { resolveAssetPath } from '../../utils/assetPath';

interface SeedVisualizerProps {
  subjectSlug?: string;
  modelId?: string;
}

export default function SeedVisualizer({
  subjectSlug = 'mathematiklehrkraft',
  modelId = 'flux2pro',
}: SeedVisualizerProps) {
  const series = useMemo(() => getSeries(subjectSlug, modelId), [subjectSlug, modelId]);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!series || series.images.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] p-4 text-sm dark:text-[var(--color-muted)] text-slate-500">
        Keine Bildserie für Seed-Visualisierung gefunden.
      </div>
    );
  }

  const image = series.images[currentIndex];
  const seed = 1000 + image.index * 37;
  const total = series.images.length;

  const rollSeed = () => {
    if (series.images.length < 2) {
      return;
    }

    let next = currentIndex;
    while (next === currentIndex) {
      next = Math.floor(Math.random() * series.images.length);
    }
    setCurrentIndex(next);
  };

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900">
            Seed-Würfel
          </h4>
          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">
            Gleiches Prompt, neuer Startpunkt: Variiere den Seed und beobachte den Unterschied.
          </p>
        </div>
        <button
          type="button"
          onClick={rollSeed}
          aria-label="Neuen Seed erzeugen"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-area-verstehen)] hover:bg-[var(--color-accent-active)] transition-colors"
        >
          Seed würfeln
        </button>
      </div>

      <div className="grid md:grid-cols-[1.2fr_1fr] gap-4">
        <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
          <img
            src={resolveAssetPath(`${series.basePath}/${image.filename}`)}
            alt={`Seed-Beispiel ${image.index} für ${series.prompt}`}
            loading="lazy"
            className="w-full h-64 md:h-72 object-cover"
          />
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-4 space-y-3">
          <div className="text-xs uppercase tracking-wider dark:text-[var(--color-muted)] text-slate-500">
            Aktueller Seed
          </div>
          <div className="text-3xl font-bold text-[var(--color-area-verstehen)]">
            {seed}
          </div>
          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-700">
            Bild {image.index} von {total}. Der Prompt bleibt gleich, aber der Start im Rauschraum ist anders.
          </p>
          <div className="pt-2 text-xs dark:text-[var(--color-muted)] text-slate-500">
            Praxishinweis: Gleicher Prompt + gleicher Seed = reproduzierbares Ergebnis.
          </div>
        </div>
      </div>
    </section>
  );
}


