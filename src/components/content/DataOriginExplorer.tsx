import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';

interface Region {
  name: string;
  trainingPct: number;
  populationPct: number;
  color: string;
  explanation: string;
  breadLink: string;
}

const REGIONS: Region[] = [
  {
    name: 'Nordamerika + UK',
    trainingPct: 42,
    populationPct: 6,
    color: '#0EA5E9',
    explanation: 'Englisch ist die dominante Sprache im Internet und in den meisten großen Datensätzen. Plattformen wie Flickr, Reddit und Wikipedia sind überwiegend englischsprachig.',
    breadLink: 'Deshalb zeigt „Bread" Toastbrot und Sandwichästhetik – die visuellen Muster des englischsprachigen Internet.',
  },
  {
    name: 'Europa (ohne UK)',
    trainingPct: 27,
    populationPct: 9,
    color: '#38BDF8',
    explanation: 'Westeuropäische Sprachen (Deutsch, Französisch, Spanisch) sind gut vertreten, osteuropäische weniger. Die digitale Infrastruktur sorgt für viele Online-Inhalte.',
    breadLink: '„Brot" und „Le pain" erzeugen kulturell passende Bilder – europäische Sprachen sind ausreichend repräsentiert.',
  },
  {
    name: 'Ostasien',
    trainingPct: 18,
    populationPct: 22,
    color: '#7DD3FC',
    explanation: 'China, Japan und Südkorea haben eigene, große Internetökosysteme. Einige Inhalte sind für westliche Crawler schwer zugänglich (Great Firewall, andere Plattformen).',
    breadLink: 'Deshalb zeigen パン und 面包 unterschiedliche Bildwelten als Bread – andere Plattformen, andere Brotkultur.',
  },
  {
    name: 'Lateinamerika',
    trainingPct: 7,
    populationPct: 8,
    color: '#94A3B8',
    explanation: 'Spanisch und Portugiesisch sind in den Daten vertreten, aber weniger als Englisch. Regionale Vielfalt geht oft unter.',
    breadLink: 'Lateinamerikanische Brottraditionen (Pan dulce, Arepa) tauchen selten in den Ergebnissen auf.',
  },
  {
    name: 'Süd-/Südostasien',
    trainingPct: 4,
    populationPct: 35,
    color: '#64748B',
    explanation: 'Die bevölkerungsreichste Region der Welt ist in den Trainingsdaten massiv unterrepräsentiert. Hindi, Bengali, Tamil und viele weitere Sprachen fehlen weitgehend.',
    breadLink: '„रोटी" zeigt weniger visuelle Vielfalt als „Bread" – ein direktes Zeichen der Unterrepräsentation.',
  },
  {
    name: 'Afrika',
    trainingPct: 2,
    populationPct: 20,
    color: '#475569',
    explanation: 'Der Kontinent mit der größten sprachlichen Vielfalt ist in den Datensätzen kaum vertreten. Sprachen wie Swahili (mkate) oder Yoruba fehlen fast vollständig.',
    breadLink: 'Sprachen wie Swahili (mkate) sind in den Datensätzen kaum vertreten – die KI hat wenig Material zum Lernen.',
  },
];

function Bar({ value, maxValue, color, label }: { value: number; maxValue: number; color: string; label: string }) {
  const width = (value / maxValue) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 text-right text-[11px] font-mono dark:text-[var(--color-muted)] text-slate-500">
        {value}%
      </div>
      <div className="flex-1 h-5 rounded-full dark:bg-[var(--color-surface)] bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${width}%`, backgroundColor: color }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  );
}

export default function DataOriginExplorer() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();
  const [activeRegion, setActiveRegion] = useState<number | null>(null);

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      <div className="space-y-4">
        {REGIONS.map((region, i) => (
          <div key={region.name}>
            <button
              type="button"
              onClick={() => setActiveRegion(activeRegion === i ? null : i)}
              className="w-full text-left"
              aria-expanded={activeRegion === i}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900">
                  {region.name}
                </span>
                <svg
                  className="w-4 h-4 transition-transform dark:text-[var(--color-muted)] text-slate-400"
                  style={{ transform: activeRegion === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-20 dark:text-[var(--color-muted)] text-slate-500">Trainingsdaten</span>
                  <div className="flex-1">
                    <Bar value={region.trainingPct} maxValue={50} color={region.color} label={`${region.name} Trainingsanteil`} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-20 dark:text-[var(--color-muted)] text-slate-500">Bevölkerung</span>
                  <div className="flex-1">
                    <Bar value={region.populationPct} maxValue={50} color="var(--color-border)" label={`${region.name} Bevölkerungsanteil`} />
                  </div>
                </div>
              </div>
            </button>

            <AnimatePresence>
              {activeRegion === i && (
                <motion.div
                  initial={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div
                    className="mt-2 p-3 rounded-lg border text-sm leading-relaxed"
                    style={{
                      borderColor: `color-mix(in srgb, ${areaColor} 30%, transparent)`,
                      backgroundColor: `color-mix(in srgb, ${areaColor} 5%, transparent)`,
                    }}
                  >
                    <p className="dark:text-[var(--color-secondary)] text-slate-600 mb-2">
                      {region.explanation}
                    </p>
                    <p className="text-xs italic" style={{ color: areaColor }}>
                      {region.breadLink}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] dark:text-[var(--color-muted)] text-slate-500 italic">
        Hinweis: Die Zahlen sind didaktische Näherungen für den Unterrichtskontext.
      </p>
    </section>
  );
}
