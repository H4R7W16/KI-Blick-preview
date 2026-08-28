import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getV2ImagePath, V2_LANGUAGE_VARIANTS } from '../../data/v2Images';

const TABS = ['Was ist ein Trainingspaar?', 'Wenn die Beschreibung fehlt', 'Sprache formt Bilder'] as const;
const MODELS = [
  { id: 'flux2pro', label: 'FLUX2 PRO' },
  { id: 'gpt-image-1-5', label: 'GPT Image-1.5' },
  { id: 'nanobana', label: 'Nano Bana' },
] as const;

const PAIR_OPTIONS = [
  { text: 'A loaf of freshly baked sourdough bread on a wooden cutting board', correct: true },
  { text: 'Kitchen interior with wooden furniture', correct: false },
  { text: 'Flour and baking ingredients', correct: false },
];

const ALT_QUALITIES = [
  {
    label: 'Gut',
    text: 'A loaf of freshly baked sourdough bread on a wooden cutting board',
    explanation: 'Die KI lernt eine präzise Verbindung: Dieses visuelle Muster gehört zu „Sauerteigbrot auf einem Holzbrett". Perfekt.',
  },
  {
    label: 'Schlecht',
    text: 'image_0472.jpg',
    explanation: 'Die KI lernt nichts Brauchbares. Ein Dateiname enthält keine visuelle Beschreibung – das Bild wird quasi ignoriert.',
  },
  {
    label: 'Falsch',
    text: 'Delicious cake for birthday party',
    explanation: 'Die KI lernt eine falsche Verbindung: Sie verknüpft das Brot-Bild mit dem Konzept „Geburtstagstorte". Das verzerrt spätere Ergebnisse.',
  },
];

const VARIANT_DESCRIPTIONS: Record<string, string> = {
  brot: 'Auf Deutsch erzeugt das Modell Mischbrote, Vollkornlaibe, Brötchen – die Bildwelt der deutschsprachigen Trainingsdaten.',
  bread: 'Englisch dominiert die Trainingsdaten. Das Ergebnis: Toast, Sandwichbrot, Supermarkt-Ästhetik.',
  pain: '⚡ Überraschung: Kein Brot! Alle drei Modelle zeigen Schmerz. Das englische „pain" überwiegt in den Trainingsdaten das französische „pain" (Brot).',
  'le-pain': 'Zwei Buchstaben Unterschied („Le") – und plötzlich erscheint Baguette statt Schmerz. Der Artikel disambiguiert.',
  'pan-jp': 'Japanisches Brot: Shokupan, Melon Pan, Anpan. Die Modelle zeigen eine eigenständige Brotkultur.',
  'mianbao-cn': 'Chinesisches 面包 zeigt überraschend europäisches Brot – der Begriff kam mit westlichem Einfluss nach China.',
  'khubz-ar': 'Arabisches Fladenbrot, Pita, Olivenöl – eine klar andere Brotkultur als in den englischsprachigen Trainingsdaten.',
  'roti-hi': 'Chapati, Roti, Ghee – aber weniger visuell divers als die englischen Ergebnisse. Unterrepräsentation macht sich bemerkbar.',
};

const VARIANT_FLAGS: Record<string, string> = {
  brot: '🇩🇪',
  bread: '🇬🇧',
  pain: '🇬🇧/🇫🇷',
  'le-pain': '🇫🇷',
  'pan-jp': '🇯🇵',
  'mianbao-cn': '🇨🇳',
  'khubz-ar': '🇸🇦',
  'roti-hi': '🇮🇳',
};

