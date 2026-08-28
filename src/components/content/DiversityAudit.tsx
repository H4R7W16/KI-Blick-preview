import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import {
  getAlternativeSeriesAllModels,
  getE5ModelIds,
  getE5ModelLabel,
  type E5ModelId,
} from '../../data/einordnenImages';
import { resolveAssetPath } from '../../utils/assetPath';
import Lightbox from '../features/Lightbox';

const SLUG = 'diverse-mathematiklehrkraefte';

interface Dimension {
  id: string;
  label: string;
}

const DIMENSIONS: Dimension[] = [
  { id: 'skin', label: 'Verschiedene Hauttöne' },
  { id: 'age', label: 'Verschiedene Altersgruppen' },
  { id: 'gender', label: 'Verschiedene Geschlechter' },
  { id: 'disability', label: 'Menschen mit Behinderung' },
  { id: 'religion', label: 'Religiöse Zeichen (Hijab, Kippa, Turban…)' },
  { id: 'queer', label: 'Queere Codes (Haare, Kleidung, Accessoires)' },
];

const MIN_REQUIRED = 4;
const IMAGE_OPTIONS = [0, 1, 2, 3] as const;

const REFERENCE_AUDIT: Record<string, Record<E5ModelId, boolean>> = {
  skin: { flux2pro: true, 'gpt-image-1-5': true, nanobana: true, 'gemini-image-2': true },
  age: { flux2pro: true, 'gpt-image-1-5': true, nanobana: true, 'gemini-image-2': true },
  gender: { flux2pro: true, 'gpt-image-1-5': true, nanobana: true, 'gemini-image-2': true },
  disability: { flux2pro: false, 'gpt-image-1-5': false, nanobana: false, 'gemini-image-2': true },
  religion: { flux2pro: false, 'gpt-image-1-5': true, nanobana: false, 'gemini-image-2': true },
  queer: { flux2pro: false, 'gpt-image-1-5': false, nanobana: false, 'gemini-image-2': true },
};

type Phase = 'view' | 'audit' | 'result';

function emptyChecks(): Record<string, Record<E5ModelId, boolean>> {
  const checks: Record<string, Record<E5ModelId, boolean>> = {};
  for (const d of DIMENSIONS) {
    checks[d.id] = {} as Record<E5ModelId, boolean>;
    for (const m of getE5ModelIds()) {
      checks[d.id][m] = false;
    }
  }
  return checks;
}

