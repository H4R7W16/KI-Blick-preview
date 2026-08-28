import { LEARNING_PATHS } from './learningPaths';

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  shortLabel: string;
  color: string;
}

type BadgePreset = Omit<BadgeDefinition, 'id'>;

const PATH_BADGE_PRESETS: Record<string, BadgePreset> = {
  'badge-wer-unterrichtet': {
    title: 'Bias-Detektiv',
    description: 'Lernpfad "Wer unterrichtet hier?" abgeschlossen.',
    shortLabel: 'BIAS',
    color: 'var(--color-area-lernen)',
  },
  'badge-brot-baguette': {
    title: 'Kultur-Kompass',
    description: 'Lernpfad "Brot, Baguette, Pao" abgeschlossen.',
    shortLabel: 'KULT',
    color: 'var(--color-area-einordnen)',
  },
  'badge-drei-modelle': {
    title: 'Modell-Scout',
    description: 'Lernpfad "Drei Modelle, drei Blicke" abgeschlossen.',
    shortLabel: 'MOD',
    color: 'var(--color-area-verstehen)',
  },
  'badge-vom-muster': {
    title: 'Reflexions-Profi',
    description: 'Lernpfad "Vom Muster zur Verantwortung" abgeschlossen.',
    shortLabel: 'REF',
    color: 'var(--color-area-einordnen)',
  },
};

const META_BADGES: BadgeDefinition[] = [
  {
    id: 'badge-lernpfad-komplett',
    title: 'Komplett-Paket',
    description: 'Alle Lernpfade abgeschlossen.',
    shortLabel: '4/4',
    color: 'var(--color-warning)',
  },
];

function buildPathBadges(): BadgeDefinition[] {
  return LEARNING_PATHS.flatMap(path => {
    if (!path.badgeId) {
      return [];
    }

    const preset = PATH_BADGE_PRESETS[path.badgeId];
    const fallback: BadgeDefinition = {
      id: path.badgeId,
      title: path.title,
      description: `Lernpfad "${path.title}" abgeschlossen.`,
      shortLabel: 'PATH',
      color: 'var(--color-area-lernen)',
    };

    return [
      {
        ...fallback,
        ...(preset ?? {}),
        id: path.badgeId,
      },
    ];
  });
}

const PATH_BADGES = buildPathBadges();
export const BADGE_DEFINITIONS: BadgeDefinition[] = [...PATH_BADGES, ...META_BADGES];

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find(badge => badge.id === id);
}

export function getAutoAwardedBadges(completedPathIds: string[]): string[] {
  const completedPathSet = new Set(completedPathIds);
  const autoBadges: string[] = [];

  LEARNING_PATHS.forEach(path => {
    if (!path.badgeId) {
      return;
    }
    if (completedPathSet.has(path.id)) {
      autoBadges.push(path.badgeId);
    }
  });

  const allPathsCompleted =
    LEARNING_PATHS.length > 0 &&
    LEARNING_PATHS.every(path => completedPathSet.has(path.id));

  if (allPathsCompleted) {
    autoBadges.push('badge-lernpfad-komplett');
  }

  return [...new Set(autoBadges)];
}