function Tab1({ areaColor }: { areaColor: string }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="md:w-1/3">
        <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
          <img
            src={getV2ImagePath('brot', 'flux2pro', 0)}
            alt="Brot-Bild für Trainingspaar"
            loading="lazy"
            className="w-full aspect-square object-cover"
          />
        </div>
      </div>
      <div className="md:w-2/3 space-y-2">
        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-3">
          Welche Beschreibung passt zu diesem Bild?
        </p>
        {PAIR_OPTIONS.map((opt, i) => {
          const isSelected = selected === i;
          const showResult = selected !== null;
          let borderStyle = 'border-[var(--color-border)]';
          let bgStyle = '';
          if (showResult && isSelected) {
            borderStyle = opt.correct ? 'border-[var(--color-success)]' : 'border-[var(--color-error)]';
            bgStyle = opt.correct ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-error)]/10';
          } else if (showResult && opt.correct) {
            borderStyle = 'border-[var(--color-success)]';
            bgStyle = 'bg-[var(--color-success)]/5';
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => { if (selected === null) setSelected(i); }}
              disabled={selected !== null}
              className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${borderStyle} ${bgStyle} dark:text-[var(--color-secondary)] text-slate-700 disabled:cursor-default`}
            >
              <code className="text-xs">{opt.text}</code>
            </button>
          );
        })}
        {selected !== null && (
          <p className="text-sm mt-2" style={{ color: areaColor }}>
            Die KI hat aus Millionen solcher Paare gelernt. Je genauer die Beschreibung, desto besser das gelernte Muster.
          </p>
        )}
      </div>
    </div>
  );
}

function Tab2({ areaColor }: { areaColor: string }) {
  const [quality, setQuality] = useState(0);
  const q = ALT_QUALITIES[quality];

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="md:w-1/3">
        <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
          <img
            src={getV2ImagePath('brot', 'flux2pro', 0)}
            alt="Brot-Bild mit verschiedenen Alt-Text-Qualitäten"
            loading="lazy"
            className="w-full aspect-square object-cover"
          />
        </div>
      </div>
      <div className="md:w-2/3">
        <div className="flex gap-2 mb-3">
          {ALT_QUALITIES.map((aq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuality(i)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={
                quality === i
                  ? { backgroundColor: areaColor, color: '#fff' }
                  : { border: '1px solid var(--color-border)', color: 'var(--color-secondary)' }
              }
            >
              {aq.label}
            </button>
          ))}
        </div>
        <div className="p-3 rounded-lg border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50 mb-3">
          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mb-1">Alt-Text:</p>
          <code className="text-sm dark:text-[var(--color-primary)] text-slate-900">{q.text}</code>
        </div>
        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">
          {q.explanation}
        </p>
      </div>
    </div>
  );
}

function Tab3({ areaColor, reduceMotion }: { areaColor: string; reduceMotion: boolean | null }) {
  const [activeVariant, setActiveVariant] = useState('brot');
  const [activeModel, setActiveModel] = useState('flux2pro');
  const [prevVariant, setPrevVariant] = useState('brot');

  const isPainTransition = (prevVariant === 'pain' && activeVariant === 'le-pain') ||
    (prevVariant === 'le-pain' && activeVariant === 'pain');

  const handleVariantChange = (slug: string) => {
    setPrevVariant(activeVariant);
    setActiveVariant(slug);
  };

  const description = VARIANT_DESCRIPTIONS[activeVariant] ?? '';

  return (
    <div>
      {/* Language buttons */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {V2_LANGUAGE_VARIANTS.map(v => (
          <button
            key={v.promptSlug}
            type="button"
            onClick={() => handleVariantChange(v.promptSlug)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={
              activeVariant === v.promptSlug
                ? { backgroundColor: areaColor, color: '#fff' }
                : { border: '1px solid var(--color-border)', color: 'var(--color-secondary)' }
            }
          >
            {v.promptSlug === 'pain'
              ? `🇫🇷 ${v.prompt} 🇬🇧`
              : `${VARIANT_FLAGS[v.promptSlug] ?? ''} ${v.prompt}`.trim()}
          </button>
        ))}
      </div>

      {/* Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeVariant}-${activeModel}`}
          initial={reduceMotion ? undefined : { opacity: 0, scale: isPainTransition ? 0.9 : 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: isPainTransition ? 0.5 : 0.25 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4"
        >
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="rounded-lg overflow-hidden border border-[var(--color-border)]">
              <img
                src={getV2ImagePath(activeVariant, activeModel, i)}
                alt={`${V2_LANGUAGE_VARIANTS.find(v => v.promptSlug === activeVariant)?.prompt ?? activeVariant}, Bild ${i + 1}`}
                loading="lazy"
                className="w-full aspect-square object-cover"
              />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Model switcher */}
      <div className="flex gap-2 mb-4 justify-center">
        {MODELS.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveModel(m.id)}
            className="px-3 py-1 rounded-lg text-[11px] font-medium transition-colors"
            style={
              activeModel === m.id
                ? { backgroundColor: `color-mix(in srgb, ${areaColor} 15%, transparent)`, color: areaColor }
                : { color: 'var(--color-muted)' }
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={activeVariant}
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed"
        >
          {description}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function TrainingPairBuilder() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-5 -mx-1 px-1 border-b border-[var(--color-border)]">
        {TABS.map((tab, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveTab(i)}
            className="flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap rounded-t-lg"
            style={
              activeTab === i
                ? { color: areaColor, borderBottom: `2px solid ${areaColor}` }
                : { color: 'var(--color-muted)' }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 0 && <Tab1 areaColor={areaColor} />}
          {activeTab === 1 && <Tab2 areaColor={areaColor} />}
          {activeTab === 2 && <Tab3 areaColor={areaColor} reduceMotion={reduceMotion} />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
