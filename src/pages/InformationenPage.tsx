import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ImageDownloads from '../components/features/ImageDownloads';
import { MaterialFeedbackWidget } from '../components/features/feedback/MaterialFeedbackWidget';
import {
  DATENSCHUTZ_KURZINFO,
  DATENSCHUTZ_BLOCKS,
  IMPRESSUM_BLOCKS,
  EXTERNAL_LINKS,
  type LegalBlock,
} from '../data/informationContent';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm leading-relaxed dark:text-[var(--color-secondary)] text-slate-600">{children}</p>
);

const B = ({ children }: { children: React.ReactNode }) => (
  <strong className="font-semibold dark:text-[var(--color-primary)] text-slate-900">{children}</strong>
);

const ExtLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer noopener" className="text-[var(--color-accent)] hover:underline break-words">
    {children}
  </a>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <li className="text-sm leading-relaxed dark:text-[var(--color-secondary)] text-slate-600 flex items-start gap-2">
    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] flex-shrink-0" />
    <span>{children}</span>
  </li>
);

const SubHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm md:text-base font-semibold dark:text-[var(--color-primary)] text-slate-900 pt-1">{children}</h3>
);

function CollapsibleHeroSection({ id, badgeNumber, title, preview, expanded }: {
  id: string;
  badgeNumber: number;
  title: string;
  preview: React.ReactNode;
  expanded: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section id={id} className="rounded-2xl border border-[var(--color-border)] p-5 md:p-6 dark:bg-[var(--color-card)] bg-white scroll-mt-20">
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex items-center justify-center rounded-full h-7 min-w-7 px-2 text-xs font-semibold bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
          {badgeNumber}
        </span>
        <h2 className="text-xl font-semibold dark:text-[var(--color-primary)] text-slate-900">{title}</h2>
      </div>
      {preview}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-4 flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:underline"
        aria-expanded={open}
      >
        <span>{open ? 'Kompetenzformulierungen ausblenden' : 'Konkrete Kompetenzformulierungen anzeigen'}</span>
        <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="mt-4 overflow-hidden">
          {expanded}
        </motion.div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section definitions
// ---------------------------------------------------------------------------

interface SectionDef {
  id: string;
  title: string;
  tier: 'hero' | 'standard' | 'compact';
  content: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Reusable components
// ---------------------------------------------------------------------------

function CopyableQuote({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <blockquote className="relative rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50 p-4 pr-12">
      <p className="text-sm leading-relaxed dark:text-[var(--color-secondary)] text-slate-600">{text}</p>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
        title="In die Zwischenablage kopieren"
      >
        {copied ? (
          <svg className="w-4 h-4 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 dark:text-[var(--color-muted)] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </blockquote>
  );
}

const TEACHING_MATERIALS = [
  { id: 'handreichung', title: 'Plattformhandreichung', description: 'Ausführliche Handreichung für Lehrkräfte – Konzept, Didaktik, Einsatzszenarien, alle Lernpfade.', filename: 'KI-Blick_Handreichung_Lehrkraefte.pdf', pages: '~20 Seiten' },
  { id: 'lp1', title: 'Lernpfad-Karte LP1: Wer unterrichtet hier?', description: 'Kompakte Übersicht für den Lernpfad zu Gender-Bias bei Lehrkräfte-Darstellungen.', filename: 'KI-Blick_Lernpfad-Karte_LP1.pdf', pages: '2–3 Seiten' },
  { id: 'lp2', title: 'Lernpfad-Karte LP2: Brot, Baguette, Pão', description: 'Kultureller Bias und Nachhaltigkeit – Schulklassen-Darstellungen im Vergleich.', filename: 'KI-Blick_Lernpfad-Karte_LP2.pdf', pages: '2–3 Seiten' },
  { id: 'lp3', title: 'Lernpfad-Karte LP3: Drei Modelle, drei Blicke', description: 'Modellvergleich und Modellsignaturen – technische Unterschiede sichtbar machen.', filename: 'KI-Blick_Lernpfad-Karte_LP3.pdf', pages: '2–3 Seiten' },
  { id: 'lp4', title: 'Lernpfad-Karte LP4: Vom Muster zur Verantwortung', description: 'Umfassende Bias-Analyse – von der Beobachtung über die Wirkung zum verantwortungsvollen Handeln.', filename: 'KI-Blick_Lernpfad-Karte_LP4.pdf', pages: '2–3 Seiten' },
];

function MaterialCard({ mat }: { mat: typeof TEACHING_MATERIALS[0] }) {
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  return (
    <div className="rounded-xl border border-[var(--color-border)] p-3 md:p-4 dark:bg-[var(--color-card)] bg-white">
      <a
        href={`${import.meta.env.BASE_URL}downloads/materialien/${mat.filename}`}
        download
        onClick={() => setFeedbackVisible(true)}
        className="group flex items-start gap-3 transition-colors hover:border-[var(--color-accent)]"
      >
        <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/10 text-red-500">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" /></svg>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold dark:text-[var(--color-primary)] text-slate-900">{mat.title}</p>
          <p className="text-xs dark:text-[var(--color-secondary)] text-slate-600 mt-0.5">{mat.description}</p>
          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mt-1">PDF · {mat.pages}</p>
        </div>
        <span className="flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] group-hover:border-[var(--color-accent)]">
          <svg className="h-4 w-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
        </span>
      </a>
      {feedbackVisible && (
        <MaterialFeedbackWidget materialId={mat.id} materialTitle={mat.title} />
      )}
    </div>
  );
}

function TeachingMaterials() {
  return (
    <div className="mt-6 space-y-3">
      <SubHeading>Didaktische Materialien</SubHeading>
      <div className="grid grid-cols-1 gap-3">
        {TEACHING_MATERIALS.map(mat => (
          <MaterialCard key={mat.id} mat={mat} />
        ))}
      </div>
    </div>
  );
}

function CollapsibleImageDownloads() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-slate-50 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--color-border)]/10 transition-colors" aria-expanded={open}>
        <div>
          <p className="text-sm font-semibold dark:text-[var(--color-primary)] text-slate-900">Bildmaterial herunterladen</p>
          <p className="text-xs dark:text-[var(--color-muted)] text-slate-500 mt-0.5">10 Fächer · 3 Modelle · 480 Bilder als ZIP-Pakete</p>
        </div>
        <svg className={`w-5 h-5 dark:text-[var(--color-muted)] text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="px-4 pb-4 overflow-hidden">
          <ImageDownloads />
        </motion.div>
      )}
    </div>
  );
}

function StatHighlights() {
  const stats = [
    { value: '0–100%', label: 'weiblich je nach Fach & Modell', color: 'var(--color-area-entdecken)' },
    { value: '97%', label: 'heller Hautton über alle Fächer', color: 'var(--color-area-einordnen)' },
    { value: '39–88%', label: 'weiblich je nach Modell', color: 'var(--color-accent)' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
      {stats.map(stat => (
        <div key={stat.label} className="rounded-xl border border-[var(--color-border)] p-4 text-center dark:bg-[var(--color-surface)] bg-slate-50">
          <p className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</p>
          <p className="text-xs dark:text-[var(--color-secondary)] text-slate-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function ScenarioCards() {
  const scenarios = [
    { title: 'Doppelstunde (90 Min.)', icon: '🕐', items: ['Lernpfad „Wer unterrichtet hier?" (Schritte 1–5): Eigene Vorstellung → KI-Output → Vergleich', 'Geeignet für: Informatik, Ethik, Deutsch, Kunst, Gemeinschaftskunde', 'Vorbereitung: Tablets oder Laptops mit Internetzugang. Keine Accounts, keine Installation'] },
    { title: 'Projekttag (3–4 Stunden)', icon: '📋', items: ['Einen kompletten Lernpfad durcharbeiten + freie Exploration im Entdecken-Bereich', 'Kombinierbar mit eigener Recherche oder Gruppendiskussion', 'Geeignet für: fächerübergreifende Projekttage, Vertretungsstunden'] },
    { title: 'AG / Wahlkurs (mehrere Sitzungen)', icon: '🔄', items: ['Alle vier Lernpfade über mehrere Wochen', 'Vertiefung möglich: eigene Bias-Recherche, Gegenbilder entwickeln, Ergebnisse präsentieren'] },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {scenarios.map(s => (
        <div key={s.title} className="rounded-xl border border-[var(--color-border)] p-4 dark:bg-[var(--color-surface)] bg-slate-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{s.icon}</span>
            <h4 className="text-sm font-semibold dark:text-[var(--color-primary)] text-slate-900">{s.title}</h4>
          </div>
          <ul className="space-y-1">
            {s.items.map((item, i) => (
              <li key={i} className="text-xs leading-relaxed dark:text-[var(--color-secondary)] text-slate-600 flex items-start gap-1.5">
                <span className="mt-1 h-1 w-1 rounded-full bg-[var(--color-accent)] flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legal / compact section renderer
// ---------------------------------------------------------------------------

function renderBoldInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*(.+)\*\*$/);
    if (bold) return <B key={i}>{bold[1]}</B>;
    return part;
  });
}

function LegalBlocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <div key={i} className="space-y-1">
          {block.heading && <SubHeading>{block.heading}</SubHeading>}
          {block.text.split('\n').map((line, j) => (
            <p key={j} className="text-sm leading-relaxed dark:text-[var(--color-secondary)] text-slate-600">
              {renderBoldInline(line)}
            </p>
          ))}
        </div>
      ))}
    </>
  );
}

function CompactSection({ id, title, previewContent, expandedContent, expandLabel }: {
  id: string;
  title: string;
  previewContent: React.ReactNode;
  expandedContent: React.ReactNode;
  expandLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id={id} className="scroll-mt-20 pt-6 border-t border-[var(--color-border)]">
      <h2 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-3">{title}</h2>
      <div className="space-y-4">{previewContent}</div>
      {!expanded && (
        <button type="button" onClick={() => setExpanded(true)} className="mt-3 text-sm text-[var(--color-accent)] hover:underline flex items-center gap-1">
          <span>{expandLabel}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      )}
      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="space-y-4 mt-4 overflow-hidden">
          {expandedContent}
        </motion.div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section content
// ---------------------------------------------------------------------------

const SECTIONS: SectionDef[] = [
  {
    id: 'konzept',
    title: 'Konzept',
    tier: 'hero',
    content: (
      <div className="space-y-4">
        <P><B>KI:Blick – Bilder, Bias und Blickwinkel</B> ist eine digitale Lernumgebung für Schülerinnen und Schüler weiterführender Schulen in Baden-Württemberg (Einsatz ab ca. Klasse 9/10). Ziel ist es, <B>generative Bild-KI verständlich zu machen</B> und zugleich die <B>kritische Analyse</B> von KI-Bildern zu fördern – insbesondere mit Blick auf <B>Stereotype, Bias und Diskriminierung</B>.</P>
        <P>Statt dass Lernende selbst Bilder generieren müssen, arbeitet KI:Blick mit <B>vorgenerierten Bildserien</B>, die systematisch verglichen und ausgewertet werden können. Dadurch eignet sich die Plattform auch für Schulen/Klassen, in denen Live-Generierung aus Datenschutz-, Alters- oder Organisationsgründen nicht eingesetzt werden soll.</P>
        <SubHeading>Didaktische Struktur (Plattformbereiche)</SubHeading>
        <ul className="space-y-2">
          <Bullet><B>Verstehen:</B> Grundlagen – wie generative Bild-KI funktioniert, warum Ergebnisse plausibel wirken, wo Grenzen liegen.</Bullet>
          <Bullet><B>Entdecken:</B> Bildserien erkunden – Muster, Wiederholungen, Auffälligkeiten, Perspektivenwechsel.</Bullet>
          <Bullet><B>Einordnen:</B> Reflexion und Bewertung – Bias, Diskriminierungsrisiken, gesellschaftliche Folgen, Handlungsoptionen.</Bullet>
          <Bullet><B>Lernen:</B> Geführte Lernpfade, die Inhalte aus den Bereichen zu Aufgabenfolgen bündeln.</Bullet>
        </ul>
        <P><B>Niveaustufen:</B> Aktuell ist primär eine <B>mittlere Niveaustufe</B> umgesetzt (perspektivisch: Differenzierung nach unten/oben).</P>
        <P>Die Plattform arbeitet mit <B>848 vorgenerierten WebP-Bildern</B> – darunter 480 Lehrkräfte-Porträts (10 Fächer × 3 KI-Modelle × 16 Bilder pro Kombination) sowie 368 weitere Bilder für Wissensmodule und Oberflächenelemente. Die Bildserien wurden mit kontrollierten, minimalistischen Prompts in deutscher Sprache generiert.</P>
      </div>
    ),
  },
  {
    id: 'entstehung',
    title: 'Entstehung',
    tier: 'hero',
    content: (
      <div className="space-y-4">
        <P>Die Konzeption und inhaltliche Steuerung des Projekts stammen von <B>Jan Hartwig</B> (Regioberater des LMZ am KMZ Esslingen). Die technische Umsetzung erfolgte <B>KI-gestützt</B>: Planung/Koordination über <em>Claude Cowork</em>, Programmierung/„Infrastrukturarbeiten" in <B>Visual Studio Code</B> unter Nutzung von <em>Claude Code</em> und <em>OpenAI Codex</em>.</P>
        <div className="rounded-xl border-l-4 border-[var(--color-accent)] dark:bg-[var(--color-accent)]/5 bg-sky-50 p-4 my-4">
          <p className="text-sm md:text-base font-medium dark:text-[var(--color-primary)] text-slate-900 leading-relaxed">
            Wichtig: <B>Dabei wurde keine einzige Zeile Code von einem Menschen geschrieben.</B> Die Realisierung ist aus konzeptioneller Vorgabe, iterativem Prompting, Auftragsformulierung und KI-generierter Implementierung entstanden.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'bildungsplanbezug-bw',
    title: 'Bildungsplanbezug Baden-Württemberg',
    tier: 'hero',
    content: null, // handled inline below
  },
  {
    id: 'informationen-fuer-lehrende',
    title: 'Informationen für Lehrende',
    tier: 'hero',
    content: (
      <div className="space-y-4">
        <P><B>Einsatzidee:</B> KI:Blick eignet sich für Unterricht (Einzelstunde bis Sequenz) sowie Projekttage. Der Fokus kann variieren:</P>
        <ul className="space-y-2">
          <Bullet>eher <B>technisch-erklärend</B> (Wie entstehen KI-Bilder?)</Bullet>
          <Bullet>eher <B>kritisch-reflexiv</B> (Bias, Diskriminierung, Medienwirkung)</Bullet>
          <Bullet>eher <B>anwendungsorientiert</B> (Bildvergleich, Kriterienraster, Präsentation, Debatte)</Bullet>
        </ul>

        <SubHeading>Didaktische Stärken</SubHeading>
        <ul className="space-y-2">
          <Bullet>Kein Tool-Account nötig, keine Live-Generierung erforderlich</Bullet>
          <Bullet>Bildserien erlauben Vergleich („gleiches Prompt, viele Outputs") und erleichtern evidenzbasierte Diskussionen</Bullet>
          <Bullet>Lernpfade ermöglichen geführtes Arbeiten; freies Entdecken unterstützt Differenzierung</Bullet>
        </ul>

        <P><B>Pragmatischer Hinweis:</B> Da die Plattform mit vorhandenen Bildbeständen arbeitet, lassen sich Aufgaben gut als <B>Analyse- und Reflexionsaufgaben</B> anlegen (z.&nbsp;B. Beobachten → Begründen → Einordnen → Handeln).</P>

        <SubHeading>Einsatzszenarien</SubHeading>
        <ScenarioCards />

        <SubHeading>Was steckt in den Daten?</SubHeading>
        <P>Die 480 Lehrkräfte-Bilder zeigen deutliche Muster – einige Beispiele:</P>
        <StatHighlights />
        <ul className="space-y-2">
          <Bullet><B>Geschlecht:</B> Von 0% weiblich (Informatik, FLUX und GPT) bis 100% weiblich (z.&nbsp;B. Sport/Nano Bana, Englisch/GPT). Die drei Modelle unterscheiden sich stark.</Bullet>
          <Bullet><B>Hautfarbe:</B> 97% der dargestellten Lehrkräfte haben einen hellen Hautton – über alle Fächer und Modelle hinweg.</Bullet>
          <Bullet><B>Modellunterschiede:</B> FLUX generiert 39% weibliche Lehrkräfte, GPT 74%, Nano Bana 88% – bei identischem Prompt.</Bullet>
        </ul>
        <P>Diese Muster sind der Ausgangspunkt für die Analyse und Diskussion im Unterricht.</P>

        <TeachingMaterials />
      </div>
    ),
  },
  {
    id: 'nutzung-lizenzen',
    title: 'Nutzung, Lizenzen & Downloads',
    tier: 'standard',
    content: (
      <div className="space-y-4">
        <SubHeading>Lizenzmodell</SubHeading>
        <ul className="space-y-2">
          <Bullet><B>Quellcode:</B> MIT-Lizenz (<ExtLink href="https://github.com/h4r7w16/KI-Blick-preview">GitHub</ExtLink>)</Bullet>
          <Bullet><B>Inhalte (Texte/Materialien):</B> Creative Commons <B>CC BY-SA 4.0</B></Bullet>
          <Bullet><B>Bilder:</B> KI-generiert; <B>Weiterverwendung ist ausdrücklich erwünscht</B> (z.&nbsp;B. für Unterrichtsmaterialien, Fortbildungen, OER) – mit <B>Namensnennung</B>.</Bullet>
        </ul>

        <SubHeading>Attributionsvorschlag (Copy-Paste)</SubHeading>
        <CopyableQuote text={`\u201EKI:Blick \u2013 Bilder, Bias und Blickwinkel\u201C (Konzept: Jan Hartwig, Kreismedienzentrum Esslingen). Lizenz: Inhalte CC BY-SA 4.0, Code MIT.`} />

        <SubHeading>Technische Voraussetzungen</SubHeading>
        <ul className="space-y-2">
          <Bullet><B>Browser:</B> Chrome, Firefox, Safari oder Edge (jeweils aktuelle Version). Keine Installation nötig.</Bullet>
          <Bullet><B>Geräte:</B> Optimiert für Tablets (iPad). Funktioniert auf Smartphones und Desktop.</Bullet>
          <Bullet><B>Offline:</B> Nicht offline-fähig (Bilder werden vom Server geladen).</Bullet>
          <Bullet><B>Barrierefreiheit:</B> Tastaturnavigation, Screenreader-Unterstützung, Dark/Light-Mode umschaltbar.</Bullet>
        </ul>

        <SubHeading>Bildmaterial und Generierung</SubHeading>
        <P>Die auf KI:Blick gezeigten Beispielbilder wurden mit bewusst kurzen, minimalen Prompts in deutscher Sprache generiert. Automatische Prompt-Verbesserungen blieben deaktiviert.</P>
        <P><B>Verwendete Modelle (Plattformname → technischer Name):</B></P>
        <ul className="space-y-2">
          <Bullet><B>FLUX2 PRO</B> → FLUX.2 [pro] von Black Forest Labs; Generierung in Leonardo.ai (Default-Einstellungen).</Bullet>
          <Bullet><B>GPT Image-1.5</B> → gpt-image-1.5 von OpenAI; Einstellung Quality: medium.</Bullet>
          <Bullet><B>Nano Bana</B> → Gemini 2.5 Flash Image von Google; Default-Einstellungen.</Bullet>
          <Bullet><B>Gemini Image 2</B> – Bildmodell von Google; zusätzliches Vergleichsmodell in ausgewählten Wissenseinheiten (nicht im Entdecken-Bereich).</Bullet>
        </ul>
        <P>Modellversionen und Verfügbarkeit können sich ändern; die Bezeichnungen beziehen sich auf den Zeitpunkt der Generierung.</P>

        <CollapsibleImageDownloads />
      </div>
    ),
  },
  {
    id: 'datenschutz',
    title: 'Datenschutz',
    tier: 'compact',
    content: null, // handled inline below
  },
  {
    id: 'impressum',
    title: 'Impressum',
    tier: 'compact',
    content: null, // handled inline below
  },
];

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function InformationenPage() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    const id = location.hash.replace('#', '');
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    SECTIONS.forEach(section => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  let badgeCounter = 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-3 h-3 rounded-full bg-[var(--color-accent)]" />
          <span className="text-sm font-medium text-[var(--color-accent)] uppercase tracking-wider">Informationen</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-3">Informationen</h1>
        <p className="text-base dark:text-[var(--color-secondary)] text-slate-600 max-w-3xl">Hintergrund, Einsatz im Unterricht und technische Hinweise.</p>
      </motion.div>

      {/* Pill navigation */}
      <motion.nav
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap gap-2 lg:sticky lg:top-16 lg:z-20 lg:py-3 lg:dark:bg-[var(--color-bg)]/95 lg:bg-slate-50/95 lg:backdrop-blur-sm lg:-mx-4 lg:px-4"
        aria-label="Abschnittsnavigation"
        data-tour="info-pills"
      >
        {SECTIONS.map(section => (
          <Link
            key={section.id}
            to={`/informationen#${section.id}`}
            className={`text-xs md:text-sm px-3 py-1.5 rounded-full border transition-colors ${
              activeSection === section.id
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] dark:bg-[var(--color-accent)]/10 bg-sky-50'
                : 'border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]'
            }`}
          >
            {section.title}
          </Link>
        ))}
      </motion.nav>

      {/* Sections */}
      <div className="space-y-5">
        {SECTIONS.map(section => {
          // Compact sections – Datenschutz / Impressum
          if (section.id === 'datenschutz') {
            return (
              <CompactSection
                key={section.id}
                id={section.id}
                title={section.title}
                expandLabel="Vollständige Datenschutzerklärung anzeigen"
                previewContent={
                  <ul className="space-y-2">
                    {DATENSCHUTZ_KURZINFO.map((item, i) => (
                      <Bullet key={i}>{renderBoldInline(item)}</Bullet>
                    ))}
                  </ul>
                }
                expandedContent={<LegalBlocks blocks={DATENSCHUTZ_BLOCKS} />}
              />
            );
          }

          if (section.id === 'impressum') {
            return (
              <CompactSection
                key={section.id}
                id={section.id}
                title={section.title}
                expandLabel="Vollständige Informationen anzeigen"
                previewContent={
                  <LegalBlocks blocks={IMPRESSUM_BLOCKS.slice(0, 2)} />
                }
                expandedContent={
                  <div className="space-y-4">
                    <SubHeading>Hinweise</SubHeading>
                    <ul className="space-y-2">
                      <Bullet>Inhalte und Materialien stehen – soweit gekennzeichnet – unter den im Abschnitt „Nutzung" genannten Lizenzen.</Bullet>
                      <Bullet>Bei externen Verweisen (falls vorhanden) liegt die Verantwortung für deren Inhalte bei den jeweiligen Anbietern.</Bullet>
                    </ul>
                  </div>
                }
              />
            );
          }

          // Bildungsplanbezug – numbered hero card with collapsible details
          if (section.id === 'bildungsplanbezug-bw') {
            badgeCounter += 1;
            const bpBadge = badgeCounter;
            return (
              <CollapsibleHeroSection
                key={section.id}
                id={section.id}
                badgeNumber={bpBadge}
                title={section.title}
                preview={
                  <div className="space-y-4">
                    <P>KI:Blick ist auf den Bildungsplan-Kontext BW ausgerichtet und lässt sich fachübergreifend einsetzen. Zentral sind die Leitperspektiven, insbesondere:</P>
                    <ul className="space-y-2">
                      <Bullet><B>Leben und Lernen in einer digitalisierten Welt</B> (Weiterentwicklung der Leitperspektive Medienbildung). (<ExtLink href={EXTERNAL_LINKS.medienbildung.href}>{EXTERNAL_LINKS.medienbildung.label}</ExtLink>)</Bullet>
                      <Bullet><B>BTV – Bildung für Toleranz und Akzeptanz von Vielfalt</B> (Bias-Analyse, Stereotype, diskriminierungssensible Medienkritik). (<ExtLink href={EXTERNAL_LINKS.btv.href}>{EXTERNAL_LINKS.btv.label}</ExtLink>)</Bullet>
                      <Bullet><B>Verbraucherbildung (VB)</B> (reflektierte Entscheidungen in digitalen Umwelten, Auswirkungen datengetriebener Systeme). (<ExtLink href={EXTERNAL_LINKS.vb.href}>{EXTERNAL_LINKS.vb.label}</ExtLink>)</Bullet>
                    </ul>
                  </div>
                }
                expanded={
                  <div className="space-y-4">
                    <SubHeading>Konkrete Kompetenzformulierungen</SubHeading>

                    <P><B>Überfachlich (Leitperspektive „Leben und Lernen in einer digitalisierten Welt"):</B></P>
                    <ul className="space-y-2">
                      <Bullet>Lernende <B>analysieren</B> KI-Bildoutputs kriteriengeleitet (Prompt, Variation, Perspektive, Kontext). (<ExtLink href={EXTERNAL_LINKS.mb.href}>{EXTERNAL_LINKS.mb.label}</ExtLink>)</Bullet>
                      <Bullet>Lernende <B>reflektieren</B> Chancen/Risiken generativer Systeme (Täuschungspotenzial, Stereotypisierung, Urheberrecht, Datenbezüge) und treffen begründete Entscheidungen zum Einsatz. (<ExtLink href={EXTERNAL_LINKS.mb.href}>{EXTERNAL_LINKS.mb.label}</ExtLink>)</Bullet>
                      <Bullet>Lernende <B>beurteilen</B> Darstellungen im Hinblick auf Jugendmedienschutz und informationelle Selbstbestimmung (z.&nbsp;B. problematische Bildtypen, sensible Inhalte). (<ExtLink href={EXTERNAL_LINKS.mb.href}>{EXTERNAL_LINKS.mb.label}</ExtLink>)</Bullet>
                    </ul>

                    <P><B>Ethik/Religion:</B></P>
                    <ul className="space-y-2">
                      <Bullet>Lernende <B>erkennen</B> moralische Konflikte (Diskriminierung, Menschenwürde, Verantwortung) in KI-Bildbeispielen und <B>begründen</B> Handlungsoptionen (z.&nbsp;B. Nicht-Teilen, Kontextualisieren, Gegenbilder).</Bullet>
                    </ul>

                    <P><B>Gemeinschaftskunde:</B></P>
                    <ul className="space-y-2">
                      <Bullet>Lernende <B>analysieren</B> gesellschaftliche Auswirkungen von Bild-KI (Meinungsbildung, Propaganda, Rollenbilder) und <B>diskutieren</B> Regulierungs-/Gestaltungsfragen (z.&nbsp;B. Kennzeichnung, Plattformverantwortung).</Bullet>
                    </ul>

                    <P><B>Informatik / Informatik &amp; Medienbildung (Sek I/II):</B></P>
                    <ul className="space-y-2">
                      <Bullet>Lernende <B>beschreiben</B> grundlegende Funktionsprinzipien generativer Systeme (Modell, Trainingsdaten, Musterlernen) und <B>erklären</B>, warum Bias aus Daten/Optimierungszielen entstehen kann. (<ExtLink href={EXTERNAL_LINKS.informatik.href}>{EXTERNAL_LINKS.informatik.label}</ExtLink>)</Bullet>
                    </ul>

                    <P><B>Deutsch/Kunst:</B></P>
                    <ul className="space-y-2">
                      <Bullet>Lernende <B>analysieren</B> Bildsprache, Stereotyp-Codes, Komposition und implizite Aussagen; sie <B>entwickeln</B> alternative Darstellungen (Counter-Prompts/Counter-Narratives) und <B>reflektieren</B> Wirkung.</Bullet>
                    </ul>

                    <P><em>(Hinweis: Die konkreten Zuordnungen können je nach Schulart, Klasse und Fachprofil angepasst werden.)</em></P>
                  </div>
                }
              />
            );
          }

          // Hero & standard sections
          if (section.tier === 'compact') return null;

          badgeCounter += 1;
          const badgeNumber = badgeCounter;

          return (
            <section
              key={section.id}
              id={section.id}
              className="rounded-2xl border border-[var(--color-border)] p-5 md:p-6 dark:bg-[var(--color-card)] bg-white scroll-mt-20"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center justify-center rounded-full h-7 min-w-7 px-2 text-xs font-semibold bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                  {badgeNumber}
                </span>
                <h2 className={`font-semibold dark:text-[var(--color-primary)] text-slate-900 ${section.tier === 'hero' ? 'text-xl' : 'text-lg'}`}>
                  {section.title}
                </h2>
              </div>
              {section.content}
            </section>
          );
        })}
      </div>
    </div>
  );
}
