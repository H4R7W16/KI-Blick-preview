import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { LearningPath } from '../../types/knowledge.types';

export function getMilestoneStep(path: LearningPath): number | null {
  const totalSteps = path.steps.length;
  if (totalSteps <= 5) return null;
  return Math.ceil(totalSteps / 2);
}

interface MilestoneOverlayProps {
  path: LearningPath;
  completedSteps: number;
  onDismiss: () => void;
}

export default function MilestoneOverlay({ path, completedSteps, onDismiss }: MilestoneOverlayProps) {
  const milestoneStep = getMilestoneStep(path);

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 10_000);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  if (!milestoneStep) return null;

  const completedTaskDescriptions = path.steps
    .filter(s => s.stepNumber < milestoneStep && s.area === 'aufgabe')
    .map(s => s.description);

  const outlookText =
    path.milestoneOutlook ?? 'In der zweiten Hälfte vertiefst du deine Erkenntnisse.';

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="mb-6 rounded-xl border border-emerald-500/30 dark:bg-emerald-900/20 bg-emerald-50 p-5"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-2xl" aria-hidden="true">🎯</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-area-lernen)] mb-1">
            Halbzeit!
          </p>
          <p className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900 mb-3">
            Du hast bereits {completedSteps} von {path.steps.length} Schritten geschafft.
          </p>

          {completedTaskDescriptions.length > 0 && (
            <div className="mb-3">
              <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mb-1.5">
                Bisher hast du:
              </p>
              <ul className="space-y-1">
                {completedTaskDescriptions.map((desc, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm dark:text-[var(--color-secondary)] text-slate-700"
                  >
                    <span className="text-[var(--color-area-lernen)] mt-0.5 flex-shrink-0" aria-hidden="true">·</span>
                    {desc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
            {outlookText}
          </p>

          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-area-lernen)] hover:opacity-90 transition-opacity"
          >
            Weiter
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
