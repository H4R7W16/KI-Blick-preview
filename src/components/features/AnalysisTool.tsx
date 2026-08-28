import { useEffect, useMemo, useState } from 'react';
import type { ImageData, TeacherAttributes, TeacherOutfitTag } from '../../types/image.types';
import { getTeacherAttributes, getTeacherOutfitTags, TEACHER_CATEGORY_LABELS } from '../../utils/teacherAttributes';

type HairGroup = 'blond' | 'dark' | 'red' | 'gray-white' | 'covered' | 'bald' | 'unclear';

const HAIR_GROUP_LABELS: Record<HairGroup, string> = {
  blond: 'blond',
  dark: 'dunkel (braun/schwarz)',
  red: 'rot',
  'gray-white': 'grau/weiss',
  covered: 'bedeckt',
  bald: 'glatze',
  unclear: 'unklar',
};

function hairGroupFromColor(color: TeacherAttributes['hairColor']): HairGroup {
  if (color === 'blond') return 'blond';
  if (color === 'black' || color === 'brown') return 'dark';
  if (color === 'red') return 'red';
  if (color === 'gray' || color === 'white') return 'gray-white';
  if (color === 'covered') return 'covered';
  if (color === 'bald') return 'bald';
  return 'unclear';
}

interface TeacherFacts extends TeacherAttributes {
  hairGroup: HairGroup;
  outfitTags: TeacherOutfitTag[];
}

type FilterKey =
  keyof Pick<
    TeacherFacts,
    'gender' | 'hairGroup' | 'age' | 'skinTone' | 'glasses' | 'outfitTags'
  >;

interface FilterOption {
  key: FilterKey;
  label: string;
  values: { value: string; label: string }[];
}

const FILTERS: FilterOption[] = [
  {
    key: 'gender',
    label: 'Geschlecht',
    values: [
      { value: 'female', label: TEACHER_CATEGORY_LABELS.gender.female },
      { value: 'male', label: TEACHER_CATEGORY_LABELS.gender.male },
      { value: 'ambiguous', label: TEACHER_CATEGORY_LABELS.gender.ambiguous },
    ],
  },
  {
    key: 'hairGroup',
    label: 'Haarfarbe (grob)',
    values: [
      { value: 'blond', label: HAIR_GROUP_LABELS.blond },
      { value: 'dark', label: HAIR_GROUP_LABELS.dark },
      { value: 'red', label: HAIR_GROUP_LABELS.red },
      { value: 'gray-white', label: HAIR_GROUP_LABELS['gray-white'] },
      { value: 'covered', label: HAIR_GROUP_LABELS.covered },
      { value: 'bald', label: HAIR_GROUP_LABELS.bald },
      { value: 'unclear', label: HAIR_GROUP_LABELS.unclear },
    ],
  },
  {
    key: 'age',
    label: 'Alter',
    values: [
      { value: '20-29', label: '20-29' },
      { value: '30-39', label: '30-39' },
      { value: '40-49', label: '40-49' },
      { value: '50-59', label: '50-59' },
      { value: '60+', label: '60+' },
      { value: 'unclear', label: 'unklar' },
    ],
  },
  {
    key: 'skinTone',
    label: 'Hautfarbe',
    values: [
      { value: 'light', label: 'hell' },
      { value: 'medium', label: 'mittel' },
      { value: 'dark', label: 'dunkel' },
      { value: 'unclear', label: 'unklar' },
    ],
  },
  {
    key: 'glasses',
    label: 'Brille',
    values: [
      { value: 'yes', label: 'ja' },
      { value: 'no', label: 'nein' },
      { value: 'unclear', label: 'unklar' },
    ],
  },
  {
    key: 'outfitTags',
    label: 'Outfit/Accessoires',
    values: [
      { value: 'krawatte', label: TEACHER_CATEGORY_LABELS.outfitTags.krawatte },
      { value: 'halstuch', label: TEACHER_CATEGORY_LABELS.outfitTags.halstuch },
      { value: 'schuerze', label: TEACHER_CATEGORY_LABELS.outfitTags.schuerze },
      { value: 'blazer', label: TEACHER_CATEGORY_LABELS.outfitTags.blazer },
      { value: 'jackett', label: TEACHER_CATEGORY_LABELS.outfitTags.jackett },
      { value: 'strickjacke', label: TEACHER_CATEGORY_LABELS.outfitTags.strickjacke },
      { value: 'hoodie', label: TEACHER_CATEGORY_LABELS.outfitTags.hoodie },
      { value: 'rock', label: TEACHER_CATEGORY_LABELS.outfitTags.rock },
      { value: 'sportshirt', label: TEACHER_CATEGORY_LABELS.outfitTags.sportshirt },
      { value: 'trainingshose', label: TEACHER_CATEGORY_LABELS.outfitTags.trainingshose },
    ],
  },
];

