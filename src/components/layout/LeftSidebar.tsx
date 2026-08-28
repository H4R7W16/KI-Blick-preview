import { useMemo, useRef, useState, useEffect, type TouchEvent } from 'react';
import LearningPathNav from '../features/LearningPathNav';
import Modal from '../ui/Modal';
import { useLearningPath } from '../../contexts/LearningPathContext';
import { useProgress } from '../../contexts/ProgressContext';
import { BADGE_DEFINITIONS } from '../../data/badges';
import { KNOWLEDGE_UNITS } from '../../data/knowledgeUnits';
import { getPathById } from '../../data/learningPaths';
import { useSavedRole } from '../../hooks/useSavedRole';
import { useTour } from '../../hooks/useTour';
import type { TourVariant } from '../../data/tourSteps';

const SWIPE_THRESHOLD = 48;
const ROLE_LABELS: Record<string, string> = {
  lehrkraft: 'Lehrkraft',
  lernende: 'Lernende:r',
  other: 'Allgemein Interessierte:r',
};

interface LeftSidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenProblemReport: () => void;
}

export default function LeftSidebar({
  isMobile,
  isOpen,
  onOpen,
  onClose,
  onOpenProblemReport,
}: LeftSidebarProps) {
  const { progress, hasNickname, resetAllData, exportToLink } = useProgress();
  const { isPathActive, startPath } = useLearningPath();
  const { startTour } = useTour();
  const { role, clearRole } = useSavedRole();
  const touchStartXRef = useRef<number | null>(null);
  const [tourSelectOpen, setTourSelectOpen] = useState(false);

  const visitedCount = progress.visitedUnits.length;
  const totalUnits = KNOWLEDGE_UNITS.length;
  const completedCount = progress.completedCheckouts.length;
  const unlockedBadges = useMemo(() => new Set(progress.badges), [progress.badges]);
  const unlockedBadgeCount = BADGE_DEFINITIONS.filter(badge => unlockedBadges.has(badge.id)).length;

  const lastStartedPath = useMemo(() => {
    const entries = Object.entries(progress.learningPaths);
    if (entries.length === 0) {
      return null;
    }

    const latest = entries
      .map(([pathId, pathProgress]) => ({ pathId, startedAt: pathProgress.startedAt }))
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];

    const path = getPathById(latest.pathId);
    if (!path) {
      return null;
    }

    return {
      path,
      currentStep: progress.learningPaths[latest.pathId]?.currentStep ?? 1,
      selectedSubject: progress.learningPaths[latest.pathId]?.selectedSubject,
    };
  }, [progress.learningPaths]);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportLink, setExportLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!resetDialogOpen) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resetDialogOpen]);

  const handleOpenExport = () => {
    setExportLink(exportToLink());
    setCopied(false);
    setExportDialogOpen(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    resetAllData();
    setResetDialogOpen(false);
    window.location.reload();
  };

  const handleSwipeStart = (event: TouchEvent<HTMLElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleSwipeEnd = (event: TouchEvent<HTMLElement>) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartXRef.current = null;

    if (startX === null || typeof endX !== 'number') {
      return;
    }

    const deltaX = endX - startX;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return;
    }

    if (deltaX > 0) {
      onOpen();
      return;
    }

    onClose();
  };

  const toggleSidebar = () => {
    if (isOpen) {
      onClose();
      return;
    }

    onOpen();
  };

  const asideClasses = isMobile
    ? `fixed top-14 left-0 z-50 h-[calc(100dvh-3.5rem)] w-72 border-r border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white transform transition-transform duration-300 ease-in-out overscroll-y-contain overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`
    : `sticky top-14 z-20 h-[calc(100dvh-3.5rem)] border-r border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white transition-[width] duration-300 ease-in-out overflow-x-hidden flex-shrink-0 ${
        isOpen ? 'w-72 overscroll-y-contain overflow-y-auto' : 'w-14 overflow-hidden'
      }`;

  const unitProgressPercent = totalUnits > 0 ? (visitedCount / totalUnits) * 100 : 0;
  const taskProgressPercent = completedCount > 0 ? Math.min(completedCount * 20, 100) : 0;

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={asideClasses}
        data-sidebar-side="left"
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
        style={{ touchAction: 'pan-y' }}
      >
        {isMobile || isOpen ? (
          <div className="p-6 space-y-6">
            <div className="sticky top-0 z-10 -mx-6 px-6 pb-3 border-b border-[var(--color-border)] dark:bg-[var(--color-surface)]/95 bg-white/95 backdrop-blur-sm flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider dark:text-[var(--color-muted)] text-slate-400">
                Hub
              </h2>
              <button
                type="button"
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:bg-slate-100 dark:hover:bg-[var(--color-card)] transition-colors"
                aria-label="Hub ein- oder ausklappen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-area-entdecken)] flex items-center justify-center text-white text-xl font-bold">
                {hasNickname ? progress.nickname.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h2 className="text-base font-semibold dark:text-[var(--color-primary)] text-slate-900">
                  {hasNickname ? progress.nickname : 'Willkommen!'}
                </h2>
                <p className="text-sm dark:text-[var(--color-muted)] text-slate-500">
                  {hasNickname ? 'Dein Lernfortschritt' : 'Gib dir einen Nicknamen'}
                </p>
              </div>
            </div>

            {isPathActive ? (
              <LearningPathNav mode="sidebar" />
            ) : (
              <>
                <div className="space-y-4" data-tour="progress">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="dark:text-[var(--color-secondary)] text-slate-600">Wissenseinheiten</span>
                      <span className="dark:text-[var(--color-primary)] text-slate-900 font-medium">
                        {visitedCount}/{totalUnits}
                      </span>
                    </div>
                    <div className="h-2 rounded-full dark:bg-[var(--color-card)] bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
                        style={{ width: `${unitProgressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="dark:text-[var(--color-secondary)] text-slate-600">Abgeschlossene Aufgaben</span>
                      <span className="dark:text-[var(--color-primary)] text-slate-900 font-medium">{completedCount}</span>
                    </div>
                    <div className="h-2 rounded-full dark:bg-[var(--color-card)] bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[var(--color-area-lernen)] transition-all duration-500"
                        style={{ width: `${taskProgressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {lastStartedPath && (
                  <div className="rounded-xl border border-[var(--color-border)] p-3 dark:bg-[var(--color-card)] bg-white">
                    <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mb-1">Letzte Aktivität</p>
                    <p className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900 mb-2">
                      {lastStartedPath.path.title}
                    </p>
                    <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mb-3">
                      Schritt {lastStartedPath.currentStep} von {lastStartedPath.path.steps.length}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        startPath(lastStartedPath.path.id, {
                          subject: lastStartedPath.selectedSubject,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg text-sm text-white bg-[var(--color-area-lernen)]"
                    >
                      Fortsetzen
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="pt-4 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium dark:text-[var(--color-secondary)] text-slate-600">Badges</h3>
                <span className="text-xs dark:text-[var(--color-muted)] text-slate-500">
                  {unlockedBadgeCount}/{BADGE_DEFINITIONS.length}
                </span>
              </div>

              <div className="space-y-2">
                {BADGE_DEFINITIONS.map(badge => {
                  const unlocked = unlockedBadges.has(badge.id);

                  return (
                    <article
                      key={badge.id}
                      className={`rounded-lg border px-2.5 py-2 transition-colors ${
                        unlocked
                          ? 'border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white'
                          : 'border-[var(--color-border)]/50 dark:bg-[var(--color-surface)]/60 bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold tracking-wide ${
                            unlocked
                              ? 'text-white'
                              : 'dark:text-[var(--color-muted)] text-slate-400'
                          }`}
                          style={{
                            backgroundColor: unlocked
                              ? badge.color
                              : 'color-mix(in srgb, var(--color-border) 40%, transparent)',
                          }}
                        >
                          {badge.shortLabel}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${unlocked ? 'dark:text-[var(--color-primary)] text-slate-900' : 'dark:text-[var(--color-muted)] text-slate-500'}`}>
                            {badge.title}
                          </p>
                          <p className={`text-[11px] leading-snug ${unlocked ? 'dark:text-[var(--color-secondary)] text-slate-600' : 'dark:text-[var(--color-muted)] text-slate-400'}`}>
                            {badge.description}
                          </p>
                          <p className={`text-[10px] mt-1 font-medium uppercase tracking-wide ${unlocked ? 'text-[var(--color-success)]' : 'dark:text-[var(--color-muted)] text-slate-400'}`}>
                            {unlocked ? 'Freigeschaltet' : 'Gesperrt'}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setTourSelectOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm dark:text-[var(--color-secondary)] text-slate-600 hover:dark:bg-[var(--color-card)] hover:bg-slate-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Tour starten
              </button>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] space-y-1">
              {role && (
                <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-1.5">
                  <span className="text-xs dark:text-[var(--color-muted)] text-slate-400">
                    Perspektive: {ROLE_LABELS[role] ?? role}
                  </span>
                  <button
                    type="button"
                    onClick={clearRole}
                    className="text-xs dark:text-[var(--color-muted)] text-slate-400 hover:dark:text-[var(--color-secondary)] hover:text-slate-600 underline underline-offset-2 transition-colors"
                  >
                    zurücksetzen
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onOpenProblemReport}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm dark:text-[var(--color-muted)] text-slate-500 hover:dark:text-[var(--color-secondary)] hover:text-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Problem melden · Idee senden
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3" data-tour="export">
              <button
                type="button"
                onClick={handleOpenExport}
                className="text-xs dark:text-[var(--color-muted)] text-slate-400 hover:text-[var(--color-accent)] dark:hover:text-[var(--color-accent)] transition-colors underline underline-offset-2"
              >
                Fortschritt speichern
              </button>
              <button
                type="button"
                onClick={() => setResetDialogOpen(true)}
                className="text-xs dark:text-[var(--color-muted)] text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors underline underline-offset-2"
              >
                Zurücksetzen
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center py-3 px-2 gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:bg-slate-100 dark:hover:bg-[var(--color-card)] transition-colors"
              aria-label="Hub ausklappen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-area-entdecken)] flex items-center justify-center text-white text-sm font-bold">
              {hasNickname ? progress.nickname.charAt(0).toUpperCase() : '?'}
            </div>

            <span className="-rotate-90 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] whitespace-nowrap mt-8">
              Hub
            </span>

            <div className="mt-auto mb-3 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={onOpenProblemReport}
                className="p-2 rounded-lg border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:bg-slate-100 dark:hover:bg-[var(--color-card)] transition-colors"
                aria-label="Problem melden"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </button>
              <span className="text-[10px] dark:text-[var(--color-muted)] text-slate-500">{visitedCount}/{totalUnits}</span>
              <div className="w-1.5 h-20 rounded-full dark:bg-[var(--color-card)] bg-slate-200 overflow-hidden flex flex-col-reverse">
                <div className="w-full bg-[var(--color-accent)]" style={{ height: `${unitProgressPercent}%` }} />
              </div>
            </div>
          </div>
        )}
      </aside>

      <Modal
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        titleId="export-dialog-title"
      >
        <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 id="export-dialog-title" className="text-base font-semibold dark:text-[var(--color-primary)] text-slate-900">
                  Fortschritt speichern
                </h3>
                <p className="mt-0.5 text-sm dark:text-[var(--color-secondary)] text-slate-600">
                  Öffne diesen Link auf einem anderen Gerät.
                </p>
              </div>
            </div>

            <div className="mb-3 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-slate-50 px-3 py-2.5">
              <p className="font-mono text-[11px] dark:text-[var(--color-secondary)] text-slate-600 break-all line-clamp-3 leading-relaxed">
                {exportLink}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className={`w-full mb-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${
                copied ? 'bg-[var(--color-success)]' : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]'
              }`}
            >
              {copied ? 'Link kopiert!' : 'Link kopieren'}
            </button>

            <p className="text-[11px] dark:text-[var(--color-muted)] text-slate-400 text-center leading-relaxed mb-4">
              Tipp: Sende den Link per AirDrop oder speichere ihn in der Notizen-App.
            </p>

            <button
              type="button"
              onClick={() => setExportDialogOpen(false)}
              className="w-full px-4 py-2 rounded-xl text-sm font-medium border border-[var(--color-border)] dark:text-[var(--color-primary)] text-slate-900 dark:hover:bg-[var(--color-card)] hover:bg-slate-100 transition-colors"
            >
              Schließen
            </button>
        </div>
      </Modal>

      <Modal
        isOpen={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        titleId="reset-dialog-title"
        className="border-red-500/30"
      >
        <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <h3 id="reset-dialog-title" className="text-base font-semibold dark:text-[var(--color-primary)] text-slate-900">
                  Alle Daten löschen?
                </h3>
                <p className="mt-1 text-sm dark:text-[var(--color-secondary)] text-slate-600">
                  Folgendes wird unwiderruflich gelöscht:
                </p>
              </div>
            </div>

            <ul className="mb-5 space-y-1 text-sm dark:text-[var(--color-secondary)] text-slate-600 pl-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                Nickname und Lernfortschritt
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                Abgeschlossene Aufgaben und Lernpfade
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                Freigeschaltete Badges
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                Gespeicherte Reflexionstexte
              </li>
            </ul>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setResetDialogOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)] dark:text-[var(--color-primary)] text-slate-900 dark:hover:bg-[var(--color-card)] hover:bg-slate-100 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={countdown > 0}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700 disabled:hover:bg-red-600"
              >
                {countdown > 0 ? `Löschen (${countdown})` : 'Jetzt löschen'}
              </button>
            </div>
        </div>
      </Modal>

      <Modal
        isOpen={tourSelectOpen}
        onClose={() => setTourSelectOpen(false)}
        titleId="tour-select-title"
      >
        <div className="p-6">
            <div className="text-center mb-5">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-area-entdecken)] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 id="tour-select-title" className="text-base font-semibold dark:text-[var(--color-primary)] text-slate-900">
                Tour starten
              </h3>
              <p className="mt-1 text-sm dark:text-[var(--color-secondary)] text-slate-600">
                Für wen soll die Tour sein?
              </p>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              {(
                [
                  { variant: 'schueler' as TourVariant, label: 'Schüler:in', sub: 'Lernpfade, Fortschritt, Badges', color: 'var(--color-area-lernen)' },
                  { variant: 'lehrkraft' as TourVariant, label: 'Lehrkraft', sub: 'Unterrichtseinheiten, Datenschutz', color: 'var(--color-area-verstehen)' },
                  { variant: 'neugierig' as TourVariant, label: 'Neugierig', sub: 'Schneller Überblick', color: 'var(--color-area-entdecken)' },
                ]
              ).map(({ variant, label, sub, color }) => (
                <button
                  key={variant}
                  type="button"
                  onClick={() => {
                    setTourSelectOpen(false);
                    onClose();
                    startTour(variant);
                  }}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-left hover:dark:bg-[var(--color-card)] hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-medium block" style={{ color }}>{label}</span>
                  <span className="text-xs dark:text-[var(--color-muted)] text-slate-500">{sub}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setTourSelectOpen(false)}
              className="w-full px-4 py-2 rounded-xl text-sm font-medium border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-700 dark:hover:bg-[var(--color-card)] hover:bg-slate-100 transition-colors"
            >
              Abbrechen
            </button>
        </div>
      </Modal>
    </>
  );
}
