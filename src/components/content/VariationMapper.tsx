import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getV3ImagePath, getV3Series } from '../../data/v3Images';

interface DimensionDef {
  key: string;
  label: string;
  polA: string;
  polB: string;
}

const DIMENSIONS: DimensionDef[] = [
  { key: 'weather', label: 'Wetter', polA: 'Sonnig', polB: 'Bewölkt/Nebel' },
  { key: 'perspective', label: 'Perspektive', polA: 'Nah', polB: 'Fern' },
  { key: 'crown', label: 'Krone', polA: 'Voll und dicht', polB: 'Schlank/offen' },
  { key: 'light', label: 'Licht', polA: 'Warmes Licht', polB: 'Kühles Licht' },
];

type VariationValues = { weather: number; perspective: number; crown: number; light: number };

const VARIATION_DATA: Record<number, VariationValues> = {
  // Values are calibrated to the current FLUX2 PRO image set (baum_0.jpg ... baum_15.jpg).
  // Scale direction follows the axis labels in the UI:
  // weather: sonnig -> bewoelkt/nebelig, perspective: nah -> fern,
  // crown: voll/dicht -> schlank/offen, light: warm -> kuehl.
  0: { weather: 25, perspective: 60, crown: 25, light: 20 },
  1: { weather: 70, perspective: 15, crown: 20, light: 25 },
  2: { weather: 20, perspective: 55, crown: 20, light: 20 },
  3: { weather: 20, perspective: 60, crown: 25, light: 30 },
  4: { weather: 35, perspective: 60, crown: 30, light: 35 },
  5: { weather: 40, perspective: 60, crown: 25, light: 15 },
  6: { weather: 25, perspective: 30, crown: 40, light: 20 },
  7: { weather: 15, perspective: 55, crown: 25, light: 15 },
  8: { weather: 60, perspective: 55, crown: 30, light: 25 },
  9: { weather: 20, perspective: 45, crown: 70, light: 20 },
  10: { weather: 25, perspective: 55, crown: 25, light: 20 },
  11: { weather: 55, perspective: 10, crown: 45, light: 20 },
  12: { weather: 45, perspective: 55, crown: 25, light: 30 },
  13: { weather: 40, perspective: 55, crown: 30, light: 20 },
  14: { weather: 70, perspective: 10, crown: 45, light: 15 },
  15: { weather: 45, perspective: 10, crown: 40, light: 15 },
};

function DimensionAxis({
  dim,
  value,
  areaColor,
  reduceMotion,
}: {
  dim: DimensionDef;
  value: number | null;
  areaColor: string;
  reduceMotion: boolean | null;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[10px] dark:text-[var(--color-muted)] text-slate-500 mb-1">
        <span>{dim.polA}</span>
        <span className="font-medium dark:text-[var(--color-secondary)] text-slate-600">{dim.label}</span>
        <span>{dim.polB}</span>
      </div>
      <div className="relative h-2 rounded-full bg-[var(--color-border)]">
        {value !== null && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2"
            style={{
              backgroundColor: areaColor,
              borderColor: '#fff',
              left: `calc(${value}% - 7px)`,
            }}
            initial={reduceMotion ? undefined : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.25, type: 'spring' }}
          />
        )}
      </div>
    </div>
  );
}

export default function VariationMapper() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();
  const series = getV3Series('flux2pro');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const currentValues = selectedImage !== null ? VARIATION_DATA[selectedImage] : null;

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      <div className="flex flex-col md:flex-row gap-5">
        {/* Thumbnail gallery */}
        <div className="md:w-1/2">
          <div className="grid grid-cols-4 gap-1.5">
            {series.images.map(img => (
              <button
                key={img.index}
                type="button"
                onClick={() => setSelectedImage(img.index)}
                className="aspect-square rounded-lg overflow-hidden border-2 transition-colors"
                style={{
                  borderColor:
                    selectedImage === img.index ? areaColor : 'var(--color-border)',
                }}
              >
                <img
                  src={getV3ImagePath('flux2pro', img.index)}
                  alt={`Baum ${img.index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Enlarged selected image */}
          {selectedImage !== null && (
            <motion.div
              key={selectedImage}
              initial={reduceMotion ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 rounded-xl overflow-hidden border border-[var(--color-border)] aspect-[4/3]"
            >
              <img
                src={getV3ImagePath('flux2pro', selectedImage)}
                alt={`Baum ${selectedImage + 1} vergrößert`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </div>

        {/* Dimension axes */}
        <div className="md:w-1/2 flex flex-col justify-center">
          {selectedImage === null && (
            <p className="text-sm dark:text-[var(--color-muted)] text-slate-500 text-center mb-4">
              Klicke auf ein Bild, um seine Position auf den Dimensions-Achsen zu sehen.
            </p>
          )}
          {selectedImage !== null && (
            <p className="text-xs font-medium mb-3" style={{ color: areaColor }}>
              Bild {selectedImage + 1} von 16
            </p>
          )}
          {DIMENSIONS.map(dim => (
            <DimensionAxis
              key={dim.key}
              dim={dim}
              value={currentValues ? currentValues[dim.key as keyof VariationValues] : null}
              areaColor={areaColor}
              reduceMotion={reduceMotion}
            />
          ))}

          <p className="mt-4 text-xs dark:text-[var(--color-muted)] text-slate-500 leading-relaxed italic">
            Die Variation bewegt sich innerhalb einer engen Spanne: von sonnig bis
            nebelig, von nah bis fern. Aber die Grundstruktur – Laubbaum, Wiese,
            Sommer – bleibt immer gleich. Das ist der Default.
          </p>
        </div>
      </div>
    </section>
  );
}