export default function DiversityAudit() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();

  const [phase, setPhase] = useState<Phase>('view');
  const [userChecks, setUserChecks] = useState(emptyChecks);
  const [lightboxModelId, setLightboxModelId] = useState<E5ModelId | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<Record<E5ModelId, number>>(
    () => {
      const indices = {} as Record<E5ModelId, number>;
      for (const m of getE5ModelIds()) indices[m] = 0;
      return indices;
    },
  );

  const modelIds = getE5ModelIds();

  const allSeries = useMemo(() => getAlternativeSeriesAllModels(SLUG), []);
  const lightboxSeries = lightboxModelId ? allSeries[lightboxModelId] : null;

  const filledCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < MIN_REQUIRED; i++) {
      const dim = DIMENSIONS[i];
      const row = userChecks[dim.id];
      if (modelIds.some(m => row[m])) count++;
    }
    return count;
  }, [userChecks, modelIds]);

  const toggleCheck = (dimId: string, modelId: E5ModelId) => {
    setUserChecks(prev => ({
      ...prev,
      [dimId]: { ...prev[dimId], [modelId]: !prev[dimId][modelId] },
    }));
  };

  const openLightbox = (modelId: E5ModelId, index: number) => {
    setLightboxModelId(modelId);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxModelId(null);
  };

  const handleLightboxNavigate = (index: number) => {
    if (!lightboxModelId) return;
    setLightboxIndex(index);
    setSelectedIndices(prev => ({ ...prev, [lightboxModelId]: index }));
  };

  const setSelectedImage = (modelId: E5ModelId, index: number) => {
    setSelectedIndices(prev => ({ ...prev, [modelId]: index }));
  };

  const renderModelSelector = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {modelIds.map(modelId => {
        const series = allSeries[modelId];
        const idx = selectedIndices[modelId];
        const img = series.images[idx];
        const src = img ? resolveAssetPath(`${img.basePath}/${img.filename}`) : '';

        return (
          <div key={modelId} className="space-y-1.5">
            <p className="text-xs font-semibold dark:text-[var(--color-primary)] text-slate-900 text-center truncate">
              {getE5ModelLabel(modelId)}
            </p>
            <button
              type="button"
              onClick={() => openLightbox(modelId, idx)}
              className="w-full aspect-square rounded-lg overflow-hidden border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border)]"
              aria-label={`${getE5ModelLabel(modelId)} Bild ${idx + 1} vergroessert anzeigen`}
            >
              <img
                src={src}
                alt={`${getE5ModelLabel(modelId)} – Bild ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
            <div className="flex justify-center gap-1">
              {IMAGE_OPTIONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(modelId, i)}
                  className="w-5 h-5 rounded border text-[10px] font-medium transition-colors"
                  style={
                    idx === i
                      ? { backgroundColor: areaColor, borderColor: areaColor, color: '#fff' }
                      : { borderColor: 'var(--color-border)', color: 'var(--color-muted)' }
                  }
                  aria-label={`${getE5ModelLabel(modelId)} Bild ${i + 1} auswaehlen`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ─── Phase: View ───────────────────────────────────────────────────

  if (phase === 'view') {
    return (
      <>
        <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
            Alle vier Modelle haben denselben Prompt erhalten: "Eine diverse Gruppe von Mathematiklehrkraeften verschiedenen Alters und Geschlechts". Schau dir die Ergebnisse genau an.
          </p>

          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mb-3">
            Bild antippen: vergroessern, dann in der Ansicht zwischen den vier Bildern wischen.
          </p>

          {renderModelSelector()}

          <div className="text-center">
            <button
              type="button"
              onClick={() => setPhase('audit')}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: areaColor }}
            >
              Audit starten
            </button>
          </div>
        </section>

        <Lightbox
          images={lightboxSeries?.images ?? []}
          basePath={lightboxSeries?.images[0]?.basePath ?? ''}
          subjectSlug={SLUG}
          currentIndex={lightboxIndex}
          isOpen={lightboxSeries !== null}
          onClose={closeLightbox}
          onNavigate={handleLightboxNavigate}
        />
      </>
    );
  }

  if (phase === 'audit') {
    return (
      <>
      <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
          Prüfe für jede Dimension: Zeigt das Modell diese Art von Vielfalt?
        </p>

        <div className="rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50 p-3 md:p-4 mb-4">
          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mb-3">
            Wähle pro Modell ein Bild (1-4). Bild antippen für Zoom; in der Ansicht kannst du zwischen den vier Bildern wischen.
          </p>
          {renderModelSelector()}
        </div>

        {/* Desktop: Table */}
        <div className="hidden md:block overflow-x-auto mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-2 dark:text-[var(--color-muted)] text-slate-500 font-medium">
                  Dimension
                </th>
                {modelIds.map(m => (
                  <th key={m} className="p-2 text-center dark:text-[var(--color-primary)] text-slate-900 font-medium">
                    {getE5ModelLabel(m)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((dim, i) => (
                <tr
                  key={dim.id}
                  className="border-t border-[var(--color-border)]"
                  style={i < MIN_REQUIRED ? undefined : { opacity: 0.7 }}
                >
                  <td className="p-2 dark:text-[var(--color-secondary)] text-slate-600">
                    {dim.label}
                    {i < MIN_REQUIRED && <span className="text-[var(--color-error)] ml-0.5">*</span>}
                  </td>
                  {modelIds.map(m => (
                    <td key={m} className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => toggleCheck(dim.id, m)}
                        className="w-6 h-6 rounded border text-sm leading-none transition-colors"
                        style={
                          userChecks[dim.id][m]
                            ? { backgroundColor: areaColor, borderColor: areaColor, color: '#fff' }
                            : { borderColor: 'var(--color-border)', color: 'var(--color-muted)' }
                        }
                      >
                        {userChecks[dim.id][m] ? '✓' : ''}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: Cards per model */}
        <div className="md:hidden space-y-3 mb-4">
          {modelIds.map(m => (
            <div key={m} className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="text-xs font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-2">
                {getE5ModelLabel(m)}
              </p>
              {DIMENSIONS.map((dim, i) => (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() => toggleCheck(dim.id, m)}
                  className="w-full flex items-center gap-2 py-1.5 text-left"
                  style={i < MIN_REQUIRED ? undefined : { opacity: 0.7 }}
                >
                  <span
                    className="w-5 h-5 rounded border text-xs flex items-center justify-center flex-shrink-0 transition-colors"
                    style={
                      userChecks[dim.id][m]
                        ? { backgroundColor: areaColor, borderColor: areaColor, color: '#fff' }
                        : { borderColor: 'var(--color-border)', color: 'var(--color-muted)' }
                    }
                  >
                    {userChecks[dim.id][m] ? '✓' : ''}
                  </span>
                  <span className="text-xs dark:text-[var(--color-secondary)] text-slate-600">
                    {dim.label}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>

        <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mb-3">
          * Pflichtfelder ({filledCount}/{MIN_REQUIRED} ausgefüllt)
        </p>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setPhase('result')}
            disabled={filledCount < MIN_REQUIRED}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: areaColor }}
          >
            Auswertung anzeigen
          </button>
        </div>
      </section>

        <Lightbox
          images={lightboxSeries?.images ?? []}
          basePath={lightboxSeries?.images[0]?.basePath ?? ''}
          subjectSlug={SLUG}
          currentIndex={lightboxIndex}
          isOpen={lightboxSeries !== null}
          onClose={closeLightbox}
          onNavigate={handleLightboxNavigate}
        />
      </>
    );
  }

  // ─── Phase: Result ─────────────────────────────────────────────────

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Result table (desktop) */}
        <div className="hidden md:block overflow-x-auto mb-5">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-2 dark:text-[var(--color-muted)] text-slate-500 font-medium">
                  Dimension
                </th>
                {modelIds.map(m => (
                  <th key={m} className="p-2 text-center dark:text-[var(--color-primary)] text-slate-900 font-medium" colSpan={1}>
                    {getE5ModelLabel(m)}
                  </th>
                ))}
              </tr>
              <tr className="text-[10px] dark:text-[var(--color-muted)] text-slate-500">
                <th />
                {modelIds.map(m => (
                  <th key={m} className="pb-1">
                    <span className="inline-flex gap-2 justify-center w-full">
                      <span>Du</span>
                      <span>Ref</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map(dim => (
                <tr key={dim.id} className="border-t border-[var(--color-border)]">
                  <td className="p-2 dark:text-[var(--color-secondary)] text-slate-600">
                    {dim.label}
                  </td>
                  {modelIds.map(m => {
                    const user = userChecks[dim.id][m];
                    const ref = REFERENCE_AUDIT[dim.id][m];
                    return (
                      <td key={m} className="p-2 text-center">
                        <span className="inline-flex gap-2 justify-center">
                          <span style={{ color: user ? 'var(--color-success)' : 'var(--color-error)' }}>
                            {user ? '✓' : '✗'}
                          </span>
                          <span style={{ color: ref ? 'var(--color-success)' : 'var(--color-error)' }}>
                            {ref ? '✓' : '✗'}
                          </span>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Result cards (mobile) */}
        <div className="md:hidden space-y-3 mb-5">
          {modelIds.map(m => (
            <div key={m} className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="text-xs font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-2">
                {getE5ModelLabel(m)}
              </p>
              {DIMENSIONS.map(dim => {
                const user = userChecks[dim.id][m];
                const ref = REFERENCE_AUDIT[dim.id][m];
                return (
                  <div key={dim.id} className="flex items-center gap-2 py-1 text-xs">
                    <span className="inline-flex gap-1 w-10 flex-shrink-0">
                      <span style={{ color: user ? 'var(--color-success)' : 'var(--color-error)' }}>
                        {user ? '✓' : '✗'}
                      </span>
                      <span style={{ color: ref ? 'var(--color-success)' : 'var(--color-error)' }}>
                        {ref ? '✓' : '✗'}
                      </span>
                    </span>
                    <span className="dark:text-[var(--color-secondary)] text-slate-600">{dim.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Highlight box */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            backgroundColor: `color-mix(in srgb, ${areaColor} 8%, transparent)`,
            borderLeft: `3px solid ${areaColor}`,
          }}
        >
          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed">
            Die drei ersten Zeilen sind bei allen Modellen grün. Aber ab Zeile 4 wird es dünn: Nur ein einziges Modell zeigt Menschen mit Behinderung. Für die meisten KI-Modelle bedeutet „divers" = verschiedene Hauttöne. Das ist eine sehr enge Definition von Vielfalt.
          </p>
        </div>

        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed mb-4">
          Wenn du „divers" in den Prompt schreibst, entscheidet das Modell, was das bedeutet. Und diese Entscheidung spiegelt die Trainingsdaten: In Stock-Foto-Datenbanken sind Menschen mit Behinderung massiv unterrepräsentiert. Was nicht in den Daten ist, kann die KI nicht zeigen – selbst wenn du explizit danach fragst.
        </p>

        <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 italic">
          Die meisten Behinderungen sind unsichtbar und können in einer Bildanalyse nicht erfasst werden. Dieses Audit bezieht sich nur auf sichtbare Merkmale.
        </p>
      </motion.div>
    </section>
  );
}


