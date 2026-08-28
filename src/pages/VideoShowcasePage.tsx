import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { resolveAssetPath } from '../utils/assetPath';

type VariantId = 'studio' | 'board' | 'story';

interface VariantMeta {
  id: VariantId;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
}

const VARIANTS: VariantMeta[] = [
  {
    id: 'studio',
    title: 'Variante 1: Studio Focus',
    subtitle: 'Grosses Hero-Video mit klarer Buehne',
    description: 'Ideal fuer ruhige Praesentation mit Fokus auf das Video und wenigen, starken Highlights.',
    accent: '#0EA5E9',
  },
  {
    id: 'board',
    title: 'Variante 2: Lernboard',
    subtitle: 'Video plus strukturierte Begleitinfos',
    description: 'Gut geeignet fuer Unterricht, wenn parallel Leitfragen und Lernziele sichtbar sein sollen.',
    accent: '#10B981',
  },
  {
    id: 'story',
    title: 'Variante 3: Story Flow',
    subtitle: 'Narrativer Aufbau mit Check-out',
    description: 'Verbindet das Video mit Reflexion und motivierendem Abschluss in einem Ablauf.',
    accent: '#F59E0B',
  },
];

interface VideoStageProps {
  accent: string;
  caption: string;
}

function VideoStage({ accent, caption }: VideoStageProps) {
  return (
    <div
      className="rounded-2xl border p-3 md:p-4 dark:bg-[var(--color-surface)] bg-white shadow-lg shadow-slate-950/5"
      style={{ borderColor: `color-mix(in srgb, ${accent} 45%, var(--color-border))` }}
    >
      <video
        className="w-full rounded-xl aspect-video bg-slate-950"
        controls
        preload="metadata"
      >
        <source src={resolveAssetPath('/videos/AIva_1-1.mp4')} type="video/mp4" />
        Dein Browser unterstuetzt das Video-Element nicht.
      </video>
      <p className="mt-3 text-sm dark:text-[var(--color-secondary)] text-slate-600">{caption}</p>
    </div>
  );
}

