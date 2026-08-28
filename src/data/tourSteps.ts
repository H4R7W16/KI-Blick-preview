import type { PopperPlacement } from 'shepherd.js';

export type TourVariant = 'schueler' | 'lehrkraft' | 'neugierig';

export type TourStepConfig = {
  id: string;
  title: string;
  text: string;
  attachTo?: { element: string; on: PopperPlacement };
  navigateTo?: string;
  sidebarEvent?: 'left' | 'right' | 'close';
  mobileSkip?: boolean;
};

export const TOUR_STEPS: Record<TourVariant, TourStepConfig[]> = {
  schueler: [
    {
      id: 'schueler-1-bereiche',
      title: 'Vier Bereiche, ein Ziel',
      text: 'Verstehen erklärt, wie KI Bilder erzeugt. Entdecken zeigt dir 480 echte KI-Bilder. Einordnen hilft dir, Muster zu bewerten. Und Lernen führt dich Schritt für Schritt durch alles.',
      attachTo: { element: '[data-tour="area-cards"]', on: 'bottom' },
      navigateTo: '/',
    },
    {
      id: 'schueler-2-lernpfade',
      title: 'Starte hier',
      text: 'Wähle einen Lernpfad. „Wer unterrichtet hier?" ist ein guter Einstieg – du brauchst etwa 45 Minuten.',
      attachTo: { element: '[data-tour="path-grid"]', on: 'top' },
      navigateTo: '/lernen',
    },
    {
      id: 'schueler-3-fortschritt',
      title: 'Dein Fortschritt',
      text: 'Hier siehst du, was du schon geschafft hast. Für jeden abgeschlossenen Lernpfad gibt es ein Badge.',
      attachTo: { element: '[data-tour="progress"]', on: 'right' },
      sidebarEvent: 'left',
      mobileSkip: true,
    },
    {
      id: 'schueler-4-export',
      title: 'Mitnehmen',
      text: 'Mit „Fortschritt speichern" bekommst du einen Link. Damit kannst du auf einem anderen Gerät weitermachen.',
      attachTo: { element: '[data-tour="export"]', on: 'right' },
      mobileSkip: true,
    },
    {
      id: 'schueler-5-start',
      title: 'Bereit?',
      text: 'Klick auf „Starten" und leg los. Die Tour kannst du jederzeit über das Hub links nochmal starten.',
      attachTo: { element: '[data-tour="path-start-first"]', on: 'top' },
      navigateTo: '/lernen',
    },
  ],

  lehrkraft: [
    {
      id: 'lehrkraft-1-teaser',
      title: 'Das steckt drin',
      text: 'Jedes Fach, drei KI-Modelle, 16 Bilder. Informatik: 0% weiblich. Sport: 94% weiblich. Ihr Fach ist dabei.',
      attachTo: { element: '[data-tour="teaser-grid"]', on: 'bottom' },
      navigateTo: '/',
    },
    {
      id: 'lehrkraft-2-entdecken',
      title: 'Bildserien erkunden',
      text: 'Ihre Schüler:innen können hier frei explorieren oder gezielt über Lernpfade arbeiten. Modellwechsel per Regler, Analyse-Tool zuschaltbar.',
      attachTo: { element: '[data-tour="subject-grid"]', on: 'top' },
      navigateTo: '/entdecken',
    },
    {
      id: 'lehrkraft-3-lernpfade',
      title: 'Fertige Unterrichtseinheiten',
      text: 'Drei Lernpfade, 45–60 Min. Die Schritte führen durch Verstehen, Entdecken und Einordnen. Keine Vorbereitung nötig außer Tablets mit WLAN.',
      attachTo: { element: '[data-tour="path-grid"]', on: 'top' },
      navigateTo: '/lernen',
    },
    {
      id: 'lehrkraft-4-export',
      title: 'Fortschritt der Klasse',
      text: 'Jede:r arbeitet mit eigenem Nickname. Der Fortschritt liegt lokal im Browser. Mit „Fortschritt speichern" kann er auf andere Geräte übertragen werden.',
      attachTo: { element: '[data-tour="export"]', on: 'right' },
      sidebarEvent: 'left',
      mobileSkip: true,
    },
    {
      id: 'lehrkraft-5-informationen',
      title: 'Mehr erfahren',
      text: 'Einsatzszenarien, Bildungsplanbezug BW, Datenschutz – alles auf einer Seite. Kein Account, kein Tracking, DSGVO-konform.',
      attachTo: { element: '[data-tour="info-pills"]', on: 'bottom' },
      navigateTo: '/informationen',
      sidebarEvent: 'close',
    },
  ],

  neugierig: [
    {
      id: 'neugierig-1-teaser',
      title: 'Eine KI, ein Prompt, 16 Bilder',
      text: 'Wir haben drei KI-Modelle gebeten, Lehrkräfte darzustellen. Immer derselbe Prompt. Die Ergebnisse sind überraschend unterschiedlich.',
      attachTo: { element: '[data-tour="teaser-grid"]', on: 'bottom' },
      navigateTo: '/',
    },
    {
      id: 'neugierig-2-galerie',
      title: 'Schau genauer hin',
      text: '16 Bilder zu „Informatiklehrkraft". Fällt dir etwas auf? Das Analyse-Tool oben rechts zeigt dir die Daten dahinter.',
      attachTo: { element: '[data-tour="gallery-grid"]', on: 'top' },
      navigateTo: '/entdecken/informatiklehrkraft',
    },
    {
      id: 'neugierig-3-einordnen',
      title: 'Warum sieht das so aus?',
      text: 'Bias in KI-Bildern hat Ursachen: Trainingsdaten, Optimierungsziele, gesellschaftliche Muster. Hier erfährst du mehr.',
      attachTo: { element: '[data-tour="unit-hero"]', on: 'bottom' },
      navigateTo: '/einordnen/e1',
    },
    {
      id: 'neugierig-4-navigation',
      title: 'Alles auf einen Blick',
      text: 'Rechts findest du jederzeit die Übersicht: alle Wissenseinheiten, alle Fächer, alle Lernpfade.',
      attachTo: { element: '[data-tour="nav-overview"]', on: 'left' },
      sidebarEvent: 'right',
      mobileSkip: true,
    },
    {
      id: 'neugierig-5-lernen',
      title: 'Tiefer einsteigen?',
      text: 'Die Lernpfade führen dich Schritt für Schritt. Oder du erkundest frei – beides geht.',
      attachTo: { element: '[data-tour="path-grid"]', on: 'top' },
      navigateTo: '/lernen',
    },
  ],
};