interface AnalysisToolProps {
  images: ImageData[];
  subjectSlug: string;
  isActive: boolean;
  onToggle: () => void;
  onFilteredIndices: (indices: Set<number> | null) => void;
}

export default function AnalysisTool({
  images,
  subjectSlug,
  isActive,
  onToggle,
  onFilteredIndices,
}: AnalysisToolProps) {
  const [activeFilter, setActiveFilter] = useState<{ key: FilterKey; value: string } | null>(null);

  const imageFacts = useMemo(
    () =>
      images.map(img => {
        const attrs = getTeacherAttributes(img.attributes);
        return {
          ...attrs,
          hairGroup: hairGroupFromColor(attrs.hairColor),
          outfitTags: getTeacherOutfitTags(subjectSlug, attrs),
        } satisfies TeacherFacts;
      }),
    [images, subjectSlug],
  );

  const availableFilters = useMemo(() => {
    const valuesByKey: Record<FilterKey, Set<string>> = {
      gender: new Set(),
      hairGroup: new Set(),
      age: new Set(),
      skinTone: new Set(),
      glasses: new Set(),
      outfitTags: new Set(),
    };

    imageFacts.forEach(teacher => {
      valuesByKey.gender.add(teacher.gender);
      valuesByKey.hairGroup.add(teacher.hairGroup);
      valuesByKey.age.add(teacher.age);
      valuesByKey.skinTone.add(teacher.skinTone);
      valuesByKey.glasses.add(teacher.glasses);
      teacher.outfitTags.forEach(tag => valuesByKey.outfitTags.add(tag));
    });

    return FILTERS.map(filter => ({
      ...filter,
      values: filter.values.filter(v => valuesByKey[filter.key].has(v.value)),
    }));
  }, [imageFacts]);

  useEffect(() => {
    if (!isActive || !activeFilter) {
      onFilteredIndices(null);
      return;
    }

    const matching = new Set<number>();
    imageFacts.forEach((teacher, index) => {
      let matches = false;
      if (activeFilter.key === 'outfitTags') {
        matches = teacher.outfitTags.includes(activeFilter.value as TeacherOutfitTag);
      } else {
        matches = teacher[activeFilter.key] === activeFilter.value;
      }
      if (matches) matching.add(index);
    });
    onFilteredIndices(matching);
  }, [activeFilter, imageFacts, isActive, onFilteredIndices]);

  const toggleFilter = (key: FilterKey, value: string) => {
    setActiveFilter(prev => {
      if (prev?.key === key && prev.value === value) return null;
      return { key, value };
    });
  };

  const clearFilters = () => {
    setActiveFilter(null);
    onFilteredIndices(null);
  };

  const matchCount = useMemo(() => {
    if (!activeFilter) return imageFacts.length;
    return imageFacts.filter(teacher => {
      if (activeFilter.key === 'outfitTags') {
        return teacher.outfitTags.includes(activeFilter.value as TeacherOutfitTag);
      }
      return teacher[activeFilter.key] === activeFilter.value;
    }).length;
  }, [activeFilter, imageFacts]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? 'bg-[var(--color-area-entdecken)] text-white'
            : 'border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:border-[var(--color-area-entdecken)]/50'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        {isActive ? 'Analyse ausschalten' : 'Analyse einschalten'}
      </button>

      {isActive && (
        <div className="space-y-3 p-4 rounded-xl border border-[var(--color-area-entdecken)]/30 dark:bg-[var(--color-card)] bg-white">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-area-entdecken)]">
              {matchCount} von {images.length} Bildern
            </span>
            <div className="flex items-center gap-3">
              {!activeFilter && (
                <span className="text-xs dark:text-[var(--color-muted)] text-slate-400">
                  Wähle ein Merkmal
                </span>
              )}
              {activeFilter && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs dark:text-[var(--color-muted)] text-slate-500 hover:dark:text-[var(--color-primary)] hover:text-slate-900 transition-colors"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>
          </div>

          {availableFilters.map(filter => (
            <div key={filter.key}>
              <span className="text-xs font-medium dark:text-[var(--color-muted)] text-slate-500 mb-1.5 block">
                {filter.label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {filter.values.map(({ value, label }) => {
                  const isSelected = activeFilter?.key === filter.key && activeFilter.value === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleFilter(filter.key, value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[var(--color-area-entdecken)] text-white'
                          : 'border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:border-[var(--color-area-entdecken)]/50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
