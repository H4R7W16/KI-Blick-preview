/**
 * Copies images from interne-materialien/bilder/ to public/images/generated/{subject-slug}/{model-slug}/,
 * converts them to WebP format, and generates a consolidated metadata TypeScript file.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';

const sharp = (await import('sharp')).default;

const ROOT = resolve(import.meta.dirname, '..');
const BILDER_DIR = resolve(ROOT, '..', 'interne-materialien', 'bilder');
const PUBLIC_DIR = resolve(ROOT, 'public', 'images', 'generated');
const DATA_OUTPUT = resolve(ROOT, 'src', 'data', 'imageMetadata.ts');

const UMLAUT_MAP = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue', 'ß': 'ss' };

function slugify(str) {
  let result = str.toLowerCase();
  for (const [from, to] of Object.entries(UMLAUT_MAP)) {
    result = result.replaceAll(from, to);
  }
  return result.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const MODEL_SLUG_MAP = {
  'FLUX2 PRO': 'flux2pro',
  'GPT Image-1 5': 'gpt-image-1-5',
  'Nano Bana': 'nanobana',
};

const VALID_GENDER = new Set(['female', 'male', 'ambiguous']);
const VALID_HAIR_COLOR = new Set(['black', 'brown', 'blond', 'red', 'gray', 'white', 'bald', 'covered', 'other', 'unclear']);
const VALID_SKIN_TONE = new Set(['light', 'medium', 'dark', 'unclear']);
const VALID_AGE = new Set(['20-29', '30-39', '40-49', '50-59', '60+', 'unclear']);
const VALID_GLASSES = new Set(['yes', 'no', 'unclear']);
const VALID_CLOTHING = new Set(['formal-business', 'smart-casual', 'casual', 'sport', 'creative-workwear', 'traditional', 'labwear', 'unclear']);
const VALID_BACKGROUND = new Set([
  'classroom-board',
  'classroom-digital',
  'computer-lab',
  'art-studio',
  'music-room',
  'science-lab',
  'gym-indoor',
  'sports-field',
  'outdoor-school',
  'historical-classroom',
  'other',
  'unclear',
]);
const VALID_UTENSILS = new Set([
  'book',
  'worksheet',
  'chalk-marker',
  'laptop-tablet',
  'code-screen',
  'math-formula-board',
  'physics-lab-equipment',
  'instrument',
  'sports-equipment',
  'art-tools',
  'language-symbols',
  'classical-symbols',
  'none',
  'other',
]);
const VALID_OUTFIT_TAGS = new Set([
  'jackett',
  'blazer',
  'krawatte',
  'trainingshose',
  'sportshirt',
  'rock',
  'halstuch',
  'strickjacke',
  'schuerze',
  'hoodie',
]);

function readJsonWithBom(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  content = content.replace(/^\uFEFF/, '');
  return JSON.parse(content);
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeTeacherAttributes(rawAttributes) {
  if (!isRecord(rawAttributes)) return rawAttributes;

  const hasRequiredKeys = (
    'gender' in rawAttributes &&
    'hairColor' in rawAttributes &&
    'skinTone' in rawAttributes &&
    'age' in rawAttributes &&
    'glasses' in rawAttributes &&
    'clothing' in rawAttributes &&
    'background' in rawAttributes &&
    'utensils' in rawAttributes
  );

  if (!hasRequiredKeys) {
    return rawAttributes;
  }

  const gender = VALID_GENDER.has(rawAttributes.gender) ? rawAttributes.gender : 'ambiguous';
  const hairColor = VALID_HAIR_COLOR.has(rawAttributes.hairColor) ? rawAttributes.hairColor : 'unclear';
  const skinTone = VALID_SKIN_TONE.has(rawAttributes.skinTone) ? rawAttributes.skinTone : 'unclear';
  const age = VALID_AGE.has(rawAttributes.age) ? rawAttributes.age : 'unclear';
  const glasses = VALID_GLASSES.has(rawAttributes.glasses) ? rawAttributes.glasses : 'unclear';
  const clothing = VALID_CLOTHING.has(rawAttributes.clothing) ? rawAttributes.clothing : 'unclear';
  const background = VALID_BACKGROUND.has(rawAttributes.background) ? rawAttributes.background : 'unclear';

  const rawUtensils = Array.isArray(rawAttributes.utensils) ? rawAttributes.utensils : [];
  const dedupedUtensils = [...new Set(rawUtensils.filter(value => VALID_UTENSILS.has(value)))];
  const utensils = dedupedUtensils.length > 0 ? dedupedUtensils : ['none'];
  const normalizedUtensils = utensils.includes('none') && utensils.length > 1
    ? utensils.filter(value => value !== 'none')
    : utensils;

  const hasOutfitTags = Object.prototype.hasOwnProperty.call(rawAttributes, 'outfitTags');
  const normalizedOutfitTags = hasOutfitTags
    ? [...new Set((Array.isArray(rawAttributes.outfitTags) ? rawAttributes.outfitTags : []).filter(value => VALID_OUTFIT_TAGS.has(value)))]
    : undefined;

  return {
    ...rawAttributes,
    gender,
    hairColor,
    skinTone,
    age,
    glasses,
    clothing,
    background,
    utensils: normalizedUtensils,
    ...(hasOutfitTags ? { outfitTags: normalizedOutfitTags } : {}),
  };
}

function normalizeSeriesMetadata(rawMetadata) {
  if (!isRecord(rawMetadata) || !Array.isArray(rawMetadata.images)) return rawMetadata;

  const images = rawMetadata.images.map(image => {
    if (!isRecord(image) || !isRecord(image.attributes)) return image;
    return {
      ...image,
      attributes: normalizeTeacherAttributes(image.attributes),
    };
  });

  return {
    ...rawMetadata,
    count: images.length,
    images,
  };
}

// Read all subject folders
const subjectFolders = readdirSync(BILDER_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name.endsWith('lehrkraft'))
  .map(d => d.name);

console.log(`Found ${subjectFolders.length} subject folders`);

const allSeries = [];
let totalCopied = 0;

for (const subjectFolder of subjectFolders) {
  const subjectSlug = slugify(subjectFolder);
  const subjectPath = join(BILDER_DIR, subjectFolder);

  const modelFolders = readdirSync(subjectPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const modelFolder of modelFolders) {
    const modelSlug = MODEL_SLUG_MAP[modelFolder];
    if (!modelSlug) {
      console.warn(`Unknown model folder: ${modelFolder}, skipping`);
      continue;
    }

    const modelPath = join(subjectPath, modelFolder);
    const destDir = join(PUBLIC_DIR, subjectSlug, modelSlug);
    mkdirSync(destDir, { recursive: true });

    // Read metadata
    const metadataPath = join(modelPath, 'metadata.json');
    if (!existsSync(metadataPath)) {
      console.warn(`No metadata.json in ${modelPath}, skipping`);
      continue;
    }

    const metadata = normalizeSeriesMetadata(readJsonWithBom(metadataPath));

    // Convert images to WebP and store with updated filenames
    const updatedImages = [];
    for (const image of metadata.images) {
      const srcFile = join(modelPath, image.filename);
      const webpFilename = image.filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      const destFile = join(destDir, webpFilename);
      if (existsSync(srcFile)) {
        await sharp(srcFile).webp({ quality: 82 }).toFile(destFile);
        totalCopied++;
        updatedImages.push({ ...image, filename: webpFilename });
      } else {
        console.warn(`Missing image: ${srcFile}`);
        updatedImages.push(image);
      }
    }

    // Convert kontaktblatt to WebP if exists
    const kontaktblattSrc = join(modelPath, '_kontaktblatt.jpg');
    if (existsSync(kontaktblattSrc)) {
      await sharp(kontaktblattSrc).webp({ quality: 85 }).toFile(join(destDir, '_kontaktblatt.webp'));
      // Remove stale .jpg version if it exists
      const staleJpg = join(destDir, '_kontaktblatt.jpg');
      if (existsSync(staleJpg)) unlinkSync(staleJpg);
    }

    // Store series data with corrected paths and WebP filenames
    allSeries.push({
      ...metadata,
      images: updatedImages,
      count: updatedImages.length,
      basePath: `/images/generated/${subjectSlug}/${modelSlug}`,
      subjectSlug,
    });

    console.log(`  Copied ${metadata.images.length} images: ${subjectFolder}/${modelFolder} -> ${subjectSlug}/${modelSlug}`);
  }
}

// Generate TypeScript metadata file
const tsContent = `// Auto-generated by scripts/copy-images.mjs – do not edit manually
import type { SeriesData } from '../types/image.types';

export interface SeriesWithPath extends SeriesData {
  basePath: string;
  subjectSlug: string;
}

export const IMAGE_SERIES: SeriesWithPath[] = ${JSON.stringify(allSeries, null, 2)};

export function getSeriesForSubject(subjectSlug: string): SeriesWithPath[] {
  return IMAGE_SERIES.filter(s => s.subjectSlug === subjectSlug);
}

export function getSeries(subjectSlug: string, modelId: string): SeriesWithPath | undefined {
  return IMAGE_SERIES.find(s => s.subjectSlug === subjectSlug && s.modelId === modelId);
}
`;

writeFileSync(DATA_OUTPUT, tsContent, 'utf-8');

// Clean up stale .jpg files left in the generated directory
let staleCount = 0;
function cleanStaleJpg(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      cleanStaleJpg(fullPath);
    } else if (/\.(jpg|jpeg)$/i.test(entry.name)) {
      const webpPath = fullPath.replace(/\.(jpg|jpeg)$/i, '.webp');
      if (existsSync(webpPath)) {
        unlinkSync(fullPath);
        staleCount++;
      }
    }
  }
}
cleanStaleJpg(PUBLIC_DIR);

console.log(`\nDone! Converted ${totalCopied} images to WebP, generated ${DATA_OUTPUT}`);
console.log(`Total series: ${allSeries.length}`);
if (staleCount > 0) console.log(`Removed ${staleCount} stale .jpg files.`);
