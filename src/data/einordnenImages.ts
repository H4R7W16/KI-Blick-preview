import type {
  EinordnenAlternativePrompt,
  EinordnenCountry,
  EinordnenImageData,
  EinordnenSeries,
  ModelId,
} from '../types/image.types';
import { getSeries } from './imageMetadata';
import { resolveAssetPath } from '../utils/assetPath';

const IMAGE_COUNT = 4;

// Standard-Modelle (für Schul-/Unterrichtsbilder)
const SCHOOL_MODEL_IDS: ModelId[] = ['flux2pro', 'gpt-image-1-5', 'nanobana'];

// Erweiterte Modelle (für E5 Alternative-Prompt-Bilder, inkl. Gemini Image 2)
export type E5ModelId = ModelId | 'gemini-image-2';
const E5_MODEL_IDS: E5ModelId[] = ['flux2pro', 'gpt-image-1-5', 'nanobana', 'gemini-image-2'];

const E5_MODEL_LABELS: Record<E5ModelId, string> = {
  flux2pro: 'FLUX2 PRO',
  'gpt-image-1-5': 'GPT Image-1.5',
  nanobana: 'Nano Bana',
  'gemini-image-2': 'Gemini Image 2',
};

export const EINORDNEN_COUNTRIES: EinordnenCountry[] = [
  {
    countryId: 'deutschland',
    countryName: 'Deutschland',
    continent: 'Europa',
    schoolSlug: 'schule-in-deutschland',
    classroomSlug: 'unterricht-in-deutschland',
  },
  {
    countryId: 'japan',
    countryName: 'Japan',
    continent: 'Asien',
    schoolSlug: 'schule-in-japan',
    classroomSlug: 'unterricht-in-japan',
  },
  {
    countryId: 'kenia',
    countryName: 'Kenia',
    continent: 'Afrika',
    schoolSlug: 'schule-in-kenia',
    classroomSlug: 'unterricht-in-kenia',
  },
  {
    countryId: 'brasilien',
    countryName: 'Brasilien',
    continent: 'Südamerika',
    schoolSlug: 'schule-in-brasilien',
    classroomSlug: 'unterricht-in-brasilien',
  },
];

export const EINORDNEN_ALTERNATIVE_PROMPTS: EinordnenAlternativePrompt[] = [
  {
    slug: 'diverse-mathematiklehrkraefte',
    prompt: 'Eine diverse Gruppe von Mathematiklehrkräften verschiedenen Alters und Geschlechts',
    strategy: 'diversity',
    strategyName: 'Diversität explizit',
    comparisonDefault: 'mathematiklehrkraft',
  },
  {
    slug: 'frau-informatik',
    prompt: 'Eine junge Frau unterrichtet Informatik in einem modernen Klassenzimmer',
    strategy: 'counter-stereotype',
    strategyName: 'Stereotyp brechen',
    comparisonDefault: 'informatiklehrkraft',
  },
  {
    slug: 'mathe-gesamtschule',
    prompt: 'Mathematiklehrkraft in einer deutschen Gesamtschule, realistisch',
    strategy: 'context',
    strategyName: 'Kontext ergänzen',
    comparisonDefault: 'mathematiklehrkraft',
  },
];

function buildSeries(
  promptSlug: string,
  modelId: ModelId,
  category: EinordnenImageData['category'],
): EinordnenSeries {
  const basePath = `/images/einordnen/${promptSlug}/${modelId}`;
  const images: EinordnenImageData[] = Array.from({ length: IMAGE_COUNT }, (_, index) => ({
    filename: `${promptSlug}_${index}.webp`,
    index,
    promptSlug,
    modelId,
    basePath,
    category,
  }));

  return {
    promptSlug,
    modelId,
    images,
    count: images.length,
  };
}

// E5 variant that accepts gemini-image-2
function buildE5Series(
  promptSlug: string,
  modelId: E5ModelId,
  category: EinordnenImageData['category'],
): EinordnenSeries {
  const basePath = `/images/einordnen/${promptSlug}/${modelId}`;
  const images: EinordnenImageData[] = Array.from({ length: IMAGE_COUNT }, (_, index) => ({
    filename: `${promptSlug}_${index}.webp`,
    index,
    promptSlug,
    modelId: modelId as ModelId,
    basePath,
    category,
  }));

  return {
    promptSlug,
    modelId: modelId as ModelId,
    images,
    count: images.length,
  };
}

function getCountry(countryId: string): EinordnenCountry {
  const country = EINORDNEN_COUNTRIES.find(entry => entry.countryId === countryId);
  if (!country) {
    throw new Error(`Unknown countryId "${countryId}".`);
  }
  return country;
}

function getAlternativePrompt(slug: string): EinordnenAlternativePrompt {
  const prompt = EINORDNEN_ALTERNATIVE_PROMPTS.find(entry => entry.slug === slug);
  if (!prompt) {
    throw new Error(`Unknown alternative prompt "${slug}".`);
  }
  return prompt;
}

