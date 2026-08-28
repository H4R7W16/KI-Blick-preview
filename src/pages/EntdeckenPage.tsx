import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SUBJECTS, SUBJECT_GROUPS, isAnalysisEnabledForSubject } from '../data/subjects';
import { getSeries } from '../data/imageMetadata';
import { resolveAssetPath } from '../utils/assetPath';
import AreaHeroIllustration from '../components/ui/AreaHeroIllustration';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

const SPORT_PREVIEW_FILENAME = 'flux-pro-2_0_Sportlehrkraft-1_faa9afc6-bcad-4a05-b1f9-078783922c0b.webp';

export default function EntdeckenPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-0 pb-8 md:pb-12">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-10 rounded-2xl p-6 md:p-10"
      >
        <AreaHeroIllustration area="entdecken" />
        <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-3 h-3 rounded-full bg-[var(--color-area-entdecken)]" />
          <span className="text-sm font-medium text-[var(--color-area-entdecken)] uppercase tracking-wider">
            Entdecken
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-4">
          Bildergalerie
        </h1>
        <p className="text-base md:text-lg dark:text-[var(--color-secondary)] text-slate-600 max-w-2xl leading-relaxed">
          Wähle ein Fach und erkunde, wie drei verschiedene KI-Modelle Lehrkräfte darstellen.
          Jede Serie zeigt 16 Bilder, die mit dem identischen Prompt erzeugt wurden.
        </p>
        </div>
      </motion.div>

      {/* Subject groups */}
      {Object.entries(SUBJECT_GROUPS).map(([groupName, slugs]) => (
        <div key={groupName} className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider dark:text-[var(--color-muted)] text-slate-400 mb-4">
            {groupName}
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            data-tour="subject-grid"
          >
            {slugs.map(slug => {
              const subject = SUBJECTS.find(s => s.slug === slug);
              if (!subject) return null;
              const analysisEnabled = isAnalysisEnabledForSubject(slug);
              const series = getSeries(slug, 'flux2pro');
              const previewImage = slug === 'sportlehrkraft'
                ? (series?.images.find(image => image.filename === SPORT_PREVIEW_FILENAME) ?? series?.images[0])
                : series?.images[0];
              const previewSrc = series && previewImage
                ? resolveAssetPath(`${series.basePath}/${previewImage.filename}`)
                : undefined;

              return (
                <motion.div key={slug} variants={itemVariants}>
                  <Link
                    to={`/entdecken/${slug}`}
                    className="group block rounded-xl overflow-hidden border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white hover:border-[var(--color-area-entdecken)]/50 transition-all duration-300 no-underline"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[var(--color-surface)]">
                      {previewSrc ? (
                        <img
                          src={previewSrc}
                          alt={`Vorschau: ${subject.prompt}`}
                          loading="lazy"
                          onError={event => {
                            const img = event.currentTarget;
                            const src = img.getAttribute('src');
                            if (!src || img.dataset.fallbackApplied === '1') return;

                            const match = src.match(/\/(images|videos)\//);
                            if (match) {
                              const index = src.indexOf(`/${match[1]}/`);
                              const relative = src.slice(index + 1);
                              if (relative && relative !== src) {
                                img.dataset.fallbackApplied = '1';
                                img.src = relative;
                              }
                              return;
                            }

                            if (src.startsWith('/')) {
                              const relative = src.slice(1);
                              if (relative && relative !== src) {
                                img.dataset.fallbackApplied = '1';
                                img.src = relative;
                              }
                            }
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center dark:text-[var(--color-muted)] text-slate-400">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold dark:text-[var(--color-primary)] text-slate-900 group-hover:text-[var(--color-area-entdecken)] transition-colors">
                        {subject.label}
                      </h3>
                      <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mt-1">
                        3 Modelle &middot; 48 Bilder
                      </p>
                      {analysisEnabled && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-area-entdecken)]/10 border border-[var(--color-area-entdecken)]/30">
                          <svg className="w-3 h-3 text-[var(--color-area-entdecken)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="text-[10px] font-medium text-[var(--color-area-entdecken)]">Analyse verfügbar</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      ))}

      {/* Info box */}
      <div className="mt-8 p-6 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white">
        <h3 className="text-sm font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-2">
          Wie wurden die Bilder erzeugt?
        </h3>
        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed">
          Alle Bilder wurden mit einem identischen, minimalistischen und geschlechtsneutralen Prompt in deutscher Sprache
          generiert (z.B. &bdquo;Mathematiklehrkraft&ldquo;). Die Formulierung in deutscher Sprache ist eine bewusste
          Entscheidung, um die Passung zur Lebenswelt der Lernenden zu gewährleisten. Pro Prompt und Modell wurden 16
          Bilder erzeugt.
        </p>
      </div>
    </div>
  );
}

