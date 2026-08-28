import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import {
  getPromptComparison,
  getAlternativeSeriesAllModels,
  getE5ModelIds,
  getE5ModelLabel,
  EINORDNEN_ALTERNATIVE_PROMPTS,
  type E5ModelId,
} from '../../data/einordnenImages';
import { resolveAssetPath } from '../../utils/assetPath';

interface TabConfig {
  slug: string;
  label: string;
  strategy: string;
  pros: string[];
  cons: string[];
  mode: 'compare' | 'quad-compare';
}

const TABS: TabConfig[] = [
  {
    slug: 'diverse-mathematiklehrkraefte',
    label: 'Diversität explizit',
    strategy: 'diversity',
    mode: 'compare',
    pros: [
      'Direkte Kontrolle über Vielfalt',
      'Funktioniert bei den meisten Modellen',
    ],
    cons: [
      'Die KI entscheidet, was „divers“ bedeutet',
      'Ergebnisse können künstlich wirken',
    ],
  },
  {
    slug: 'frau-informatik',
    label: 'Stereotyp brechen',
    strategy: 'counter-stereotype',
    mode: 'compare',
    pros: [
      'Gezieltes Counter-Stereotyping',
      'Nützlich für Materialien, die Vielfalt zeigen sollen',
    ],
    cons: [
      'Erzeugt Gegen-Stereotypen statt Auflösung',
      'Erfordert Vorwissen über bestehende Stereotype',
    ],
  },
  {
    slug: 'mathe-gesamtschule',
    label: 'Kontext ergänzen',
    strategy: 'context',
    mode: 'compare',
    pros: [
      'Natürlichere Ergebnisse',
      'Kulturelle Kontextualisierung',
    ],
    cons: [
      '„Realistisch“ ist mehrdeutig – die KI entscheidet, was das heißt',
      'Keine Garantie für Vielfalt',
    ],
  },
  {
    slug: 'diverse-mathematiklehrkraefte',
    label: 'Was heißt „divers“?',
    strategy: 'Modellvergleich',
    mode: 'quad-compare',
    pros: [
      'Zeigt, dass Modelle „divers“ unterschiedlich interpretieren',
      'Macht die Grenzen des DiversitÃ¤tsbegriffs sichtbar',
    ],
    cons: [
      'Auch Gemini Image 2 bildet nicht alle Dimensionen ab',
      'Die Darstellung von Behinderung kann selbst stereotyp sein (z.B. nur Rollstuhl = Behinderung)',
    ],
  },
];

const QUAD_BADGES: Record<E5ModelId, { text: string; highlight: boolean }> = {
  flux2pro: { text: 'Ethnisch divers, aber: 0 Rollstühle, 0 Hijabs', highlight: false },
  'gpt-image-1-5': { text: 'Ethnisch divers, Turban – aber: 0 Rollstühle', highlight: false },
  nanobana: { text: 'Ethnisch divers, aber: 0 Rollstühle, 0 Hijabs', highlight: false },
  'gemini-image-2': { text: 'Rollstuhl, Hijab, queere Codes', highlight: true },
};

