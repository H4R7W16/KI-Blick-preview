import { useMemo, useState } from 'react';

interface ScaleStep {
  id: string;
  label: string;
  value: number;
  explanation: string;
}

const SCALE_STEPS: ScaleStep[] = [
  {
    id: '1',
    label: '1 Bild',
    value: 1,
    explanation: 'Ein einzelnes Beispiel zeigt fast nichts über die Vielfalt eines Themas.',
  },
  {
    id: '1k',
    label: '1.000 Bilder',
    value: 1_000,
    explanation: 'Erste Muster werden sichtbar, aber viele Kontexte fehlen weiterhin.',
  },
  {
    id: '1m',
    label: '1 Million',
    value: 1_000_000,
    explanation: 'Sehr viele Muster sind enthalten, jedoch nicht automatisch ausgewogen.',
  },
  {
    id: 'laion',
    label: '5,85 Milliarden',
    value: 5_850_000_000,
    explanation: 'Dimension typischer großer Web-Datensätze wie LAION-5B.',
  },
];

function formatCompact(value: number): string {
  return new Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export default function DataScaleVisualizer() {
  const [index, setIndex] = useState(0);
  const current = SCALE_STEPS[index];

  const relativeText = useMemo(() => {
    if (current.value === 1) return 'Ausgangspunkt';
    const factor = Math.round(current.value / SCALE_STEPS[0].value);
    return `${new Intl.NumberFormat('de-DE').format(factor)}x mehr als der Startpunkt`;
  }, [current.value]);

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
      <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-2">
        Der Datenberg
      </h4>
      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-700 mb-4">
        Zoome von einem einzelnen Bild bis zu Milliarden Bild-Text-Paaren.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {SCALE_STEPS.map((step, stepIndex) => (
          <button
            key={step.id}
            type="button"
            onClick={() => setIndex(stepIndex)}
            aria-label={`Skalierung ${step.label}`}
            className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
              stepIndex === index
                ? 'border-[var(--color-area-verstehen)] text-[var(--color-area-verstehen)] bg-[var(--color-area-verstehen)]/10'
                : 'border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-700 hover:border-[var(--color-area-verstehen)]/50'
            }`}
          >
            {step.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-[var(--color-border)] p-4">
        <div className="text-xs uppercase tracking-wider dark:text-[var(--color-muted)] text-slate-500 mb-2">
          Aktuelle Größenordnung
        </div>
        <div className="text-2xl font-bold text-[var(--color-area-verstehen)] mb-1">
          {formatCompact(current.value)}
        </div>
        <div className="text-xs dark:text-[var(--color-muted)] text-slate-500 mb-3">
          {relativeText}
        </div>
        <div
          className="h-5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
          aria-label="Skalenbalken"
        >
          <div
            className="h-full bg-[var(--color-area-verstehen)] transition-all duration-500"
            style={{
              width: `${Math.max(5, ((index + 1) / SCALE_STEPS.length) * 100)}%`,
            }}
          />
        </div>
        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-700 mt-3">
          {current.explanation}
        </p>
      </div>
    </section>
  );
}

