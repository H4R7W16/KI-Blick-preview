import { motion } from 'framer-motion';
import { resolveAssetPath } from '../../utils/assetPath';

interface AreaHeroIllustrationProps {
  area: 'verstehen' | 'entdecken' | 'einordnen' | 'lernen';
}

/**
 * Decorative background illustration for area landing pages.
 * Must be placed as the first child inside the hero motion.div,
 * which needs position: relative (already present via rounded-2xl p-6 md:p-10).
 * Rendered only in dark mode (hidden dark:block).
 */
export default function AreaHeroIllustration({ area }: AreaHeroIllustrationProps) {
  const src = resolveAssetPath(`/images/ui/area-${area}.webp`);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="absolute inset-y-0 left-1/2 hidden w-screen -translate-x-1/2 overflow-hidden pointer-events-none dark:block"
      aria-hidden="true"
    >
      <img
        src={src}
        alt=""
        className="h-full w-full select-none object-cover object-center"
        loading="eager"
        onError={(e) => {
          // Fallback: hide element if asset is missing - no broken image, no layout shift
          (e.target as HTMLElement).parentElement!.style.display = 'none';
        }}
      />
      {/* Gradient overlay: fade into page background at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 20%, var(--color-bg) 100%)',
        }}
      />
      {/* Semi-transparent overlay so text above stays readable */}
      <div className="absolute inset-0 bg-[var(--color-bg)]/60" />
    </motion.div>
  );
}
