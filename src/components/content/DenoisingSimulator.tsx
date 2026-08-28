import { useState, useRef, useEffect, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getV1ImagePath } from '../../data/v1Images';

const TOTAL_STEPS = 30;
const AUTO_PLAY_INTERVAL = 500;

function getBlurRadius(step: number): number {
  if (step <= 5) return 20 - (step - 1) * 1.6;
  if (step <= 10) return 12 - (step - 5) * 1.2;
  if (step <= 15) return 6 - (step - 10) * 0.6;
  if (step <= 20) return 3 - (step - 15) * 0.4;
  if (step <= 25) return 1 - (step - 20) * 0.2;
  return 0;
}

function getNoiseOpacity(step: number): number {
  if (step >= 28) return 0;
  return Math.max(0, 1 - (step - 1) / 25);
}

function drawNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opacity: number,
) {
  if (opacity <= 0) {
    ctx.clearRect(0, 0, width, height);
    return;
  }

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const value = Math.random() * 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = Math.floor(opacity * 200);
  }

  ctx.putImageData(imageData, 0, 0);
}

export default function DenoisingSimulator() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();

  const [step, setStep] = useState(1);
  const [playing, setPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const imageSrc = getV1ImagePath('leuchtturm', 1000);
  const blurRadius = getBlurRadius(step);
  const noiseOpacity = getNoiseOpacity(step);

  const updateNoise = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.floor(rect.width / 2);
    const h = Math.floor(rect.height / 2);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawNoise(ctx, w, h, noiseOpacity);
  }, [noiseOpacity]);

  useEffect(() => {
    updateNoise();
  }, [updateNoise]);

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setStep(prev => {
        if (prev >= TOTAL_STEPS) {
          setPlaying(false);
          return TOTAL_STEPS;
        }
        return prev + 1;
      });
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  const handleAutoPlay = () => {
    if (reduceMotion) return;
    setStep(1);
    setPlaying(true);
  };

  const noiseBarHeight = ((TOTAL_STEPS - step) / (TOTAL_STEPS - 1)) * 100;

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      <div className="flex flex-col md:flex-row gap-5">
        {/* Image + noise overlay */}
        <div className="flex-1">
          <div ref={containerRef} className="relative rounded-xl overflow-hidden aspect-square">
            <img
              src={imageSrc}
              alt="Leuchtturm – Denoising-Simulation"
              className="w-full h-full object-cover"
              style={{ filter: `blur(${blurRadius}px)` }}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ imageRendering: 'pixelated' }}
              aria-hidden="true"
            />
            <div
              className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-mono bg-black/60 text-white"
            >
              Schritt {step} / {TOTAL_STEPS}
            </div>
          </div>

          {/* Slider */}
          <div className="mt-3">
            <input
              type="range"
              min={1}
              max={TOTAL_STEPS}
              value={step}
              onChange={e => {
                setPlaying(false);
                setStep(Number(e.target.value));
              }}
              className="w-full accent-[var(--color-accent)]"
              aria-label="Denoising-Schritt"
            />
            <div className="flex justify-between text-[10px] dark:text-[var(--color-muted)] text-slate-400 mt-1">
              <span>Schritt 1</span>
              <span>Schritt {TOTAL_STEPS}</span>
            </div>
          </div>

          {/* Auto-play button */}
          {!reduceMotion && (
            <button
              type="button"
              onClick={handleAutoPlay}
              disabled={playing}
              className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40"
              style={{ borderColor: areaColor, color: areaColor }}
            >
              {playing ? 'Läuft...' : 'Automatisch abspielen'}
            </button>
          )}
        </div>

        {/* Noise chart */}
        <div className="w-full md:w-28 flex flex-col items-center gap-2">
          <span className="text-xs font-medium dark:text-[var(--color-secondary)] text-slate-600">
            Rauschanteil
          </span>
          <div className="relative w-8 h-40 rounded-full border border-[var(--color-border)] overflow-hidden dark:bg-[var(--color-surface)] bg-slate-100">
            <div
              className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300"
              style={{
                height: `${noiseBarHeight}%`,
                backgroundColor: areaColor,
                opacity: 0.7,
              }}
            />
          </div>
          <span className="text-[10px] font-mono dark:text-[var(--color-muted)] text-slate-400">
            {Math.round(noiseBarHeight)}%
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-xs dark:text-[var(--color-muted)] text-slate-500 italic">
        Das ist eine vereinfachte Simulation. Echte Modelle nutzen 20–50 Schritte mit komplexerer Mathematik.
      </p>
    </section>
  );
}
