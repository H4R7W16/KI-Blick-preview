import type { CheckoutElement, ContentBlock } from '../types/knowledge.types';

export type EinordnenUnitId = 'e1' | 'e2' | 'e3' | 'e4' | 'e5';

export const EINORDNEN_CONTENT: Record<EinordnenUnitId, ContentBlock[]> = {
  // ─── E1: Muster erkennen ───────────────────────────────────────────
  e1: [
    // Akt 1: Von Bäumen zu Menschen
    {
      id: 'e1-hero-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        kicker: 'Vom Muster zur Bedeutung',
        text: 'Muster erkennen',
        level: 2,
      },
    },
    {
      id: 'e1-hero-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'In V3 hast du gelernt, Bildserien systematisch zu lesen: Default identifizieren, Variation beschreiben, Lücken benennen, Modelle vergleichen. Bei Bäumen war das eine ästhetische Übung. Jetzt wird es ernst – denn dieselben Muster existieren auch bei Bildern von Menschen. Und da haben sie Konsequenzen.',
      },
    },
    {
      id: 'e1-framework-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Dein Analyse-Werkzeug – jetzt für Menschen',
        tone: 'info',
        points: [
          '1. Default identifizieren – Wer wird typischerweise gezeigt?',
          '2. Variation beschreiben – Welche Unterschiede gibt es?',
          '3. Lücken benennen – Wer fehlt systematisch?',
          '4. Modelle vergleichen – Zeigen alle Modelle dasselbe Muster?',
        ],
      },
    },
    {
      id: 'e1-transition-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Lass uns mit etwas beginnen, das dich direkt betrifft: Wie stellt sich die KI Schule in verschiedenen Ländern vor?',
      },
    },

    // Akt 2: Vier Länder, ein Prompt – Kultureller Bias
    {
      id: 'e1-cultural-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Vier Länder, ein Wort: Schule',
        level: 3,
      },
    },
    {
      id: 'e1-cultural-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Wir haben drei KI-Modelle gebeten, „Schule in Deutschland", „Schule in Japan", „Schule in Kenia" und „Schule in Brasilien" zu generieren. Derselbe einfache Prompt – nur das Land ändert sich. Was siehst du?',
      },
    },
    {
      id: 'e1-cultural-grid',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'CulturalComparisonGrid',
      },
    },
    {
      id: 'e1-cultural-observation',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Fällt dir etwas auf? „Schule in Deutschland" zeigt fast immer moderne Gebäude mit Glasfassaden und Smartboards. „Schule in Kenia" zeigt fast immer ländliche Gebäude mit Wellblechdächern und Kreidetafeln. Die KI zeigt nicht „Schule" – sie zeigt das Stereotyp, das sie aus den Trainingsdaten gelernt hat.',
      },
    },
    {
      id: 'e1-cultural-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Kultureller Bias',
        tone: 'warning',
        points: [
          'Es gibt in Kenia moderne Schulen mit digitaler Ausstattung – und in Deutschland marode Gebäude mit Kreidetafeln. Aber die Trainingsdaten zeigen ein verzerrtes Bild.',
          'Das hat Folgen: Wenn KI-Bilder immer dasselbe Stereotyp reproduzieren, verfestigen sie unsere Vorstellung davon, wie Schule „in Afrika" oder „in Europa" aussieht.',
          'Wende dein Analyse-Werkzeug an: Was ist der Default? Was fehlt? Zeigen alle Modelle dasselbe?',
        ],
      },
    },

    // Akt 3: Wer unterrichtet? – Gender-Bias
    {
      id: 'e1-gender-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Wer unterrichtet Informatik?',
        level: 3,
      },
    },
    {
      id: 'e1-gender-compare',
      type: 'image-compare',
      revealOnScroll: true,
      data: {
        title: 'Zwei Fächer, zwei Welten',
        left: {
          src: '/images/generated/informatiklehrkraft/flux2pro/_kontaktblatt.webp',
          alt: 'Kontaktblatt Informatiklehrkraft – fast ausschließlich männliche Darstellungen',
          caption: 'Informatiklehrkraft – FLUX2 PRO',
        },
        right: {
          src: '/images/generated/kunstlehrkraft/gpt-image-1-5/_kontaktblatt.webp',
          alt: 'Kontaktblatt Kunstlehrkraft – ausschließlich weibliche Darstellungen',
          caption: 'Kunstlehrkraft – GPT Image-1.5',
        },
      },
    },
    {
      id: 'e1-gender-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: '16 Bilder einer Informatiklehrkraft – fast alle zeigen Männer. 16 Bilder einer Kunstlehrkraft – fast alle zeigen Frauen. Das ist kein Zufall: Es ist ein Muster, das sich über hunderte Bilder hinweg wiederholt. Dieses Muster nennen wir Bias.',
      },
    },
    {
      id: 'e1-bias-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Fachbegriff: Bias',
        tone: 'info',
        points: [
          'Englisch für „Voreingenommenheit" oder „Schieflage".',
          'Im KI-Kontext: systematische Abweichung in den Ergebnissen, die auf Muster in den Trainingsdaten zurückgeht.',
          'Bias ist keine böse Absicht – es ist ein statistisches Muster, das durch Daten entsteht.',
        ],
      },
    },
    {
      id: 'e1-cluster-chart',
      type: 'visualization',
      revealOnScroll: true,
      data: {
        component: 'BiasClusterChart',
      },
    },
    {
      id: 'e1-gender-chart',
      type: 'visualization',
      revealOnScroll: true,
      data: {
        component: 'GenderBySubjectChart',
      },
    },

    // Akt 4: Mehr als Geschlecht – Bias-Spektrum
    {
      id: 'e1-spectrum-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Bias hat viele Formen',
        level: 3,
      },
    },
    {
      id: 'e1-spectrum-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Geschlecht ist die auffälligste Verzerrung – aber bei weitem nicht die einzige. In den Bildserien findest du auch Muster beim Alter, bei der Darstellung von Kulturen und bei den stereotypen Requisiten und Settings.',
      },
    },
    {
      id: 'e1-spectrum-explorer',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'BiasSpectrumExplorer',
      },
    },

    // Akt 5: Reflexion
    {
      id: 'e1-checkpoint',
      type: 'checkpoint',
      revealOnScroll: true,
      data: {
        question: 'Warum ist die Geschlechterverteilung bei Informatik-Bildern so anders als bei Kunst-Bildern?',
        answer: 'Die KI reproduziert Muster aus ihren Trainingsdaten. In diesen Daten waren Informatik-Kontexte offenbar häufiger mit männlichen Personen verknüpft – und Kunst-Kontexte häufiger mit weiblichen.',
        hint: 'Denke an V2: Trainingsdaten spiegeln, wer online ist.',
      },
    },
    {
      id: 'e1-reveal-1',
      type: 'reveal',
      revealOnScroll: true,
      data: {
        question: 'Was wäre, wenn alle Modelle dasselbe Muster zeigen?',
        answer: 'Wenn alle Modelle dasselbe Muster zeigen, liegt die Ursache wahrscheinlich in gemeinsamen Trainingsdaten oder tief verankerten gesellschaftlichen Stereotypen. Unterschiedliche Muster deuten auf modellspezifische Entscheidungen hin.',
      },
    },
    {
      id: 'e1-reveal-2',
      type: 'reveal',
      revealOnScroll: true,
      data: {
        question: 'Ab welcher Verteilung würdest du von Bias sprechen?',
        answer: 'Es gibt keinen festen Schwellenwert. Aber wenn ein Muster über viele Bilder und Modelle hinweg erkennbar ist und von der realen Verteilung deutlich abweicht, spricht vieles für systematischen Bias.',
      },
    },
  ],

  // ─── E2: Spiegel oder Zerrspiegel? ─────────────────────────────────
  e2: [
    {
      id: 'e2-hero-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        kicker: 'Was zeigt die KI – und was zeigt die Realität?',
        text: 'Spiegel oder Zerrspiegel?',
        level: 2,
      },
    },
    {
      id: 'e2-hero-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'In E1 hast du gesehen: KI-Bilder zeigen systematische Muster. Aber wie verzerrt sind sie wirklich? Dafür brauchen wir einen Maßstab – die Realität.',
      },
    },
    {
      id: 'e2-intro-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Die KI erzeugt Informatiklehrkräfte überwiegend als Männer – bei zwei von drei Modellen sogar zu 100%. Aber wie sieht die Realität aus? In Deutschland sind ca. 25% der Informatiklehrkräfte weiblich – wenig, aber nicht null. Zeigt die KI also ein Spiegelbild oder eine Verzerrung?',
      },
    },
    {
      id: 'e2-categories-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Drei Kategorien',
        level: 3,
      },
    },
    {
      id: 'e2-classifier',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'BiasClassifier',
      },
    },
    {
      id: 'e2-big-picture-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Das große Bild',
        level: 3,
      },
    },
    {
      id: 'e2-comparison-chart',
      type: 'visualization',
      revealOnScroll: true,
      data: {
        component: 'RealityComparisonChart',
      },
    },
    {
      id: 'e2-important-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Wichtig',
        tone: 'warning',
        points: [
          'Keine der drei Kategorien ist „neutral".',
          'Auch ein Spiegel kann problematisch sein, wenn die Realität selbst verzerrt ist.',
          'Die Frage ist nicht nur „Bildet die KI korrekt ab?" – sondern auch „Was sollte sie abbilden?"',
        ],
      },
    },
    {
      id: 'e2-checkpoint',
      type: 'checkpoint',
      revealOnScroll: true,
      data: {
        question: 'Wenn die KI Physiklehrkräfte zu 62,5% männlich darstellt und die Realität zeigt 70% männlich – ist die KI dann „besser"?',
        answer: 'Nicht unbedingt. Die Frage ist, ob eine KI Stereotypen reproduzieren soll, nur weil sie statistisch „korrekt" sind. Eine realitätsnahe Verteilung kann trotzdem bestehende Ungleichheit verfestigen.',
      },
    },
    {
      id: 'e2-models-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Warum die Modelle sich unterscheiden',
        level: 3,
      },
    },
    {
      id: 'e2-models-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Nicht jedes Modell verzerrt gleich. FLUX2 PRO verstärkt bei MINT-Fächern den männlichen Bias. GPT Image-1.5 zeigt bei mehreren Fächern ausschließlich Frauen – eine Überkompensation, die neue Muster erzeugt.',
      },
    },
    {
      id: 'e2-reveal-1',
      type: 'reveal',
      revealOnScroll: true,
      data: {
        question: 'Warum zeigt GPT Image-1.5 bei mehreren Fächern ausschließlich Frauen?',
        answer: 'Mögliche Erklärungen: modellspezifisches Finetuning, Safety-Filter oder bewusste Overcompensation durch die Entwickler. Wir wissen es nicht genau – die Trainingsdaten und Finetuning-Methoden sind nicht öffentlich.',
      },
    },
    {
      id: 'e2-reveal-2',
      type: 'reveal',
      revealOnScroll: true,
      data: {
        question: 'Ist Overcompensation besser als Verstärkung?',
        answer: 'Beides ist eine Verzerrung. Overcompensation (100% weiblich) ist nicht „besser" als Verstärkung (6% weiblich) – beides weicht von der Realität ab und erzeugt ein falsches Bild. Die Frage ist, ob und wie Modellentwickler steuern sollten.',
      },
    },
    {
      id: 'e2-scenario',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Jamal, 15, macht ein Schulprojekt',
        tone: 'info',
        points: [
          'Jamal nutzt einen KI-Bildgenerator für ein Schulprojekt zum Thema „Lehrkräfte der Zukunft".',
          'Er generiert Bilder zu verschiedenen Fächern – und stellt fest: Physik und Informatik zeigen fast nur Männer, Kunst und Musik fast nur Frauen.',
          'Zuerst denkt er: „Ist halt so." Dann fragt er sich: Woher kommt dieses Muster? Und: Will ich das in meinem Projekt zeigen?',
        ],
      },
    },
    {
      id: 'e2-transition',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Jamals Frage ist die entscheidende: Es reicht nicht, Bias zu erkennen und einzuordnen. Die nächste Frage ist: Was macht das mit uns? Darum geht es in E3.',
      },
    },
  ],

  // ─── E3: Bilder wirken ─────────────────────────────────────────────
  e3: [
    {
      id: 'e3-hero-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        kicker: 'Was siehst du – und was macht das mit dir?',
        text: 'Bilder wirken',
        level: 2,
      },
    },
    {
      id: 'e3-hero-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Du weißt jetzt, dass KI-Bilder systematische Muster zeigen (E1) und dass diese Muster die Realität verzerren können (E2). Aber was macht das mit den Menschen, die diese Bilder sehen? Lass es uns ausprobieren.',
      },
    },
    {
      id: 'e3-contrast-images',
      type: 'image-compare',
      revealOnScroll: true,
      data: {
        title: 'Zwei Fächer – zwei Welten?',
        left: {
          src: '/images/generated/informatiklehrkraft/flux2pro/_kontaktblatt.webp',
          alt: 'Kontaktblatt Informatiklehrkraft – fast nur Männer',
          caption: 'Informatiklehrkraft (FLUX2 PRO)',
        },
        right: {
          src: '/images/generated/kunstlehrkraft/flux2pro/_kontaktblatt.webp',
          alt: 'Kontaktblatt Kunstlehrkraft – fast nur Frauen',
          caption: 'Kunstlehrkraft (FLUX2 PRO)',
        },
      },
    },
    {
      id: 'e3-contrast-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Gleicher Prompt-Aufbau, gleiches Modell – und trotzdem völlig unterschiedliche Darstellungen. Wenn du diese Bilder siehst, prägen sie dein Bild davon, wer diese Fächer unterrichtet. Lass uns das testen.',
      },
    },
    {
      id: 'e3-experiment',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'PerceptionExperiment',
      },
    },
    {
      id: 'e3-experiment-reflection',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Ob die Bildserie deine Vorstellung beeinflusst hat oder nicht – die Forschung zeigt: Wiederholte Exposition gegenüber gleichartigen Bildern prägt, was wir für „normal" halten. Und KI-Bildgeneratoren produzieren Millionen solcher Bilder – jeden Tag.',
      },
    },
    {
      id: 'e3-representation-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Representation Matters',
        level: 3,
      },
    },
    {
      id: 'e3-representation-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Sichtbarkeit in Bildern beeinflusst, was wir für „normal" halten. Wenn bestimmte Gruppen systematisch fehlen oder überrepräsentiert sind, prägt das unsere Vorstellung von der Welt – oft unbewusst.',
      },
    },
    {
      id: 'e3-representation-image',
      type: 'image-compare',
      revealOnScroll: true,
      data: {
        title: 'Wer wird sichtbar – und wer nicht?',
        left: {
          src: '/images/generated/sportlehrkraft/flux2pro/_kontaktblatt.webp',
          alt: 'Kontaktblatt Sportlehrkraft FLUX2 PRO',
          caption: 'Sportlehrkraft (FLUX2 PRO)',
        },
        right: {
          src: '/images/generated/sportlehrkraft/nanobana/_kontaktblatt.webp',
          alt: 'Kontaktblatt Sportlehrkraft Nano Bana',
          caption: 'Sportlehrkraft (Nano Bana)',
        },
      },
    },
    {
      id: 'e3-quote',
      type: 'quote',
      revealOnScroll: true,
      data: {
        text: 'If you can see it, you can be it.',
        source: 'Dieses Prinzip gilt nicht nur für Vorbilder im echten Leben – es gilt auch für die Bilder, die KI erzeugt.',
      },
    },
    {
      id: 'e3-cycle',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'RepresentationCycleViz',
      },
    },
    {
      id: 'e3-invisible-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Die unsichtbare Lücke',
        level: 3,
      },
    },
    {
      id: 'e3-invisible-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Bisher hast du gesehen, wie KI-Bilder bestimmte Gruppen überrepräsentieren oder verzerrt darstellen. Aber es gibt eine andere Form von Bias – eine, die schwerer zu entdecken ist: die vollständige Abwesenheit.',
      },
    },
    {
      id: 'e3-diversity-audit',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'DiversityAudit',
      },
    },
    {
      id: 'e3-discrimination-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Von Bias zu Diskriminierung',
        tone: 'warning',
        points: [
          'Bias ist ein statistisches Muster – eine Verzerrung in den Daten. Diskriminierung ist die gesellschaftliche Konsequenz: Wenn eine Gruppe in Bildern nicht vorkommt, wird sie im kollektiven Bewusstsein unsichtbar.',
          'Ableismus – die Diskriminierung von Menschen mit Behinderung – zeigt sich hier besonders deutlich: Nicht einmal der explizite Wunsch nach „Diversität" führt bei den meisten Modellen zu Sichtbarkeit.',
          'Das „If you can see it, you can be it"-Prinzip gilt umgekehrt: Was nie gezeigt wird, existiert in der Vorstellungswelt nicht.',
        ],
      },
    },
    {
      id: 'e3-gemini-reveal',
      type: 'reveal',
      revealOnScroll: true,
      data: {
        question: 'Warum zeigt ausgerechnet Gemini Image 2 Menschen mit Behinderung?',
        answer: 'Wahrscheinlich eine bewusste Entscheidung im Finetuning: Das Modell wurde trainiert, bei Prompts wie „divers" auch Dimensionen wie Behinderung, Religion und queere Identität einzubeziehen. Das zeigt: Inklusion in KI-Bildern ist technisch möglich – sie muss nur gewollt sein.',
      },
    },
    {
      id: 'e3-lena-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Lena, 16, will Informatik studieren',
        level: 3,
      },
    },
    {
      id: 'e3-lena-scenario',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Ein Gedankenexperiment',
        tone: 'info',
        points: [
          'Lena interessiert sich für Programmierung und sucht nach Vorbildern.',
          'Sie gibt „Informatiklehrkraft" in einen KI-Bildgenerator ein – und sieht 16 Männer.',
          'Kein einziges Bild zeigt eine Person, in der sie sich wiedererkennt.',
          'Lena fragt sich: Bin ich hier richtig?',
        ],
      },
    },
    {
      id: 'e3-kontaktblatt',
      type: 'image',
      revealOnScroll: true,
      data: {
        src: '/images/generated/informatiklehrkraft/flux2pro/_kontaktblatt.webp',
        alt: 'Kontaktblatt Informatiklehrkraft – fast ausschließlich Männer',
        caption: 'Informatiklehrkraft – FLUX2 PRO: Lenas Suchergebnis.',
      },
    },
    {
      id: 'e3-lena-other-models',
      type: 'image-compare',
      revealOnScroll: true,
      data: {
        title: 'Auch andere Modelle – dasselbe Bild?',
        left: {
          src: '/images/generated/informatiklehrkraft/gpt-image-1-5/_kontaktblatt.webp',
          alt: 'Kontaktblatt Informatiklehrkraft GPT Image-1.5',
          caption: 'GPT Image-1.5',
        },
        right: {
          src: '/images/generated/informatiklehrkraft/nanobana/_kontaktblatt.webp',
          alt: 'Kontaktblatt Informatiklehrkraft Nano Bana',
          caption: 'Nano Bana',
        },
      },
    },
    {
      id: 'e3-berufswahl-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'In Deutschland sind nur ca. 23% der Studienanfänger:innen in Informatik weiblich. Wenn zwei von drei KI-Modellen Informatiklehrkräfte zu 100% männlich darstellen – hilft das, den Anteil zu erhöhen? KI-Bilder allein ändern keine Berufsentscheidungen. Aber sie sind Teil eines Systems von Bildern, das Vorstellungen prägt.',
      },
    },
    {
      id: 'e3-checkpoint',
      type: 'checkpoint',
      revealOnScroll: true,
      data: {
        question: 'Was ist der Unterschied zwischen einem einzelnen stereotypen Bild und einem System von stereotypen Bildern?',
        answer: 'Ein einzelnes Bild ist harmlos. Aber wenn tausende KI-generierte Bilder dasselbe Muster zeigen, entsteht eine neue „Normalität" – eine, die bestehende Ungleichheiten verfestigt.',
      },
    },
    {
      id: 'e3-reveal-1',
      type: 'reveal',
      revealOnScroll: true,
      data: {
        question: 'Wie würdest du dich fühlen, wenn dein angestrebter Beruf in KI-Bildern fast nie von Menschen wie dir dargestellt wird?',
        answer: 'Es geht nicht darum, ob ein einzelnes Bild schadet. Es geht um die Summe: Wenn tausende Bilder dasselbe Muster zeigen, entsteht eine Vorstellung davon, wer „dazugehört" – und wer nicht.',
      },
    },
    {
      id: 'e3-reveal-2',
      type: 'reveal',
      revealOnScroll: true,
      data: {
        question: 'Welche Berufsbilder hast du im Kopf – und woher stammen diese Bilder?',
        answer: 'Unsere Vorstellungen von Berufen werden von Medien, Erfahrungen und dem sozialen Umfeld geprägt. KI-Bilder fügen sich in diese Prägung ein – und können sie verstärken.',
      },
    },
    {
      id: 'e3-reveal-3',
      type: 'reveal',
      revealOnScroll: true,
      data: {
        question: 'Wer profitiert von stereotypen Darstellungen?',
        answer: 'Stereotypen vereinfachen – das kann bequem sein. Aber sie schränken den Möglichkeitsraum ein: für alle, die nicht dem Stereotyp entsprechen, wird der Weg in einen Beruf oder eine Rolle schwieriger.',
      },
    },
    {
      id: 'e3-einordnung-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Einordnung',
        tone: 'warning',
        points: [
          'Das ist kein Beweis, dass KI-Bilder direkt Berufsentscheidungen beeinflussen.',
          'Aber sie sind Teil eines Systems von Bildern, das Vorstellungen prägt.',
          'Korrelation ist nicht Kausalität – aber Wirkungsforschung zu Medienbildern zeigt klar: Repräsentation hat Einfluss.',
        ],
      },
    },
  ],

  // ─── E4: Strom für Pixel ───────────────────────────────────────────
  e4: [
    {
      id: 'e4-hero-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        kicker: 'Was kostet ein Bild?',
        text: 'Strom für Pixel',
        level: 2,
      },
    },
    {
      id: 'e4-hero-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Du hast 480 Lehrkräfte-Bilder im Bereich Entdecken gesehen. Was hat das an Strom gekostet? Unsere didaktische Annahme (Stand Frühjahr 2026) liegt bei 0,003–0,01 kWh pro Bild – je nach Modell und Auflösung. Für alle rund 850 Bilder dieser Lernumgebung ergibt das etwa 2,6–8,5 kWh.',
      },
    },
    {
      id: 'e4-sources-infobox',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Quellen und Annahmen (Stand Frühjahr 2026)',
        tone: 'info',
        points: [
          'Didaktischer Bereich pro Bild: 0,003–0,01 kWh (Forschung zu Stable Diffusion / generativer Inferenz): https://arxiv.org/abs/2311.16863',
          'Deutscher Strommix für CO₂-Umrechnung: 363 g CO₂/kWh (UBA, 2024-Wert): https://www.umweltbundesamt.de/themen/co2-emissionen-pro-kilowattstunde-strom-2024',
          'Streaming-Vergleich nur als Orientierung (IEA-Einordnung): https://www.iea.org/commentaries/the-carbon-footprint-of-streaming-video-fact-checking-the-headlines',
        ],
      },
    },
    {
      id: 'e4-calculator',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'EnergyCostCalculator',
      },
    },
    {
      id: 'e4-training-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Training vs. Inference',
        level: 3,
      },
    },
    {
      id: 'e4-training-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Beim Energieverbrauch von KI gibt es eine wichtige Unterscheidung: Das Training eines Modells ist enorm energieintensiv – es dauert Monate auf tausenden GPUs. Die Generierung eines einzelnen Bildes (Inference) verbraucht dagegen deutlich weniger. Aber: Bei Millionen Nutzer:innen summiert sich auch das.',
      },
    },
    {
      id: 'e4-analogy',
      type: 'quote',
      revealOnScroll: true,
      data: {
        text: 'Training ist wie den Ofen zu bauen. Inference ist wie ein Brot zu backen. Der Ofen kostet viel – aber wenn Milliarden Brote gebacken werden, zählt auch der Einzelverbrauch.',
      },
    },
    {
      id: 'e4-water-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Oft übersehen: Wasserverbrauch',
        tone: 'warning',
        points: [
          'Rechenzentren brauchen Kühlung – und dafür große Mengen Wasser.',
          'Für große Sprachmodelle wurden in Studien mehrere hunderttausend Liter Wasser berichtet (häufig zitierter Richtwert: rund 700.000 Liter).',
          'Auch bei der täglichen Nutzung fällt Kühlwasser an.',
        ],
      },
    },
    {
      id: 'e4-scale-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Die große Zahl',
        level: 3,
      },
    },
    {
      id: 'e4-scale-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Je nach Quelle liegen Schätzungen für KI-Bilder pro Tag in einer breiten Größenordnung (z. B. einige zehn Millionen). Selbst konservativ gerechnet summiert sich das auf einen erheblichen Energieverbrauch.',
      },
    },
    {
      id: 'e4-platform-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Diese Lernumgebung',
        tone: 'info',
        points: [
          'Für KI:Blick wurden rund 850 Bilder generiert – mit drei verschiedenen Modellen und verschiedenen Prompts.',
          'Der geschätzte Energieverbrauch: 2,6–8,5 kWh. Das entspricht etwa 135–450 Smartphone-Ladungen.',
          'Damit du diese Bilder analysieren und lernen kannst, mussten sie genau einmal generiert werden. Der Strom ist verbraucht – aber das Wissen bleibt.',
        ],
      },
    },
    {
      id: 'e4-context-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Kontext behalten',
        tone: 'info',
        points: [
          'KI-Bildgenerierung ist nicht die einzige energieintensive digitale Aktivität.',
          'Video-Streaming, Social Media und Online-Gaming verbrauchen ebenfalls erhebliche Ressourcen.',
          'Es geht nicht um Schuld, sondern um bewussten Umgang mit digitalen Ressourcen.',
        ],
      },
    },
    {
      id: 'e4-checkpoint',
      type: 'checkpoint',
      revealOnScroll: true,
      data: {
        question: 'Was verbraucht mehr Energie: das Training eines Bildmodells oder die Generierung aller Bilder, die es jemals erzeugen wird?',
        answer: 'Es kommt auf die Nutzung an. Bei sehr populären Modellen übersteigt die Summe aller Inferenz-Vorgänge den Trainingsaufwand. Das Training ist einmalig hoch – aber die Nutzung wächst kontinuierlich.',
      },
    },
    {
      id: 'e4-verbraucher-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Du als Verbraucher:in',
        level: 3,
      },
    },
    {
      id: 'e4-verbraucher-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Du triffst täglich Entscheidungen über digitalen Konsum. KI-Bildgenerierung ist eine davon. Das heißt nicht, dass du keine KI-Bilder mehr generieren sollst – aber wie bei jeder Ressource lohnt es sich, bewusst zu entscheiden.',
      },
    },
    {
      id: 'e4-verbraucher-reveal',
      type: 'reveal',
      revealOnScroll: true,
      data: {
        question: 'Heißt das, ich soll keine KI-Bilder mehr generieren?',
        answer: 'Nein. Aber wie bei jeder Ressource lohnt es sich, bewusst zu entscheiden. Brauchst du 16 Varianten – oder reicht eine? Muss es die höchste Auflösung sein? Bewusster Umgang ist kein Verzicht.',
      },
    },
  ],

  // ─── E5: Bewusst generieren ────────────────────────────────────────
  e5: [
    {
      id: 'e5-hero-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        kicker: 'Du hast die Kontrolle – teilweise',
        text: 'Bewusst generieren',
        level: 2,
      },
    },
    {
      id: 'e5-hero-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Du weißt jetzt, wie KI Bilder erzeugt (Verstehen), welche Muster dabei entstehen (Entdecken) und warum das problematisch sein kann (Einordnen). Was kannst du selbst tun? Der Prompt ist ein Hebel – aber kein Allheilmittel.',
      },
    },
    {
      id: 'e5-strategies-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Drei Strategien im Vergleich',
        level: 3,
      },
    },
    {
      id: 'e5-strategies-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Es gibt verschiedene Ansätze, um KI-Bilder bewusster zu generieren. Wir haben drei davon ausprobiert – mit echten Ergebnissen. Vergleiche die Default-Prompts mit den verbesserten Varianten:',
      },
    },
    {
      id: 'e5-prompt-compare',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'PromptCompare',
      },
    },
    {
      id: 'e5-diversity-finding',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Wechsle zum vierten Tab „Was heißt divers?". Dort siehst du denselben Prompt bei allen vier Modellen. Die meisten interpretieren „divers" als ethnische Vielfalt – Hautfarbe und Geschlecht. Nur Gemini Image 2 zeigt auch Rollstühle, Hijabs und queere Codes. Die anderen Modelle blenden ganze Dimensionen von Vielfalt aus.',
      },
    },
    {
      id: 'e5-stereotype-within-reveal',
      type: 'reveal',
      revealOnScroll: true,
      data: {
        question: 'Aber ist Geminis Darstellung wirklich besser?',
        answer: 'Gemini zeigt mehr Dimensionen – aber mit eigenen Stereotypen. Behinderung = Rollstuhl. Islam = Hijab. Queerness = bunte Haare. Das ist besser als Unsichtbarkeit, aber es ersetzt ein Klischee durch ein anderes. Echte Vielfalt lässt sich nicht durch ein einzelnes visuelles Merkmal darstellen.',
      },
    },
    {
      id: 'e5-strategies-reflection',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Keine Strategie ist perfekt. Alle drei können die Ergebnisse verbessern, aber keine garantiert faire Darstellungen. Der Prompt ist ein Werkzeug – aber die Verantwortung liegt bei dir.',
      },
    },
    {
      id: 'e5-mia-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Mia, 17, erstellt eine Präsentation',
        level: 3,
      },
    },
    {
      id: 'e5-mia-scenario',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Vom Wissen zum Handeln',
        tone: 'info',
        points: [
          'Mia braucht ein Bild einer Physiklehrkraft für ihre Präsentation.',
          'Der erste Prompt „Physiklehrkraft" erzeugt nur Männer mit Laborkittel und Brille.',
          'Sie versucht: „Junge Physiklehrerin erklärt Schüler:innen ein Experiment" – das Ergebnis ist vielfältiger.',
          'Der Prompt ist ein Werkzeug. Aber die Verantwortung für das, was sie teilt, liegt bei ihr.',
        ],
      },
    },
    {
      id: 'e5-share-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Verantwortung beim Teilen',
        level: 3,
      },
    },
    {
      id: 'e5-share-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Ein KI-generiertes Bild ist kein Foto. Es zeigt keine reale Person. Aber es kann wie eines wirken – und genau darin liegt die Verantwortung.',
      },
    },
    {
      id: 'e5-share-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Drei Regeln für verantwortungsvolles Teilen',
        tone: 'warning',
        points: [
          'KI-generierte Bilder immer als solche kennzeichnen.',
          'Vor dem Teilen fragen: Verstärkt dieses Bild ein Stereotyp?',
          'Bedenken: Wer könnte sich durch diese Darstellung verletzt fühlen?',
        ],
      },
    },
    {
      id: 'e5-share-tool',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'ShareDecisionTool',
      },
    },
    {
      id: 'e5-takeaway-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Was nimmst du mit?',
        level: 3,
      },
    },
    {
      id: 'e5-takeaway-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Drei Erkenntnisse',
        tone: 'info',
        points: [
          'KI-Bilder sind nie neutral. Sie tragen die Muster ihrer Trainingsdaten – und jedes generierte Bild ist eine Aussage darüber, was das Modell gelernt hat.',
          'Der Prompt gibt dir Kontrolle – aber die KI hat trotzdem eigene Tendenzen. Du kannst die Darstellung beeinflussen, aber nicht vollständig steuern.',
          'Verantwortung liegt nicht nur bei den Entwickler:innen. Auch du als Nutzer:in trägst Verantwortung: bei der Formulierung, bei der Auswahl und beim Teilen.',
        ],
      },
    },
  ],
};

