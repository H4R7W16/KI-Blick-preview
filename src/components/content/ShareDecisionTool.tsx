import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { resolveAssetPath } from '../../utils/assetPath';

type Decision = 'ja' | 'nein' | 'kommt-drauf-an' | null;

interface ScenarioImage {
  id: string;
  src: string;
  alt: string;
  context: string;
  reflections: Record<Exclude<Decision, null>, string>;
}

const SCENARIOS: ScenarioImage[] = [
  {
    id: 'share-1',
    src: '/images/generated/kunstlehrkraft/gpt-image-1-5/_kontaktblatt.webp',
    alt: 'Kontaktblatt Kunstlehrkraft – GPT Image-1.5',
    context: 'Kunstlehrkraft (GPT Image-1.5): ca. 81% weibliche Darstellungen (13 von 16 Bildern, 3 nicht eindeutig zuordenbar). Würdest du dieses Kontaktblatt in einer Präsentation zum Thema „Lehrkräfte" zeigen?',
    reflections: {
      ja: 'Überlege: Über 80% der Bilder zeigen weiblich gelesene Personen. Welches Bild von „Kunstlehrkraft" vermittelt das? Ist das repräsentativ für die Realität?',
      nein: 'Gute Überlegung. Eine einseitige Darstellung könnte den Eindruck vermitteln, Kunstunterricht sei ausschließlich Frauensache. In Wirklichkeit sind ca. 25% der Kunstlehrkräfte männlich.',
      'kommt-drauf-an': 'Genau – der Kontext ist entscheidend. In einer Präsentation über KI-Bias wäre das Kontaktblatt ein starkes Beispiel. Als allgemeine Illustration von Lehrkräften wäre es problematisch.',
    },
  },
  {
    id: 'share-2',
    src: '/images/generated/informatiklehrkraft/flux2pro/_kontaktblatt.webp',
    alt: 'Kontaktblatt Informatiklehrkraft – FLUX2 PRO',
    context: 'Informatiklehrkraft (FLUX2 PRO): Fast ausschließlich männliche Darstellungen. Eignet sich dieses Bild für ein Schulplakat „Informatik für alle"?',
    reflections: {
      ja: 'Bedenke: Ein Plakat „Informatik für alle" mit ausschließlich männlichen Darstellungen sendet eine widersprüchliche Botschaft. Fühlen sich alle Schüler:innen davon angesprochen?',
      nein: 'Richtig erkannt. Für einen inklusiven Kontext braucht es Darstellungen, die Vielfalt zeigen – nicht die Verstärkung bestehender Stereotypen.',
      'kommt-drauf-an': 'Die Intention „für alle" und die Darstellung „nur Männer" stehen in Spannung zueinander. Als KI-Bias-Beispiel: ja. Als Einladung zur Informatik: eher nein.',
    },
  },
  {
    id: 'share-3',
    src: '/images/generated/sportlehrkraft/nanobana/_kontaktblatt.webp',
    alt: 'Kontaktblatt Sportlehrkraft – Nano Bana',
    context: 'Sportlehrkraft (Nano Bana): Gemischte Darstellungen. Würdest du dieses Bild für einen Blogpost über KI-generierte Bilder nutzen?',
    reflections: {
      ja: 'Eine gemischtere Darstellung wirkt auf den ersten Blick unproblematisch. Aber auch hier lohnt sich ein zweiter Blick: Welche Sportarten werden gezeigt? Welche Körperbilder?',
      nein: 'Auch wenn die Geschlechterverteilung ausgeglichener ist, gibt es möglicherweise andere Muster – z.B. bei Körpertypen oder Sportarten. Gute kritische Haltung!',
      'kommt-drauf-an': 'Genau. Die relative Balance beim Geschlecht ist besser – aber „unproblematisch" heißt nicht automatisch „gut". Der Verwendungskontext bestimmt, ob das Bild angemessen ist.',
    },
  },
];

export default function ShareDecisionTool() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const reduceMotion = useReducedMotion();

  const handleDecision = (scenarioId: string, decision: Exclude<Decision, null>) => {
    setDecisions(prev => ({ ...prev, [scenarioId]: decision }));
  };

  return (
    <section
      className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6"
      aria-label="Würdest du teilen? Reflexionstool zu KI-generierten Bildern"
    >
      <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-1">
        Würdest du teilen?
      </h4>
      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-6">
        Schau dir die folgenden KI-generierten Bildserien an. Entscheide: Würdest du dieses Bild in einer Schulpräsentation verwenden?
      </p>

      <div className="space-y-6">
        {SCENARIOS.map(scenario => {
          const decision = decisions[scenario.id];

          return (
            <div
              key={scenario.id}
              className="rounded-xl border border-[var(--color-border)] overflow-hidden"
            >
              <img
                src={resolveAssetPath(scenario.src)}
                alt={scenario.alt}
                loading="lazy"
                className="w-full h-auto"
              />
              <div className="p-4">
                <p className="text-sm dark:text-[var(--color-primary)] text-slate-900 mb-3">
                  {scenario.context}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {([
                    ['ja', 'Ja'],
                    ['nein', 'Nein'],
                    ['kommt-drauf-an', 'Kommt drauf an'],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleDecision(scenario.id, value)}
                      disabled={decision !== undefined}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        decision === value
                          ? 'border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/10'
                          : 'border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600'
                      } disabled:cursor-default`}
                      aria-label={`${label} für ${scenario.alt}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {decision && (
                    <motion.div
                      initial={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="rounded-lg p-3 text-sm"
                      style={{
                        backgroundColor: 'rgba(245,158,11,0.05)',
                        borderLeft: '3px solid #F59E0B',
                      }}
                    >
                      <p className="dark:text-[var(--color-secondary)] text-slate-600">
                        {scenario.reflections[decision]}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
