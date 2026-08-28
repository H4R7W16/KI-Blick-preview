import type { V1ImageData, V1Series } from '../types/image.types';
import { resolveAssetPath } from '../utils/assetPath';

const V1_MODEL = 'FLUX2 PRO';

const V1_PROMPTS: Record<string, string> = {
  leuchtturm: 'Leuchtturm',
  fahrrad: 'Fahrrad',
  'katze-auf-einem-buch': 'Katze auf einem Buch',
};

const V1_SEEDS: Record<string, number[]> = {
  leuchtturm: [
    1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007,
    1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015,
  ],
  fahrrad: [2000, 2001, 2002, 2003, 2004],
  'katze-auf-einem-buch': [3000, 3001, 3002, 3003],
};

function buildV1Series(promptSlug: string, prompt: string, seeds: number[]): V1Series {
  const basePath = `/images/v1/${promptSlug}`;
  const images: V1ImageData[] = seeds.map(seed => ({
    filename: `${promptSlug}_seed-${seed}.webp`,
    seed,
    prompt,
    promptSlug,
    model: V1_MODEL,
    basePath,
  }));

  return {
    prompt,
    promptSlug,
    model: V1_MODEL,
    images,
    basePath,
  };
}

export const V1_SERIES: Record<string, V1Series> = {
  leuchtturm: buildV1Series('leuchtturm', V1_PROMPTS.leuchtturm, V1_SEEDS.leuchtturm),
  fahrrad: buildV1Series('fahrrad', V1_PROMPTS.fahrrad, V1_SEEDS.fahrrad),
  'katze-auf-einem-buch': buildV1Series(
    'katze-auf-einem-buch',
    V1_PROMPTS['katze-auf-einem-buch'],
    V1_SEEDS['katze-auf-einem-buch'],
  ),
};

export function getV1Image(promptSlug: string, seed: number): V1ImageData | undefined {
  const series = getV1Series(promptSlug);
  return series?.images.find(image => image.seed === seed);
}

export function getV1Series(promptSlug: string): V1Series | undefined {
  return V1_SERIES[promptSlug];
}

export function getV1ImagePath(promptSlug: string, seed: number): string {
  const image = getV1Image(promptSlug, seed);
  const filename = image?.filename ?? `${promptSlug}_seed-${seed}.webp`;
  const basePath = image?.basePath ?? `/images/v1/${promptSlug}`;
  return resolveAssetPath(`${basePath}/${filename}`);
}

export function getAllV1Seeds(promptSlug: string): number[] {
  return getV1Series(promptSlug)?.images.map(image => image.seed) ?? [];
}

export function getRandomV1SeedPair(promptSlug: string): [number, number] {
  const seeds = getAllV1Seeds(promptSlug);
  if (seeds.length < 2) {
    throw new Error(`At least two seeds are required for "${promptSlug}".`);
  }

  const firstIndex = Math.floor(Math.random() * seeds.length);
  let secondIndex = Math.floor(Math.random() * seeds.length);
  while (secondIndex === firstIndex) {
    secondIndex = Math.floor(Math.random() * seeds.length);
  }

  return [seeds[firstIndex], seeds[secondIndex]];
}
