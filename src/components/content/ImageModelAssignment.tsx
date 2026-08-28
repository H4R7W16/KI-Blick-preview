import { useMemo, useState } from 'react';
import { getSeries } from '../../data/imageMetadata';
import { MODELS } from '../../data/subjects';
import { resolveAssetPath } from '../../utils/assetPath';

interface AssignmentImage {
  id: string;
  src: string;
  alt: string;
  correctModelId: string;
}

interface ImageModelAssignmentProps {
  items?: AssignmentImage[];
  subjectSlug?: string;
}

function buildDefaultItems(subjectSlug: string): AssignmentImage[] {
  return MODELS.flatMap(model => {
    const series = getSeries(subjectSlug, model.id);
    if (!series || !series.images[0]) {
      return [];
    }
    return [
      {
        id: `${subjectSlug}-${model.id}`,
        src: resolveAssetPath(`${series.basePath}/${series.images[0].filename}`),
        alt: `${series.prompt} Beispiel für ${model.label}`,
        correctModelId: model.id,
      },
    ];
  });
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

export default function ImageModelAssignment({
  items,
  subjectSlug = 'informatiklehrkraft',
}: ImageModelAssignmentProps) {
  const [seed, setSeed] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const assignmentItems = useMemo(() => {
    const source = items ?? buildDefaultItems(subjectSlug);
    const shuffled = shuffle(source);
    if (seed % 2 === 1) {
      shuffled.reverse();
    }
    return shuffled;
  }, [items, subjectSlug, seed]);

  const score = assignmentItems.reduce((count, item) => {
    if (answers[item.id] === item.correctModelId) {
      return count + 1;
    }
    return count;
  }, 0);

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
      <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-2">
        Bild zu Modell zuordnen
      </h4>
      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-700 mb-4">
        Ordne jedes Bild dem Modell zu, das es am wahrscheinlichsten erzeugt hat.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {assignmentItems.map(item => {
          const selected = answers[item.id];
          const isCorrect = selected === item.correctModelId;

          return (
            <article key={item.id} className="rounded-lg border border-[var(--color-border)] overflow-hidden">
              <img
                src={resolveAssetPath(item.src)}
                alt={item.alt}
                loading="lazy"
                className="w-full h-44 object-cover"
              />
              <div className="p-3">
                <label className="text-xs uppercase tracking-wider dark:text-[var(--color-muted)] text-slate-500">
                  Modell wählen
                  <select
                    value={selected ?? ''}
                    onChange={event =>
                      setAnswers(previous => ({
                        ...previous,
                        [item.id]: event.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-[var(--color-border)] bg-white dark:bg-slate-900 px-2 py-1 text-sm"
                    aria-label={`Modell für Bild ${item.id} wählen`}
                  >
                    <option value="">Bitte wählen</option>
                    {MODELS.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </label>
                {showResult && selected && (
                  <p
                    className={`mt-2 text-xs ${
                      isCorrect ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                    }`}
                  >
                    {isCorrect
                      ? 'Richtig zugeordnet.'
                      : `Nicht korrekt. Erwartet: ${
                          MODELS.find(model => model.id === item.correctModelId)?.label ?? item.correctModelId
                        }.`}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          type="button"
          onClick={() => setShowResult(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-area-verstehen)] hover:bg-[var(--color-accent-active)] transition-colors"
        >
          Auswertung anzeigen
        </button>
        <button
          type="button"
          onClick={() => {
            setAnswers({});
            setShowResult(false);
            setSeed(previous => previous + 1);
          }}
          className="px-4 py-2 rounded-lg text-sm border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-700"
        >
          Neu mischen
        </button>
      </div>

      {showResult && (
        <p className="mt-3 text-sm dark:text-[var(--color-secondary)] text-slate-700">
          Treffer: <span className="font-semibold">{score}</span> / {assignmentItems.length}
        </p>
      )}
    </section>
  );
}

