import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

interface ModelProfile {
  model: string;
  color: string;
  values: {
    axis: string;
    value: number;
  }[];
  summary: string;
}

// Radar values (0–100): Subjective estimates based on visual analysis of 480 contact sheet images.
// Szenenvielfalt: how much visual variety across 10 subjects (high = diverse compositions).
// Porträtnähe: typical camera distance (high = close-up portraits dominate).
// Distanz: how often the camera is far/scenic (inverse of Porträtnähe).
// Konsistenz: how similar images within a series look (high = uniform style across seeds).
// Gender-Balance: approx. % female across all 10 subjects (50 = balanced).
const PROFILES: ModelProfile[] = [
  {
    model: 'FLUX2 PRO',
    color: '#0EA5E9',
    values: [
      { axis: 'Szenenvielfalt', value: 82 },
      { axis: 'Porträtnähe', value: 36 },
      { axis: 'Distanz', value: 78 },
      { axis: 'Konsistenz', value: 62 },
      { axis: 'Gender-Balance', value: 38 },
    ],
    summary: 'Häufig szenisch, eher distanziert, mit 38% der Darstellungen weiblich – männlich dominiert.',
  },
  {
    model: 'GPT Image-1.5',
    color: '#22C55E',
    values: [
      { axis: 'Szenenvielfalt', value: 38 },
      { axis: 'Porträtnähe', value: 91 },
      { axis: 'Distanz', value: 28 },
      { axis: 'Konsistenz', value: 88 },
      { axis: 'Gender-Balance', value: 71 },
    ],
    summary: 'Portraitfokus und starke Serienkonsistenz, mit 71% weiblichen Darstellungen und fachabhängigen Gender-Sprüngen.',
  },
  {
    model: 'Nano Bana',
    color: '#F59E0B',
    values: [
      { axis: 'Szenenvielfalt', value: 68 },
      { axis: 'Porträtnähe', value: 54 },
      { axis: 'Distanz', value: 45 },
      { axis: 'Konsistenz', value: 63 },
      { axis: 'Gender-Balance', value: 86 },
    ],
    summary: 'Dokumentarischer Stil mit Unterrichtsszene, stark weiblich dominiert (86% weiblich).',
  },
];

export default function ModelProfileCard() {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
      <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-4">
        Modellsignaturen
      </h4>
      <div className="grid lg:grid-cols-3 gap-4">
        {PROFILES.map(profile => (
          <article key={profile.model} className="rounded-lg border border-[var(--color-border)] p-3">
            <h5 className="font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-2">
              {profile.model}
            </h5>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="74%" data={profile.values}>
                  <PolarGrid stroke="#64748B" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <Radar
                    dataKey="value"
                    stroke={profile.color}
                    fill={profile.color}
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs dark:text-[var(--color-secondary)] text-slate-600 mt-1">
              {profile.summary}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

