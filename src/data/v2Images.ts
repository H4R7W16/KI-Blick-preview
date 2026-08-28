import type { V2ImageData, V2LanguageVariant, V2Series } from '../types/image.types';
import { resolveAssetPath } from '../utils/assetPath';

const MODELS = [
  { id: 'flux2pro', name: 'FLUX2 PRO' },
  { id: 'gpt-image-1-5', name: 'GPT Image-1.5' },
  { id: 'nanobana', name: 'Nano Bana' },
] as const;

const IMAGES_PER_SERIES = 4;

export const V2_LANGUAGE_VARIANTS: V2LanguageVariant[] = [
  {
    promptSlug: 'brot',
    prompt: 'Brot',
    promptLanguage: 'de',
    promptScript: 'Latin',
    didacticRole: 'Referenzpunkt: Lebenswelt der Lernenden',
  },
  {
    promptSlug: 'bread',
    prompt: 'Bread',
    promptLanguage: 'en',
    promptScript: 'Latin',
    didacticRole: 'Dominante Trainingssprache',
  },
  {
    promptSlug: 'pain',
    prompt: 'Pain',
    promptLanguage: 'en/fr',
    promptScript: 'Latin',
    didacticRole: 'Polysemie: englische Bedeutung dominiert',
  },
  {
    promptSlug: 'le-pain',
    prompt: 'Le pain',
    promptLanguage: 'fr',
    promptScript: 'Latin',
    didacticRole: 'Disambiguierung durch Artikel',
  },
  {
    promptSlug: 'pan-jp',
    prompt: 'パン',
    promptLanguage: 'ja',
    promptScript: 'Katakana',
    didacticRole: 'Japanische Brotkultur, Lehnwort aus Portugiesisch',
  },
  {
    promptSlug: 'mianbao-cn',
    prompt: '面包',
    promptLanguage: 'zh',
    promptScript: 'Han',
    didacticRole: 'Meistgesprochene Sprache, chinesische Brotkultur',
  },
  {
    promptSlug: 'khubz-ar',
    prompt: 'خبز',
    promptLanguage: 'ar',
    promptScript: 'Arabic',
    didacticRole: 'MENA-Region, Fladenbrot-Tradition',
  },
  {
    promptSlug: 'roti-hi',
    prompt: 'रोटी',
    promptLanguage: 'hi',
    promptScript: 'Devanagari',
    didacticRole: 'Südasien, unterrepräsentiert in Trainingsdaten',
  },
];

function buildImages(promptSlug: string, modelId: string): V2ImageData[] {
  const basePath = `/images/v2/${promptSlug}/${modelId}`;
  return Array.from({ length: IMAGES_PER_SERIES }, (_, i) => ({
    filename: `${promptSlug}_${i}.webp`,
    index: i,
    promptSlug,
    modelId,
    basePath,
  }));
}

function buildAllSeries(): V2Series[] {
  const series: V2Series[] = [];
  for (const variant of V2_LANGUAGE_VARIANTS) {
    for (const model of MODELS) {
      const images = buildImages(variant.promptSlug, model.id);
      series.push({
        variant,
        modelId: model.id,
        modelName: model.name,
        images,
        count: images.length,
      });
    }
  }
  return series;
}

export const V2_SERIES: V2Series[] = buildAllSeries();

export function getV2Series(promptSlug: string, modelId: string): V2Series | undefined {
  return V2_SERIES.find(s => s.variant.promptSlug === promptSlug && s.modelId === modelId);
}

export function getV2Image(promptSlug: string, modelId: string, index: number): V2ImageData | undefined {
  const series = getV2Series(promptSlug, modelId);
  return series?.images[index];
}

export function getV2ImagePath(promptSlug: string, modelId: string, index: number): string {
  const image = getV2Image(promptSlug, modelId, index);
  if (image) {
    return resolveAssetPath(`${image.basePath}/${image.filename}`);
  }
  return resolveAssetPath(`/images/v2/${promptSlug}/${modelId}/${promptSlug}_${index}.webp`);
}

export function getV2VariantsByModel(modelId: string): V2Series[] {
  return V2_SERIES.filter(s => s.modelId === modelId);
}

export function getV2ModelsByVariant(promptSlug: string): V2Series[] {
  return V2_SERIES.filter(s => s.variant.promptSlug === promptSlug);
}

export function getV2PainComparison(): {
  pain: V2Series[];
  lePain: V2Series[];
} {
  return {
    pain: V2_SERIES.filter(s => s.variant.promptSlug === 'pain'),
    lePain: V2_SERIES.filter(s => s.variant.promptSlug === 'le-pain'),
  };
}

export function getV2AllModelsForPrompt(promptSlug: string): {
  flux2pro: V2ImageData[];
  'gpt-image-1-5': V2ImageData[];
  nanobana: V2ImageData[];
} {
  return {
    flux2pro: getV2Series(promptSlug, 'flux2pro')?.images ?? [],
    'gpt-image-1-5': getV2Series(promptSlug, 'gpt-image-1-5')?.images ?? [],
    nanobana: getV2Series(promptSlug, 'nanobana')?.images ?? [],
  };
}
