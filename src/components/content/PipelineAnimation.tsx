import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getSeries } from '../../data/imageMetadata';
import { resolveAssetPath } from '../../utils/assetPath';
import NoiseToImage from './NoiseToImage';

interface PipelineStep {
  id: string;
  title: string;
  description: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'text',
    title: '1. Textverstehen',
    description:
      'Das Modell zerlegt den Prompt in semantische Signale: Fach, Rolle, Unterrichtskontext und visuelle Hinweise.',
  },
  {
    id: 'noise',
    title: '2. Rauschprozess',
    description:
      'Die Generierung startet in zufälligem Rauschen. In vielen Schritten werden Strukturen verdichtet, bis ein plausibles Bild entsteht.',
  },
  {
    id: 'result',
    title: '3. Ergebnis',
    description:
      'Das Endbild ist kein Fotoabruf, sondern eine neu berechnete Bildvariante mit statistisch wahrscheinlichen Merkmalen.',
  },
];

export default function PipelineAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const series = useMemo(
    () => getSeries('mathematiklehrkraft', 'flux2pro'),
    [],
  );

  const active = useMemo(() => PIPELINE_STEPS[activeStep], [activeStep]);

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
      <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Prompt zu Bild Pipeline">
        {PIPELINE_STEPS.map((step, index) => (
          <button
            key={step.id}
            type="button"
            aria-label={`Schritt ${index + 1}: ${step.title}`}
            onClick={() => setActiveStep(index)}
            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
              index === activeStep
                ? 'border-[var(--color-area-verstehen)] text-[var(--color-area-verstehen)] bg-[var(--color-area-verstehen)]/10'
                : 'border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:border-[var(--color-area-verstehen)]/50'
            }`}
          >
            {step.title}
          </button>
        ))}
      </div>

      <motion.div
        key={active.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-2">
          {active.title}
        </h4>
        <p className="text-sm md:text-base dark:text-[var(--color-secondary)] text-slate-700 mb-4 leading-relaxed">
          {active.description}
        </p>

        {active.id === 'noise' && <NoiseToImage compact />}

        {active.id === 'text' && (
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-[var(--color-border)] p-3 dark:text-[var(--color-secondary)] text-slate-700">
              Prompt
              <div className="mt-2 font-medium dark:text-[var(--color-primary)] text-slate-900">
                "Mathematiklehrkraft"
              </div>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] p-3 dark:text-[var(--color-secondary)] text-slate-700">
              Erkanntes Konzept
              <ul className="mt-2 space-y-1 dark:text-[var(--color-primary)] text-slate-900">
                <li>• Rolle: Lehrkraft</li>
                <li>• Fachkontext: Mathematik</li>
                <li>• Raum: Klassenraum</li>
              </ul>
            </div>
          </div>
        )}

        {active.id === 'result' && (
          <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
            <img
              src={
                series?.images[1]
                  ? resolveAssetPath(`${series.basePath}/${series.images[1].filename}`)
                  : resolveAssetPath('/images/generated/mathematiklehrkraft/flux2pro/_kontaktblatt.webp')
              }
              alt="Beispiel eines KI-generierten Mathematikunterrichts"
              loading="lazy"
              className="w-full h-52 md:h-64 object-cover"
            />
          </div>
        )}
      </motion.div>
    </section>
  );
}
