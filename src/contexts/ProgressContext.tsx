import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getAutoAwardedBadges } from '../data/badges';
import { trackEvent } from '../services/trackingService';
import type { LearningPathProgress, TaskData, UserProgress } from '../types/knowledge.types';

const STORAGE_KEY = 'ki-blick-progress';

export interface KiBlickExport {
  v: 1;
  p: UserProgress;
  r: Record<string, string>;
  exported: string;
}

function toBase64Url(str: string): string {
  return btoa(encodeURIComponent(str))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function fromBase64Url(encoded: string): string {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const rem = padded.length % 4;
  return decodeURIComponent(atob(rem ? padded + '='.repeat(4 - rem) : padded));
}

export function decodeExport(encoded: string): KiBlickExport | null {
  try {
    const json = fromBase64Url(encoded);
    const data = JSON.parse(json) as KiBlickExport;
    if (data.v !== 1 || !data.p || typeof data.p !== 'object') return null;
    return data;
  } catch {
    return null;
  }
}

const DEFAULT_PROGRESS: UserProgress = {
  nickname: '',
  visitedUnits: [],
  completedCheckouts: [],
  learningPaths: {},
  badges: [],
  completedPaths: [],
};

function normalizePathProgress(value: unknown): LearningPathProgress | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Partial<LearningPathProgress>;
  if (typeof candidate.currentStep !== 'number') {
    return null;
  }

  const completedSteps = Array.isArray(candidate.completedSteps)
    ? candidate.completedSteps.filter((step): step is number => typeof step === 'number')
    : [];

  const taskDataSource = candidate.taskData;
  const taskDataEntries =
    taskDataSource && typeof taskDataSource === 'object' && !Array.isArray(taskDataSource)
      ? Object.entries(taskDataSource)
      : [];

  const taskData: Record<number, TaskData> = {};
  taskDataEntries.forEach(([key, entry]) => {
    const stepNumber = Number(key);
    if (!Number.isFinite(stepNumber) || !entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return;
    }
    const raw = entry as TaskData;
    taskData[stepNumber] = {
      ...(typeof raw.text === 'string' ? { text: raw.text } : {}),
      ...(raw.fields && typeof raw.fields === 'object' && !Array.isArray(raw.fields)
        ? {
            fields: Object.fromEntries(
              Object.entries(raw.fields).filter(
                (field): field is [string, string] =>
                  typeof field[0] === 'string' && typeof field[1] === 'string'
              )
            ),
          }
        : {}),
      ...(typeof raw.selectedOption === 'string' ? { selectedOption: raw.selectedOption } : {}),
      ...(typeof raw.completedAt === 'string' ? { completedAt: raw.completedAt } : {}),
      ...(Array.isArray(raw.selectedImages)
        ? { selectedImages: raw.selectedImages.filter((id): id is string => typeof id === 'string') }
        : {}),
      ...(typeof raw.justification === 'string' ? { justification: raw.justification } : {}),
      ...(raw.sliderValues && typeof raw.sliderValues === 'object' && !Array.isArray(raw.sliderValues)
        ? {
            sliderValues: Object.fromEntries(
              Object.entries(raw.sliderValues).filter(
                (entry): entry is [string, number] =>
                  typeof entry[0] === 'string' && typeof entry[1] === 'number'
              )
            ),
          }
        : {}),
    };
  });

  return {
    currentStep: candidate.currentStep,
    completedSteps,
    taskData,
    ...(typeof candidate.selectedSubject === 'string' ? { selectedSubject: candidate.selectedSubject } : {}),
    startedAt: typeof candidate.startedAt === 'string' ? candidate.startedAt : new Date().toISOString(),
  };
}

