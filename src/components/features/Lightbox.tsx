import { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ImageData } from '../../types/image.types';
import { getTeacherAttributes, getTeacherOutfitTags, TEACHER_CATEGORY_LABELS } from '../../utils/teacherAttributes';
import { resolveAssetPath } from '../../utils/assetPath';
import Modal from '../ui/Modal';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

type LightboxImage = Pick<ImageData, 'filename'> & Partial<Pick<ImageData, 'attributes'>>;

interface LightboxProps {
  images: LightboxImage[];
  basePath: string;
  subjectSlug: string;
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  showMetadata?: boolean;
}

export default function Lightbox({
  images,
  basePath,
  subjectSlug,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  showMetadata,
}: LightboxProps) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [direction, setDirection] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(MIN_ZOOM);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      const next = currentIndex + dir;
      if (next >= 0 && next < images.length) {
        setDirection(dir);
        onNavigate(next);
      }
    },
    [currentIndex, images.length, onNavigate],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, navigate]);

  useEffect(() => {
    if (!isOpen) return;
    setZoomLevel(MIN_ZOOM);
  }, [isOpen, currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (zoomLevel > MIN_ZOOM) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      navigate(dx > 0 ? -1 : 1);
    }
  };

  const image = images[currentIndex];
  if (!image) return null;
  const attrs = image.attributes ? getTeacherAttributes(image.attributes) : null;
  const canShowMetadata = Boolean(showMetadata && attrs);
  const outfitLabels = attrs
    ? getTeacherOutfitTags(subjectSlug, attrs)
        .map(value => TEACHER_CATEGORY_LABELS.outfitTags[value])
        .join(', ')
    : '';
  const imageAltText = `KI-generiertes Bild ${currentIndex + 1} von ${images.length}`;

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(2))));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(MIN_ZOOM, Number((prev - ZOOM_STEP).toFixed(2))));
  };

  const resetZoom = () => {
    setZoomLevel(MIN_ZOOM);
  };

  const toggleZoom = () => {
    setZoomLevel(prev => (prev > MIN_ZOOM ? MIN_ZOOM : 2));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId="lightbox-title"
      fullscreen
      className="bg-transparent dark:bg-transparent"
      backdropClassName="bg-black/90 backdrop-blur-sm p-0"
    >
      <div
        className="relative h-full w-full flex items-center justify-center"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <h2 id="lightbox-title" className="sr-only">
          Bildansicht {currentIndex + 1} von {images.length}
        </h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Schliessen"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>

        {currentIndex > 0 && (
          <button
            onClick={e => {
              e.stopPropagation();
              navigate(-1);
            }}
            className="absolute left-2 md:left-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Vorheriges Bild"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {currentIndex < images.length - 1 && (
          <button
            onClick={e => {
              e.stopPropagation();
              navigate(1);
            }}
            className="absolute right-2 md:right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Naechstes Bild"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 100 }}
            transition={{ duration: 0.2 }}
            className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <div
              className={`rounded-lg border border-white/10 bg-black/20 ${
                zoomLevel > MIN_ZOOM ? 'max-h-[85vh] max-w-[95vw] overflow-auto' : ''
              }`}
            >
              <img
                src={resolveAssetPath(`${basePath}/${image.filename}`)}
                alt={imageAltText}
                onError={event => {
                  const img = event.currentTarget;
                  const src = img.getAttribute('src');
                  if (!src || img.dataset.fallbackApplied === '1') return;

                  const match = src.match(/\/(images|videos)\//);
                  if (match) {
                    const index = src.indexOf(`/${match[1]}/`);
                    const relative = src.slice(index + 1);
                    if (relative && relative !== src) {
                      img.dataset.fallbackApplied = '1';
                      img.src = relative;
                    }
                    return;
                  }

                  if (src.startsWith('/')) {
                    const relative = src.slice(1);
                    if (relative && relative !== src) {
                      img.dataset.fallbackApplied = '1';
                      img.src = relative;
                    }
                  }
                }}
                onClick={toggleZoom}
                className={`rounded-lg select-none ${
                  zoomLevel > MIN_ZOOM
                    ? 'max-w-none h-auto cursor-zoom-out'
                    : 'max-w-full max-h-[85vh] object-contain cursor-zoom-in'
                }`}
                style={zoomLevel > MIN_ZOOM ? { width: `${zoomLevel * 100}%` } : undefined}
              />
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-white">
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoomLevel <= MIN_ZOOM}
                className="px-2 py-1 rounded border border-white/25 disabled:opacity-40"
                aria-label="Zoom verkleinern"
              >
                -
              </button>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoomLevel >= MAX_ZOOM}
                className="px-2 py-1 rounded border border-white/25 disabled:opacity-40"
                aria-label="Zoom vergroessern"
              >
                +
              </button>
              <button
                type="button"
                onClick={resetZoom}
                disabled={zoomLevel === MIN_ZOOM}
                className="px-2 py-1 rounded border border-white/25 disabled:opacity-40"
              >
                Reset
              </button>
              <span>{Math.round(zoomLevel * 100)}%</span>
            </div>

            {canShowMetadata && attrs && (
              <div className="mt-3 px-4 py-2 rounded-lg bg-white/10 text-white text-xs flex flex-wrap gap-x-4 gap-y-1 max-w-lg">
                <span>Geschlecht: {TEACHER_CATEGORY_LABELS.gender[attrs.gender]}</span>
                <span>Alter: {TEACHER_CATEGORY_LABELS.age[attrs.age]}</span>
                <span>Haarfarbe: {TEACHER_CATEGORY_LABELS.hairColor[attrs.hairColor]}</span>
                <span>Hautfarbe: {TEACHER_CATEGORY_LABELS.skinTone[attrs.skinTone]}</span>
                <span>Brille: {TEACHER_CATEGORY_LABELS.glasses[attrs.glasses]}</span>
                <span>Outfit: {outfitLabels || 'keine'}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Modal>
  );
}
