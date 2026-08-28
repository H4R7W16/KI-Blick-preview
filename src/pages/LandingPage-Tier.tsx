import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resolveAssetPath } from '../utils/assetPath';
import { useTour } from '../hooks/useTour';

const AREAS = [
  {
    title: 'Verstehen',
    description: 'Wie erzeugt KI Bilder? Lerne die Grundlagen generativer Bildmodelle.',
    path: '/verstehen',
    color: 'var(--color-area-verstehen)',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Entdecken',
    description: '480 KI-generierte Bilder erkunden. Drei Modelle, zehn Fächer, überraschende Muster.',
    path: '/entdecken',
    color: 'var(--color-area-entdecken)',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
      </svg>
    ),
  },
  {
    title: 'Einordnen',
    description: 'Warum zeigt KI Stereotypen? Bias, Trainingsdaten und die Wirkung von Bildern.',
    path: '/einordnen',
    color: 'var(--color-area-einordnen)',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    title: 'Lernen',
    description: 'Geführte Lernpfade verbinden Wissen, Analyse und Reflexion zu einem Gesamtbild.',
    path: '/lernen',
    color: 'var(--color-area-lernen)',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

// Real gender distribution data from metadata-all.json
const TEASER_IMAGES = [
  {
    fach: 'Informatiklehrkraft',
    fachSlug: 'informatiklehrkraft',
    modell: 'FLUX2 PRO',
    modellSlug: 'flux2pro',
    fact: 'Alle 16 Bilder zeigen eine männliche Person',
  },
  {
    fach: 'Kunstlehrkraft',
    fachSlug: 'kunstlehrkraft',
    modell: 'Nano Bana',
    modellSlug: 'nanobana',
    fact: 'Alle 16 Bilder zeigen eine weibliche Person',
  },
  {
    fach: 'Sportlehrkraft',
    fachSlug: 'sportlehrkraft',
    modell: 'GPT Image',
    modellSlug: 'gpt-image-1-5',
    fact: '15 von 16 Bilder zeigen eine weibliche Person',
  },
  {
    fach: 'Mathematiklehrkraft',
    fachSlug: 'mathematiklehrkraft',
    modell: 'GPT Image',
    modellSlug: 'gpt-image-1-5',
    fact: '14 von 16 Bilder zeigen eine weibliche Person',
  },
  {
    fach: 'Physiklehrkraft',
    fachSlug: 'physiklehrkraft',
    modell: 'Nano Bana',
    modellSlug: 'nanobana',
    fact: '11 von 16 Bilder zeigen eine weibliche Person',
  },
  {
    fach: 'Deutschlehrkraft',
    fachSlug: 'deutschlehrkraft',
    modell: 'FLUX2 PRO',
    modellSlug: 'flux2pro',
    fact: '9 männlich, 7 weiblich – die ausgeglichenste Serie',
  },
];

const STATS = [
  { value: '480', label: 'Bilder' },
  { value: '3', label: 'KI-Modelle' },
  { value: '10', label: 'Fächer' },
  { value: '3', label: 'Lernpfade' },
  { value: '0', label: 'Tracking' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const TOUR_OPTIONS = [
  {
    variant: 'schueler' as const,
    label: 'Schüler:in',
    description: 'Lernpfade, Fortschritt & Badges',
    color: 'var(--color-area-lernen)',
  },
  {
    variant: 'lehrkraft' as const,
    label: 'Lehrkraft',
    description: 'Unterrichtseinheiten & Klasse',
    color: 'var(--color-area-verstehen)',
  },
  {
    variant: 'neugierig' as const,
    label: 'Ich bin neugierig',
    description: 'Schneller Überblick',
    color: 'var(--color-area-entdecken)',
  },
];

export default function LandingPage() {
  const { startTour } = useTour();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12"
      >
        <div className="mb-4">
          <img
            src={resolveAssetPath('/branding/ki-blick-logo.webp')}
            alt="KI:Blick Logo"
            className="mx-auto h-auto w-full max-w-xl"
            loading="eager"
          />
          <h1 className="sr-only">KI:Blick</h1>
        </div>
        <p className="text-xl md:text-2xl dark:text-[var(--color-secondary)] text-slate-600 mb-8">
          Bilder, Bias und Blickwinkel
        </p>
        <p className="text-lg md:text-xl dark:text-[var(--color-primary)] text-slate-800 font-medium max-w-xl mx-auto leading-snug">
          Wenn du eine KI bittest, eine Lehrkraft zu zeichnen –
          <br className="hidden md:block" /> was glaubst du, wen sie zeigt? Und warum?
        </p>

        {/* Tour CTAs */}
        <div className="mt-8 space-y-3">
          <p className="text-xs uppercase tracking-widest dark:text-[var(--color-muted)] text-slate-400 mb-4">
            Womit möchtest du starten?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {TOUR_OPTIONS.map(opt => (
              <button
                key={opt.variant}
                type="button"
                onClick={() => startTour(opt.variant)}
                className="tour-option-btn flex flex-col items-center px-6 py-3.5 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                style={{ '--tour-color': opt.color } as React.CSSProperties}
              >
                <span className="font-semibold text-sm" style={{ color: opt.color }}>
                  {opt.label}
                </span>
                <span className="text-xs dark:text-[var(--color-muted)] text-slate-500 mt-0.5">
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 text-sm mt-3">
            <Link
              to="/lernen"
              className="dark:text-[var(--color-secondary)] text-slate-600 hover:text-[var(--color-accent)] hover:dark:text-[var(--color-accent)] transition-colors no-underline"
            >
              Direkt zu den Lernpfaden →
            </Link>
            <span className="dark:text-[var(--color-border)] text-slate-300" aria-hidden>·</span>
            <Link
              to="/informationen"
              className="dark:text-[var(--color-secondary)] text-slate-600 hover:text-[var(--color-accent)] hover:dark:text-[var(--color-accent)] transition-colors no-underline"
            >
              Über das Projekt
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Statistik-Streifen */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex flex-wrap justify-center items-center gap-x-2 gap-y-2 mb-14 text-sm dark:text-[var(--color-muted)] text-slate-500"
      >
        {STATS.map((stat, i) => (
          <span key={stat.label} className="flex items-center gap-1">
            {i > 0 && <span className="mx-2 dark:text-[var(--color-border)] text-slate-300" aria-hidden>·</span>}
            <span className="font-bold dark:text-[var(--color-secondary)] text-slate-700">{stat.value}</span>
            <span>{stat.label}</span>
          </span>
        ))}
      </motion.div>

      {/* Area cards + Coming Soon */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        data-tour="area-cards"
      >
        {AREAS.map(area => (
          <motion.div key={area.path} variants={itemVariants}>
            <Link
              to={area.path}
              className="group block p-6 rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white transition-all duration-300 no-underline"
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = `color-mix(in srgb, ${area.color} 60%, transparent)`;
                el.style.background = `linear-gradient(135deg, color-mix(in srgb, ${area.color} 6%, transparent) 0%, transparent 50%)`;
                const h2 = el.querySelector('h2');
                if (h2) (h2 as HTMLElement).style.color = area.color;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = '';
                el.style.background = '';
                const h2 = el.querySelector('h2');
                if (h2) (h2 as HTMLElement).style.color = '';
              }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `color-mix(in srgb, ${area.color} 15%, transparent)`, color: area.color }}
              >
                {area.icon}
              </div>
              <h2 className="text-xl font-semibold mb-2 dark:text-[var(--color-primary)] text-slate-900 transition-colors">
                {area.title}
              </h2>
              <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed">
                {area.description}
              </p>
            </Link>
          </motion.div>
        ))}

        {/* Coming Soon card */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 opacity-70 cursor-default">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-rose-500/50 dark:text-rose-400 text-rose-500 dark:bg-rose-500/10 bg-rose-50">
                Demnächst
              </span>
              <h2 className="text-base font-semibold dark:text-[var(--color-secondary)] text-slate-500">
                Erfahren
              </h2>
            </div>
            <p className="text-sm dark:text-[var(--color-muted)] text-slate-400 leading-relaxed">
              Clickwork-Simulator, KI-Erkennung und mehr – coming soon.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Teaser: Was zeigt die KI? */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={revealVariants}
        className="mt-24"
      >
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-3">
            Derselbe Prompt. Drei KI-Modelle. Überraschende Unterschiede.
          </h2>
          <p className="dark:text-[var(--color-secondary)] text-slate-600 max-w-lg mx-auto">
            Was zeigt die KI, wenn man sie bittet, eine Lehrkraft zu generieren?
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-tour="teaser-grid">
          {TEASER_IMAGES.map(img => (
            <Link
              key={`${img.fachSlug}-${img.modellSlug}`}
              to={`/entdecken/${img.fachSlug}`}
              className="group block rounded-xl overflow-hidden no-underline border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden dark:bg-[var(--color-card)] bg-slate-100">
                <img
                  src={resolveAssetPath(`/images/generated/${img.fachSlug}/${img.modellSlug}/_kontaktblatt.webp`)}
                  alt={`16 KI-generierte Bilder einer ${img.fach}, erstellt mit ${img.modell}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs font-semibold text-white leading-tight">{img.fach}</p>
                  <p className="text-xs text-white/60">{img.modell}</p>
                </div>
              </div>
              <div className="p-3 dark:bg-[var(--color-card)] bg-white">
                <p className="text-xs dark:text-[var(--color-secondary)] text-slate-500 leading-relaxed">
                  {img.fact}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-8 dark:text-[var(--color-secondary)] text-slate-600 font-medium"
        >
          480 Bilder. 3 KI-Modelle. 10 Fächer.{' '}
          <Link to="/entdecken" className="text-[var(--color-accent)] hover:underline no-underline">
            Finde die Muster.
          </Link>
        </motion.p>
      </motion.section>

      {/* Footer info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-center mt-20 space-y-2"
      >
        <p className="text-xs dark:text-[var(--color-muted)] text-slate-400">
          Ein Projekt des Kreismedienzentrums Esslingen
        </p>
        <p className="text-xs dark:text-[var(--color-muted)] text-slate-400">
          Code: MIT-Lizenz &middot; Inhalte: CC BY-SA 4.0
        </p>
      </motion.div>

    </div>
  );
}
