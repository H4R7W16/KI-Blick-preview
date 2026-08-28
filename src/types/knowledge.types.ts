export type AreaType = 'verstehen' | 'entdecken' | 'einordnen' | 'lernen';

export type ContentBlockType =
  | 'text'
  | 'heading'
  | 'callout'
  | 'image'
  | 'image-compare'
  | 'interactive'
  | 'visualization'
  | 'reveal'
  | 'quote'
  | 'checkpoint';

export type InteractiveComponentName =
  | 'PipelineAnimation'
  | 'SeedVisualizer'
  | 'NoiseToImage'
  | 'DataScaleVisualizer'
  | 'TrainingDataMap'
  | 'ImageTextPairExplorer'
  | 'DragDropAssignment'
  | 'ModelComparisonGrid'
  | 'ModelProfileCard'
  | 'GenderBySubjectChart'
  | 'ImageModelAssignment'
  | 'BiasClusterChart'
  | 'RealityComparisonChart'
  | 'RepresentationCycleViz'
  | 'EnergyCostCalculator'
  | 'PromptWorkshop'
  | 'ShareDecisionTool'
  | 'PromptExploder'
  | 'DenoisingSimulator'
  | 'SeedExperiment'
  | 'MythBuster'
  | 'PipelineOverview'
  | 'DataMagnifier'
  | 'TrainingPairBuilder'
  | 'V1SeriesGrid'
  | 'DataOriginExplorer'
  | 'WebCrawlerSimulator'
  | 'DataGapExplorer'
  | 'DataToBiasChain'
  | 'SingleToSeriesReveal'
  | 'DefaultDetector'
  | 'VariationMapper'
  | 'QuadModelComparison'
  | 'ModelBlindTest'
  | 'AnalysisFramework'
  | 'CulturalComparisonGrid'
  | 'BiasSpectrumExplorer'
  | 'BiasClassifier'
  | 'PerceptionExperiment'
  | 'PromptCompare'
  | 'DiversityAudit';

interface BaseContentBlock<T extends ContentBlockType, D> {
  type: T;
  id: string;
  data: D;
  revealOnScroll?: boolean;
  level?: 1 | 2 | 3;  // Niveaustufe; undefined = alle Stufen
}

export interface HeadingBlockData {
  text: string;
  level?: 2 | 3 | 4;
  kicker?: string;
}

export interface TextBlockData {
  text: string;
}

export interface CalloutBlockData {
  title: string;
  tone?: 'info' | 'warning' | 'success';
  points: string[];
}

export interface ImageBlockData {
  src: string;
  alt: string;
  caption?: string;
}

export interface ImageCompareBlockData {
  left: ImageBlockData;
  right: ImageBlockData;
  title?: string;
}

export interface RevealBlockData {
  question: string;
  answer: string;
}

export interface QuoteBlockData {
  text: string;
  source?: string;
}

export interface CheckpointBlockData {
  question: string;
  answer: string;
  hint?: string;
}

export interface InteractiveBlockData {
  component: InteractiveComponentName;
  props?: Record<string, unknown>;
}

export interface VisualizationBlockData {
  component: Exclude<InteractiveComponentName, 'PipelineAnimation' | 'SeedVisualizer' | 'NoiseToImage' | 'ImageTextPairExplorer' | 'DragDropAssignment' | 'ModelComparisonGrid' | 'ImageModelAssignment' | 'PromptWorkshop' | 'ShareDecisionTool'>;
  props?: Record<string, unknown>;
}

export type ContentBlock =
  | BaseContentBlock<'heading', HeadingBlockData>
  | BaseContentBlock<'text', TextBlockData>
  | BaseContentBlock<'callout', CalloutBlockData>
  | BaseContentBlock<'image', ImageBlockData>
  | BaseContentBlock<'image-compare', ImageCompareBlockData>
  | BaseContentBlock<'reveal', RevealBlockData>
  | BaseContentBlock<'quote', QuoteBlockData>
  | BaseContentBlock<'checkpoint', CheckpointBlockData>
  | BaseContentBlock<'interactive', InteractiveBlockData>
  | BaseContentBlock<'visualization', VisualizationBlockData>;

