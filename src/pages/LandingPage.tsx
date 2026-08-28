import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resolveAssetPath } from '../utils/assetPath';
import { useTour } from '../hooks/useTour';
import TeaserSpotlight, { type TeaserItem } from '../components/features/TeaserSpotlight';

const AREAS = [
  {
    title: 'Verstehen',
    description: 'Wie erzeugt KI Bilder? Lerne die Grundlagen generativer Bildmodelle.',
    path: '/verstehen',
    area: 'verstehen',
    color: 'var(--color-area-verstehen)',
  },
  {
    title: 'Entdecken',
    description: '480 KI-generierte Bilder erkunden. Drei Modelle, zehn Fächer, überraschende Muster.',
    path: '/entdecken',
    area: 'entdecken',
    color: 'var(--color-area-entdecken)',
  },
  {
    title: 'Einordnen',
    description: 'Warum zeigt KI Stereotypen? Bias, Trainingsdaten und die Wirkung von Bildern.',
    path: '/einordnen',
    area: 'einordnen',
    color: 'var(--color-area-einordnen)',
  },
  {
    title: 'Lernen',
    description: 'Geführte Lernpfade verbinden Wissen, Analyse und Reflexion zu einem Gesamtbild.',
    path: '/lernen',
    area: 'lernen',
    color: 'var(--color-area-lernen)',
  },
];

