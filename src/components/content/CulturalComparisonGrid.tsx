import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getSchoolImagePath, getClassroomImagePath, EINORDNEN_COUNTRIES } from '../../data/einordnenImages';
import type { ModelId } from '../../types/image.types';

const MODEL_IDS: ModelId[] = ['flux2pro', 'gpt-image-1-5', 'nanobana'];
const MODEL_LABELS: Record<ModelId, string> = {
  flux2pro: 'FLUX2 PRO',
  'gpt-image-1-5': 'GPT Image-1.5',
  nanobana: 'Nano Bana',
};

const OBSERVATIONS: Record<string, { gebaeude: string; ausstattung: string; personen: string; umgebung: string }> = {
  deutschland: {
    gebaeude: 'Glas, modern, hell',
    ausstattung: 'Smartboard, Laptops',
    personen: 'Divers, casual',
    umgebung: 'Urban/Suburban',
  },
  japan: {
    gebaeude: 'Beton, funktional, Kirschblüte',
    ausstattung: 'Kreidetafel, Uniformen',
    personen: 'Uniform, homogen',
    umgebung: 'Urban, Kirschblüten',
  },
  kenia: {
    gebaeude: 'Wellblech, einfach, ländlich',
    ausstattung: 'Tafel, wenige Bücher',
    personen: 'Uniformen, große Klassen',
    umgebung: 'Ländlich, rote Erde',
  },
  brasilien: {
    gebaeude: 'Bunt, offen, tropisch',
    ausstattung: 'Tafeln, einfach',
    personen: 'Bunt gekleidet',
    umgebung: 'Tropisch, Flaggen',
  },
};

const DIMENSION_LABELS = [
  { key: 'gebaeude', label: 'Gebäude' },
  { key: 'ausstattung', label: 'Ausstattung' },
  { key: 'personen', label: 'Personen' },
  { key: 'umgebung', label: 'Umgebung' },
] as const;

