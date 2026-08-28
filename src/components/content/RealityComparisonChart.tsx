import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { IMAGE_SERIES } from '../../data/imageMetadata';
import { MODELS, SUBJECTS } from '../../data/subjects';
import { getTeacherAttributes } from '../../utils/teacherAttributes';

// Real-world teacher gender data (approximations, KMK Lehrkräftestatistik 2023/24)
const REAL_DATA: Record<string, number> = {
  mathematiklehrkraft: 55,
  deutschlehrkraft: 78,
  physiklehrkraft: 30,
  informatiklehrkraft: 25,
  englischlehrkraft: 78,
  franzoesischlehrkraft: 82,
  lateinlehrkraft: 50,
  kunstlehrkraft: 75,
  musiklehrkraft: 55,
  sportlehrkraft: 43,
};

type ViewMode = 'combined' | 'per-model';

const MODEL_COLORS: Record<string, string> = {
  flux2pro: '#8B5CF6',
  'gpt-image-1-5': '#EC4899',
  nanobana: '#F97316',
};

interface CombinedRow {
  label: string;
  slug: string;
  kiPercent: number;
  realPercent: number;
  diff: number;
}

interface PerModelRow {
  label: string;
  slug: string;
  realPercent: number;
  [modelKey: string]: string | number;
}

function pct(female: number, total: number): number {
  return total > 0 ? Math.round((female / total) * 1000) / 10 : 0;
}

function computeCombinedData(): CombinedRow[] {
  return SUBJECTS.map(sub => {
    const series = IMAGE_SERIES.filter(s => s.subjectSlug === sub.slug);
    let female = 0;
    let total = 0;
    for (const s of series) {
      for (const img of s.images) {
        total += 1;
        if (getTeacherAttributes(img.attributes).gender === 'female') female += 1;
      }
    }
    const kiPercent = pct(female, total);
    const realPercent = REAL_DATA[sub.slug] ?? 50;
    return {
      label: sub.label,
      slug: sub.slug,
      kiPercent,
      realPercent,
      diff: Math.round((kiPercent - realPercent) * 10) / 10,
    };
  });
}

function computePerModelData(): PerModelRow[] {
  return SUBJECTS.map(sub => {
    const row: PerModelRow = {
      label: sub.label,
      slug: sub.slug,
      realPercent: REAL_DATA[sub.slug] ?? 50,
    };
    for (const model of MODELS) {
      const series = IMAGE_SERIES.filter(
        s => s.subjectSlug === sub.slug && s.modelId === model.id,
      );
      let female = 0;
      let total = 0;
      for (const s of series) {
        for (const img of s.images) {
          total += 1;
          if (getTeacherAttributes(img.attributes).gender === 'female') female += 1;
        }
      }
      row[model.id] = pct(female, total);
      row[`${model.id}_diff`] = Math.round((pct(female, total) - row.realPercent) * 10) / 10;
    }
    return row;
  });
}

function DiffBadge({ diff }: { diff: number }) {
  const color = Math.abs(diff) > 15 ? '#EF4444' : Math.abs(diff) > 5 ? '#F59E0B' : '#10B981';
  return (
    <span className="inline-block text-xs font-medium px-1.5 py-0.5 rounded" style={{ color, backgroundColor: `${color}20` }}>
      {diff > 0 ? '+' : ''}{diff} PP
    </span>
  );
}

