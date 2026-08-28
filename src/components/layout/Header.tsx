import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import type { AreaType } from '../../types/knowledge.types';
import { resolveAssetPath } from '../../utils/assetPath';

const NAV_ITEMS: { path: string; label: string; area: AreaType }[] = [
  { path: '/verstehen', label: 'Verstehen', area: 'verstehen' },
  { path: '/entdecken', label: 'Entdecken', area: 'entdecken' },
  { path: '/einordnen', label: 'Einordnen', area: 'einordnen' },
  { path: '/lernen', label: 'Lernen', area: 'lernen' },
];

const AREA_COLORS: Record<AreaType, string> = {
  verstehen: 'text-[var(--color-area-verstehen)]',
  entdecken: 'text-[var(--color-area-entdecken)]',
  einordnen: 'text-[var(--color-area-einordnen)]',
  lernen: 'text-[var(--color-area-lernen)]',
};

const AREA_BG: Record<AreaType, string> = {
  verstehen: 'bg-[var(--color-area-verstehen)]/10 border-[var(--color-area-verstehen)]/30',
  entdecken: 'bg-[var(--color-area-entdecken)]/10 border-[var(--color-area-entdecken)]/30',
  einordnen: 'bg-[var(--color-area-einordnen)]/10 border-[var(--color-area-einordnen)]/30',
  lernen: 'bg-[var(--color-area-lernen)]/10 border-[var(--color-area-lernen)]/30',
};

interface HeaderProps {
  isMobile: boolean;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
}

export default function Header({
  isMobile,
  leftSidebarOpen,
  rightSidebarOpen,
  onToggleLeftSidebar,
  onToggleRightSidebar,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const currentArea = NAV_ITEMS.find(item => location.pathname.startsWith(item.path));

  const leftButtonClass = leftSidebarOpen
    ? 'border-[var(--color-area-lernen)]/40 text-[var(--color-area-lernen)] bg-[var(--color-area-lernen)]/10'
    : 'border-transparent dark:text-[var(--color-secondary)] text-slate-600 hover:bg-slate-100 dark:hover:bg-[var(--color-card)]';

  const rightButtonClass = rightSidebarOpen
    ? 'border-[var(--color-area-einordnen)]/40 text-[var(--color-area-einordnen)] bg-[var(--color-area-einordnen)]/10'
    : 'border-transparent dark:text-[var(--color-secondary)] text-slate-600 hover:bg-slate-100 dark:hover:bg-[var(--color-card)]';

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleLeftSidebar}
            aria-label={leftSidebarOpen ? 'Hub einklappen' : 'Hub ausklappen'}
            aria-expanded={leftSidebarOpen}
            className={`flex items-center gap-1.5 p-2.5 rounded-lg border transition-colors min-h-[44px] min-w-[44px] ${leftButtonClass}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {!isMobile && <span className="hidden lg:inline text-sm font-medium">Hub</span>}
          </button>

          <Link to="/" aria-label="Zur Startseite" className="flex h-10 items-center no-underline">
            <img
              src={resolveAssetPath('/branding/ki-blick-logo-icon.webp')}
              alt="KI:Blick"
              className="block h-7 w-auto sm:hidden"
              loading="eager"
            />
            <img
              src={resolveAssetPath('/branding/ki-blick-logo.webp')}
              alt="KI:Blick"
              className="hidden h-8 w-auto -translate-y-0.5 sm:block md:h-9"
              loading="eager"
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all no-underline border ${
                  isActive
                    ? `${AREA_BG[item.area]} ${AREA_COLORS[item.area]}`
                    : 'border-transparent dark:text-[var(--color-secondary)] text-slate-500 hover:dark:text-[var(--color-primary)] hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {currentArea && isMobile && (
            <span className={`md:hidden text-sm font-medium ${AREA_COLORS[currentArea.area]}`}>
              {currentArea.label}
            </span>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[var(--color-card)] dark:text-[var(--color-secondary)] text-slate-600 transition-colors min-h-[44px] min-w-[44px]"
            aria-label={theme === 'dark' ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleRightSidebar}
            aria-label={rightSidebarOpen ? 'Übersicht einklappen' : 'Übersicht ausklappen'}
            aria-expanded={rightSidebarOpen}
            className={`flex items-center gap-1.5 p-2.5 rounded-lg border transition-colors min-h-[44px] min-w-[44px] ${rightButtonClass}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {!isMobile && <span className="hidden lg:inline text-sm font-medium">Übersicht</span>}
          </button>
        </div>
      </div>

      <nav className="md:hidden flex border-t border-[var(--color-border)]">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          const areaColorVar = `var(--color-area-${item.area})`;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex-1 py-3 text-center text-xs font-medium transition-colors no-underline ${
                isActive
                  ? AREA_COLORS[item.area]
                  : 'dark:text-[var(--color-muted)] text-slate-400'
              }`}
            >
              {item.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                  style={{ backgroundColor: areaColorVar }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
