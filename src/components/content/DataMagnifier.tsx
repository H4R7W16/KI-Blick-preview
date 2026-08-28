import { useState, useMemo, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { motion, AnimatePresence, useReducedMotion, LayoutGroup } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getV2ImagePath, V2_LANGUAGE_VARIANTS } from '../../data/v2Images';

// ── Constants ────────────────────────────────────────────────────────────────
const MODELS = ['flux2pro', 'gpt-image-1-5', 'nanobana'] as const;
const IMAGES_PER_SERIES = 4;
const BREAD_ONLY = V2_LANGUAGE_VARIANTS.filter(v => v.promptSlug !== 'pain');
const BREAD_BASE = BREAD_ONLY.length * MODELS.length * IMAGES_PER_SERIES; // 84
const MOSAIC_N = BREAD_BASE + 16; // 100
const MAX_STAGE = 5;

// Seed tile positions within each stage's grid
const MOSAIC_COLS = 10;
// 4 scattered positions in the 10×10 mosaic (one per Stage-1 image)
const MOSAIC_SEED_POSITIONS = [7, 31, 58, 82] as const; // spread across quadrants
const ABSTRACT_SIDE = 10;
const ABSTRACT_SEED = 44; // row 4, col 4 in 10×10
const CANVAS_RATIO = 5_850; // 5,850,000,000 / 1,000,000
const CANVAS_SIDE = Math.ceil(Math.sqrt(CANVAS_RATIO)); // 77
const CANVAS_SEED_RC = Math.floor(CANVAS_SIDE / 2); // 38

// ── Formatters ───────────────────────────────────────────────────────────────
const fmt = new Intl.NumberFormat('de-DE');
const oneDec = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });

// ── Stage data ───────────────────────────────────────────────────────────────
interface StageInfo {
  count: number;
  ratio: number | null;
  shortLabel: string;
  headline: string;
  body: string;
}

const STAGES: StageInfo[] = [
  {
    count: 1,
    ratio: null,
    shortLabel: '1',
    headline: '1 reales Trainingsbild',
    body: 'Trainingsdatensätze bestehen aus Milliarden realer Fotos aus dem Internet – jeweils verknüpft mit einem Textbeschreibung. So lernt KI, was Bilder bedeuten. Die gezeigte Abbildung dient zur Veranschaulichung.',
  },
  {
    count: 4,
    ratio: 4,
    shortLabel: '4',
    headline: '4 reale Trainingsbilder',
    body: 'Vier verschiedene reale Fotos des gleichen Motivs. Jedes davon trägt dazu bei, dass das Modell lernt, was typisch für dieses Motiv ist – und was variiert.',
  },
  {
    count: MOSAIC_N,
    ratio: MOSAIC_N / 4,
    shortLabel: fmt.format(MOSAIC_N),
    headline: `${fmt.format(MOSAIC_N)} Bilder – unser Demo-Experiment`,
    body: `7 Sprachen × 3 Modelle × 4 Bilder = ${fmt.format(MOSAIC_N)} Bilder. Hier siehst du die vier Bilder aus Stufe 2 als einzelne Kacheln im Mosaik. Und dieses gesamte Mosaik wird zur nächsten Kachel.`,
  },
  {
    count: 10_000,
    ratio: 100,
    shortLabel: '10.000',
    headline: '10.000 reale Bilder',
    body: 'Das vollständige Mosaik ist jetzt eine einzige Kachel. 10.000 reale Fotos – noch greifbar, etwa so viele wie in einem großen Familienarchiv.',
  },
  {
    count: 1_000_000,
    ratio: 100,
    shortLabel: '1 Mio.',
    headline: '1 Million reale Bilder',
    body: 'Eine Million reale Fotos aus dem Internet. Würdest du jedes einzeln eine Sekunde anschauen, wärst du knapp 12 Tage am Stück damit beschäftigt.',
  },
  {
    count: 5_850_000_000,
    ratio: 5_850,
    shortLabel: '5,85 Mrd.',
    headline: '5,85 Milliarden reale Bilder',
    body: 'LAION-5B – einer der wichtigsten öffentlichen Trainingsdatensätze für Text-zu-Bild-Modelle. Er enthält 5,85 Milliarden reale Bilder aus dem Internet. Jede Kachel hier steht für eine Million davon.',
  },
];

// ── Motion config ────────────────────────────────────────────────────────────
const SPRING = { type: 'spring', stiffness: 180, damping: 26, mass: 0.8 } as const;
const EASE_OUT = { duration: 0.5, ease: [0.22, 1, 0.36, 1] } as const;
const FADE_EXIT = { duration: 0.18, ease: 'easeIn' } as const;

