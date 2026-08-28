import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getSubjectBySlug, getImageBasePath, isAnalysisEnabledForSubject } from '../data/subjects';
import { getSeries, type SeriesWithPath } from '../data/imageMetadata';
import type { ModelId } from '../types/image.types';
import ModelSlider from '../components/features/ModelSlider';
import AnalysisTool from '../components/features/AnalysisTool';
import Lightbox from '../components/features/Lightbox';
import { resolveAssetPath } from '../utils/assetPath';
import { useLearningPath } from '../contexts/LearningPathContext';
import MilestoneOverlay, { getMilestoneStep } from '../components/features/MilestoneOverlay';

interface ReviewSeriesListItem {
  id: string;
  subjectFolder: string;
  modelId: string;
}

interface ReviewImageItem {
  filename: string;
  index: number;
  attributes: SeriesWithPath['images'][number]['attributes'];
}

interface ReviewSeriesDetailResponse {
  metadata: {
    seriesId: string;
    prompt: string;
    model: string;
    modelId: string;
    count: number;
    images: ReviewImageItem[];
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function parseReviewSeriesDetail(
  raw: unknown,
  subjectSlug: string,
  basePath: string,
): SeriesWithPath | null {
  if (!isRecord(raw) || !isRecord(raw.metadata)) return null;
  const metadata = raw.metadata as ReviewSeriesDetailResponse['metadata'];
  if (!Array.isArray(metadata.images)) return null;

  const images = metadata.images
    .filter(img => isRecord(img) && typeof img.filename === 'string' && typeof img.index === 'number' && isRecord(img.attributes))
    .map(img => ({
      filename: img.filename,
      index: img.index,
      attributes: img.attributes,
    }));

  if (images.length === 0) return null;
  if (
    typeof metadata.seriesId !== 'string' ||
    typeof metadata.prompt !== 'string' ||
    typeof metadata.model !== 'string' ||
    typeof metadata.modelId !== 'string'
  ) {
    return null;
  }

  return {
    seriesId: metadata.seriesId,
    prompt: metadata.prompt,
    model: metadata.model,
    modelId: metadata.modelId,
    count: images.length,
    images,
    basePath,
    subjectSlug,
  };
}

export default function EntdeckenGalleryPage() {
  const { subject } = useParams<{ subject: string }>();
  const [searchParams] = useSearchParams();
  const guidedMode = searchParams.get('guided') === 'true';
  const analysisAvailable = subject ? isAnalysisEnabledForSubject(subject) : false;
  const analysisDisabled = searchParams.get('analysis') === 'off' || guidedMode || !analysisAvailable;

  const VALID_MODELS: ModelId[] = ['flux2pro', 'gpt-image-1-5', 'nanobana'];
  const modelParam = searchParams.get('modell');
  const initialModel: ModelId = VALID_MODELS.includes(modelParam as ModelId)
    ? (modelParam as ModelId)
    : 'flux2pro';
  const [activeModel, setActiveModel] = useState<ModelId>(initialModel);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [analysisActive, setAnalysisActive] = useState(false);
  const [filteredIndices, setFilteredIndices] = useState<Set<number> | null>(null);
  const [liveSeries, setLiveSeries] = useState<SeriesWithPath | null>(null);

  const { activePath, currentStep, pathProgress } = useLearningPath();
  const [milestoneShown, setMilestoneShown] = useState(false);
  const contextBridge = guidedMode
    ? activePath?.steps.find(s => s.stepNumber === currentStep)?.contextBridge
    : undefined;

  const subjectInfo = subject ? getSubjectBySlug(subject) : undefined;
  const staticSeries = subject ? getSeries(subject, activeModel) : undefined;
  const series = liveSeries ?? staticSeries;

  const milestoneStep = activePath ? getMilestoneStep(activePath) : null;
  const showMilestone =
    guidedMode &&
    milestoneStep !== null &&
    currentStep === milestoneStep &&
    !milestoneShown &&
    !(pathProgress?.completedSteps.includes(milestoneStep) ?? false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    let cancelled = false;
    setLiveSeries(null);

    const loadLiveSeries = async () => {
      if (!subjectInfo) return;

      try {
        const listResponse = await fetch('/api/review/series', { cache: 'no-store' });
        if (!listResponse.ok) return;

        const listPayload: unknown = await listResponse.json();
        const list = isRecord(listPayload) && Array.isArray(listPayload.series) ? listPayload.series : [];
        const match = list
          .filter((entry): entry is ReviewSeriesListItem => {
            return isRecord(entry)
              && typeof entry.id === 'string'
              && typeof entry.subjectFolder === 'string'
              && typeof entry.modelId === 'string';
          })
          .find(entry => entry.subjectFolder === subjectInfo.folder && entry.modelId === activeModel);

        if (!match) return;

        const detailResponse = await fetch(`/api/review/series/${encodeURIComponent(match.id)}`, { cache: 'no-store' });
        if (!detailResponse.ok) return;

        const detailPayload: unknown = await detailResponse.json();
        const resolved = parseReviewSeriesDetail(
          detailPayload,
          subjectInfo.slug,
          getImageBasePath(subjectInfo.slug, activeModel),
        );

        if (!cancelled && resolved) {
          setLiveSeries(resolved);
        }
      } catch {
        // Ignore: static metadata remains fallback in production and without review API.
      }
    };

    void loadLiveSeries();
    return () => {
      cancelled = true;
    };
  }, [activeModel, subjectInfo]);

  const handleFilteredIndices = useCallback((indices: Set<number> | null) => {
    setFilteredIndices(indices);
  }, []);

  if (!subjectInfo || !series) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-4">
          Fach nicht gefunden
        </h1>
        <Link to="/entdecken" className="text-[var(--color-area-entdecken)] hover:underline">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6"
      >
        <Link
          to="/entdecken"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-area-entdecken)] no-underline hover:underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Entdecken
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-2">
          {subjectInfo.label}lehrkraft
        </h1>
        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">
          Prompt: &bdquo;{subjectInfo.prompt}&ldquo; &middot; 16 Bilder pro Modell &middot; Geschlechtsneutrale Formulierung in deutscher Sprache
        </p>
      </motion.div>

      {/* Milestone overlay */}
      <AnimatePresence>
        {showMilestone && activePath && (
          <MilestoneOverlay
            path={activePath}
            completedSteps={pathProgress?.completedSteps.length ?? 0}
            onDismiss={() => setMilestoneShown(true)}
          />
        )}
      </AnimatePresence>

      {/* Guided mode banner */}
      {guidedMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl border border-[var(--color-area-lernen)]/30 bg-[var(--color-area-lernen)]/5"
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[var(--color-area-lernen)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-[var(--color-area-lernen)] mb-1">Lernpfad-Modus</p>
              <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">
                Erkunde die Bilder ohne Analyse-Tool. Sammle eigene Beobachtungen: Was fällt dir auf? Welche Muster siehst du?
              </p>
              {contextBridge && (
                <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 italic mt-2">
                  {contextBridge}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Model slider */}
      <div className="mb-6 flex justify-center">
        <ModelSlider activeModel={activeModel} onChange={setActiveModel} />
      </div>

      {/* Analysis tool */}
      {!analysisDisabled && (
        <div className="mb-6">
          <AnalysisTool
            images={series.images}
            subjectSlug={subjectInfo.slug}
            isActive={analysisActive}
            onToggle={() => setAnalysisActive(!analysisActive)}
            onFilteredIndices={handleFilteredIndices}
          />
        </div>
      )}

      {/* Image grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${subject}-${activeModel}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4"
          data-tour="gallery-grid"
        >
          {series.images.map((image, index) => {
            const isDimmed = filteredIndices !== null && !filteredIndices.has(index);
            return (
              <motion.button
                key={image.filename}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => setLightboxIndex(index)}
                className={`group relative aspect-square rounded-xl overflow-hidden border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-area-entdecken)] transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-[var(--color-area-entdecken)]/40 ${
                  isDimmed ? 'opacity-20 grayscale' : ''
                }`}
                aria-label={`Bild ${index + 1}: ${subjectInfo.prompt}, generiert mit ${series.model}`}
              >
                <img
                  src={resolveAssetPath(`${series.basePath}/${image.filename}`)}
                  alt={`KI-generiertes Bild: ${subjectInfo.prompt}, erstellt mit ${series.model}`}
                  loading="lazy"
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
                  className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
                />
                {/* Hover overlay with number */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end">
                  <span className="text-white text-xs font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index + 1}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Generation info */}
      <div className="mt-8 p-4 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white">
        <div className="flex flex-wrap gap-4 text-xs dark:text-[var(--color-muted)] text-slate-500">
          <span><strong className="dark:text-[var(--color-secondary)] text-slate-700">Modell:</strong> {series.model}</span>
          <span><strong className="dark:text-[var(--color-secondary)] text-slate-700">Prompt:</strong> &bdquo;{subjectInfo.prompt}&ldquo;</span>
          <span><strong className="dark:text-[var(--color-secondary)] text-slate-700">Sprache:</strong> Deutsch (geschlechtsneutral)</span>
          <span><strong className="dark:text-[var(--color-secondary)] text-slate-700">Anzahl:</strong> {series.images.length} Bilder</span>
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        images={series.images}
        basePath={series.basePath}
        subjectSlug={subjectInfo.slug}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
        showMetadata={analysisActive}
      />
    </div>
  );
}
