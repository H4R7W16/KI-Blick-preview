import { useCallback, useEffect, useMemo, useState } from 'react';
import { IMAGE_SERIES } from '../data/imageMetadata';
import { resolveAssetPath } from '../utils/assetPath';

type SingleFieldKey =
  | 'gender'
  | 'hairColor'
  | 'skinTone'
  | 'age'
  | 'glasses'
  | 'clothing'
  | 'background';

interface ReviewAttributes {
  gender: string;
  hairColor: string;
  skinTone: string;
  age: string;
  glasses: string;
  clothing: string;
  utensils: string[];
  outfitTags?: string[];
  background: string;
}

interface ReviewImage {
  filename: string;
  index: number;
  reviewIndex: number;
  imageUrl: string;
  attributes: ReviewAttributes;
  /** Virtual series only: original series ID used for saving */
  originalSeriesId?: string;
  /** Virtual series only: descriptive label shown above the image */
  virtualLabel?: string;
}

interface ReviewSeriesSummary {
  id: string;
  subjectSlug: string;
  subjectFolder: string;
  modelId: string;
  modelFolder: string;
  modelLabel: string;
  count: number;
}

interface ReviewSeriesResponse {
  series: ReviewSeriesSummary[];
}

interface ReviewSeriesDetailResponse {
  series: ReviewSeriesSummary;
  metadata: {
    seriesId: string;
    prompt: string;
    model: string;
    modelId: string;
    count: number;
    images: ReviewImage[];
  };
}

const FIELD_OPTIONS: Array<{
  key: SingleFieldKey;
  label: string;
  options: string[];
}> = [
  { key: 'gender', label: 'Gender', options: ['female', 'male', 'ambiguous'] },
  { key: 'age', label: 'Age', options: ['20-29', '30-39', '40-49', '50-59', '60+', 'unclear'] },
  { key: 'hairColor', label: 'Hair color', options: ['black', 'brown', 'blond', 'red', 'gray', 'white', 'bald', 'covered', 'other', 'unclear'] },
  { key: 'skinTone', label: 'Skin tone', options: ['light', 'medium', 'dark', 'unclear'] },
  { key: 'glasses', label: 'Glasses', options: ['yes', 'no', 'unclear'] },
  { key: 'clothing', label: 'Clothing', options: ['formal-business', 'smart-casual', 'casual', 'sport', 'creative-workwear', 'traditional', 'labwear', 'unclear'] },
  {
    key: 'background',
    label: 'Background',
    options: [
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
    ],
  },
];

const UTENSIL_OPTIONS = [
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
];

const OUTFIT_TAG_OPTIONS = [
  'krawatte',
  'halstuch',
  'schuerze',
  'blazer',
  'jackett',
  'strickjacke',
  'hoodie',
  'rock',
  'sportshirt',
  'trainingshose',
];

const UTENSIL_OPTION_SET = new Set(UTENSIL_OPTIONS);
const OUTFIT_TAG_OPTION_SET = new Set(OUTFIT_TAG_OPTIONS);

// ─── Virtual series: all non-light skin tone images ──────────────────────────

const VIRTUAL_NON_LIGHT_ID = '__non-light__';

const VIRTUAL_SERIES_SUMMARY: ReviewSeriesSummary = {
  id: VIRTUAL_NON_LIGHT_ID,
  subjectSlug: 'alle',
  subjectFolder: '★ Alle Fächer – Nicht-hell Hautton',
  modelId: 'alle',
  modelFolder: 'alle',
  modelLabel: 'Alle Modelle',
  count: 0, // filled after build
};

function buildVirtualNonLightImages(): ReviewImage[] {
  return IMAGE_SERIES.flatMap(series =>
    series.images
      .filter(img => {
        const tone = img.attributes?.skinTone;
        return tone === 'medium' || tone === 'dark';
      })
      .map(img => {
        const attrs = img.attributes;
        return {
          filename: img.filename,
          index: img.index,
          reviewIndex: img.index - 1,
          imageUrl: resolveAssetPath(`${series.basePath}/${img.filename}`),
          attributes: {
            gender: attrs.gender ?? 'unclear',
            hairColor: attrs.hairColor ?? 'unclear',
            skinTone: attrs.skinTone ?? 'unclear',
            age: attrs.age ?? 'unclear',
            glasses: attrs.glasses ?? 'unclear',
            clothing: attrs.clothing ?? 'unclear',
            background: attrs.background ?? 'unclear',
            utensils: Array.isArray(attrs.utensils) && attrs.utensils.length > 0
              ? (attrs.utensils as string[])
              : ['none'],
            ...(Array.isArray(attrs.outfitTags) ? { outfitTags: attrs.outfitTags as string[] } : {}),
          },
          originalSeriesId: `${series.subjectSlug}__${series.modelId}`,
          virtualLabel: `${series.prompt} · ${series.model} · #${img.index}`,
        };
      }),
  );
}