// ── Utilities ────────────────────────────────────────────────────────────────
function createSeededRandom(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const rand = createSeededRandom(seed);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function formatViewingTime(n: number): string {
  if (n < 60) return `${fmt.format(n)} Sek.`;
  const m = n / 60;
  if (m < 90) return `${oneDec.format(m)} Min.`;
  const h = n / 3_600;
  if (h < 48) return `${oneDec.format(h)} Std.`;
  const d = h / 24;
  if (d < 365) return `${oneDec.format(d)} Tage`;
  const y = d / 365;
  return y < 100 ? `${oneDec.format(y)} Jahre` : `${fmt.format(Math.round(y))} Jahre`;
}

function formatPrintArea(n: number): string {
  const m2 = n * 0.01;
  if (m2 < 70) return `${oneDec.format(m2)} m²`;
  if (m2 < 7_140) return `${oneDec.format(m2 / 70)} Klassenräume`;
  const f = m2 / 7_140;
  return f < 100 ? `${oneDec.format(f)} Fußballfelder` : `${fmt.format(Math.round(f))} Fußballfelder`;
}

function useContainerPx() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [px, setPx] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const next = Math.floor(Math.min(r.width, r.height));
      setPx(p => (p === next ? p : next));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, px };
}

// ── Count-up hook ─────────────────────────────────────────────────────────────
// StrictMode-safe: fromRef wird im Cleanup gesetzt (bevor der nächste Effect läuft),
// nicht im Effect-Body. RAF feuert nach dem Browser-Paint, also noch nicht wenn
// StrictMode den Cleanup synchron ausführt → displayRef.current ist noch der Startwert.
function useCountUp(
  target: number,
  durationMs: number,
  reduceMotion: boolean | null,
): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);   // Startwert der nächsten Animation
  const displayRef = useRef(target); // aktuell angezeigter Wert (Ref-Kopie von display)

  useEffect(() => {
    if (reduceMotion) {
      fromRef.current = target;
      displayRef.current = target;
      setDisplay(target);
      return;
    }

    const from = fromRef.current;
    const logFrom = Math.log1p(from);
    const logTo = Math.log1p(target);
    let startTime: number | null = null;
    let rafId: number;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const logCurrent = logFrom + (logTo - logFrom) * eased;
      const current = Math.round(Math.expm1(logCurrent));
      const clamped = Math.min(Math.max(current, Math.min(from, target)), Math.max(from, target));
      displayRef.current = clamped;
      setDisplay(clamped);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      // Cleanup läuft synchron (vor Browser-Paint) → tick hat noch nicht gefeuert,
      // displayRef.current ist noch der Startwert → korrekte Basis für nächste Animation.
      fromRef.current = displayRef.current;
      cancelAnimationFrame(rafId);
    };
  }, [target, durationMs, reduceMotion]);

  return display;
}

// ── Shared visual sub-components ─────────────────────────────────────────────

/** Pulsing highlight ring that fades out after mount */
function SeedRing({ areaColor }: { areaColor: string }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-[inherit] pointer-events-none"
      style={{ boxShadow: `0 0 0 2.5px ${areaColor}` }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.8, duration: 1.2 }}
      aria-hidden="true"
    />
  );
}

// ── Stage visuals ────────────────────────────────────────────────────────────

/**
 * Stage 0 – single image.
 * The entire visual IS layoutId="dm-a0".
 */
