import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getV3Series, getV3ImagePath } from '../../data/v3Images';

const BADGES = [
  'Alle: Laubbaum',
  'Alle: Sommer',
  'Alle: Wiese',
  'Keiner: Nadelbaum',
];

export default function SingleToSeriesReveal() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'single' | 'series' | 'badges'>(
    reduceMotion ? 'badges' : 'single',
  );

  const series = getV3Series('flux2pro');
  const firstImagePath = getV3ImagePath('flux2pro', 0);

  const handleReveal = () => {
    setPhase('series');
    if (!reduceMotion) {
      setTimeout(() => setPhase('badges'), 2400);
    }
  };

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      <AnimatePresence mode="wait">
        {phase === 'single' && (
          <motion.div
            key="single"
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-xl overflow-hidden border border-[var(--color-border)]">
              <img
                src={firstImagePath}
                alt="Ein einzelner KI-generierter Baum"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 text-center max-w-md">
              Was siehst du? Einen Baum. Was kannst du daraus über die KI lernen?
            </p>
            <button
              type="button"
              onClick={handleReveal}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: areaColor }}
            >
              Noch 15 weitere anzeigen
            </button>
          </motion.div>
        )}

        {(phase === 'series' || phase === 'badges') && (
          <motion.div
            key="grid"
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2">
                {series.images.map((img, i) => (
                  <motion.div
                    key={img.index}
                    initial={reduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={
                      reduceMotion
                        ? undefined
                        : { delay: i * 0.08, duration: 0.3 }
                    }
                    className="aspect-square rounded-lg overflow-hidden border border-[var(--color-border)]"
                  >
                    <img
                      src={getV3ImagePath('flux2pro', img.index)}
                      alt={`Baum-Bild ${img.index + 1} von 16`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Overlay badges */}
              {phase === 'badges' && (
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {BADGES.map((badge, i) => (
                    <motion.span
                      key={badge}
                      initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        reduceMotion
                          ? undefined
                          : { delay: i * 0.3, duration: 0.3 }
                      }
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: areaColor }}
                    >
                      {badge}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>

            <p className="mt-4 text-sm dark:text-[var(--color-secondary)] text-slate-600 text-center leading-relaxed max-w-lg mx-auto">
              Jetzt siehst du ein Muster. Nicht 16 verschiedene Bäume – sondern 16
              Variationen desselben gelernten Konzepts.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
