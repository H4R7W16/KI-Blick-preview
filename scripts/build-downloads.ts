import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';

type DownloadPackageType = 'subject' | 'model' | 'theme' | 'complete';

interface DownloadPackageManifestEntry {
  id: string;
  type: DownloadPackageType;
  filename: string;
  label: string;
  description: string;
  imageCount: number;
  sizeBytes: number;
}

interface SubjectDefinition {
  slug: string;
  label: string;
  filenameLabel: string;
}

interface ModelDefinition {
  slug: string;
  label: string;
  filenameLabel: string;
  manifestId: string;
}

interface LanguageDefinition {
  slug: string;
  label: string;
}

interface ZipFileEntry {
  sourcePath: string;
  zipPath: string;
  isImage: boolean;
}

const SCRIPT_DIR = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, '..');
const GENERATED_IMAGES_DIR = join(PROJECT_ROOT, 'public', 'images', 'generated');
const V2_IMAGES_DIR = join(PROJECT_ROOT, 'public', 'images', 'v2');
const DOWNLOADS_DIR = join(PROJECT_ROOT, 'public', 'downloads');
const MANIFEST_PATH = join(DOWNLOADS_DIR, 'manifest.json');
const LICENSE_PATH = join(DOWNLOADS_DIR, 'LIZENZ.txt');
const METADATA_ALL_PATH = resolve(PROJECT_ROOT, '..', 'interne-materialien', 'bilder', 'metadata-all.json');

const SUBJECTS: SubjectDefinition[] = [
  { slug: 'mathematiklehrkraft', label: 'Mathematiklehrkraft', filenameLabel: 'Mathematiklehrkraft' },
  { slug: 'deutschlehrkraft', label: 'Deutschlehrkraft', filenameLabel: 'Deutschlehrkraft' },
  { slug: 'physiklehrkraft', label: 'Physiklehrkraft', filenameLabel: 'Physiklehrkraft' },
  { slug: 'informatiklehrkraft', label: 'Informatiklehrkraft', filenameLabel: 'Informatiklehrkraft' },
  { slug: 'sportlehrkraft', label: 'Sportlehrkraft', filenameLabel: 'Sportlehrkraft' },
  { slug: 'kunstlehrkraft', label: 'Kunstlehrkraft', filenameLabel: 'Kunstlehrkraft' },
  { slug: 'musiklehrkraft', label: 'Musiklehrkraft', filenameLabel: 'Musiklehrkraft' },
  { slug: 'englischlehrkraft', label: 'Englischlehrkraft', filenameLabel: 'Englischlehrkraft' },
  { slug: 'franzoesischlehrkraft', label: 'Franzoesischlehrkraft', filenameLabel: 'Franzoesischlehrkraft' },
  { slug: 'lateinlehrkraft', label: 'Lateinlehrkraft', filenameLabel: 'Lateinlehrkraft' },
];

const MODELS: ModelDefinition[] = [
  { slug: 'flux2pro', label: 'FLUX2 PRO', filenameLabel: 'FLUX2-PRO', manifestId: 'flux2pro-alle' },
  { slug: 'gpt-image-1-5', label: 'GPT Image-1.5', filenameLabel: 'GPT-Image-1-5', manifestId: 'gpt-image-1-5-alle' },
  { slug: 'nanobana', label: 'Nano Bana', filenameLabel: 'Nano-Bana', manifestId: 'nanobana-alle' },
];

const LANGUAGES: LanguageDefinition[] = [
  { slug: 'brot', label: 'Deutsch' },
  { slug: 'bread', label: 'Englisch' },
  { slug: 'le-pain', label: 'Franzoesisch' },
  { slug: 'khubz-ar', label: 'Arabisch' },
  { slug: 'mianbao-cn', label: 'Chinesisch' },
  { slug: 'pan-jp', label: 'Japanisch' },
  { slug: 'roti-hi', label: 'Hindi' },
  { slug: 'pain', label: 'Portugiesisch' },
];