function ImageCell({
  getPath,
  alt,
}: {
  getPath: (index: number) => string;
  alt: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-1">
      <div className="aspect-square rounded-lg overflow-hidden border border-[var(--color-border)]">
        <img
          src={getPath(activeIndex)}
          alt={`${alt} – Bild ${activeIndex + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex gap-1 justify-center">
        {[0, 1, 2, 3].map(i => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-label={`${alt} – Variante ${i + 1} anzeigen`}
            className="w-8 h-8 rounded overflow-hidden border transition-opacity"
            style={{
              opacity: activeIndex === i ? 1 : 0.5,
              borderColor: activeIndex === i ? 'var(--color-accent)' : 'var(--color-border)',
            }}
          >
            <img src={getPath(i)} alt="" role="presentation" className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CulturalComparisonGrid() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();

  const [selectedCountry, setSelectedCountry] = useState('deutschland');
  const [compareMode, setCompareMode] = useState(false);
  const [compareCountry, setCompareCountry] = useState('japan');
  const [selectedModel, setSelectedModel] = useState<ModelId>('flux2pro');

  const country = EINORDNEN_COUNTRIES.find(c => c.countryId === selectedCountry)!;
  const obs = OBSERVATIONS[selectedCountry];

  const countriesToShow = compareMode
    ? [selectedCountry, compareCountry]
    : [selectedCountry];

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
      {/* Country tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {EINORDNEN_COUNTRIES.map(c => {
          const isActive = selectedCountry === c.countryId;
          return (
            <button
              key={c.countryId}
              type="button"
              onClick={() => {
                setSelectedCountry(c.countryId);
                setCompareMode(false);
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              style={
                isActive
                  ? { backgroundColor: areaColor, borderColor: areaColor, color: '#fff' }
                  : { borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }
              }
            >
              {c.countryName}
            </button>
          );
        })}
      </div>

      {/* Model selector (mobile: dropdown, desktop: buttons) */}
      <div className="mb-4">
        <div className="hidden md:flex gap-1.5">
          {MODEL_IDS.map(id => (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedModel(id)}
              className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors"
              style={
                selectedModel === id
                  ? { backgroundColor: `color-mix(in srgb, ${areaColor} 15%, transparent)`, borderColor: areaColor, color: areaColor }
                  : { borderColor: 'var(--color-border)', color: 'var(--color-muted)' }
              }
            >
              {MODEL_LABELS[id]}
            </button>
          ))}
        </div>
        <select
          value={selectedModel}
          onChange={e => setSelectedModel(e.target.value as ModelId)}
          className="md:hidden w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm dark:text-[var(--color-secondary)] text-slate-700"
        >
          {MODEL_IDS.map(id => (
            <option key={id} value={id}>{MODEL_LABELS[id]}</option>
          ))}
        </select>
      </div>

      {/* Compare toggle */}
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => setCompareMode(!compareMode)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
          style={
            compareMode
              ? { backgroundColor: areaColor, borderColor: areaColor, color: '#fff' }
              : { borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }
          }
        >
          {compareMode ? 'Einzelansicht' : 'Vergleichen'}
        </button>
        {compareMode && (
          <select
            value={compareCountry}
            onChange={e => setCompareCountry(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-xs dark:text-[var(--color-secondary)] text-slate-700"
          >
            {EINORDNEN_COUNTRIES.filter(c => c.countryId !== selectedCountry).map(c => (
              <option key={c.countryId} value={c.countryId}>{c.countryName}</option>
            ))}
          </select>
        )}
      </div>

      {/* Image grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${countriesToShow.join('-')}-${selectedModel}`}
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className={`grid ${compareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4 mb-4`}>
            {countriesToShow.map(cId => {
              const cData = EINORDNEN_COUNTRIES.find(c => c.countryId === cId)!;
              return (
                <div key={cId} className="space-y-3">
                  <h4 className="text-sm font-semibold dark:text-[var(--color-primary)] text-slate-900 text-center">
                    {cData.countryName}
                  </h4>
                  {compareMode ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-medium mb-1 dark:text-[var(--color-muted)] text-slate-500">
                          Schule in {cData.countryName}
                        </p>
                        <ImageCell
                          getPath={(i) => getSchoolImagePath(cId, selectedModel, i)}
                          alt={`Schule in ${cData.countryName} – ${MODEL_LABELS[selectedModel]}`}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-medium mb-1 dark:text-[var(--color-muted)] text-slate-500">
                          Unterricht in {cData.countryName}
                        </p>
                        <ImageCell
                          getPath={(i) => getClassroomImagePath(cId, selectedModel, i)}
                          alt={`Unterricht in ${cData.countryName} – ${MODEL_LABELS[selectedModel]}`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-medium mb-1 dark:text-[var(--color-muted)] text-slate-500">
                          Schule in {cData.countryName}
                        </p>
                        <ImageCell
                          getPath={(i) => getSchoolImagePath(cId, selectedModel, i)}
                          alt={`Schule in ${cData.countryName} – ${MODEL_LABELS[selectedModel]}`}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-medium mb-1 dark:text-[var(--color-muted)] text-slate-500">
                          Unterricht in {cData.countryName}
                        </p>
                        <ImageCell
                          getPath={(i) => getClassroomImagePath(cId, selectedModel, i)}
                          alt={`Unterricht in ${cData.countryName} – ${MODEL_LABELS[selectedModel]}`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Observation panel (single country mode) */}
      {!compareMode && obs && (
        <div className="rounded-xl border border-[var(--color-border)] p-4 mt-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: areaColor }}>
            Typische Merkmale: {country.countryName}
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DIMENSION_LABELS.map(({ key, label }) => (
              <div key={key} className="text-center">
                <p className="text-[10px] uppercase tracking-wider font-medium dark:text-[var(--color-muted)] text-slate-500 mb-1">
                  {label}
                </p>
                <p className="text-xs dark:text-[var(--color-secondary)] text-slate-600">
                  {obs[key as keyof typeof obs]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compare prompt */}
      {compareMode && (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] p-4 mt-2 text-center">
          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 italic">
            Was fällt dir auf? Was sagt das über die Trainingsdaten?
          </p>
        </div>
      )}
    </section>
  );
}
