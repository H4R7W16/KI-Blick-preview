import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getV1Series, getV1ImagePath } from '../../data/v1Images';

interface Signal {
  label: string;
  category: string;
  implicit?: boolean;
}

interface PromptConfig {
  slug: string;
  prompt: string;
  signals: Signal[];
}

const PROMPTS: PromptConfig[] = [
  {
    slug: 'fahrrad',
    prompt: 'Fahrrad',
    signals: [
      { label: 'Fahrrad', category: 'Objekt' },
      { label: 'Straße/Weg', category: 'Kontext', implicit: true },
      { label: 'fotorealistisch', category: 'Stil', implicit: true },
    ],
  },
  {
    slug: 'leuchtturm',
    prompt: 'Leuchtturm',
    signals: [
      { label: 'Turm', category: 'Objekt' },
      { label: 'Küste/Meer', category: 'Kontext', implicit: true },
      { label: 'Leuchtfeuer', category: 'Licht', implicit: true },
      { label: 'fotorealistisch', category: 'Stil', implicit: true },
    ],
  },
  {
    slug: 'katze-auf-einem-buch',
    prompt: 'Katze auf einem Buch',
    signals: [
      { label: 'Katze', category: 'Tier' },
      { label: 'Buch', category: 'Objekt' },
      { label: 'sitzend/liegend', category: 'Pose', implicit: true },
      { label: 'Innenraum', category: 'Setting', implicit: true },
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Objekt: '#0EA5E9',
  Kontext: '#8B5CF6',
  Licht: '#F59E0B',
  Stil: '#64748B',
  Tier: '#10B981',
  Pose: '#EC4899',
  Setting: '#F97316',
};

export default function PromptExploder() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState(0);
  const [exploded, setExploded] = useState(false);

  const config = PROMPTS[activeTab];

  const images = useMemo(() => {
    const series = getV1Series(config.slug);
    if (!series) return [];
    return series.images.slice(0, 3);
  }, [config.slug]);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setExploded(false);
  };

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      {/* Tab bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {PROMPTS.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => handleTabChange(i)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={
              activeTab === i
                ? { backgroundColor: areaColor, color: '#fff' }
                : { border: '1px solid var(--color-border)', color: 'var(--color-secondary)' }
            }
          >
            {p.prompt}
          </button>
        ))}
      </div>

      {/* Prompt display + explode */}
      <div className="text-center mb-6">
        <AnimatePresence mode="wait">
          {!exploded ? (
            <motion.button
              key={`prompt-${config.slug}`}
              type="button"
              onClick={() => setExploded(true)}
              initial={reduceMotion ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
              className="text-2xl md:text-3xl font-bold dark:text-[var(--color-primary)] text-slate-900 cursor-pointer hover:opacity-80 transition-opacity"
              aria-label={`Prompt "${config.prompt}" in Signale zerlegen`}
            >
              „{config.prompt}"
              <span
                className="block text-xs font-normal mt-2"
                style={{ color: areaColor }}
              >
                Klicke, um die Signale zu sehen
              </span>
            </motion.button>
          ) : (
            <motion.div
              key={`signals-${config.slug}`}
              initial={reduceMotion ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap justify-center gap-2"
            >
              {config.signals.map((signal, i) => (
                <motion.span
                  key={signal.label}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduceMotion ? undefined : { delay: i * 0.1, duration: 0.3 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[signal.category] ?? '#64748B'}20`,
                    color: CATEGORY_COLORS[signal.category] ?? '#64748B',
                    border: signal.implicit
                      ? `1px dashed ${CATEGORY_COLORS[signal.category] ?? '#64748B'}60`
                      : `1px solid ${CATEGORY_COLORS[signal.category] ?? '#64748B'}40`,
                  }}
                >
                  <span className="text-[10px] uppercase tracking-wider opacity-70">{signal.category}:</span>
                  {signal.label}
                  {signal.implicit && (
                    <span className="text-[10px] opacity-60">(implizit)</span>
                  )}
                </motion.span>
              ))}
              <button
                type="button"
                onClick={() => setExploded(false)}
                className="text-xs dark:text-[var(--color-muted)] text-slate-500 hover:underline mt-1 w-full"
              >
                Zurücksetzen
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Images */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
        {images.map(img => (
          <div
            key={img.seed}
            className="rounded-lg overflow-hidden border border-[var(--color-border)]"
          >
            <img
              src={getV1ImagePath(config.slug, img.seed)}
              alt={`${config.prompt}, Seed ${img.seed}`}
              loading="lazy"
              className="w-full h-auto object-cover aspect-square"
            />
          </div>
        ))}
      </div>

      {/* Explanation */}
      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed">
        Die KI versteht den Prompt nicht wie du. Sie erkennt statistische Muster: Welche visuellen
        Konzepte treten in den Trainingsdaten zusammen mit diesem Wort auf?
      </p>
    </section>
  );
}
