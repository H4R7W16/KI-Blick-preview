import { useMemo, useState } from 'react';
import { MODELS, SUBJECTS } from '../../data/subjects';
import { getSeries } from '../../data/imageMetadata';
import { getTeacherAttributes } from '../../utils/teacherAttributes';
import { resolveAssetPath } from '../../utils/assetPath';

export default function ModelComparisonGrid() {
  const [subjectSlug, setSubjectSlug] = useState('informatiklehrkraft');

  const modelCards = useMemo(
    () =>
      MODELS.map(model => {
        const series = getSeries(subjectSlug, model.id);
        if (!series) {
          return {
            modelId: model.id,
            modelLabel: model.label,
            src: '',
            femaleShare: 0,
          };
        }

        const femaleCount = series.images.filter(
          image => getTeacherAttributes(image.attributes).gender === 'female',
        ).length;
        const femaleShare = Math.round((femaleCount / series.images.length) * 100);
        const contactSheet = resolveAssetPath(`${series.basePath}/_kontaktblatt.webp`);
        const preview = series.images[0]
          ? resolveAssetPath(`${series.basePath}/${series.images[0].filename}`)
          : '';

        return {
          modelId: model.id,
          modelLabel: model.label,
          src: contactSheet || preview,
          femaleShare,
        };
      }),
    [subjectSlug],
  );

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900">
            Modellvergleich
          </h4>
          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-700">
            Dasselbe Fach, drei Modelle, drei visuelle Handschriften.
          </p>
        </div>

        <label className="text-sm dark:text-[var(--color-secondary)] text-slate-700">
          Fach:
          <select
            value={subjectSlug}
            onChange={event => setSubjectSlug(event.target.value)}
            className="ml-2 rounded-md border border-[var(--color-border)] bg-white dark:bg-slate-900 px-2 py-1"
            aria-label="Fach für Modellvergleich auswählen"
          >
            {SUBJECTS.map(subject => (
              <option key={subject.slug} value={subject.slug}>
                {subject.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {modelCards.map(card => (
          <article key={card.modelId} className="rounded-lg border border-[var(--color-border)] overflow-hidden">
            {card.src ? (
              <img
                src={card.src}
                alt={`Kontaktblatt für ${card.modelLabel}`}
                loading="lazy"
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-slate-200 dark:bg-slate-700" />
            )}
            <div className="p-3">
              <h5 className="font-semibold dark:text-[var(--color-primary)] text-slate-900">
                {card.modelLabel}
              </h5>
              <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mt-1">
                Weiblich in Serie: {card.femaleShare}%
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

