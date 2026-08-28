import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { submitFeedback } from '../../../services/feedbackService';
import { useFeedbackThrottle } from '../../../hooks/useFeedbackThrottle';
import { useSavedRole } from '../../../hooks/useSavedRole';
import type { FeedbackArea, FeedbackRole, SubmitStatus } from '../../../types/feedback.types';

// --- Question definitions ---

const B_QUESTIONS = [
  {
    key: 'followability',
    question: 'Wie gut konntest du dem Lernpfad folgen?',
    options: ['Sehr gut', 'Eher gut', 'Teilweise', 'Eher schwer'],
  },
  {
    key: 'sequence',
    question: 'Wie sinnvoll war die Abfolge der Schritte?',
    options: ['Sehr sinnvoll', 'Eher sinnvoll', 'Teils/teils', 'Eher verwirrend'],
  },
  {
    key: 'relevance',
    question: 'Wie relevant war der Lernpfad für dich?',
    options: ['Sehr relevant', 'Eher relevant', 'Teilweise', 'Nicht relevant'],
  },
  {
    key: 'priority',
    question: 'Wenn wir nur eine Sache verbessern könnten – was wäre am wichtigsten?',
    options: ['Kürzere Texte', 'Klarere Aufgaben', 'Bessere Navigation', 'Mehr Beispiele', 'Mehr Unterrichtsmaterial'],
  },
];

const ROLE_OPTIONS: { value: FeedbackRole | 'skip'; label: string }[] = [
  { value: 'lehrkraft', label: 'Als Lehrkraft' },
  { value: 'lernende',  label: 'Als Schüler:in / Lernende:r' },
  { value: 'other',     label: 'Als allgemein interessierte Person' },
  { value: 'skip',      label: 'Möchte ich nicht angeben' },
];

const C_QUESTIONS = [
  {
    key: 'teachability',
    question: 'Wie gut lässt sich dieser Lernpfad im Unterricht einsetzen?',
    options: ['Sofort einsetzbar', 'Mit kleinen Anpassungen', 'Nur mit deutlichem Aufwand', 'Derzeit nicht einsetzbar'],
  },
  {
    key: 'barrier',
    question: 'Was fehlt oder stört am stärksten?',
    options: ['Klarere Zeitstruktur', 'Einfachere Aufgaben', 'Mehr Differenzierung', 'Mehr Downloadmaterial', 'Klarere Datenschutzinfos'],
  },
  {
    key: 'level',
    question: 'Optional: Für welche Schulstufe oder welches Fach denken Sie mit?',
    options: ['Sek I', 'Sek II', 'Berufliche Bildung', 'Fächerübergreifend'],
    optional: true,
  },
];

const D_QUESTIONS = [
  {
    key: 'helped',
    question: 'Was hat dir am meisten geholfen?',
    options: ['Die Bilder und Vergleiche', 'Die Erklärungen', 'Die Aufgaben', 'Die Reihenfolge'],
  },
  {
    key: 'hardest',
    question: 'Was war am schwierigsten?',
    options: ['Zu viele Texte', 'Unklare Begriffe', 'Ich wusste nicht, was ich tun soll', 'Es war zu lang'],
  },
  {
    key: 'reflection',
    question: 'Hat dich der Lernpfad zum Nachdenken gebracht?',
    options: ['Ja, deutlich', 'Eher ja', 'Teilweise', 'Eher nein'],
  },
];

// --- Component ---

interface Props {
  isOpen:  boolean;
  onClose: () => void;
  pathId:  string;
  area:    FeedbackArea;
}

type FlowStep = 'b' | 'role' | 'c' | 'd' | 'done';

