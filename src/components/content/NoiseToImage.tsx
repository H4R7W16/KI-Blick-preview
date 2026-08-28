import { motion, useReducedMotion } from 'framer-motion';
import { getSeries } from '../../data/imageMetadata';
import { resolveAssetPath } from '../../utils/assetPath';

interface NoiseToImageProps {
  compact?: boolean;
}

export default function NoiseToImage({ compact = false }: NoiseToImageProps) {
  const reduceMotion = useReducedMotion();
  const series = getSeries('mathematiklehrkraft', 'flux2pro');
  const previewImage = series?.images[0];
  const previewSrc = series && previewImage
    ? resolveAssetPath(`${series.basePath}/${previewImage.filename}`)
    : resolveAssetPath('/images/generated/mathematiklehrkraft/flux2pro/_kontaktblatt.webp');

  const dots = Array.from({ length: compact ? 28 : 60 }, (_, index) => index);

  return (
    <div className="rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4">
      <div className="grid md:grid-cols-3 gap-4 items-center">
        <div>
          <p className="text-xs uppercase tracking-wider dark:text-[var(--color-muted)] text-slate-500 mb-2">
            Start: Noise
          </p>
          <div className="relative h-28 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
            {dots.map(dot => (
              <motion.span
                key={dot}
                className="absolute h-1.5 w-1.5 rounded-full bg-slate-500/80 dark:bg-slate-300/70"
                style={{
                  left: `${(dot * 37) % 100}%`,
                  top: `${(dot * 53) % 100}%`,
                }}
                animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 2 + (dot % 5) * 0.25,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <motion.div
            className="h-1 w-20 rounded-full bg-[var(--color-area-verstehen)]"
            animate={reduceMotion ? undefined : { scaleX: [0.5, 1, 0.5], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider dark:text-[var(--color-muted)] text-slate-500 mb-2">
            Ende: Bildstruktur
          </p>
          <motion.div
            className="h-28 rounded-lg overflow-hidden border border-[var(--color-border)]"
            animate={
              reduceMotion
                ? undefined
                : {
                    filter: ['blur(6px)', 'blur(3px)', 'blur(1px)', 'blur(0px)'],
                  }
            }
            transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.5 }}
          >
            <img
              src={previewSrc}
              alt="Vereinfachte Visualisierung eines Entrauschungsprozesses"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
