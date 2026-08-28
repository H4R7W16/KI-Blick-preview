export type DownloadPackageType = 'subject' | 'model' | 'theme' | 'complete';

export interface DownloadPackage {
  id: string;
  type: DownloadPackageType;
  filename: string;
  label: string;
  description: string;
  imageCount: number;
  sizeBytes?: number;
  approxSizeLabel: string;
}

export interface DownloadGroup {
  id: DownloadPackageType;
  title: string;
  compact?: boolean;
}

export const DOWNLOAD_GROUPS: DownloadGroup[] = [
  { id: 'subject', title: 'Nach Fach', compact: true },
  { id: 'model', title: 'Nach Modell' },
  { id: 'theme', title: 'Thematisch' },
  { id: 'complete', title: 'Gesamtpaket' },
];

export const FALLBACK_DOWNLOAD_PACKAGES: DownloadPackage[] = [
  {
    id: 'mathematiklehrkraft',
    type: 'subject',
    filename: 'KI-Blick_Mathematiklehrkraft.zip',
    label: 'Mathematiklehrkraft',
    description: '48 Bilder (3 Modelle) + 3 Kontaktblaetter',
    imageCount: 51,
    approxSizeLabel: '~5 MB',
  },
  {
    id: 'deutschlehrkraft',
    type: 'subject',
    filename: 'KI-Blick_Deutschlehrkraft.zip',
    label: 'Deutschlehrkraft',
    description: '48 Bilder (3 Modelle) + 3 Kontaktblaetter',
    imageCount: 51,
    approxSizeLabel: '~5 MB',
  },
  {
    id: 'physiklehrkraft',
    type: 'subject',
    filename: 'KI-Blick_Physiklehrkraft.zip',
    label: 'Physiklehrkraft',
    description: '48 Bilder (3 Modelle) + 3 Kontaktblaetter',
    imageCount: 51,
    approxSizeLabel: '~6 MB',
  },
  {
    id: 'informatiklehrkraft',
    type: 'subject',
    filename: 'KI-Blick_Informatiklehrkraft.zip',
    label: 'Informatiklehrkraft',
    description: '48 Bilder (3 Modelle) + 3 Kontaktblaetter',
    imageCount: 51,
    approxSizeLabel: '~6 MB',
  },
  {
    id: 'sportlehrkraft',
    type: 'subject',
    filename: 'KI-Blick_Sportlehrkraft.zip',
    label: 'Sportlehrkraft',
    description: '48 Bilder (3 Modelle) + 3 Kontaktblaetter',
    imageCount: 51,
    approxSizeLabel: '~6 MB',
  },
  {
    id: 'kunstlehrkraft',
    type: 'subject',
    filename: 'KI-Blick_Kunstlehrkraft.zip',
    label: 'Kunstlehrkraft',
    description: '48 Bilder (3 Modelle) + 3 Kontaktblaetter',
    imageCount: 51,
    approxSizeLabel: '~8 MB',
  },
  {
    id: 'musiklehrkraft',
    type: 'subject',
    filename: 'KI-Blick_Musiklehrkraft.zip',
    label: 'Musiklehrkraft',
    description: '48 Bilder (3 Modelle) + 3 Kontaktblaetter',
    imageCount: 51,
    approxSizeLabel: '~6 MB',
  },
  {
    id: 'englischlehrkraft',
    type: 'subject',
    filename: 'KI-Blick_Englischlehrkraft.zip',
    label: 'Englischlehrkraft',
    description: '48 Bilder (3 Modelle) + 3 Kontaktblaetter',
    imageCount: 51,
    approxSizeLabel: '~5 MB',
  },
  {
    id: 'franzoesischlehrkraft',
    type: 'subject',
    filename: 'KI-Blick_Franzoesischlehrkraft.zip',
    label: 'Franzoesischlehrkraft',
    description: '48 Bilder (3 Modelle) + 3 Kontaktblaetter',
    imageCount: 51,
    approxSizeLabel: '~5 MB',
  },
  {
    id: 'lateinlehrkraft',
    type: 'subject',
    filename: 'KI-Blick_Lateinlehrkraft.zip',
    label: 'Lateinlehrkraft',
    description: '48 Bilder (3 Modelle) + 3 Kontaktblaetter',
    imageCount: 51,
    approxSizeLabel: '~7 MB',
  },
  {
    id: 'flux2pro-alle',
    type: 'model',
    filename: 'KI-Blick_FLUX2-PRO_alle-Faecher.zip',
    label: 'FLUX2 PRO - alle Faecher',
    description: '160 Bilder (10 Faecher) + 10 Kontaktblaetter',
    imageCount: 170,
    approxSizeLabel: '~20 MB',
  },
  {
    id: 'gpt-image-1-5-alle',
    type: 'model',
    filename: 'KI-Blick_GPT-Image-1-5_alle-Faecher.zip',
    label: 'GPT Image-1.5 - alle Faecher',
    description: '160 Bilder (10 Faecher) + 10 Kontaktblaetter',
    imageCount: 170,
    approxSizeLabel: '~20 MB',
  },
  {
    id: 'nanobana-alle',
    type: 'model',
    filename: 'KI-Blick_Nano-Bana_alle-Faecher.zip',
    label: 'Nano Bana - alle Faecher',
    description: '160 Bilder (10 Faecher) + 10 Kontaktblaetter',
    imageCount: 170,
    approxSizeLabel: '~20 MB',
  },
  {
    id: 'brot-serie',
    type: 'theme',
    filename: 'KI-Blick_Brot-Serie_8-Sprachen.zip',
    label: 'Brot-Serie (8 Sprachen)',
    description: '96 Bilder: Brot in 8 Sprachen x 3 Modelle',
    imageCount: 96,
    approxSizeLabel: '~19 MB',
  },
  {
    id: 'gesamtpaket',
    type: 'complete',
    filename: 'KI-Blick_Gesamtpaket.zip',
    label: 'Gesamtpaket',
    description: 'Alle 606 Bilder + Kontaktblaetter + Metadaten',
    imageCount: 606,
    approxSizeLabel: '~80 MB',
  },
];

const PACKAGE_ORDER = FALLBACK_DOWNLOAD_PACKAGES.map(downloadPackage => downloadPackage.id);
const PACKAGE_INDEX = new Map(PACKAGE_ORDER.map((id, index) => [id, index]));

export function mergePackagesWithManifest(
  manifestPackages: Array<Omit<DownloadPackage, 'approxSizeLabel'> & { sizeBytes: number }>,
): DownloadPackage[] {
  const fallbackById = new Map(FALLBACK_DOWNLOAD_PACKAGES.map(downloadPackage => [downloadPackage.id, downloadPackage]));

  const merged: DownloadPackage[] = manifestPackages.map(manifestPackage => {
    const fallback = fallbackById.get(manifestPackage.id);
    return {
      ...fallback,
      ...manifestPackage,
      approxSizeLabel: fallback?.approxSizeLabel ?? '',
    };
  });

  for (const fallbackPackage of FALLBACK_DOWNLOAD_PACKAGES) {
    if (!merged.some(mergedPackage => mergedPackage.id === fallbackPackage.id)) {
      merged.push(fallbackPackage);
    }
  }

  merged.sort((left, right) => {
    const leftOrder = PACKAGE_INDEX.get(left.id) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = PACKAGE_INDEX.get(right.id) ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder;
  });

  return merged;
}