const TEASER_ITEMS: TeaserItem[] = [
  {
    fach: 'Lateinlehrkraft',
    fachSlug: 'lateinlehrkraft',
    modell: 'FLUX2 PRO',
    modellSlug: 'flux2pro',
    fact: 'Alle 16 Bilder zeigen eine Person über 50 – davon 11 über 60.',
    highlight: '16/16',
    highlightLabel: 'über 50 Jahre',
    previewImages: [
      'flux-pro-2_0_Lateinlehrkraft-0_a8616a2a-3537-493c-b101-979458f9b153.webp',
      'flux-pro-2_0_Lateinlehrkraft-0_f5aa4162-c569-410a-845b-227aa2d94307.webp',
      'flux-pro-2_0_Lateinlehrkraft-1_28ed45fd-e8d1-4269-af08-510e0c0d814a.webp',
    ],
  },
  {
    fach: 'Französischlehrkraft',
    fachSlug: 'franzoesischlehrkraft',
    modell: 'Nano Bana',
    modellSlug: 'nanobana',
    fact: '9 von 16 Bildern zeigen eine Person mit Halstuch. Der Prompt war „Französischlehrkraft" – nicht „Pariserin".',
    highlight: '9/16',
    highlightLabel: 'mit Halstuch',
    previewImages: [
      'gemini-2_5-flash-image_Franz_sischlehrkraft-0_27d8fecd-6207-48b8-a049-40c770741507.webp',
      'gemini-2_5-flash-image_Franz_sischlehrkraft-1_7bf6b28f-e213-4279-9b52-70535f067f8a.webp',
      'gemini-2_5-flash-image_Franz_sischlehrkraft-2_3eb0d06b-1d72-4724-a000-cf2d8d5feacc.webp',
    ],
  },
  {
    fach: 'Informatiklehrkraft',
    fachSlug: 'informatiklehrkraft',
    modell: 'GPT Image',
    modellSlug: 'gpt-image-1-5',
    fact: 'Alle 16 Bilder zeigen einen Mann mit Brille. Zwei Klischees in einer Serie.',
    highlight: '16/16',
    highlightLabel: 'mit Brille',
    previewImages: [
      'gpt-image-1_5_Informatiklehrkraft-0_224aa509-c5ed-45f6-9ded-f6e045144be8.webp',
      'gpt-image-1_5_Informatiklehrkraft-0_7c6541c5-2cdf-494f-aa31-d54f4a62cc3f.webp',
      'gpt-image-1_5_Informatiklehrkraft-1_aa3195e2-ebb8-467c-936f-09f2e6606fa9.webp',
    ],
  },
  {
    fach: 'Kunstlehrkraft',
    fachSlug: 'kunstlehrkraft',
    modell: 'GPT Image',
    modellSlug: 'gpt-image-1-5',
    fact: 'Alle 16 Bilder zeigen eine Frau mit Schürze. Die KI hat ein festes Kostüm für dieses Fach.',
    highlight: '16/16',
    highlightLabel: 'mit Schürze',
    previewImages: [
      'gpt-image-1_5_Kunstlehrkraft-0_19aa7bc1-b22b-4f2c-980f-cdd656308da5.webp',
      'gpt-image-1_5_Kunstlehrkraft-0_aacd23a2-dc10-4525-a598-3fd165790c81.webp',
      'gpt-image-1_5_Kunstlehrkraft-1_aba20ad6-14a0-4020-b3bd-7e3234d994a4.webp',
    ],
  },
  {
    fach: 'Sportlehrkraft',
    fachSlug: 'sportlehrkraft',
    modell: 'Nano Bana',
    modellSlug: 'nanobana',
    fact: '10 von 16 Bildern zeigen eine Person in den Zwanzigern. Sportlehrkräfte sind jung – zumindest für diese KI.',
    highlight: '10/16',
    highlightLabel: 'unter 30',
    previewImages: [
      'gemini-2_5-flash-image_Sportlehrkraft-0_45019590-c5b1-4ee2-a48b-b471bd3a897e.webp',
      'gemini-2_5-flash-image_Sportlehrkraft-0_f92ecf1c-bf37-4127-ae09-7ea35dcc507b.webp',
      'gemini-2_5-flash-image_Sportlehrkraft-2_072786ea-7f7a-41dc-af07-d1a4049d4d0c.webp',
    ],
  },
  {
    // Provisorisch: fachSlug/modellSlug verweisen auf Informatik/FLUX als Fallback-Link.
    // previewImages: 9 Bilder aus verschiedenen Serien (absolute Pfade), 8× hell + 1× dunkel.
    // darkImageIndex 5 = sechstes Bild in der 3×3-Matrix (mittlere Zeile, rechts).
    fach: 'Alle Fächer',
    fachSlug: 'informatiklehrkraft',
    modell: 'Alle Modelle',
    modellSlug: 'flux2pro',
    fact: '465 von 480 Bildern zeigen eine Person mit hellem Hautton – über alle Fächer und Modelle hinweg. Der Prompt enthielt kein Wort über Aussehen.',
    highlight: '465/480',
    highlightLabel: 'hell',
    darkImageIndex: 5,
    linkLabel: 'Bilder erkunden',
    previewImages: [
      '/images/generated/physiklehrkraft/flux2pro/flux-pro-2_0_Physiklehrkraft-0_82a1a50c-07e3-4012-9dbb-5231e576e591.webp',
      '/images/generated/informatiklehrkraft/flux2pro/flux-pro-2_0_Informatiklehrkraft-0_253da702-7ef6-40b1-92a5-cc5cc87f717a.webp',
      '/images/generated/deutschlehrkraft/gpt-image-1-5/gpt-image-1_5_Deutschlehrkraft-0_0d74842f-0d94-4851-83aa-e55b27a0892f.webp',
      '/images/generated/mathematiklehrkraft/gpt-image-1-5/gpt-image-1_5_Mathematiklehrkraft-0_6097f718-162b-427e-bf94-00b4921d2690.webp',
      '/images/generated/sportlehrkraft/nanobana/gemini-2_5-flash-image_Sportlehrkraft-0_45019590-c5b1-4ee2-a48b-b471bd3a897e.webp',
      '/images/generated/mathematiklehrkraft/nanobana/gemini-2_5-flash-image_Mathematiklehrkraft-0_c44dcf64-05cc-4d0c-ac2c-49cb64687a11.webp',
      '/images/generated/lateinlehrkraft/flux2pro/flux-pro-2_0_Lateinlehrkraft-0_a8616a2a-3537-493c-b101-979458f9b153.webp',
      '/images/generated/kunstlehrkraft/gpt-image-1-5/gpt-image-1_5_Kunstlehrkraft-0_19aa7bc1-b22b-4f2c-980f-cdd656308da5.webp',
      '/images/generated/franzoesischlehrkraft/nanobana/gemini-2_5-flash-image_Franz_sischlehrkraft-0_27d8fecd-6207-48b8-a049-40c770741507.webp',
    ],
  },
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
    <div className="relative">
      {/* Hero background image */}
      <div
        className="absolute inset-x-0 top-0 h-[600px] md:h-[700px] overflow-hidden pointer-events-none hidden dark:block"
        aria-hidden="true"
      >
        <img
          src={resolveAssetPath('/images/ui/hero-bg.webp')}
          alt=""
          className="w-full h-full object-cover object-center opacity-30 dark:opacity-25"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--color-bg)_100%)]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:py-20">

        {/* 1. HERO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="mb-6">
            <img
              src={resolveAssetPath('/branding/ki-blick-logo.webp')}
              alt="KI:Blick Logo"
              className="mx-auto h-auto w-full max-w-xl"
              loading="eager"
            />
            <h1 className="sr-only">KI:Blick</h1>
          </div>
          {/* Claim – groß, elegant, font-medium */}
          <p className="font-display text-3xl md:text-4xl lg:text-5xl dark:text-[var(--color-primary)] text-slate-800 mb-4 tracking-tight font-medium">
            Bilder, Bias und Blickwinkel
          </p>
          {/* Stats – klein, dezent, zwischen Claim und Frage */}
          <p className="text-sm dark:text-[var(--color-muted)] text-slate-500 mb-8">
            480 Bilder · 3 KI-Modelle · 10 Fächer · 4 Lernpfade · 0 Tracking
          </p>
          {/* Provokante Frage */}
          <p className="font-display text-2xl md:text-3xl dark:text-[var(--color-primary)] text-slate-900 font-semibold max-w-2xl mx-auto leading-snug">
            Wenn du eine KI bittest, eine Lehrkraft zu zeichnen –
            <br className="hidden md:block" />
            was glaubst du,{' '}
            <span className="text-[var(--color-accent)]">wen sie zeigt?</span>
          </p>
        </motion.div>

        {/* 2. TEASER-CAROUSEL */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={revealVariants}
          className="mb-16"
        >
          {/* Kurze Überleitung – kein H2, nur ein Satz */}
          <p className="text-center text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-8">
            Ein Prompt. 16 Bilder. Was fällt auf?
          </p>

          <TeaserSpotlight items={TEASER_ITEMS} />

          {/* Narrativer Abschluss-Satz mit Bereichsfarben */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mt-10 text-base dark:text-[var(--color-secondary)] text-slate-600 max-w-xl mx-auto leading-relaxed"
          >
            <span style={{ color: 'var(--color-area-verstehen)' }}>Verstehen</span>, wie KI Bilder erzeugt.{' '}
            <span style={{ color: 'var(--color-area-entdecken)' }}>Entdecken</span>, welche Muster entstehen.{' '}
            <span style={{ color: 'var(--color-area-einordnen)' }}>Einordnen</span>, was das bedeutet.
          </motion.p>
        </motion.section>

        {/* 3. EINSTIEG WÄHLEN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="text-base font-medium dark:text-[var(--color-secondary)] text-slate-600 mb-6">
            Wie möchtest du starten?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
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
          <div className="flex items-center justify-center gap-3 text-sm">
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
        </motion.div>

        {/* 4. AREA CARDS – 2×2 Grid mit Hintergrundbild */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20"
          data-tour="area-cards"
        >
          {AREAS.map(area => (
            <motion.div key={area.path} variants={itemVariants}>
              <Link
                to={area.path}
                style={{ '--card-area-color': area.color } as React.CSSProperties}
                className="group relative block p-6 rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white transition-all duration-300 ease-out no-underline area-card-hover overflow-hidden"
              >
                {/* Hintergrundbild – nur im Dark Mode */}
                <div className="absolute inset-0 hidden dark:block overflow-hidden rounded-2xl pointer-events-none" aria-hidden="true">
                  <img
                    src={resolveAssetPath(`/images/ui/area-${area.area}.webp`)}
                    alt=""
                    className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-card)] via-[var(--color-card)]/60 to-transparent" />
                </div>

                {/* Inhalt */}
                <div className="relative">
                  <h2
                    className="text-xl font-semibold mb-2 transition-colors duration-300"
                    style={{ color: area.color }}
                  >
                    {area.title}
                  </h2>
                  <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed">
                    {area.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Coming-Soon „Erfahren" – volle Breite, horizontales Layout */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <div className="relative p-5 rounded-2xl border border-rose-500/20 dark:bg-[var(--color-card)] bg-white opacity-60 cursor-default overflow-hidden">
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-400 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-base font-semibold dark:text-[var(--color-secondary)] text-slate-500">Erfahren</h2>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-rose-500/40 text-rose-400 bg-rose-500/10">Demnächst</span>
                  </div>
                  <p className="text-sm dark:text-[var(--color-muted)] text-slate-400">Clickwork-Simulator, KI-Erkennung und mehr.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 5. FOOTER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center space-y-2"
        >
          <div className="mb-4">
            <p className="text-xs uppercase tracking-widest dark:text-[var(--color-muted)] text-slate-400 mb-2">
              Pr&auml;sentiert von
            </p>
            <a
              href="https://kmz-es.de/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kreismedienzentrum Esslingen Website"
              className="inline-block"
            >
              <img
                src={resolveAssetPath('/branding/kmz-logo.png')}
                alt="Kreismedienzentrum Esslingen"
                className="mx-auto h-auto w-full max-w-[260px] dark:hidden"
                loading="lazy"
              />
              <img
                src={resolveAssetPath('/branding/kmz-logo-dark.png')}
                alt="Kreismedienzentrum Esslingen"
                className="mx-auto h-auto w-full max-w-[260px] hidden dark:block"
                loading="lazy"
              />
            </a>
          </div>

          <p className="text-xs dark:text-[var(--color-muted)] text-slate-400">
            <a
              href="https://github.com/h4r7w16/KI-Blick-preview"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-accent)] transition-colors no-underline"
            >
              Code auf GitHub
            </a>
            {' · MIT-Lizenz · Inhalte: '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/deed.de"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-accent)] transition-colors no-underline"
            >
              CC BY-SA 4.0
            </a>
          </p>
        </motion.div>

      </div>
    </div>
  );
}
