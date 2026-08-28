import { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';

interface CycleStep {
  id: number;
  title: string;
  description: string;
  example: string;
}

const STEPS: CycleStep[] = [
  {
    id: 1,
    title: 'Ungleiche Realität',
    description: 'In der realen Welt sind bestimmte Berufe ungleich verteilt – z.B. sind nur ca. 25% der Informatiklehrkräfte weiblich.',
    example: 'Informatik wird in der Gesellschaft oft als „männliches Fach" wahrgenommen.',
  },
  {
    id: 2,
    title: 'Internet-Bilder',
    description: 'Bilder im Internet spiegeln diese Verteilung wider – und verstärken sie oft. Stockfotos zeigen häufig stereotype Darstellungen.',
    example: 'Eine Google-Bildersuche nach „Informatiklehrer" zeigt überwiegend Männer.',
  },
  {
    id: 3,
    title: 'KI lernt aus Bildern',
    description: 'Bild-KI-Modelle trainieren auf Milliarden von Internet-Bildern und übernehmen deren Muster und Verzerrungen.',
    example: 'Das Modell lernt: „Informatiklehrkraft" = meist männlich, Brille, mittleres Alter.',
  },
  {
    id: 4,
    title: 'KI erzeugt neue Bilder',
    description: 'Die KI generiert Bilder, die die gelernten Muster reproduzieren oder sogar verstärken.',
    example: 'FLUX2 PRO zeigt bei „Informatiklehrkraft" 0% weibliche Darstellungen.',
  },
  {
    id: 5,
    title: 'Menschen sehen KI-Bilder',
    description: 'KI-generierte Bilder werden zunehmend im Alltag sichtbar – in Präsentationen, Social Media, Werbung. Sie prägen Vorstellungen davon, was „normal" ist.',
    example: 'Eine Schülerin sieht überall nur männliche IT-Fachkräfte – auch in KI-generierten Bildern.',
  },
  {
    id: 6,
    title: 'Verstärkung der Realität',
    description: 'Die Bilder beeinflussen Rollenbilder und Erwartungen – und können bestehende Ungleichheiten verfestigen.',
    example: 'Weniger Mädchen interessieren sich für Informatik, weil sie sich darin nicht repräsentiert sehen.',
  },
];

export default function RepresentationCycleViz() {
  const [activeStep, setActiveStep] = useState(0);
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6"
      aria-label="Der Representation-Kreislauf: 6 Schritte der Verstärkung stereotyper Darstellungen"
    >
      <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-1">
        Der Representation-Kreislauf
      </h4>
      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-6">
        Klicke auf die Schritte, um zu sehen, wie sich Stereotypen in einer Schleife verstärken.
      </p>

      {/* Circle layout */}
      <div className="relative mx-auto w-full max-w-lg aspect-square mb-6">
        {/* Connecting arrows (SVG) */}
        <svg
          viewBox="0 0 400 400"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          {STEPS.map((_, i) => {
            const angle1 = (i * 60 - 90) * (Math.PI / 180);
            const angle2 = ((i + 1) * 60 - 90) * (Math.PI / 180);
            const r = 150;
            const cx = 200;
            const cy = 200;
            const x1 = cx + r * Math.cos(angle1);
            const y1 = cy + r * Math.sin(angle1);
            const x2 = cx + r * Math.cos(angle2);
            const y2 = cy + r * Math.sin(angle2);
            // midpoint for curved arrow
            const mx = cx + (r * 0.75) * Math.cos((angle1 + angle2) / 2);
            const my = cy + (r * 0.75) * Math.sin((angle1 + angle2) / 2);

            return (
              <path
                key={i}
                d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                stroke={activeStep === i ? '#F59E0B' : '#64748B'}
                strokeWidth={activeStep === i ? 2.5 : 1.5}
                fill="none"
                strokeDasharray={activeStep === i ? undefined : '4 4'}
                opacity={activeStep === i ? 1 : 0.4}
              />
            );
          })}
        </svg>

        {/* Step nodes */}
        {STEPS.map((step, i) => {
          const angle = (i * 60 - 90) * (Math.PI / 180);
          const r = 150;
          const cx = 200;
          const cy = 200;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          const isActive = activeStep === i;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(i)}
              className="absolute flex items-center justify-center rounded-full border-2 transition-all text-xs font-bold"
              style={{
                left: `${(x / 400) * 100}%`,
                top: `${(y / 400) * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: isActive ? 48 : 40,
                height: isActive ? 48 : 40,
                borderColor: isActive ? '#F59E0B' : '#64748B',
                backgroundColor: isActive ? 'rgba(245,158,11,0.15)' : 'var(--color-surface, #0F172A)',
                color: isActive ? '#F59E0B' : '#94A3B8',
              }}
              aria-label={`Schritt ${step.id}: ${step.title}`}
              aria-pressed={isActive}
            >
              {step.id}
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border border-[var(--color-border)] p-4"
          style={{
            borderColor: 'rgba(245,158,11,0.3)',
            backgroundColor: 'rgba(245,158,11,0.05)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center text-xs font-bold">
              {STEPS[activeStep].id}
            </span>
            <h5 className="font-semibold dark:text-[var(--color-primary)] text-slate-900">
              {STEPS[activeStep].title}
            </h5>
          </div>
          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-2">
            {STEPS[activeStep].description}
          </p>
          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 italic">
            Beispiel: {STEPS[activeStep].example}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={() => setActiveStep(prev => (prev - 1 + STEPS.length) % STEPS.length)}
          className="px-3 py-1.5 rounded-lg text-xs border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:border-[#F59E0B]/50 transition-colors"
        >
          Zurück
        </button>
        <span className="text-xs dark:text-[var(--color-muted)] text-slate-500 self-center">
          {activeStep + 1} / {STEPS.length}
        </span>
        <button
          type="button"
          onClick={() => setActiveStep(prev => (prev + 1) % STEPS.length)}
          className="px-3 py-1.5 rounded-lg text-xs border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:border-[#F59E0B]/50 transition-colors"
        >
          Weiter
        </button>
      </div>
    </section>
  );
}
