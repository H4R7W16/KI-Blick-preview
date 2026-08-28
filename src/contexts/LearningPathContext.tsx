import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { LEARNING_PATH_CHECKOUT_MIN_LENGTH } from '../constants/learningPath';
import { getAutoAwardedBadges } from '../data/badges';
import { getCheckoutByUnitId } from '../data/knowledgeUnits';
import { getPathById } from '../data/learningPaths';
import { useProgress } from './ProgressContext';
import type {
  LearningPath,
  LearningPathProgress,
  TaskData,
} from '../types/knowledge.types';

const ACTIVE_PATH_STORAGE_KEY = 'ki-blick-active-path';

interface LearningPathContextValue {
  activePath: LearningPath | null;
  currentStep: number;
  pathProgress: LearningPathProgress | null;
  isPathActive: boolean;
  isInitialized: boolean;
  startPath: (pathId: string, options?: { subject?: string }) => void;
  goToStep: (stepNumber: number) => void;
  nextStep: (options?: { force?: boolean }) => void;
  prevStep: () => void;
  exitPath: () => void;
  saveTaskData: (stepNumber: number, data: TaskData) => void;
  getTaskData: (stepNumber: number) => TaskData | undefined;
  setSelectedSubject: (subject: string) => void;
  completeStep: (stepNumber: number) => void;
  isStepCompleted: (stepNumber: number) => boolean;
  isStepAccessible: (stepNumber: number) => boolean;
  canAdvance: boolean;
  getShareUrl: () => string;
}

const LearningPathContext = createContext<LearningPathContextValue | null>(null);

function createInitialPathProgress(subject?: string): LearningPathProgress {
  return {
    currentStep: 1,
    completedSteps: [],
    taskData: {},
    ...(subject ? { selectedSubject: subject } : {}),
    startedAt: new Date().toISOString(),
  };
}

