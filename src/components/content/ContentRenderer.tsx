import { lazy, Suspense, useState, type ComponentType, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type {
  CalloutBlockData,
  CheckpointBlockData,
  ContentBlock,
  ImageBlockData,
  ImageCompareBlockData,
  InteractiveComponentName,
  QuoteBlockData,
  RevealBlockData,
  TextBlockData,
} from '../../types/knowledge.types';
import { resolveAssetPath } from '../../utils/assetPath';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import CheckpointBlock from './CheckpointBlock';

const PipelineAnimation = lazy(() => import('./PipelineAnimation'));
const SeedVisualizer = lazy(() => import('./SeedVisualizer'));
const NoiseToImage = lazy(() => import('./NoiseToImage'));
const DataScaleVisualizer = lazy(() => import('./DataScaleVisualizer'));
const TrainingDataMap = lazy(() => import('./TrainingDataMap'));
const ImageTextPairExplorer = lazy(() => import('./ImageTextPairExplorer'));
const DragDropAssignment = lazy(() => import('./DragDropAssignment'));
const ModelComparisonGrid = lazy(() => import('./ModelComparisonGrid'));
const ModelProfileCard = lazy(() => import('./ModelProfileCard'));
const GenderBySubjectChart = lazy(() => import('./GenderBySubjectChart'));
const ImageModelAssignment = lazy(() => import('./ImageModelAssignment'));
const BiasClusterChart = lazy(() => import('./BiasClusterChart'));
const RealityComparisonChart = lazy(() => import('./RealityComparisonChart'));
const RepresentationCycleViz = lazy(() => import('./RepresentationCycleViz'));
const EnergyCostCalculator = lazy(() => import('./EnergyCostCalculator'));
const PromptWorkshop = lazy(() => import('./PromptWorkshop'));
const ShareDecisionTool = lazy(() => import('./ShareDecisionTool'));
const PromptExploder = lazy(() => import('./PromptExploder'));
const DenoisingSimulator = lazy(() => import('./DenoisingSimulator'));
const SeedExperiment = lazy(() => import('./SeedExperiment'));
const MythBuster = lazy(() => import('./MythBuster'));
const PipelineOverview = lazy(() => import('./PipelineOverview'));
const DataMagnifier = lazy(() => import('./DataMagnifier'));
const TrainingPairBuilder = lazy(() => import('./TrainingPairBuilder'));
const V1SeriesGrid = lazy(() => import('./V1SeriesGrid'));
const DataOriginExplorer = lazy(() => import('./DataOriginExplorer'));
const WebCrawlerSimulator = lazy(() => import('./WebCrawlerSimulator'));
const DataGapExplorer = lazy(() => import('./DataGapExplorer'));
const DataToBiasChain = lazy(() => import('./DataToBiasChain'));
const SingleToSeriesReveal = lazy(() => import('./SingleToSeriesReveal'));
const DefaultDetector = lazy(() => import('./DefaultDetector'));
const VariationMapper = lazy(() => import('./VariationMapper'));
const QuadModelComparison = lazy(() => import('./QuadModelComparison'));
const ModelBlindTest = lazy(() => import('./ModelBlindTest'));
const AnalysisFramework = lazy(() => import('./AnalysisFramework'));
const CulturalComparisonGrid = lazy(() => import('./CulturalComparisonGrid'));
const BiasSpectrumExplorer = lazy(() => import('./BiasSpectrumExplorer'));
const BiasClassifier = lazy(() => import('./BiasClassifier'));
const PerceptionExperiment = lazy(() => import('./PerceptionExperiment'));
const PromptCompare = lazy(() => import('./PromptCompare'));
const DiversityAudit = lazy(() => import('./DiversityAudit'));

const COMPONENTS: Record<InteractiveComponentName, ComponentType<Record<string, unknown>>> = {
  PipelineAnimation: PipelineAnimation as ComponentType<Record<string, unknown>>,
  SeedVisualizer: SeedVisualizer as ComponentType<Record<string, unknown>>,
  NoiseToImage: NoiseToImage as ComponentType<Record<string, unknown>>,
  DataScaleVisualizer: DataScaleVisualizer as ComponentType<Record<string, unknown>>,
  TrainingDataMap: TrainingDataMap as ComponentType<Record<string, unknown>>,
  ImageTextPairExplorer: ImageTextPairExplorer as ComponentType<Record<string, unknown>>,
  DragDropAssignment: DragDropAssignment as ComponentType<Record<string, unknown>>,
  ModelComparisonGrid: ModelComparisonGrid as ComponentType<Record<string, unknown>>,
  ModelProfileCard: ModelProfileCard as ComponentType<Record<string, unknown>>,
  GenderBySubjectChart: GenderBySubjectChart as ComponentType<Record<string, unknown>>,
  ImageModelAssignment: ImageModelAssignment as ComponentType<Record<string, unknown>>,
  BiasClusterChart: BiasClusterChart as ComponentType<Record<string, unknown>>,
  RealityComparisonChart: RealityComparisonChart as ComponentType<Record<string, unknown>>,
  RepresentationCycleViz: RepresentationCycleViz as ComponentType<Record<string, unknown>>,
  EnergyCostCalculator: EnergyCostCalculator as ComponentType<Record<string, unknown>>,
  PromptWorkshop: PromptWorkshop as ComponentType<Record<string, unknown>>,
  ShareDecisionTool: ShareDecisionTool as ComponentType<Record<string, unknown>>,
  PromptExploder: PromptExploder as ComponentType<Record<string, unknown>>,
  DenoisingSimulator: DenoisingSimulator as ComponentType<Record<string, unknown>>,
  SeedExperiment: SeedExperiment as ComponentType<Record<string, unknown>>,
  MythBuster: MythBuster as ComponentType<Record<string, unknown>>,
  PipelineOverview: PipelineOverview as ComponentType<Record<string, unknown>>,
  DataMagnifier: DataMagnifier as ComponentType<Record<string, unknown>>,
  TrainingPairBuilder: TrainingPairBuilder as ComponentType<Record<string, unknown>>,
  V1SeriesGrid: V1SeriesGrid as ComponentType<Record<string, unknown>>,
  DataOriginExplorer: DataOriginExplorer as ComponentType<Record<string, unknown>>,
  WebCrawlerSimulator: WebCrawlerSimulator as ComponentType<Record<string, unknown>>,
  DataGapExplorer: DataGapExplorer as ComponentType<Record<string, unknown>>,
  DataToBiasChain: DataToBiasChain as ComponentType<Record<string, unknown>>,
  SingleToSeriesReveal: SingleToSeriesReveal as ComponentType<Record<string, unknown>>,
  DefaultDetector: DefaultDetector as ComponentType<Record<string, unknown>>,
  VariationMapper: VariationMapper as ComponentType<Record<string, unknown>>,
  QuadModelComparison: QuadModelComparison as ComponentType<Record<string, unknown>>,
  ModelBlindTest: ModelBlindTest as ComponentType<Record<string, unknown>>,
  AnalysisFramework: AnalysisFramework as ComponentType<Record<string, unknown>>,
  CulturalComparisonGrid: CulturalComparisonGrid as ComponentType<Record<string, unknown>>,
  BiasSpectrumExplorer: BiasSpectrumExplorer as ComponentType<Record<string, unknown>>,
  BiasClassifier: BiasClassifier as ComponentType<Record<string, unknown>>,
  PerceptionExperiment: PerceptionExperiment as ComponentType<Record<string, unknown>>,
  PromptCompare: PromptCompare as ComponentType<Record<string, unknown>>,
  DiversityAudit: DiversityAudit as ComponentType<Record<string, unknown>>,
};

function TextBlock({ text }: TextBlockData) {
  return (
    <p className="text-base leading-relaxed dark:text-[var(--color-secondary)] text-slate-700">
      {text}
    </p>
  );
}

function renderTextWithLinks(text: string): ReactNode[] {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  return text.split(urlPattern).map((part, index) => {
    if (/^https?:\/\/[^\s]+$/.test(part)) {
      return (
        <a
          key={`link-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-dotted underline-offset-2 hover:text-[#F59E0B]"
        >
          {part}
        </a>
      );
    }
    return <span key={`text-${index}`}>{part}</span>;
  });
}

function CalloutBlock({ title, points, tone = 'info' }: CalloutBlockData) {
  const toneColor =
    tone === 'warning'
      ? 'var(--color-warning)'
      : tone === 'success'
        ? 'var(--color-success)'
        : 'var(--color-info)';

  return (
    <section
      className="rounded-xl p-4"
      style={{
        border: `1px solid color-mix(in srgb, ${toneColor} 25%, var(--color-border))`,
        borderLeft: `4px solid ${toneColor}`,
        backgroundColor: `color-mix(in srgb, ${toneColor} 7%, transparent)`,
      }}
    >
      <h4 className="font-semibold mb-2" style={{ color: toneColor }}>
        {title}
      </h4>
      <ul className="space-y-1 text-sm dark:text-[var(--color-secondary)] text-slate-700">
        {points.map((point, index) => (
          <li key={`${point}-${index}`}>- {renderTextWithLinks(point)}</li>
        ))}
      </ul>
    </section>
  );
}

function ImageBlock({ src, alt, caption }: ImageBlockData) {
  const resolvedSrc = resolveAssetPath(src);
  return (
    <figure className="rounded-xl border border-[var(--color-border)] overflow-hidden">
      <img src={resolvedSrc} alt={alt} loading="lazy" className="w-full h-auto object-cover" />
      {caption && (
        <figcaption className="px-3 py-2 text-xs dark:text-[var(--color-muted)] text-slate-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function ImageCompareBlock({ left, right, title }: ImageCompareBlockData) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] p-4">
      {title && (
        <h4 className="font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-3">
          {title}
        </h4>
      )}
      <div className="grid md:grid-cols-2 gap-3">
        <ImageBlock {...left} />
        <ImageBlock {...right} />
      </div>
    </section>
  );
}

function RevealBlock({ question, answer }: RevealBlockData) {
  const [open, setOpen] = useState(false);
  const areaColor = getAreaColorVar(useArea());

  return (
    <section
      className="rounded-xl border transition-colors"
      style={{
        borderColor: open
          ? `color-mix(in srgb, ${areaColor} 45%, var(--color-border))`
          : 'var(--color-border)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(previous => !previous)}
        className="group w-full cursor-pointer p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-[var(--color-card)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: areaColor }}
        aria-expanded={open}
        aria-label={open ? 'Antwort ausblenden' : 'Antwort einblenden'}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p
              className="mb-1 text-[10px] uppercase tracking-wider"
              style={{ color: areaColor }}
            >
              {open ? 'Aufgeklappt' : 'Zum Aufklappen klicken'}
            </p>
            <p className="font-medium dark:text-[var(--color-primary)] text-slate-900">
              {question}
            </p>
          </div>
          <span
            className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-slate-500 transition-transform dark:text-[var(--color-muted)]"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </button>
      {open && (
        <p className="px-4 pb-4 text-sm dark:text-[var(--color-secondary)] text-slate-700">
          {answer}
        </p>
      )}
    </section>
  );
}

function QuoteBlock({ text, source }: QuoteBlockData) {
  const areaColor = getAreaColorVar(useArea());
  return (
    <blockquote className="border-l-4 pl-4 py-1" style={{ borderColor: areaColor }}>
      <p className="text-lg italic dark:text-[var(--color-primary)] text-slate-900">{text}</p>
      {source && (
        <footer className="text-xs dark:text-[var(--color-muted)] text-slate-500 mt-2">
          {source}
        </footer>
      )}
    </blockquote>
  );
}

function RenderBlock({ block }: { block: ContentBlock }) {
  const areaColor = getAreaColorVar(useArea());

  switch (block.type) {
    case 'heading': {
      const level = block.data.level ?? 2;
      const Heading = `h${level}` as 'h2' | 'h3' | 'h4';
      const sizeClass =
        level === 2
          ? 'text-2xl md:text-3xl'
          : level === 3
            ? 'text-xl md:text-2xl'
            : 'text-lg md:text-xl';
      return (
        <div>
          {block.data.kicker && (
            <p
              className="text-xs uppercase tracking-wider mb-2"
              style={{ color: areaColor }}
            >
              {block.data.kicker}
            </p>
          )}
          <Heading className={`font-bold ${sizeClass} dark:text-[var(--color-primary)] text-slate-900`}>
            {block.data.text}
          </Heading>
        </div>
      );
    }
    case 'text':
      return <TextBlock {...block.data} />;
    case 'callout':
      return <CalloutBlock {...block.data} />;
    case 'image':
      return <ImageBlock {...block.data} />;
    case 'image-compare':
      return <ImageCompareBlock {...block.data} />;
    case 'reveal':
      return <RevealBlock {...block.data} />;
    case 'quote':
      return <QuoteBlock {...block.data} />;
    case 'checkpoint':
      return <CheckpointBlock {...(block.data as CheckpointBlockData)} />;
    case 'interactive': {
      const Component = COMPONENTS[block.data.component];
      return (
        <Suspense
          fallback={
            <div className="rounded-lg border border-[var(--color-border)] p-4 text-sm dark:text-[var(--color-muted)] text-slate-500">
              Interaktiver Inhalt wird geladen...
            </div>
          }
        >
          <Component {...(block.data.props ?? {})} />
        </Suspense>
      );
    }
    case 'visualization': {
      const Component = COMPONENTS[block.data.component];
      return (
        <Suspense
          fallback={
            <div className="rounded-lg border border-[var(--color-border)] p-4 text-sm dark:text-[var(--color-muted)] text-slate-500">
              Visualisierung wird geladen...
            </div>
          }
        >
          <Component {...(block.data.props ?? {})} />
        </Suspense>
      );
    }
    default:
      return <div />;
  }
}

interface ContentRendererProps {
  blocks: ContentBlock[];
  highlightedIds?: Set<string>;
  hasSection?: boolean;
}

export default function ContentRenderer({ blocks, highlightedIds, hasSection }: ContentRendererProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-6 md:space-y-8">
      {blocks.map(block => (
        <motion.div
          key={block.id}
          id={block.id}
          initial={block.revealOnScroll && !reduceMotion ? { opacity: 0, y: 24 } : undefined}
          whileInView={block.revealOnScroll && !reduceMotion ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={
            hasSection && highlightedIds && !highlightedIds.has(block.id)
              ? 'opacity-30 transition-opacity duration-300'
              : 'transition-opacity duration-300'
          }
        >
          <RenderBlock block={block} />
        </motion.div>
      ))}
    </div>
  );
}

