import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUnitsByArea } from '../data/knowledgeUnits';
import { useProgress } from '../contexts/ProgressContext';
import AreaHeroIllustration from '../components/ui/AreaHeroIllustration';

const units = getUnitsByArea('verstehen');

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function VerstehenPage() {
  const { progress } = useProgress();

  return (
    <div className="max-w-4xl mx-auto px-4 pt-0 pb-8 md:pb-12">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-10 rounded-2xl p-6 md:p-10"
      >
        <AreaHeroIllustration area="verstehen" />
        <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-3 h-3 rounded-full bg-[var(--color-area-verstehen)]" />
          <span className="text-sm font-medium text-[var(--color-area-verstehen)] uppercase tracking-wider">
            Verstehen
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-4">
          Wie KI Bilder erzeugt
        </h1>
        <p className="text-base md:text-lg dark:text-[var(--color-secondary)] text-slate-600 max-w-2xl leading-relaxed">
          Drei Wissenseinheiten erklären dir die Grundlagen generativer Bild-KI: vom Prompt bis zum fertigen Bild.
        </p>
        <p className="text-sm dark:text-[var(--color-muted)] text-slate-500 mt-3">
          3 Wissenseinheiten · 12 interaktive Checkouts · ~25 Min. Lernzeit
        </p>
        </div>
      </motion.div>

      <div className="relative">
        {/* Verbindungslinie */}
        <div
          className="absolute left-6 top-10 bottom-10 w-px border-l-2 border-dashed hidden md:block"
          style={{ borderColor: 'color-mix(in srgb, var(--color-area-verstehen) 20%, transparent)' }}
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
              <motion.div key={unit.id} variants={itemVariants} className="relative">
                {/* Knotenpunkt */}
                <div
                  className="absolute left-[22px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full hidden md:block"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-area-verstehen) 40%, transparent)' }}
                  aria-hidden="true"
                />

                <div className="md:ml-12">
                  <Link
                    to={`/verstehen/${unit.id}`}
                    className="group block p-6 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white area-card-hover no-underline"
                    style={{ '--card-area-color': 'var(--color-area-verstehen)' } as React.CSSProperties}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--color-area-verstehen) 15%, transparent)',
                          color: 'var(--color-area-verstehen)',
                        }}
                      >
                        V{unit.number}
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
                      <svg className="w-5 h-5 flex-shrink-0 dark:text-[var(--color-muted)] text-slate-400 group-hover:text-[var(--color-area-verstehen)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
