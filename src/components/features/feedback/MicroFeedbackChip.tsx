import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { submitFeedback } from '../../../services/feedbackService';
import { useFeedbackThrottle } from '../../../hooks/useFeedbackThrottle';
import { POSITIVE_OPTIONS, NEGATIVE_OPTIONS, HELPFULNESS_SCALE } from '../../../data/feedbackMicroOptions';
import type { FeedbackArea, SubmitStatus } from '../../../types/feedback.types';

interface Props {
  area:   FeedbackArea;
  unitId: string;
}

type Step = 'main' | 'followup' | 'freetext' | 'done';

const AREA_BORDER_COLOR: Record<FeedbackArea, string> = {
  verstehen: 'border-l-[var(--color-area-verstehen)]',
  entdecken: 'border-l-[var(--color-area-entdecken)]',
  einordnen: 'border-l-[var(--color-area-einordnen)]',
  lernen:    'border-l-[var(--color-area-lernen)]',
};

const AREA_ICON_COLOR: Record<FeedbackArea, string> = {
  verstehen: 'text-[var(--color-area-verstehen)]',
  entdecken: 'text-[var(--color-area-entdecken)]',
  einordnen: 'text-[var(--color-area-einordnen)]',
  lernen:    'text-[var(--color-area-lernen)]',
};

export function MicroFeedbackChip({ area, unitId }: Props) {
  const { canShowMicro, markMicroShown, markSent, markAbandoned } = useFeedbackThrottle();
  const contextId   = `micro_${area}_${unitId}`;
  const openedAtRef = useRef<number>(Date.now());

  const [visible, setVisible]               = useState<boolean>(() => canShowMicro(area));
  const [expanded, setExpanded]             = useState(false);
  const [step, setStep]                     = useState<Step>('main');
  const [helpfulness, setHelpfulness]       = useState('');
  const [followupChoice, setFollowupChoice] = useState('');
  const [freetext, setFreetext]             = useState('');
  const [status, setStatus]                 = useState<SubmitStatus>('idle');

  useEffect(() => {
    if (expanded) {
      openedAtRef.current = Date.now();
      markMicroShown(area);
    }
  }, [expanded, area, markMicroShown]);

  const handleClose = useCallback(() => {
    if (step !== 'done') markAbandoned(contextId, openedAtRef.current);
    setVisible(false);
  }, [step, contextId, markAbandoned]);

  if (!visible) return null;

  const isPositive      = helpfulness !== '' && parseInt(helpfulness) >= 3;
  const followupOptions = isPositive ? POSITIVE_OPTIONS[area] : NEGATIVE_OPTIONS;
  const followupQuestion = isPositive ? 'Was war am nützlichsten?' : 'Was war das Hauptproblem?';

  async function handleSend() {
    setStatus('loading');
    try {
      await submitFeedback({
        channel: 'micro',
        area,
        unit_id: unitId,
        answers: {
          helpfulness,
          ...(followupChoice ? { followup: followupChoice } : {}),
        },
        freetext: freetext.trim() || undefined,
      });
      markSent(contextId);
      setStatus('success');
      setStep('done');
      setTimeout(() => setVisible(false), 2000);
    } catch {
      setStatus('error');
    }
  }

  return (
    <motion.div
      layout
      className={`mt-4 rounded-xl border border-[var(--color-border)] border-l-2 ${AREA_BORDER_COLOR[area]} dark:bg-[var(--color-surface)] bg-slate-50 text-sm overflow-hidden`}
      role="region"
      aria-label="Feedback"
    >
      {/* Phase 1 – Trigger */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 flex-1 text-left dark:text-[var(--color-muted)] text-slate-500 hover:dark:text-[var(--color-secondary)] hover:text-slate-700 transition-colors"
          aria-expanded={expanded}
        >
          <svg
            className={`w-4 h-4 shrink-0 ${AREA_ICON_COLOR[area]}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
          </svg>
          <span>Kurzes Feedback zu diesem Abschnitt?</span>
        </button>
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          aria-label={expanded ? 'Feedback einklappen' : 'Feedback ausklappen'}
          aria-expanded={expanded}
          className="shrink-0 rounded p-1 dark:text-[var(--color-muted)] text-slate-400 hover:dark:text-[var(--color-secondary)] hover:text-slate-600 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Phase 2 – Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="border-t border-[var(--color-border)] px-4 pb-4 pt-3 space-y-3"
          >
            {step === 'done' ? (
              <p role="status" className="text-center dark:text-[var(--color-muted)] text-slate-500 py-2">
                Danke – das hilft uns beim nächsten Update.
              </p>
            ) : (
              <>
                {/* A1: Hauptfrage */}
                {step === 'main' && (
                  <div className="space-y-2">
                    <p className="dark:text-[var(--color-secondary)] text-slate-600">
                      Wie hilfreich war das für dich?
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {HELPFULNESS_SCALE.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setHelpfulness(value);
                            setStep('followup');
                          }}
                          className="rounded-full px-2.5 py-1 text-xs border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* A2/A3: Nachfrage */}
                {step === 'followup' && (
                  <div className="space-y-2">
                    <p className="dark:text-[var(--color-secondary)] text-slate-600">
                      {followupQuestion}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {followupOptions.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFollowupChoice(opt);
                            setStep('freetext');
                          }}
                          className={`rounded-full px-2.5 py-1 text-xs border transition-colors ${
                            followupChoice === opt
                              ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                              : 'border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:border-[var(--color-accent)]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* A4: Optionaler Freitext + Absenden */}
                {step === 'freetext' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      maxLength={500}
                      placeholder="Optional: Was sollte besser werden? (Keine Namen eingeben)"
                      value={freetext}
                      onChange={e => setFreetext(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                      className="w-full rounded-lg border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white px-3 py-1.5 text-xs dark:text-[var(--color-primary)] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    />
                    {status === 'error' && (
                      <p role="alert" className="text-xs text-red-500">
                        Das hat nicht geklappt. Bitte versuch es noch einmal.
                      </p>
                    )}
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg px-3 py-1.5 text-xs dark:text-[var(--color-muted)] text-slate-400 hover:dark:text-[var(--color-secondary)] hover:text-slate-600 transition-colors"
                      >
                        Ohne Feedback schließen
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSend()}
                        disabled={status === 'loading'}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium bg-[var(--color-accent)] text-white disabled:opacity-40 transition-opacity"
                      >
                        {status === 'loading' ? '…' : 'Absenden'}
                      </button>
                    </div>
                  </div>
                )}

                {/* DSGVO-Hinweis */}
                <p className="text-xs dark:text-[var(--color-muted)] text-slate-400">
                  Freiwillig · Keine personenbezogenen Daten
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
