import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getV3ImagePath, V3_MODELS } from '../../data/v3Images';
import type { V3ModelId } from '../../types/image.types';

const MODEL_IDS: V3ModelId[] = ['flux2pro', 'gpt-image-1-5', 'nanobana', 'gemini-image-2'];

const SIGNATURES: Record<V3ModelId, { label: string; short: string }> = {
  flux2pro: { label: 'FLUX2 PRO: Landschaft', short: 'Sanftes Licht, Hügel, Nebel' },
  'gpt-image-1-5': { label: 'GPT Image-1.5: Hyperdetail', short: 'Massiver Stamm, dramatische Krone' },
  nanobana: { label: 'Nano Bana: Cinematisch', short: 'Sonnenuntergang, Blumenwiese' },
  'gemini-image-2': { label: 'Gemini Image 2: Text-Rendering', short: '„BAUM"-Holzschild am Stamm' },
};

export default function QuadModelComparison() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [highlightedModel, setHighlightedModel] = useState<V3ModelId | null>(null);

  const advance = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % 16);
  }, []);

  useEffect(() => {
    if (!autoPlay || reduceMotion) return;
    const timer = setInterval(advance, 2000);
    return () => clearInterval(timer);
  }, [autoPlay, reduceMotion, advance]);

  const modelName = (id: V3ModelId) =>
    V3_MODELS.find(m => m.modelId === id)?.modelName ?? id;

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      {/* 4-column grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
        {MODEL_IDS.map(modelId => {
          const isHighlighted = highlightedModel === modelId;
          const isDimmed = highlightedModel !== null && !isHighlighted;
          return (
            <div
              key={modelId}
              className="flex flex-col items-center transition-opacity"
              style={{ opacity: isDimmed ? 0.35 : 1 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${modelId}-${currentIndex}`}
                  initial={reduceMotion ? undefined : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full aspect-square rounded-xl overflow-hidden border-2 transition-colors"
                  style={{
                    borderColor: isHighlighted ? areaColor : 'var(--color-border)',
                  }}
                >
                  <img
                    src={getV3ImagePath(modelId, currentIndex)}
                    alt={`${modelName(modelId)} – Baum ${currentIndex + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              </AnimatePresence>
              <span
                className="mt-1.5 text-[10px] md:text-xs font-medium text-center"
                style={{ color: isHighlighted ? areaColor : 'var(--color-secondary)' }}
              >
                {modelName(modelId)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Slider + controls */}
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => setAutoPlay(prev => !prev)}
          className="flex-shrink-0 w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center transition-colors"
          style={autoPlay ? { backgroundColor: areaColor, borderColor: areaColor, color: '#fff' } : { color: 'var(--color-secondary)' }}
          aria-label={autoPlay ? 'Automatisches Abspielen stoppen' : 'Automatisch abspielen'}
        >
          {autoPlay ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <rect x="1" y="1" width="4" height="10" rx="1" />
              <rect x="7" y="1" width="4" height="10" rx="1" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <polygon points="2,0 12,6 2,12" />
            </svg>
          )}
        </button>

        <input
          type="range"
          min={0}
          max={15}
          value={currentIndex}
          onChange={e => {
            setCurrentIndex(Number(e.target.value));
            setAutoPlay(false);
          }}
          className="flex-1 accent-[var(--color-accent)]"
          aria-label="Bildindex"
        />

        <span className="flex-shrink-0 text-xs dark:text-[var(--color-muted)] text-slate-500 tabular-nums w-16 text-right">
          Bild {currentIndex + 1} / 16
        </span>
      </div>

      {/* Signature highlights */}
      <div className="flex flex-wrap gap-1.5">
        {MODEL_IDS.map(modelId => {
          const sig = SIGNATURES[modelId];
          const isActive = highlightedModel === modelId;
          return (
            <button
              key={modelId}
              type="button"
              onClick={() => setHighlightedModel(isActive ? null : modelId)}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors"
              style={
                isActive
                  ? { backgroundColor: areaColor, borderColor: areaColor, color: '#fff' }
                  : { borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }
              }
              title={sig.short}
            >
              {sig.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
