import type { CheckoutElement, ContentBlock } from '../types/knowledge.types';

export type VerstehenUnitId = 'v1' | 'v2' | 'v3';

export const VERSTEHEN_CONTENT: Record<VerstehenUnitId, ContentBlock[]> = {
  v1: [
    // --- Akt 1: „Ein Wort – und dann?" ---
    {
      id: 'v1-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        kicker: 'Ein Wort, 16 Bilder',
        text: 'Vom Text zum Bild',
        level: 2,
      },
    },
    {
      id: 'v1-intro-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Du tippst ein einziges Wort: Leuchtturm. Was passiert danach? Keine Internetsuche. Kein Fotoalbum. Keine Künstlerin, die zum Pinsel greift. Stattdessen: Mathematik, Rauschen und Wahrscheinlichkeit. Und am Ende stehen 16 Bilder, die es vorher nicht gab.',
      },
    },
    {
      id: 'v1-image-grid',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'V1SeriesGrid',
      },
    },
    {
      id: 'v1-no-copy-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Keines dieser Bilder wurde kopiert oder aus dem Internet geholt. Jedes wurde Pixel für Pixel neu berechnet – auf Basis dessen, was das Modell in Milliarden von Bild-Text-Paaren gelernt hat. Aber wie?',
      },
    },
    {
      id: 'v1-prompt-exploder',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'PromptExploder',
      },
    },
    // --- Akt 2: „Wie ein Bild aus dem Nichts entsteht" ---
    {
      id: 'v1-diffusion-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Vom Rauschen zum Bild: Der Diffusionsprozess',
        level: 3,
      },
    },
    {
      id: 'v1-diffusion-text-1',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Stell dir ein Fernsehbild ohne Empfang vor: reines Bildrauschen. Genau dort startet die KI. Sie beginnt mit zufälligen Pixeln – totalem Chaos – und entfernt Schritt für Schritt das Rauschen. In jedem Schritt fragt sie sich: „Welche Pixel gehören zum Signal und welche zum Rauschen?" Nach 20 bis 50 solcher Schritte entsteht ein Bild.',
      },
    },
    {
      id: 'v1-diffusion-text-2',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Das Modell hat in seiner Trainingsphase gelernt, wie Rauschen aussieht – und wie das Gegenteil davon aussieht: Struktur, Kanten, Farben, Texturen. Dieses Wissen wendet es jetzt rückwärts an: Rauschen rein → Bild raus.',
      },
    },
    {
      id: 'v1-denoising-simulator',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'DenoisingSimulator',
      },
    },
    {
      id: 'v1-diffusion-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Warum „Diffusion"?',
        tone: 'info',
        points: [
          'Der Name kommt aus der Physik: Diffusion beschreibt, wie sich Teilchen von geordnet zu ungeordnet verteilen – wie ein Tropfen Tinte im Wasser.',
          'Diffusionsmodelle kehren diesen Prozess um: Sie nehmen Unordnung (Rauschen) und erzeugen daraus Ordnung (Bild).',
          'Der Prompt steuert dabei die Richtung: Er sagt dem Modell, welche Art von Ordnung es anstreben soll.',
        ],
      },
    },
    {
      id: 'v1-checkpoint-denoising',
      type: 'checkpoint',
      revealOnScroll: true,
      data: {
        question: 'Was entfernt das Modell in jedem Denoising-Schritt?',
        answer: 'Geschätztes Rauschen. Das Modell hat gelernt, Rauschen von Bildstruktur zu unterscheiden, und entfernt in jedem Schritt den geschätzten Rauschanteil.',
        hint: 'Denke an das Prinzip: Rauschen rein → Bild raus.',
      },
    },
    // --- Akt 3: „Der Würfelwurf am Anfang" ---
    {
      id: 'v1-seed-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Seed: Warum kein Bild wie das andere ist',
        level: 3,
      },
    },
    {
      id: 'v1-seed-text-1',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Wenn der Prozess immer gleich abläuft – warum sehen dann 16 Bilder zum Prompt „Leuchtturm" so unterschiedlich aus? Die Antwort ist der Seed: eine Zahl, die den Startpunkt im Rauschfeld festlegt.',
      },
    },
    {
      id: 'v1-seed-text-2',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Stell dir den Seed wie einen Würfel vor, den du vor dem Start wirfst. Jede Zahl ergibt ein anderes Rauschfeld – und damit ein anderes Bild. Der Prompt bleibt gleich, die Pipeline bleibt gleich, aber der Startpunkt verschiebt sich.',
      },
    },
    {
      id: 'v1-seed-experiment',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'SeedExperiment',
      },
    },
    {
      id: 'v1-seed-text-3',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Das bedeutet auch: Wenn du Prompt und Seed identisch lässt, entsteht exakt dasselbe Bild. Das macht KI-Generierung reproduzierbar – ein wichtiger Unterschied zu echtem Zufall.',
      },
    },
    {
      id: 'v1-checkpoint-seed',
      type: 'checkpoint',
      revealOnScroll: true,
      data: {
        question: 'Was passiert, wenn du denselben Prompt mit demselben Seed erneut generierst?',
        answer: 'Du erhältst dasselbe Bild. Prompt und Seed zusammen bestimmen den reproduzierbaren Startzustand. Nur wenn sich einer der beiden ändert, ändert sich das Ergebnis.',
        hint: 'Probiere im Experiment oben den Button „Gleicher Seed".',
      },
    },
    // --- Akt 4: „Was die KI nicht tut" ---
    {
      id: 'v1-myth-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Häufige Missverständnisse',
        level: 3,
      },
    },
    {
      id: 'v1-myth-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Bevor wir weitergehen: Viele Vorstellungen über Bild-KI klingen plausibel, sind aber falsch. Teste dein Wissen.',
      },
    },
    {
      id: 'v1-mythbuster',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'MythBuster',
      },
    },
    // --- Akt 5: „Die ganze Pipeline auf einen Blick" ---
    {
      id: 'v1-summary-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Zusammenfassung: Vom Prompt zum Pixel',
        level: 3,
      },
    },
    {
      id: 'v1-summary-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Du hast jetzt die wichtigsten Bausteine kennen gelernt: den Prompt als Steuerungseinheit, den Diffusionsprozess als Erzeugungsmechanismus und den Seed als Zufallselement. Hier siehst du, wie alles zusammenhängt:',
      },
    },
    {
      id: 'v1-pipeline-overview',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'PipelineOverview',
      },
    },
    {
      id: 'v1-quote',
      type: 'quote',
      revealOnScroll: true,
      data: {
        text: 'Generative Bild-KI produziert keine Wahrheit – sie produziert wahrscheinliche Pixel.',
      },
    },
    {
      id: 'v1-outro-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Du weißt jetzt, wie ein einzelnes Bild entsteht. Aber woher kommen die Muster, die das Modell gelernt hat? Warum erzeugt es bestimmte Bildwelten häufiger als andere? Das erfährst du in der nächsten Einheit.',
      },
    },
    {
      id: 'v1-reveal-preview',
      type: 'reveal',
      revealOnScroll: true,
      data: {
        question: 'Vorschau: Was hat das mit Bias zu tun?',
        answer: 'Wenn die Trainingsdaten bestimmte Muster häufiger enthalten als andere, tauchen diese Muster auch häufiger in den generierten Bildern auf. Der Diffusionsprozess ist neutral – aber die Daten sind es nicht.',
      },
    },
  ],
  v2: [
    // --- Akt 1: „5,85 Milliarden Lehrbeispiele" ---
    {
      id: 'v2-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        kicker: 'Woher kommt das Weltbild der KI?',
        text: 'Was die KI gelernt hat',
        level: 2,
      },
    },
    {
      id: 'v2-intro-text-1',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'In Modul V1 hast du gesehen, wie ein Bild aus Rauschen entsteht. Aber woher weiß die KI, wie ein Leuchtturm aussieht? Warum erzeugt sie bei „Brot" etwas anderes als bei „Bread"? Die Antwort liegt in den Daten, aus denen sie gelernt hat.',
      },
    },
    {
      id: 'v2-intro-text-2',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Stell dir vor, du sollst ein Bild von etwas malen, das du nie gesehen hast. Unmöglich. Auch eine KI kann nur erzeugen, was sie vorher in Milliarden von Beispielen gesehen hat.',
      },
    },
    {
      id: 'v2-data-magnifier',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'DataMagnifier',
      },
    },
    // --- Akt 2: „Bild trifft Text" ---
    {
      id: 'v2-pair-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Bild + Text = Trainingspaar',
        level: 3,
      },
    },
    {
      id: 'v2-pair-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Die KI lernt nicht aus Bildern allein. Jedes Trainingsbeispiel besteht aus zwei Teilen: einem Bild und einer Textbeschreibung. Dieses Paar sagt dem Modell: „So sieht etwas aus, das man so beschreibt." Aus Milliarden solcher Paare lernt es, welche visuellen Muster zu welchen Wörtern gehören.',
      },
    },
    {
      id: 'v2-training-pair-builder',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'TrainingPairBuilder',
      },
    },
    {
      id: 'v2-pair-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Warum die Beschreibung so wichtig ist',
        tone: 'info',
        points: [
          'Ein Bild ohne Beschreibung ist für das Training wertlos – das Modell wüsste nicht, welches Konzept es daraus lernen soll.',
          'Schlechte oder falsche Beschreibungen führen zu falschen Verknüpfungen: Die KI „glaubt" dann, dass ein Brot eine Torte ist.',
          'Die meisten Beschreibungen stammen aus Alt-Texten von Webseiten, das sind Beschreibungen des Bildes – und die sind oft knapp, fehlerhaft oder fehlen ganz.',
        ],
      },
    },
    {
      id: 'v2-checkpoint-pair',
      type: 'checkpoint',
      revealOnScroll: true,
      data: {
        question: 'Was lernt ein Modell aus einem Bild-Text-Paar?',
        answer: 'Es lernt die statistische Verbindung zwischen dem Text und den visuellen Mustern im Bild. Viele ähnliche Paare verstärken diese Verbindung.',
        hint: 'Denke an Tab 1 des Trainingspaar-Explorers.',
      },
    },
    // --- Akt 3: „Das Internet als Lehrerin" ---
    {
      id: 'v2-origin-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Woher kommen die Daten?',
        level: 3,
      },
    },
    {
      id: 'v2-origin-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Die Trainingsdaten fallen nicht vom Himmel. Automatische Programme – sogenannte Crawler – durchsuchen das Internet und sammeln Bilder mitsamt ihren Alt-Texten. Das passiert vollautomatisch, ungefiltert und in gigantischem Maßstab.',
      },
    },
    {
      id: 'v2-web-crawler',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'WebCrawlerSimulator',
      },
    },
    {
      id: 'v2-origin-problem-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Das Problem: Das Internet ist kein neutraler Spiegel der Welt. Wer online ist, welche Sprache dominiert, welche Bilder hochgeladen werden – all das bestimmt, was im Datensatz landet. Und was nicht im Datensatz ist, kann die KI nicht lernen.',
      },
    },
    {
      id: 'v2-data-origin-explorer',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'DataOriginExplorer',
      },
    },
    {
      id: 'v2-checkpoint-origin',
      type: 'checkpoint',
      revealOnScroll: true,
      data: {
        question: 'Warum zeigt die KI bei dem Prompt „Pain" Schmerz statt Brot, obwohl das Wort auf Französisch „Brot" bedeutet?',
        answer: 'Weil englischsprachige Inhalte die Trainingsdaten dominieren. Das Modell hat „pain" viel häufiger im Kontext von Schmerz gesehen als im Kontext von Brot.',
        hint: 'Schau dir im Trainingspaar-Explorer Tab 3 den Vergleich zwischen „Pain" und „Le pain" an.',
      },
    },
    // --- Akt 4: „Was fehlt, formt mit" ---
    {
      id: 'v2-gap-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Lücken im Datensatz',
        level: 3,
      },
    },
    {
      id: 'v2-gap-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Bias in KI-Bildern entsteht nicht nur durch das, was im Datensatz ist – sondern auch durch das, was fehlt. Wenn bestimmte Perspektiven, Kulturen oder Darstellungen unterrepräsentiert sind, lernt das Modell eine verzerrte Version der Wirklichkeit.',
      },
    },
    {
      id: 'v2-data-gap-explorer',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'DataGapExplorer',
      },
    },
    {
      id: 'v2-gigo-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Garbage in, garbage out',
        tone: 'warning',
        points: [
          'Mehr Daten machen Ergebnisse nicht automatisch besser – es kommt auf die Vielfalt und Qualität an.',
          'Bias wird nicht nur reproduziert, sondern kann verstärkt werden: Wenn ein Muster in den Daten 60% ausmacht, kann es in der Ausgabe 80% erreichen.',
          'Bewusste Kuratierung von Datensätzen ist möglich, aber bei Milliarden von Bildern extrem aufwendig.',
        ],
      },
    },
    // --- Akt 5: „Vom Datensatz zum Bild" ---
    {
      id: 'v2-chain-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Die ganze Kette auf einen Blick',
        level: 3,
      },
    },
    {
      id: 'v2-chain-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Du hast jetzt gesehen: Internetdaten werden gesammelt, bilden einen Datensatz, daraus lernt das Modell Muster, und diese Muster bestimmen die Bilder. An jedem Punkt dieser Kette können Verzerrungen entstehen.',
      },
    },
    {
      id: 'v2-data-to-bias-chain',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'DataToBiasChain',
      },
    },
    {
      id: 'v2-quote',
      type: 'quote',
      revealOnScroll: true,
      data: {
        text: 'Die KI hat kein Weltbild – sie hat ein Datenbild.',
      },
    },
    {
      id: 'v2-outro-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Du weißt jetzt, woher die Muster kommen, die das Modell gelernt hat. Aber wie liest man eine ganze Serie von KI-Bildern? Wie erkennt man Muster, Lücken und Modellunterschiede? Das lernst du in V3.',
      },
    },
    {
      id: 'v2-reveal-preview',
      type: 'reveal',
      revealOnScroll: true,
      data: {
        question: 'Vorschau: Wie liest man eine KI-Bildserie?',
        answer: 'Mit einem systematischen Blick: Default identifizieren, Variation beschreiben, Lücken benennen, Modelle vergleichen. In V3 lernst du diese vier Schritte an einem einfachen Beispiel – bevor du sie auf gesellschaftlich relevante Bilder anwendest.',
      },
    },
  ],
  v3: [
    // --- Akt 1: „Nur ein Baum?" – Vom Einzelbild zur Serie ---
    {
      id: 'v3-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        kicker: 'Stell dir einen Baum vor',
        text: 'Nur ein Baum?',
        level: 2,
      },
    },
    {
      id: 'v3-intro-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Hier ist ein Bild. Eine KI hat es generiert, mit dem Prompt „Baum". Du siehst: einen Baum. Und das war\u2019s – ein einzelnes Bild sagt dir fast nichts über die KI, die es erzeugt hat.',
      },
    },
    {
      id: 'v3-single-to-series',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'SingleToSeriesReveal',
      },
    },
    {
      id: 'v3-pattern-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: '16 Bilder, ein Prompt. Und plötzlich erkennst du ein Muster: Alle Bäume sind Laubbäume. Alle stehen auf einer grünen Wiese. Alle zeigen Sommer. Kein einziger Nadelbaum, keine Palme, kein Herbst. Das ist kein Zufall – es ist der statistische Default dieses Modells.',
      },
    },
    {
      id: 'v3-single-vs-series-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Einzelbild vs. Serie',
        tone: 'info',
        points: [
          'Ein einzelnes KI-Bild ist wie ein einzelner Würfelwurf – es zeigt ein mögliches Ergebnis, aber nicht die Tendenz.',
          'Erst eine Serie von Bildern zum selben Prompt macht sichtbar, was das Modell „gelernt" hat: den statistischen Default.',
          'Der Default ist das häufigste Muster in den Trainingsdaten – das Bild, zu dem die KI immer wieder zurückkehrt.',
        ],
      },
    },
    // --- Akt 2: „Was immer da ist, was nie da ist" – Der Default ---
    {
      id: 'v3-default-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Der statistische Default',
        level: 3,
      },
    },
    {
      id: 'v3-default-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Wenn du dir alle 16 Bilder anschaust, erkennst du: Manche Merkmale tauchen in jedem Bild auf. Andere fehlen in der gesamten Serie. Diese zwei Listen – „immer da" und „nie da" – beschreiben den statistischen Default des Modells für diesen Prompt.',
      },
    },
    {
      id: 'v3-default-detector',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'DefaultDetector',
      },
    },
    {
      id: 'v3-default-explanation',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Der Default für „Baum" ist mitteleuropäisch: Laubbaum, grüne Wiese, Sommer. Das ist nicht überraschend – „Baum" ist ein deutsches Wort, und die Trainingsdaten verknüpfen es mit Bildern, die typisch für europäische Landschaften sind. Erinnerst du dich an V2? Die Sprache des Prompts aktiviert bestimmte Bereiche der Trainingsdaten.',
      },
    },
    {
      id: 'v3-tree-reveal',
      type: 'reveal',
      revealOnScroll: true,
      data: {
        question: 'Was wäre der Default bei „Tree"?',
        answer: 'Vermutlich ähnlich – aber nicht identisch. „Tree" als englischer Begriff dominiert die Trainingsdaten noch stärker und könnte eine noch breitere Vielfalt an Baumtypen zeigen, weil englischsprachige Bildbeschreibungen aus der ganzen Welt stammen. Oder auch nicht: Vielleicht dominieren auch hier nordamerikanische und europäische Bäume. Genau diese Art von Frage lässt sich mit einer Bildserie untersuchen.',
      },
    },
    {
      id: 'v3-checkpoint-default',
      type: 'checkpoint',
      revealOnScroll: true,
      data: {
        question: 'Was beschreibt den „statistischen Default" am besten?',
        answer: 'Das Muster, das die KI am häufigsten produziert – weil es in den Trainingsdaten am stärksten vertreten ist.',
        hint: 'Denke an das, was in ALLEN 16 Bildern gleich ist.',
      },
    },
    // --- Akt 3: „Variation und Lücken" ---
    {
      id: 'v3-variation-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Variation hat Grenzen',
        level: 3,
      },
    },
    {
      id: 'v3-variation-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Die 16 Bilder sind nicht identisch – da ist Variation. Mal scheint die Sonne, mal liegt Nebel über der Wiese. Mal steht der Baum nah, mal fern. Aber diese Variation bewegt sich innerhalb enger Grenzen. Die KI variiert Details, ohne den Default zu verlassen.',
      },
    },
    {
      id: 'v3-variation-mapper',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'VariationMapper',
      },
    },
    {
      id: 'v3-variation-vs-diversity',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Das ist der entscheidende Unterschied: Variation ist nicht Vielfalt. Die KI variiert Wetter, Perspektive und Lichtbedingungen – aber die Grundstruktur (Laubbaum, Wiese, Sommer, Europa) bleibt immer gleich. Was systematisch fehlt, nennen wir eine Lücke. Und Lücken sind nicht zufällig – sie zeigen, was in den Trainingsdaten unterrepräsentiert ist.',
      },
    },
    {
      id: 'v3-variation-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Variation \u2260 Vielfalt',
        tone: 'warning',
        points: [
          'Variation bedeutet: Das Modell variiert Einzelheiten (Wetter, Perspektive, Licht) innerhalb des gelernten Default.',
          'Vielfalt würde bedeuten: Das Modell erzeugt grundlegend verschiedene Interpretationen (Laubbaum UND Palme UND Nadelbaum UND Herbstbaum).',
          'Die Lücken – das, was systematisch fehlt – zeigen die Grenzen der Trainingsdaten.',
        ],
      },
    },
    // --- Akt 4: „Vier Signaturen" – Modelle vergleichen ---
    {
      id: 'v3-signature-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Vier Modelle, vier Signaturen',
        level: 3,
      },
    },
    {
      id: 'v3-signature-intro',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Bis jetzt hast du ein Modell betrachtet. Aber was passiert, wenn vier verschiedene Modelle denselben Prompt „Baum" verarbeiten? Alle zeigen Laubbäume auf Wiesen – der mitteleuropäische Default bleibt. Aber jedes Modell hat seinen eigenen Stil, seine eigene „Handschrift". Wir nennen das die Modellsignatur.',
      },
    },
    {
      id: 'v3-quad-comparison',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'QuadModelComparison',
      },
    },
    {
      id: 'v3-signature-text',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Die Signaturen sind erstaunlich konsistent: FLUX2 PRO bevorzugt weite Landschaften mit sanftem, oft nebeligem Licht. GPT Image-1.5 zeigt massive Stämme mit dramatischen, hyperdetaillierten Kronen. Nano Bana setzt auf cinematische Stimmung mit warmen Sonnenuntergängen und Blumenwiesen. Und Gemini Image 2? Dieses Modell hat eine Besonderheit\u2026',
      },
    },
    {
      id: 'v3-gemini-reveal',
      type: 'reveal',
      revealOnScroll: true,
      data: {
        question: 'Warum rendert ein Modell Text im Bild?',
        answer: 'Gemini Image 2 rendert das Wort „BAUM" auf einem Holzschild im Bild. Das ist ein Artefakt des Trainings: Das Modell hat gelernt, dass Bilder mit dem Wort „Baum" oft auch das Wort als Beschriftung zeigen (z.B. auf Schildern in Parks oder Lehrmaterialien). Es kann das Wort nicht nur als Konzept, sondern auch als visuelles Muster reproduzieren.',
      },
    },
    {
      id: 'v3-blind-test',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'ModelBlindTest',
      },
    },
    {
      id: 'v3-blind-test-reflection',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Ob du 3 oder 8 von 8 erraten hast – wichtig ist die Erkenntnis: Jedes Modell hat eine erkennbare Signatur. Wenn du beim Entdecken Bildserien vergleichst, wirst du diese Signaturen wiedererkennen. Und du wirst die entscheidende Frage stellen können: Zeigt das Bild die Realität – oder die Signatur des Modells?',
      },
    },
    // --- Akt 5: „Die Serie lesen" – Das Analyse-Werkzeug ---
    {
      id: 'v3-framework-heading',
      type: 'heading',
      revealOnScroll: true,
      data: {
        text: 'Serien lesen – in vier Schritten',
        level: 3,
      },
    },
    {
      id: 'v3-analysis-framework',
      type: 'interactive',
      revealOnScroll: true,
      data: {
        component: 'AnalysisFramework',
      },
    },
    {
      id: 'v3-framework-transfer',
      type: 'text',
      revealOnScroll: true,
      data: {
        text: 'Diese vier Schritte funktionieren bei jedem Prompt – ob „Baum", „Mathematiklehrkraft" oder „Eine 9. Klasse". Der Unterschied: Bei Bäumen hat der Default keine gesellschaftliche Brisanz. Bei Bildern von Menschen schon. Im Bereich Entdecken wirst du das Werkzeug auf genau solche Serien anwenden.',
      },
    },
    {
      id: 'v3-toolbox-callout',
      type: 'callout',
      revealOnScroll: true,
      data: {
        title: 'Dein Analyse-Werkzeug',
        tone: 'info',
        points: [
          '1. Default identifizieren – Was erscheint (fast) immer?',
          '2. Variation beschreiben – Was verändert sich, was bleibt?',
          '3. Lücken benennen – Was fehlt systematisch?',
          '4. Modelle vergleichen – Wie unterscheiden sich die Signaturen?',
        ],
      },
    },
  ],
};