export interface KnowledgeUnit {
  id: string;
  area: 'verstehen' | 'einordnen';
  number: number;
  title: string;
  description: string;
  level: 1 | 2 | 3;
  content?: ContentBlock[];
}

export type CheckoutType = 'quiz' | 'drag-drop' | 'comparison' | 'reflection' | 'assignment';

export interface QuizOption {
  text: string;
  correct: boolean;
  feedback?: string;
}

export interface AssignmentItem {
  id: string;
  statement: string;
  correctBucket: string;
  feedback: string;
  kiPercent?: number;
  realityPercent?: number;
  entdeckenLink?: string;
}

export interface ComparisonItem {
  id: string;
  src: string;
  alt: string;
  correctModelId: string;
}

export interface CheckoutElement {
  id: string;
  unitId: string;
  type: CheckoutType;
  question: string;
  preamble?: string;
  options?: QuizOption[];
  assignmentItems?: AssignmentItem[];
  assignmentBuckets?: string[];
  comparisonItems?: ComparisonItem[];
  hint?: string;
}

export interface LearningPathStep {
  stepNumber: number;
  area: AreaType | 'aufgabe' | 'abschluss';
  unitId?: string;
  sectionId?: string;
  sectionEndId?: string;
  operator?: string;
  description: string;
  contextBridge?: string;
  entdeckenSubject?: string;
  entdeckenGuided?: boolean;
  taskConfig?: TaskStepConfig;
}

/** Slider: Einschätzung auf einer Skala */
export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  items: SliderItem[];
}

export interface SliderItem {
  id: string;
  label: string;
}

/** Image-Select: Bildauswahl mit optionaler Begründung */
export interface ImageSelectConfig {
  prompt: string;
  images: ImageSelectOption[];
  maxSelections: number;
  requireJustification: boolean;
}

export interface ImageSelectOption {
  id: string;
  src: string;
  alt: string;
}

/** Rating: Mehrere Items auf einer gemeinsamen Skala bewerten */
export interface RatingConfig {
  prompt: string;
  scale: { min: number; max: number; minLabel: string; maxLabel: string };
  items: RatingItem[];
}

export interface RatingItem {
  id: string;
  label: string;
  description?: string;
}

/** Konfiguration fuer Aufgaben-Schritte (area === 'aufgabe') */
export interface TaskStepConfig {
  title: string;
  operator: string;
  instruction: string;
  scaffolding?: string[];
  inputType: 'freetext' | 'structured' | 'choice-and-text' | 'comparison'
    | 'slider' | 'image-select' | 'rating';
  previousStepRef?: number;
  imageRef?: 'kontaktblatt' | 'series' | 'cultural-comparison';
  subjectSelectable?: boolean;
  minLength?: number;
  comparisonCategories?: string[];
  sliderConfig?: SliderConfig;
  imageSelectConfig?: ImageSelectConfig;
  ratingConfig?: RatingConfig;
}

export interface LearningPath {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  level: 1 | 2 | 3;
  estimatedDuration: string;
  focus: string[];
  steps: LearningPathStep[];
  badgeId?: string;
  leitfrage: string;
  kompetenzen: string[];
  briefingPrompt?: string;
  debriefingPrompt: string;
  transferPrompt?: string;
  milestoneOutlook?: string;
}

export interface UserProgress {
  nickname: string;
  visitedUnits: string[];
  completedCheckouts: string[];
  learningPaths: Record<string, LearningPathProgress>;
  badges: string[];
  completedPaths: string[];
}

export interface LearningPathProgress {
  currentStep: number;
  completedSteps: number[];
  taskData: Record<number, TaskData>;
  selectedSubject?: string;
  startedAt: string;
}

export interface TaskData {
  text?: string;
  fields?: Record<string, string>;
  selectedOption?: string;
  completedAt?: string;
  sliderValues?: Record<string, number>;
  selectedImages?: string[];
  justification?: string;
}
