import type { FeedbackArea } from '../types/feedback.types';

export const POSITIVE_OPTIONS: Record<FeedbackArea, string[]> = {
  verstehen:  ['Die Erklärung', 'Das Beispiel', 'Die Grafik/Animation', 'Die klare Sprache'],
  entdecken:  ['Die Bildbeispiele', 'Der Modellvergleich', 'Das Analyse-Tool', 'Die freie Navigation'],
  einordnen:  ['Der Bezug zur Realität', 'Die Erklärung des Begriffs', 'Das Beispiel', 'Die Reflexionsfrage'],
  lernen:     ['Die Reihenfolge', 'Die Aufgabe', 'Der Wissensteil', 'Der Praxisbezug'],
};

export const NEGATIVE_OPTIONS: string[] = [
  'Zu viel Text',
  'Inhalt unklar',
  'Aufgabe unklar',
  'Navigation unklar',
  'Technisches Problem',
  'Nicht relevant für mich',
];

export const HELPFULNESS_SCALE = [
  { value: '5', label: 'Sehr hilfreich' },
  { value: '4', label: 'Eher hilfreich' },
  { value: '3', label: 'Teilweise' },
  { value: '2', label: 'Eher nicht' },
  { value: '1', label: 'Gar nicht' },
] as const;