export const EINORDNEN_CHECKOUTS: Record<EinordnenUnitId, CheckoutElement> = {
  e1: {
    id: 'e1-quiz',
    unitId: 'e1',
    type: 'quiz',
    question: 'Wann spricht man von Bias in KI-generierten Bildern?',
    options: [
      {
        text: 'Wenn ein einzelnes Bild ein Stereotyp zeigt.',
        correct: false,
        feedback: 'Ein einzelnes Bild kann zufällig sein. Bias beschreibt systematische, wiederkehrende Muster über viele Generierungen hinweg.',
      },
      {
        text: 'Wenn über viele Bilder hinweg ein systematisches Muster erkennbar ist, das bestimmte Gruppen oder Kulturen verzerrt darstellt.',
        correct: true,
        feedback: 'Genau. Bias ist kein Einzelfall, sondern ein statistisches Muster – ob bei Geschlecht, Kultur, Alter oder Darstellung.',
      },
      {
        text: 'Wenn die KI absichtlich diskriminierende Bilder erzeugt.',
        correct: false,
        feedback: 'Die KI hat keine Absicht. Bias entsteht durch Muster in den Trainingsdaten, nicht durch eine Entscheidung der KI.',
      },
      {
        text: 'Nur wenn es um Geschlecht geht.',
        correct: false,
        feedback: 'Bias hat viele Formen: Geschlecht, Kultur, Alter, Darstellung. Geschlechter-Bias ist die auffälligste Form, aber nicht die einzige.',
      },
    ],
    hint: 'Denke an die Unterscheidung zwischen Einzelfall und System – und an die verschiedenen Bias-Typen.',
  },
  e2: {
    id: 'e2-assignment',
    unitId: 'e2',
    type: 'assignment',
    question: 'Ordne die Beispiele den passenden Kategorien zu.',
    preamble: 'Die Prozentzahlen in den Aussagen reichen für die Zuordnung – du musst nicht erst alle Bilder gesehen haben. Die Balken zeigen den Unterschied zwischen KI und Realität auf einen Blick. Wer die Bilder trotzdem ansehen möchte, findet unter jeder Aussage einen Link.',
    assignmentBuckets: ['Spiegel', 'Verstärker', 'Erfinder'],
    assignmentItems: [
      {
        id: 'e2-a1',
        statement: 'Mathematiklehrkraft (alle Modelle): KI zeigt ca. 54% weiblich, Realität zeigt ca. 55%.',
        kiPercent: 54,
        realityPercent: 55,
        entdeckenLink: '/entdecken/mathematiklehrkraft',
        correctBucket: 'Spiegel',
        feedback: 'Richtig. Die KI-Darstellung liegt nahe an der realen Verteilung – ein relativ genaues Abbild.',
      },
      {
        id: 'e2-a2',
        statement: 'Informatiklehrkraft (FLUX2 PRO): KI zeigt 0% weiblich, Realität zeigt ca. 25%.',
        kiPercent: 0,
        realityPercent: 25,
        entdeckenLink: '/entdecken/informatiklehrkraft',
        correctBucket: 'Verstärker',
        feedback: 'Richtig. Die KI übertreibt das reale Ungleichgewicht extrem – aus 25% werden 0%.',
      },
      {
        id: 'e2-a3',
        statement: 'Sportlehrkraft (Nano Bana): KI zeigt ca. 94% weiblich, Realität zeigt ca. 43%.',
        kiPercent: 94,
        realityPercent: 43,
        entdeckenLink: '/entdecken/sportlehrkraft',
        correctBucket: 'Erfinder',
        feedback: 'Richtig. In der Realität ist Sport eher männlich dominiert – die KI erfindet eine fast rein weibliche Darstellung.',
      },
    ],
    hint: 'Vergleiche die KI-Werte mit den realen Statistiken. Ab welcher Abweichung wird aus einem Spiegel ein Verstärker – und wann erfindet die KI etwas ganz Neues?',
  },
  e3: {
    id: 'e3-reflection',
    unitId: 'e3',
    type: 'reflection',
    question: 'Beschreibe in 2–3 Sätzen: Hat das Wahrnehmungs-Experiment deine Vorstellung beeinflusst? Was hat dich am meisten überrascht?',
  },
  e4: {
    id: 'e4-quiz',
    unitId: 'e4',
    type: 'quiz',
    question: 'Welcher Aspekt des KI-Energieverbrauchs wird oft übersehen?',
    options: [
      {
        text: 'Der Stromverbrauch beim Training.',
        correct: false,
        feedback: 'Der Trainingsverbrauch ist mittlerweile bekannt und wird häufig diskutiert.',
      },
      {
        text: 'Der Wasserverbrauch für die Kühlung der Rechenzentren.',
        correct: true,
        feedback: 'Richtig. Die enormen Mengen an Kühlwasser werden in der öffentlichen Diskussion oft übersehen.',
      },
      {
        text: 'Die Kosten für Grafikkarten.',
        correct: false,
        feedback: 'Das ist ein wirtschaftlicher Aspekt, kein Umweltaspekt. Gemeint war der ökologische Fußabdruck.',
      },
    ],
    hint: 'Es geht nicht nur um Strom.',
  },
  e5: {
    id: 'e5-reflection',
    unitId: 'e5',
    type: 'reflection',
    question: 'Formuliere einen Prompt, der eine realistischere Darstellung einer Lehrkraft erzeugen soll. Nutze eine der drei Strategien (Diversität explizit, Stereotyp brechen, Kontext ergänzen) und erkläre in 2–3 Sätzen, warum du dich für diese Formulierung und Strategie entschieden hast.',
  },
};
