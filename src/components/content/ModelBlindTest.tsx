import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getV3ShuffledImages, getV3ImagePath, V3_MODELS } from '../../data/v3Images';
import type { V3ModelId } from '../../types/image.types';

const ROUND_COUNT = 8;

const MODEL_IDS: V3ModelId[] = ['flux2pro', 'gpt-image-1-5', 'nanobana', 'gemini-image-2'];

const TIPS: Record<V3ModelId, string> = {
  flux2pro: 'Achte auf die weite Landschaft und das sanfte, nebelige Licht.',
  'gpt-image-1-5': 'Achte auf den massiven, detaillierten Stamm und die dramatische Baumkrone.',
  nanobana: 'Achte auf die warme Sonnenuntergangsstimmung und die Blumenwiese.',
  'gemini-image-2': 'Achte auf das Holzschild mit dem Wort „BAUM" am Stamm.',
};

function getScoreText(score: number, total: number): string {
  const ratio = score / total;
  if (ratio >= 7 / 8) return 'Beeindruckend! Du kannst die Modelle an ihrem Stil unterscheiden.';
  if (ratio >= 4 / 8) return 'Du erkennst die wichtigsten Unterschiede. Mit etwas Übung wird es noch klarer.';
  return 'Die Modellsignaturen sind subtil – schau dir den Vergleich oben nochmal an.';
}

export default function ModelBlindTest() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();

  const [images, setImages] = useState(() => getV3ShuffledImages(ROUND_COUNT));
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState<V3ModelId | null>(null);
  const [phase, setPhase] = useState<'playing' | 'feedback' | 'result'>('playing');

  const currentImage = images[currentRound];

  const modelName = (id: V3ModelId) =>
    V3_MODELS.find(m => m.modelId === id)?.modelName ?? id;

  const isCorrect = useMemo(
    () => guess !== null && guess === currentImage?.correctModel,
    [guess, currentImage],
  );

  const handleGuess = (modelId: V3ModelId) => {
    if (phase !== 'playing') return;
    setGuess(modelId);
    const correct = modelId === currentImage.correctModel;
    if (correct) setScore(prev => prev + 1);
    setPhase('feedback');
  };

  const handleNext = () => {
    if (currentRound + 1 >= ROUND_COUNT) {
      setPhase('result');
    } else {
      setCurrentRound(prev => prev + 1);
      setGuess(null);
      setPhase('playing');
    }
  };

  const handleRestart = () => {
    setImages(getV3ShuffledImages(ROUND_COUNT));
    setCurrentRound(0);
    setScore(0);
    setGuess(null);
    setPhase('playing');
  };

  if (phase === 'result') {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6 text-center">
        <div className="text-4xl font-bold mb-2" style={{ color: areaColor }}>
          {score} von {ROUND_COUNT}
        </div>
        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4 max-w-md mx-auto">
          {getScoreText(score, ROUND_COUNT)}
        </p>
        <button
          type="button"
          onClick={handleRestart}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: areaColor }}
        >
          Nochmal spielen
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      {/* Score bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs dark:text-[var(--color-muted)] text-slate-500">
          Runde {currentRound + 1} / {ROUND_COUNT}
        </span>
        <span className="text-xs font-medium" style={{ color: areaColor }}>
          {score} richtig
        </span>
      </div>

      {/* Image */}
      <div className="flex justify-center mb-5">
        <motion.div
          key={currentRound}
          initial={reduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="w-64 h-64 md:w-80 md:h-80 rounded-xl overflow-hidden border border-[var(--color-border)]"
        >
          <img
            src={getV3ImagePath(currentImage.modelId, currentImage.index)}
            alt="Welches Modell hat dieses Bild erzeugt?"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4 max-w-md mx-auto">
        {MODEL_IDS.map(modelId => {
          const isGuessed = guess === modelId;
          const isCorrectModel = modelId === currentImage.correctModel;
          let borderColor = 'var(--color-border)';
          let bgColor = 'transparent';

          if (phase === 'feedback') {
            if (isGuessed && isCorrect) {
              borderColor = 'var(--color-success)';
              bgColor = 'color-mix(in srgb, var(--color-success) 10%, transparent)';
            } else if (isGuessed && !isCorrect) {
              borderColor = 'var(--color-error)';
              bgColor = 'color-mix(in srgb, var(--color-error) 10%, transparent)';
            } else if (isCorrectModel) {
              borderColor = 'var(--color-success)';
              bgColor = 'color-mix(in srgb, var(--color-success) 5%, transparent)';
            }
          }

          return (
            <button
              key={modelId}
              type="button"
              onClick={() => handleGuess(modelId)}
              disabled={phase === 'feedback'}
              className="p-3 rounded-lg border text-sm font-medium transition-colors disabled:cursor-default"
              style={{
                borderColor,
                backgroundColor: bgColor,
                color: 'var(--color-secondary)',
              }}
            >
              {modelName(modelId)}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {phase === 'feedback' && (
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p
            className="text-sm font-medium mb-1"
            style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-error)' }}
          >
            {isCorrect ? 'Richtig!' : `Falsch – das war ${modelName(currentImage.correctModel)}.`}
          </p>
          {!isCorrect && (
            <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mb-3">
              {TIPS[currentImage.correctModel]}
            </p>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-white"
            style={{ backgroundColor: areaColor }}
          >
            {currentRound + 1 < ROUND_COUNT ? 'Weiter' : 'Ergebnis anzeigen'}
          </button>
        </motion.div>
      )}
    </section>
  );
}
