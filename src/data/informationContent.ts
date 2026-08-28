// Static content for the Informationen page.
// Long legal / editorial text lives here to keep InformationenPage.tsx readable.

export interface LegalBlock {
  heading?: string;
  text: string;
}

export const DATENSCHUTZ_KURZINFO = [
  '**Keine Accounts**, keine serverseitige Nutzerverwaltung',
  '**Keine Tracking-Cookies** und **keine externen Analytics**',
  'Speicherung von Fortschritt/Einstellungen **lokal im Browser** (z.\u00a0B. LocalStorage/SessionStorage)',
  'Die Plattform ist so konzipiert, dass sie mit hohen schulischen Datenschutzanforderungen kompatibel ist.',
];

export const DATENSCHUTZ_BLOCKS: LegalBlock[] = [
  {
    heading: 'Verantwortlicher (Art. 4 Nr. 7 DSGVO)',
    text: 'Jan Hartwig,\nKreismedienzentrum Esslingen\nAm Aussichtsturm 7\n73207 Plochingen\nTelefon: 0711 340-68845\nE-Mail: hartwig@kmz-es.de',
  },
  {
    heading: 'Zweck der Verarbeitung',
    text: 'Bereitstellung einer Lernplattform zur Auseinandersetzung mit generativer Bild-KI. Es werden keine Nutzerkonten geführt und keine personenbezogenen Profile erstellt.',
  },
  {
    heading: 'Welche Daten werden verarbeitet?',
    text: 'Nach aktuellem Stand werden **keine personenbezogenen Daten an einen Server übertragen**. Technisch notwendige Daten (z.\u00a0B. HTTP-Header) fallen beim Hosting an und werden serverseitig nur im Rahmen der üblichen Bereitstellung/IT-Sicherheit verarbeitet.',
  },
  {
    heading: 'Lokale Speicherung im Browser',
    text: 'Für Komfort- und Lernfunktionen (z.\u00a0B. Anzeigeeinstellungen, optionaler Lernfortschritt/Badges) können Daten **ausschließlich lokal im Browser** gespeichert werden (LocalStorage/SessionStorage). Diese Daten verlassen das Endgerät nicht automatisch.',
  },
  {
    heading: 'Cookies / Tracking',
    text: 'KI:Blick setzt nach aktuellem Stand **keine Tracking-Cookies** ein.',
  },
  {
    heading: 'Empfänger / Drittlandtransfer',
    text: 'Keine Übermittlung an Dritte zu Tracking-/Werbezwecken. Ein Drittlandtransfer findet durch die Plattformfunktionen nach aktuellem Stand nicht statt.',
  },
  {
    heading: 'Rechtsgrundlagen',
    text: 'Soweit überhaupt personenbezogene Daten im Hosting-Kontext anfallen (z.\u00a0B. Serverlogs), erfolgt dies zur **Bereitstellung und IT-Sicherheit** der Website (Art. 6 Abs. 1.)',
  },
  {
    heading: 'Speicherdauer',
    text: 'Lokale Browserdaten: bis zur Löschung durch Nutzer:innen (Browser-Einstellungen) bzw. durch Deinstallation/Reset.\nServerlogs: nach den üblichen Fristen des Hostings/der IT-Sicherheitsvorgaben.',
  },
  {
    heading: 'Betroffenenrechte',
    text: 'Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch, Beschwerderecht bei der zuständigen Aufsichtsbehörde.',
  },
  {
    heading: 'Hosting / Ziel-Domain',
    text: 'Die Veröffentlichung ist unter **ki-blick.kmz-es.de** vorgesehen (Hosting über das Kreismedienzentrum Esslingen).',
  },
];

export const IMPRESSUM_BLOCKS: LegalBlock[] = [
  {
    heading: 'Anbieter / Verantwortlich i.\u00a0S.\u00a0d. § 18 Abs. 2 MStV (redaktionell)',
    text: '**Jan Hartwig**',
  },
  {
    heading: 'Kontakt',
    text: 'Kreismedienzentrum Esslingen\nAm Aussichtsturm 7\n73207 Plochingen\nTelefon: 0711 340-68845\nE-Mail: hartwig@kmz-es.de',
  },
];

export const EXTERNAL_LINKS = {
  medienbildung: {
    href: 'https://km.baden-wuerttemberg.de/de/schule/faecheruebergreifend/medienbildung',
    label: 'Baden-Württemberg.de',
  },
  btv: {
    href: 'https://www.bildungsplaene-bw.de/%2Clde/Startseite/BP2016BW_ALLG/BP2016BW_ALLG_LP_BTV',
    label: 'Bildungspläne BW',
  },
  vb: {
    href: 'https://www.bildungsplaene-bw.de/%2Clde/Startseite/BP2016BW_ALLG/BP2016BW_ALLG_LP_VB',
    label: 'Bildungspläne BW',
  },
  mb: {
    href: 'https://www.bildungsplaene-bw.de/%2Clde/Startseite/BP2016BW_ALLG/BP2016BW_ALLG_LP_MB',
    label: 'Bildungspläne BW',
  },
  informatik: {
    href: 'https://km.baden-wuerttemberg.de/de/schule/schulartuebergreifend/mint/schule-und-unterricht/informatik-und-medienbildung',
    label: 'Baden-Württemberg.de',
  },
} as const;