const LICENSE_TEXT = `KI:Blick - Bilder, Bias und Blickwinkel
=========================================

Lizenz: CC BY-SA 4.0 (Creative Commons Namensnennung -
Weitergabe unter gleichen Bedingungen 4.0 International)

https://creativecommons.org/licenses/by-sa/4.0/deed.de

Namensnennung:
"KI:Blick - Bilder, Bias und Blickwinkel"
Konzept: Jan Hartwig
https://ki-blick.kmz-es.de

Weiterverwendung ist ausdruecklich erwuenscht - fuer
Unterrichtsmaterialien, Fortbildungen, OER und Forschung.

Bei Veraenderungen bitte kennzeichnen:
"Basiert auf KI:Blick (Jan Hartwig). Aenderungen durch [Name]."
`;

function ensureDirectory(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function listFilesRecursive(directoryPath: string): string[] {
  if (!existsSync(directoryPath)) {
    throw new Error(`Pfad nicht gefunden: ${directoryPath}`);
  }

  const files: string[] = [];
  const entries = readdirSync(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath));
      continue;
    }
    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function isImageFile(filePath: string): boolean {
  return /\.(webp|png|jpg|jpeg)$/i.test(filePath);
}

function collectSubjectFiles(subject: SubjectDefinition): ZipFileEntry[] {
  const entries: ZipFileEntry[] = [];
  const subjectBaseDir = join(GENERATED_IMAGES_DIR, subject.slug);

  for (const model of MODELS) {
    const modelDir = join(subjectBaseDir, model.slug);
    const files = listFilesRecursive(modelDir);
    for (const filePath of files) {
      entries.push({
        sourcePath: filePath,
        zipPath: join(subject.slug, model.slug, relative(modelDir, filePath)),
        isImage: isImageFile(filePath),
      });
    }
  }

  return entries;
}

function collectModelFiles(model: ModelDefinition): ZipFileEntry[] {
  const entries: ZipFileEntry[] = [];

  for (const subject of SUBJECTS) {
    const modelDir = join(GENERATED_IMAGES_DIR, subject.slug, model.slug);
    const files = listFilesRecursive(modelDir);
    for (const filePath of files) {
      entries.push({
        sourcePath: filePath,
        zipPath: join(model.slug, subject.slug, relative(modelDir, filePath)),
        isImage: isImageFile(filePath),
      });
    }
  }

  return entries;
}

function collectThemeFiles(): ZipFileEntry[] {
  const entries: ZipFileEntry[] = [];

  for (const language of LANGUAGES) {
    const languageDir = join(V2_IMAGES_DIR, language.slug);
    for (const model of MODELS) {
      const modelDir = join(languageDir, model.slug);
      const files = listFilesRecursive(modelDir);
      for (const filePath of files) {
        entries.push({
          sourcePath: filePath,
          zipPath: join(language.slug, model.slug, relative(modelDir, filePath)),
          isImage: isImageFile(filePath),
        });
      }
    }
  }

  return entries;
}

function collectCompleteFiles(): ZipFileEntry[] {
  const entries: ZipFileEntry[] = [];

  const generatedFiles = listFilesRecursive(GENERATED_IMAGES_DIR);
  for (const filePath of generatedFiles) {
    entries.push({
      sourcePath: filePath,
      zipPath: join('generated', relative(GENERATED_IMAGES_DIR, filePath)),
      isImage: isImageFile(filePath),
    });
  }

  const v2Files = listFilesRecursive(V2_IMAGES_DIR);
  for (const filePath of v2Files) {
    entries.push({
      sourcePath: filePath,
      zipPath: join('v2', relative(V2_IMAGES_DIR, filePath)),
      isImage: isImageFile(filePath),
    });
  }

  if (!existsSync(METADATA_ALL_PATH)) {
    throw new Error(`metadata-all.json fehlt: ${METADATA_ALL_PATH}`);
  }

  entries.push({
    sourcePath: METADATA_ALL_PATH,
    zipPath: 'metadata-all.json',
    isImage: false,
  });

  return entries;
}

