import type { CheckoutElement, KnowledgeUnit } from '../types/knowledge.types';
import { VERSTEHEN_CHECKOUTS, VERSTEHEN_CONTENT } from './verstehenContent';
import { EINORDNEN_CHECKOUTS, EINORDNEN_CONTENT } from './einordnenContent';

export const KNOWLEDGE_UNITS: KnowledgeUnit[] = [
  // Verstehen (V1-V3)
  {
    id: 'v1',
    area: 'verstehen',
    number: 1,
    title: 'Vom Text zum Bild',
    description: 'Grundprinzip Text-zu-Bild: Was passiert bei einem Prompt? Rolle des Zufallselements (darum sehen 16 Bilder zum selben Prompt unterschiedlich aus).',
    level: 2,
    content: VERSTEHEN_CONTENT.v1,
  },
  {
    id: 'v2',
    area: 'verstehen',
    number: 2,
    title: 'Was die KI gelernt hat',
    description: 'Trainingsdaten als Grundlage: Woher kommen die Bilder? Warum spiegeln Ergebnisse wider, was im Internet existiert?',
    level: 2,
    content: VERSTEHEN_CONTENT.v2,
  },
  {
    id: 'v3',
    area: 'verstehen',
    number: 3,
    title: 'Muster lesen',
    description: 'Lerne, KI-Bildserien systematisch zu lesen: Default erkennen, Variation beschreiben, Lücken benennen und Modelle vergleichen.',
    level: 2,
    content: VERSTEHEN_CONTENT.v3,
  },
  // Einordnen (E1-E5)
  {
    id: 'e1',
    area: 'einordnen',
    number: 1,
    title: 'Muster erkennen',
    description: 'Nutze dein Analyse-Werkzeug auf Menschenbildern und entdecke Bias-Muster: Geschlecht, Kultur, Alter und Rollenbilder.',
    level: 2,
    content: EINORDNEN_CONTENT.e1,
  },
  {
    id: 'e2',
    area: 'einordnen',
    number: 2,
    title: 'Spiegel oder Zerrspiegel?',
    description: 'Vergleiche KI-Bilder mit der Realität und ordne sie ein: Spiegel, Verstärker oder Erfinder?',
    level: 2,
    content: EINORDNEN_CONTENT.e2,
  },
  {
    id: 'e3',
    area: 'einordnen',
    number: 3,
    title: 'Bilder wirken',
    description: 'Teste in einem Mini-Experiment, wie Bildserien Vorstellungen prägen – und warum Repräsentation zählt.',
    level: 2,
    content: EINORDNEN_CONTENT.e3,
  },
  {
    id: 'e4',
    area: 'einordnen',
    number: 4,
    title: 'Strom für Pixel',
    description: 'Was kostet ein KI-Bild? Rechne Energie- und CO₂-Fußabdruck nach und ordne den Ressourcenverbrauch ein.',
    level: 2,
    content: EINORDNEN_CONTENT.e4,
  },
  {
    id: 'e5',
    area: 'einordnen',
    number: 5,
    title: 'Bewusst generieren',
    description: 'Vergleiche drei Prompt-Strategien an echten Ergebnissen – und lerne, welche Hebel (und Grenzen) du beim Generieren hast.',
    level: 2,
    content: EINORDNEN_CONTENT.e5,
  },
];

export function getUnitsByArea(area: 'verstehen' | 'einordnen'): KnowledgeUnit[] {
  return KNOWLEDGE_UNITS.filter(u => u.area === area);
}

export function getUnitById(id: string): KnowledgeUnit | undefined {
  return KNOWLEDGE_UNITS.find(u => u.id === id);
}

export function getCheckoutByUnitId(id: string): CheckoutElement | undefined {
  if (id === 'v1' || id === 'v2' || id === 'v3') {
    return VERSTEHEN_CHECKOUTS[id as 'v1' | 'v2' | 'v3'];
  }
  if (id === 'e1' || id === 'e2' || id === 'e3' || id === 'e4' || id === 'e5') {
    return EINORDNEN_CHECKOUTS[id as 'e1' | 'e2' | 'e3' | 'e4' | 'e5'];
  }
  return undefined;
}
