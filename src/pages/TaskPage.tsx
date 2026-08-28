import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLearningPath } from '../contexts/LearningPathContext';
import { AreaProvider, useArea } from '../contexts/AreaContext';
import { getPathById } from '../data/learningPaths';
import { MODELS, SUBJECTS } from '../data/subjects';
import { getSeries } from '../data/imageMetadata';
import type { ModelId } from '../types/image.types';
import type { TaskData, TaskStepConfig } from '../types/knowledge.types';
import { resolveAssetPath } from '../utils/assetPath';
import MilestoneOverlay, { getMilestoneStep } from '../components/features/MilestoneOverlay';
import CulturalComparisonGrid from '../components/content/CulturalComparisonGrid';
import Lightbox from '../components/features/Lightbox';

const DEFAULT_STRUCTURED_FIELDS = ['Beobachtung', 'Begründung'];

function readTextLength(data: TaskData): number {
  const textParts = [data.text ?? '', ...Object.values(data.fields ?? {})];
  if (data.justification) textParts.push(data.justification);
  return textParts.join(' ').trim().length;
}

function TaskPageContent() {
  const area = useArea();
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { pathId, stepNumber } = useParams<{ pathId: string; stepNumber: string }>();
  const {
    activePath,
    currentStep,
    pathProgress,
    isInitialized,
    saveTaskData,
    getTaskData,
    setSelectedSubject,
    nextStep,
    prevStep,
  } = useLearningPath();

  const parsedStepNumber = Number(stepNumber);
  const pathFromRoute = pathId ? getPathById(pathId) : undefined;

  const [draft, setDraft] = useState<TaskData>({});
  const [comparisonModel, setComparisonModel] = useState<ModelId>('flux2pro');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const initializedStepRef = useRef<number | null>(null);
  const [milestoneShown, setMilestoneShown] = useState(false);

  useEffect(() => {
    // Wait for localStorage restoration before evaluating redirect conditions
    if (!isInitialized) return;

    if (!pathId || !pathFromRoute) {
      navigate('/lernen', { replace: true });
      return;
    }

    if (!activePath || activePath.id !== pathId) {
      navigate(`/lernen/${pathId}`, { replace: true });
      return;
    }

    if (!Number.isFinite(parsedStepNumber) || parsedStepNumber < 1) {
      navigate(`/lernen/${pathId}`, { replace: true });
      return;
    }

    if (parsedStepNumber > currentStep) {
      // Only redirect if this step is genuinely unreachable (prerequisite not yet completed).
      // Do NOT redirect when currentStep temporarily drops during backward navigation —
      // prevStep defers navigate via setTimeout, leaving a brief window where
      // parsedStepNumber > currentStep even though the user is intentionally going back.
      const prerequisiteCompleted =
        parsedStepNumber <= 1 ||
        (pathProgress?.completedSteps.includes(parsedStepNumber - 1) ?? false);
      if (!prerequisiteCompleted) {
        navigate(`/lernen/${pathId}`, { replace: true });
      }
    }
  }, [
    isInitialized,
    activePath,
    currentStep,
    navigate,
    parsedStepNumber,
    pathFromRoute,
    pathId,
    pathProgress,
  ]);

  const step = activePath?.steps.find(item => item.stepNumber === parsedStepNumber);

  useEffect(() => {
    if (!step || step.area !== 'aufgabe') {
      return;
    }
    // Only initialize draft once per step to prevent resetting when pathProgress changes
    if (initializedStepRef.current === parsedStepNumber) {
      return;
    }
    initializedStepRef.current = parsedStepNumber;
    setDraft(getTaskData(parsedStepNumber) ?? {});
  }, [getTaskData, parsedStepNumber, step]);

  useEffect(() => {
    if (!activePath || !step || step.area !== 'aufgabe') {
      return;
    }

    const timer = window.setTimeout(() => {
      saveTaskData(parsedStepNumber, draft);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [activePath, draft, parsedStepNumber, saveTaskData, step]);

  if (!activePath || !step || step.area !== 'aufgabe' || !step.taskConfig) {
    return null;
  }

  const taskConfig = step.taskConfig;
  const minLength = taskConfig.minLength ?? 20;

  const milestoneStep = getMilestoneStep(activePath);
  const showMilestone =
    milestoneStep !== null &&
    parsedStepNumber === milestoneStep &&
    !milestoneShown &&
    !(pathProgress?.completedSteps.includes(milestoneStep) ?? false);
  const charCount = readTextLength(draft);
  const selectedSubject = pathProgress?.selectedSubject ?? draft.selectedOption;

  // Local canAdvance check based on draft state (avoids 500ms debounce delay)
  const localCanAdvance = (() => {
    if (taskConfig.inputType === 'choice-and-text' && !draft.selectedOption) {
      return false;
    }
    if (taskConfig.inputType === 'slider') {
      return !!draft.sliderValues && Object.keys(draft.sliderValues).length > 0;
    }
    if (taskConfig.inputType === 'image-select') {
      const hasSelection = !!draft.selectedImages && draft.selectedImages.length > 0;
      if (taskConfig.imageSelectConfig?.requireJustification) {
        return hasSelection && (draft.justification?.trim().length ?? 0) >= minLength;
      }
      return hasSelection;
    }
    if (taskConfig.inputType === 'rating') {
      const itemCount = taskConfig.ratingConfig?.items.length ?? 0;
      return !!draft.sliderValues && Object.keys(draft.sliderValues).length >= itemCount;
    }
    return charCount >= minLength;
  })();

  const isFirstStep = parsedStepNumber <= 1;
  const isLastStep = parsedStepNumber >= activePath.steps.length;

  const handleNext = () => {
    // Save immediately before advancing, then force-advance
    // (context canAdvance may lag behind due to debounce)
    saveTaskData(parsedStepNumber, draft);
    nextStep({ force: true });
  };

  const handlePrev = () => {
    // Save draft immediately before navigating back so no input is lost
    saveTaskData(parsedStepNumber, draft);
    prevStep();
  };

  const comparisonSeries = selectedSubject && taskConfig.imageRef === 'kontaktblatt'
    ? getSeries(selectedSubject, comparisonModel)
    : null;

  const comparisonImageSrc = (() => {
    if (!selectedSubject || taskConfig.imageRef === undefined || taskConfig.imageRef === 'kontaktblatt') {
      return null;
    }

    const series = getSeries(selectedSubject, comparisonModel);
    const firstImage = series?.images[0];
    if (!series || !firstImage) {
      return null;
    }

    return resolveAssetPath(`${series.basePath}/${firstImage.filename}`);
  })();

  const comparisonFields =
    taskConfig.comparisonCategories && taskConfig.comparisonCategories.length > 0
      ? taskConfig.comparisonCategories
      : DEFAULT_STRUCTURED_FIELDS;

  const previousData = taskConfig.previousStepRef
    ? getTaskData(taskConfig.previousStepRef)
    : undefined;

  const areaColor = area === 'lernen' ? 'var(--color-area-lernen)' : 'var(--color-accent)';

  const updateField = (name: string, value: string) => {
    setDraft(prev => ({
      ...prev,
      fields: {
        ...(prev.fields ?? {}),
        [name]: value,
      },
    }));
  };

  const renderScaffolding = (config: TaskStepConfig) => {
    if (!config.scaffolding || config.scaffolding.length === 0) {
      return null;
    }

    return (
      <details className="rounded-lg border border-[var(--color-border)] p-3 mb-4">
        <summary className="cursor-pointer text-sm font-medium dark:text-[var(--color-secondary)] text-slate-700">
          Leitfragen
        </summary>
        <ul className="mt-2 text-sm list-disc pl-5 dark:text-[var(--color-muted)] text-slate-600 space-y-1">
          {config.scaffolding.map(question => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </details>
    );
  };

  const renderFreeText = () => (
    <>
      <textarea
        value={draft.text ?? ''}
        onChange={event => setDraft(prev => ({ ...prev, text: event.target.value }))}
        placeholder="Schreibe hier deine Antwort..."
        className="w-full min-h-44 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white p-4 text-sm resize-y"
      />
      <p className={`text-xs mt-2 ${charCount >= minLength ? 'text-[var(--color-success)]' : 'dark:text-[var(--color-muted)] text-slate-500'}`}>
        Zeichen: {charCount}/{minLength} Minimum
      </p>
    </>
  );

  const renderChoiceAndText = () => (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
        {SUBJECTS.map(subject => {
          const active = draft.selectedOption === subject.slug;
          return (
            <button
              key={subject.slug}
              type="button"
              onClick={() => {
                setDraft(prev => ({ ...prev, selectedOption: subject.slug }));
                setSelectedSubject(subject.slug);
              }}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                active
                  ? 'border-[var(--color-area-lernen)] bg-[var(--color-area-lernen)]/10 text-[var(--color-area-lernen)] font-medium'
                  : 'border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-700 hover:border-[var(--color-area-lernen)]/40'
              }`}
            >
              {subject.label}
            </button>
          );
        })}
      </div>
      {renderFreeText()}
    </>
  );

  const renderStructured = () => (
    <div className="space-y-3">
      {comparisonFields.map(fieldName => (
        <div key={fieldName}>
          <label className="block text-sm mb-1 dark:text-[var(--color-secondary)] text-slate-700">
            {fieldName}
          </label>
          <textarea
            value={draft.fields?.[fieldName] ?? ''}
            onChange={event => updateField(fieldName, event.target.value)}
            placeholder={`${fieldName} beschreiben...`}
            className="w-full min-h-24 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white p-3 text-sm resize-y"
          />
        </div>
      ))}
      <p className={`text-xs ${charCount >= minLength ? 'text-[var(--color-success)]' : 'dark:text-[var(--color-muted)] text-slate-500'}`}>
        Zeichen: {charCount}/{minLength} Minimum
      </p>
    </div>
  );

  const renderComparison = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <section className="rounded-xl border border-[var(--color-border)] p-4 dark:bg-[var(--color-surface)] bg-white">
          <h3 className="text-sm font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-2">
            Eigene Eingabe
          </h3>
          {taskConfig.previousStepRef && previousData ? (
            <div className="space-y-2 text-sm dark:text-[var(--color-secondary)] text-slate-700">
              {previousData.text && <p>{previousData.text}</p>}
              {previousData.fields &&
                Object.entries(previousData.fields).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key}:</strong> {value}
                  </p>
                ))}
            </div>
          ) : (
            <p className="text-sm dark:text-[var(--color-muted)] text-slate-500">
              Keine Referenzdaten verfügbar.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-[var(--color-border)] p-4 dark:bg-[var(--color-surface)] bg-white">
          <h3 className="text-sm font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-2">
            KI-Bildreferenz
          </h3>
          <div className="flex gap-2 mb-3 flex-wrap">
            {MODELS.map(model => (
              <button
                key={model.id}
                type="button"
                onClick={() => setComparisonModel(model.id)}
                className={`px-2 py-1 rounded-md text-xs border ${
                  comparisonModel === model.id
                    ? 'border-[var(--color-area-lernen)] text-[var(--color-area-lernen)] bg-[var(--color-area-lernen)]/10'
                    : 'border-[var(--color-border)] dark:text-[var(--color-muted)] text-slate-600'
                }`}
              >
                {model.label}
              </button>
            ))}
          </div>

          {comparisonSeries ? (
            <>
              <div className="grid grid-cols-4 gap-1">
                {comparisonSeries.images.map((img, index) => (
                  <button
                    key={img.filename}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="aspect-square rounded-lg overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-area-lernen)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-area-lernen)] transition-all cursor-zoom-in"
                    aria-label={`Bild ${index + 1} vergrößern`}
                  >
                    <img
                      src={resolveAssetPath(`${comparisonSeries.basePath}/${img.filename}`)}
                      alt={`KI-Bild ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              <Lightbox
                images={comparisonSeries.images}
                basePath={comparisonSeries.basePath}
                subjectSlug={selectedSubject ?? ''}
                currentIndex={lightboxIndex ?? 0}
                isOpen={lightboxIndex !== null}
                onClose={() => setLightboxIndex(null)}
                onNavigate={setLightboxIndex}
              />
            </>
          ) : comparisonImageSrc ? (
            <img
              src={comparisonImageSrc}
              alt={`Referenzbild ${selectedSubject ?? 'ohne Fach'}`}
              className="w-full rounded-lg border border-[var(--color-border)]"
            />
          ) : (
            <p className="text-sm dark:text-[var(--color-muted)] text-slate-500">
              Wähle ein Fach oder öffne vorher den Schritt mit Fachauswahl.
            </p>
          )}
        </section>
      </div>

      <div className="space-y-3">
        {comparisonFields.map(fieldName => (
          <div key={fieldName}>
            <label className="block text-sm mb-1 dark:text-[var(--color-secondary)] text-slate-700">
              {fieldName}
            </label>
            <textarea
              value={draft.fields?.[fieldName] ?? ''}
              onChange={event => updateField(fieldName, event.target.value)}
              placeholder={`${fieldName} eintragen...`}
              className="w-full min-h-20 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white p-3 text-sm resize-y"
            />
          </div>
        ))}
      </div>

      <p className={`text-xs ${charCount >= minLength ? 'text-[var(--color-success)]' : 'dark:text-[var(--color-muted)] text-slate-500'}`}>
        Zeichen: {charCount}/{minLength} Minimum
      </p>
    </div>
  );

  const renderSlider = () => {
    const config = taskConfig.sliderConfig;
    if (!config) return null;
    const mid = Math.round((config.min + config.max) / 2);

    return (
      <div className="space-y-6">
        {config.items.map(item => {
          const isSet = draft.sliderValues?.[item.id] !== undefined;
          const value = draft.sliderValues?.[item.id] ?? mid;

          return (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium dark:text-[var(--color-secondary)] text-slate-700">
                  {item.label}
                </label>
                <span
                  className={`text-sm font-semibold tabular-nums shrink-0 ${
                    isSet
                      ? 'dark:text-[var(--color-primary)] text-slate-900'
                      : 'dark:text-[var(--color-muted)] text-slate-400'
                  }`}
                >
                  {isSet ? value : '–'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs dark:text-[var(--color-muted)] text-slate-500 w-24 text-right leading-tight shrink-0">
                  {config.minLabel}
                </span>
                <input
                  type="range"
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  value={value}
                  onChange={e => {
                    setDraft(prev => ({
                      ...prev,
                      sliderValues: { ...(prev.sliderValues ?? {}), [item.id]: Number(e.target.value) },
                    }));
                  }}
                  className="flex-1 accent-[var(--color-area-lernen)] cursor-pointer"
                  aria-label={item.label}
                  aria-valuemin={config.min}
                  aria-valuemax={config.max}
                  aria-valuenow={value}
                />
                <span className="text-xs dark:text-[var(--color-muted)] text-slate-500 w-24 leading-tight shrink-0">
                  {config.maxLabel}
                </span>
              </div>
              {!isSet && (
                <p className="text-xs text-center dark:text-[var(--color-muted)] text-slate-400">
                  Regler verschieben zum Einschätzen
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderImageSelect = () => {
    const config = taskConfig.imageSelectConfig;
    if (!config) return null;
    const selected = draft.selectedImages ?? [];

    const toggleImage = (imageId: string) => {
      setDraft(prev => {
        const current = prev.selectedImages ?? [];
        if (current.includes(imageId)) {
          return { ...prev, selectedImages: current.filter(id => id !== imageId) };
        }
        if (config.maxSelections === 1) {
          return { ...prev, selectedImages: [imageId] };
        }
        if (current.length >= config.maxSelections) {
          return prev;
        }
        return { ...prev, selectedImages: [...current, imageId] };
      });
    };

    return (
      <div className="space-y-4">
        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-700">{config.prompt}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {config.images.map(image => {
            const isSelected = selected.includes(image.id);
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => toggleImage(image.id)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-area-lernen)] ${
                  isSelected
                    ? 'border-[var(--color-area-lernen)] shadow-lg shadow-[var(--color-area-lernen)]/20'
                    : 'border-[var(--color-border)] hover:border-[var(--color-area-lernen)]/50'
                }`}
                aria-pressed={isSelected}
                aria-label={image.alt}
              >
                <img
                  src={resolveAssetPath(image.src)}
                  alt={image.alt}
                  className="w-full aspect-square object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-[var(--color-area-lernen)]/20 flex items-center justify-center">
                    <div className="bg-[var(--color-area-lernen)] rounded-full p-1.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {config.maxSelections > 1 && (
          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500">
            {selected.length} / {config.maxSelections} ausgewählt
          </p>
        )}
        {config.requireJustification && (
          <div>
            <label className="block text-sm mb-1 dark:text-[var(--color-secondary)] text-slate-700">
              Begründung
            </label>
            <textarea
              value={draft.justification ?? ''}
              onChange={e => setDraft(prev => ({ ...prev, justification: e.target.value }))}
              placeholder="Warum hast du dieses Bild gewählt?"
              className="w-full min-h-24 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white p-3 text-sm resize-y"
            />
            <p
              className={`text-xs mt-1 ${
                (draft.justification?.trim().length ?? 0) >= minLength
                  ? 'text-[var(--color-success)]'
                  : 'dark:text-[var(--color-muted)] text-slate-500'
              }`}
            >
              Zeichen: {draft.justification?.trim().length ?? 0}/{minLength} Minimum
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderRating = () => {
    const config = taskConfig.ratingConfig;
    if (!config) return null;
    const scale = config.scale;
    const mid = Math.round((scale.min + scale.max) / 2);

    return (
      <div className="space-y-5">
        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-700">{config.prompt}</p>
        {config.items.map(item => {
          const isSet = draft.sliderValues?.[item.id] !== undefined;
          const value = draft.sliderValues?.[item.id] ?? mid;

          return (
            <div key={item.id} className="space-y-1.5 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-medium dark:text-[var(--color-secondary)] text-slate-700">
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
                <span
                  className={`text-sm font-semibold tabular-nums shrink-0 ${
                    isSet
                      ? 'dark:text-[var(--color-primary)] text-slate-900'
                      : 'dark:text-[var(--color-muted)] text-slate-400'
                  }`}
                >
                  {isSet ? value : '–'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs dark:text-[var(--color-muted)] text-slate-500 w-20 text-right leading-tight shrink-0">
                  {scale.minLabel}
                </span>
                <input
                  type="range"
                  min={scale.min}
                  max={scale.max}
                  step={1}
                  value={value}
                  onChange={e => {
                    setDraft(prev => ({
                      ...prev,
                      sliderValues: { ...(prev.sliderValues ?? {}), [item.id]: Number(e.target.value) },
                    }));
                  }}
                  className="flex-1 accent-[var(--color-area-lernen)] cursor-pointer"
                  aria-label={item.label}
                  aria-valuemin={scale.min}
                  aria-valuemax={scale.max}
                  aria-valuenow={value}
                />
                <span className="text-xs dark:text-[var(--color-muted)] text-slate-500 w-20 leading-tight shrink-0">
                  {scale.maxLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      >
        <Link
          to={`/lernen/${activePath.id}`}
          className="inline-flex items-center gap-2 text-sm no-underline hover:underline mb-6"
          style={{ color: areaColor }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Lernpfad
        </Link>

        <AnimatePresence>
          {showMilestone && (
            <MilestoneOverlay
              path={activePath}
              completedSteps={pathProgress?.completedSteps.length ?? 0}
              onDismiss={() => setMilestoneShown(true)}
            />
          )}
        </AnimatePresence>

        {step.contextBridge && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            className="mb-6 px-4 py-3 rounded-lg border border-[var(--color-border)] dark:bg-slate-800/50 bg-slate-50"
          >
            <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 italic">
              {step.contextBridge}
            </p>
          </motion.div>
        )}

        <div className="rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{
                color: areaColor,
                backgroundColor: `color-mix(in srgb, ${areaColor} 15%, transparent)`,
              }}
            >
              {taskConfig.operator}
            </span>
            <span className="text-xs dark:text-[var(--color-muted)] text-slate-500">
              Schritt {parsedStepNumber} von {activePath.steps.length}
            </span>
          </div>

          <h1 className="text-2xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-2">
            {taskConfig.title}
          </h1>
          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
            {taskConfig.instruction}
          </p>

          {renderScaffolding(taskConfig)}

          {taskConfig.imageRef === 'cultural-comparison' && (
            <div className="mb-6">
              <CulturalComparisonGrid />
            </div>
          )}

          {taskConfig.inputType === 'freetext' && renderFreeText()}
          {taskConfig.inputType === 'choice-and-text' && renderChoiceAndText()}
          {taskConfig.inputType === 'structured' && renderStructured()}
          {taskConfig.inputType === 'comparison' && renderComparison()}
          {taskConfig.inputType === 'slider' && renderSlider()}
          {taskConfig.inputType === 'image-select' && renderImageSelect()}
          {taskConfig.inputType === 'rating' && renderRating()}

          {/* Inline navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm disabled:opacity-30 disabled:cursor-not-allowed dark:text-[var(--color-secondary)] text-slate-700 hover:dark:bg-[var(--color-surface)] hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Zurück
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!localCanAdvance}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm text-white bg-[var(--color-area-lernen)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {localCanAdvance
                ? isLastStep
                  ? 'Pfad abschliessen'
                  : 'Weiter'
                : 'Aufgabe ausfüllen'}
              {localCanAdvance && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function TaskPage() {
  return (
    <AreaProvider area="lernen">
      <TaskPageContent />
    </AreaProvider>
  );
}
