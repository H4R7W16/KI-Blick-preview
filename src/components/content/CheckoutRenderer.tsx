import { lazy, Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CheckoutElement } from '../../types/knowledge.types';

const DragDropAssignment = lazy(() => import('./DragDropAssignment'));
const ImageModelAssignment = lazy(() => import('./ImageModelAssignment'));

interface CheckoutRendererProps {
  checkout: CheckoutElement;
  isCompleted: boolean;
  onComplete: () => void;
  isInLearningPath?: boolean;
}

function getAreaColor(unitId: string): string {
  return unitId.startsWith('e')
    ? 'var(--color-area-einordnen)'
    : 'var(--color-area-verstehen)';
}

const FOLLOW_UP_SUGGESTIONS: Record<string, { text: string; link: string; linkLabel: string }> = {
  'e1-quiz': {
    text: 'Schau dir jetzt die Kunstlehrkraft-Serie im Entdecken-Bereich an und prüfe, ob du den Bias erkennst.',
    link: '/entdecken/kunstlehrkraft',
    linkLabel: 'Kunstlehrkraft entdecken',
  },
  'e2-assignment': {
    text: 'Vergleiche die Modelle bei der Informatiklehrkraft – welches Modell übertreibt am stärksten?',
    link: '/entdecken/informatiklehrkraft',
    linkLabel: 'Informatiklehrkraft entdecken',
  },
  'e3-reflection': {
    text: 'Erkunde die Sportlehrkraft-Serie und beobachte, wie ausgewogen die Darstellung dort ist.',
    link: '/entdecken/sportlehrkraft',
    linkLabel: 'Sportlehrkraft entdecken',
  },
  'v1-quiz': {
    text: 'Du weißt jetzt, wie ein Bild entsteht. Finde heraus, woher die Muster kommen, die das Modell gelernt hat.',
    link: '/verstehen/v2',
    linkLabel: 'Weiter zu V2: Was die KI gelernt hat',
  },
  'v2-quiz': {
    text: 'Du weißt jetzt, woher die Daten kommen. Lerne, KI-Bildserien systematisch zu lesen.',
    link: '/verstehen/v3',
    linkLabel: 'Weiter zu V3: Muster lesen',
  },
  'v3-quiz': {
    text: 'Du kannst jetzt Serien lesen. Entdecke, welche Muster die Modelle bei Bildern von Menschen zeigen.',
    link: '/entdecken',
    linkLabel: 'Zum Entdecken-Bereich',
  },
};

function FollowUpSuggestion({ checkoutId, isInLearningPath }: { checkoutId: string; isInLearningPath?: boolean }) {
  const suggestion = FOLLOW_UP_SUGGESTIONS[checkoutId];
  if (!suggestion || isInLearningPath) return null;

  return (
    <div className="mt-4 p-4 rounded-lg border border-[var(--color-area-entdecken)]/30 bg-[var(--color-area-entdecken)]/5">
      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-700 mb-2">
        {suggestion.text}
      </p>
      <Link
        to={suggestion.link}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-area-entdecken)] hover:underline"
      >
        {suggestion.linkLabel}
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>
    </div>
  );
}

function ReflectionCheckout({
  checkout,
  isCompleted,
  onComplete,
  isInLearningPath,
}: CheckoutRendererProps) {
  const storageKey = `ki-blick-reflection-${checkout.id}`;
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem(storageKey) ?? '';
    } catch {
      return '';
    }
  });
  const [submitted, setSubmitted] = useState(isCompleted);
  const areaColor = getAreaColor(checkout.unitId);

  const handleSubmit = () => {
    if (text.trim().length === 0) return;
    try {
      localStorage.setItem(storageKey, text);
    } catch {
      // localStorage may be unavailable
    }
    setSubmitted(true);
    onComplete();
  };

  return (
    <section className="mt-8 p-6 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white">
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{
            backgroundColor: `color-mix(in srgb, ${areaColor} 15%, transparent)`,
            color: areaColor,
          }}
        >
          Checkout
        </span>
        {submitted && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)]">
            abgeschlossen
          </span>
        )}
      </div>

      <h3 className="text-base font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-4">
        {checkout.question}
      </h3>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={submitted}
        rows={4}
        placeholder="Schreibe deine Antwort hier..."
        className="w-full rounded-lg border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50 dark:text-[var(--color-primary)] text-slate-900 p-3 text-sm resize-y focus:outline-none focus:border-[var(--color-accent)] disabled:opacity-60"
        aria-label={checkout.question}
      />

      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={text.trim().length === 0}
          className="mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40"
          style={{ backgroundColor: areaColor }}
        >
          Antwort speichern
        </button>
      )}

      {submitted && (
        <>
          <p className="mt-3 text-sm text-[var(--color-success)]">
            Deine Reflexion wurde gespeichert.
          </p>
          <FollowUpSuggestion checkoutId={checkout.id} isInLearningPath={isInLearningPath} />
        </>
      )}
    </section>
  );
}

