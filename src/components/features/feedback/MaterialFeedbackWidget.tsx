import { useState } from 'react';
import { submitFeedback } from '../../../services/feedbackService';
import type { SubmitStatus } from '../../../types/feedback.types';

const USABILITY_OPTIONS = [
  { value: 'ready',       label: 'Sofort nutzbar' },
  { value: 'minor_adj',   label: 'Mit kleinen Anpassungen' },
  { value: 'inspiration', label: 'Nur als Anregung' },
  { value: 'not_usable',  label: 'Derzeit nicht nutzbar' },
];

const IMPROVEMENT_OPTIONS = [
  'Konkretere Arbeitsaufträge',
  'Lösungshinweise',
  'Zeitangaben',
  'Differenzierung',
  'Druckfreundliche Version',
];

interface Props {
  materialId: string;
  materialTitle: string;
}

export function MaterialFeedbackWidget({ materialId, materialTitle }: Props) {
  const [visible, setVisible]         = useState(false);
  const [usability, setUsability]     = useState('');
  const [improvement, setImprovement] = useState('');
  const [freetext, setFreetext]       = useState('');
  const [status, setStatus]           = useState<SubmitStatus>('idle');

  function triggerOpen() {
    setVisible(true);
    setUsability('');
    setImprovement('');
    setFreetext('');
    setStatus('idle');
  }

  async function handleSubmit() {
    setStatus('loading');
    try {
      await submitFeedback({
        channel: 'micro',
        area:    'lernen',
        unit_id: `material_${materialId}`,
        answers: {
          ...(usability   ? { usability }   : {}),
          ...(improvement ? { improvement } : {}),
        },
        role:     'lehrkraft',
        freetext: freetext.trim() || undefined,
      });
      setStatus('success');
      setTimeout(() => setVisible(false), 2000);
    } catch {
      setStatus('error');
    }
  }

  if (!visible) {
    return (
      <button
        type="button"
        onClick={triggerOpen}
        className="mt-2 text-xs dark:text-[var(--color-muted)] text-slate-400 underline hover:dark:text-[var(--color-secondary)]"
      >
        Feedback zu diesem Material geben
      </button>
    );
  }

  return (
    <div
      className="mt-3 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50 text-sm overflow-hidden"
      role="group"
      aria-label={`Feedback zu ${materialTitle}`}
    >
      {/* Header with collapse toggle */}
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Feedback einklappen"
        className="w-full flex items-center justify-between px-4 py-2.5 dark:text-[var(--color-muted)] text-slate-500 hover:dark:text-[var(--color-secondary)] hover:text-slate-700 transition-colors"
      >
        <span className="text-xs">Feedback zu diesem Material</span>
        <svg
          className="w-4 h-4 rotate-180 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className="border-t border-[var(--color-border)] p-4 space-y-3">
      {status === 'success' ? (
        <p role="status" className="text-center dark:text-[var(--color-muted)] text-slate-500">
          Danke für Ihr Feedback zum Material.
        </p>
      ) : (
        <>
          {/* F1: Nutzbarkeit */}
          <fieldset>
            <legend className="font-medium dark:text-[var(--color-primary)] text-slate-800 mb-2">
              Wie nutzbar ist dieses Material für Sie?
            </legend>
            <div className="flex flex-wrap gap-2">
              {USABILITY_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setUsability(value)}
                  className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                    usability === value
                      ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                      : 'border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:border-[var(--color-accent)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* F2: Wichtigste Ergänzung */}
          <fieldset>
            <legend className="font-medium dark:text-[var(--color-primary)] text-slate-800 mb-2">
              Was würde den Nutzen am meisten steigern?
            </legend>
            <div className="flex flex-wrap gap-2">
              {IMPROVEMENT_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setImprovement(opt)}
                  className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                    improvement === opt
                      ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                      : 'border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:border-[var(--color-accent)]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </fieldset>

          {/* F3: Optionaler Freitext */}
          <div>
            <label
              htmlFor={`mat-freetext-${materialId}`}
              className="block font-medium dark:text-[var(--color-primary)] text-slate-800 mb-1"
            >
              Optional: Welche Materialergänzung wünschen Sie sich konkret?
            </label>
            <textarea
              id={`mat-freetext-${materialId}`}
              rows={2}
              maxLength={500}
              value={freetext}
              onChange={e => setFreetext(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white px-3 py-2 text-xs dark:text-[var(--color-primary)] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] resize-none"
            />
            <p className="text-xs dark:text-[var(--color-muted)] text-slate-400 mt-0.5">
              Bitte keine Namen oder personenbezogenen Angaben eingeben.
            </p>
          </div>

          {status === 'error' && (
            <p role="alert" className="text-xs text-red-500">
              Das hat nicht geklappt. Bitte versuch es noch einmal.
            </p>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="text-xs dark:text-[var(--color-muted)] text-slate-400 hover:dark:text-[var(--color-secondary)] underline"
            >
              Überspringen
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === 'loading'}
              className="rounded-lg px-3 py-1.5 text-xs font-medium bg-[var(--color-accent)] text-white disabled:opacity-40"
            >
              {status === 'loading' ? 'Wird gesendet…' : 'Senden'}
            </button>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