export const VERSTEHEN_CHECKOUTS: Record<VerstehenUnitId, CheckoutElement> = {
  v1: {
    id: 'v1-quiz',
    unitId: 'v1',
    type: 'quiz',
    question: 'Teste dein Wissen über den Weg vom Prompt zum Bild.',
    options: [
      {
        text: 'Das Modell durchsucht für jede Anfrage eine Bilddatenbank nach passenden Fotos.',
        correct: false,
        feedback: 'Nein. Kein Bild wird abgerufen – jedes wird neu berechnet, basierend auf gelernten Mustern.',
      },
      {
        text: 'Der Diffusionsprozess startet mit Rauschen und entfernt es schrittweise, gesteuert durch den Prompt.',
        correct: true,
        feedback: 'Genau. Der Prompt gibt die Richtung vor, der Seed den Startpunkt, und das Denoising erzeugt Schritt für Schritt ein Bild.',
      },
      {
        text: 'Der Seed bestimmt, welches fertige Bild aus dem Speicher geladen wird.',
        correct: false,
        feedback: 'Der Seed legt nur den Startpunkt im Rauschfeld fest – das Bild existiert vorher nicht.',
      },
      {
        text: 'Mehr Denoising-Schritte verändern das Thema des Bildes.',
        correct: false,
        feedback: 'Nein. Mehr Schritte verfeinern die Details, ändern aber nicht das Thema. Das Thema kommt vom Prompt.',
      },
    ],
    hint: 'Denke an die drei Bausteine: Prompt, Seed und Diffusion.',
  },
  v2: {
    id: 'v2-quiz',
    unitId: 'v2',
    type: 'quiz',
    question: 'Teste dein Wissen über Trainingsdaten und ihre Wirkung.',
    options: [
      {
        text: 'Trainingsdaten werden von Expert:innen manuell kuratiert und sind deshalb repräsentativ.',
        correct: false,
        feedback: 'Nein. Die meisten Trainingsdaten werden automatisch aus dem Internet gesammelt – ungefiltert und mit allen Verzerrungen, die dort existieren.',
      },
      {
        text: 'Die Sprache des Prompts beeinflusst das Ergebnis, weil verschiedene Sprachen unterschiedliche Bereiche der Trainingsdaten aktivieren.',
        correct: true,
        feedback: 'Genau. Wie die Brot-Serie zeigt: „Brot", „Bread" und „パン" aktivieren verschiedene gelernte Muster, weil die zugehörigen Bild-Text-Paare aus unterschiedlichen kulturellen Kontexten stammen.',
      },
      {
        text: 'Je mehr Bilder im Datensatz sind, desto fairer werden die Ergebnisse automatisch.',
        correct: false,
        feedback: 'Nicht automatisch. Mehr Daten bedeuten nicht mehr Vielfalt. Wenn die zusätzlichen Bilder aus denselben Quellen stammen, verstärkt sich die Schieflage sogar.',
      },
      {
        text: 'Alt-Texte auf Webseiten haben keinen Einfluss auf KI-Bilder.',
        correct: false,
        feedback: 'Doch, sogar großen Einfluss! Alt-Texte sind die häufigste Quelle für die Textbeschreibungen in Trainingspaaren. Schlechte Alt-Texte führen zu falschen gelernten Verknüpfungen.',
      },
    ],
    hint: 'Denke an die Brot-Ergebnisse in verschiedenen Sprachen.',
  },
  v3: {
    id: 'v3-quiz',
    unitId: 'v3',
    type: 'quiz',
    question: 'Teste dein Verständnis: Wie liest man eine KI-Bildserie?',
    options: [
      {
        text: 'Wenn eine KI bei „Baum" immer Laubbäume zeigt, liegt das an einem Fehler im Modell.',
        correct: false,
        feedback: 'Kein Fehler – sondern ein statistischer Default. Das Modell gibt das häufigste Muster aus seinen Trainingsdaten wieder. Laubbäume auf Wiesen sind das, was es mit dem Wort „Baum" am stärksten verknüpft hat.',
      },
      {
        text: 'Die Variation innerhalb einer Serie zeigt, dass die KI kreativ und unvorhersehbar ist.',
        correct: false,
        feedback: 'Die Variation wirkt kreativ, bewegt sich aber innerhalb enger Grenzen. Die KI variiert Details (Wetter, Perspektive), verlässt aber den gelernten Default nicht. Das ist keine Kreativität, sondern kontrolliertes Rauschen.',
      },
      {
        text: 'Systematische Lücken in einer Bildserie zeigen, was in den Trainingsdaten unterrepräsentiert oder mit dem Prompt nicht verknüpft ist.',
        correct: true,
        feedback: 'Richtig. Wenn „Baum" nie eine Palme zeigt, heißt das nicht, dass Palmen keine Bäume sind – sondern dass das Modell „Baum" nicht mit Palmen-Bildern trainiert wurde. Lücken sind der Schlüssel zur Bias-Analyse.',
      },
      {
        text: 'Alle KI-Modelle erzeugen bei demselben Prompt identische Ergebnisse, weil sie aus denselben Daten lernen.',
        correct: false,
        feedback: 'Obwohl alle 4 Modelle den mitteleuropäischen Laubbaum-Default teilen, hat jedes seine eigene Signatur: FLUX2 PRO zeigt Landschaften, GPT Image-1.5 Hyperdetail, Nano Bana Stimmung, Gemini Image 2 rendert Text. Verschiedene Modelle = verschiedene Signaturen.',
      },
    ],
    hint: 'Denke an den Unterschied zwischen Variation und Vielfalt.',
  },
};
