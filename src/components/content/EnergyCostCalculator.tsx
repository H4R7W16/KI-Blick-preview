import { useMemo, useState } from 'react';

// Energy estimates (didactic approximations)
const KWH_PER_IMAGE_LOW = 0.003;
const KWH_PER_IMAGE_HIGH = 0.01;
const KWH_PER_IMAGE_MID = (KWH_PER_IMAGE_LOW + KWH_PER_IMAGE_HIGH) / 2;
const CO2_PER_KWH = 363; // g CO2/kWh, German electricity mix 2024 (latest official value as of spring 2026)
const ASSUMPTION_STATUS = 'Annahmen (Stand: Frühjahr 2026)';

interface Comparison {
  label: string;
  kwhPer: number;
  unit: string;
}

const COMPARISONS: Comparison[] = [
  { label: 'Smartphone laden', kwhPer: 0.019, unit: 'Ladungen' },
  { label: 'E-Auto fahren', kwhPer: 0.2, unit: 'km' },
  { label: 'Netflix streamen', kwhPer: 0.08, unit: 'Stunden' },
];

function formatNumber(n: number): string {
  if (n >= 1000) return n.toLocaleString('de-DE', { maximumFractionDigits: 0 });
  if (n >= 10) return n.toLocaleString('de-DE', { maximumFractionDigits: 1 });
  return n.toLocaleString('de-DE', { maximumFractionDigits: 2 });
}

export default function EnergyCostCalculator() {
  const [count, setCount] = useState(850);

  const stats = useMemo(() => {
    const kwh = count * KWH_PER_IMAGE_MID;
    const co2g = kwh * CO2_PER_KWH;
    return {
      kwh,
      kwhLow: count * KWH_PER_IMAGE_LOW,
      kwhHigh: count * KWH_PER_IMAGE_HIGH,
      co2g,
      comparisons: COMPARISONS.map(c => ({
        ...c,
        value: kwh / c.kwhPer,
      })),
    };
  }, [count]);

  return (
    <section
      className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6"
      aria-label={`Energievergleichsrechner: ${count} Bilder verbrauchen ca. ${formatNumber(stats.kwh)} kWh`}
    >
      <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-1">
        Der Vergleichsrechner
      </h4>
      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-6">
        Wie viel Energie verbraucht KI-Bildgenerierung? Verschiebe den Regler.
      </p>
      <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mb-4">
        {ASSUMPTION_STATUS}: 0,003-0,01 kWh pro Bild, deutscher Strommix mit {CO2_PER_KWH} g CO2/kWh.
      </p>

      {/* Slider */}
      <div className="mb-6">
        <label
          htmlFor="image-count"
          className="block text-sm font-medium dark:text-[var(--color-primary)] text-slate-900 mb-2"
        >
          Anzahl Bilder: <span className="text-[#F59E0B] font-bold">{count.toLocaleString('de-DE')}</span>
        </label>
        <input
          id="image-count"
          type="range"
          min={1}
          max={10000}
          step={1}
          value={count}
          onChange={e => setCount(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #F59E0B ${(count / 10000) * 100}%, #334155 ${(count / 10000) * 100}%)`,
          }}
        />
        <div className="flex justify-between text-xs dark:text-[var(--color-muted)] text-slate-500 mt-1">
          <span>1</span>
          <span>10.000</span>
        </div>
      </div>

      {/* Energy result */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-[var(--color-border)] p-4 text-center">
          <p className="text-2xl font-bold text-[#F59E0B]">
            {formatNumber(stats.kwh)} kWh
          </p>
          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mt-1">
            Energieverbrauch (Schätzung)
          </p>
          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500">
            ({formatNumber(stats.kwhLow)}–{formatNumber(stats.kwhHigh)} kWh)
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] p-4 text-center">
          <p className="text-2xl font-bold text-[#F59E0B]">
            {stats.co2g >= 1000
              ? `${formatNumber(stats.co2g / 1000)} kg`
              : `${formatNumber(stats.co2g)} g`}
          </p>
          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mt-1">
            CO₂-Äquivalent
          </p>
          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500">
            (dt. Strommix: ~{CO2_PER_KWH} g/kWh)
          </p>
        </div>
      </div>

      {/* Comparisons */}
      <h5 className="text-sm font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-3">
        Das entspricht ungefähr:
      </h5>
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        {stats.comparisons.map(c => (
          <div
            key={c.label}
            className="rounded-lg border border-[var(--color-border)] p-3 text-center"
          >
            <p className="text-lg font-bold dark:text-[var(--color-primary)] text-slate-900">
              {formatNumber(c.value)}
            </p>
            <p className="text-xs dark:text-[var(--color-secondary)] text-slate-600">
              {c.unit} {c.label}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 italic">
        Alle Werte sind didaktische Näherungen. Der tatsächliche Verbrauch variiert je nach Modell, Auflösung, Hardware und Rechenzentrum.
      </p>
    </section>
  );
}
