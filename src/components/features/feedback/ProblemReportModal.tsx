import { useEffect, useState } from 'react';
import Modal from '../../ui/Modal';
import { submitFeedback } from '../../../services/feedbackService';
import type { FeedbackArea, SubmitStatus } from '../../../types/feedback.types';

type ProblemType =
  | 'tech_error'
  | 'broken_link'
  | 'content_unclear'
  | 'privacy'
  | 'material_request'
  | 'idea';

const PROBLEM_LABELS: Record<ProblemType, string> = {
  tech_error: 'Technischer Fehler',
  broken_link: 'Bild oder Link funktioniert nicht',
  content_unclear: 'Inhalt unklar oder falsch',
  privacy: 'Datenschutzfrage',
  material_request: 'Materialwunsch',
  idea: 'Verbesserungsidee',
};

const SEVERITY_LABELS = [
  { value: 'blocking', label: 'Ich kann nicht weitermachen' },
  { value: 'annoying', label: 'Es stört deutlich' },
  { value: 'minor', label: 'Es ist ein kleiner Fehler' },
] as const;

interface ProblemReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentArea: FeedbackArea;
  currentUnitId: string;
}

export function ProblemReportModal({
  isOpen,
  onClose,
  currentArea,
  currentUnitId,
}: ProblemReportModalProps) {
  const [problemType, setProblemType] = useState<ProblemType | ''>('');
  const [severity, setSeverity] = useState('');
  const [freetext, setFreetext] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setProblemType('');
    setSeverity('');
    setFreetext('');
    setStatus('idle');
  }, [isOpen]);

  const showSeverity = problemType === 'tech_error' || problemType === 'broken_link';
  const canSubmit = problemType !== '' && freetext.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setStatus('loading');

    try {
      await submitFeedback({
        channel: 'problem',
        area: currentArea,
        unit_id: currentUnitId,
        answers: {
          problemType,
          ...(showSeverity && severity ? { severity } : {}),
        },
        freetext: freetext.trim(),
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const successMessage =
    problemType === 'idea'
      ? 'Danke für die Idee – wir freuen uns über Input.'
      : 'Danke. Wir schauen uns das an.';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId="problem-report-title"
      className="max-w-lg rounded-2xl"
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id="problem-report-title"
              className="text-base font-semibold dark:text-[var(--color-primary)] text-slate-900"
            >
              Problem melden · Idee senden
            </h2>
            <p className="mt-1 text-sm dark:text-[var(--color-secondary)] text-slate-600">
              Hilf uns, Fehler schneller zu finden oder neue Ideen zu sammeln.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-lg p-1.5 dark:text-[var(--color-muted)] text-slate-400 hover:dark:text-[var(--color-primary)] hover:text-slate-700 transition-colors"
          >
            <svg className="h-5 w-5 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {status === 'success' ? (
          <div className="py-6 text-center">
            <p
              role="status"
              className="text-sm dark:text-[var(--color-secondary)] text-slate-600"
            >
              {successMessage}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-lg px-4 py-2 text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Schließen
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium dark:text-[var(--color-primary)] text-slate-800">
                Worum geht es?
              </legend>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(PROBLEM_LABELS) as [ProblemType, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setProblemType(value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      problemType === value
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                        : 'border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:border-[var(--color-accent)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            {showSeverity && (
              <fieldset>
                <legend className="mb-2 text-sm font-medium dark:text-[var(--color-primary)] text-slate-800">
                  Wie stark hindert dich das Problem?
                </legend>
                <div className="space-y-1.5">
                  {SEVERITY_LABELS.map(({ value, label }) => (
                    <label key={value} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="severity"
                        value={value}
                        checked={severity === value}
                        onChange={() => setSeverity(value)}
                        className="accent-[var(--color-accent)]"
                      />
                      <span className="text-sm dark:text-[var(--color-secondary)] text-slate-600">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div>
              <label
                htmlFor="problem-report-freetext"
                className="mb-1 block text-sm font-medium dark:text-[var(--color-primary)] text-slate-800"
              >
                Was genau ist passiert – oder was schlägst du vor?
              </label>
              <textarea
                id="problem-report-freetext"
                rows={4}
                maxLength={500}
                value={freetext}
                onChange={event => setFreetext(event.target.value)}
                className="w-full resize-none rounded-lg border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-slate-50 px-3 py-2 text-sm dark:text-[var(--color-primary)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-xs dark:text-[var(--color-muted)] text-slate-400">
                  Bitte keine Namen, Klassen oder andere personenbezogene Daten angeben.
                </p>
                <span className="text-xs dark:text-[var(--color-muted)] text-slate-400">
                  {freetext.length}/500
                </span>
              </div>
            </div>

            <p className="text-xs dark:text-[var(--color-muted)] text-slate-400">
              Dein Feedback ist freiwillig. Gespeichert werden Zeitpunkt, Bereich und deine Antworten
              – keine Namen und keine personenbezogenen Daten.
            </p>

            {status === 'error' && (
              <p role="alert" className="text-xs text-red-500">
                Das hat leider nicht geklappt. Bitte versuch es noch einmal oder schließe das Fenster.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm dark:text-[var(--color-secondary)] text-slate-600 hover:dark:text-[var(--color-primary)] hover:text-slate-800 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!canSubmit || status === 'loading'}
                className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                {status === 'loading' ? 'Wird gesendet…' : 'Senden'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
