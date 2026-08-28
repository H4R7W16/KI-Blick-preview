import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { IMAGE_SERIES } from '../../data/imageMetadata';
import { getTeacherAttributes } from '../../utils/teacherAttributes';
import { resolveAssetPath } from '../../utils/assetPath';

type Category = 'spiegel' | 'verstaerker' | 'erfinder';

// Real-world teacher gender data (KMK Lehrkräftestatistik 2023/24)
const REAL_FEMALE_PERCENT: Record<string, number> = {
  mathematiklehrkraft: 55,
  deutschlehrkraft: 78,
  physiklehrkraft: 30,
  informatiklehrkraft: 25,
  englischlehrkraft: 78,
  franzoesischlehrkraft: 82,
  lateinlehrkraft: 50,
  kunstlehrkraft: 75,
  musiklehrkraft: 55,
  sportlehrkraft: 43,
};

const SUBJECT_LABELS: Record<string, string> = {
  mathematiklehrkraft: 'Mathematik',
  deutschlehrkraft: 'Deutsch',
  physiklehrkraft: 'Physik',
  informatiklehrkraft: 'Informatik',
  englischlehrkraft: 'Englisch',
  franzoesischlehrkraft: 'Französisch',
  lateinlehrkraft: 'Latein',
  kunstlehrkraft: 'Kunst',
  musiklehrkraft: 'Musik',
  sportlehrkraft: 'Sport',
};

const MODEL_LABELS: Record<string, string> = {
  flux2pro: 'FLUX2 PRO',
  'gpt-image-1-5': 'GPT Image-1.5',
  nanobana: 'Nano Bana',
};

interface RoundConfig {
  subject: string;
  modelId: string;
}

const ROUNDS: RoundConfig[] = [
  { subject: 'informatiklehrkraft', modelId: 'flux2pro' },    // Verstärker: 0% vs 25%
  { subject: 'sportlehrkraft', modelId: 'nanobana' },         // Erfinder: 100% vs 43%
  { subject: 'lateinlehrkraft', modelId: 'flux2pro' },        // Spiegel: 44% vs 50%
  { subject: 'musiklehrkraft', modelId: 'gpt-image-1-5' },   // Verstärker: 100% vs 55%
  { subject: 'physiklehrkraft', modelId: 'nanobana' },        // Erfinder: 69% vs 30%
  { subject: 'kunstlehrkraft', modelId: 'flux2pro' },         // Spiegel: 69% vs 75%
];

function classifyBias(kiPercent: number, realPercent: number): Category {
  const diff = Math.abs(kiPercent - realPercent);
  if (diff <= 10) return 'spiegel';
  const realMajorityFemale = realPercent > 50;
  const kiMajorityFemale = kiPercent > 50;
  if (realMajorityFemale === kiMajorityFemale) return 'verstaerker';
  return 'erfinder';
}

const CATEGORY_INFO: Record<Category, { label: string; icon: string; description: string }> = {
  spiegel: { label: 'Spiegel', icon: '🪞', description: 'KI bildet Realität ungefähr ab' },
  verstaerker: { label: 'Verstärker', icon: '📢', description: 'KI übertreibt ein reales Muster' },
  erfinder: { label: 'Erfinder', icon: '🔮', description: 'KI erzeugt ein Muster, das es so nicht gibt' },
};

function computeKiFemalePercent(subject: string, modelId: string): number {
  const series = IMAGE_SERIES.filter(
    s => s.subjectSlug === subject && s.modelId === modelId,
  );
  let female = 0;
  let total = 0;
  for (const s of series) {
    for (const img of s.images) {
      total += 1;
      if (getTeacherAttributes(img.attributes).gender === 'female') female += 1;
    }
  }
  return total > 0 ? Math.round((female / total) * 100) : 0;
}