function ImageGrid({
  images,
  basePath,
  alt,
  emptyError,
}: {
  images: { filename: string }[];
  basePath: string;
  alt: string;
  emptyError?: string;
}) {
  if (images.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg border border-red-300/70 dark:border-red-500/50 bg-red-50/70 dark:bg-red-950/20 p-2 flex items-center justify-center text-center"
            role="img"
            aria-label={emptyError ?? 'Generierung fehlgeschlagen'}
          >
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
                Generierung fehlgeschlagen
              </p>
              <p className="text-[10px] leading-tight text-red-700/90 dark:text-red-300/90">
                {emptyError ?? 'Fuer diesen Slot liegt kein Bild vor.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {images.slice(0, 4).map((img, i) => (
        <div key={i} className="aspect-square rounded-lg overflow-hidden border border-[var(--color-border)]">
          <img
            src={resolveAssetPath(`${basePath}/${img.filename}`)}
            alt={`${alt} – Bild ${i + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}

export default function PromptCompare() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();

  const modelIds = getE5ModelIds();
  const [activeTab, setActiveTab] = useState(0);
  const [activeModel, setActiveModel] = useState<E5ModelId>('flux2pro');

  const tab = TABS[activeTab];
  const isQuadMode = tab.mode === 'quad-compare';

  // For compare mode (tabs 0-2): standard comparison
  const comparison = useMemo(() => {
    if (isQuadMode) return null;
    if (activeModel === 'gemini-image-2') {
      const baselineDefault = getPromptComparison(tab.slug, 'flux2pro');
      const geminiAlternative = getAlternativeSeriesAllModels(tab.slug)['gemini-image-2'];
      return {
        default: {
          images: [],
          prompt: baselineDefault.default.prompt,
        },
        alternative: {
          images: geminiAlternative.images,
          prompt: baselineDefault.alternative.prompt,
        },
      };
    }
    return getPromptComparison(tab.slug, activeModel);
  }, [tab.slug, activeModel, isQuadMode]);

  // For quad mode (tab 3): all 4 models for one prompt
  const quadSeries = useMemo(() => {
    if (!isQuadMode) return null;
    return getAlternativeSeriesAllModels(tab.slug);
  }, [tab.slug, isQuadMode]);

  const alternativePrompt = EINORDNEN_ALTERNATIVE_PROMPTS.find(p => p.slug === tab.slug);

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {TABS.map((t, i) => {
          const isActive = activeTab === i;
          return (
            <button
              key={`${t.slug}-${t.mode}`}
              type="button"
              onClick={() => {
                setActiveTab(i);
                if (t.mode === 'quad-compare') setActiveModel('flux2pro');
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              style={
                isActive
                  ? { backgroundColor: areaColor, borderColor: areaColor, color: '#fff' }
                  : { borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Model selector (only for compare mode) */}
      {!isQuadMode && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {modelIds.map(id => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveModel(id)}
              className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors"
              style={
                activeModel === id
                  ? { backgroundColor: `color-mix(in srgb, ${areaColor} 15%, transparent)`, borderColor: areaColor, color: areaColor }
                  : { borderColor: 'var(--color-border)', color: 'var(--color-muted)' }
              }
            >
              {getE5ModelLabel(id)}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${tab.slug}-${tab.mode}-${activeModel}`}
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Compare mode (tabs 0–2) */}
          {!isQuadMode && comparison && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider dark:text-[var(--color-muted)] text-slate-500">
                  Default-Prompt
                </h4>
                <ImageGrid
                  images={comparison.default.images}
                  basePath={comparison.default.images[0]?.basePath ?? ''}
                  alt={`Default – ${getE5ModelLabel(activeModel)}`}
                  emptyError="Das Modell hat den Default-Prompt in dieser Serie nicht ausgefuehrt."
                />
                {activeModel === 'gemini-image-2' && (
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Hinweis: Kein Fehler der Lernumgebung. Die Referenzbilder fehlen, weil die Generierung beim Modell nicht abgeschlossen wurde.
                  </p>
                )}
                <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 italic break-words">
                  „{comparison.default.prompt}“
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: areaColor }}>
                  Verbesserte Variante
                </h4>
                <ImageGrid
                  images={comparison.alternative.images}
                  basePath={comparison.alternative.images[0]?.basePath ?? ''}
                  alt={`Alternative – ${getE5ModelLabel(activeModel)}`}
                />
                <p className="text-xs italic break-words" style={{ color: areaColor }}>
                  „{alternativePrompt?.prompt ?? comparison.alternative.prompt}“
                </p>
              </div>
            </div>
          )}

          {/* Quad-compare mode (tab 3) */}
          {isQuadMode && quadSeries && (
            <div className="mb-4">
              <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 italic mb-3 break-words">
                Prompt: „{alternativePrompt?.prompt ?? tab.slug}“
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {modelIds.map(modelId => {
                  const series = quadSeries[modelId];
                  const badge = QUAD_BADGES[modelId];
                  return (
                    <div key={modelId} className="space-y-1.5">
                      <p className="text-xs font-semibold dark:text-[var(--color-primary)] text-slate-900 text-center truncate">
                        {getE5ModelLabel(modelId)}
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {series.images.slice(0, 4).map((img, i) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden border border-[var(--color-border)]">
                            <img
                              src={resolveAssetPath(`${img.basePath}/${img.filename}`)}
                              alt={`${getE5ModelLabel(modelId)} – Bild ${i + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                      <p
                        className="text-[10px] leading-tight text-center rounded-md px-2 py-1"
                        style={
                          badge.highlight
                            ? { backgroundColor: `color-mix(in srgb, ${areaColor} 12%, transparent)`, color: areaColor, fontWeight: 600 }
                            : { color: 'var(--color-muted)' }
                        }
                      >
                        {badge.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pro/Contra */}
      <div className="rounded-xl border border-[var(--color-border)] p-4">
        <h5 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: areaColor }}>
          Strategie: {tab.label}
        </h5>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            {tab.pros.map(pro => (
              <p key={pro} className="text-xs dark:text-[var(--color-secondary)] text-slate-600">
                <span className="text-[var(--color-success)] mr-1">✓</span> {pro}
              </p>
            ))}
          </div>
          <div className="space-y-1">
            {tab.cons.map(con => (
              <p key={con} className="text-xs dark:text-[var(--color-secondary)] text-slate-600">
                <span className="text-[var(--color-warning)] mr-1">⚠</span> {con}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