function Stage0({
  path,
  areaColor,
  seedKey,
  showCta,
}: {
  path: string;
  areaColor: string;
  seedKey: string;
  showCta?: boolean;
}) {
  return (
    <div className="absolute inset-0 p-6 md:p-8 flex items-center justify-center">
      <motion.div
        layoutId="dm-a0"
        className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
        transition={SPRING}
      >
        <img src={path} alt="KI-generiertes Bild eines Brots – Beispiel für ein Trainingsbild" className="w-full h-full object-cover" />
        <SeedRing key={seedKey} areaColor={areaColor} />
        {showCta && (
          <motion.div
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold dark:bg-black/60 bg-white/80 backdrop-blur-sm shadow-lg pointer-events-none"
            style={{ color: areaColor }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            Entdecken
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

/**
 * Stage 1 – 2×2 grid.
 * layoutId="dm-a1" wraps the entire grid.
 * layoutId="dm-a0" is the top-left seed tile (morphs from stage 0's full image).
 */
function Stage1({
  paths,
  areaColor,
  reduceMotion,
  dir,
  seedKey,
}: {
  paths: string[];
  areaColor: string;
  reduceMotion: boolean | null;
  dir: number;
  seedKey: string;
}) {
  return (
    <div className="absolute inset-0">
      <motion.div
        layoutId="dm-a1"
        className="absolute inset-0 rounded-2xl overflow-hidden border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50"
        transition={SPRING}
      >
        <div className="absolute inset-2 grid grid-cols-2 gap-2">
          {/* Seed tile – morphs from stage 0's full image */}
          <motion.div
            layoutId="dm-a0"
            className="relative rounded-xl overflow-hidden"
            transition={SPRING}
          >
            <img src={paths[0]} alt="KI-generiertes Brot-Bild, Kachel 1 von 4 – Trainingsdaten-Visualisierung" className="w-full h-full object-cover" />
            <SeedRing key={seedKey} areaColor={areaColor} />
          </motion.div>

          {/* Three new tiles – layoutId dm-b1/2/3 morphen zu/von den Mosaik-Positionen */}
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              layoutId={`dm-b${i}`}
              className="rounded-xl overflow-hidden"
              initial={reduceMotion ? undefined : { opacity: 0, x: dir * 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={reduceMotion ? { duration: 0 } : SPRING}
            >
              <img src={paths[i]} alt={`KI-generiertes Brot-Bild, Kachel ${i + 1} von 4 – Trainingsdaten-Visualisierung`} className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Stage 2 – 10×10 mosaic of bread images.
 * layoutId="dm-a2" wraps the mosaic (morphs into seed tile in Stage 3).
 *
 * Die 4 Seed-Tiles (dm-a0, dm-b1/2/3) liegen als Overlay-Sibling AUSSERHALB
 * von dm-a2. Nested layoutId-Elemente innerhalb eines morphenden layoutId-
 * Containers kollidieren mit dem dm-a2 → Stage-3-Morph und machen ihn ruckelig.
 */
function Stage2({
  paths,
  fourPaths,
  areaColor,
  reduceMotion,
  dir,
  seedKey,
}: {
  paths: string[];
  fourPaths: string[];
  areaColor: string;
  reduceMotion: boolean | null;
  dir: number;
  seedKey: string;
}) {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${MOSAIC_COLS}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${Math.ceil(MOSAIC_N / MOSAIC_COLS)}, minmax(0, 1fr))`,
    gap: '2px',
  } as const;

  return (
    <div className="absolute inset-0">
      {/* Morphender Container – enthält KEINE layoutId-Kinder damit der dm-a2→Stage3-Morph
          sauber bleibt. Seed-Positionen werden als statische Platzhalter dargestellt. */}
      <motion.div
        layoutId="dm-a2"
        className="absolute inset-0 rounded-2xl overflow-hidden border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50"
        transition={SPRING}
      >
        <div className="absolute inset-2" style={gridStyle}>
          {paths.slice(0, MOSAIC_N).map((p, i) => {
            const seedSlot = MOSAIC_SEED_POSITIONS.indexOf(i as (typeof MOSAIC_SEED_POSITIONS)[number]);
            if (seedSlot !== -1) {
              // Statischer Platzhalter – wird visuell vom Overlay überdeckt
              return (
                <div key={`seed-ph-${seedSlot}`} className="rounded-[2px] overflow-hidden">
                  <img src={fourPaths[seedSlot]} alt="" role="presentation" className="w-full h-full object-cover" loading="lazy" />
                </div>
              );
            }
            const col = i % MOSAIC_COLS;
            const row = Math.floor(i / MOSAIC_COLS);
            const sweepCol = dir >= 0 ? MOSAIC_COLS - 1 - col : col;
            const delay = reduceMotion ? 0 : Math.min(0.65, sweepCol * 0.024 + row * 0.007);
            return (
              <motion.div
                key={i}
                className="rounded-[2px] overflow-hidden"
                initial={reduceMotion ? undefined : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.38, delay }}
              >
                <img src={p} alt="" role="presentation" className="w-full h-full object-cover" loading="lazy" />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Seed-Tile-Overlay – Sibling von dm-a2, identische Grid-Struktur für korrekte
          Positionierung. Trägt die layoutIds (dm-a0, dm-b1/2/3) für den Stage-1↔2-Morph
          ohne den dm-a2-Container-Morph zu stören. */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-2" style={gridStyle}>
          {Array.from({ length: MOSAIC_N }, (_, i) => {
            const seedSlot = MOSAIC_SEED_POSITIONS.indexOf(i as (typeof MOSAIC_SEED_POSITIONS)[number]);
            if (seedSlot !== -1) {
              const col = i % MOSAIC_COLS;
              const row = Math.floor(i / MOSAIC_COLS);
              const sweepCol = dir >= 0 ? MOSAIC_COLS - 1 - col : col;
              const delay = reduceMotion ? 0 : Math.min(0.65, sweepCol * 0.024 + row * 0.007);
              return (
                <motion.div
                  key={`seed-ov-${seedSlot}`}
                  layoutId={seedSlot === 0 ? 'dm-a0' : `dm-b${seedSlot}`}
                  className="relative rounded-[2px] overflow-hidden"
                  animate={{ opacity: 1 }}
                  initial={reduceMotion ? undefined : { opacity: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { ...SPRING, opacity: { duration: 0.38, delay } }
                  }
                >
                  <img
                    src={fourPaths[seedSlot]}
                    alt={`Hervorgehobenes Trainingsbild ${seedSlot + 1} aus Stufe 2`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <SeedRing key={`${seedKey}-${seedSlot}`} areaColor={areaColor} />
                </motion.div>
              );
            }
            return <div key={i} />; // leerer Grid-Spacer für korrekte Positionierung
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Mini canvas showing a 10×10 colored grid – used as thumbnail in Stage 4's seed tile
 * so it looks like "an image of Stage 3's view".
 */
function SeedGridCanvas({ areaColor }: { areaColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const color = areaColor.startsWith('var(')
      ? getComputedStyle(document.documentElement)
          .getPropertyValue(areaColor.slice(4, -1).trim())
          .trim() || '#888'
      : areaColor;
    const SIZE = 60;
    const SIDE = ABSTRACT_SIDE;
    const gap = 2;
    const cell = (SIZE - gap * (SIDE + 1)) / SIDE;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = color;
    for (let i = 0; i < SIDE * SIDE; i++) {
      const r = Math.floor(i / SIDE);
      const c = i % SIDE;
      ctx.globalAlpha = i === ABSTRACT_SEED ? 1 : 0.38;
      ctx.fillRect(gap + c * (cell + gap), gap + r * (cell + gap), cell, cell);
    }
    ctx.globalAlpha = 1;
  }, [areaColor]);

  return <canvas ref={canvasRef} width={60} height={60} className="block w-full h-full" aria-hidden="true" />;
}

/**
 * Stages 3 & 4 – 10×10 abstract colored grid.
 * layoutId="dm-a{stageIdx}" wraps the grid (no nested layoutIds inside – avoids morph conflicts).
 * layoutId="dm-a{stageIdx-1}" (the seed from the previous stage) lives as a SIBLING overlay,
 * exactly like Stage 2's two-layer pattern for dm-a0/dm-b1/2/3.
 *
 * Stage 4's seed tile additionally shows SeedGridCanvas – a mini snapshot of Stage 3's grid –
 * so it reads as "an image of Stage 3 that shrank to become part of Stage 4".
 */
function StageAbstract({
  stageIdx,
  areaColor,
  reduceMotion,
  dir,
  seedKey,
}: {
  stageIdx: 3 | 4;
  areaColor: string;
  reduceMotion: boolean | null;
  dir: number;
  seedKey: string;
}) {
  const thisId = `dm-a${stageIdx}`;
  const prevId = `dm-a${stageIdx - 1}`;
  const SIDE = ABSTRACT_SIDE;
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${SIDE}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${SIDE}, minmax(0, 1fr))`,
    gap: '3px',
  } as const;

  return (
    <div className="absolute inset-0">
      {/* Main container – keine nested layoutIds, damit der thisId→nextStage-Morph sauber bleibt */}
      <motion.div
        layoutId={thisId}
        className="absolute inset-0 rounded-2xl overflow-hidden border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50"
        transition={SPRING}
      >
        {/* Shimmer sweep */}
        {!reduceMotion && (
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-[40%] z-10"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18) 50%, transparent)',
              mixBlendMode: 'overlay',
            }}
            initial={{ x: dir >= 0 ? '260%' : '-260%' }}
            animate={{ x: dir >= 0 ? '-260%' : '260%' }}
            transition={{ duration: 0.9, ease: 'linear' }}
            aria-hidden="true"
          />
        )}

        <div className="absolute inset-2" style={gridStyle}>
          {Array.from({ length: SIDE * SIDE }, (_, i) => {
            if (i === ABSTRACT_SEED) {
              // Statischer Platzhalter – wird visuell vom Seed-Overlay überdeckt
              return (
                <div key="seed-ph" className="rounded-[3px]" style={{ backgroundColor: areaColor }} />
              );
            }
            const col = i % SIDE;
            const row = Math.floor(i / SIDE);
            const sweepCol = dir >= 0 ? SIDE - 1 - col : col;
            const delay = reduceMotion ? 0 : Math.min(0.6, sweepCol * 0.042 + row * 0.009);
            return (
              <motion.div
                key={i}
                className="rounded-[3px]"
                style={{
                  backgroundColor: `color-mix(in srgb, ${areaColor} 38%, transparent)`,
                  transformOrigin: dir >= 0 ? '100% 50%' : '0% 50%',
                }}
                initial={reduceMotion ? undefined : { opacity: 0, scaleX: 0.05 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 0.52,
                        delay,
                        ease: [0.22, 1, 0.36, 1],
                      }
                }
              />
            );
          })}
        </div>
      </motion.div>

      {/* Seed-Tile-Overlay – prevId als Sibling außerhalb von thisId.
          Verhindert nested-layoutId-Konflikt beim thisId→nextStage-Morph. */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-2" style={gridStyle}>
          {Array.from({ length: SIDE * SIDE }, (_, i) => {
            if (i === ABSTRACT_SEED) {
              return (
                <motion.div
                  key="seed-ov"
                  layoutId={prevId}
                  className="relative rounded-[3px] overflow-hidden"
                  transition={SPRING}
                  style={{ backgroundColor: areaColor }}
                >
                  {/* Stage 4's seed zeigt ein Mini-Canvas von Stage 3's Grid-Ansicht */}
                  {stageIdx === 4 && <SeedGridCanvas areaColor={areaColor} />}
                  <SeedRing key={seedKey} areaColor={areaColor} />
                </motion.div>
              );
            }
            return <div key={i} />;
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Stage 5 – canvas-based 77×77 grid (5,850 cells).
 * layoutId="dm-a5" wraps the canvas.
 * layoutId="dm-a4" is a DOM overlay at the center seed position.
 */
function Stage5({
  areaColor,
  px,
  reduceMotion,
  dir,
  seedKey,
}: {
  areaColor: string;
  px: number;
  reduceMotion: boolean | null;
  dir: number;
  seedKey: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const SIDE = CANVAS_SIDE; // 77
  const ELEMENT_COUNT = CANVAS_RATIO; // 5850
  const SEED_IDX = CANVAS_SEED_RC * SIDE + CANVAS_SEED_RC;
  const seedOffsetPct = CANVAS_SEED_RC / SIDE;
  const tilePct = 1 / SIDE;

  const resolveColor = useCallback((raw: string): string => {
    if (!raw.startsWith('var(')) return raw;
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue(raw.slice(4, -1).trim())
        .trim() || raw
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || px === 0) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const size = Math.round(px * dpr);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const color = resolveColor(areaColor);
    const cell = size / SIDE;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.52;
    for (let i = 0; i < ELEMENT_COUNT; i++) {
      if (i === SEED_IDX) continue;
      const r = Math.floor(i / SIDE);
      const c = i % SIDE;
      const x = Math.floor(c * cell) + 1;
      const y = Math.floor(r * cell) + 1;
      const w = Math.max(1, Math.ceil((c + 1) * cell) - x - 1);
      const h = Math.max(1, Math.ceil((r + 1) * cell) - y - 1);
      ctx.fillRect(x, y, w, h);
    }
    ctx.globalAlpha = 1;
  }, [px, areaColor, SIDE, ELEMENT_COUNT, SEED_IDX, resolveColor]);

  return (
    <div className="absolute inset-0">
      <motion.div
        layoutId="dm-a5"
        className="absolute inset-0 rounded-2xl overflow-hidden border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50"
        transition={SPRING}
        initial={reduceMotion ? undefined : { scaleX: 0, opacity: 0.7 }}
        animate={{ scaleX: 1, opacity: 1 }}
        style={{ transformOrigin: dir >= 0 ? '100% 50%' : '0% 50%' }}
      >
        {!reduceMotion && (
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-[36%] z-10"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18) 50%, transparent)',
              mixBlendMode: 'overlay',
            }}
            initial={{ x: dir >= 0 ? '260%' : '-260%' }}
            animate={{ x: dir >= 0 ? '-260%' : '260%' }}
            transition={{ duration: 0.9, ease: 'linear' }}
            aria-hidden="true"
          />
        )}

        <div className="absolute inset-2 relative">
          <canvas ref={canvasRef} className="block w-full h-full" aria-hidden="true" />
          {/* Seed tile overlay – morphs from stage 4's full grid */}
          <motion.div
            layoutId="dm-a4"
            className="absolute"
            transition={SPRING}
            style={{
              left: `${seedOffsetPct * 100}%`,
              top: `${seedOffsetPct * 100}%`,
              width: `${tilePct * 100}%`,
              height: `${tilePct * 100}%`,
              backgroundColor: areaColor,
              opacity: 0.9,
            }}
          >
            <SeedRing key={seedKey} areaColor={areaColor} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ── UI helpers ───────────────────────────────────────────────────────────────

function StatCard({ label, value, areaColor }: { label: string; value: string; areaColor: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] dark:bg-black/20 bg-white/80 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-widest dark:text-[var(--color-muted)] text-slate-400 font-medium leading-none mb-1.5">
        {label}
      </div>
      <div className="text-sm font-bold leading-none" style={{ color: areaColor }}>
        {value}
      </div>
    </div>
  );
}

function NavBtn({
  forward,
  onClick,
  disabled,
}: {
  forward: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={forward ? 'Nächste Stufe' : 'Vorherige Stufe'}
      className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50 disabled:opacity-25 transition-opacity flex-shrink-0"
      whileHover={disabled ? undefined : { scale: 1.12 }}
      whileTap={disabled ? undefined : { scale: 0.9 }}
    >
      <svg
        className="w-3.5 h-3.5 dark:text-[var(--color-secondary)] text-slate-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d={forward ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
        />
      </svg>
    </motion.button>
  );
}

// ── Swipe hook ───────────────────────────────────────────────────────────────
function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const startX = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (startX.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      startX.current = null;
      if (Math.abs(dx) < 40) return; // Mindest-Swipe-Distanz 40px
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    },
    [onSwipeLeft, onSwipeRight],
  );

  return { onTouchStart, onTouchEnd };
}

// ── Stage timeline ───────────────────────────────────────────────────────────

interface StageTimelineProps {
  stages: StageInfo[];
  currentStage: number;
  onSelect: (i: number) => void;
  areaColor: string;
  reduceMotion: boolean | null;
}

function StageTimeline({
  stages,
  currentStage,
  onSelect,
  areaColor,
  reduceMotion,
}: StageTimelineProps) {
  const progress = currentStage / (stages.length - 1); // 0 bis 1

  return (
    <div className="hidden sm:block relative w-full px-1">
      {/* Hintergrundlinie */}
      <div
        className="absolute top-[18px] left-4 right-4 h-[2px] rounded-full"
        style={{ backgroundColor: 'var(--color-border)' }}
        aria-hidden="true"
      />

      {/* Fortschrittslinie (animiert) */}
      <motion.div
        className="absolute top-[18px] left-4 right-4 h-[2px] rounded-full origin-left"
        style={{ backgroundColor: areaColor }}
        animate={{ scaleX: progress }}
        initial={false}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />

      {/* Punkte + Labels */}
      <div className="relative flex justify-between">
        {stages.map((s, i) => {
          const isActive = i === currentStage;
          const isPast = i < currentStage;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Stufe ${i + 1}: ${s.shortLabel}`}
              aria-current={isActive ? 'step' : undefined}
              className="flex flex-col items-center gap-1.5 group focus-visible:outline-none p-3 -m-3"
            >
              {/* Punkt */}
              <motion.div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center
                           transition-colors duration-300 group-focus-visible:ring-2
                           group-focus-visible:ring-offset-2"
                style={{
                  borderColor: isActive || isPast ? areaColor : 'var(--color-border)',
                  backgroundColor: isActive
                    ? areaColor
                    : isPast
                    ? `color-mix(in srgb, ${areaColor} 40%, transparent)`
                    : 'var(--color-surface)',
                }}
                animate={isActive && !reduceMotion ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Label */}
              <span
                className="text-[9px] leading-none font-medium transition-colors duration-300
                           whitespace-nowrap"
                style={{
                  color: isActive ? areaColor : 'var(--color-muted)',
                }}
              >
                {s.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function DataMagnifier() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { ref: visualRef, px } = useContainerPx();
  const sectionRef = useRef<HTMLElement | null>(null);
  const isVisible = useRef(false);

  // Image paths (stable memos)
  const breadPath = useMemo(() => getV2ImagePath('brot', 'flux2pro', 0), []);
  const fourPaths = useMemo(
    () => Array.from({ length: 4 }, (_, i) => getV2ImagePath('brot', 'flux2pro', i)),
    [],
  );
  const mosaicPaths = useMemo(() => {
    const base: string[] = [];
    for (const v of BREAD_ONLY) {
      for (const m of MODELS) {
        for (let i = 0; i < IMAGES_PER_SERIES; i++) {
          base.push(getV2ImagePath(v.promptSlug, m, i));
        }
      }
    }
    const extras = shuffleSeeded(base, 2026).slice(0, 16);
    return shuffleSeeded([...base, ...extras], 2028).slice(0, MOSAIC_N);
  }, []);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(MAX_STAGE, next));
      if (clamped === stage) return;
      if (!hasNavigated) setHasNavigated(true);
      if (clamped === MAX_STAGE && !completed) setCompleted(true);
      setDir(clamped > stage ? 1 : -1);
      setStage(clamped);
    },
    [stage, hasNavigated, completed],
  );
  const { onTouchStart, onTouchEnd } = useSwipe(
    useCallback(() => go(stage + 1), [go, stage]),
    useCallback(() => go(stage - 1), [go, stage]),
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isVisible.current) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(stage + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(stage - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stage, go]);

  const info = STAGES[stage];
  const displayCount = useCountUp(info.count, 1000, reduceMotion);
  const showStats = stage >= 3;
  const seedKey = `seed-${stage}`;

  // Stable style object for the motion.div style prop (double-declare trick for TS)
  const wrapperStyle: CSSProperties = { willChange: 'opacity, transform' };

  return (
    <LayoutGroup id="data-magnifier">
      <section
        ref={sectionRef}
        className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white overflow-hidden"
      >
        <div className="p-5 md:p-7 flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          {/* ── Visual column ─────────────────────────────────────────── */}
          <div className="w-full md:flex-[1.7] min-w-0 flex flex-col gap-3">
            {/* Visual area – square, responsive */}
            <div
              ref={visualRef}
              className="relative w-full aspect-square"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <AnimatePresence mode="wait" initial={false}>
                {stage === 0 && (
                  <motion.div
                    key="s0"
                    className="absolute inset-0"
                    style={wrapperStyle}
                    initial={reduceMotion ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1, transition: EASE_OUT }}
                    exit={reduceMotion ? undefined : { opacity: 0, transition: FADE_EXIT }}
                  >
                    <Stage0 path={breadPath} areaColor={areaColor} seedKey={seedKey} showCta={!hasNavigated} />
                  </motion.div>
                )}

                {stage === 1 && (
                  <motion.div
                    key="s1"
                    className="absolute inset-0"
                    style={wrapperStyle}
                    initial={reduceMotion ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1, transition: EASE_OUT }}
                    exit={reduceMotion ? undefined : { opacity: 0, transition: FADE_EXIT }}
                  >
                    <Stage1
                      paths={fourPaths}
                      areaColor={areaColor}
                      reduceMotion={reduceMotion}
                      dir={dir}
                      seedKey={seedKey}
                    />
                  </motion.div>
                )}

                {stage === 2 && (
                  <motion.div
                    key="s2"
                    className="absolute inset-0"
                    style={wrapperStyle}
                    initial={reduceMotion ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1, transition: EASE_OUT }}
                    exit={reduceMotion ? undefined : { opacity: 0, transition: FADE_EXIT }}
                  >
                    <Stage2
                      paths={mosaicPaths}
                      fourPaths={fourPaths}
                      areaColor={areaColor}
                      reduceMotion={reduceMotion}
                      dir={dir}
                      seedKey={seedKey}
                    />
                  </motion.div>
                )}

                {stage === 3 && (
                  <motion.div
                    key="s3"
                    className="absolute inset-0"
                    style={wrapperStyle}
                    initial={reduceMotion ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1, transition: EASE_OUT }}
                    exit={reduceMotion ? undefined : { opacity: 0, transition: FADE_EXIT }}
                  >
                    <StageAbstract
                      stageIdx={3}
                      areaColor={areaColor}
                      reduceMotion={reduceMotion}
                      dir={dir}
                      seedKey={seedKey}
                    />
                  </motion.div>
                )}

                {stage === 4 && (
                  <motion.div
                    key="s4"
                    className="absolute inset-0"
                    style={wrapperStyle}
                    initial={reduceMotion ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1, transition: EASE_OUT }}
                    exit={reduceMotion ? undefined : { opacity: 0, transition: FADE_EXIT }}
                  >
                    <StageAbstract
                      stageIdx={4}
                      areaColor={areaColor}
                      reduceMotion={reduceMotion}
                      dir={dir}
                      seedKey={seedKey}
                    />
                  </motion.div>
                )}

                {stage === 5 && (
                  <motion.div
                    key="s5"
                    className="absolute inset-0"
                    style={wrapperStyle}
                    initial={reduceMotion ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1, transition: EASE_OUT }}
                    exit={reduceMotion ? undefined : { opacity: 0, transition: FADE_EXIT }}
                  >
                    <Stage5
                      areaColor={areaColor}
                      px={px}
                      reduceMotion={reduceMotion}
                      dir={dir}
                      seedKey={seedKey}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>


            {/* Navigation */}
            <div className="flex flex-col gap-2">
              {/* Timeline (ab sm-Breakpoint) */}
              <StageTimeline
                stages={STAGES}
                currentStage={stage}
                onSelect={go}
                areaColor={areaColor}
                reduceMotion={reduceMotion}
              />

              {/* Prev/Next + Dots-Fallback */}
              <div className="flex items-center gap-3 px-1">
                <NavBtn forward={false} onClick={() => go(stage - 1)} disabled={stage === 0} />

                {/* Dots – nur auf sehr kleinen Screens (sm:hidden) */}
                <div className="flex-1 flex items-center justify-center gap-2 sm:hidden">
                  {STAGES.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Stufe ${i + 1}: ${s.shortLabel}`}
                      className="rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 p-3 -m-3"
                      style={{
                        width: i === stage ? 28 : 8,
                        height: 8,
                        backgroundColor: i === stage ? areaColor : 'var(--color-border)',
                        outlineColor: areaColor,
                      }}
                    />
                  ))}
                </div>

                {/* Spacer auf sm+ damit NavBtns außen bleiben */}
                <div className="hidden sm:flex flex-1" aria-hidden="true" />

                <NavBtn forward onClick={() => go(stage + 1)} disabled={stage === MAX_STAGE} />
              </div>
            </div>
          </div>

          {/* ── Info column ───────────────────────────────────────────── */}
          <div
            className="w-full md:flex-1 min-w-0 md:pt-2"
            aria-live="polite"
            aria-atomic="true"
          >
            {/* Large count number – außerhalb AnimatePresence, damit Count-Up immer sichtbar.
                Schriftgröße passt sich an Zeichenanzahl an, damit kein Rand-Clipping entsteht. */}
            {(() => {
              const countStr = fmt.format(displayCount);
              const sizeClass =
                countStr.length > 11 ? 'text-3xl' :
                countStr.length > 7  ? 'text-4xl' :
                                       'text-5xl';
              return (
                <div
                  className={`${sizeClass} font-bold tabular-nums leading-none`}
                  style={{ color: areaColor }}
                >
                  {countStr}
                </div>
              );
            })()}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`info-${stage}`}
                initial={reduceMotion ? undefined : { opacity: 0, x: dir * 24 }}
                animate={{ opacity: 1, x: 0, transition: { ...EASE_OUT, delay: 0.14 } }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -dir * 16, transition: FADE_EXIT }}
              >
                {/* Ratio badge + stage indicator */}
                <div className="mt-3 mb-4 flex flex-wrap items-center gap-2">
                  {info.ratio !== null && (
                    <motion.span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${areaColor} 16%, transparent)`,
                        color: areaColor,
                      }}
                      initial={reduceMotion ? undefined : { scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ ...EASE_OUT, delay: 0.22 }}
                    >
                      ×&thinsp;{oneDec.format(info.ratio)} mal mehr
                    </motion.span>
                  )}
                  <span className="text-[11px] uppercase tracking-widest dark:text-[var(--color-muted)] text-slate-400">
                    Stufe {stage + 1}&thinsp;/&thinsp;{MAX_STAGE + 1}
                  </span>
                </div>

                {/* Headline */}
                <h3 className="text-base md:text-lg font-bold mb-2.5 dark:text-[var(--color-primary)] text-slate-800 leading-snug">
                  {info.headline}
                </h3>

                {/* Body */}
                <p className="text-sm md:text-base dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed">
                  {info.body}
                </p>

                {/* Stats for large numbers */}
                {showStats && (
                  <motion.div
                    className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2"
                    initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...EASE_OUT, delay: 0.3 }}
                  >
                    <StatCard
                      label="1 Sek. pro Bild"
                      value={formatViewingTime(info.count)}
                      areaColor={areaColor}
                    />
                    <StatCard
                      label="10 × 10 cm Ausdruck"
                      value={formatPrintArea(info.count)}
                      areaColor={areaColor}
                    />
                  </motion.div>
                )}

                {/* Completion panel – erscheint einmalig beim Erreichen von Stage 5 */}
                {completed && stage === MAX_STAGE && (
                  <motion.div
                    className="mt-5 rounded-xl border flex items-start gap-3 px-4 py-3"
                    style={{
                      borderColor: `color-mix(in srgb, ${areaColor} 35%, transparent)`,
                      background: `color-mix(in srgb, ${areaColor} 7%, transparent)`,
                    }}
                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
                  >
                    {/* Check-Icon */}
                    <motion.div
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: `color-mix(in srgb, ${areaColor} 18%, transparent)` }}
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 1.0 }}
                    >
                      <svg
                        className="w-4 h-4"
                        style={{ color: areaColor }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>

                    {/* Text */}
                    <div>
                      <p className="text-sm font-semibold leading-snug" style={{ color: areaColor }}>
                        Alle 6 Stufen entdeckt
                      </p>
                      <p className="text-xs leading-relaxed mt-1 dark:text-[var(--color-secondary)] text-slate-500">
                        5,85 Milliarden Bilder – das ist die Grundlage hinter einem einzigen KI-Modell.
                      </p>
                    </div>
                  </motion.div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="px-5 md:px-7 pb-4 flex items-start gap-2">
          <svg
            className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 dark:text-[var(--color-muted)] text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-[11px] dark:text-[var(--color-muted)] text-slate-400 leading-relaxed">
            Die gezeigten Bilder sind KI-generiert und dienen nur zur Veranschaulichung. Echte
            Trainingsdatensätze enthalten reale Fotos aus dem Internet.
          </p>
        </div>
      </section>
    </LayoutGroup>
  );
}
