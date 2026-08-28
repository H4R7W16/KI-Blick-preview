import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { resolveAssetPath } from '../../utils/assetPath';

export interface TeaserItem {
  fach: string;
  fachSlug: string;
  modell: string;
  modellSlug: string;
  fact: string;
  highlight: string;
  highlightLabel: string;
  previewImages: string[]; // 3 for standard layout, 9 for mosaic (darkImageIndex required)
  darkImageIndex?: number; // mosaic only: which image is the visually divergent one
  linkLabel?: string; // override default "Alle 16 Bilder erkunden"
}

interface TeaserSpotlightProps {
  items: TeaserItem[];
  autoPlayInterval?: number;
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 120 : -120,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -120 : 120,
    opacity: 0,
    transition: { duration: 0.25 },
  }),
};

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function HighlightNumber({ value, active }: { value: string; active: boolean }) {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const match = value.match(/^(\d+)/);
  const leadNum = match ? parseInt(match[1], 10) : null;
  const suffix = match ? value.slice(match[1].length) : value;

  const [count, setCount] = useState(leadNum ?? 0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!active || leadNum === null) return;
    if (prefersReduced) {
      setCount(leadNum);
      return;
    }
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setCount(leadNum);
      return;
    }
    setCount(0);
    const duration = 600;
    const start = performance.now();
    let rafId: number;
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * leadNum));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [active, leadNum, prefersReduced]);

  if (leadNum === null) {
    return <span>{value}</span>;
  }
  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

function ImageCollage({ item }: { item: TeaserItem }) {
  const base = `/images/generated/${item.fachSlug}/${item.modellSlug}/`;
  // Support absolute paths (starting with '/') for cross-series items like the skin-tone spotlight
  const imgSrc = (filename: string) =>
    filename.startsWith('/') ? resolveAssetPath(filename) : resolveAssetPath(base + filename);

  const wrapperStyle = {
    background: 'color-mix(in srgb, var(--color-area-entdecken) 12%, var(--color-bg))',
  };

  // Mosaic layout for 9-image grid (e.g. skin-tone spotlight)
  if (item.previewImages.length >= 9) {
    return (
      <div className="relative w-full h-full rounded-2xl overflow-hidden" style={wrapperStyle}>
        <div className="absolute inset-3 grid grid-cols-3 grid-rows-3 gap-1.5">
          {item.previewImages.slice(0, 9).map((img, i) => (
            <div key={i} className="rounded-lg overflow-hidden">
              <img
                src={imgSrc(img)}
                alt={`${item.fach} – Bild ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl">
          <p className="text-sm font-semibold text-white leading-tight">{item.fach}</p>
          <p className="text-xs text-white/60">{item.modell}</p>
        </div>
      </div>
    );
  }

  // Standard 3-image layout: big left, two stacked right
  const [img1, img2, img3] = item.previewImages;
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden" style={wrapperStyle}>
      <div className="absolute inset-3 grid grid-cols-[3fr_2fr] grid-rows-2 gap-2">
        <div className="row-span-2 rounded-xl overflow-hidden">
          <img
            src={imgSrc(img1)}
            alt={`${item.fach} – Beispielbild 1`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="rounded-xl overflow-hidden">
          <img
            src={imgSrc(img2)}
            alt={`${item.fach} – Beispielbild 2`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="rounded-xl overflow-hidden">
          <img
            src={imgSrc(img3)}
            alt={`${item.fach} – Beispielbild 3`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bottom label overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl">
        <p className="text-sm font-semibold text-white leading-tight">{item.fach}</p>
        <p className="text-xs text-white/60">{item.modell}</p>
      </div>
    </div>
  );
}

export default function TeaserSpotlight({ items, autoPlayInterval = 5000 }: TeaserSpotlightProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current],
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(prev => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(prev => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (paused || prefersReduced) return;
    const timer = setInterval(next, autoPlayInterval);
    return () => clearInterval(timer);
  }, [next, autoPlayInterval, paused, prefersReduced]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) >= 50) {
      if (delta < 0) {
        next();
      } else {
        prev();
      }
    }
    touchStartX.current = null;
  };

  const item = items[current];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Teaser-Beispiele aus dem Entdecken-Bereich"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Main spotlight area */}
      <div className="relative" data-tour="teaser-grid">

        {/* Prev arrow */}
        <button
          type="button"
          onClick={prev}
          aria-label="Vorheriges Beispiel"
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 items-center justify-center rounded-full border dark:border-[var(--color-border)] border-slate-200 dark:bg-[var(--color-card)] bg-white dark:text-[var(--color-secondary)] text-slate-500 dark:hover:border-[var(--color-accent)] hover:border-[var(--color-accent)] dark:hover:text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <ChevronLeft />
        </button>

        {/* Next arrow */}
        <button
          type="button"
          onClick={next}
          aria-label="Naechstes Beispiel"
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-10 h-10 items-center justify-center rounded-full border dark:border-[var(--color-border)] border-slate-200 dark:bg-[var(--color-card)] bg-white dark:text-[var(--color-secondary)] text-slate-500 dark:hover:border-[var(--color-accent)] hover:border-[var(--color-accent)] dark:hover:text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <ChevronRight />
        </button>

        {/* Slide content */}
        <div
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={prefersReduced ? {} : slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch"
            >
              {/* Image collage */}
              <Link
                to={`/entdecken/${item.fachSlug}?modell=${item.modellSlug}`}
                className="block w-full md:w-auto md:flex-[3] max-w-[520px] mx-auto md:mx-0 aspect-[4/3] no-underline group hover:opacity-95 transition-opacity duration-300"
                tabIndex={0}
              >
                <ImageCollage item={item} />
              </Link>

              {/* Stats panel */}
              <div className="w-full md:w-auto md:flex-[2] flex flex-col justify-center text-center md:text-left rounded-2xl dark:bg-[var(--color-card)] bg-slate-50 border dark:border-[var(--color-border)] border-slate-200 px-6 py-8 md:px-8">
                <div
                  className="text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums leading-none mb-1"
                  style={{ color: 'var(--color-accent)' }}
                >
                  <HighlightNumber value={item.highlight} active={true} />
                </div>
                <p className="text-lg md:text-xl dark:text-[var(--color-secondary)] text-slate-600 mb-5 font-medium">
                  {item.highlightLabel}
                </p>
                <p className="text-sm dark:text-[var(--color-muted)] text-slate-500 leading-relaxed mb-6">
                  {item.fact}
                </p>
                <Link
                  to={`/entdecken/${item.fachSlug}?modell=${item.modellSlug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)] hover:underline no-underline self-center md:self-start"
                >
                  {item.linkLabel ?? 'Alle 16 Bilder erkunden'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {/* Subject pill navigation */}
      <div
        className="flex flex-wrap justify-center gap-2 mt-5"
        role="tablist"
        aria-label="Slide-Navigation"
      >
        {items.map((it, i) => {
          const isActive = i === current;
          const label = it.fach.replace('lehrkraft', '');
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => goTo(i)}
              aria-label={`${it.fach} (${it.modell})`}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                isActive
                  ? 'bg-[var(--color-accent)] text-white shadow-sm scale-105'
                  : 'dark:bg-[var(--color-card)] bg-slate-100 dark:text-[var(--color-muted)] text-slate-500 dark:border dark:border-[var(--color-border)] hover:dark:text-[var(--color-secondary)] hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
