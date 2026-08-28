import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useArea, getAreaColorVar } from '../../contexts/AreaContext';

interface PipelineNode {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const NODES: PipelineNode[] = [
  {
    id: 'prompt',
    label: 'Prompt',
    description: 'Du gibst einen Text ein – z. B. „Leuchtturm". Dieser Text ist die einzige Steuerungseinheit für das Ergebnis.',
    icon: (
      <path d="M4 6h16M4 12h10M4 18h6" strokeWidth={2} strokeLinecap="round" />
    ),
  },
  {
    id: 'encoder',
    label: 'Text-Encoder',
    description: 'Der Prompt wird in einen mathematischen Vektor übersetzt – eine Zahlenfolge, die das Modell als Zielrichtung versteht.',
    icon: (
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M7.05 7.05l2.12 2.12m5.66 5.66l2.12 2.12M7.05 16.95l2.12-2.12m5.66-5.66l2.12-2.12" strokeWidth={2} strokeLinecap="round" />
    ),
  },
  {
    id: 'latent',
    label: 'Latent Space + Seed',
    description: 'Der Seed erzeugt ein zufälliges Rauschfeld im komprimierten Bildraum (Latent Space). Hier startet der Generierungsprozess.',
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={2} />
        <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={2} />
        <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={2} />
        <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth={2} />
      </>
    ),
  },
  {
    id: 'denoising',
    label: 'Denoising',
    description: 'In 20–50 Schritten entfernt das Modell geschätztes Rauschen. Mit jedem Schritt werden Strukturen, Kanten und Details sichtbarer.',
    icon: (
      <path d="M4 12a8 8 0 1 1 16 0M12 4v4m0 8v4M8 8l2 2m4 4l2 2" strokeWidth={2} strokeLinecap="round" />
    ),
  },
  {
    id: 'decoder',
    label: 'Decoder',
    description: 'Das entrauschte Ergebnis wird aus dem komprimierten Latent Space in volle Bildauflösung umgerechnet.',
    icon: (
      <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0zM10 7v6m-3-3h6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    id: 'image',
    label: 'Bild',
    description: 'Das fertige Bild – eine Neuberechnung, die es vorher nicht gab. Keine Kopie, kein Fund aus dem Internet.',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path d="M21 15l-5-5L5 21" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

export default function PipelineOverview() {
  const area = useArea();
  const areaColor = getAreaColorVar(area);
  const reduceMotion = useReducedMotion();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-5 md:p-6">
      {/* Pipeline nodes */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1 md:gap-0">
        {NODES.map((node, i) => {
          const isActive = activeNode === node.id;
          return (
            <div key={node.id} className="flex flex-col md:flex-row items-center flex-1">
              {/* Node */}
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
                  {/* Vertical connector on mobile */}
                  <svg
                    className="md:hidden"
                    width="2"
                    height="16"
                    viewBox="0 0 2 16"
                    aria-hidden="true"
                  >
                    <line x1="1" y1="0" x2="1" y2="16" stroke="var(--color-border)" strokeWidth="2" />
                  </svg>
                  {/* Horizontal connector on desktop */}
                  <svg
                    className="hidden md:block"
                    width="20"
                    height="2"
                    viewBox="0 0 20 2"
                    aria-hidden="true"
                  >
                    <line x1="0" y1="1" x2="20" y2="1" stroke="var(--color-border)" strokeWidth="2" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip / description */}
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
    </section>
  );
}
