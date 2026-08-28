import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';

interface Step {
  number: number;
  title: string;
  explanation: string;
  example: string;
  transfer: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Default identifizieren',
    explanation: 'Was ist der häufigste Output? Was erscheint (fast) immer?',
    example: '„Europäischer Laubbaum, grüne Wiese, Sommer"',
    transfer: 'Was wäre der Default bei „Mathematiklehrkraft"?',
  },
  {
    number: 2,
    title: 'Variation beschreiben',
    explanation: 'Wo und wie variiert die Serie innerhalb des Default?',
    example: '„Wetter wechselt (Sonne ↔ Nebel), Perspektive variiert"',
    transfer: 'Welche Variationen erwartest du bei Lehrkraft-Bildern?',
  },
  {
    number: 3,
    title: 'Lücken benennen',
    explanation: 'Was fehlt systematisch? Was liegt außerhalb des Default?',
    example: '„Kein Nadelbaum, keine Palme, kein Herbst, keine Stadt"',
    transfer: 'Was könnte bei Lehrkräften systematisch fehlen?',
  },
  {
    number: 4,
    title: 'Modelle vergleichen',
    explanation: 'Wie unterscheiden sich die Modellsignaturen?',
    example: '„FLUX=Landschaft, GPT=Hyperdetail, NanoBana=Stimmung, Gemini=Text"',
    transfer: 'Produzieren alle Modelle dieselben Stereotype?',
  },
];

export default function AnalysisFramework() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      <div className="space-y-2">
        {STEPS.map(step => {
          const isExpanded = expandedStep === step.number;
          return (
            <div
              key={step.number}
              className="rounded-xl border transition-colors"
              style={{
                borderColor: isExpanded
                  ? `color-mix(in srgb, ${areaColor} 50%, transparent)`
                  : 'var(--color-border)',
              }}
            >
              <button
                type="button"
                onClick={() => setExpandedStep(isExpanded ? null : step.number)}
                className="w-full flex items-center gap-3 p-4 text-left"
                aria-expanded={isExpanded}
              >
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    backgroundColor: areaColor,
                    opacity: 0.6 + step.number * 0.1,
                  }}
                >
                  {step.number}
                </span>
                <span className="font-semibold text-sm dark:text-[var(--color-primary)] text-slate-900">
                  {step.title}
                </span>
                <svg
                  className="ml-auto w-4 h-4 flex-shrink-0 transition-transform"
                  style={{
                    color: 'var(--color-muted)',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={reduceMotion ? { height: 'auto' } : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">
                        {step.explanation}
                      </p>

                      <div
                        className="rounded-lg p-3 text-sm"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${areaColor} 8%, transparent)`,
                        }}
                      >
                        <span className="text-[10px] uppercase tracking-wider font-medium block mb-1" style={{ color: areaColor }}>
                          Baum-Beispiel
                        </span>
                        <span className="dark:text-[var(--color-secondary)] text-slate-600">
                          {step.example}
                        </span>
                      </div>

                      <div className="rounded-lg border border-dashed border-[var(--color-border)] p-3 text-sm">
                        <span className="text-[10px] uppercase tracking-wider font-medium block mb-1 dark:text-[var(--color-muted)] text-slate-500">
                          Transferfrage
                        </span>
                        <span className="dark:text-[var(--color-secondary)] text-slate-600 italic">
                          {step.transfer}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-sm dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed text-center">
        Diese vier Schritte funktionieren für jede KI-Bildserie. Im Bereich Entdecken
        kannst du sie auf Bilder von Lehrkräften und Schulklassen anwenden – und dabei
        entdecken, welche Muster die KI über Menschen gelernt hat.
      </p>
    </section>
  );
}
