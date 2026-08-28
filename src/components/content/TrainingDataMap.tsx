import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const TRAINING_SHARE = [
  { name: 'Nordamerika + UK', value: 42, color: '#0EA5E9' },
  { name: 'Europa (ohne UK)', value: 27, color: '#38BDF8' },
  { name: 'Asien', value: 18, color: '#7DD3FC' },
  { name: 'Lateinamerika', value: 7, color: '#93C5FD' },
  { name: 'Afrika', value: 4, color: '#C4B5FD' },
  { name: 'Andere', value: 2, color: '#CBD5E1' },
];

const WORLD_POPULATION = [
  { name: 'Globaler Norden', value: 17, color: '#0EA5E9' },
  { name: 'Globaler Süden', value: 83, color: '#94A3B8' },
];

function formatPercent(value: number | string | undefined): string {
  if (typeof value === 'number') {
    return `${value}%`;
  }
  if (typeof value === 'string') {
    return `${value}%`;
  }
  return '-';
}

export default function TrainingDataMap() {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
      <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-2">
        Verteilung von Trainingsdaten
      </h4>
      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-700 mb-4">
        Beispielhafte Verteilung großer Web-Datensätze: englisch geprägte Quellen sind oft überproportional vertreten.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-72">
          <p className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900 mb-2">
            Anteil im Trainingskorpus
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={TRAINING_SHARE}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={90}
                paddingAngle={2}
              >
                {TRAINING_SHARE.map(entry => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={formatPercent}
                contentStyle={{
                  borderRadius: '0.75rem',
                  borderColor: 'var(--color-border)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <p className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900 mb-2">
            Vergleich: Weltbevölkerung
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={WORLD_POPULATION}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={90}
                paddingAngle={3}
              >
                {WORLD_POPULATION.map(entry => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={formatPercent}
                contentStyle={{
                  borderRadius: '0.75rem',
                  borderColor: 'var(--color-border)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mt-3">
        Hinweis: Die Zahlen sind didaktische Näherungen für den Unterrichtskontext, keine exakte Offenlegung eines einzelnen Modells.
      </p>
    </section>
  );
}
