import { useEffect, useMemo, useState } from 'react';
import {
  DOWNLOAD_GROUPS,
  FALLBACK_DOWNLOAD_PACKAGES,
  mergePackagesWithManifest,
  type DownloadPackage,
} from '../../data/downloadPackages';

interface DownloadsManifestResponse {
  generated: string;
  packages: Array<{
    id: string;
    type: 'subject' | 'model' | 'theme' | 'complete';
    filename: string;
    label: string;
    description: string;
    imageCount: number;
    sizeBytes: number;
  }>;
}

function formatFileSize(sizeBytes: number): string {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return '-';
  }

  const units = ['Bytes', 'KB', 'MB', 'GB'];
  let value = sizeBytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  if (unitIndex === 0) {
    return `${value.toFixed(0)} ${units[unitIndex]}`;
  }

  return `${new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)} ${units[unitIndex]}`;
}

function getDownloadUrl(filename: string): string {
  return `${import.meta.env.BASE_URL}downloads/${filename}`;
}

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 text-[var(--color-accent)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export default function ImageDownloads() {
  const [packages, setPackages] = useState<DownloadPackage[]>(FALLBACK_DOWNLOAD_PACKAGES);
  const [manifestGenerated, setManifestGenerated] = useState<string | null>(null);
  const [manifestAvailable, setManifestAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadManifest = async () => {
      try {
        const manifestUrl = `${import.meta.env.BASE_URL}downloads/manifest.json`;
        const response = await fetch(manifestUrl, { cache: 'no-store' });
        if (!response.ok) {
          return;
        }

        const manifest = (await response.json()) as DownloadsManifestResponse;
        if (!manifest || !Array.isArray(manifest.packages)) {
          return;
        }

        if (!cancelled) {
          setPackages(mergePackagesWithManifest(manifest.packages));
          setManifestGenerated(manifest.generated ?? null);
          setManifestAvailable(true);
        }
      } catch {
        // Fallback-Daten bleiben aktiv.
      }
    };

    void loadManifest();
    return () => {
      cancelled = true;
    };
  }, []);

  const groupedPackages = useMemo(() => {
    return DOWNLOAD_GROUPS.map(group => ({
      ...group,
      packages: packages.filter(downloadPackage => downloadPackage.type === group.id),
    }));
  }, [packages]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50 p-4">
        <p className="text-sm leading-relaxed dark:text-[var(--color-secondary)] text-slate-600">
          Alle Pakete stehen unter CC BY-SA 4.0 zur freien Weiterverwendung bereit.
        </p>
        <p className="text-xs mt-2 dark:text-[var(--color-muted)] text-slate-500">
          Alle Downloads enthalten eine <code>LIZENZ.txt</code> mit Attributionshinweis.
          {manifestAvailable && manifestGenerated && ` Stand: ${new Date(manifestGenerated).toLocaleString('de-DE')}.`}
        </p>
      </div>

      {groupedPackages.map(group => (
        <section key={group.id} className="space-y-3">
          <h3 className="text-sm md:text-base font-semibold dark:text-[var(--color-primary)] text-slate-900">
            {group.title}
          </h3>

          <div className={group.compact ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'}>
            {group.packages.map(downloadPackage => {
              const sizeLabel = typeof downloadPackage.sizeBytes === 'number'
                ? formatFileSize(downloadPackage.sizeBytes)
                : downloadPackage.approxSizeLabel;

              return (
                <a
                  key={downloadPackage.id}
                  href={getDownloadUrl(downloadPackage.filename)}
                  download
                  className="group rounded-xl border border-[var(--color-border)] p-3 md:p-4 dark:bg-[var(--color-card)] bg-white transition-colors hover:border-[var(--color-accent)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm md:text-base font-semibold dark:text-[var(--color-primary)] text-slate-900">
                        {downloadPackage.label}
                      </p>
                      <p className="text-xs md:text-sm dark:text-[var(--color-secondary)] text-slate-600">
                        {downloadPackage.description}
                      </p>
                    </div>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] group-hover:border-[var(--color-accent)]">
                      <DownloadIcon />
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs dark:text-[var(--color-muted)] text-slate-500">
                    <span>{downloadPackage.imageCount} Bilder</span>
                    <span className="h-1 w-1 rounded-full bg-current opacity-60" />
                    <span>{sizeLabel}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
