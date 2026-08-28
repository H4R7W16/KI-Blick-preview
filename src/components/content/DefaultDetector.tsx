import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getV3ImagePath, getV3Series } from '../../data/v3Images';

interface Tag {
  label: string;
  correct: 'always' | 'never';
}

const TAGS: Tag[] = [
  { label: 'Laubbaum', correct: 'always' },
  { label: 'Grüne Wiese', correct: 'always' },
  { label: 'Sommer', correct: 'always' },
  { label: 'Einzeln stehend', correct: 'always' },
  { label: 'Europäische Landschaft', correct: 'always' },
  { label: 'Natürliches Licht', correct: 'always' },
  { label: 'Palme', correct: 'never' },
  { label: 'Nadelwald', correct: 'never' },
  { label: 'Herbstlaub', correct: 'never' },
  { label: 'Großstadt', correct: 'never' },
  { label: 'Schnee/Winter', correct: 'never' },
  { label: 'Wüste', correct: 'never' },
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function DefaultDetector() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();
  const series = getV3Series('flux2pro');

  const shuffledTags = useMemo(() => shuffleArray(TAGS), []);

  const [assignments, setAssignments] = useState<Record<string, 'always' | 'never' | null>>(
    () => Object.fromEntries(shuffledTags.map(t => [t.label, null])),
  );
  const [checked, setChecked] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const unassigned = shuffledTags.filter(t => assignments[t.label] === null);
  const alwaysTags = shuffledTags.filter(t => assignments[t.label] === 'always');
  const neverTags = shuffledTags.filter(t => assignments[t.label] === 'never');

  const allAssigned = unassigned.length === 0;

  const errors = useMemo(() => {
    if (!checked) return {};
    const result: Record<string, boolean> = {};
    for (const tag of TAGS) {
      if (assignments[tag.label] !== null && assignments[tag.label] !== tag.correct) {
        result[tag.label] = true;
      }
    }
    return result;
  }, [checked, assignments]);

  const allCorrect = checked && Object.keys(errors).length === 0;

  const handleTagClick = (label: string) => {
    if (checked) return;
    if (selectedTag === label) {
      setSelectedTag(null);
    } else {
      setSelectedTag(label);
    }
  };

  const handleColumnClick = (column: 'always' | 'never') => {
    if (checked || !selectedTag) return;
    setAssignments(prev => ({ ...prev, [selectedTag]: column }));
    setSelectedTag(null);
  };

  const handleRemoveTag = (label: string) => {
    if (checked) return;
    setAssignments(prev => ({ ...prev, [label]: null }));
  };

  const handleCheck = () => {
    setChecked(true);
  };

  const handleReset = () => {
    setAssignments(Object.fromEntries(shuffledTags.map(t => [t.label, null])));
    setChecked(false);
    setSelectedTag(null);
  };

  const renderTag = (label: string, removable: boolean) => {
    const isError = errors[label];
    const isSelected = selectedTag === label;
    return (
      <motion.button
        key={label}
        type="button"
        layout={!reduceMotion}
        onClick={() => (removable && !checked ? handleRemoveTag(label) : handleTagClick(label))}
        className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
        style={{
          borderColor: isError
            ? 'var(--color-error)'
            : isSelected
              ? areaColor
              : 'var(--color-border)',
          backgroundColor: isError
            ? 'color-mix(in srgb, var(--color-error) 15%, transparent)'
            : isSelected
              ? `color-mix(in srgb, ${areaColor} 15%, transparent)`
              : 'transparent',
          color: isError
            ? 'var(--color-error)'
            : 'var(--color-secondary)',
        }}
      >
        {label}
        {removable && !checked && <span className="ml-1 opacity-60">&times;</span>}
      </motion.button>
    );
  };

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      {/* Thumbnail gallery */}
      <div className="flex gap-1 overflow-x-auto pb-3 mb-5">
        {series.images.map(img => (
          <img
            key={img.index}
            src={getV3ImagePath('flux2pro', img.index)}
            alt={`Baum ${img.index + 1}`}
            loading="lazy"
            className="w-12 h-12 md:w-14 md:h-14 rounded object-cover flex-shrink-0 border border-[var(--color-border)]"
          />
        ))}
      </div>

      {/* Two columns */}
      <div className="grid md:grid-cols-2 gap-4 mb-5">
        {/* Always column */}
        <button
          type="button"
          onClick={() => handleColumnClick('always')}
          className="rounded-xl border-2 p-4 min-h-[120px] text-left transition-colors"
          style={{
            borderColor: selectedTag
              ? 'var(--color-success)'
              : 'color-mix(in srgb, var(--color-success) 40%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-success) 5%, transparent)',
            cursor: selectedTag && !checked ? 'pointer' : 'default',
          }}
        >
          <h4 className="text-sm font-semibold text-[var(--color-success)] mb-2">
            Immer da &#10003;
          </h4>
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence>
              {alwaysTags.map(t => renderTag(t.label, true))}
            </AnimatePresence>
          </div>
        </button>

        {/* Never column */}
        <button
          type="button"
          onClick={() => handleColumnClick('never')}
          className="rounded-xl border-2 p-4 min-h-[120px] text-left transition-colors"
          style={{
            borderColor: selectedTag
              ? 'var(--color-error)'
              : 'color-mix(in srgb, var(--color-error) 40%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-error) 5%, transparent)',
            cursor: selectedTag && !checked ? 'pointer' : 'default',
          }}
        >
          <h4 className="text-sm font-semibold text-[var(--color-error)] mb-2">
            Nie da &#10007;
          </h4>
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence>
              {neverTags.map(t => renderTag(t.label, true))}
            </AnimatePresence>
          </div>
        </button>
      </div>

      {/* Unassigned pool */}
      {unassigned.length > 0 && (
        <div className="mb-5">
          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mb-2">
            {selectedTag
              ? 'Klicke jetzt auf eine Spalte, um das Tag zuzuordnen.'
              : 'Klicke auf ein Tag und dann auf eine Spalte.'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {unassigned.map(t => renderTag(t.label, false))}
          </div>
        </div>
      )}

      {/* Actions */}
      {allAssigned && !checked && (
        <button
          type="button"
          onClick={handleCheck}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: areaColor }}
        >
          Auswertung prüfen
        </button>
      )}

      {/* Feedback */}
      {checked && (
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          {allCorrect ? (
            <div className="p-4 rounded-xl border border-[var(--color-success)] bg-[var(--color-success)]/10">
              <p className="text-sm text-[var(--color-success)] font-medium mb-2">Alles richtig!</p>
              <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed">
                Der &bdquo;statistische Default&ldquo; dieses Modells für &bdquo;Baum&ldquo; ist: ein
                europäischer Laubbaum, allein auf einer grünen Wiese, im Sommer. Alles in der rechten
                Spalte liegt außerhalb des gelernten Default – nicht weil es keine Palmen gibt, sondern
                weil sie im Trainingskontext von &bdquo;Baum&ldquo; unterrepräsentiert sind.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-[var(--color-error)] bg-[var(--color-error)]/10">
              <p className="text-sm text-[var(--color-error)] font-medium mb-2">
                Nicht ganz – die markierten Tags sind falsch zugeordnet.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs underline opacity-80 hover:opacity-100"
                style={{ color: areaColor }}
              >
                Nochmal versuchen
              </button>
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}
