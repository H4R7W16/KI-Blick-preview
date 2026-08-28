import { useNavigate, useLocation } from 'react-router-dom';
import { useProgress, decodeExport } from '../../contexts/ProgressContext';
import { KNOWLEDGE_UNITS } from '../../data/knowledgeUnits';
import { BADGE_DEFINITIONS } from '../../data/badges';

export default function ImportDialog() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { importData, hasNickname } = useProgress();

  const encodedParam = new URLSearchParams(search).get('import');
  if (!encodedParam) return null;

  const exportData = decodeExport(encodedParam);
  if (!exportData) {
    navigate('/', { replace: true });
    return null;
  }

  const { p, exported } = exportData;
  const exportDate = new Date(exported).toLocaleDateString('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const unitCount = p.visitedUnits?.length ?? 0;
  const badgeCount = BADGE_DEFINITIONS.filter(b => p.badges?.includes(b.id)).length;
  const displayName = p.nickname?.trim() || '(kein Nickname)';

  const handleConfirm = () => {
    importData(exportData);
    navigate('/', { replace: true });
  };

  const handleDismiss = () => {
    navigate('/', { replace: true });
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleDismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold dark:text-[var(--color-primary)] text-slate-900">
              Fortschritt importieren?
            </h3>
            <p className="mt-0.5 text-sm dark:text-[var(--color-secondary)] text-slate-600">
              Gespeicherter Stand vom {exportDate}
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-xl dark:bg-[var(--color-card)] bg-slate-50 border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          <div className="flex justify-between items-center px-4 py-2.5">
            <span className="text-sm dark:text-[var(--color-secondary)] text-slate-600">Nickname</span>
            <span className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900">{displayName}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-2.5">
            <span className="text-sm dark:text-[var(--color-secondary)] text-slate-600">Wissenseinheiten</span>
            <span className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900">{unitCount}/{KNOWLEDGE_UNITS.length}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-2.5">
            <span className="text-sm dark:text-[var(--color-secondary)] text-slate-600">Badges</span>
            <span className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900">{badgeCount}/{BADGE_DEFINITIONS.length}</span>
          </div>
        </div>

        {hasNickname && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Dein bisheriger Fortschritt wird überschrieben.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)] dark:text-[var(--color-primary)] text-slate-900 dark:hover:bg-[var(--color-card)] hover:bg-slate-100 transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Importieren
          </button>
        </div>
      </div>
    </div>
  );
}