function normalizeList(values: string[], allowedOptions: Set<string>): string[] {
  return [...new Set(values.filter(value => allowedOptions.has(value)))];
}

function normalizeOutfitTags(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) return [];
  return normalizeList(values, OUTFIT_TAG_OPTION_SET);
}

function cloneAttributes(attributes: ReviewAttributes): ReviewAttributes {
  const hasOutfitTags = Object.prototype.hasOwnProperty.call(attributes, 'outfitTags');
  return {
    ...attributes,
    utensils: normalizeUtensils(attributes.utensils),
    ...(hasOutfitTags ? { outfitTags: normalizeOutfitTags(attributes.outfitTags) } : {}),
  };
}

function normalizeUtensils(values: string[]): string[] {
  const deduped = normalizeList(values, UTENSIL_OPTION_SET);
  if (deduped.length === 0) return ['none'];
  if (deduped.includes('none') && deduped.length > 1) {
    return deduped.filter(value => value !== 'none');
  }
  return deduped;
}

function equalLists(left: string[], right: string[]): boolean {
  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();
  if (leftSorted.length !== rightSorted.length) return false;
  return leftSorted.every((value, index) => value === rightSorted[index]);
}

function attributesEqual(a: ReviewAttributes, b: ReviewAttributes): boolean {
  if (a.gender !== b.gender) return false;
  if (a.hairColor !== b.hairColor) return false;
  if (a.skinTone !== b.skinTone) return false;
  if (a.age !== b.age) return false;
  if (a.glasses !== b.glasses) return false;
  if (a.clothing !== b.clothing) return false;
  if (a.background !== b.background) return false;

  const aUtensils = normalizeUtensils(a.utensils);
  const bUtensils = normalizeUtensils(b.utensils);
  if (!equalLists(aUtensils, bUtensils)) return false;

  const aHasOutfitTags = Object.prototype.hasOwnProperty.call(a, 'outfitTags');
  const bHasOutfitTags = Object.prototype.hasOwnProperty.call(b, 'outfitTags');
  if (aHasOutfitTags !== bHasOutfitTags) return false;

  const aOutfitTags = normalizeOutfitTags(a.outfitTags);
  const bOutfitTags = normalizeOutfitTags(b.outfitTags);
  return equalLists(aOutfitTags, bOutfitTags);
}