export default function CheckoutRenderer({
  checkout,
  isCompleted,
  onComplete,
  isInLearningPath,
}: CheckoutRendererProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const areaColor = getAreaColor(checkout.unitId);

  const quizSolved = useMemo(() => {
    if (selectedAnswer === null || !checkout.options?.[selectedAnswer]) {
      return false;
    }
    return checkout.options[selectedAnswer].correct;
  }, [checkout.options, selectedAnswer]);

  if (checkout.type === 'reflection') {
    return (
      <ReflectionCheckout
        checkout={checkout}
        isCompleted={isCompleted}
        onComplete={onComplete}
        isInLearningPath={isInLearningPath}
      />
    );
  }

  if (checkout.type === 'assignment' && checkout.assignmentItems) {
    return (
      <section className="mt-8">
        <header className="mb-3">
          <div
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: areaColor }}
          >
            Checkout
          </div>
          <h3 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900">
            {checkout.question}
          </h3>
        </header>
        <Suspense
          fallback={
            <div className="rounded-lg border border-[var(--color-border)] p-4 text-sm dark:text-[var(--color-muted)] text-slate-500">
              Interaktiver Checkout wird geladen...
            </div>
          }
        >
          <DragDropAssignment
            items={checkout.assignmentItems}
            bucketLabels={checkout.assignmentBuckets}
            preamble={checkout.preamble}
          />
        </Suspense>
      </section>
    );
  }

  if (checkout.type === 'comparison' && checkout.comparisonItems) {
    return (
      <section className="mt-8">
        <header className="mb-3">
          <div
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: areaColor }}
          >
            Checkout
          </div>
          <h3 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900">
            {checkout.question}
          </h3>
        </header>
        <Suspense
          fallback={
            <div className="rounded-lg border border-[var(--color-border)] p-4 text-sm dark:text-[var(--color-muted)] text-slate-500">
              Interaktiver Checkout wird geladen...
            </div>
          }
        >
          <ImageModelAssignment items={checkout.comparisonItems} />
        </Suspense>
      </section>
    );
  }

  if (checkout.type !== 'quiz' || !checkout.options) {
    return null;
  }

  return (
    <section className="mt-8 p-6 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white">
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{
            backgroundColor: `color-mix(in srgb, ${areaColor} 15%, transparent)`,
            color: areaColor,
          }}
        >
          Checkout
        </span>
        {isCompleted && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)]">
            abgeschlossen
          </span>
        )}
      </div>

      <h3 className="text-base font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-4">
        {checkout.question}
      </h3>

      <div className="space-y-2 mb-4">
        {checkout.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = option.correct;
          let borderColor = 'border-[var(--color-border)]';
          let bgColor = '';

          if (showFeedback && isSelected) {
            borderColor = isCorrect
              ? 'border-[var(--color-success)]'
              : 'border-[var(--color-error)]';
            bgColor = isCorrect ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-error)]/10';
          }

          return (
            <button
              key={option.text}
              onClick={() => {
                if (showFeedback) return;
                setSelectedAnswer(index);
                setShowFeedback(true);
                if (option.correct) {
                  onComplete();
                }
              }}
              type="button"
              disabled={showFeedback}
              className={`w-full text-left p-3 rounded-lg border ${borderColor} ${bgColor} dark:text-[var(--color-secondary)] text-slate-700 text-sm transition-colors ${
                !showFeedback
                  ? 'cursor-pointer'
                  : ''
              } disabled:cursor-default`}
              style={
                !showFeedback
                  ? {
                      '--hover-border': `color-mix(in srgb, ${areaColor} 50%, transparent)`,
                    } as React.CSSProperties
                  : undefined
              }
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {showFeedback && selectedAnswer !== null && checkout.options[selectedAnswer] && (
        <div
          className={`p-3 rounded-lg text-sm ${
            quizSolved
              ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
              : 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
          }`}
        >
          {checkout.options[selectedAnswer].feedback}
          {!quizSolved && (
            <button
              type="button"
              onClick={() => {
                setSelectedAnswer(null);
                setShowFeedback(false);
              }}
              className="block mt-2 text-xs underline opacity-80 hover:opacity-100"
            >
              Erneut versuchen
            </button>
          )}
        </div>
      )}

      {showFeedback && quizSolved && (
        <FollowUpSuggestion checkoutId={checkout.id} isInLearningPath={isInLearningPath} />
      )}

      {!showFeedback && checkout.hint && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowHint(previous => !previous)}
            className="text-xs dark:text-[var(--color-muted)] text-slate-500 hover:dark:text-[var(--color-secondary)] hover:text-slate-700 transition-colors"
          >
            {showHint ? 'Hinweis verbergen' : 'Hinweis anzeigen'}
          </button>
          {showHint && (
            <p className="mt-2 text-sm dark:text-[var(--color-secondary)] text-slate-600 italic">
              {checkout.hint}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
