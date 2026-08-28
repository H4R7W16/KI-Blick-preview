import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { IMAGE_SERIES } from '../../data/imageMetadata';
import { SUBJECT_GROUPS } from '../../data/subjects';
import { getTeacherAttributes } from '../../utils/teacherAttributes';

interface ClusterData {
  cluster: string;
  femalePercent: number;
  total: number;
  female: number;
}

function computeClusterData(): ClusterData[] {
  const clusters: Record<string, { female: number; total: number }> = {};

  for (const [group, slugs] of Object.entries(SUBJECT_GROUPS)) {
    clusters[group] = { female: 0, total: 0 };
    for (const slug of slugs) {
      const series = IMAGE_SERIES.filter(s => s.subjectSlug === slug);
      for (const s of series) {
        for (const img of s.images) {
          clusters[group].total += 1;
          if (getTeacherAttributes(img.attributes).gender === 'female') {
            clusters[group].female += 1;
          }
        }
      }
    }
  }

  return Object.entries(clusters).map(([cluster, data]) => ({
    cluster,
    femalePercent: data.total > 0 ? Math.round((data.female / data.total) * 1000) / 10 : 0,
    total: data.total,
    female: data.female,
  }));
}

const CLUSTER_COLORS: Record<string, string> = {
  MINT: '#0EA5E9',
  Sprachen: '#8B5CF6',
  'Kreativ & Sport': '#F59E0B',
};

export default function BiasClusterChart() {
  const data = useMemo(computeClusterData, []);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section
      className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6"
      aria-label={`Balkendiagramm: Anteil weiblicher Darstellungen nach Fächercluster. ${data.map(d => `${d.cluster}: ${d.femalePercent}%`).join(', ')}.`}
    >
      <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-1">
        Die Zahlen sprechen
      </h4>
      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
        Anteil weiblich gelesener Darstellungen nach Fächercluster (alle drei Modelle, je 16 Bilder pro Fach).
      </p>

      <div className="h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={v => `${v}%`}
              tick={{ fontSize: 12, fill: '#94A3B8' }}
            />
            <YAxis
              dataKey="cluster"
              type="category"
              width={110}
              tick={{ fontSize: 12, fill: '#94A3B8' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148,163,184,0.1)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload as ClusterData;
                return (
                  <div className="rounded-lg border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white p-3 text-sm shadow-lg">
                    <p className="font-semibold dark:text-[var(--color-primary)] text-slate-900">
                      {d.cluster}
                    </p>
                    <p className="dark:text-[var(--color-secondary)] text-slate-600">
                      {d.femalePercent}% weiblich ({d.female} von {d.total} Bildern)
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="femalePercent"
              radius={[0, 6, 6, 0]}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.cluster}
                  fill={CLUSTER_COLORS[entry.cluster] ?? '#64748B'}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mt-3">
        Diese Daten stammen aus genau den Bildern, die du im Bereich Entdecken erkunden kannst.
      </p>
    </section>
  );
}
