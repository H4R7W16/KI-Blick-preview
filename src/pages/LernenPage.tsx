import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLearningPath } from '../contexts/LearningPathContext';
import { useProgress } from '../contexts/ProgressContext';
import { getBadgeById, type BadgeDefinition } from '../data/badges';
import { COMING_SOON_PATHS, LEARNING_PATHS, getPathById, type ComingSoonPath } from '../data/learningPaths';
import { getSubjectBySlug } from '../data/subjects';
import { getUnitById } from '../data/knowledgeUnits';
import type { LearningPath, LearningPathProgress, LearningPathStep } from '../types/knowledge.types';
import AreaHeroIllustration from '../components/ui/AreaHeroIllustration';
import { CompletionFeedbackSheet } from '../components/features/feedback/CompletionFeedbackSheet';

const AREA_COLORS: Record<string, string> = {
  verstehen: 'var(--color-area-verstehen)',
  entdecken: 'var(--color-area-entdecken)',
  einordnen: 'var(--color-area-einordnen)',
  aufgabe: 'var(--color-area-lernen)',
  abschluss: 'var(--color-success)',
};

const AREA_LABELS: Record<string, string> = {
  verstehen: 'Verstehen',
  entdecken: 'Entdecken',
  einordnen: 'Einordnen',
  aufgabe: 'Aufgabe',
  abschluss: 'Abschluss',
};

function getStepLink(step: LearningPathStep, pathId: string, selectedSubject?: string): string | null {
  if (step.area === 'verstehen' && step.unitId) return `/verstehen/${step.unitId}`;
  if (step.area === 'einordnen' && step.unitId) return `/einordnen/${step.unitId}`;
  if (step.area === 'entdecken') {
    const subject = selectedSubject ?? step.entdeckenSubject;
    if (!subject) {
      return '/entdecken';
    }
    const guided = step.entdeckenGuided !== false;
    return `/entdecken/${subject}${guided ? '?guided=true' : ''}`;
  }
  if (step.area === 'aufgabe') return `/lernen/${pathId}/aufgabe/${step.stepNumber}`;
  if (step.area === 'abschluss') return `/lernen/${pathId}/abschluss/${step.stepNumber}`;
  return null;
}

function getStepTitle(step: LearningPathStep): string {
  if (step.area === 'aufgabe' && step.taskConfig) return step.taskConfig.title;
  if (step.unitId) {
    const unit = getUnitById(step.unitId);
    if (unit) return unit.title;
  }
  return step.description;
}

interface PathCardProps {
  path: LearningPath;
  progress?: LearningPathProgress;
  unlockedBadges: Set<string>;
  isCompleted: boolean;
  isActive: boolean;
  isFirst?: boolean;
  onOpen: () => void;
  onStart: () => void;
  onExit: () => void;
  onCopy: () => void;
  copied: boolean;
}

