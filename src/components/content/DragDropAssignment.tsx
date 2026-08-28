import { useState } from 'react';
import { Link } from 'react-router-dom';

interface AssignmentItem {
  id: string;
  statement: string;
  correctBucket: string;
  feedback: string;
  kiPercent?: number;
  realityPercent?: number;
  entdeckenLink?: string;
}

interface DragDropAssignmentProps {
  items?: AssignmentItem[];
  bucketLabels?: string[];
  preamble?: string;
}

const DEFAULT_ITEMS: AssignmentItem[] = [
  {
    id: 'a1',
    statement: 'Die KI greift für jedes Bild auf eine Web-Suche zu.',
    correctBucket: 'stimmt nicht',
    feedback: 'Das Modell erzeugt Bilder aus intern gelernten Mustern.',
  },
  {
    id: 'a2',
    statement: 'Trainingsdaten beeinflussen die Bildausgabe direkt.',
    correctBucket: 'stimmt',
    feedback: 'Richtig: Datenmuster prägen die Wahrscheinlichkeit visueller Merkmale.',
  },
  {
    id: 'a3',
    statement: 'Mehr Daten lösen Bias automatisch.',
    correctBucket: 'kommt drauf an',
    feedback: 'Es kommt auf Vielfalt, Kuratierung und Bewertung der Daten an.',
  },
];

const DEFAULT_BUCKETS = ['stimmt', 'stimmt nicht', 'kommt drauf an'];

function MiniBarChart({ kiPercent, realityPercent }: { kiPercent: number; realityPercent: number }) {
  return (
    <div className="mb-3 space-y-1.5">
      <p className="text-xs dark:text-[var(--color-muted)] text-slate-500">Anteil weiblich dargestellt:</p>
      <div className="flex items-center gap-2 text-xs">
        <span className="w-16 dark:text-[var(--color-muted)] text-slate-500 shrink-0">KI</span>
        <div className="flex-1 bg-[var(--color-border)] rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-area-einordnen)]"
            style={{ width: `${kiPercent}%` }}
          />
        </div>
        <span className="w-8 text-right dark:text-[var(--color-secondary)] text-slate-700 tabular-nums font-medium">
          {kiPercent}%
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="w-16 dark:text-[var(--color-muted)] text-slate-500 shrink-0">Realität</span>
        <div className="flex-1 bg-[var(--color-border)] rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-accent)]"
            style={{ width: `${realityPercent}%` }}
          />
        </div>
        <span className="w-8 text-right dark:text-[var(--color-secondary)] text-slate-700 tabular-nums font-medium">
          {realityPercent}%
        </span>
      </div>
    </div>
  );
}

export default function DragDropAssignment({ items = DEFAULT_ITEMS, bucketLabels, preamble }: DragDropAssignmentProps) {
  const buckets = bucketLabels ?? DEFAULT_BUCKETS;
  const [answers, setAnswers] = useState<Record<string, string | undefined>>({});

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
      <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-2">
        Zuordnungsübung
      </h4>
      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-700 mb-4">
        Ordne jede Aussage einer Kategorie zu.
      </p>

      {preamble && (
        <div className="mb-5 flex gap-2.5 rounded-lg border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/8 p-3">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-700">{preamble}</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map(item => {
          const selected = answers[item.id];
          const isCorrect = selected ? selected === item.correctBucket : false;

          return (
            <div key={item.id} className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="text-sm dark:text-[var(--color-primary)] text-slate-900 mb-3">
                {item.statement}
              </p>

              {item.kiPercent !== undefined && item.realityPercent !== undefined && (
                <MiniBarChart kiPercent={item.kiPercent} realityPercent={item.realityPercent} />
              )}

              <div className="flex flex-wrap gap-2 mb-2">
                {buckets.map(bucket => (
                  <button
                    key={bucket}
                    type="button"
                    onClick={() =>
                      setAnswers(previous => ({
                        ...previous,
                        [item.id]: bucket,
                      }))
                    }
                    className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
                      selected === bucket
                        ? 'border-[var(--color-area-verstehen)] text-[var(--color-area-verstehen)] bg-[var(--color-area-verstehen)]/10'
                        : 'border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-700'
                    }`}
                    aria-label={`Aussage ${item.id} als ${bucket} zuordnen`}
                  >
                    {bucket}
                  </button>
                ))}
              </div>

              {selected && (
                <p
                  className={`text-xs mb-2 ${
                    isCorrect
                      ? 'text-[var(--color-success)]'
                      : 'text-[var(--color-error)]'
                  }`}
                >
                  {isCorrect ? 'Richtig. ' : `Nicht ganz. Korrekt wäre: ${item.correctBucket}. `}
                  {item.feedback}
                </p>
              )}

              {item.entdeckenLink && (
                <Link
                  to={item.entdeckenLink}
                  className="inline-flex items-center gap-1 text-xs text-[var(--color-area-entdecken)] hover:underline"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Bilder im Entdecken-Bereich ansehen
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
