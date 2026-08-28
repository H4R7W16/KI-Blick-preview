import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';
import { getSeries } from '../../data/imageMetadata';
import { getTeacherAttributes } from '../../utils/teacherAttributes';
import { resolveAssetPath } from '../../utils/assetPath';


const EXPOSURE_COUNT = 8;
const EXPOSURE_INTERVAL_MS = 1000;

interface ImageInfo {
  src: string;
  annotation: string;
}

function buildImageInfos(): ImageInfo[] {
  const series = getSeries('informatiklehrkraft', 'flux2pro');
  if (!series) return [];

  return series.images.slice(0, EXPOSURE_COUNT).map(img => {
    const attrs = getTeacherAttributes(img.attributes);
    const genderLabel = attrs.gender === 'female' ? 'weiblich' : attrs.gender === 'male' ? 'männlich' : 'uneindeutig';
    const ageLabel = attrs.age === 'unclear' ? 'Alter unklar' : `~${attrs.age.replace('-', '–')} Jahre`;
    const glassesLabel = attrs.glasses === 'yes' ? 'Brille' : '';
    const bgLabel =
      attrs.background === 'classroom-board' ? 'Tafel' :
      attrs.background === 'classroom-digital' ? 'Smartboard' :
      attrs.background === 'computer-lab' ? 'Computerraum' :
      attrs.background === 'science-lab' ? 'Labor' :
      'Klassenzimmer';

    const parts = [genderLabel, ageLabel, glassesLabel, bgLabel].filter(Boolean);
    return {
      src: resolveAssetPath(`${series.basePath}/${img.filename}`),
      annotation: parts.join(', '),
    };
  });
}

type Phase = 'intro' | 'exposure' | 'imagine' | 'reflect' | 'reveal';

export default function PerceptionExperiment() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();

  const [phase, setPhase] = useState<Phase>('intro');
  const [exposureIndex, setExposureIndex] = useState(0);
  const [description, setDescription] = useState('');
  const [influence, setInfluence] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');

  const images = buildImageInfos();
  const exposureTotal = images.length;

  const advanceExposure = useCallback(() => {
    setExposureIndex(prev => {
      if (prev + 1 >= exposureTotal) {
        setPhase('imagine');
        return prev;
      }
      return prev + 1;
    });
  }, [exposureTotal]);

  useEffect(() => {
    if (phase !== 'exposure' || exposureTotal === 0) return;
    const timer = setInterval(advanceExposure, EXPOSURE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [phase, exposureTotal, advanceExposure]);

  // Phase: Intro
  if (phase === 'intro') {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6 text-center">
        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4 max-w-md mx-auto">
          Gleich siehst du eine Reihe von Bildern. Schau sie dir einfach an – ohne zu analysieren.
        </p>
        <button
          type="button"
          onClick={() => {
            setExposureIndex(0);
            setPhase('exposure');
          }}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: areaColor }}
        >
          Start
        </button>
      </section>
    );
  }

  // Phase: Exposure (slideshow or static grid for reduced motion)
  if (phase === 'exposure') {
    const current = images[exposureIndex];
    return (
      <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
        <div className="flex justify-center mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={exposureIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.15 }}
              className="w-64 h-64 md:w-80 md:h-80 rounded-xl overflow-hidden border border-[var(--color-border)]"
            >
              {current && (
                <img
                  src={current.src}
                  alt={`Bild ${exposureIndex + 1} von ${exposureTotal}`}
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-1">
          {images.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-colors"
              style={{
                backgroundColor: i <= exposureIndex ? areaColor : 'var(--color-border)',
              }}
            />
          ))}
        </div>
      </section>
    );
  }

  // Phase: Imagine
  if (phase === 'imagine') {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
          Stell dir jetzt eine Informatiklehrkraft vor. Beschreibe kurz, wie diese Person aussieht.
        </p>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Alter, Geschlecht, Kleidung, Umgebung…"
          rows={4}
          className="w-full rounded-xl border border-[var(--color-border)] bg-transparent p-3 text-sm dark:text-[var(--color-primary)] text-slate-900 placeholder:text-[var(--color-muted)] resize-none focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': areaColor } as React.CSSProperties}
        />
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setPhase('reflect')}
            disabled={description.trim().length === 0}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: areaColor }}
          >
            Auswertung
          </button>
        </div>
      </section>
    );
  }

  // Phase: Reflect
  if (phase === 'reflect') {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
        <div className="rounded-xl border border-[var(--color-border)] p-4 mb-4">
          <p className="text-xs uppercase tracking-wider font-medium mb-2" style={{ color: areaColor }}>
            Deine Beschreibung
          </p>
          <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 italic">
            {description}
          </p>
        </div>

        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-4">
          Du hast gerade 8 Bilder gesehen, die fast alle männliche Personen mittleren Alters
          mit Brillen zeigten. Hat das beeinflusst, wie du dir eine Informatiklehrkraft
          vorgestellt hast?
        </p>
        <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mb-4">
          Wir können deine Antwort nicht automatisch auswerten – aber du kannst ehrlich
          reflektieren: Hast du eine männliche Person beschrieben? Eine mit Brille? Mittleren Alters?
        </p>

        <div className="space-y-4 mb-4">
          <div>
            <p className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900 mb-2">
              Hat die Bildserie deine Vorstellung beeinflusst?
            </p>
            <div className="flex gap-2">
              {['Ja', 'Teilweise', 'Nein'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setInfluence(option)}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                  style={
                    influence === option
                      ? { backgroundColor: areaColor, borderColor: areaColor, color: '#fff' }
                      : { borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium dark:text-[var(--color-primary)] text-slate-900 mb-2">
              Was wäre anders, wenn die Serie 8 diverse Lehrkräfte gezeigt hätte?
            </p>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="Deine Überlegung…"
              rows={3}
              className="w-full rounded-xl border border-[var(--color-border)] bg-transparent p-3 text-sm dark:text-[var(--color-primary)] text-slate-900 placeholder:text-[var(--color-muted)] resize-none focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': areaColor } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setPhase('reveal')}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: areaColor }}
          >
            Auflösung
          </button>
        </div>
      </section>
    );
  }

  // Phase: Reveal
  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {images.map((img, i) => (
          <div key={i} className="space-y-1">
            <div className="aspect-square rounded-lg overflow-hidden border border-[var(--color-border)]">
              <img src={img.src} alt={`KI-generiertes Porträt einer Informatiklehrkraft: ${img.annotation}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <p className="text-[10px] dark:text-[var(--color-muted)] text-slate-500 text-center leading-tight">
              {img.annotation}
            </p>
          </div>
        ))}
      </div>

      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed text-center">
        8 Bilder, die alle dasselbe Muster zeigen. In der Realität sind 25% der
        Informatiklehrkräfte in Deutschland weiblich. Aber nach 8 identischen
        Bildern fällt es schwer, sich etwas anderes vorzustellen.
      </p>
    </section>
  );
}