function PathCard({ path, progress, unlockedBadges, isCompleted, isActive, isFirst, onOpen, onStart, onExit, onCopy, copied }: PathCardProps) {
  const completedSteps = progress?.completedSteps.length ?? 0;
  const totalSteps = path.steps.length;
  const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const pathBadge = path.badgeId ? getBadgeById(path.badgeId) : undefined;
  const badgeUnlocked = pathBadge ? unlockedBadges.has(pathBadge.id) : false;

  return (
    <article className="rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <button type="button" onClick={onOpen} className="text-left">
          <h3 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900">
            {path.title}
          </h3>
          {path.subtitle && (
            <p className="text-sm dark:text-[var(--color-muted)] text-slate-500">{path.subtitle}</p>
          )}
        </button>
        {isCompleted && (
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 flex-shrink-0">
            Abgeschlossen
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-3 line-clamp-3">
        {path.description}
      </p>

      {/* Spacer to push rest to bottom */}
      <div className="mt-auto">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {path.focus.map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-area-lernen)]/10 text-[var(--color-area-lernen)]"
            >
              {tag}
            </span>
          ))}
        </div>

        {pathBadge && (
          <div
            className={`mb-3 rounded-lg border px-2.5 py-2 text-xs ${
              badgeUnlocked
                ? 'border-[var(--color-success)]/40 bg-[var(--color-success)]/10'
                : 'border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50'
            }`}
          >
            <p className={`font-medium ${badgeUnlocked ? 'text-[var(--color-success)]' : 'dark:text-[var(--color-muted)] text-slate-600'}`}>
              Badge: {pathBadge.title}
            </p>
            <p className={`${badgeUnlocked ? 'dark:text-[var(--color-secondary)] text-slate-700' : 'dark:text-[var(--color-muted)] text-slate-500'}`}>
              {badgeUnlocked ? 'Freigeschaltet' : 'Bei Abschluss freischaltbar'}
            </p>
          </div>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-xs dark:text-[var(--color-muted)] text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Niveau {path.level}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {path.estimatedDuration}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {path.steps.length} Schritte
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs dark:text-[var(--color-muted)] text-slate-500 mb-1">
            <span>Fortschritt</span>
            <span>{completedSteps}/{totalSteps}</span>
          </div>
          <div className="h-1.5 rounded-full dark:bg-[var(--color-surface)] bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-area-lernen)] transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onStart}
            className="flex-1 px-3 py-2 rounded-lg text-sm text-white bg-[var(--color-area-lernen)] hover:opacity-90 transition-opacity"
            {...(isFirst ? { 'data-tour': 'path-start-first' } : {})}
          >
            {progress ? 'Fortsetzen' : 'Starten'}
          </button>
          {isActive && (
            <button
              type="button"
              onClick={onExit}
              className="px-3 py-2 rounded-lg text-sm border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Pfad verlassen"
            >
              Verlassen
            </button>
          )}
          <button
            type="button"
            onClick={onOpen}
            className="px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-700 hover:dark:bg-[var(--color-surface)] hover:bg-slate-50 transition-colors"
          >
            Details
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-700 hover:dark:bg-[var(--color-surface)] hover:bg-slate-50 transition-colors"
            title="Link kopieren"
          >
            {copied ? (
              <svg className="w-4 h-4 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function ComingSoonCard({ path }: { path: ComingSoonPath }) {
  return (
    <article className="rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 flex flex-col opacity-60 select-none">
      <span className="self-start text-xs font-medium px-2.5 py-1 rounded-full border border-dashed border-[var(--color-muted)] dark:text-[var(--color-muted)] text-slate-400 mb-3">
        In Vorbereitung
      </span>

      <h3 className="text-base font-semibold dark:text-[var(--color-secondary)] text-slate-500 mb-1">
        {path.title}
      </h3>
      <p className="text-sm dark:text-[var(--color-muted)] text-slate-400 mb-3">
        {path.subtitle}
      </p>

      <p className="text-sm dark:text-[var(--color-muted)] text-slate-400 leading-relaxed mb-4 flex-1">
        {path.teaser}
      </p>

      <div className="flex flex-wrap items-center gap-2 text-xs dark:text-[var(--color-muted)] text-slate-400">
        <span>⏱ {path.estimatedDuration}</span>
        <span className="dark:text-slate-700 text-slate-300">|</span>
        {path.focus.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-full border border-dashed border-[var(--color-border)] dark:text-[var(--color-muted)] text-slate-400">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

function getShareUrl(pathId: string, subject?: string): string {
  const baseUrl = `${window.location.origin}${window.location.pathname}#/lernen/${pathId}`;
  if (!subject) {
    return baseUrl;
  }
  return `${baseUrl}?fach=${encodeURIComponent(subject)}`;
}

interface CompletionRouteState {
  completedPathId?: string;
  newlyUnlockedBadgeIds?: string[];
}

export default function LernenPage() {
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathId } = useParams<{ pathId?: string }>();
  const [searchParams] = useSearchParams();
  const [copiedPathId, setCopiedPathId] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState(true);
  const { progress } = useProgress();
  const { startPath, activePath, pathProgress, exitPath, goToStep, isStepAccessible } = useLearningPath();
  const unlockedBadgeIds = new Set(progress.badges);
  const completionState = location.state as CompletionRouteState | null;
  const completedPathIdFromState =
    typeof completionState?.completedPathId === 'string'
      ? completionState.completedPathId
      : undefined;
  const newlyUnlockedBadgeIdsFromState = Array.isArray(completionState?.newlyUnlockedBadgeIds)
    ? completionState.newlyUnlockedBadgeIds.filter((badgeId): badgeId is string => typeof badgeId === 'string')
    : [];

  const [completionFeedbackOpen, setCompletionFeedbackOpen] = useState(
    () => typeof completionState?.completedPathId === 'string'
  );

  const selectedSubjectFromQuery = searchParams.get('fach') ?? undefined;
  const selectedSubjectLabel = selectedSubjectFromQuery
    ? getSubjectBySlug(selectedSubjectFromQuery)?.label
    : undefined;

  const copyToClipboard = async (value: string, copiedId: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedPathId(copiedId);
      window.setTimeout(() => setCopiedPathId(null), 1600);
    } catch {
      setCopiedPathId(null);
    }
  };

  const openPath = pathId ? getPathById(pathId) : undefined;

  if (pathId && !openPath) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-4">
          Lernpfad nicht gefunden
        </h1>
        <Link to="/lernen" className="text-[var(--color-area-lernen)] hover:underline">
          Zurück zu den Lernpfaden
        </Link>
      </div>
    );
  }

  // Detail view for a single path
  if (openPath) {
    const feedbackPathId = completedPathIdFromState ?? openPath.id;
    const openProgress = progress.learningPaths[openPath.id];
    const completedCount = openProgress?.completedSteps.length ?? 0;
    const totalSteps = openPath.steps.length;
    const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
    const isCompleted = progress.completedPaths.includes(openPath.id);
    const subjectForStart = selectedSubjectFromQuery ?? openProgress?.selectedSubject;
    const showCompletionBadgeNotice =
      completedPathIdFromState === openPath.id && newlyUnlockedBadgeIdsFromState.length > 0;
    const completionBadges = showCompletionBadgeNotice
      ? newlyUnlockedBadgeIdsFromState
          .map(getBadgeById)
          .filter((badge): badge is BadgeDefinition => Boolean(badge))
      : [];

    return (
      <>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/lernen"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-area-lernen)] no-underline hover:underline mb-5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Alle Lernpfade
          </Link>

          <div className="rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold dark:text-[var(--color-primary)] text-slate-900">
                  {openPath.title}
                </h1>
                {openPath.subtitle && (
                  <p className="text-sm dark:text-[var(--color-muted)] text-slate-500 mt-1">{openPath.subtitle}</p>
                )}
              </div>
              {isCompleted && (
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Abgeschlossen
                </span>
              )}
            </div>

            <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
              {openPath.description}
            </p>

            <div className="flex flex-wrap gap-4 text-xs dark:text-[var(--color-muted)] text-slate-500 mb-3">
              <span>Niveau {openPath.level}</span>
              <span>{openPath.estimatedDuration}</span>
              <span>{openPath.steps.length} Schritte</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {openPath.focus.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-[var(--color-area-lernen)]/10 text-[var(--color-area-lernen)]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {selectedSubjectLabel && (
              <p className="text-sm mb-4 text-[var(--color-area-lernen)]">
                Vorausgewähltes Fach: {selectedSubjectLabel}
              </p>
            )}

            {completionBadges.length > 0 && (
              <section className="mb-4 rounded-xl border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 p-4">
                <p className="text-xs uppercase tracking-wide font-semibold text-[var(--color-success)] mb-1">
                  Badge freigeschaltet
                </p>
                <p className="text-sm dark:text-[var(--color-secondary)] text-slate-700 mb-3">
                  Beim Abschluss dieses Lernpfads {completionBadges.length === 1 ? 'wurde ein Badge' : 'wurden neue Badges'} freigeschaltet:
                </p>
                <div className="flex flex-wrap gap-2">
                  {completionBadges.map((badge, index) => (
                    <motion.article
                      key={badge.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={reduceMotion ? undefined : { delay: index * 0.04 }}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-success)]/30 dark:bg-[var(--color-card)] bg-white px-3 py-2"
                    >
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[11px] font-bold tracking-wide text-white"
                        style={{ backgroundColor: badge.color }}
                      >
                        {badge.shortLabel}
                      </span>
                      <span className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900">
                        {badge.title}
                      </span>
                    </motion.article>
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  if (openProgress) {
                    startPath(openPath.id, { subject: subjectForStart });
                  } else {
                    const params = subjectForStart ? `?fach=${encodeURIComponent(subjectForStart)}` : '';
                    navigate(`/lernen/${openPath.id}/briefing${params}`);
                  }
                }}
                className="px-4 py-2 rounded-lg text-sm text-white bg-[var(--color-area-lernen)]"
              >
                {openProgress ? 'Fortsetzen' : 'Pfad starten'}
              </button>
              {activePath?.id === openPath.id && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Dein Fortschritt bleibt gespeichert. Pfad verlassen?')) {
                      exitPath();
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-sm border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Pfad verlassen
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    getShareUrl(openPath.id, selectedSubjectFromQuery ?? openProgress?.selectedSubject),
                    openPath.id
                  )
                }
                className="px-4 py-2 rounded-lg text-sm border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-700"
              >
                {copiedPathId === openPath.id ? 'Link kopiert' : 'Link kopieren'}
              </button>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs dark:text-[var(--color-muted)] text-slate-500 mb-1">
                <span>Fortschritt</span>
                <span>{completedCount}/{totalSteps}</span>
              </div>
              <div className="h-2 rounded-full dark:bg-[var(--color-surface)] bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-area-lernen)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Expandable step list */}
            <div>
              <button
                type="button"
                onClick={() => setExpandedSteps(prev => !prev)}
                className="flex items-center gap-2 text-sm font-medium dark:text-[var(--color-primary)] text-slate-900 mb-3"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${expandedSteps ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Schritte im Detail
              </button>

              {expandedSteps && (
                <div className="space-y-2">
                  {openPath.steps.map(step => {
                    const done = openProgress?.completedSteps.includes(step.stepNumber) ?? false;
                    const stepColor = AREA_COLORS[step.area] ?? 'var(--color-muted)';
                    const stepLabel = AREA_LABELS[step.area] ?? step.area;
                    const stepTitle = getStepTitle(step);
                    const stepLink = getStepLink(
                      step,
                      openPath.id,
                      selectedSubjectFromQuery ?? openProgress?.selectedSubject
                    );

                    return (
                      <div
                        key={step.stepNumber}
                        className="rounded-lg border border-[var(--color-border)]/60 px-4 py-3"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${
                              done
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 dark:bg-[var(--color-surface)] dark:text-[var(--color-muted)] text-slate-600'
                            }`}
                          >
                            {done ? '✓' : step.stepNumber}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded"
                                style={{
                                  color: stepColor,
                                  backgroundColor: `color-mix(in srgb, ${stepColor} 12%, transparent)`,
                                }}
                              >
                                {stepLabel}
                              </span>
                              <span className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900 truncate">
                                {stepTitle}
                              </span>
                            </div>
                            <p className="text-xs dark:text-[var(--color-muted)] text-slate-500">
                              {step.description}
                            </p>
                            {stepLink && activePath?.id === openPath.id && isStepAccessible(step.stepNumber) ? (
                              <button
                                type="button"
                                onClick={() => goToStep(step.stepNumber)}
                                className="inline-flex items-center gap-1 text-xs mt-1.5 no-underline hover:underline"
                                style={{ color: stepColor }}
                              >
                                Im Lernpfad öffnen
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </button>
                            ) : (
                              stepLink && (
                                <Link
                                  to={stepLink}
                                  className="inline-flex items-center gap-1 text-xs mt-1.5 no-underline hover:underline"
                                  style={{ color: stepColor }}
                                >
                                  Direkt öffnen
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </Link>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {completedPathIdFromState && (
        <CompletionFeedbackSheet
          isOpen={completionFeedbackOpen}
          onClose={() => setCompletionFeedbackOpen(false)}
          pathId={feedbackPathId}
          area="lernen"
        />
      )}
    </>
  );
  }

  // Overview: all paths
  return (
    <div className="max-w-6xl mx-auto px-4 pt-0 pb-8 md:pb-12">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        className="relative mb-8 rounded-2xl p-6 md:p-10">
        <AreaHeroIllustration area="lernen" />
        <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-3 h-3 rounded-full bg-[var(--color-area-lernen)]" />
          <span className="text-sm font-medium text-[var(--color-area-lernen)] uppercase tracking-wider">
            Lernen
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-4">
          Lernpfade
        </h1>
        <p className="text-base md:text-lg dark:text-[var(--color-secondary)] text-slate-600 max-w-2xl leading-relaxed">
          Wähle einen Lernpfad oder starte direkt über einen geteilten Link.
        </p>
        </div>
      </motion.div>

      {activePath && pathProgress && (
        <div className="mb-6 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm dark:text-[var(--color-muted)] text-slate-500">Aktiver Pfad</p>
            <p className="text-base font-semibold dark:text-[var(--color-primary)] text-slate-900">
              {activePath.title}
            </p>
            <p className="text-xs dark:text-[var(--color-muted)] text-slate-500">
              Schritt {pathProgress.currentStep} von {activePath.steps.length}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => startPath(activePath.id, { subject: pathProgress.selectedSubject })}
              className="px-3 py-2 rounded-lg text-sm text-white bg-[var(--color-area-lernen)]"
            >
              Fortsetzen
            </button>
            <button
              type="button"
              onClick={() => navigate(`/lernen/${activePath.id}`)}
              className="px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-700"
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Dein Fortschritt bleibt gespeichert. Pfad verlassen?')) {
                  exitPath();
                }
              }}
              className="px-3 py-2 rounded-lg text-sm border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Verlassen
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start" data-tour="path-grid">
        {LEARNING_PATHS.map((path, index) => (
          <PathCard
            key={path.id}
            path={path}
            isFirst={index === 0}
            progress={progress.learningPaths[path.id]}
            unlockedBadges={unlockedBadgeIds}
            isCompleted={progress.completedPaths.includes(path.id)}
            isActive={activePath?.id === path.id}
            onOpen={() => navigate(`/lernen/${path.id}`)}
            onStart={() => {
              const existingProgress = progress.learningPaths[path.id];
              if (existingProgress) {
                startPath(path.id, { subject: existingProgress.selectedSubject });
              } else {
                navigate(`/lernen/${path.id}/briefing`);
              }
            }}
            onExit={() => {
              if (window.confirm('Dein Fortschritt bleibt gespeichert. Pfad verlassen?')) {
                exitPath();
              }
            }}
            onCopy={() =>
              copyToClipboard(
                getShareUrl(path.id, progress.learningPaths[path.id]?.selectedSubject),
                path.id
              )
            }
            copied={copiedPathId === path.id}
          />
        ))}
      </div>

      {COMING_SOON_PATHS.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-800 mb-4">
            In Vorbereitung
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {COMING_SOON_PATHS.map(path => (
              <ComingSoonCard key={path.id} path={path} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
