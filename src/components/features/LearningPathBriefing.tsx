import { motion, useReducedMotion } from 'framer-motion';
import type { LearningPath } from '../../types/knowledge.types';

interface LearningPathBriefingProps {
  path: LearningPath;
  onStart: () => void;
}

function parseMaxMinutes(duration: string): number {
  const numbers = duration.match(/\d+/g);
  if (!numbers || numbers.length === 0) return 0;
  return Math.max(...numbers.map(Number));
}

export default function LearningPathBriefing({ path, onStart }: LearningPathBriefingProps) {
  const reduceMotion = useReducedMotion();
  const maxMinutes = parseMaxMinutes(path.estimatedDuration);
  const showExportHint = maxMinutes > 45;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={reduceMotion ? undefined : { duration: 0.4, ease: 'easeOut' }}
      >
        {/* Area badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-area-lernen)]" />
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-area-lernen)]">
            Lernpfad
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-2">
          {path.title}
        </h1>
        {path.subtitle && (
          <p className="text-sm dark:text-[var(--color-muted)] text-slate-500 mb-6">
            {path.subtitle}
          </p>
        )}

        {/* Leitfrage */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{
            background: 'color-mix(in srgb, var(--color-area-lernen) 8%, transparent)',
            borderLeft: '3px solid var(--color-area-lernen)',
          }}
        >
          <p className="text-[10px] uppercase tracking-widest font-semibold text-[var(--color-area-lernen)] mb-3">
            Leitfrage
          </p>
          <p className="text-lg md:text-xl font-medium dark:text-[var(--color-primary)] text-slate-900 leading-snug">
            {path.leitfrage}
          </p>
        </div>

        {/* Kompetenzen */}
        <div className="rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 mb-5">
          <p className="text-sm font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-3">
            Das lernst du in diesem Pfad:
          </p>
          <ul className="space-y-2.5">
            {path.kompetenzen.map((kompetenz, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 border-[var(--color-area-lernen)] flex items-center justify-center">
                  <span className="sr-only">Noch nicht erreicht</span>
                </span>
                <span className="text-sm dark:text-[var(--color-secondary)] text-slate-700">
                  {kompetenz}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 text-sm dark:text-[var(--color-muted)] text-slate-500 mb-2">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ca. {path.estimatedDuration}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {path.steps.length} Schritte
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Niveau {path.level}
          </span>
        </div>

        {/* Export hint */}
        {showExportHint && (
          <div className="flex items-start gap-2 text-xs dark:text-[var(--color-muted)] text-slate-500 mb-5 rounded-lg border border-[var(--color-border)] px-3 py-2.5 dark:bg-[var(--color-surface)] bg-slate-50">
            <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[var(--color-area-lernen)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong className="font-medium dark:text-[var(--color-secondary)] text-slate-700">Tipp:</strong>{' '}
              Du kannst jederzeit pausieren und deinen Fortschritt sichern (Export). Deine Antworten bleiben gespeichert.
            </span>
          </div>
        )}

        {/* CTA button */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold text-white bg-[var(--color-area-lernen)] hover:opacity-90 active:opacity-80 transition-opacity"
          >
            Los geht's
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
