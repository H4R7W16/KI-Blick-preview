import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ContentRenderer from '../components/content/ContentRenderer';
import CheckoutRenderer from '../components/content/CheckoutRenderer';
import { useProgress } from '../contexts/ProgressContext';
import { useLearningPath } from '../contexts/LearningPathContext';
import { AreaProvider } from '../contexts/AreaContext';
import { getCheckoutByUnitId, getUnitById } from '../data/knowledgeUnits';
import type { ContentBlock } from '../types/knowledge.types';
import MilestoneOverlay, { getMilestoneStep } from '../components/features/MilestoneOverlay';
import { MicroFeedbackChip } from '../components/features/feedback/MicroFeedbackChip';

/** Detect transition/teaser text blocks at the end of a unit that reference the next unit */
function isTransitionBlock(block: ContentBlock): boolean {
  if (block.type !== 'text') return false;
  const text = block.data.text.toLowerCase();
  return (
    text.includes('nächste einheit') ||
    text.includes('nächsten einheit') ||
    text.includes('darum geht es in e') ||
    text.includes('darum geht es in v') ||
    text.includes('erfährst du in der nächsten')
  );
}

function normalizeHeadingText(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export default function KnowledgeUnitPage() {
  const { unitId } = useParams<{ unitId: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sectionId = searchParams.get('section');
  const sectionEndId = searchParams.get('sectionEnd');
  const { markUnitVisited, markCheckoutCompleted, progress } = useProgress();
  const { activePath, currentStep, pathProgress, canAdvance, nextStep, prevStep, isPathActive } = useLearningPath();
  const [milestoneShown, setMilestoneShown] = useState(false);

  const unit = unitId ? getUnitById(unitId) : undefined;
  const area =
    unit?.area ?? (location.pathname.startsWith('/verstehen') ? 'verstehen' : 'einordnen');
  const areaColor =
    area === 'verstehen' ? 'var(--color-area-verstehen)' : 'var(--color-area-einordnen)';
  const areaLabel = area === 'verstehen' ? 'Verstehen' : 'Einordnen';
  const prefix = area === 'verstehen' ? 'V' : 'E';

  // Check if this unit is the current step in an active learning path
  const isInLearningPath = useMemo(() => {
    if (!isPathActive || !activePath || !unitId) return false;
    const step = activePath.steps.find(s => s.stepNumber === currentStep);
    return step?.unitId === unitId;
  }, [activePath, currentStep, isPathActive, unitId]);

  useEffect(() => {
    if (unitId) {
      markUnitVisited(unitId);
    }
  }, [unitId, markUnitVisited]);

  const checkout = unit ? getCheckoutByUnitId(unit.id) : undefined;
  const isCompleted = checkout ? progress.completedCheckouts.includes(checkout.id) : false;

  const heroHeading = useMemo<Extract<ContentBlock, { type: 'heading' }> | null>(() => {
    const first = unit?.content?.[0];
    if (!unit || !first || first.type !== 'heading') return null;

    const firstText = normalizeHeadingText(first.data.text);
    const titleText = normalizeHeadingText(unit.title);
    if (!firstText || firstText !== titleText) return null;

    return first;
  }, [unit]);

  const heroKicker = heroHeading?.data.kicker;

  // Active level: from learning path (predefined) or default 2 (no UI toggle yet)
  const activeLevel = activePath?.level ?? 2;

  // Filter out transition blocks when in learning path mode and strip duplicate hero heading
  const displayBlocks = useMemo(() => {
    if (!unit?.content || unit.content.length === 0) return undefined;

    let blocks = [...unit.content];
    if (heroHeading) blocks.shift();

    // Level filter: blocks without level show on all levels
    blocks = blocks.filter(b => !b.level || b.level === activeLevel);

    if (!isInLearningPath) return blocks;

    // Only filter the last 1-2 blocks if they're transition text
    while (blocks.length > 0 && isTransitionBlock(blocks[blocks.length - 1])) {
      blocks.pop();
    }
    return blocks;
  }, [heroHeading, isInLearningPath, unit?.content, activeLevel]);

  const { highlightedIds, hasSection } = useMemo(() => {
    if (!sectionId || !unit?.content) return { highlightedIds: null, hasSection: false };

    const allBlocks = unit.content;
    const startIdx = allBlocks.findIndex(b => b.id === sectionId);
    if (startIdx === -1) return { highlightedIds: null, hasSection: false };

    let endIdx: number;
    if (sectionEndId) {
      endIdx = allBlocks.findIndex(b => b.id === sectionEndId);
      if (endIdx === -1) endIdx = allBlocks.length - 1;
    } else {
      const nextH2 = allBlocks.findIndex(
        (b, i) => i > startIdx && b.type === 'heading' && b.data.level === 2
      );
      endIdx = nextH2 === -1 ? allBlocks.length - 1 : nextH2 - 1;
    }

    const ids = new Set(allBlocks.slice(startIdx, endIdx + 1).map(b => b.id));
    return { highlightedIds: ids, hasSection: true };
  }, [sectionId, sectionEndId, unit?.content]);

  useEffect(() => {
    if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [sectionId]);

  if (!unit) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-4">
          Einheit nicht gefunden
        </h1>
        <Link to={`/${area}`} className="text-[var(--color-accent)] hover:underline">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const contextBridge = isInLearningPath
    ? activePath?.steps.find(s => s.stepNumber === currentStep)?.contextBridge
    : undefined;

  const milestoneStep = activePath ? getMilestoneStep(activePath) : null;
  const showMilestone =
    isInLearningPath &&
    milestoneStep !== null &&
    currentStep === milestoneStep &&
    !milestoneShown &&
    !(pathProgress?.completedSteps.includes(milestoneStep) ?? false);

  return (
    <AreaProvider area={area}>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Navigation breadcrumb */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          {isInLearningPath && activePath ? (
            <div className="flex items-center gap-2 text-sm">
              <Link
                to={`/lernen/${activePath.id}`}
                className="inline-flex items-center gap-1.5 no-underline text-[var(--color-area-lernen)] hover:underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {activePath.title}
              </Link>
              <span className="dark:text-[var(--color-muted)] text-slate-400">·</span>
              <span className="dark:text-[var(--color-muted)] text-slate-500">
                Schritt {currentStep} von {activePath.steps.length}
              </span>
            </div>
          ) : (
            <Link
              to={`/${area}`}
              className="inline-flex items-center gap-2 text-sm no-underline transition-colors"
              style={{ color: areaColor }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {areaLabel}
            </Link>
          )}
        </motion.div>

        <AnimatePresence>
          {showMilestone && activePath && (
            <MilestoneOverlay
              path={activePath}
              completedSteps={pathProgress?.completedSteps.length ?? 0}
              onDismiss={() => setMilestoneShown(true)}
            />
          )}
        </AnimatePresence>

        {contextBridge && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-4 py-3 rounded-lg border border-[var(--color-border)] dark:bg-slate-800/50 bg-slate-50"
          >
            <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 italic">
              {contextBridge}
            </p>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10" data-tour="unit-hero">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{
                backgroundColor: `color-mix(in srgb, ${areaColor} 15%, transparent)`,
                color: areaColor,
              }}
            >
              {prefix}
              {unit.number}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full border border-[var(--color-border)] dark:text-[var(--color-muted)] text-slate-500">
                Niveaustufe {unit.level}
              </span>
            </div>
          </div>
          {heroKicker && (
            <p
              className="text-xs uppercase tracking-wider mb-2"
              style={{ color: areaColor }}
            >
              {heroKicker}
            </p>
          )}
          <h1 className="font-display text-3xl md:text-4xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-4">
            {unit.title}
          </h1>
          <p className="text-lg dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed">
            {unit.description}
          </p>
        </motion.div>

        {displayBlocks && displayBlocks.length > 0 ? (
          <ContentRenderer blocks={displayBlocks} highlightedIds={highlightedIds ?? undefined} hasSection={hasSection} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-xl border border-dashed border-[var(--color-border)] dark:bg-[var(--color-card)]/50 bg-slate-50 text-center mb-8"
          >
            <svg className="w-12 h-12 mx-auto mb-3 dark:text-[var(--color-muted)] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="text-base font-semibold dark:text-[var(--color-secondary)] text-slate-600 mb-1">
              Inhalt folgt
            </h3>
            <p className="text-sm dark:text-[var(--color-muted)] text-slate-500">
              Die Inhalte dieser Wissenseinheit werden in einer späteren Phase erstellt.
            </p>
          </motion.div>
        )}

        {checkout && (
          <CheckoutRenderer
            checkout={checkout}
            isCompleted={isCompleted}
            onComplete={() => markCheckoutCompleted(checkout.id)}
            isInLearningPath={isPathActive}
          />
        )}

        <MicroFeedbackChip area={area} unitId={unitId ?? ''} />

        {/* Learning path inline navigation */}
        {isInLearningPath && activePath && (
          <div className="mt-8 rounded-xl border border-[var(--color-area-lernen)]/30 bg-[var(--color-area-lernen)]/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900">
                  {activePath.title} — Schritt {currentStep} von {activePath.steps.length}
                </p>
                <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mt-0.5">
                  {canAdvance
                    ? 'Bereit für den nächsten Schritt'
                    : checkout && !isCompleted
                      ? 'Schließe das Checkout ab, um fortzufahren'
                      : 'Lies die Einheit durch, um fortzufahren'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => prevStep()}
                  disabled={currentStep <= 1}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm disabled:opacity-30 disabled:cursor-not-allowed dark:text-[var(--color-secondary)] text-slate-700 hover:dark:bg-[var(--color-surface)] hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Zurück
                </button>
                <button
                  type="button"
                  onClick={() => nextStep()}
                  disabled={!canAdvance}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm text-white bg-[var(--color-area-lernen)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {currentStep >= activePath.steps.length ? 'Pfad abschließen' : 'Weiter im Lernpfad'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AreaProvider>
  );
}
