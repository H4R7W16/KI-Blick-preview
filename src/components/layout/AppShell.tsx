import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ProblemReportModal } from '../features/feedback/ProblemReportModal';
import LearningPathNav from '../features/LearningPathNav';
import { useLearningPath } from '../../contexts/LearningPathContext';
import { useCurrentContext } from '../../hooks/useCurrentContext';
import { usePageTracking } from '../../hooks/usePageTracking';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

const MOBILE_BREAKPOINT_QUERY = '(max-width: 767px)';

function getInitialIsMobile() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;
}

export default function AppShell() {
  const [isMobile, setIsMobile] = useState(getInitialIsMobile);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [problemReportOpen, setProblemReportOpen] = useState(false);
  const { isPathActive } = useLearningPath();
  const { area, unitId } = useCurrentContext();
  usePageTracking();

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    setLeftOpen(false);
    setRightOpen(false);
  }, [isMobile]);

  // Tour sidebar control via custom events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail === 'left') {
        setLeftOpen(true);
        setRightOpen(false);
      } else if (detail === 'right') {
        setRightOpen(true);
        setLeftOpen(false);
      } else if (detail === 'close') {
        setLeftOpen(false);
        setRightOpen(false);
      }
    };
    window.addEventListener('tour:open-sidebar', handler);
    return () => window.removeEventListener('tour:open-sidebar', handler);
  }, []);

  const openLeftSidebar = () => {
    setLeftOpen(true);
    if (isMobile) {
      setRightOpen(false);
    }
  };

  const openRightSidebar = () => {
    setRightOpen(true);
    if (isMobile) {
      setLeftOpen(false);
    }
  };

  const toggleLeftSidebar = () => {
    setLeftOpen(prev => {
      const next = !prev;
      if (next && isMobile) {
        setRightOpen(false);
      }
      return next;
    });
  };

  const toggleRightSidebar = () => {
    setRightOpen(prev => {
      const next = !prev;
      if (next && isMobile) {
        setLeftOpen(false);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen dark:bg-[var(--color-bg)] bg-slate-50">
      <Header
        isMobile={isMobile}
        leftSidebarOpen={leftOpen}
        rightSidebarOpen={rightOpen}
        onToggleLeftSidebar={toggleLeftSidebar}
        onToggleRightSidebar={toggleRightSidebar}
      />
      <div className="flex">
        <LeftSidebar
          isMobile={isMobile}
          isOpen={leftOpen}
          onOpen={openLeftSidebar}
          onClose={() => setLeftOpen(false)}
          onOpenProblemReport={() => setProblemReportOpen(true)}
        />
        <main className={`flex-1 min-w-0 overflow-x-hidden ${isPathActive ? 'pb-20 lg:pb-0' : ''}`}>
          <Outlet />
        </main>
        <RightSidebar
          isMobile={isMobile}
          isOpen={rightOpen}
          onOpen={openRightSidebar}
          onClose={() => setRightOpen(false)}
        />
      </div>
      <footer className="border-t border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500">
            Hinweise, Fehler oder Ideen? Dein Feedback hilft uns beim Verbessern.
          </p>
          <button
            type="button"
            onClick={() => setProblemReportOpen(true)}
            className="text-xs dark:text-[var(--color-muted)] text-slate-400 hover:dark:text-[var(--color-secondary)] hover:text-slate-600 underline underline-offset-2 transition-colors"
          >
            Problem melden
          </button>
        </div>
      </footer>
      <LearningPathNav mode="mobile" />
      <ProblemReportModal
        isOpen={problemReportOpen}
        onClose={() => setProblemReportOpen(false)}
        currentArea={area}
        currentUnitId={unitId}
      />
    </div>
  );
}
