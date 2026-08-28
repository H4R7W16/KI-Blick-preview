import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { resolveAssetPath } from '../../utils/assetPath';

interface BiasType {
  id: string;
  label: string;
  color: string;
  description: string;
  example: string;
  imagePath: string | null;
  imageAlt: string;
  connection: string;
}

const BIAS_TYPES: BiasType[] = [
  {
    id: 'gender',
    label: 'Gender-Bias',
    color: '#8B5CF6',
    description: 'KI-Modelle zeigen bei bestimmten Berufen eine stark verzerrte Geschlechterverteilung. Informatik wird fast ausschließlich männlich dargestellt, Kunst fast ausschließlich weiblich.',
    example: 'Informatiklehrkraft = 100% männlich (FLUX2 PRO) – kein einziges weiblich gelesenes Bild',
    imagePath: '/images/generated/informatiklehrkraft/flux2pro/_kontaktblatt.webp',
    imageAlt: 'Kontaktblatt Informatiklehrkraft – fast ausschließlich männliche Darstellungen',
    connection: 'Ursache: In den Trainingsdaten sind Informatik-Kontexte häufiger mit männlichen Personen verknüpft.',
  },
  {
    id: 'cultural',
    label: 'Kultureller Bias',
    color: '#0EA5E9',
    description: 'Die KI zeigt Länder und Kulturen als Stereotypen: Kenia immer ländlich, Japan immer mit Kirschblüten, Deutschland immer modern. Die Realität ist vielfältiger.',
    example: 'Kenia = immer ländlich, nie urban',
    imagePath: '/images/einordnen/schule-in-kenia/flux2pro/schule-in-kenia_0.webp',
    imageAlt: 'Schule in Kenia – stereotyp ländliche Darstellung',
    connection: 'Ursache: Bilder aus dem globalen Süden sind in den Trainingsdaten unterrepräsentiert und oft stereotyp.',
  },
  {
    id: 'age',
    label: 'Alters-Bias',
    color: '#F59E0B',
    description: 'KI-generierte Lehrkräfte sind fast immer zwischen 35 und 55 Jahren alt. Junge Berufseinsteiger:innen und erfahrene ältere Lehrkräfte fehlen systematisch.',
    example: 'Lehrkräfte immer 35–55 Jahre',
    imagePath: '/images/generated/mathematiklehrkraft/flux2pro/_kontaktblatt.webp',
    imageAlt: 'Kontaktblatt Mathematiklehrkraft – homogene Altersverteilung',
    connection: 'Ursache: Stock-Fotos von Lehrkräften zeigen überwiegend die „mittlere" Altersgruppe.',
  },
  {
    id: 'representation',
    label: 'Darstellungs-Bias',
    color: '#10B981',
    description: 'Die KI verwendet immer dieselben Requisiten und Settings: Informatik = Whiteboard + Code, Sport = Turnhalle + Pfeife. Diese Klischees verengen das Bild von Unterricht.',
    example: 'Informatik = immer Whiteboard + Code',
    imagePath: '/images/generated/sportlehrkraft/nanobana/_kontaktblatt.webp',
    imageAlt: 'Kontaktblatt Sportlehrkraft – stereotype Requisiten und Settings',
    connection: 'Ursache: Trainingsdaten verknüpfen Berufe mit bestimmten visuellen Markern.',
  },
  {
    id: 'ableism',
    label: 'Ability-Bias / Ableismus',
    color: '#F43F5E',
    description: 'Menschen mit Behinderung sind in KI-generierten Bildern nicht nur unterrepräsentiert – sie sind vollständig unsichtbar. 480 Lehrkraft-Bilder, 0 Rollstühle. Kein einziges Default-Bild zeigt eine Person mit sichtbarer Behinderung.',
    example: '0 von 480 – totale Unsichtbarkeit',
    imagePath: null,
    imageAlt: '',
    connection: 'Diese totale Unsichtbarkeit ist eine andere Qualität als Geschlechter-Bias (wo beide Geschlechter vorkommen, nur ungleich verteilt). Hier fehlt eine ganze Gruppe komplett.',
  },
];

export default function BiasSpectrumExplorer() {
  const reduceMotion = useReducedMotion();
  const [expandedType, setExpandedType] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
      <div className="space-y-2">
        {BIAS_TYPES.map(bias => {
          const isExpanded = expandedType === bias.id;
          return (
            <div
              key={bias.id}
              className="rounded-xl border transition-colors"
              style={{
                borderColor: isExpanded
                  ? `color-mix(in srgb, ${bias.color} 50%, transparent)`
                  : 'var(--color-border)',
              }}
            >
              <button
                type="button"
                onClick={() => setExpandedType(isExpanded ? null : bias.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
                aria-expanded={isExpanded}
              >
                <span
                  className="flex-shrink-0 w-3 h-3 rounded-full"
                  style={{ backgroundColor: bias.color }}
                />
                <span className="font-semibold text-sm dark:text-[var(--color-primary)] text-slate-900 flex-1">
                  {bias.label}
                </span>
                <span className="text-xs dark:text-[var(--color-muted)] text-slate-500 hidden md:inline">
                  {bias.example}
                </span>
                <svg
                  className="ml-2 w-4 h-4 flex-shrink-0 transition-transform"
                  style={{
                    color: 'var(--color-muted)',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={reduceMotion ? { height: 'auto' } : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">
                        {bias.description}
                      </p>

                      {bias.imagePath ? (
                        <div className="rounded-lg overflow-hidden border border-[var(--color-border)] max-w-sm">
                          <img
                            src={resolveAssetPath(bias.imagePath)}
                            alt={bias.imageAlt}
                            className="w-full h-auto object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div
                          className="rounded-lg max-w-sm p-6 text-center"
                          style={{
                            border: `2px dashed ${bias.color}`,
                            backgroundColor: `color-mix(in srgb, ${bias.color} 5%, transparent)`,
                          }}
                        >
                          <span className="text-3xl font-bold block" style={{ color: bias.color }}>
                            0 von 480
                          </span>
                          <span className="text-xs dark:text-[var(--color-muted)] text-slate-500 mt-1 block">
                            Kein einziges Default-Bild zeigt eine Person mit sichtbarer Behinderung.
                          </span>
                        </div>
                      )}

                      <div
                        className="rounded-lg p-3 text-xs"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${bias.color} 8%, transparent)`,
                        }}
                      >
                        <span className="font-medium" style={{ color: bias.color }}>
                          Verbindung zu V2:
                        </span>{' '}
                        <span className="dark:text-[var(--color-secondary)] text-slate-600">
                          {bias.connection}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-sm dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed text-center">
        Bias hat viele Formen. Geschlecht ist die auffälligste – aber nicht die einzige.
        Alle haben dieselbe Ursache: die Muster in den Trainingsdaten.
      </p>
    </section>
  );
}
