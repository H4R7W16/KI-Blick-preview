import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LEARNING_PATH_CHECKOUT_MIN_LENGTH } from '../constants/learningPath';
import { useLearningPath } from '../contexts/LearningPathContext';
import { AreaProvider } from '../contexts/AreaContext';
import { getPathById } from '../data/learningPaths';
import { getBadgeById } from '../data/badges';
import { getSubjectBySlug } from '../data/subjects';
import type { TaskData } from '../types/knowledge.types';

const PREVIEW_MAX_LENGTH = 220;
const CONFETTI_COLORS = ['#10B981', '#0EA5E9', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

function compact(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function preview(value: string): string {
  const normalized = compact(value);
  if (normalized.length <= PREVIEW_MAX_LENGTH) return normalized;
  return `${normalized.slice(0, PREVIEW_MAX_LENGTH - 1)}...`;
}

function buildTaskPreview(data: TaskData | undefined): string {
  if (!data) return '';
  const parts: string[] = [];
  if (data.selectedOption) {
    const subject = getSubjectBySlug(data.selectedOption);
    parts.push(`Fach: ${subject?.label ?? data.selectedOption}`);
  }
  if (typeof data.text === 'string' && data.text.trim().length > 0) parts.push(data.text);
  if (data.fields) {
    Object.entries(data.fields).forEach(([key, value]) => {
      if (key === 'transfer' || !value.trim()) return;
      parts.push(`${key}: ${value}`);
    });
  }
  return preview(parts.join(' | '));
}

// --- Confetti ---

function ConfettiOverlay() {
  const particles = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2.5 + Math.random() * 2,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 8,
        isCircle: Math.random() > 0.5,
      })),
    []
  );

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-30px) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: '-30px',
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.isCircle ? '50%' : '2px',
              animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// --- Success screen ---

interface SuccessScreenProps {
  pathTitle: string;
  subjectLabel: string | null;
  stepCount: number;
  completedCount: number;
  badgeId?: string;
  onNavigate: () => void;
  reduceMotion: boolean | null;
}

function SuccessScreen({ pathTitle, subjectLabel, stepCount, completedCount, badgeId, onNavigate, reduceMotion }: SuccessScreenProps) {
  const badge = badgeId ? getBadgeById(badgeId) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {!reduceMotion && <ConfettiOverlay />}
      <motion.div
        initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
        animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      >
        {badge ? (
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 text-white text-2xl font-bold mx-auto shadow-lg"
            style={{ backgroundColor: badge.color }}
          >
            {badge.shortLabel}
          </div>
        ) : (
          <div className="text-6xl mb-6">🏆</div>
        )}

        <p className="text-xs uppercase tracking-widest font-semibold text-[var(--color-area-lernen)] mb-2">
          Lernpfad abgeschlossen
        </p>
        <h1 className="text-3xl md:text-4xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-3">
          {badge?.title ?? 'Glückwunsch!'}
        </h1>
        <p className="dark:text-[var(--color-secondary)] text-slate-600 mb-2">
          Du hast den Lernpfad <strong>{pathTitle}</strong> abgeschlossen
          {subjectLabel ? ` – Fachfokus: ${subjectLabel}` : ''}.
        </p>
        <p className="text-sm dark:text-[var(--color-muted)] text-slate-500 mb-10">
          {completedCount} von {stepCount} Schritten gemeistert.
        </p>

        <button
          type="button"
          onClick={onNavigate}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-[var(--color-area-lernen)] transition-colors text-base font-medium"
        >
          Zur Lernpfad-Übersicht
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </motion.div>
    </div>
  );
}

// --- Main page ---

const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3 },
  }),
};