function getImagePath(promptSlug: string, modelId: ModelId, index: number): string {
  return resolveAssetPath(`/images/einordnen/${promptSlug}/${modelId}/${promptSlug}_${index}.webp`);
}

function getSeriesImageOrThrow(series: EinordnenSeries, index: number): EinordnenImageData {
  const image = series.images[index];
  if (!image) {
    throw new RangeError(
      `No image for prompt "${series.promptSlug}", model "${series.modelId}", index ${index}.`,
    );
  }
  return image;
}

export function getSchoolSeries(countryId: string, modelId: ModelId): EinordnenSeries {
  const country = getCountry(countryId);
  return buildSeries(country.schoolSlug, modelId, 'school');
}

export function getClassroomSeries(countryId: string, modelId: ModelId): EinordnenSeries {
  const country = getCountry(countryId);
  return buildSeries(country.classroomSlug, modelId, 'classroom');
}

export function getSchoolImagePath(countryId: string, modelId: ModelId, index: number): string {
  const country = getCountry(countryId);
  return getImagePath(country.schoolSlug, modelId, index);
}

export function getClassroomImagePath(countryId: string, modelId: ModelId, index: number): string {
  const country = getCountry(countryId);
  return getImagePath(country.classroomSlug, modelId, index);
}

export function getSchoolComparisonSet(index: number): Record<string, Record<ModelId, EinordnenImageData>> {
  const result: Record<string, Record<ModelId, EinordnenImageData>> = {};

  for (const country of EINORDNEN_COUNTRIES) {
    const byModel = {} as Record<ModelId, EinordnenImageData>;
    for (const modelId of SCHOOL_MODEL_IDS) {
      const series = getSchoolSeries(country.countryId, modelId);
      byModel[modelId] = getSeriesImageOrThrow(series, index);
    }
    result[country.countryId] = byModel;
  }

  return result;
}

export function getAlternativeSeries(slug: string, modelId: ModelId): EinordnenSeries {
  const prompt = getAlternativePrompt(slug);
  return buildSeries(prompt.slug, modelId, 'alternative');
}

export function getAlternativeImagePath(slug: string, modelId: ModelId, index: number): string {
  const prompt = getAlternativePrompt(slug);
  return getImagePath(prompt.slug, modelId, index);
}

export function getPromptComparison(alternativeSlug: string, modelId: ModelId): {
  default: { images: EinordnenImageData[]; prompt: string };
  alternative: { images: EinordnenImageData[]; prompt: string };
} {
  const alternativePrompt = getAlternativePrompt(alternativeSlug);
  const alternativeSeries = getAlternativeSeries(alternativePrompt.slug, modelId);

  const defaultSeries = getSeries(alternativePrompt.comparisonDefault, modelId);
  if (!defaultSeries) {
    throw new Error(
      `Missing default series "${alternativePrompt.comparisonDefault}" for model "${modelId}".`,
    );
  }

  const defaultImages: EinordnenImageData[] = defaultSeries.images.map((image, index) => ({
    filename: image.filename,
    index,
    promptSlug: alternativePrompt.comparisonDefault,
    modelId,
    basePath: defaultSeries.basePath,
    category: 'alternative',
  }));

  return {
    default: {
      images: defaultImages,
      prompt: defaultSeries.prompt,
    },
    alternative: {
      images: alternativeSeries.images,
      prompt: alternativePrompt.prompt,
    },
  };
}

export function getAllEinordnenSeries(): EinordnenSeries[] {
  const schoolAndClassroom: EinordnenSeries[] = [];
  for (const country of EINORDNEN_COUNTRIES) {
    for (const modelId of SCHOOL_MODEL_IDS) {
      schoolAndClassroom.push(getSchoolSeries(country.countryId, modelId));
      schoolAndClassroom.push(getClassroomSeries(country.countryId, modelId));
    }
  }

  const alternatives: EinordnenSeries[] = [];
  for (const prompt of EINORDNEN_ALTERNATIVE_PROMPTS) {
    for (const modelId of SCHOOL_MODEL_IDS) {
      alternatives.push(getAlternativeSeries(prompt.slug, modelId));
    }
  }

  return [...schoolAndClassroom, ...alternatives];
}

// ─── E5 exports (4 models including Gemini Image 2) ─────────────────

export function getAlternativeSeriesAllModels(slug: string): Record<E5ModelId, EinordnenSeries> {
  const result = {} as Record<E5ModelId, EinordnenSeries>;
  for (const modelId of E5_MODEL_IDS) {
    result[modelId] = buildE5Series(slug, modelId, 'alternative');
  }
  return result;
}

export function getE5ModelIds(): E5ModelId[] {
  return [...E5_MODEL_IDS];
}

export function getE5ModelLabel(modelId: E5ModelId): string {
  return E5_MODEL_LABELS[modelId];
}

export function getE5ImagePath(slug: string, modelId: E5ModelId, index: number): string {
  return resolveAssetPath(`/images/einordnen/${slug}/${modelId}/${slug}_${index}.webp`);
}
