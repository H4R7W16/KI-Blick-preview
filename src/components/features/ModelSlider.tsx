import { MODELS } from '../../data/subjects';
import type { ModelId } from '../../types/image.types';

const MODEL_COLORS: Record<ModelId, string> = {
  'flux2pro': '#0EA5E9',
  'gpt-image-1-5': '#10B981',
  'nanobana': '#F59E0B',
};

interface ModelSliderProps {
  activeModel: ModelId;
  onChange: (id: ModelId) => void;
}

export default function ModelSlider({ activeModel, onChange }: ModelSliderProps) {
  const activeIndex = MODELS.findIndex(m => m.id === activeModel);
  const activeColor = MODEL_COLORS[activeModel];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center dark:bg-[var(--color-card)] bg-slate-100 rounded-full p-1 border border-[var(--color-border)]">
        {/* Sliding indicator */}
        <div
          className="absolute top-1 h-[calc(100%-8px)] rounded-full transition-all duration-300 ease-out"
          style={{
            width: `calc(${100 / MODELS.length}% - 4px)`,
            left: `calc(${(activeIndex * 100) / MODELS.length}% + 2px)`,
            backgroundColor: activeColor,
          }}
        />

        {MODELS.map(model => (
          <button
            key={model.id}
            onClick={() => onChange(model.id)}
            className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
              activeModel === model.id
                ? 'text-white'
                : 'dark:text-[var(--color-secondary)] text-slate-600 hover:dark:text-[var(--color-primary)] hover:text-slate-900'
            }`}
          >
            {model.label}
          </button>
        ))}
      </div>
      <p className="text-xs dark:text-[var(--color-muted)] text-slate-500">
        {MODELS.find(m => m.id === activeModel)?.description}
      </p>
    </div>
  );
}
