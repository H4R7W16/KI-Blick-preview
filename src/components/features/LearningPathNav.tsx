import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { useLearningPath } from '../../contexts/LearningPathContext';

interface LearningPathNavProps {
  mode?: 'sidebar' | 'mobile';
}

const AREA_LABELS: Record<string, string> = {
  verstehen: 'Verstehen',
  entdecken: 'Entdecken',
  einordnen: 'Einordnen',
  aufgabe: 'Aufgabe',
  abschluss: 'Abschluss',
};

const AREA_COLORS: Record<string, string> = {
  verstehen: 'var(--color-area-verstehen)',
  entdecken: 'var(--color-area-entdecken)',
  einordnen: 'var(--color-area-einordnen)',
  aufgabe: 'var(--color-accent)',
  abschluss: 'var(--color-success)',
};

function getNextButtonLabel(
  canAdvance: boolean,
  isLastStep: boolean,
  area: string
): string {
  if (canAdvance && isLastStep) {
    return 'Pfad abschliessen';
  }
  if (canAdvance) {
    return 'Weiter';
  }
  if (area === 'aufgabe') {
    return 'Weiter - erst Aufgabe ausfuellen';
  }
  if (area === 'abschluss') {
    return 'Weiter - erst Check-out ausfuellen';
  }
  if (area === 'verstehen' || area === 'einordnen') {
    return 'Weiter - erst Checkout abschliessen';
  }
  return 'Weiter';
}

export default function LearningPathNav({ mode = 'sidebar' }: LearningPathNavProps) {
  const reduceMotion = useReducedMotion();
  const {
    activePath,
    currentStep,
    isPathActive,
    canAdvance,
    prevStep,
    nextStep,
    exitPath,
    isStepCompleted,
  } = useLearningPath();

  const currentStepData = useMemo(() => {
    if (!activePath) {
      return null;
    }
    return activePath.steps.find(step => step.stepNumber === currentStep) ?? null;
  }, [activePath, currentStep]);

  if (!isPathActive || !activePath || !currentStepData) {
    return null;
  }

  const totalSteps = activePath.steps.length;
  const isFirstStep = currentStep <= 1;
  const isLastStep = currentStep >= totalSteps;
  const areaLabel = AREA_LABELS[currentStepData.area] ?? currentStepData.area;
  const areaColor = AREA_COLORS[currentStepData.area] ?? 'var(--color-muted)';
  const nextLabel = getNextButtonLabel(canAdvance, isLastStep, currentStepData.area);

  const containerClass =
    mode === 'mobile'
      ? 'fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white px-4 py-3 lg:hidden'
      : 'rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 hidden lg:block';

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      className={containerClass}
    >
      {mode === 'sidebar' && (
        <button
          type="button"
          onClick={() => {
            const shouldExit = window.confirm('Dein Fortschritt bleibt gespeichert. Pfad verlassen?');
            if (shouldExit) {
              exitPath();
            }
          }}
          className="text-xs mb-3 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          Pfad verlassen
        </button>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold dark:text-[var(--color-primary)] text-slate-900 truncate">
            {activePath.title}
          </p>
          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500">
            Schritt {currentStep} von {totalSteps}
          </p>
        </div>
        <span
          className="text-[10px] px-2 py-1 rounded-full font-medium"
          style={{
            backgroundColor: `color-mix(in srgb, ${areaColor} 15%, transparent)`,
            color: areaColor,
          }}
        >
          {areaLabel}
        </span>
      </div>

      <div className="flex gap-1 my-3">
        {activePath.steps.map(step => {
          const completed = isStepCompleted(step.stepNumber);
          const isCurrent = step.stepNumber === currentStep;
          const stepColor = AREA_COLORS[step.area] ?? 'var(--color-muted)';

          return (
            <motion.span
              key={step.stepNumber}
              layout={!reduceMotion}
              className="h-2 flex-1 rounded-full border"
              style={{
                borderColor: isCurrent
                  ? stepColor
                  : `color-mix(in srgb, ${stepColor} 50%, transparent)`,
                backgroundColor: completed || isCurrent
                  ? stepColor
                  : 'transparent',
                // "You are here" ring — outline-offset creates a natural gap in any bg color
                outline: isCurrent ? `2px solid ${stepColor}` : undefined,
                outlineOffset: isCurrent ? '2px' : undefined,
              }}
            />
          );
        })}
      </div>

      {mode === 'sidebar' && (
        <div className="mb-4">
          <p className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900">Schritt {currentStep}</p>
          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">{currentStepData.description}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={prevStep}
          disabled={isFirstStep}
          className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm disabled:opacity-40 disabled:cursor-not-allowed dark:text-[var(--color-secondary)] text-slate-700"
        >
          Zurück
        </button>
        <button
          type="button"
          onClick={() => nextStep()}
          disabled={!canAdvance}
          className="px-3 py-2 rounded-lg text-sm text-white bg-[var(--color-area-lernen)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {nextLabel}
        </button>
      </div>
    </motion.div>
  );
}