export default function AttributeReviewPage() {
  const [seriesList, setSeriesList] = useState<ReviewSeriesSummary[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [seriesData, setSeriesData] = useState<ReviewSeriesDetailResponse | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [draftAttributes, setDraftAttributes] = useState<ReviewAttributes | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSeriesList() {
      setListLoading(true);
      setErrorMessage('');
      try {
        const response = await fetch('/api/review/series');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = (await response.json()) as ReviewSeriesResponse;
        if (cancelled) return;
        const apiSeries = payload.series ?? [];
        const virtualEntry = { ...VIRTUAL_SERIES_SUMMARY, count: buildVirtualNonLightImages().length };
        setSeriesList([virtualEntry, ...apiSeries]);
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
        setErrorMessage(`Serien konnten nicht geladen werden: ${message}`);
      } finally {
        if (!cancelled) setListLoading(false);
      }
    }

    void loadSeriesList();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (seriesList.length === 0) {
      setSelectedSeriesId('');
      return;
    }
    if (!selectedSeriesId || !seriesList.some(item => item.id === selectedSeriesId)) {
      setSelectedSeriesId(seriesList[0].id);
    }
  }, [seriesList, selectedSeriesId]);

  useEffect(() => {
    if (!selectedSeriesId) {
      setSeriesData(null);
      return;
    }

    // Virtual series: fetch live data from API so attributes reflect current metadata.json files
    if (selectedSeriesId === VIRTUAL_NON_LIGHT_ID) {
      let virtualCancelled = false;

      const loadVirtualSeries = async () => {
        setSeriesLoading(true);
        setErrorMessage('');
        setStatusMessage('');
        try {
          const apiIds = [...new Set(IMAGE_SERIES.map(s => `${s.subjectSlug}__${s.modelId}`))];
          const results = await Promise.allSettled(
            apiIds.map(id =>
              fetch(`/api/review/series/${encodeURIComponent(id)}`).then(
                r => r.json() as Promise<ReviewSeriesDetailResponse>,
              ),
            ),
          );

          if (virtualCancelled) return;

          const virtualImages: ReviewImage[] = [];
          results.forEach(result => {
            if (result.status !== 'fulfilled') return;
            const detail = result.value;
            if (!Array.isArray(detail.metadata?.images)) return;
            detail.metadata.images
              .filter(img => {
                const tone = img.attributes?.skinTone;
                return tone === 'medium' || tone === 'dark';
              })
              .forEach(img => {
                virtualImages.push({
                  ...img,
                  originalSeriesId: detail.series.id,
                  virtualLabel: `${detail.metadata.prompt} · ${detail.metadata.model} · #${img.index}`,
                });
              });
          });

          setSeriesData({
            series: { ...VIRTUAL_SERIES_SUMMARY, count: virtualImages.length },
            metadata: {
              seriesId: VIRTUAL_NON_LIGHT_ID,
              prompt: 'Alle Fächer – Nicht-hell Hautton',
              model: 'Alle Modelle',
              modelId: 'alle',
              count: virtualImages.length,
              images: virtualImages,
            },
          });
          setImageIndex(0);
        } catch (error) {
          if (virtualCancelled) return;
          const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
          setErrorMessage(`Virtuelle Serie konnte nicht geladen werden: ${message}`);
          setSeriesData(null);
        } finally {
          if (!virtualCancelled) setSeriesLoading(false);
        }
      };

      void loadVirtualSeries();
      return () => {
        virtualCancelled = true;
      };
    }

    let cancelled = false;

    async function loadSeries() {
      setSeriesLoading(true);
      setErrorMessage('');
      setStatusMessage('');
      try {
        const response = await fetch(`/api/review/series/${encodeURIComponent(selectedSeriesId)}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = (await response.json()) as ReviewSeriesDetailResponse;
        if (cancelled) return;
        setSeriesData(payload);
        setImageIndex(0);
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
        setErrorMessage(`Serie konnte nicht geladen werden: ${message}`);
        setSeriesData(null);
      } finally {
        if (!cancelled) setSeriesLoading(false);
      }
    }

    void loadSeries();
    return () => {
      cancelled = true;
    };
  }, [selectedSeriesId]);

  const currentImage = useMemo(() => {
    if (!seriesData) return null;
    return seriesData.metadata.images[imageIndex] ?? null;
  }, [seriesData, imageIndex]);

  useEffect(() => {
    if (!currentImage) {
      setDraftAttributes(null);
      return;
    }
    setDraftAttributes(cloneAttributes(currentImage.attributes));
  }, [currentImage]);

  const totalImages = seriesData?.metadata.images.length ?? 0;
  const hasPrevious = imageIndex > 0;
  const hasNext = imageIndex < totalImages - 1;

  const isDirty = useMemo(() => {
    if (!currentImage || !draftAttributes) return false;
    return !attributesEqual(draftAttributes, currentImage.attributes);
  }, [currentImage, draftAttributes]);

  const confirmDiscard = useCallback((): boolean => {
    if (!isDirty) return true;
    return window.confirm('Es gibt ungespeicherte Änderungen. Trotzdem wechseln?');
  }, [isDirty]);

  const goToImage = useCallback((nextIndex: number) => {
    if (!seriesData) return;
    const bounded = Math.max(0, Math.min(nextIndex, seriesData.metadata.images.length - 1));
    setImageIndex(bounded);
  }, [seriesData]);

  const handleSingleFieldChange = useCallback((field: SingleFieldKey, value: string) => {
    setDraftAttributes(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  }, []);

  const handleUtensilToggle = useCallback((utensil: string) => {
    setDraftAttributes(prev => {
      if (!prev) return prev;

      if (utensil === 'none') {
        return { ...prev, utensils: ['none'] };
      }

      const nextSet = new Set(prev.utensils);
      if (nextSet.has(utensil)) {
        nextSet.delete(utensil);
      } else {
        nextSet.add(utensil);
      }
      nextSet.delete('none');

      const nextUtensils = normalizeUtensils([...nextSet]);
      return { ...prev, utensils: nextUtensils };
    });
  }, []);

  const handleOutfitTagToggle = useCallback((outfitTag: string) => {
    setDraftAttributes(prev => {
      if (!prev) return prev;

      const nextSet = new Set(normalizeOutfitTags(prev.outfitTags));
      if (nextSet.has(outfitTag)) {
        nextSet.delete(outfitTag);
      } else {
        nextSet.add(outfitTag);
      }

      return { ...prev, outfitTags: normalizeOutfitTags([...nextSet]) };
    });
  }, []);

  const saveCurrent = useCallback(async (andNext: boolean) => {
    if (!seriesData || !currentImage || !draftAttributes) return;

    const hasOutfitTags = Object.prototype.hasOwnProperty.call(draftAttributes, 'outfitTags');
    const attributesForSave: ReviewAttributes = {
      ...draftAttributes,
      utensils: normalizeUtensils(draftAttributes.utensils),
      ...(hasOutfitTags ? { outfitTags: normalizeOutfitTags(draftAttributes.outfitTags) } : {}),
    };

    setSaving(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const seriesIdForSave = currentImage.originalSeriesId ?? seriesData.series.id;
      const response = await fetch(
        `/api/review/series/${encodeURIComponent(seriesIdForSave)}/images/${currentImage.reviewIndex}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attributes: attributesForSave }),
        },
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Unbekannter Fehler' })) as { error?: string };
        throw new Error(payload.error ?? `HTTP ${response.status}`);
      }

      setSeriesData(prev => {
        if (!prev) return prev;
        const nextImages = [...prev.metadata.images];
        nextImages[imageIndex] = {
          ...nextImages[imageIndex],
          attributes: cloneAttributes(attributesForSave),
        };
        return {
          ...prev,
          metadata: {
            ...prev.metadata,
            images: nextImages,
          },
        };
      });

      setStatusMessage('Gespeichert.');
      if (andNext && hasNext) {
        setImageIndex(prev => prev + 1);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setErrorMessage(`Speichern fehlgeschlagen: ${message}`);
    } finally {
      setSaving(false);
    }
  }, [currentImage, draftAttributes, hasNext, imageIndex, seriesData]);

  const resetDraft = useCallback(() => {
    if (!currentImage) return;
    setDraftAttributes(cloneAttributes(currentImage.attributes));
    setStatusMessage('Änderungen verworfen.');
  }, [currentImage]);

  const onSeriesChange = useCallback((nextSeriesId: string) => {
    if (!confirmDiscard()) return;
    setSelectedSeriesId(nextSeriesId);
  }, [confirmDiscard]);

  const onPrev = useCallback(() => {
    if (!hasPrevious) return;
    if (!confirmDiscard()) return;
    goToImage(imageIndex - 1);
  }, [confirmDiscard, goToImage, hasPrevious, imageIndex]);

  const onNext = useCallback(() => {
    if (!hasNext) return;
    if (!confirmDiscard()) return;
    goToImage(imageIndex + 1);
  }, [confirmDiscard, goToImage, hasNext, imageIndex]);

  const onJumpChange = useCallback((rawValue: string) => {
    if (!rawValue) return;
    const parsed = Number(rawValue);
    if (!Number.isInteger(parsed)) return;
    if (!confirmDiscard()) return;
    goToImage(parsed - 1);
  }, [confirmDiscard, goToImage]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold dark:text-[var(--color-primary)] text-slate-900">
          Attribut-Review
        </h1>
        <p className="mt-2 text-sm dark:text-[var(--color-secondary)] text-slate-600">
          Klickbare Felder für die manuelle Prüfung. Änderungen werden direkt in der jeweiligen
          <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 mx-1">metadata.json</code>
          gespeichert.
        </p>
      </div>

      <div className="p-4 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white">
        <label className="block text-xs font-medium uppercase tracking-wide dark:text-[var(--color-muted)] text-slate-500 mb-2">
          Serie
        </label>
        <select
          value={selectedSeriesId}
          onChange={event => onSeriesChange(event.target.value)}
          disabled={listLoading || seriesList.length === 0}
          className="w-full md:w-auto min-w-[320px] px-3 py-2 rounded-lg border border-[var(--color-border)] dark:bg-slate-900 dark:text-[var(--color-primary)] text-slate-900"
        >
          {seriesList.map(item => (
            <option key={item.id} value={item.id}>
              {item.subjectSlug} | {item.modelLabel} ({item.modelId}) | {item.count} Bilder
            </option>
          ))}
        </select>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg border border-[var(--color-error)]/40 bg-[var(--color-error)]/10 text-sm text-red-700 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {statusMessage && !errorMessage && (
        <div className="p-3 rounded-lg border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-sm text-emerald-700 dark:text-emerald-300">
          {statusMessage}
        </div>
      )}

      {(seriesLoading || listLoading) && (
        <div className="p-6 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white text-sm dark:text-[var(--color-secondary)] text-slate-600">
          Lade Daten...
        </div>
      )}

      {!seriesLoading && seriesData && currentImage && draftAttributes && (
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-6">
          <section className="p-4 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white space-y-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div>
                <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">
                  {currentImage.virtualLabel ?? `${seriesData.series.subjectFolder} | ${seriesData.series.modelLabel}`}
                </p>
                <p className="text-xs dark:text-[var(--color-muted)] text-slate-500">
                  Bild {imageIndex + 1} von {totalImages}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={!hasPrevious}
                  className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] disabled:opacity-40"
                >
                  Zurück
                </button>
                <input
                  type="number"
                  min={1}
                  max={totalImages}
                  value={totalImages > 0 ? imageIndex + 1 : 0}
                  onChange={event => onJumpChange(event.target.value)}
                  className="w-20 px-2 py-1.5 rounded-lg border border-[var(--color-border)] dark:bg-slate-900 dark:text-[var(--color-primary)] text-slate-900"
                />
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!hasNext}
                  className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] disabled:opacity-40"
                >
                  Weiter
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-slate-100 dark:bg-slate-900">
              <img
                src={currentImage.imageUrl}
                alt={`Review ${imageIndex + 1}`}
                className="w-full h-[420px] object-contain"
              />
            </div>

            <div className="text-xs dark:text-[var(--color-muted)] text-slate-500 break-all">
              {currentImage.filename}
            </div>
          </section>

          <section className="p-4 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900">
                Attribute
              </h2>
              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  isDirty
                    ? 'border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 text-amber-700 dark:text-amber-300'
                    : 'border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {isDirty ? 'Ungespeichert' : 'Synchron'}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {FIELD_OPTIONS.map(field => (
                <label key={field.key} className="block">
                  <span className="block text-xs font-medium uppercase tracking-wide dark:text-[var(--color-muted)] text-slate-500 mb-1.5">
                    {field.label}
                  </span>
                  <select
                    value={draftAttributes[field.key]}
                    onChange={event => handleSingleFieldChange(field.key, event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] dark:bg-slate-900 dark:text-[var(--color-primary)] text-slate-900"
                  >
                    {field.options.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide dark:text-[var(--color-muted)] text-slate-500 mb-2">
                Utensils
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {UTENSIL_OPTIONS.map(option => {
                  const checked = draftAttributes.utensils.includes(option);
                  return (
                    <label
                      key={option}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--color-border)]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleUtensilToggle(option)}
                        className="accent-[var(--color-area-entdecken)]"
                      />
                      <span className="text-sm dark:text-[var(--color-primary)] text-slate-900">{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide dark:text-[var(--color-muted)] text-slate-500 mb-2">
                Outfit Tags
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {OUTFIT_TAG_OPTIONS.map(option => {
                  const checked = Array.isArray(draftAttributes.outfitTags) && draftAttributes.outfitTags.includes(option);
                  return (
                    <label
                      key={option}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--color-border)]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleOutfitTagToggle(option)}
                        className="accent-[var(--color-area-entdecken)]"
                      />
                      <span className="text-sm dark:text-[var(--color-primary)] text-slate-900">{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => void saveCurrent(false)}
                disabled={!isDirty || saving}
                className="px-4 py-2 rounded-lg bg-[var(--color-area-entdecken)] text-white disabled:opacity-40"
              >
                Speichern
              </button>
              <button
                type="button"
                onClick={() => void saveCurrent(true)}
                disabled={!isDirty || saving || !hasNext}
                className="px-4 py-2 rounded-lg border border-[var(--color-area-entdecken)] text-[var(--color-area-entdecken)] disabled:opacity-40"
              >
                Speichern & Weiter
              </button>
              <button
                type="button"
                onClick={resetDraft}
                disabled={!isDirty || saving}
                className="px-4 py-2 rounded-lg border border-[var(--color-border)] disabled:opacity-40"
              >
                Zurücksetzen
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
