import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getV2ImagePath } from '../../data/v2Images';

interface DatasetImage {
  slug: string;
  index: number;
  label: string;
}

const DATASET: DatasetImage[] = [
  { slug: 'bread', index: 0, label: 'Bread' },
  { slug: 'bread', index: 1, label: 'Bread' },
  { slug: 'bread', index: 2, label: 'Bread' },
  { slug: 'bread', index: 3, label: 'Bread' },
  { slug: 'brot', index: 0, label: 'Brot' },
  { slug: 'brot', index: 1, label: 'Brot' },
  { slug: 'le-pain', index: 0, label: 'Le pain' },
  { slug: 'le-pain', index: 1, label: 'Le pain' },
  { slug: 'pan-jp', index: 0, label: 'パン' },
  { slug: 'khubz-ar', index: 0, label: 'خبز' },
  { slug: 'roti-hi', index: 0, label: 'रोटी' },
  { slug: 'mianbao-cn', index: 0, label: '面包' },
];

const DISTRIBUTION = [
  { label: 'Bread (en)', count: 4, color: '#0EA5E9' },
  { label: 'Brot (de)', count: 2, color: '#38BDF8' },
  { label: 'Le pain (fr)', count: 2, color: '#7DD3FC' },
  { label: 'Andere', count: 4, color: '#64748B' },
];

interface PredictionOption {
  label: string;
  slug: string;
  index: number;
  correct: boolean;
}

const PREDICTIONS: PredictionOption[] = [
  { label: 'Fladenbrot', slug: 'khubz-ar', index: 0, correct: false },
  { label: 'Klassisches Brot', slug: 'bread', index: 0, correct: true },
  { label: 'Chapati', slug: 'roti-hi', index: 0, correct: false },
];

export default function DataGapExplorer() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  const total = DATASET.length;

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      {/* Phase indicator */}
      <div className="flex gap-2 mb-5">
        {[1, 2, 3].map(p => (
          <button
            key={p}
            type="button"
            onClick={() => { if (p <= phase) setPhase(p as 1 | 2 | 3); }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors"
            style={
              phase === p
                ? { backgroundColor: areaColor, color: '#fff' }
                : p < phase
                  ? { backgroundColor: `color-mix(in srgb, ${areaColor} 15%, transparent)`, color: areaColor }
                  : { color: 'var(--color-muted)', border: '1px solid var(--color-border)' }
            }
          >
            Phase {p}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Phase 1: Dataset */}
        {phase === 1 && (
          <motion.div
            key="phase1"
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
          >
            <h4 className="text-sm font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-3">
              Stell dir vor, du baust einen Mini-Datensatz zum Thema „Brot".
            </h4>

            <div className="grid grid-cols-4 md:grid-cols-6 gap-1.5 mb-4">
              {DATASET.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={getV2ImagePath(img.slug, 'flux2pro', img.index)}
                    alt={img.label}
                    loading="lazy"
                    className="w-full aspect-square object-cover rounded-lg border border-[var(--color-border)]"
                  />
                  <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-black/60 text-white px-1 rounded">
                    {img.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Distribution */}
            <div className="flex gap-3 mb-3 flex-wrap">
              {DISTRIBUTION.map(d => (
                <div key={d.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                  <span className="text-[11px] dark:text-[var(--color-secondary)] text-slate-600">
                    {d.label}: {Math.round((d.count / total) * 100)}%
                  </span>
                </div>
              ))}
            </div>

            <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
              In diesem Datensatz sind 33% der Bilder englischsprachiges Brot. Was glaubst du: Welches Brot wird die KI am wahrscheinlichsten generieren?
            </p>

            <button
              type="button"
              onClick={() => setPhase(2)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: areaColor }}
            >
              Weiter zur Vorhersage
            </button>
          </motion.div>
        )}

        {/* Phase 2: Prediction */}
        {phase === 2 && (
          <motion.div
            key="phase2"
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
          >
            <div className="p-3 rounded-lg border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50 mb-4">
              <span className="text-xs dark:text-[var(--color-muted)] text-slate-500">Prompt:</span>
              <span className="ml-2 font-mono text-sm dark:text-[var(--color-primary)] text-slate-900">Brot</span>
            </div>

            <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
              Welches Ergebnis ist am wahrscheinlichsten?
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {PREDICTIONS.map((opt, i) => {
                const isSelected = prediction === i;
                const showResult = prediction !== null;
                let border = 'border-[var(--color-border)]';
                if (showResult && isSelected) {
                  border = opt.correct ? 'border-[var(--color-success)]' : 'border-[var(--color-error)]';
                } else if (showResult && opt.correct) {
                  border = 'border-[var(--color-success)]';
                }
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { if (prediction === null) setPrediction(i); }}
                    disabled={prediction !== null}
                    className={`rounded-xl overflow-hidden border-2 ${border} transition-colors disabled:cursor-default`}
                  >
                    <img
                      src={getV2ImagePath(opt.slug, 'flux2pro', opt.index)}
                      alt={opt.label}
                      loading="lazy"
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2 text-center">
                      <span className="text-xs font-medium dark:text-[var(--color-primary)] text-slate-900">
                        {String.fromCharCode(65 + i)}: {opt.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {prediction !== null && (
              <div className="space-y-3">
                <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">
                  <strong style={{ color: areaColor }}>B ist die wahrscheinlichste Antwort</strong>, weil klassisches Brot im Datensatz am häufigsten vorkam. Aber: ein realer Datensatz mit 5,85 Milliarden Bildern hat dieselbe Schieflage – nur in größerem Maßstab.
                </p>
                <button
                  type="button"
                  onClick={() => setPhase(3)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: areaColor }}
                >
                  Weiter zur Reflexion
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Phase 3: Reflection */}
        {phase === 3 && (
          <motion.div
            key="phase3"
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
              Was wäre nötig, damit die KI alle Brotkulturen gleich gut kennt?
            </p>

            <button
              type="button"
              onClick={() => setShowReveal(!showReveal)}
              className="w-full text-left p-3 rounded-lg border border-[var(--color-border)] mb-2"
            >
              <span className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900">
                {showReveal ? '▾' : '▸'} Antwort anzeigen
              </span>
            </button>

            {showReveal && (
              <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 p-3">
                Mehr Vielfalt in den Trainingsdaten, bewusste Kuratierung, und Daten aus unterrepräsentierten Regionen.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
