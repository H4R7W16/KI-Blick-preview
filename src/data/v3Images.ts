import type { V3ImageData, V3ModelId, V3ModelInfo, V3Series } from '../types/image.types';
import { resolveAssetPath } from '../utils/assetPath';

const PROMPT_SLUG = 'baum';
const IMAGES_PER_SERIES = 16;

export const V3_MODEL_IDS: V3ModelId[] = ['flux2pro', 'gemini-image-2', 'gpt-image-1-5', 'nanobana'];

export const V3_MODELS: V3ModelInfo[] = [
  {
    modelId: 'flux2pro',
    modelName: 'FLUX2 PRO',
    signature: 'Landschaftlich, sanftes Licht, Huegelketten, fotorealistisch',
  },
  {
    modelId: 'gemini-image-2',
    modelName: 'Gemini Image 2',
    signature: 'Knorrige Aeste, rendert "BAUM"-Holzschild, naturalistisch',
  },
  {
    modelId: 'gpt-image-1-5',
    modelName: 'GPT Image-1.5',
    signature: 'Massiver Stamm, dramatische Krone, hyperdetaillierte Rinde',
  },
  {
    modelId: 'nanobana',
    modelName: 'Nano Bana',
    signature: 'Sonnenuntergangsstimmung, Blumenwiese, cinematisch',
  },
];

function getModelInfo(modelId: V3ModelId): V3ModelInfo {
  const info = V3_MODELS.find(model => model.modelId === modelId);
  if (!info) {
    throw new Error(`Unknown V3 model "${modelId}".`);
  }
  return info;
}

function buildSeries(modelId: V3ModelId): V3Series {
  const modelInfo = getModelInfo(modelId);
  const basePath = `/images/v3/${PROMPT_SLUG}/${modelId}`;
  const images: V3ImageData[] = Array.from({ length: IMAGES_PER_SERIES }, (_, index) => ({
    filename: `${PROMPT_SLUG}_${index}.webp`,
    index,
    promptSlug: PROMPT_SLUG,
    modelId,
    basePath,
  }));

  return {
    modelId,
    modelName: modelInfo.modelName,
    images,
    count: images.length,
  };
}

export const V3_SERIES: Record<V3ModelId, V3Series> = {
  flux2pro: buildSeries('flux2pro'),
  'gemini-image-2': buildSeries('gemini-image-2'),
  'gpt-image-1-5': buildSeries('gpt-image-1-5'),
  nanobana: buildSeries('nanobana'),
};

export function getV3Series(modelId: V3ModelId): V3Series {
  return V3_SERIES[modelId];
}

export function getV3Image(modelId: V3ModelId, index: number): V3ImageData | undefined {
  return getV3Series(modelId).images.find(image => image.index === index);
}

export function getV3ImagePath(modelId: V3ModelId, index: number): string {
  const image = getV3Image(modelId, index);
  const fallback = resolveAssetPath(`/images/v3/${PROMPT_SLUG}/${modelId}/${PROMPT_SLUG}_${index}.webp`);
  if (!image) {
    return fallback;
  }
  return resolveAssetPath(`${image.basePath}/${image.filename}`);
}

export function getV3AllModels(): V3Series[] {
  return V3_MODEL_IDS.map(modelId => getV3Series(modelId));
}

export function getV3ImagesByIndex(index: number): Record<V3ModelId, V3ImageData> {
  const flux2pro = getV3Image('flux2pro', index);
  const geminiImage2 = getV3Image('gemini-image-2', index);
  const gptImage15 = getV3Image('gpt-image-1-5', index);
  const nanobana = getV3Image('nanobana', index);

  if (!flux2pro || !geminiImage2 || !gptImage15 || !nanobana) {
    throw new RangeError(`No V3 comparison set available for index ${index}.`);
  }

  return {
    flux2pro,
    'gemini-image-2': geminiImage2,
    'gpt-image-1-5': gptImage15,
    nanobana,
  };
}

export function getV3RandomImage(modelId: V3ModelId): V3ImageData {
  const series = getV3Series(modelId);
  const randomIndex = Math.floor(Math.random() * series.images.length);
  return series.images[randomIndex];
}

export function getV3ComparisonSet(index: number): {
  flux2pro: V3ImageData;
  'gemini-image-2': V3ImageData;
  'gpt-image-1-5': V3ImageData;
  nanobana: V3ImageData;
} {
  const byIndex = getV3ImagesByIndex(index);
  return {
    flux2pro: byIndex.flux2pro,
    'gemini-image-2': byIndex['gemini-image-2'],
    'gpt-image-1-5': byIndex['gpt-image-1-5'],
    nanobana: byIndex.nanobana,
  };
}

function shuffleInPlace<T>(list: T[]): T[] {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

export function getV3ShuffledImages(count: number): (V3ImageData & { correctModel: V3ModelId })[] {
  if (count <= 0) {
    return [];
  }

  const pool = getV3AllModels().flatMap(series =>
    series.images.map(image => ({
      ...image,
      correctModel: series.modelId,
    })),
  );

  const shuffled = shuffleInPlace([...pool]);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