function StudioVariant({ accent }: { accent: string }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-8">
      <div
        className="absolute -top-32 -right-20 h-72 w-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: `color-mix(in srgb, ${accent} 35%, transparent)` }}
      />
      <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        <div className="lg:col-span-2 space-y-4">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              color: accent,
              backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
            }}
          >
            Premium-Darstellung
          </span>
          <h2 className="text-2xl md:text-3xl font-bold dark:text-[var(--color-primary)] text-slate-900">
            Buehne frei fuer das Video
          </h2>
          <p className="text-sm md:text-base dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed">
            Diese Variante setzt auf eine ruhige, hochwertige Flaechenaufteilung und maximale
            Aufmerksamkeit auf den Film.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {['Klarer Fokus', 'Hohe Lesbarkeit', 'Modernes Hero-Layout', 'Responsive'].map(point => (
              <div
                key={point}
                className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs dark:text-[var(--color-secondary)] text-slate-600 dark:bg-[var(--color-surface)] bg-slate-50"
              >
                {point}
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-3">
          <VideoStage
            accent={accent}
            caption="Einsatz: Startimpuls, Praesentation oder ruhiger Fokus vor einer Diskussionsphase."
          />
        </div>
      </div>
    </section>
  );
}

function BoardVariant({ accent }: { accent: string }) {
  const prompts = [
    'Welche Botschaft transportiert das Video auf den ersten Blick?',
    'Welche Bildentscheidungen wirken besonders stark?',
    'Wie koennte man die Szene fuer den Unterricht aufbereiten?',
  ];

  return (
    <section className="rounded-3xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="order-2 lg:order-1 space-y-4">
          <h2 className="text-2xl font-bold dark:text-[var(--color-primary)] text-slate-900">
            Lernboard mit Leitfragen
          </h2>
          <p className="text-sm md:text-base dark:text-[var(--color-secondary)] text-slate-600">
            Das Video wird von einer klaren Moderationsspalte begleitet. So lassen sich Unterrichtsimpulse
            und Beobachtungsauftraege direkt neben dem Medium platzieren.
          </p>
          <div className="space-y-3">
            {prompts.map((prompt, index) => (
              <div
                key={prompt}
                className="rounded-xl border border-[var(--color-border)] p-3 dark:bg-[var(--color-surface)] bg-slate-50"
              >
                <p className="text-xs font-semibold mb-1" style={{ color: accent }}>
                  Leitfrage {index + 1}
                </p>
                <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">{prompt}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <VideoStage
            accent={accent}
            caption="Einsatz: Unterrichtssequenzen mit Beobachtungsauftraegen und anschliessender Auswertung."
          />
        </div>
      </div>
    </section>
  );
}

function StoryVariant({ accent }: { accent: string }) {
  const timeline = [
    'Ankommen: Kurz einstimmen und den Blick auf das Thema lenken.',
    'Schauen: Das Video gemeinsam ansehen und erste Eindruecke sammeln.',
    'Reflektieren: Erkenntnisse teilen und Perspektiven vergleichen.',
    'Check-out: Einen konkreten naechsten Schritt festhalten.',
  ];

  return (
    <section className="rounded-3xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-8">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold dark:text-[var(--color-primary)] text-slate-900">Story Flow</h2>
            <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mt-1">
              Vom Einstieg bis zum motivierenden Abschluss in einer klaren Lernsequenz.
            </p>
          </div>
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              color: accent,
              backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
            }}
          >
            Mit Check-out
          </span>
        </div>

        <VideoStage
          accent={accent}
          caption="Einsatz: Wenn das Video Teil eines vollstaendigen Lernablaufs inklusive Reflexion ist."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {timeline.map((step, index) => (
            <div
              key={step}
              className="rounded-xl border border-[var(--color-border)] p-3 dark:bg-[var(--color-surface)] bg-slate-50 flex gap-3"
            >
              <span
                className="inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  color: accent,
                  backgroundColor: `color-mix(in srgb, ${accent} 15%, transparent)`,
                }}
              >
                {index + 1}
              </span>
              <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VariantPreview({ variantId, accent }: { variantId: VariantId; accent: string }) {
  if (variantId === 'studio') {
    return <StudioVariant accent={accent} />;
  }
  if (variantId === 'board') {
    return <BoardVariant accent={accent} />;
  }
  return <StoryVariant accent={accent} />;
}

export default function VideoShowcasePage() {
  const [selectedVariantId, setSelectedVariantId] = useState<VariantId>('studio');
  const selectedVariant = VARIANTS.find(variant => variant.id === selectedVariantId) ?? VARIANTS[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-8 relative overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: selectedVariant.accent }} />
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] font-semibold mb-3">
          Beispielseite
        </p>
        <h1 className="text-3xl md:text-4xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-3">
          Video-Showcase: AIva 1-1
        </h1>
        <p className="max-w-3xl text-sm md:text-base dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed">
          Wähle unten eine Design-Variante aus. Alle drei Vorschläge nutzen dasselbe Video, aber mit
          unterschiedlicher didaktischer und visueller Inszenierung.
        </p>
      </motion.header>

      <section aria-label="Variantenauswahl" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VARIANTS.map(variant => {
          const isActive = selectedVariant.id === variant.id;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedVariantId(variant.id)}
              className={`text-left rounded-2xl border p-4 transition-all duration-200 dark:bg-[var(--color-card)] bg-white hover:-translate-y-0.5 ${
                isActive ? 'shadow-lg shadow-slate-950/10' : ''
              }`}
              style={{
                borderColor: isActive
                  ? `color-mix(in srgb, ${variant.accent} 65%, var(--color-border))`
                  : 'var(--color-border)',
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: variant.accent }}>
                {variant.subtitle}
              </p>
              <h2 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-2">
                {variant.title}
              </h2>
              <p className="text-sm leading-relaxed dark:text-[var(--color-secondary)] text-slate-600">
                {variant.description}
              </p>
              <p className="text-xs mt-3 font-medium" style={{ color: variant.accent }}>
                {isActive ? 'Aktiv ausgewaehlt' : 'Jetzt auswaehlen'}
              </p>
            </button>
          );
        })}
      </section>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedVariant.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <VariantPreview variantId={selectedVariant.id} accent={selectedVariant.accent} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

