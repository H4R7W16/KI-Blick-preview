import { useRef, type TouchEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LEARNING_PATHS } from '../../data/learningPaths';
import { KNOWLEDGE_UNITS } from '../../data/knowledgeUnits';
import { SUBJECTS } from '../../data/subjects';

const SWIPE_THRESHOLD = 48;

interface RightSidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const SECTIONS = [
  {
    title: 'Verstehen',
    path: '/verstehen',
    color: 'var(--color-area-verstehen)',
    items: KNOWLEDGE_UNITS.filter(unit => unit.area === 'verstehen').map(unit => ({
      label: `${unit.number}. ${unit.title}`,
      path: `/verstehen/${unit.id}`,
    })),
  },
  {
    title: 'Entdecken',
    path: '/entdecken',
    color: 'var(--color-area-entdecken)',
    items: SUBJECTS.map(subject => ({
      label: subject.label,
      path: `/entdecken/${subject.slug}`,
    })),
  },
  {
    title: 'Einordnen',
    path: '/einordnen',
    color: 'var(--color-area-einordnen)',
    items: KNOWLEDGE_UNITS.filter(unit => unit.area === 'einordnen').map(unit => ({
      label: `${unit.number}. ${unit.title}`,
      path: `/einordnen/${unit.id}`,
    })),
  },
  {
    title: 'Lernen',
    path: '/lernen',
    color: 'var(--color-area-lernen)',
    items: LEARNING_PATHS.map(path => ({
      label: path.title,
      path: `/lernen/${path.id}`,
    })),
  },
  {
    title: 'Informationen',
    path: '/informationen',
    color: 'var(--color-accent)',
    items: [
      { label: 'Konzept', path: '/informationen#konzept' },
      { label: 'Entstehung', path: '/informationen#entstehung' },
      { label: 'Bildungsplanbezug BW', path: '/informationen#bildungsplanbezug-bw' },
      { label: 'Informationen für Lehrende', path: '/informationen#informationen-fuer-lehrende' },
      { label: 'Nutzung, Lizenzen & Downloads', path: '/informationen#nutzung-lizenzen' },
      { label: 'Datenschutz', path: '/informationen#datenschutz' },
      { label: 'Impressum', path: '/informationen#impressum' },
    ],
  },
];

export default function RightSidebar({ isMobile, isOpen, onOpen, onClose }: RightSidebarProps) {
  const location = useLocation();
  const currentPathWithHash = `${location.pathname}${location.hash}`;
  const touchStartXRef = useRef<number | null>(null);

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

    if (deltaX < 0) {
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
    ? `fixed top-14 right-0 z-50 h-[calc(100dvh-3.5rem)] w-72 border-l border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white transform transition-transform duration-300 ease-in-out overscroll-y-contain overflow-y-auto ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`
    : `sticky top-14 z-20 h-[calc(100dvh-3.5rem)] border-l border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white transition-[width] duration-300 ease-in-out overflow-x-hidden flex-shrink-0 ${
        isOpen ? 'w-72 overscroll-y-contain overflow-y-auto' : 'w-14 overflow-hidden'
      }`;

  const handleLinkClick = () => {
    if (isMobile) {
      onClose();
    }
  };

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
        data-sidebar-side="right"
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
        style={{ touchAction: 'pan-y' }}
      >
        {isMobile || isOpen ? (
          <div className="p-4 space-y-4">
            <div className="sticky top-0 z-10 -mx-4 px-4 pt-1 pb-3 border-b border-[var(--color-border)] dark:bg-[var(--color-surface)]/95 bg-white/95 backdrop-blur-sm flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider dark:text-[var(--color-muted)] text-slate-400">
                Übersicht
              </h2>
              <button
                type="button"
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:bg-slate-100 dark:hover:bg-[var(--color-card)] transition-colors"
                aria-label="Übersicht ein- oder ausklappen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div data-tour="nav-overview" className="space-y-4">
            {SECTIONS.map(section => (
              <div key={section.path}>
                <Link
                  to={section.path}
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 text-sm font-semibold mb-2 no-underline transition-colors"
                  style={{ color: section.color }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: section.color }}
                  />
                  {section.title}
                </Link>
                <ul className="ml-4 space-y-1">
                  {section.items.map(item => {
                    const isActive = location.pathname === item.path || currentPathWithHash === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={handleLinkClick}
                          className={`block text-[13px] leading-5 py-1.5 px-2.5 rounded-md no-underline transition-colors ${
                            isActive
                              ? 'dark:bg-[var(--color-card)] bg-slate-100 dark:text-[var(--color-primary)] text-slate-900'
                              : 'dark:text-[var(--color-secondary)] text-slate-600 hover:dark:text-[var(--color-primary)] hover:text-slate-900'
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            </div>

            {/* Coming Soon: Erfahren */}
            <div>
              <span className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-slate-600 text-slate-400 cursor-default">
                <span className="w-2 h-2 rounded-full bg-rose-500/30" />
                Erfahren
                <span className="text-[10px] dark:text-slate-600 text-slate-400">(demnächst)</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center py-3 px-2 gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:bg-slate-100 dark:hover:bg-[var(--color-card)] transition-colors"
              aria-label="Übersicht ausklappen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>

            <span className="rotate-90 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] whitespace-nowrap mt-8">
              Übersicht
            </span>

            <div className="mt-auto mb-3 text-[10px] dark:text-[var(--color-muted)] text-slate-500 text-center leading-tight">
              {SECTIONS.length} Bereiche
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
