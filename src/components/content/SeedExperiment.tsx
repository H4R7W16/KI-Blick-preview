import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getV1ImagePath, getRandomV1SeedPair, getAllV1Seeds } from '../../data/v1Images';

const SLUG = 'leuchtturm';
const DEFAULT_SEED = 1000;

export default function SeedExperiment() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();

  const [seedA, setSeedA] = useState(DEFAULT_SEED);
  const [seedB, setSeedB] = useState(1001);
  const [sameMode, setSameMode] = useState(false);

  const rollBoth = useCallback(() => {
    const [a, b] = getRandomV1SeedPair(SLUG);
    setSeedA(a);
    setSeedB(b);
    setSameMode(false);
  }, []);

  const rollOne = useCallback(() => {
    const allSeeds = getAllV1Seeds(SLUG);
    const available = allSeeds.filter(s => s !== seedA);
    const newSeed = available[Math.floor(Math.random() * available.length)];
    setSeedB(newSeed);
    setSameMode(false);
  }, [seedA]);

  const makeSame = useCallback(() => {
    setSeedB(seedA);
    setSameMode(true);
  }, [seedA]);

  const imageVariants = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.3 },
      };

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-2 items-center">
        {/* Column A */}
        <div className="flex flex-col items-center gap-3">
          <motion.span
            key={seedA}
            {...(reduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 } })}
            className="font-mono text-xl font-bold"
            style={{ color: areaColor }}
          >
            Seed {seedA}
          </motion.span>
          <div className="rounded-xl overflow-hidden border border-[var(--color-border)] w-full max-w-[280px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={`a-${seedA}`}
                src={getV1ImagePath(SLUG, seedA)}
                alt={`Leuchtturm, Seed ${seedA}`}
                className="w-full h-auto aspect-square object-cover"
                loading="lazy"
                {...imageVariants}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Connector */}
        <div className="hidden md:flex flex-col items-center gap-2 px-2">
          <svg width="40" height="80" viewBox="0 0 40 80" fill="none" aria-hidden="true">
            <line
              x1="20" y1="0" x2="20" y2="80"
              stroke="var(--color-border)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </svg>
        </div>

        {/* Column B */}
        <div className="flex flex-col items-center gap-3">
          <motion.span
            key={seedB}
            {...(reduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 } })}
            className="font-mono text-xl font-bold"
            style={{ color: areaColor }}
          >
            Seed {seedB}
          </motion.span>
          <div className="rounded-xl overflow-hidden border border-[var(--color-border)] w-full max-w-[280px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={`b-${seedB}`}
                src={getV1ImagePath(SLUG, seedB)}
                alt={`Leuchtturm, Seed ${seedB}`}
                className="w-full h-auto aspect-square object-cover"
                loading="lazy"
                {...imageVariants}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-center text-sm dark:text-[var(--color-secondary)] text-slate-600 mt-4">
        {sameMode
          ? 'Gleicher Prompt + gleicher Seed = identisches Ergebnis'
          : 'Gleicher Prompt: „Leuchtturm" – unterschiedlicher Startpunkt'}
      </p>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        <button
          type="button"
          onClick={rollBoth}
          className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: areaColor, color: areaColor }}
        >
          Beide würfeln
        </button>
        <button
          type="button"
          onClick={makeSame}
          className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: areaColor, color: areaColor }}
        >
          Gleicher Seed
        </button>
        <button
          type="button"
          onClick={rollOne}
          className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: areaColor, color: areaColor }}
        >
          Einen würfeln
        </button>
      </div>
    </section>
  );
}