export function CompletionFeedbackSheet({ isOpen, onClose, pathId, area }: Props) {
  const { canShow, markSent, markAbandoned } = useFeedbackThrottle();
  const { role: savedRole, setRole } = useSavedRole();
  const contextId   = `completion_${pathId}`;
  const openedAtRef = useRef<number>(0);

  // Index within the current question list (b, c, or d)
  const [questionIndex, setQuestionIndex] = useState(0);
  const [flowStep, setFlowStep]           = useState<FlowStep>('b');
  const [bAnswers, setBAnswers]           = useState<Record<string, string>>({});
  const [roleAnswers, setRoleAnswers]     = useState<Record<string, string>>({});
  const [freetextB, setFreetextB]         = useState('');
  const [freetextRole, setFreetextRole]   = useState('');
  const [roleChoice, setRoleChoice]       = useState<FeedbackRole | 'skip' | ''>('');
  const [status, setStatus]               = useState<SubmitStatus>('idle');

  useEffect(() => {
    if (isOpen) openedAtRef.current = Date.now();
  }, [isOpen]);

  if (!isOpen || !canShow(contextId)) return null;

  // --- Helpers ---

  function close() {
    markAbandoned(contextId, openedAtRef.current);
    onClose();
  }

  function getActiveQuestions(): typeof B_QUESTIONS | typeof C_QUESTIONS | typeof D_QUESTIONS {
    if (flowStep === 'c') return C_QUESTIONS;
    if (flowStep === 'd') return D_QUESTIONS;
    return B_QUESTIONS;
  }

  // Progress bar: separate counter per phase to avoid backwards jumps
  function computeProgress(): { current: number; total: number; label: string; phase: number } {
    if (flowStep === 'b') {
      return { current: questionIndex + 1, total: B_QUESTIONS.length, label: 'Lernpfad-Feedback', phase: 0 };
    }
    if (flowStep === 'role') {
      return { current: 1, total: 1, label: 'Deine Perspektive', phase: 1 };
    }
    const roleSet = flowStep === 'c' ? C_QUESTIONS : D_QUESTIONS;
    const label = flowStep === 'c' ? 'Unterrichts-Feedback' : 'Dein Eindruck';
    return { current: questionIndex + 1, total: roleSet.length, label, phase: 2 };
  }

  // --- B-flow ---

  function handleBAnswer(key: string, value: string) {
    const updated = { ...bAnswers, [key]: value };
    setBAnswers(updated);
    const nextIndex = questionIndex + 1;
    if (nextIndex < B_QUESTIONS.length) {
      // Small delay so the selection is visible before advancing
      setTimeout(() => setQuestionIndex(nextIndex), 180);
    }
    // Last B question answered – show freetext/proceed button (stay on same index)
  }

  function proceedFromB() {
    if (savedRole === null) {
      setFlowStep('role');
    } else if (savedRole === 'lehrkraft') {
      setQuestionIndex(0);
      setFlowStep('c');
    } else if (savedRole === 'lernende') {
      setQuestionIndex(0);
      setFlowStep('d');
    } else {
      // 'other' – no role-specific questions
      void submitAll(savedRole, freetextB);
    }
  }

  // --- Role question ---

  function handleRoleChoice(chosen: FeedbackRole | 'skip') {
    const actualRole: FeedbackRole = chosen === 'skip' ? null : chosen;
    if (actualRole) setRole(actualRole);
    setRoleChoice(chosen);
    if (actualRole === 'lehrkraft') {
      setQuestionIndex(0);
      setFlowStep('c');
    } else if (actualRole === 'lernende') {
      setQuestionIndex(0);
      setFlowStep('d');
    } else {
      void submitAll(actualRole, freetextB);
    }
  }

  // --- C/D-flow ---

  function handleRoleAnswer(key: string, value: string) {
    const updated = { ...roleAnswers, [key]: value };
    setRoleAnswers(updated);
    const questions = getActiveQuestions();
    const nextIndex = questionIndex + 1;
    if (nextIndex < questions.length) {
      setTimeout(() => setQuestionIndex(nextIndex), 180);
    }
    // Last question – stay; freetext + submit button becomes visible
  }

  function proceedFromRoleSet() {
    const role: FeedbackRole =
      roleChoice === 'skip' ? null : (roleChoice as FeedbackRole) ?? savedRole;
    void submitAll(role, freetextB + (freetextRole ? `\n${freetextRole}` : ''));
  }

  // --- Submit ---

  async function submitAll(role: FeedbackRole, freetextVal: string) {
    setStatus('loading');
    try {
      await submitFeedback({
        channel: 'completion',
        area,
        unit_id: pathId,
        answers: { ...bAnswers, ...roleAnswers },
        role,
        freetext: freetextVal.trim() || undefined,
      });
      markSent(contextId);
      setStatus('success');
      setFlowStep('done');
      setTimeout(onClose, 2500);
    } catch {
      setStatus('error');
    }
  }

  // --- Derived values ---

  const activeQuestions = getActiveQuestions();
  const currentQuestion = flowStep !== 'role' && flowStep !== 'done'
    ? activeQuestions[questionIndex]
    : null;
  const allBAnswered    = B_QUESTIONS.every(q => q.key in bAnswers);
  const showBProceed    = allBAnswered;
  const allRoleAnswered = flowStep !== 'b' && flowStep !== 'role' && flowStep !== 'done'
    ? activeQuestions.filter(q => !('optional' in q && q.optional)).every(q => q.key in roleAnswers)
    : false;
  const showRoleProceed     = (flowStep === 'c' || flowStep === 'd') && allRoleAnswered;
  const isSieAnrede         = roleChoice === 'lehrkraft' || savedRole === 'lehrkraft';
  const pronoun             = isSieAnrede ? 'Sie' : 'du';
  const isOptionalQuestion  = currentQuestion !== null && 'optional' in currentQuestion && currentQuestion.optional === true;

  const { current: progressCurrent, total: progressTotal, label: progressLabel, phase: progressPhase } = computeProgress();

  // Map questions with Sie/du replacement for C set
  function localizeQuestion(q: typeof C_QUESTIONS[number] | typeof B_QUESTIONS[number] | typeof D_QUESTIONS[number]): string {
    if (!isSieAnrede) return q.question;
    return q.question
      .replace(/\bdu\b/g, 'Sie')
      .replace(/\bdich\b/g, 'Sie')
      .replace(/\bdein\b/gi, 'Ihr')
      .replace(/\bdeiner\b/gi, 'Ihrer')
      .replace(/\bdir\b/g, 'Ihnen');
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={close}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-lg w-full rounded-t-2xl md:rounded-2xl dark:bg-[var(--color-surface)] bg-white p-6 shadow-2xl max-h-[90vh] md:max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="completion-sheet-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2
                id="completion-sheet-title"
                className="text-base font-semibold dark:text-[var(--color-primary)] text-slate-900"
              >
                {flowStep === 'done' ? 'Danke!' : 'Feedback zum Lernpfad'}
              </h2>
              <button
                onClick={close}
                aria-label="Schließen"
                className="rounded-lg p-1.5 dark:text-[var(--color-muted)] text-slate-400 hover:dark:bg-[var(--color-card)] hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Progress bar (not shown on done) */}
            {flowStep !== 'done' && (
              <div className="mb-5">
                <div className="flex justify-between text-[11px] dark:text-[var(--color-muted)] text-slate-400 mb-1.5">
                  <span>{progressLabel}</span>
                  <span>{progressCurrent}/{progressTotal}</span>
                </div>
                <div className="h-1 rounded-full dark:bg-[var(--color-card)] bg-slate-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[var(--color-area-lernen)]"
                    initial={false}
                    animate={{ width: `${(progressCurrent / progressTotal) * 100}%` }}
                    transition={{ duration: 0.25 }}
                  />
                </div>
                {/* Phase indicators */}
                <div className="flex justify-center gap-1.5 mt-2" aria-hidden="true">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className={`inline-block w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                        i <= progressPhase
                          ? 'bg-[var(--color-area-lernen)]'
                          : 'dark:bg-[var(--color-card)] bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ---- Done state ---- */}
            {flowStep === 'done' && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[var(--color-success)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p role="status" className="text-sm dark:text-[var(--color-secondary)] text-slate-600">
                  Danke für dein Feedback zum Lernpfad.
                </p>
              </div>
            )}

            {/* ---- B / C / D questions ---- */}
            {(flowStep === 'b' || flowStep === 'c' || flowStep === 'd') && currentQuestion && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${flowStep}-${questionIndex}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18 }}
                >
                  <p className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900 mb-3">
                    {localizeQuestion(currentQuestion)}
                    {isOptionalQuestion && (
                      <span className="ml-1.5 text-xs font-normal dark:text-[var(--color-muted)] text-slate-400">
                        (optional)
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.options.map(option => {
                      const isSelected =
                        flowStep === 'b'
                          ? bAnswers[currentQuestion.key] === option
                          : roleAnswers[currentQuestion.key] === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            flowStep === 'b'
                              ? handleBAnswer(currentQuestion.key, option)
                              : handleRoleAnswer(currentQuestion.key, option)
                          }
                          className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                            isSelected
                              ? 'border-[var(--color-area-lernen)] bg-[var(--color-area-lernen)]/15 dark:text-[var(--color-primary)] text-slate-900 font-medium'
                              : 'border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-700 hover:border-[var(--color-area-lernen)]/50 hover:dark:bg-[var(--color-card)] hover:bg-slate-50'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Freetext for B (shown after all B answered) */}
            {flowStep === 'b' && showBProceed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <label className="block text-xs dark:text-[var(--color-muted)] text-slate-500 mb-1.5">
                  Noch etwas? <span className="italic">(optional)</span>
                </label>
                <textarea
                  value={freetextB}
                  onChange={e => setFreetextB(e.target.value)}
                  rows={2}
                  placeholder={`Was hat ${pronoun === 'Sie' ? 'Ihnen' : 'dir'} besonders gut oder weniger gut gefallen?`}
                  className="w-full text-sm rounded-lg border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-slate-50 dark:text-[var(--color-primary)] text-slate-900 px-3 py-2 placeholder:text-[var(--color-muted)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-area-lernen)]"
                />
                <button
                  type="button"
                  onClick={proceedFromB}
                  disabled={status === 'loading'}
                  className="mt-3 w-full py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-area-lernen)] hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {status === 'loading' ? 'Wird gesendet …' : 'Weiter'}
                </button>
              </motion.div>
            )}

            {/* ---- Role question ---- */}
            {flowStep === 'role' && (
              <div>
                <p className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900 mb-3">
                  Mit welcher Perspektive bist du hier?
                </p>
                <div className="flex flex-col gap-2">
                  {ROLE_OPTIONS.map(opt => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => handleRoleChoice(opt.value)}
                      className="px-4 py-2.5 rounded-xl text-sm border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-700 hover:border-[var(--color-area-lernen)]/50 hover:dark:bg-[var(--color-card)] hover:bg-slate-50 text-left transition-all"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Freetext + submit for C/D (shown after required role questions answered) */}
            {(flowStep === 'c' || flowStep === 'd') && showRoleProceed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <label className="block text-xs dark:text-[var(--color-muted)] text-slate-500 mb-1.5">
                  Noch etwas? <span className="italic">(optional)</span>
                </label>
                <textarea
                  value={freetextRole}
                  onChange={e => setFreetextRole(e.target.value)}
                  rows={2}
                  placeholder={isSieAnrede ? 'Ihre Anmerkungen …' : 'Deine Anmerkungen …'}
                  className="w-full text-sm rounded-lg border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-slate-50 dark:text-[var(--color-primary)] text-slate-900 px-3 py-2 placeholder:text-[var(--color-muted)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-area-lernen)]"
                />
                <button
                  type="button"
                  onClick={proceedFromRoleSet}
                  disabled={status === 'loading'}
                  className="mt-3 w-full py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-area-lernen)] hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {status === 'loading' ? 'Wird gesendet …' : 'Feedback absenden'}
                </button>
              </motion.div>
            )}

            {/* Error */}
            {status === 'error' && (
              <p role="alert" className="mt-3 text-xs text-red-500 text-center">
                Das hat leider nicht geklappt. Bitte versuch es noch einmal oder schließe das Fenster.
              </p>
            )}

            {/* Privacy note */}
            {flowStep !== 'done' && (
              <p className="mt-5 text-[11px] dark:text-[var(--color-muted)] text-slate-400 leading-relaxed">
                Dein Feedback ist freiwillig. Gespeichert werden: Zeitpunkt, Bereich und deine Antworten –
                keine Namen, keine Klassen, keine personenbezogenen Daten.
              </p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