function countImages(entries: ZipFileEntry[]): number {
  return entries.reduce((count, entry) => count + (entry.isImage ? 1 : 0), 0);
}

function normalizeZipPath(pathValue: string): string {
  return pathValue.replace(/\\/g, '/');
}

async function writeZip(filename: string, entries: ZipFileEntry[]): Promise<number> {
  const outputPath = join(DOWNLOADS_DIR, filename);

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolvePromise());
    output.on('error', rejectPromise);

    archive.on('warning', error => {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.warn(`[build:downloads] Warnung: ${error.message}`);
        return;
      }
      rejectPromise(error);
    });
    archive.on('error', rejectPromise);

    archive.pipe(output);

    for (const entry of entries) {
      archive.file(entry.sourcePath, { name: normalizeZipPath(entry.zipPath) });
    }

    archive.append(LICENSE_TEXT, { name: 'LIZENZ.txt' });
    void archive.finalize();
  });

  return statSync(outputPath).size;
}

async function main(): Promise<void> {
  ensureDirectory(DOWNLOADS_DIR);
  writeFileSync(LICENSE_PATH, LICENSE_TEXT, 'utf-8');

  const manifestEntries: DownloadPackageManifestEntry[] = [];

  for (const subject of SUBJECTS) {
    const entries = collectSubjectFiles(subject);
    const filename = `KI-Blick_${subject.filenameLabel}.zip`;
    const sizeBytes = await writeZip(filename, entries);
    const imageCount = countImages(entries);

    manifestEntries.push({
      id: subject.slug,
      type: 'subject',
      filename,
      label: subject.label,
      description: '48 Bilder (3 Modelle) + 3 Kontaktblaetter',
      imageCount,
      sizeBytes,
    });
  }

  for (const model of MODELS) {
    const entries = collectModelFiles(model);
    const filename = `KI-Blick_${model.filenameLabel}_alle-Faecher.zip`;
    const sizeBytes = await writeZip(filename, entries);
    const imageCount = countImages(entries);

    manifestEntries.push({
      id: model.manifestId,
      type: 'model',
      filename,
      label: `${model.label} - alle Faecher`,
      description: '160 Bilder (10 Faecher) + 10 Kontaktblaetter',
      imageCount,
      sizeBytes,
    });
  }

  const themeEntries = collectThemeFiles();
  const themeFilename = 'KI-Blick_Brot-Serie_8-Sprachen.zip';
  const themeSizeBytes = await writeZip(themeFilename, themeEntries);
  manifestEntries.push({
    id: 'brot-serie',
    type: 'theme',
    filename: themeFilename,
    label: 'Brot-Serie (8 Sprachen)',
    description: '96 Bilder: Brot in 8 Sprachen x 3 Modelle',
    imageCount: countImages(themeEntries),
    sizeBytes: themeSizeBytes,
  });

  const completeEntries = collectCompleteFiles();
  const completeFilename = 'KI-Blick_Gesamtpaket.zip';
  const completeSizeBytes = await writeZip(completeFilename, completeEntries);
  manifestEntries.push({
    id: 'gesamtpaket',
    type: 'complete',
    filename: completeFilename,
    label: 'Gesamtpaket',
    description: 'Alle 606 Bilder + Kontaktblaetter + Metadaten',
    imageCount: countImages(completeEntries),
    sizeBytes: completeSizeBytes,
  });

  const manifest = {
    generated: new Date().toISOString(),
    packages: manifestEntries,
  };

  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');

  for (const entry of manifestEntries) {
    console.log(
      `[build:downloads] ${entry.filename} | ${entry.imageCount} Bilder | ${(entry.sizeBytes / (1024 * 1024)).toFixed(2)} MB`,
    );
  }
  console.log(`[build:downloads] Manifest geschrieben: ${MANIFEST_PATH}`);
}

main().catch(error => {
  console.error('[build:downloads] Fehler beim Erstellen der Download-Pakete.');
  console.error(error);
  process.exitCode = 1;
});
