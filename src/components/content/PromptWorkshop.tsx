import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { resolveAssetPath } from '../../utils/assetPath';

interface Strategy {
  id: string;
  title: string;
  prompt: string;
  explanation: string;
  advantages: string[];
  limitations: string[];
}

const STRATEGIES: Strategy[] = [
  {
    id: 'diverse',
    title: 'Diversität explizit machen',
    prompt: '„Eine diverse Gruppe von Mathematiklehrkräften verschiedenen Alters und Geschlechts"',
    explanation:
      'Du weist die KI direkt an, vielfältige Darstellungen zu erzeugen. Das funktioniert oft gut, weil das Modell die Begriffe „divers", „verschiedenen Alters" usw. verarbeiten kann.',
    advantages: [
      'Einfach umzusetzen',
      'Direkte Steuerung der Darstellung',
      'Funktioniert bei den meisten Modellen',
    ],
    limitations: [
      'Die KI entscheidet trotzdem, was „divers" bedeutet',
      'Kann zu künstlich wirkenden Ergebnissen führen',
      'Löst nicht das Grundproblem der Trainingsdaten',
    ],
  },
  {
    id: 'counter',
    title: 'Stereotyp brechen',
    prompt: '„Eine junge Frau unterrichtet Informatik in einem modernen Klassenzimmer"',
    explanation:
      'Du formulierst bewusst gegen das stereotype Muster. Statt der KI „Informatiklehrkraft" zu überlassen, gibst du Geschlecht, Alter und Kontext explizit vor.',
    advantages: [
      'Erzeugt gezielt unterrepräsentierte Darstellungen',
      'Macht das Stereotyp sichtbar, indem man es durchbricht',
      'Nützlich für Präsentationen und Unterrichtsmaterial',
    ],
    limitations: [
      'Kann als „Gegenstereotyp" selbst vereinfachend wirken',
      'Erzeugt keine natürliche Vielfalt, sondern gezielte Korrektur',
      'Setzt voraus, dass man das Stereotyp kennt',
    ],
  },
  {
    id: 'context',
    title: 'Kontext ergänzen',
    prompt: '„Mathematiklehrkraft in einer deutschen Gesamtschule, realistisch"',
    explanation:
      'Du gibst der KI mehr Kontext, damit sie nicht auf globale Stereotypen zurückgreifen muss. „Deutsche Gesamtschule" und „realistisch" lenken die Generierung in einen konkreteren Rahmen.',
    advantages: [
      'Natürlichere Ergebnisse als reine Diversitäts-Anweisungen',
      'Bezug zum tatsächlichen Einsatzkontext',
      'Reduziert den Einfluss globaler Stereotypen',
    ],
    limitations: [
      'Garantiert keine diverse Darstellung',
      'Effekt hängt stark vom Modell ab',
      'Das Wort „realistisch" wird von KI unterschiedlich interpretiert',
    ],
  },
];

export default function PromptWorkshop() {
  const [activeStrategy, setActiveStrategy] = useState(0);
  const reduceMotion = useReducedMotion();
  const kontaktblattSrc = resolveAssetPath(
    '/images/generated/mathematiklehrkraft/flux2pro/_kontaktblatt.webp'
  );

  return (
    <section
      className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6"
      aria-label="Prompt-Workshop: Drei Strategien für reflektiertes Prompting"
    >
      <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-1">
        Der Prompt-Workshop
      </h4>
      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
        Der Prompt „Mathematiklehrkraft" erzeugt bei FLUX2 PRO diese 16 Bilder. Was könnte ein reflektierter Prompt ändern?
      </p>

      {/* Original contact sheet */}
      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden mb-6">
        <img
          src={kontaktblattSrc}
          alt="Kontaktblatt: 16 Bilder für den Prompt Mathematiklehrkraft (FLUX2 PRO) – überwiegend männlich"
          loading="lazy"
          className="w-full h-auto"
        />
        <p className="px-3 py-2 text-xs dark:text-[var(--color-muted)] text-slate-500">
          Originaler Prompt: „Mathematiklehrkraft" – FLUX2 PRO
        </p>
      </div>

      {/* Strategy tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {STRATEGIES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveStrategy(i)}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors ${
              activeStrategy === i
                ? 'border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/10'
                : 'border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600'
            }`}
            aria-pressed={activeStrategy === i}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Strategy detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStrategy}
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-[var(--color-border)] p-4"
        >
          <p className="text-sm font-mono dark:text-[#F59E0B] text-amber-700 mb-3 bg-[#F59E0B]/5 rounded-lg p-3">
            {STRATEGIES[activeStrategy].prompt}
          </p>

          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
            {STRATEGIES[activeStrategy].explanation}
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <h6 className="text-xs font-semibold text-[var(--color-success)] mb-2">Vorteile</h6>
              <ul className="space-y-1">
                {STRATEGIES[activeStrategy].advantages.map(a => (
                  <li key={a} className="text-xs dark:text-[var(--color-secondary)] text-slate-600 flex items-start gap-1.5">
                    <span className="text-[var(--color-success)] mt-0.5">+</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h6 className="text-xs font-semibold text-[var(--color-warning)] mb-2">Grenzen</h6>
              <ul className="space-y-1">
                {STRATEGIES[activeStrategy].limitations.map(l => (
                  <li key={l} className="text-xs dark:text-[var(--color-secondary)] text-slate-600 flex items-start gap-1.5">
                    <span className="text-[var(--color-warning)] mt-0.5">–</span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