function LearningPathCheckoutPageContent() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { pathId, stepNumber } = useParams<{ pathId: string; stepNumber: string }>();
  const { activePath, currentStep, pathProgress, getTaskData, saveTaskData, prevStep, nextStep } =
    useLearningPath();

  const parsedStepNumber = Number(stepNumber);
  const pathFromRoute = pathId ? getPathById(pathId) : undefined;

  const [debriefingText, setDebriefingText] = useState('');
  const [transferText, setTransferText] = useState('');
  const [finished, setFinished] = useState(false);
  const initializedStepRef = useRef<number | null>(null);

  const step = activePath?.steps.find(item => item.stepNumber === parsedStepNumber);

  useEffect(() => {
    if (!pathId || !pathFromRoute) { navigate('/lernen', { replace: true }); return; }
    if (!activePath || activePath.id !== pathId) { navigate(`/lernen/${pathId}`, { replace: true }); return; }
    if (!Number.isFinite(parsedStepNumber) || parsedStepNumber < 1) { navigate(`/lernen/${pathId}`, { replace: true }); return; }
    if (!step || step.area !== 'abschluss') { navigate(`/lernen/${pathId}`, { replace: true }); return; }
    if (parsedStepNumber > currentStep) {
      // Only redirect if genuinely unreachable — same reasoning as TaskPage.
      const prerequisiteCompleted =
        parsedStepNumber <= 1 ||
        (pathProgress?.completedSteps.includes(parsedStepNumber - 1) ?? false);
      if (!prerequisiteCompleted) {
        navigate(`/lernen/${pathId}`, { replace: true });
      }
    }
  }, [activePath, currentStep, navigate, parsedStepNumber, pathFromRoute, pathId, pathProgress, step]);

  useEffect(() => {
    if (!step || step.area !== 'abschluss') return;
    if (initializedStepRef.current === parsedStepNumber) return;
    initializedStepRef.current = parsedStepNumber;
    const saved = getTaskData(parsedStepNumber);
    setDebriefingText(saved?.text ?? '');
    setTransferText(saved?.fields?.['transfer'] ?? '');
  }, [getTaskData, parsedStepNumber, step]);

  const subjectLabel = useMemo(() => {
    const slug = pathProgress?.selectedSubject;
    if (!slug) return null;
    return getSubjectBySlug(slug)?.label ?? slug;
  }, [pathProgress?.selectedSubject]);

  const summaryItems = useMemo(() => {
    if (!activePath || !pathProgress) return [];
    return activePath.steps
      .filter(item => item.stepNumber < parsedStepNumber && item.area === 'aufgabe')
      .map(item => ({
        stepNumber: item.stepNumber,
        title: item.taskConfig?.title ?? `Aufgabe ${item.stepNumber}`,
        text: buildTaskPreview(pathProgress.taskData[item.stepNumber]),
      }))
      .filter(item => item.text.length > 0);
  }, [activePath, parsedStepNumber, pathProgress]);

  if (!activePath || !step || step.area !== 'abschluss') return null;

  const debriefingLength = debriefingText.trim().length;
  const canFinish = debriefingLength >= LEARNING_PATH_CHECKOUT_MIN_LENGTH;
  const completedCount = pathProgress?.completedSteps.length ?? 0;
  const isFirstStep = parsedStepNumber <= 1;
  const { leitfrage, kompetenzen, debriefingPrompt, transferPrompt } = activePath;

  const handleSave = (nextDebriefing: string, nextTransfer: string) => {
    saveTaskData(parsedStepNumber, { text: nextDebriefing, fields: { transfer: nextTransfer } });
  };

  const handleFinish = () => {
    if (!canFinish) return;
    handleSave(debriefingText, transferText);
    setFinished(true);
  };

  if (finished) {
    return (
      <SuccessScreen
        pathTitle={activePath.title}
        subjectLabel={subjectLabel}
        stepCount={activePath.steps.length}
        completedCount={completedCount}
        badgeId={activePath.badgeId}
        reduceMotion={reduceMotion ?? false}
        onNavigate={() => nextStep({ force: true })}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <Link
        to={`/lernen/${activePath.id}`}
        className="inline-flex items-center gap-2 text-sm no-underline hover:underline mb-6 text-[var(--color-area-lernen)]"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Lernpfad
      </Link>

      <motion.p
        custom={0}
        variants={SECTION_VARIANTS}
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
        className="text-xs uppercase tracking-widest font-semibold text-[var(--color-area-lernen)] mb-2"
      >
        Abschluss · Debriefing
      </motion.p>
      <motion.h1
        custom={0}
        variants={SECTION_VARIANTS}
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
        className="text-3xl md:text-4xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-8"
      >
        Was hast du gelernt?
      </motion.h1>

      {/* Section 1: Leitfrage + Reflexion */}
      <motion.section
        custom={1}
        variants={SECTION_VARIANTS}
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
        className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6 mb-5"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-area-lernen)] mb-3">
          Rückblick auf deine Leitfrage
        </p>
        {leitfrage && (
          <blockquote className="border-l-4 border-[var(--color-area-lernen)] pl-4 mb-4 italic dark:text-[var(--color-secondary)] text-slate-700 text-sm leading-relaxed">
            {leitfrage}
          </blockquote>
        )}
        <textarea
          value={debriefingText}
          onChange={event => {
            const value = event.target.value;
            setDebriefingText(value);
            handleSave(value, transferText);
          }}
          placeholder={debriefingPrompt}
          className="w-full min-h-36 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50 p-4 text-sm resize-y dark:text-[var(--color-primary)] text-slate-900 placeholder:dark:text-[var(--color-muted)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-area-lernen)]/50"
        />
        <p
          className={`text-xs mt-2 ${canFinish ? 'text-[var(--color-success)]' : 'dark:text-[var(--color-muted)] text-slate-500'}`}
        >
          {debriefingLength} / {LEARNING_PATH_CHECKOUT_MIN_LENGTH} Zeichen Minimum
          {canFinish && ' ✓'}
        </p>
      </motion.section>

      {/* Section 2: Dein Weg */}
      {summaryItems.length > 0 && (
        <motion.section
          custom={2}
          variants={SECTION_VARIANTS}
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion ? undefined : 'visible'}
          className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6 mb-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-area-lernen)] mb-3">
            Dein Weg
          </p>
          <div className="space-y-3">
            {summaryItems.map((item, index) => (
              <article
                key={item.stepNumber}
                className={`rounded-xl border p-4 ${
                  index === 0
                    ? 'border-[var(--color-area-lernen)]/40 dark:bg-[var(--color-area-lernen)]/10 bg-emerald-50/60'
                    : 'border-[var(--color-border)]/70 dark:bg-[var(--color-surface)] bg-slate-50/60'
                }`}
              >
                <p
                  className={`text-xs font-medium mb-1 ${
                    index === 0 ? 'text-[var(--color-area-lernen)]' : 'dark:text-[var(--color-muted)] text-slate-500'
                  }`}
                >
                  {index === 0 ? 'Deine Ausgangslage · ' : ''}Schritt {item.stepNumber}
                </p>
                <p className="text-xs font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-1">
                  {item.title}
                </p>
                <p className="text-sm leading-relaxed dark:text-[var(--color-secondary)] text-slate-700">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </motion.section>
      )}

      {/* Section 3: Kompetenzen */}
      {kompetenzen.length > 0 && (
        <motion.section
          custom={3}
          variants={SECTION_VARIANTS}
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion ? undefined : 'visible'}
          className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6 mb-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-area-lernen)] mb-3">
            Das hast du gelernt
          </p>
          <ul className="space-y-2.5">
            {kompetenzen.map((k, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-success)]/20 text-[var(--color-success)] flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span className="text-sm dark:text-[var(--color-secondary)] text-slate-700">{k}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      {/* Section 4: Transfer (optional) */}
      {transferPrompt && (
        <motion.section
          custom={4}
          variants={SECTION_VARIANTS}
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion ? undefined : 'visible'}
          className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6 mb-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-area-lernen)] mb-2">
            Weiterdenken
          </p>
          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-3 italic leading-relaxed">
            {transferPrompt}
          </p>
          <textarea
            value={transferText}
            onChange={event => {
              const value = event.target.value;
              setTransferText(value);
              handleSave(debriefingText, value);
            }}
            placeholder="Optional: Deine Gedanken dazu …"
            className="w-full min-h-24 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50 p-4 text-sm resize-y dark:text-[var(--color-primary)] text-slate-900 placeholder:dark:text-[var(--color-muted)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-area-lernen)]/50"
          />
        </motion.section>
      )}

      {/* Section 5: Export + Abschliessen */}
      <motion.section
        custom={5}
        variants={SECTION_VARIANTS}
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
        className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6"
      >
        <p className="text-xs font-semibold uppercase tracking-wide dark:text-[var(--color-muted)] text-slate-500 mb-1">
          Deine Antworten sichern?
        </p>
        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-6">
          Über das <strong>Persönliche Hub</strong> (Menü links) kannst du alle deine Antworten als Link exportieren und
          für später sichern.
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={prevStep}
            disabled={isFirstStep}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm disabled:opacity-30 disabled:cursor-not-allowed dark:text-[var(--color-secondary)] text-slate-700 hover:dark:bg-[var(--color-surface)] hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={!canFinish}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm text-white bg-[var(--color-area-lernen)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Abschliessen
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </motion.section>
    </div>
  );
}

export default function LearningPathCheckoutPage() {
  return (
    <AreaProvider area="lernen">
      <LearningPathCheckoutPageContent />
    </AreaProvider>
  );
}
