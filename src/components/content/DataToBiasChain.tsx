import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';

interface ChainNode {
  id: string;
  label: string;
  description: string;
  hasBiasWarning: boolean;
  icon: React.ReactNode;
}

const NODES: ChainNode[] = [
  {
    id: 'internet',
    label: 'Internet',
    hasBiasWarning: true,
    description: 'Daten spiegeln, wer online ist – und wer nicht.',
    icon: (
      <circle cx="12" cy="12" r="9" strokeWidth="2" fill="none" stroke="currentColor">
        <animate attributeName="r" values="9;9" dur="0s" />
      </circle>
    ),
  },
  {
    id: 'crawler',
    label: 'Crawler',
    hasBiasWarning: true,
    description: 'Sammelt ungefiltert. Alt-Texte sind oft fehlerhaft oder einseitig.',
    icon: (
      <>
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'dataset',
    label: 'Datensatz',
    hasBiasWarning: true,
    description: 'Die Zusammensetzung bestimmt, was das Modell lernen kann.',
    icon: (
      <>
        <ellipse cx="12" cy="8" rx="8" ry="4" strokeWidth="2" fill="none" />
        <path d="M4 8v5c0 2.2 3.6 4 8 4s8-1.8 8-4V8" strokeWidth="2" fill="none" />
        <path d="M4 13v5c0 2.2 3.6 4 8 4s8-1.8 8-4v-5" strokeWidth="2" fill="none" />
      </>
    ),
  },
  {
    id: 'training',
    label: 'Training',
    hasBiasWarning: false,
    description: 'Das Modell erkennt statistische Muster – auch unerwünschte.',
    icon: (
      <>
        <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" strokeWidth="2" fill="none" strokeLinejoin="round" />
      </>
    ),
  },
  {
    id: 'model',
    label: 'Modell',
    hasBiasWarning: false,
    description: 'Speichert die gelernten Muster. Bias ist jetzt eingebacken.',
    icon: (
      <rect x="4" y="4" width="16" height="16" rx="3" strokeWidth="2" fill="none" />
    ),
  },
  {
    id: 'image',
    label: 'Bild',
    hasBiasWarning: false,
    description: 'Das Ergebnis zeigt die Muster der Daten – nicht die Realität.',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" fill="none" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path d="M21 15l-5-5L5 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

export default function DataToBiasChain() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      {/* Chain */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1 md:gap-0">
        {NODES.map((node, i) => {
          const isActive = activeNode === node.id;
          return (
            <div key={node.id} className="flex flex-col md:flex-row items-center flex-1">
              <button
                type="button"
                onClick={() => setActiveNode(isActive ? null : node.id)}
                className="relative flex flex-col items-center gap-2 p-3 rounded-xl transition-colors w-full md:w-auto"
                style={{
                  backgroundColor: isActive ? `color-mix(in srgb, ${areaColor} 12%, transparent)` : 'transparent',
                }}
                aria-expanded={isActive}
                aria-label={`${node.label}: Details ${isActive ? 'schließen' : 'anzeigen'}`}
              >
                {/* Bias warning */}
                {node.hasBiasWarning && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
                    style={{ backgroundColor: 'var(--color-warning)', color: '#fff' }}
                    title="Hier entsteht der Bias"
                  >
                    ⚠
                  </span>
                )}

                <motion.div
                  animate={
                    isActive && !reduceMotion
                      ? { scale: [1, 1.08, 1] }
                      : { scale: 1 }
                  }
                  transition={
                    isActive && !reduceMotion
                      ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                      : undefined
                  }
                  className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors"
                  style={{
                    borderColor: isActive ? areaColor : 'var(--color-border)',
                    color: isActive ? areaColor : 'var(--color-secondary)',
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {node.icon}
                  </svg>
                </motion.div>
                <span
                  className="text-[11px] md:text-xs font-medium text-center leading-tight"
                  style={{ color: isActive ? areaColor : 'var(--color-secondary)' }}
                >
                  {node.label}
                </span>
              </button>

              {/* Connector */}
              {i < NODES.length - 1 && (
                <div className="flex items-center justify-center">
                  <svg className="md:hidden" width="2" height="12" viewBox="0 0 2 12" aria-hidden="true">
                    <line x1="1" y1="0" x2="1" y2="12" stroke="var(--color-border)" strokeWidth="2" />
                  </svg>
                  <svg className="hidden md:block" width="16" height="8" viewBox="0 0 16 8" aria-hidden="true">
                    <path d="M0 4h12M10 1l4 3-4 3" stroke="var(--color-border)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bias marker legend */}
      <div className="flex items-center gap-1.5 justify-center mt-3">
        <span
          className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]"
          style={{ backgroundColor: 'var(--color-warning)', color: '#fff' }}
        >
          ⚠
        </span>
        <span className="text-[10px] dark:text-[var(--color-muted)] text-slate-500">
          = Hier entsteht der Bias
        </span>
      </div>

      {/* Active node description */}
      {activeNode && (
        <motion.div
          key={activeNode}
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 p-4 rounded-xl border text-sm dark:text-[var(--color-secondary)] text-slate-600 leading-relaxed"
          style={{
            borderColor: `color-mix(in srgb, ${areaColor} 30%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${areaColor} 5%, transparent)`,
          }}
        >
          <strong style={{ color: areaColor }}>
            {NODES.find(n => n.id === activeNode)?.label}:
          </strong>{' '}
          {NODES.find(n => n.id === activeNode)?.description}
        </motion.div>
      )}

      {!activeNode && (
        <p className="mt-4 text-xs text-center dark:text-[var(--color-muted)] text-slate-500">
          Klicke auf einen Schritt, um mehr zu erfahren.
        </p>
      )}

      {/* Bottom text */}
      <p className="mt-4 text-sm text-center dark:text-[var(--color-secondary)] text-slate-600 italic">
        Der Prompt aktiviert die gelernten Muster. Aber die Muster wurden von den Daten geformt.
      </p>
    </section>
  );
}