export function LearningPathProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const {
    progress,
    updatePathProgress,
    updatePathProgressFn,
    getPathProgress,
    markPathCompleted,
  } = useProgress();

  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isInitialized, setIsInitialized] = useState(false);

  const didRestoreRef = useRef(false);

  const activePath = useMemo(
    () => (activePathId ? getPathById(activePathId) ?? null : null),
    [activePathId]
  );

  const pathProgress = useMemo(
    () => (activePath ? getPathProgress(activePath.id) ?? null : null),
    [activePath, getPathProgress]
  );

  const ensurePathProgress = useCallback(
    (pathId: string, options?: { subject?: string }) => {
      const existing = getPathProgress(pathId);
      if (existing) {
        return existing;
      }

      const next = createInitialPathProgress(options?.subject);
      updatePathProgress(pathId, next);
      return next;
    },
    [getPathProgress, updatePathProgress]
  );

  const resolveStepPath = useCallback(
    (path: LearningPath, stepNumber: number, selectedSubject?: string) => {
      const step = path.steps.find(item => item.stepNumber === stepNumber);
      if (!step) {
        return '/lernen';
      }

      if (step.area === 'aufgabe') {
        return `/lernen/${path.id}/aufgabe/${stepNumber}`;
      }

      if (step.area === 'abschluss') {
        return `/lernen/${path.id}/abschluss/${stepNumber}`;
      }

      if (step.area === 'verstehen' && step.unitId) {
        const base = `/verstehen/${step.unitId}`;
        if (step.sectionId) {
          return `${base}?section=${step.sectionId}${step.sectionEndId ? `&sectionEnd=${step.sectionEndId}` : ''}`;
        }
        return base;
      }

      if (step.area === 'einordnen' && step.unitId) {
        const base = `/einordnen/${step.unitId}`;
        if (step.sectionId) {
          return `${base}?section=${step.sectionId}${step.sectionEndId ? `&sectionEnd=${step.sectionEndId}` : ''}`;
        }
        return base;
      }

      if (step.area === 'entdecken') {
        const subject = selectedSubject ?? step.entdeckenSubject;
        if (!subject) {
          return '/entdecken?guided=true';
        }
        const guided = step.entdeckenGuided !== false;
        return `/entdecken/${subject}${guided ? '?guided=true' : ''}`;
      }

      return `/lernen/${path.id}`;
    },
    []
  );

  const isStepCompleted = useCallback(
    (stepNumber: number) => {
      if (!pathProgress) {
        return false;
      }
      return pathProgress.completedSteps.includes(stepNumber);
    },
    [pathProgress]
  );

  const isStepAccessible = useCallback(
    (stepNumber: number) => {
      if (!activePath) {
        return false;
      }
      if (stepNumber === 1) {
        return true;
      }
      if (stepNumber === currentStep) {
        return true;
      }
      return isStepCompleted(stepNumber - 1);
    },
    [activePath, currentStep, isStepCompleted]
  );

  const updateCurrentStep = useCallback(
    (pathId: string, stepNumber: number) => {
      updatePathProgressFn(pathId, existing => {
        if (existing.currentStep === stepNumber) return existing;
        return { ...existing, currentStep: stepNumber };
      });
    },
    [updatePathProgressFn]
  );

  const goToStep = useCallback(
    (stepNumber: number) => {
      if (!activePath) {
        return;
      }
      if (!activePath.steps.some(step => step.stepNumber === stepNumber)) {
        return;
      }
      if (!isStepAccessible(stepNumber)) {
        return;
      }

      const subject = pathProgress?.selectedSubject;
      const target = resolveStepPath(activePath, stepNumber, subject);
      setCurrentStep(stepNumber);
      updateCurrentStep(activePath.id, stepNumber);
      setTimeout(() => navigate(target), 0);
    },
    [
      activePath,
      isStepAccessible,
      navigate,
      pathProgress?.selectedSubject,
      resolveStepPath,
      updateCurrentStep,
    ]
  );

  const setSelectedSubject = useCallback(
    (subject: string) => {
      if (!activePath) {
        return;
      }
      const existing = ensurePathProgress(activePath.id);
      updatePathProgress(activePath.id, {
        ...existing,
        selectedSubject: subject,
      });
    },
    [activePath, ensurePathProgress, updatePathProgress]
  );

  const saveTaskData = useCallback(
    (stepNumber: number, data: TaskData) => {
      if (!activePath) {
        return;
      }

      updatePathProgressFn(activePath.id, existing => ({
        ...existing,
        taskData: {
          ...existing.taskData,
          [stepNumber]: {
            ...(existing.taskData[stepNumber] ?? {}),
            ...data,
          },
        },
      }));
    },
    [activePath, updatePathProgressFn]
  );

  const getTaskData = useCallback(
    (stepNumber: number) => {
      if (!pathProgress) {
        return undefined;
      }
      return pathProgress.taskData[stepNumber];
    },
    [pathProgress]
  );

  const completeStep = useCallback(
    (stepNumber: number) => {
      if (!activePath) {
        return;
      }
      const step = activePath.steps.find(item => item.stepNumber === stepNumber);
      if (!step) {
        return;
      }

      const existing = ensurePathProgress(activePath.id);
      const alreadyCompleted = existing.completedSteps.includes(stepNumber);
      if (alreadyCompleted) {
        return;
      }

      const nextTaskData =
        step.area === 'aufgabe' || step.area === 'abschluss'
          ? {
              ...existing.taskData,
              [stepNumber]: {
                ...(existing.taskData[stepNumber] ?? {}),
                completedAt: new Date().toISOString(),
              },
            }
          : existing.taskData;

      updatePathProgress(activePath.id, {
        ...existing,
        completedSteps: [...existing.completedSteps, stepNumber],
        taskData: nextTaskData,
      });
    },
    [activePath, ensurePathProgress, updatePathProgress]
  );

  const canAdvance = useMemo(() => {
    if (!activePath) {
      return false;
    }
    const step = activePath.steps.find(item => item.stepNumber === currentStep);
    if (!step) {
      return false;
    }

    if (isStepCompleted(currentStep)) {
      return true;
    }

    if (step.area === 'entdecken') {
      return true;
    }

    if (step.area === 'verstehen' || step.area === 'einordnen') {
      const unitId = step.unitId;
      if (!unitId) {
        return true;
      }

      const checkout = getCheckoutByUnitId(unitId);

      if (checkout && step.sectionId) {
        // Section-based steps show only a fragment of the unit. Inline checkpoint
        // blocks in the content are reveal elements, not formal checkouts – requiring
        // the full unit checkout for a partial view is too strict. A unit visit suffices.
        return progress.visitedUnits.includes(unitId);
      }

      if (checkout) {
        return progress.completedCheckouts.includes(checkout.id);
      }

      // In a learning path, visiting the unit is enough to proceed.
      return progress.visitedUnits.includes(unitId);
    }

    if (step.area === 'aufgabe') {
      const taskData = pathProgress?.taskData[currentStep];
      if (!taskData) {
        return false;
      }

      const config = step.taskConfig;
      if (!config) {
        return false;
      }

      if (config.inputType === 'slider') {
        return !!taskData.sliderValues && Object.keys(taskData.sliderValues).length > 0;
      }

      if (config.inputType === 'image-select') {
        const hasSelection = !!taskData.selectedImages && taskData.selectedImages.length > 0;
        if (config.imageSelectConfig?.requireJustification) {
          return hasSelection && (taskData.justification?.trim().length ?? 0) >= (config.minLength ?? 20);
        }
        return hasSelection;
      }

      if (config.inputType === 'rating') {
        const itemCount = config.ratingConfig?.items.length ?? 0;
        return !!taskData.sliderValues && Object.keys(taskData.sliderValues).length >= itemCount;
      }

      const minLength = config.minLength ?? 20;
      const textLength = [taskData.text ?? '', ...Object.values(taskData.fields ?? {})]
        .join(' ')
        .trim().length;

      if (config.inputType === 'choice-and-text' && !taskData.selectedOption) {
        return false;
      }

      return textLength >= minLength;
    }

    if (step.area === 'abschluss') {
      const checkoutText = pathProgress?.taskData[currentStep]?.text ?? '';
      return checkoutText.trim().length >= LEARNING_PATH_CHECKOUT_MIN_LENGTH;
    }

    return false;
  }, [activePath, currentStep, isStepCompleted, pathProgress, progress.completedCheckouts, progress.visitedUnits]);

  const nextStep = useCallback((options?: { force?: boolean }) => {
    if (!activePath || (!canAdvance && !options?.force)) {
      return;
    }

    const step = activePath.steps.find(s => s.stepNumber === currentStep);
    if (!step) {
      return;
    }

    const isLastStep = currentStep >= activePath.steps.length;
    const nextStepNum = isLastStep ? currentStep : currentStep + 1;

    // Consolidate all state updates into a single updatePathProgress call
    // to avoid race conditions where multiple calls overwrite each other.
    const existing = ensurePathProgress(activePath.id);
    const alreadyCompleted = existing.completedSteps.includes(currentStep);

    const nextTaskData =
      !alreadyCompleted && (step.area === 'aufgabe' || step.area === 'abschluss')
        ? {
            ...existing.taskData,
            [currentStep]: {
              ...(existing.taskData[currentStep] ?? {}),
              completedAt: new Date().toISOString(),
            },
          }
        : existing.taskData;

    updatePathProgress(activePath.id, {
      ...existing,
      currentStep: nextStepNum,
      completedSteps: alreadyCompleted
        ? existing.completedSteps
        : [...existing.completedSteps, currentStep],
      taskData: nextTaskData,
    });

    setCurrentStep(nextStepNum);

    let completionState: { completedPathId: string; newlyUnlockedBadgeIds: string[] } | undefined;

    if (isLastStep) {
      const nextCompletedPaths = progress.completedPaths.includes(activePath.id)
        ? progress.completedPaths
        : [...progress.completedPaths, activePath.id];
      const nextAutoBadges = getAutoAwardedBadges(nextCompletedPaths);
      const knownBadges = new Set(progress.badges);
      const newlyUnlockedBadgeIds = nextAutoBadges.filter(badgeId => !knownBadges.has(badgeId));

      completionState = {
        completedPathId: activePath.id,
        newlyUnlockedBadgeIds,
      };

      markPathCompleted(activePath.id);
      // Deactivate the path so the user returns to free mode
      setActivePathId(null);
      setCurrentStep(1);
      localStorage.removeItem(ACTIVE_PATH_STORAGE_KEY);
    }

    // Defer navigation to the next microtask so React can commit state
    // updates first. Calling navigate synchronously alongside multiple
    // setState calls can silently fail in some React 18 batching scenarios.
    const subject = pathProgress?.selectedSubject;
    const target = isLastStep
      ? `/lernen/${activePath.id}`
      : resolveStepPath(activePath, nextStepNum, subject);
    setTimeout(() => {
      if (completionState) {
        navigate(target, { state: completionState });
        return;
      }
      navigate(target);
    }, 0);
  }, [activePath, canAdvance, currentStep, ensurePathProgress, markPathCompleted, navigate, pathProgress?.selectedSubject, progress.badges, progress.completedPaths, resolveStepPath, updatePathProgress]);

  const prevStep = useCallback(() => {
    if (!activePath || currentStep <= 1) {
      return;
    }
    const prevStepNum = currentStep - 1;
    if (!activePath.steps.some(s => s.stepNumber === prevStepNum)) {
      return;
    }
    const subject = pathProgress?.selectedSubject;
    const target = resolveStepPath(activePath, prevStepNum, subject);
    setCurrentStep(prevStepNum);
    updateCurrentStep(activePath.id, prevStepNum);
    // Defer navigation so React commits state updates first — same pattern as nextStep.
    setTimeout(() => navigate(target), 0);
  }, [activePath, currentStep, navigate, pathProgress?.selectedSubject, resolveStepPath, updateCurrentStep]);

  const startPath = useCallback(
    (pathId: string, options?: { subject?: string }) => {
      const path = getPathById(pathId);
      if (!path) {
        return;
      }

      const existing = ensurePathProgress(pathId, options);
      const selectedSubject = options?.subject ?? existing.selectedSubject;
      const nextProgress = selectedSubject
        ? { ...existing, selectedSubject }
        : existing;

      if (nextProgress !== existing) {
        updatePathProgress(pathId, nextProgress);
      }

      const targetStep = Math.min(
        Math.max(nextProgress.currentStep, 1),
        path.steps[path.steps.length - 1]?.stepNumber ?? 1
      );

      setActivePathId(pathId);
      setCurrentStep(targetStep);
      navigate(resolveStepPath(path, targetStep, nextProgress.selectedSubject));
    },
    [ensurePathProgress, navigate, resolveStepPath, updatePathProgress]
  );

  const exitPath = useCallback(() => {
    setActivePathId(null);
    setCurrentStep(1);
    localStorage.removeItem(ACTIVE_PATH_STORAGE_KEY);
    navigate('/lernen');
  }, [navigate]);

  const getShareUrl = useCallback(() => {
    if (!activePath) {
      return `${window.location.origin}${window.location.pathname}#/lernen`;
    }

    const baseUrl = `${window.location.origin}${window.location.pathname}#/lernen/${activePath.id}`;
    const subject = pathProgress?.selectedSubject;
    if (!subject) {
      return baseUrl;
    }

    return `${baseUrl}?fach=${encodeURIComponent(subject)}`;
  }, [activePath, pathProgress?.selectedSubject]);

  useEffect(() => {
    if (!activePathId) {
      return;
    }

    localStorage.setItem(
      ACTIVE_PATH_STORAGE_KEY,
      JSON.stringify({ pathId: activePathId, currentStep })
    );
  }, [activePathId, currentStep]);

  useEffect(() => {
    if (didRestoreRef.current) {
      return;
    }
    didRestoreRef.current = true;

    try {
      const raw = localStorage.getItem(ACTIVE_PATH_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as Partial<{ pathId: string; currentStep: number }>;
      if (!parsed.pathId) {
        return;
      }

      const path = getPathById(parsed.pathId);
      if (!path) {
        localStorage.removeItem(ACTIVE_PATH_STORAGE_KEY);
        return;
      }

      const existing = ensurePathProgress(parsed.pathId);
      const restoredStep =
        typeof parsed.currentStep === 'number' && parsed.currentStep > 0
          ? Math.min(parsed.currentStep, path.steps.length)
          : existing.currentStep;

      setActivePathId(parsed.pathId);
      setCurrentStep(restoredStep);
      updateCurrentStep(parsed.pathId, restoredStep);
    } catch {
      localStorage.removeItem(ACTIVE_PATH_STORAGE_KEY);
    } finally {
      setIsInitialized(true);
    }
  }, [ensurePathProgress, updateCurrentStep]);

  useEffect(() => {
    if (!activePath) {
      return;
    }

    const maxStep = activePath.steps.length;
    if (currentStep <= maxStep) {
      return;
    }

    setCurrentStep(maxStep);
    updateCurrentStep(activePath.id, maxStep);
  }, [activePath, currentStep, updateCurrentStep]);

  const value: LearningPathContextValue = {
    activePath,
    currentStep,
    pathProgress,
    isPathActive: Boolean(activePath),
    isInitialized,
    startPath,
    goToStep,
    nextStep,
    prevStep,
    exitPath,
    saveTaskData,
    getTaskData,
    setSelectedSubject,
    completeStep,
    isStepCompleted,
    isStepAccessible,
    canAdvance,
    getShareUrl,
  };

  return <LearningPathContext.Provider value={value}>{children}</LearningPathContext.Provider>;
}

export function useLearningPath(): LearningPathContextValue {
  const context = useContext(LearningPathContext);
  if (!context) {
    throw new Error('useLearningPath must be used within LearningPathProvider');
  }
  return context;
}