export default function BiasClassifier() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();

  const [phase, setPhase] = useState<'intro' | 'classify' | 'result'>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [answers, setAnswers] = useState<(Category | null)[]>(Array(ROUNDS.length).fill(null));
  const [showFeedback, setShowFeedback] = useState(false);

  const roundData = useMemo(() =>
    ROUNDS.map(r => {
      const ki = computeKiFemalePercent(r.subject, r.modelId);
      const real = REAL_FEMALE_PERCENT[r.subject] ?? 50;
      return { kiPercent: ki, correct: classifyBias(ki, real) };
    }),
    [],
  );

  const score = useMemo(
    () => answers.filter((a, i) => a === roundData[i].correct).length,
    [answers, roundData],
  );

  const round = ROUNDS[currentRound];
  const currentData = roundData[currentRound];
  const kiPercent = currentData?.kiPercent ?? 0;
  const correctCategory = currentData?.correct ?? 'spiegel';
  const realPercent = REAL_FEMALE_PERCENT[round?.subject] ?? 50;
  const diff = kiPercent - realPercent;
  const kontaktblattPath = round
    ? resolveAssetPath(`/images/generated/${round.subject}/${round.modelId}/_kontaktblatt.webp`)
    : '';

  const handleGuess = (cat: Category) => {
    if (showFeedback) return;
    const newAnswers = [...answers];
    newAnswers[currentRound] = cat;
    setAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (currentRound + 1 >= ROUNDS.length) {
      setPhase('result');
    } else {
      setCurrentRound(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setPhase('intro');
    setCurrentRound(0);
    setAnswers(Array(ROUNDS.length).fill(null));
    setShowFeedback(false);
  };

  // Phase: Intro
  if (phase === 'intro') {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
        <div className="grid md:grid-cols-3 gap-3 mb-5">
          {(['spiegel', 'verstaerker', 'erfinder'] as Category[]).map(cat => {
            const info = CATEGORY_INFO[cat];
            return (
              <div
                key={cat}
                className="rounded-xl border border-[var(--color-border)] p-4 text-center"
              >
                <span className="text-2xl block mb-2" role="img" aria-hidden="true">{info.icon}</span>
                <h4 className="font-semibold text-sm dark:text-[var(--color-primary)] text-slate-900 mb-1">
                  {info.label}
                </h4>
                <p className="text-xs dark:text-[var(--color-secondary)] text-slate-600">
                  {info.description}
                </p>
              </div>
            );
          })}
        </div>
        <div className="text-center">
          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
            Du siehst gleich 6 Datenpunkte: KI-Wert vs. Realität. Ordne jeden Fall einer Kategorie zu.
          </p>
          <button
            type="button"
            onClick={() => setPhase('classify')}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: areaColor }}
          >
            Los geht's
          </button>
        </div>
      </section>
    );
  }

  // Phase: Result
  if (phase === 'result') {
    const counts: Record<Category, number> = { spiegel: 0, verstaerker: 0, erfinder: 0 };
    for (const rd of roundData) counts[rd.correct]++;

    return (
      <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6 text-center">
        <div className="text-4xl font-bold mb-2" style={{ color: areaColor }}>
          {score} von {ROUNDS.length}
        </div>
        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4 max-w-md mx-auto">
          {score >= 5
            ? 'Stark! Du kannst Spiegel, Verstärker und Erfinder unterscheiden.'
            : score >= 3
              ? 'Die Grenzen sind fließend – aber du erkennst die Grundmuster.'
              : 'Die Kategorien sind nicht immer eindeutig. Schau dir die Erklärungen nochmal an.'}
        </p>
        <div className="flex justify-center gap-4 mb-4 text-xs">
          {(['spiegel', 'verstaerker', 'erfinder'] as Category[]).map(cat => (
            <span key={cat} className="dark:text-[var(--color-muted)] text-slate-500">
              {CATEGORY_INFO[cat].icon} {CATEGORY_INFO[cat].label}: {counts[cat]}×
            </span>
          ))}
        </div>
        <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mb-4 italic max-w-md mx-auto">
          Kein Modell ist durchgängig Spiegel oder Erfinder. Es hängt vom Fach und vom Modell ab.
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

  // Phase: Classify
  const isCorrect = answers[currentRound] === correctCategory;

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs dark:text-[var(--color-muted)] text-slate-500">
          Runde {currentRound + 1} / {ROUNDS.length}
        </span>
        <span className="text-xs font-medium" style={{ color: areaColor }}>
          {answers.filter((a, i) => a === roundData[i].correct).length} richtig
        </span>
      </div>

      {/* Data card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRound}
          initial={reduceMotion ? undefined : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-[var(--color-border)] p-4 mb-4"
        >
          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-[var(--color-border)] flex-shrink-0">
              <img
                src={kontaktblattPath}
                alt={`Kontaktblatt ${SUBJECT_LABELS[round.subject]}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm dark:text-[var(--color-primary)] text-slate-900 mb-1">
                {SUBJECT_LABELS[round.subject]}
              </h4>
              <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mb-2">
                Modell: {MODEL_LABELS[round.modelId]}
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium w-16" style={{ color: areaColor }}>KI:</span>
                  <div className="flex-1 h-4 rounded-full bg-[var(--color-border)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${kiPercent}%`, backgroundColor: areaColor }}
                    />
                  </div>
                  <span className="text-xs font-bold w-12 text-right" style={{ color: areaColor }}>
                    {kiPercent}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium w-16 dark:text-[var(--color-secondary)] text-slate-600">Real:</span>
                  <div className="flex-1 h-4 rounded-full bg-[var(--color-border)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${realPercent}%`, backgroundColor: 'var(--color-secondary)' }}
                    />
                  </div>
                  <span className="text-xs font-bold w-12 text-right dark:text-[var(--color-secondary)] text-slate-600">
                    {realPercent}%
                  </span>
                </div>
              </div>
              <p className="text-xs mt-2 dark:text-[var(--color-muted)] text-slate-500">
                weiblich dargestellt | Differenz: {diff > 0 ? '+' : ''}{diff} Prozentpunkte
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Category buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        {(['spiegel', 'verstaerker', 'erfinder'] as Category[]).map(cat => {
          const info = CATEGORY_INFO[cat];
          const isGuessed = answers[currentRound] === cat;
          const isCorrectCat = cat === correctCategory;
          let borderColor = 'var(--color-border)';
          let bgColor = 'transparent';

          if (showFeedback) {
            if (isGuessed && isCorrect) {
              borderColor = 'var(--color-success)';
              bgColor = 'color-mix(in srgb, var(--color-success) 10%, transparent)';
            } else if (isGuessed && !isCorrect) {
              borderColor = 'var(--color-error)';
              bgColor = 'color-mix(in srgb, var(--color-error) 10%, transparent)';
            } else if (isCorrectCat) {
              borderColor = 'var(--color-success)';
              bgColor = 'color-mix(in srgb, var(--color-success) 5%, transparent)';
            }
          }

          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleGuess(cat)}
              disabled={showFeedback}
              className="p-3 rounded-lg border text-left transition-colors disabled:cursor-default"
              style={{ borderColor, backgroundColor: bgColor }}
            >
              <span className="block text-sm font-medium dark:text-[var(--color-primary)] text-slate-900">
                <span role="img" aria-hidden="true">{info.icon}</span> {info.label}
              </span>
              <span className="block text-xs mt-0.5 dark:text-[var(--color-muted)] text-slate-500">
                {info.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p
            className="text-sm font-medium mb-2"
            style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-error)' }}
          >
            {isCorrect
              ? 'Richtig!'
              : `Nicht ganz – das war ein ${CATEGORY_INFO[correctCategory].label}.`}
          </p>
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-white"
            style={{ backgroundColor: areaColor }}
          >
            {currentRound + 1 < ROUNDS.length ? 'Weiter' : 'Ergebnis anzeigen'}
          </button>
        </motion.div>
      )}
    </section>
  );
}
