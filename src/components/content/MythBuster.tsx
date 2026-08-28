import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';

interface Myth {
  statement: string;
  correct: boolean;
  explanation: string;
}

const MYTHS: Myth[] = [
  {
    statement: 'Die KI sucht bei jeder Anfrage Bilder im Internet',
    correct: false,
    explanation: 'Das Modell generiert aus gelernten Mustern. Es hat keinen Internetzugang während der Generierung.',
  },
  {
    statement: 'Die KI malt ein Bild Strich für Strich, wie ein Mensch',
    correct: false,
    explanation: 'Sie berechnet wahrscheinliche Pixelmuster in vielen parallelen Schritten – eher wie ein Foto, das in der Entwicklerflüssigkeit erscheint.',
  },
  {
    statement: 'Das Ergebnis basiert auf statistischen Wahrscheinlichkeiten',
    correct: true,
    explanation: 'Das Modell hat gelernt, welche Pixelmuster statistisch zu welchen Textbeschreibungen passen.',
  },
  {
    statement: 'Jedes generierte Bild ist eine Neuberechnung, keine Kopie',
    correct: true,
    explanation: 'Kein Bild wird aus einer Datenbank abgerufen. Jedes Ergebnis wird neu berechnet.',
  },
  {
    statement: 'Die KI versteht den Prompt so wie ein Mensch',
    correct: false,
    explanation: 'Sie erkennt statistische Zusammenhänge zwischen Wörtern und Bildmustern – das ist kein „Verstehen" im menschlichen Sinn.',
  },
  {
    statement: 'Mehr Denoising-Schritte erzeugen grundsätzlich mehr Details',
    correct: true,
    explanation: 'Mehr Schritte geben dem Modell mehr Gelegenheit, feine Strukturen herauszuarbeiten – bis zu einem Sättigungspunkt.',
  },
];

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function MythBuster() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();

  const shuffledMyths = useMemo(() => shuffleArray(MYTHS), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const myth = shuffledMyths[currentIndex];

  const handleAnswer = (answer: boolean) => {
    setUserAnswer(answer);
    setFlipped(true);
    if (answer === myth.correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex >= shuffledMyths.length - 1) {
      setFinished(true);
      return;
    }
    setCurrentIndex(i => i + 1);
    setFlipped(false);
    setUserAnswer(null);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setUserAnswer(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-6 text-center">
        <div className="text-4xl font-bold mb-2" style={{ color: areaColor }}>
          {score} von {shuffledMyths.length}
        </div>
        <p className="dark:text-[var(--color-secondary)] text-slate-600 mb-4">
          {score === shuffledMyths.length
            ? 'Perfekt! Du hast alle Mythen richtig eingeordnet.'
            : score >= 4
              ? 'Gut gemacht! Die meisten Mythen hast du richtig erkannt.'
              : 'Nicht schlecht – die Erklärungen oben helfen dir, die Konzepte zu festigen.'}
        </p>
        <button
          type="button"
          onClick={handleRestart}
          className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: areaColor, color: areaColor }}
        >
          Nochmal spielen
        </button>
      </section>
    );
  }

  const isCorrect = userAnswer === myth.correct;

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium dark:text-[var(--color-muted)] text-slate-500">
          {currentIndex + 1} von {shuffledMyths.length}
        </span>
        <div className="flex gap-1">
          {shuffledMyths.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-colors"
              style={{
                backgroundColor: i < currentIndex
                  ? areaColor
                  : i === currentIndex
                    ? areaColor
                    : 'var(--color-border)',
                opacity: i <= currentIndex ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="relative min-h-[200px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!flipped ? (
            <motion.div
              key={`front-${currentIndex}`}
              initial={reduceMotion ? undefined : { opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateY: 90 }}
              transition={{ duration: reduceMotion ? 0.15 : 0.4 }}
              className="w-full text-center"
              style={{ perspective: '800px' }}
            >
              <p className="text-lg md:text-xl font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-6">
                „{myth.statement}"
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAnswer(true)}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30 hover:bg-[var(--color-success)]/25 transition-colors"
                >
                  Stimmt
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer(false)}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/30 hover:bg-[var(--color-error)]/25 transition-colors"
                >
                  Stimmt nicht
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`back-${currentIndex}`}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ duration: reduceMotion ? 0.15 : 0.4 }}
              className="w-full text-center"
              style={{ perspective: '800px' }}
            >
              <div
                className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-3"
                style={{
                  backgroundColor: isCorrect ? 'var(--color-success)' : 'var(--color-error)',
                  color: '#fff',
                }}
              >
                {isCorrect ? 'Richtig!' : 'Falsch'}
              </div>
              <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-1">
                Die Aussage ist <strong>{myth.correct ? 'richtig' : 'falsch'}</strong>.
              </p>
              <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-5">
                {myth.explanation}
              </p>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: areaColor }}
              >
                {currentIndex < shuffledMyths.length - 1 ? 'Nächste Aussage' : 'Ergebnis anzeigen'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