function migrateProgress(data: UserProgress): UserProgress {
  const migrated = { ...data };

  // LP3 ID-Migration: vier-modelle-vier-welten → drei-modelle-drei-blicke
  if (migrated.learningPaths['vier-modelle-vier-welten']) {
    migrated.learningPaths = { ...migrated.learningPaths };
    migrated.learningPaths['drei-modelle-drei-blicke'] = migrated.learningPaths['vier-modelle-vier-welten'];
    delete migrated.learningPaths['vier-modelle-vier-welten'];
  }
  if (migrated.completedPaths.includes('vier-modelle-vier-welten')) {
    migrated.completedPaths = migrated.completedPaths.map(
      id => id === 'vier-modelle-vier-welten' ? 'drei-modelle-drei-blicke' : id
    );
  }

  // Badge-Migration: badge-vier-modelle → badge-drei-modelle
  migrated.badges = migrated.badges.map(
    id => id === 'badge-vier-modelle' ? 'badge-drei-modelle' : id
  );

  // Badge-Migration: badge-lernpfad-trio → badge-lernpfad-komplett
  migrated.badges = migrated.badges.map(
    id => id === 'badge-lernpfad-trio' ? 'badge-lernpfad-komplett' : id
  );

  return migrated;
}

function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PROGRESS;
    }

    const parsed = JSON.parse(raw) as Partial<UserProgress> & {
      learningPaths?: unknown;
      completedPaths?: unknown;
      badges?: unknown;
    };

    const learningPathsRaw = parsed.learningPaths;
    const learningPaths: Record<string, LearningPathProgress> = {};

    if (learningPathsRaw && typeof learningPathsRaw === 'object' && !Array.isArray(learningPathsRaw)) {
      const entries = Object.entries(learningPathsRaw);
      const hasLegacyNumberValue = entries.some(([, value]) => typeof value === 'number');

      if (!hasLegacyNumberValue) {
        entries.forEach(([pathId, value]) => {
          const normalized = normalizePathProgress(value);
          if (normalized) {
            learningPaths[pathId] = normalized;
          }
        });
      }
    }

    const completedPaths = Array.isArray(parsed.completedPaths)
      ? parsed.completedPaths.filter((pathId): pathId is string => typeof pathId === 'string')
      : [];

    const storedBadges = Array.isArray(parsed.badges)
      ? parsed.badges.filter((badgeId): badgeId is string => typeof badgeId === 'string')
      : [];

    const badges = [...new Set([...storedBadges, ...getAutoAwardedBadges(completedPaths)])];

    return migrateProgress({
      ...DEFAULT_PROGRESS,
      ...parsed,
      learningPaths,
      badges,
      completedPaths,
    });
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function saveProgress(progress: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

interface ProgressContextValue {
  progress: UserProgress;
  setNickname: (name: string) => void;
  markUnitVisited: (unitId: string) => void;
  markCheckoutCompleted: (checkoutId: string) => void;
  hasNickname: boolean;
  updatePathProgress: (pathId: string, nextProgress: LearningPathProgress) => void;
  updatePathProgressFn: (pathId: string, updater: (prev: LearningPathProgress) => LearningPathProgress) => void;
  getPathProgress: (pathId: string) => LearningPathProgress | undefined;
  markPathCompleted: (pathId: string) => void;
  isPathCompleted: (pathId: string) => boolean;
  markTaskStepCompleted: (pathId: string, stepNumber: number) => void;
  resetAllData: () => void;
  exportToLink: () => string;
  importData: (raw: KiBlickExport) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  const update = useCallback((updater: (prev: UserProgress) => UserProgress) => {
    setProgress(prev => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  const setNickname = useCallback(
    (name: string) => {
      update(p => ({ ...p, nickname: name }));
    },
    [update]
  );

  const markUnitVisited = useCallback(
    (unitId: string) => {
      update(p => {
        if (p.visitedUnits.includes(unitId)) return p;
        return { ...p, visitedUnits: [...p.visitedUnits, unitId] };
      });
    },
    [update]
  );

  const markCheckoutCompleted = useCallback(
    (checkoutId: string) => {
      update(p => {
        if (p.completedCheckouts.includes(checkoutId)) return p;
        trackEvent('checkout_completed', undefined, { checkoutId });
        return { ...p, completedCheckouts: [...p.completedCheckouts, checkoutId] };
      });
    },
    [update]
  );

  const updatePathProgress = useCallback(
    (pathId: string, nextProgress: LearningPathProgress) => {
      update(p => ({
        ...p,
        learningPaths: {
          ...p.learningPaths,
          [pathId]: nextProgress,
        },
      }));
    },
    [update]
  );

  // Functional variant: updater receives the latest committed state, preventing
  // stale-closure overwrites when multiple updates are batched in the same handler.
  const updatePathProgressFn = useCallback(
    (pathId: string, updater: (prev: LearningPathProgress) => LearningPathProgress) => {
      update(p => {
        const existing = p.learningPaths[pathId];
        if (!existing) return p;
        return {
          ...p,
          learningPaths: {
            ...p.learningPaths,
            [pathId]: updater(existing),
          },
        };
      });
    },
    [update]
  );

  const getPathProgress = useCallback(
    (pathId: string) => {
      return progress.learningPaths[pathId];
    },
    [progress.learningPaths]
  );

  const markPathCompleted = useCallback(
    (pathId: string) => {
      update(p => {
        if (p.completedPaths.includes(pathId)) return { ...p };

        const completedPaths = [...p.completedPaths, pathId];
        const newBadges = getAutoAwardedBadges(completedPaths).filter(b => !p.badges.includes(b));
        const badges = [...new Set([...p.badges, ...newBadges])];

        trackEvent('path_completed', undefined, { pathId });
        newBadges.forEach(badgeId => trackEvent('badge_earned', undefined, { badgeId }));

        return { ...p, completedPaths, badges };
      });
    },
    [update]
  );

  const isPathCompleted = useCallback(
    (pathId: string) => {
      return progress.completedPaths.includes(pathId);
    },
    [progress.completedPaths]
  );

  const resetAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('ki-blick-active-path');
    const reflectionKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('ki-blick-reflection-')) {
        reflectionKeys.push(key);
      }
    }
    reflectionKeys.forEach(key => localStorage.removeItem(key));
    setProgress(DEFAULT_PROGRESS);
  }, []);

  const exportToLink = useCallback((): string => {
    const reflections: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('ki-blick-reflection-')) {
        const value = localStorage.getItem(key);
        if (value) reflections[key.replace('ki-blick-reflection-', '')] = value;
      }
    }
    const exportData: KiBlickExport = { v: 1, p: progress, r: reflections, exported: new Date().toISOString() };
    const encoded = toBase64Url(JSON.stringify(exportData));
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}#/?import=${encoded}`;
  }, [progress]);

  const importData = useCallback((raw: KiBlickExport) => {
    localStorage.removeItem('ki-blick-active-path');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw.p));
    Object.entries(raw.r).forEach(([checkoutId, text]) => {
      localStorage.setItem(`ki-blick-reflection-${checkoutId}`, text);
    });
    setProgress(loadProgress());
  }, []);

  const markTaskStepCompleted = useCallback(
    (pathId: string, stepNumber: number) => {
      update(p => {
        const existingPath = p.learningPaths[pathId] ?? {
          currentStep: stepNumber,
          completedSteps: [],
          taskData: {},
          startedAt: new Date().toISOString(),
        };

        const existingTaskData = existingPath.taskData[stepNumber] ?? {};

        return {
          ...p,
          learningPaths: {
            ...p.learningPaths,
            [pathId]: {
              ...existingPath,
              completedSteps: existingPath.completedSteps.includes(stepNumber)
                ? existingPath.completedSteps
                : [...existingPath.completedSteps, stepNumber],
              taskData: {
                ...existingPath.taskData,
                [stepNumber]: {
                  ...existingTaskData,
                  completedAt: new Date().toISOString(),
                },
              },
            },
          },
        };
      });
    },
    [update]
  );

  return (
    <ProgressContext.Provider
      value={{
        progress,
        setNickname,
        markUnitVisited,
        markCheckoutCompleted,
        hasNickname: progress.nickname.length > 0,
        updatePathProgress,
        updatePathProgressFn,
        getPathProgress,
        markPathCompleted,
        isPathCompleted,
        markTaskStepCompleted,
        resetAllData,
        exportToLink,
        importData,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