export default function RealityComparisonChart() {
  const combinedData = useMemo(computeCombinedData, []);
  const perModelData = useMemo(computePerModelData, []);
  const [selected, setSelected] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('combined');

  const filteredCombined = selected ? combinedData.filter(d => d.slug === selected) : combinedData;
  const filteredPerModel = selected ? perModelData.filter(d => d.slug === selected) : perModelData;

  const isSingleSubject = !!selected;

  return (
    <section
      className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6"
      aria-label="Vergleich KI-Darstellung und reale Geschlechterverteilung bei Lehrkräften"
    >
      <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-1">
        KI-Bild vs. Wirklichkeit
      </h4>
      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
        Anteil weiblicher Darstellungen: KI-generierte Bilder im Vergleich zu realen Lehrkräfte-Statistiken.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          id="subject-select"
          value={selected ?? ''}
          onChange={e => setSelected(e.target.value || null)}
          className="rounded-lg border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white dark:text-[var(--color-primary)] text-slate-900 px-3 py-2 text-sm"
          aria-label="Fach auswählen"
        >
          <option value="">Alle Fächer</option>
          {SUBJECTS.map(s => (
            <option key={s.slug} value={s.slug}>
              {s.label}
            </option>
          ))}
        </select>

        <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden text-sm">
          <button
            onClick={() => setViewMode('combined')}
            className={`px-3 py-2 transition-colors ${
              viewMode === 'combined'
                ? 'dark:bg-[var(--color-area-einordnen)]/20 bg-amber-50 dark:text-[var(--color-area-einordnen)] text-amber-700 font-medium'
                : 'dark:bg-[var(--color-surface)] bg-white dark:text-[var(--color-secondary)] text-slate-600'
            }`}
          >
            Gesamt
          </button>
          <button
            onClick={() => setViewMode('per-model')}
            className={`px-3 py-2 transition-colors border-l border-[var(--color-border)] ${
              viewMode === 'per-model'
                ? 'dark:bg-[var(--color-area-einordnen)]/20 bg-amber-50 dark:text-[var(--color-area-einordnen)] text-amber-700 font-medium'
                : 'dark:bg-[var(--color-surface)] bg-white dark:text-[var(--color-secondary)] text-slate-600'
            }`}
          >
            Je Modell
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'combined' ? (
            <BarChart data={filteredCombined} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                angle={isSingleSubject ? 0 : -35}
                textAnchor={isSingleSubject ? 'middle' : 'end'}
                height={isSingleSubject ? 30 : 60}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={v => `${v}%`}
                tick={{ fontSize: 12, fill: '#94A3B8' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(148,163,184,0.1)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload as CombinedRow;
                  const diffColor = Math.abs(d.diff) > 15 ? '#EF4444' : Math.abs(d.diff) > 5 ? '#F59E0B' : '#10B981';
                  return (
                    <div className="rounded-lg border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white p-3 text-sm shadow-lg">
                      <p className="font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-1">
                        {d.label}
                      </p>
                      <p className="text-[#8B5CF6]">KI (gesamt): {d.kiPercent}% weiblich</p>
                      <p className="text-[#10B981]">Realität: {d.realPercent}% weiblich</p>
                      <p style={{ color: diffColor }}>
                        Differenz: {d.diff > 0 ? '+' : ''}{d.diff} Prozentpunkte
                      </p>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="kiPercent" name="KI-Bilder (gesamt)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="realPercent" name="Realität" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={filteredPerModel} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                angle={isSingleSubject ? 0 : -35}
                textAnchor={isSingleSubject ? 'middle' : 'end'}
                height={isSingleSubject ? 30 : 60}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={v => `${v}%`}
                tick={{ fontSize: 12, fill: '#94A3B8' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(148,163,184,0.1)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload as PerModelRow;
                  return (
                    <div className="rounded-lg border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white p-3 text-sm shadow-lg">
                      <p className="font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-2">
                        {d.label}
                      </p>
                      {MODELS.map(m => {
                        const val = d[m.id] as number;
                        const diff = d[`${m.id}_diff`] as number;
                        return (
                          <div key={m.id} className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: MODEL_COLORS[m.id] }} />
                            <span style={{ color: MODEL_COLORS[m.id] }}>{m.label}: {val}%</span>
                            <DiffBadge diff={diff} />
                          </div>
                        );
                      })}
                      <div className="flex items-center gap-2 mt-1 pt-1 border-t border-[var(--color-border)]">
                        <span className="w-2 h-2 rounded-full flex-shrink-0 bg-[#10B981]" />
                        <span className="text-[#10B981]">Realität: {d.realPercent}%</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {MODELS.map(m => (
                <Bar
                  key={m.id}
                  dataKey={m.id}
                  name={m.label}
                  fill={MODEL_COLORS[m.id]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
              <Bar dataKey="realPercent" name="Realität" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Per-model detail table (shown when single subject selected in per-model view) */}
      {viewMode === 'per-model' && isSingleSubject && filteredPerModel[0] && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 dark:text-[var(--color-secondary)] text-slate-600 font-medium">Modell</th>
                <th className="text-right py-2 dark:text-[var(--color-secondary)] text-slate-600 font-medium">KI weiblich</th>
                <th className="text-right py-2 dark:text-[var(--color-secondary)] text-slate-600 font-medium">Realität</th>
                <th className="text-right py-2 dark:text-[var(--color-secondary)] text-slate-600 font-medium">Differenz</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map(m => {
                const row = filteredPerModel[0];
                const val = row[m.id] as number;
                const diff = row[`${m.id}_diff`] as number;
                return (
                  <tr key={m.id} className="border-b border-[var(--color-border)]/50">
                    <td className="py-2">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MODEL_COLORS[m.id] }} />
                        <span className="dark:text-[var(--color-primary)] text-slate-900 font-medium">{m.label}</span>
                      </span>
                    </td>
                    <td className="text-right py-2 dark:text-[var(--color-primary)] text-slate-900">{val}%</td>
                    <td className="text-right py-2 text-[#10B981]">{row.realPercent}%</td>
                    <td className="text-right py-2"><DiffBadge diff={diff} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mt-3 italic">
        Realdaten: Näherungswerte basierend auf KMK-Lehrkräftestatistik 2023/24. Genaue fachspezifische Daten variieren nach Bundesland und Schulart.
      </p>
    </section>
  );
}
