import { useState } from 'react';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';

interface CheckpointBlockProps {
  question: string;
  answer: string;
  hint?: string;
}

export default function CheckpointBlock({ question, answer, hint }: CheckpointBlockProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const areaColor = getAreaColorVar(useArea());

  return (
    <section className="rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4">
      <div
        className="text-xs uppercase tracking-wider mb-2"
        style={{ color: areaColor }}
      >
        Verständnisfrage
      </div>
      <p className="text-sm md:text-base dark:text-[var(--color-primary)] text-slate-900 mb-3">
        {question}
      </p>

      <div className="flex flex-wrap gap-2 mb-2">
        <button
          type="button"
          onClick={() => setShowAnswer(previous => !previous)}
          className="px-3 py-1.5 rounded-md text-sm border"
          style={{ borderColor: areaColor, color: areaColor }}
        >
          {showAnswer ? 'Antwort verbergen' : 'Antwort aufdecken'}
        </button>
        {hint && (
          <button
            type="button"
            onClick={() => setShowHint(previous => !previous)}
            className="px-3 py-1.5 rounded-md text-sm border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-700"
          >
            {showHint ? 'Hinweis verbergen' : 'Hinweis anzeigen'}
          </button>
        )}
      </div>

      {showHint && hint && (
        <p className="text-sm italic dark:text-[var(--color-muted)] text-slate-500 mb-2">
          Hinweis: {hint}
        </p>
      )}

      {showAnswer && (
        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-700">
          {answer}
        </p>
      )}
    </section>
  );
}
