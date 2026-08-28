import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUnitsByArea } from '../data/knowledgeUnits';
import { useProgress } from '../contexts/ProgressContext';
import AreaHeroIllustration from '../components/ui/AreaHeroIllustration';

const units = getUnitsByArea('einordnen');

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function EinordnenPage() {
  const { progress } = useProgress();

  return (
    <div className="max-w-4xl mx-auto px-4 pt-0 pb-8 md:pb-12">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-10 rounded-2xl p-6 md:p-10"
      >
        <AreaHeroIllustration area="einordnen" />
        <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-3 h-3 rounded-full bg-[var(--color-area-einordnen)]" />
          <span className="text-sm font-medium text-[var(--color-area-einordnen)] uppercase tracking-wider">
            Einordnen
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-4">
          Bias verstehen und bewerten
        </h1>
        <p className="text-base md:text-lg dark:text-[var(--color-secondary)] text-slate-600 max-w-2xl leading-relaxed">
          Fünf Wissenseinheiten helfen dir, die Beobachtungen aus dem Entdecken-Bereich einzuordnen: von Bias-Mustern über gesellschaftliche Wirkung bis zur verantwortungsvollen Nutzung.
        </p>
        <p className="text-sm dark:text-[var(--color-muted)] text-slate-500 mt-3">
          5 Wissenseinheiten · 18 Checkouts · ~40 Min. Lernzeit
        </p>
        </div>
      </motion.div>

      <div className="relative">
        {/* Verbindungslinie */}
        <div
          className="absolute left-6 top-10 bottom-10 w-px border-l-2 border-dashed hidden md:block"
          style={{ borderColor: 'color-mix(in srgb, var(--color-area-einordnen) 20%, transparent)' }}
          aria-hidden="true"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {units.map(unit => {
            const visited = progress.visitedUnits.includes(unit.id);
            return (
              <React.Fragment key={unit.id}>
                {/* Cluster-Übergang nach E3 */}
                {unit.id === 'e4' && (
                  <div className="flex items-center gap-3 my-4 md:ml-12" aria-hidden="true">
                    <div className="flex-1 h-px" style={{ backgroundColor: 'color-mix(in srgb, var(--color-area-einordnen) 20%, transparent)' }} />
                    <span className="text-xs uppercase tracking-wider px-3 whitespace-nowrap" style={{ color: 'color-mix(in srgb, var(--color-area-einordnen) 50%, transparent)' }}>
                      Von der Analyse zur Verantwortung
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'color-mix(in srgb, var(--color-area-einordnen) 20%, transparent)' }} />
                  </div>
                )}

                <motion.div variants={itemVariants} className="relative">
                  {/* Knotenpunkt */}
                  {unit.id === 'e4' ? (
                    <div
                      className="absolute left-[20px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 hidden md:block"
                      style={{
                        borderColor: 'color-mix(in srgb, var(--color-area-einordnen) 50%, transparent)',
                        backgroundColor: 'var(--color-bg)',
                      }}
                      aria-hidden="true"
                    />
                  ) : (
                    <div
                      className="absolute left-[22px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full hidden md:block"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--color-area-einordnen) 40%, transparent)' }}
                      aria-hidden="true"
                    />
                  )}

                <div className="md:ml-12">
                  <Link
                    to={`/einordnen/${unit.id}`}
                    className="group block p-6 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white area-card-hover no-underline"
                    style={{ '--card-area-color': 'var(--color-area-einordnen)' } as React.CSSProperties}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--color-area-einordnen) 15%, transparent)',
                          color: 'var(--color-area-einordnen)',
                        }}
                      >
                        E{unit.number}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 transition-colors">
                            {unit.title}
                          </h2>
                          {visited && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)]">
                              besucht
                            </span>
                          )}
                        </div>
                        <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">
                          {unit.description}
                        </p>
                      </div>
                      <svg className="w-5 h-5 flex-shrink-0 dark:text-[var(--color-muted)] text-slate-400 group-hover:text-[var(--color-area-einordnen)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
