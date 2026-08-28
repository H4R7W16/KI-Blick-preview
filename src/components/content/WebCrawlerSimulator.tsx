import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getV2ImagePath } from '../../data/v2Images';

interface SimStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: SimStep[] = [
  {
    title: 'Crawler besucht Website',
    description: 'Ein automatisches Programm durchsucht Millionen von Webseiten…',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="8" width="40" height="32" rx="4" />
        <line x1="4" y1="16" x2="44" y2="16" />
        <circle cx="10" cy="12" r="1.5" fill="currentColor" />
        <circle cx="15" cy="12" r="1.5" fill="currentColor" />
        <circle cx="20" cy="12" r="1.5" fill="currentColor" />
        <rect x="10" y="22" width="28" height="4" rx="1" opacity="0.3" />
        <rect x="10" y="30" width="20" height="4" rx="1" opacity="0.3" />
      </svg>
    ),
  },
  {
    title: 'Bild gefunden',
    description: '…findet Bilder und liest den zugehörigen Alt-Text aus dem HTML-Code.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="8" y="8" width="32" height="32" rx="4" />
        <circle cx="18" cy="18" r="4" />
        <path d="M8 32l10-10 6 6 8-8 8 8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Paar gespeichert',
    description: 'Bild + Text-Snippet fliegen in die Datenbank.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="24" cy="14" rx="16" ry="6" />
        <path d="M8 14v10c0 3.3 7.2 6 16 6s16-2.7 16-6V14" />
        <path d="M8 24v10c0 3.3 7.2 6 16 6s16-2.7 16-6V24" />
      </svg>
    ),
  },
  {
    title: 'Milliardenfach wiederholen',
    description: 'Das passiert Milliarden Mal. Das Ergebnis ist ein riesiger, ungefilteter Datensatz.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M24 4v8l4-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 4l-4 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M38 18a14 14 0 1 1-4-10" strokeLinecap="round" />
        <text x="17" y="30" fill="currentColor" fontSize="10" fontFamily="monospace" stroke="none">∞</text>
      </svg>
    ),
  },
];

function StaticView({ areaColor }: { areaColor: string }) {
  return (
    <div className="space-y-4">
      {STEPS.map((step, i) => (
        <div key={i} className="flex gap-4 items-start">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: `color-mix(in srgb, ${areaColor} 15%, transparent)`, color: areaColor }}
          >
            {i + 1}
          </div>
          <div>
            <p className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900">{step.title}</p>
            <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WebCrawlerSimulator() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  if (reduceMotion) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
        <StaticView areaColor={areaColor} />
        <p className="mt-4 text-xs dark:text-[var(--color-muted)] text-slate-500 italic">
          Was dabei schiefgehen kann, siehst du gleich.
        </p>
      </section>
    );
  }

  const step = STEPS[currentStep];

  const handlePlay = () => {
    if (playing) return;
    setPlaying(true);
    setCurrentStep(0);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      if (i >= STEPS.length) {
        clearInterval(timer);
        setPlaying(false);
        return;
      }
      setCurrentStep(i);
    }, 2000);
  };

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i <= currentStep ? areaColor : 'var(--color-border)' }}
          />
        ))}
      </div>

      {/* Step display */}
      <div className="min-h-[200px] flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <div style={{ color: areaColor }}>{step.icon}</div>
            <h4 className="text-base font-semibold dark:text-[var(--color-primary)] text-slate-900">
              {step.title}
            </h4>
            <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 max-w-md">
              {step.description}
            </p>

            {/* Step 3: show code snippet */}
            {currentStep === 2 && (
              <div className="w-full max-w-md">
                <div className="flex gap-2 items-start mb-2">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-[var(--color-border)] flex-shrink-0">
                    <img
                      src={getV2ImagePath('brot', 'flux2pro', 1)}
                      alt="Brot-Bild"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <code className="text-[11px] dark:bg-[var(--color-surface)] bg-slate-100 p-2 rounded-lg dark:text-[var(--color-secondary)] text-slate-700 text-left flex-1">
                    {'<img src="bread.jpg" alt="A loaf of freshly baked sourdough bread">'}
                  </code>
                </div>
              </div>
            )}

            {/* Step 4: counter */}
            {currentStep === 3 && (
              <div className="font-mono text-2xl font-bold" style={{ color: areaColor }}>
                5.850.000.000+
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          type="button"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={playing || currentStep === 0}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-30"
          style={{ borderColor: areaColor, color: areaColor }}
        >
          ← Zurück
        </button>
        <button
          type="button"
          onClick={handlePlay}
          disabled={playing}
          className="px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: areaColor }}
        >
          {playing ? 'Läuft…' : '▶ Abspielen'}
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
          disabled={playing || currentStep === STEPS.length - 1}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-30"
          style={{ borderColor: areaColor, color: areaColor }}
        >
          Weiter →
        </button>
      </div>

      {currentStep === STEPS.length - 1 && (
        <p className="mt-4 text-xs text-center dark:text-[var(--color-muted)] text-slate-500 italic">
          Was dabei schiefgehen kann, siehst du gleich.
        </p>
      )}
    </section>
  );
}
