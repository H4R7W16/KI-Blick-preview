import type { LearningPath } from '../types/knowledge.types';

const PATH_WER_UNTERRICHTET: LearningPath = {
  id: 'wer-unterrichtet-hier',
  title: 'Wer unterrichtet hier?',
  subtitle: 'Stereotypen in KI-Lehrkraftbildern',
  description:
    'Dieser Lernpfad führt dich von deinen eigenen Vorstellungen über KI-generierte Bilder bis hin zur kritischen Reflexion von Stereotypen und verantwortungsvoller Nutzung.',
  level: 2,
  estimatedDuration: '35–45 Min.',
  focus: ['Gender-Bias', 'Stereotypen', 'Diskriminierung'],
  badgeId: 'badge-wer-unterrichtet',
  leitfrage: 'Wenn du eine KI bittest, eine Lehrkraft zu zeichnen – was bekommst du? Und was sagt das über die KI aus?',
  kompetenzen: [
    'Ich kann beschreiben, wie Text-zu-Bild-KI funktioniert.',
    'Ich kann systematische Muster in KI-Bildserien erkennen.',
    'Ich kann erklären, warum KI-Bilder bestimmte Stereotypen zeigen.',
    'Ich kann die Wirkung stereotyper KI-Darstellungen einordnen.',
  ],
  briefingPrompt: 'Wie stellst du dir eine typische Lehrkraft vor?',
  debriefingPrompt: 'Zurück zur Ausgangsfrage: Was bekommst du, wenn eine KI eine Lehrkraft zeichnet – und was sagt das über die KI aus? Wie würdest du jetzt antworten?',
  transferPrompt: 'Wenn du das nächste Mal ein KI-generiertes Bild siehst: Worauf wirst du achten?',
  milestoneOutlook: 'Jetzt geht es darum, die Muster einzuordnen: Woher kommen sie, und warum sind sie ein Problem?',
  steps: [
    // Schritt 1: Entwirf (Aufgabe) – unverändert
    {
      stepNumber: 1,
      area: 'aufgabe',
      operator: 'Entwirf (AFB II)',
      description: 'Wähle ein Unterrichtsfach und beschreibe, wie du dir die Lehrkraft vorstellst.',
      taskConfig: {
        title: 'Deine Lehrkraft',
        operator: 'Entwirf (AFB II)',
        instruction:
          'Wähle ein Unterrichtsfach und beschreibe, wie du dir eine typische Lehrkraft für dieses Fach vorstellst. Denk dabei an Aussehen, Kleidung, Alter, Umgebung und Requisiten.',
        inputType: 'choice-and-text',
        subjectSelectable: true,
        scaffolding: [
          'Welches Geschlecht hat deine Lehrkraft?',
          'Wie alt ist die Person ungefähr?',
          'Was trägt sie? (Kleidungsstil)',
          'Wo befindet sie sich? (Klassenzimmer, Labor, Sporthalle...)',
          'Hat sie typische Gegenstände dabei?',
        ],
        minLength: 30,
      },
    },
    // Schritt 2: Einschätzen (Aufgabe) – neu: Slider statt Freitext
    {
      stepNumber: 2,
      area: 'aufgabe',
      operator: 'Einschätzen (AFB I)',
      description: 'Schätze ein: Wie sicher bist du, dass die KI ähnliche Bilder erzeugt?',
      contextBridge: 'Du hast gerade beschrieben, wie du dir eine Lehrkraft vorstellst. Glaubst du, die KI sieht das genauso?',
      taskConfig: {
        title: 'Deine Einschätzung',
        operator: 'Einschätzen (AFB I)',
        instruction:
          'Du hast deine Vorstellung beschrieben. Jetzt schätze ein: Wenn eine KI denselben Prompt bekommt – wie ähnlich wird ihr Ergebnis zu deiner Vorstellung sein?',
        inputType: 'slider',
        previousStepRef: 1,
        sliderConfig: {
          min: 1,
          max: 5,
          step: 1,
          minLabel: 'ganz anders',
          maxLabel: 'sehr ähnlich',
          items: [
            {
              id: 'aehnlichkeit',
              label: 'Wie ähnlich wird das KI-Bild zu deiner Vorstellung sein?',
            },
          ],
        },
      },
    },
    // Schritt 3: Verstehen V1 – Section: Diffusion + Zufallselement
    {
      stepNumber: 3,
      area: 'verstehen',
      unitId: 'v1',
      sectionId: 'v1-heading',
      sectionEndId: 'v1-checkpoint-seed',
      description: 'Wie erzeugt die KI ein Bild? Diffusion und Zufall.',
      contextBridge: 'Bevor du die KI-Ergebnisse siehst, lernst du kurz, wie die KI überhaupt Bilder erzeugt – und warum 16 Bilder zum selben Prompt unterschiedlich aussehen.',
    },
    // Schritt 4: Entdecken (guided, ohne Analyse-Tool)
    {
      stepNumber: 4,
      area: 'entdecken',
      description: 'Erkunde den KI-Output zu deinem gewählten Fach – sammle eigene Beobachtungen.',
      contextBridge: 'Jetzt wird es spannend: Du siehst, was die KI aus deinem Fach macht. Achte auf Muster – und vergleiche mit deiner Vorstellung.',
      entdeckenGuided: true,
    },
    // Schritt 5: Vergleiche (Aufgabe) – unverändert, + contextBridge
    {
      stepNumber: 5,
      area: 'aufgabe',
      operator: 'Vergleiche (AFB II)',
      description: 'Strukturierter Vergleich: deine Vorstellung vs. KI-Output.',
      contextBridge: 'Du hast die KI-Bilder gesehen. Jetzt machst du den direkten Vergleich: Was ist ähnlich zu deiner Vorstellung, was ist anders?',
      taskConfig: {
        title: 'Dein Bild vs. KI-Bild',
        operator: 'Vergleiche (AFB II)',
        instruction:
          'Vergleiche deine Beschreibung aus Schritt 1 mit den KI-generierten Bildern. Was ist ähnlich, was ist anders?',
        inputType: 'comparison',
        previousStepRef: 1,
        imageRef: 'kontaktblatt',
        comparisonCategories: [
          'Geschlecht',
          'Alter',
          'Kleidung / Stil',
          'Setting / Umgebung',
          'Requisiten / Gegenstände',
          'Gesamteindruck',
        ],
        scaffolding: [
          'Gibt es Merkmale, die sowohl in deiner Vorstellung als auch im KI-Bild vorkommen?',
          'Was zeigt die KI, was du nicht beschrieben hast?',
          'Was fehlt in den KI-Bildern, das du dir vorgestellt hattest?',
        ],
        minLength: 30,
      },
    },
    // Schritt 6: Einordnen E1 – Section: Gender-Bias-Daten
    {
      stepNumber: 6,
      area: 'einordnen',
      unitId: 'e1',
      sectionId: 'e1-gender-heading',
      sectionEndId: 'e1-gender-chart',
      description: 'Muster erkennen: Die Daten hinter den Bildern.',
      contextBridge: 'Dein Vergleich hat wahrscheinlich Muster gezeigt. Jetzt schauen wir uns die Daten dazu an – wie sehen die Muster über alle Fächer hinweg aus?',
    },
    // Schritt 7: Einordnen E3 – Section: Wahrnehmungsexperiment + Representation
    {
      stepNumber: 7,
      area: 'einordnen',
      unitId: 'e3',
      sectionId: 'e3-hero-heading',
      sectionEndId: 'e3-cycle',
      description: 'Bilder wirken: Warum Repräsentation zählt.',
      contextBridge: 'Du weißt jetzt, welche Muster die KI zeigt. Aber ist das ein Problem? Lass uns schauen, wie solche Bilder wirken.',
    },
    // Schritt 8: Abschluss (Debriefing)
    {
      stepNumber: 8,
      area: 'abschluss',
      description: 'Rückblick und Reflexion: Wie hat sich dein Blick verändert?',
      contextBridge: 'Du hast Muster entdeckt, Daten analysiert und die Wirkung von Bildern verstanden. Jetzt blickst du zurück.',
    },
  ],
};

const PATH_BROT_BAGUETTE_PAO: LearningPath = {
  id: 'brot-baguette-pao',
  title: 'Brot, Baguette, Pão',
  subtitle: 'Was KI über Kulturen „weiß"',
  description:
    'Wie stellt sich eine KI Brot vor – und warum sieht es anders aus, wenn du den Prompt auf Französisch oder Japanisch schreibst? Entdecke kulturellen Bias in Trainingsdaten und frage dich: Was kostet ein KI-Bild?',
  level: 2,
  estimatedDuration: '25–35 Min.',
  focus: ['Kultureller Bias', 'Trainingsdaten', 'Nachhaltigkeit'],
  badgeId: 'badge-brot-baguette',
  leitfrage: 'Warum sieht KI-Brot anders aus, wenn du den Prompt in einer anderen Sprache schreibst – und was kostet ein KI-Bild?',
  kompetenzen: [
    'Ich kann erklären, warum Trainingsdaten kulturell verzerrt sein können.',
    'Ich kann kulturellen Bias in KI-Bildern erkennen.',
    'Ich kann den Energieverbrauch von Bildgenerierung einordnen.',
    'Ich kann begründet beurteilen, wann KI-Bildgenerierung sinnvoll ist.',
  ],
  briefingPrompt: 'Wie sieht für dich typisches Brot aus?',
  debriefingPrompt: 'Am Anfang hast du beschrieben, wie für dich Brot aussieht. Jetzt weißt du, wie die KI Brot sieht – und warum. Was hat dich am meisten überrascht?',
  transferPrompt: 'Wenn du eine KI bitten würdest, ein Gericht aus deiner Familie zu generieren – was würde sie wohl zeigen, und was nicht?',
  milestoneOutlook: 'In der zweiten Hälfte ordnest du kulturelle Muster ein und bewertest den Ressourcenverbrauch von KI-Bildgenerierung.',
  steps: [
    // Schritt 1: Beschreibe (Aufgabe) – UNVERÄNDERT
    {
      stepNumber: 1,
      area: 'aufgabe',
      operator: 'Beschreibe (AFB I)',
      description: 'Wie sieht für dich typisches Brot aus?',
      taskConfig: {
        title: 'Dein Brot',
        operator: 'Beschreibe (AFB I)',
        instruction:
          'Beschreibe, wie für dich typisches Brot aussieht. Denk an Form, Farbe, Kruste, wo du es kaufst und wie es riecht.',
        inputType: 'freetext',
        scaffolding: [
          'Welche Form hat es? (rund, länglich, eckig...)',
          'Welche Farbe hat die Kruste?',
          'Wo kaufst du es normalerweise?',
          'Ist es eher hell oder dunkel?',
        ],
        minLength: 20,
      },
    },
    // Schritt 2: Verstehen V2 – Section: Datenherkunft + kulturelle Prägung
    {
      stepNumber: 2,
      area: 'verstehen',
      unitId: 'v2',
      sectionId: 'v2-origin-heading',
      sectionEndId: 'v2-gigo-callout',
      description: 'Woher kommen die Trainingsdaten – und warum sind sie kulturell geprägt?',
      contextBridge: 'Du hast dein Brot beschrieben. Aber was weiß eine KI über Brot? Das hängt davon ab, woher ihre Daten kommen.',
    },
    // Schritt 3: Vergleiche – REPARIERT: mit Bildreferenz und contextBridge
    {
      stepNumber: 3,
      area: 'aufgabe',
      operator: 'Vergleiche (AFB II)',
      description: 'Wähle zwei Sprachen und vergleiche die KI-Ergebnisse.',
      contextBridge: 'Du weißt jetzt, warum die Daten verzerrt sind. Jetzt siehst du es an einem konkreten Beispiel: Dasselbe Wort, verschiedene Sprachen, verschiedene Bilder.',
      taskConfig: {
        title: 'Zwei Sprachen, zwei Welten',
        operator: 'Vergleiche (AFB II)',
        instruction:
          'Oben siehst du, wie verschiedene KI-Modelle Brot darstellen, wenn der Prompt in verschiedenen Sprachen geschrieben wird. Wähle zwei Sprachen, die dich besonders überraschen, und vergleiche die Ergebnisse.',
        inputType: 'structured',
        imageRef: 'cultural-comparison',
        previousStepRef: 1,
        comparisonCategories: [
          'Sprache 1 (welche?)',
          'Sprache 2 (welche?)',
          'Sichtbare Unterschiede',
          'Was verrät das über die Trainingsdaten?',
          'Überraschung: Was hättest du nicht erwartet?',
        ],
        scaffolding: [
          'Schau dir Form, Farbe und Umgebung an.',
          'Gibt es Beilagen oder Zutaten, die kulturspezifisch sind?',
          'Welche Sprache erzeugt Bilder, die deiner eigenen Vorstellung am nächsten kommen?',
        ],
        minLength: 20,
      },
    },
    // Schritt 4: Einordnen E1 – Section: Kultureller Bias (statt Gender-Bias)
    {
      stepNumber: 4,
      area: 'einordnen',
      unitId: 'e1',
      sectionId: 'e1-cultural-heading',
      sectionEndId: 'e1-cultural-callout',
      description: 'Muster erkennen: Kultureller Bias und systematische Verzerrungen.',
      contextBridge: 'Dein Vergleich hat gezeigt: Die KI zeigt verschiedene Kulturen verschieden. Jetzt ordnest du ein, was dahintersteckt.',
    },
    // Schritt 5: Einordnen E4 – Section: Rechenbeispiel + Verbraucherbildung
    {
      stepNumber: 5,
      area: 'einordnen',
      unitId: 'e4',
      sectionId: 'e4-hero-heading',
      sectionEndId: 'e4-context-callout',
      description: 'Strom für Pixel: Was kostet ein KI-Bild?',
      contextBridge: 'Du hast kulturelle Muster erkannt. Aber KI-Bilder haben noch eine andere Seite: ihren ökologischen Fußabdruck.',
    },
    // Schritt 6: Beurteile (Aufgabe) – Bildzahl korrigiert: 600 → 800
    {
      stepNumber: 6,
      area: 'aufgabe',
      operator: 'Beurteile (AFB III)',
      description: 'Wann lohnt sich der Aufwand, KI-Bilder zu generieren?',
      contextBridge: 'Du weißt jetzt, was ein KI-Bild kostet. Jetzt die entscheidende Frage: Lohnt sich das?',
      taskConfig: {
        title: 'Lohnt sich das?',
        operator: 'Beurteile (AFB III)',
        instruction:
          'Für dieses Projekt wurden 96 Brot-Bilder generiert (8 Sprachen × 3 Modelle × 4 Bilder) – und insgesamt über 800 Bilder für die gesamte Lernumgebung. Jedes Bild verbraucht Energie und Wasser. Formuliere eine begründete Position: Wann lohnt sich der Aufwand, KI-Bilder zu generieren – und wann nicht?',
        inputType: 'freetext',
        scaffolding: [
          'Was hast du durch die Brot-Bilder über kulturellen Bias gelernt?',
          'Hätte man dasselbe auch mit echten Fotos zeigen können?',
          'Gibt es Situationen, in denen KI-Bilder unverzichtbar sind?',
          'Wie könnte man den Ressourcenverbrauch reduzieren?',
        ],
        minLength: 50,
      },
    },
    // Schritt 7: Abschluss
    {
      stepNumber: 7,
      area: 'abschluss',
      description: 'Rückblick: Was hast du über kulturellen Bias und den Preis von KI-Bildern gelernt?',
      contextBridge: 'Du hast kulturelle Verzerrungen entdeckt und den Preis von KI-Bildern eingeordnet. Zeit für einen Rückblick.',
    },
  ],
};

const PATH_DREI_MODELLE: LearningPath = {
  id: 'drei-modelle-drei-blicke',
  title: 'Drei Modelle, drei Blicke',
  subtitle: 'Warum jede KI anders „sieht"',
  description:
    'Derselbe Prompt, drei verschiedene KI-Modelle – und drei völlig unterschiedliche Ergebnisse. Lerne, Modellsignaturen zu erkennen, und verstehe, warum die Wahl des Modells eine Entscheidung mit Konsequenzen ist.',
  level: 2,
  estimatedDuration: '30–40 Min.',
  focus: ['Modellvergleich', 'Modellsignaturen', 'Bewusste Wahl'],
  badgeId: 'badge-drei-modelle',
  leitfrage: 'Derselbe Prompt, drei verschiedene Modelle – warum sehen die Ergebnisse so unterschiedlich aus?',
  kompetenzen: [
    'Ich kann erklären, wie Text-zu-Bild-KI aus Rauschen Bilder erzeugt.',
    'Ich kann Modellsignaturen erkennen und beschreiben.',
    'Ich kann begründen, warum verschiedene Modelle unterschiedliche Bilder erzeugen.',
    'Ich kann die Modellwahl als bewusste Entscheidung einordnen.',
  ],
  debriefingPrompt: 'Du hast drei Modelle verglichen. Wenn du ein KI-Bild für ein Schulprojekt brauchst – welches Modell würdest du wählen, und warum?',
  transferPrompt: 'Sollten KI-Modelle offenlegen, mit welchen Daten sie trainiert wurden?',
  milestoneOutlook: 'In der zweiten Hälfte erkundest du selbst, begründest deine Beobachtungen und ordnest die Modellunterschiede ein.',
  steps: [
    // Schritt 1: Verstehen V1 – Section: Nur Intro + Diffusion
    {
      stepNumber: 1,
      area: 'verstehen',
      unitId: 'v1',
      sectionId: 'v1-heading',
      sectionEndId: 'v1-checkpoint-denoising',
      description: 'Grundprinzip: Wie erzeugt die KI aus Rauschen ein Bild?',
    },
    // Schritt 2: Verstehen V3 – Section: Modellsignaturen
    {
      stepNumber: 2,
      area: 'verstehen',
      unitId: 'v3',
      sectionId: 'v3-signature-heading',
      sectionEndId: 'v3-blind-test-reflection',
      description: 'Modellsignaturen erkennen: Warum sieht jede KI anders aus?',
      contextBridge: 'Du weißt jetzt, wie ein Bild entsteht. Aber verschiedene Modelle erzeugen aus demselben Prompt ganz unterschiedliche Bilder. Warum?',
    },
    // Schritt 3: Analysiere (Aufgabe)
    {
      stepNumber: 3,
      area: 'aufgabe',
      operator: 'Analysiere (AFB II)',
      description: 'Wähle ein Fach und analysiere die Unterschiede zwischen den Modellen.',
      contextBridge: 'Du hast Modellsignaturen an Bäumen gesehen. Jetzt wendest du das auf Menschen an – mit echten Lehrkraft-Bildern.',
      taskConfig: {
        title: 'Modelle vergleichen',
        operator: 'Analysiere (AFB II)',
        instruction:
          'In V3 hast du gelernt, wie du Modellsignaturen erkennst – an Bäumen. Jetzt wendest du das auf Menschen an: Wähle ein Unterrichtsfach und notiere drei Unterschiede zwischen den Modellen.',
        inputType: 'choice-and-text',
        subjectSelectable: true,
        scaffolding: [
          'Achte auf wiederkehrende Merkmale pro Modell (das ist die Signatur).',
          'Vergleiche Hautfarbe, Geschlecht und Alter über alle 16 Bilder pro Modell.',
          'Gibt es ein Modell, das besonders „einheitlich" ist? Eines, das mehr Variation zeigt?',
        ],
        minLength: 30,
      },
    },
    // Schritt 4: Entdecken (mit Analyse-Tool)
    {
      stepNumber: 4,
      area: 'entdecken',
      description: 'Erkunde die Lehrkraft-Bilder für dein gewähltes Fach – diesmal mit Analyse-Tool.',
      contextBridge: 'Du hast erste Unterschiede notiert. Jetzt erkundest du die Bilder selbst – mit dem Analyse-Tool kannst du Merkmale filtern.',
      entdeckenGuided: false,
    },
    // Schritt 5: Erkläre (Aufgabe)
    {
      stepNumber: 5,
      area: 'aufgabe',
      operator: 'Erkläre (AFB II)',
      description: 'Formuliere eine Hypothese: Warum sehen die Modelle so unterschiedlich aus?',
      contextBridge: 'Du hast die Bilder erkundet und Muster gesehen. Jetzt formulierst du eine Erklärung: Warum sind die Modelle so verschieden?',
      taskConfig: {
        title: 'Deine Hypothese',
        operator: 'Erkläre (AFB II)',
        instruction:
          'Du hast jetzt Modellsignaturen an Bäumen und an Lehrkräften gesehen. Formuliere eine Hypothese: Warum erzeugen verschiedene Modelle so unterschiedliche Bilder, obwohl der Prompt identisch ist?',
        inputType: 'freetext',
        previousStepRef: 3,
        scaffolding: [
          'Denke an das, was du in V3 über Trainingsdaten und Modellarchitektur gelernt hast.',
          'Spielt die Herkunft des Modells eine Rolle? (US-Unternehmen vs. andere)',
          'Könnte es sein, dass manche Modelle bewusst „korrigiert" wurden?',
          'Was bedeutet es, wenn ein Modell immer ähnliche Bilder erzeugt?',
        ],
        minLength: 40,
      },
    },
    // Schritt 6: Einordnen E2 – Section: Spiegel/Verstärker/Erfinder + Modelle
    {
      stepNumber: 6,
      area: 'einordnen',
      unitId: 'e2',
      sectionId: 'e2-categories-heading',
      sectionEndId: 'e2-models-text',
      description: 'Spiegel oder Zerrspiegel? Modelle im Vergleich mit der Realität.',
      contextBridge: 'Du hast eine Hypothese. Jetzt schauen wir, was die Daten sagen – und warum manche Modelle die Realität verzerren.',
    },
    // Schritt 7: Einordnen E5 – Section: Prompt-Strategien
    {
      stepNumber: 7,
      area: 'einordnen',
      unitId: 'e5',
      sectionId: 'e5-strategies-heading',
      sectionEndId: 'e5-strategies-reflection',
      description: 'Bewusst generieren: Die Wahl des Modells als Entscheidung.',
      contextBridge: 'Du weißt jetzt, warum Modelle verschieden sind. Aber du hast einen Hebel: wie du promptest – und welches Modell du wählst.',
    },
    // Schritt 8: Abschluss
    {
      stepNumber: 8,
      area: 'abschluss',
      description: 'Rückblick: Welches Modell würdest du wählen – und warum?',
      contextBridge: 'Du hast drei Modelle kennengelernt und ihre Unterschiede eingeordnet. Zeit für dein Fazit.',
    },
  ],
};

const PATH_VOM_MUSTER: LearningPath = {
  id: 'vom-muster-zur-verantwortung',
  title: 'Vom Muster zur Verantwortung',
  subtitle: 'Was KI-Bilder mit uns machen – und was wir tun können',
  description:
    'Der vertiefte Reflexionspfad: Du analysierst systematisch Bias-Muster in KI-Bildern, ordnest ihre Wirkung ein und entwickelst einen eigenen verantwortungsvollen Prompt. Ideal als Vertiefung nach einem der kürzeren Pfade – funktioniert aber auch standalone.',
  level: 2,
  estimatedDuration: '90–120 Min.',
  focus: ['Bias-Analyse', 'Wirkung', 'Verantwortung', 'Transfer'],
  badgeId: 'badge-vom-muster',
  leitfrage: 'Was passiert mit unseren Bildern im Kopf, wenn KI für uns zeichnet – und was können wir dagegen tun?',
  kompetenzen: [
    'Ich kann systematische Muster in KI-Bildserien erkennen und von Einzelfällen unterscheiden.',
    'Ich kann erklären, warum KI-Bilder bestimmte Gruppen über- oder unterrepräsentieren.',
    'Ich kann die Wirkung stereotyper KI-Darstellungen auf Individuen und Gesellschaft einordnen.',
    'Ich kann einen reflektierten Prompt formulieren, der bewusst mit Bias umgeht.',
  ],
  briefingPrompt: 'Was hast du bisher über KI-Bias herausgefunden? (Wenn du neu bist: Was vermutest du?)',
  debriefingPrompt: 'Zurück zur Leitfrage: Was passiert mit unseren Bildern im Kopf, wenn KI für uns zeichnet? Wie würdest du jetzt antworten – verglichen mit deiner Einschätzung am Anfang?',
  transferPrompt: 'Ab wann wird Bias in KI-Bildern zu Diskriminierung? Wo liegt für dich die Grenze?',
  milestoneOutlook: 'Du hast Muster erkannt und eingeordnet. Jetzt geht es um die Wirkung – und darum, was du selbst tun kannst.',
  steps: [
    // Schritt 1: Entdecken – Freie Exploration mit Analyse-Tool
    {
      stepNumber: 1,
      area: 'entdecken',
      description: 'Erkunde ein Fach deiner Wahl mit dem Analyse-Tool. Notiere drei Muster, die dir auffallen.',
      entdeckenGuided: false,
    },
    // Schritt 2: Einordnen E1 – Section: Gender-Bias-Daten (Cluster + Charts)
    {
      stepNumber: 2,
      area: 'einordnen',
      unitId: 'e1',
      sectionId: 'e1-gender-heading',
      sectionEndId: 'e1-gender-chart',
      description: 'Muster erkennen: MINT vs. Sprachen – die Daten hinter den Bildern.',
      contextBridge: 'Du hast Muster beobachtet. Jetzt schauen wir uns die Analyse-Daten an – wie sehen die Muster über alle Fächer hinweg aus?',
    },
    // Schritt 3: Aufgabe – Datengestützter Vergleich (Structured)
    {
      stepNumber: 3,
      area: 'aufgabe',
      operator: 'Vergleiche (AFB II)',
      description: 'Vergleiche deine Beobachtungen mit den Analyse-Daten.',
      contextBridge: 'Die Daten zeigen klare Muster. Wie decken sich diese mit dem, was du selbst gesehen hast?',
      taskConfig: {
        title: 'Beobachtung trifft Daten',
        operator: 'Vergleiche (AFB II)',
        instruction:
          'Vergleiche deine eigenen Beobachtungen aus Schritt 1 mit den Analyse-Daten aus Schritt 2. Wo lagst du richtig? Was hat dich überrascht?',
        inputType: 'structured',
        previousStepRef: 1,
        comparisonCategories: [
          'Meine Beobachtung zu Geschlecht',
          'Was die Daten zu Geschlecht zeigen',
          'Übereinstimmung oder Überraschung? (Geschlecht)',
          'Meine Beobachtung zu Alter/Aussehen',
          'Was die Daten zu Alter/Aussehen zeigen',
          'Übereinstimmung oder Überraschung? (Alter/Aussehen)',
        ],
        scaffolding: [
          'Hast du die Geschlechterverteilung richtig eingeschätzt?',
          'Gibt es Fächer, die dich besonders überrascht haben?',
          'Was hast du beobachtet, was die Daten nicht zeigen (z.B. Kleidung, Setting)?',
        ],
        minLength: 40,
      },
    },
    // Schritt 4: Einordnen E2 – Section: Spiegel/Verstärker/Erfinder
    {
      stepNumber: 4,
      area: 'einordnen',
      unitId: 'e2',
      sectionId: 'e2-categories-heading',
      sectionEndId: 'e2-important-callout',
      description: 'Spiegel oder Zerrspiegel? Wie die KI Realität verzerrt.',
      contextBridge: 'Die Muster sind klar – aber woher kommen sie? Bildet die KI die Realität ab, oder verzerrt sie?',
    },
    // Schritt 5: Aufgabe – Einschätzung mit Slider
    {
      stepNumber: 5,
      area: 'aufgabe',
      operator: 'Einschätzen (AFB II)',
      description: 'Bewerte: Spiegel, Verstärker oder Erfinder?',
      contextBridge: 'Du hast die drei Kategorien kennengelernt. Jetzt wendest du sie auf dein Fach an.',
      taskConfig: {
        title: 'Deine Einordnung',
        operator: 'Einschätzen (AFB II)',
        instruction:
          'Denke an das Fach, das du in Schritt 1 erkundet hast. Wo ordnest du die KI-Bilder ein?',
        inputType: 'slider',
        previousStepRef: 1,
        sliderConfig: {
          min: 1,
          max: 5,
          step: 1,
          minLabel: 'Spiegel (bildet Realität ab)',
          maxLabel: 'Erfinder (erfindet neue Muster)',
          items: [
            { id: 'geschlecht', label: 'Geschlechterverteilung' },
            { id: 'alter', label: 'Altersverteilung' },
            { id: 'aussehen', label: 'Äußeres Erscheinungsbild' },
          ],
        },
      },
    },
    // ── MEILENSTEIN bei Schritt 6 (Halbzeit) ──
    // Schritt 6: Einordnen E3 – Section: Wahrnehmungsexperiment + Repräsentation
    {
      stepNumber: 6,
      area: 'einordnen',
      unitId: 'e3',
      sectionId: 'e3-hero-heading',
      sectionEndId: 'e3-cycle',
      description: 'Bilder wirken: Wie KI-Darstellungen unsere Vorstellungen prägen.',
      contextBridge: 'Halbzeit! Du hast Muster erkannt und eingeordnet. Jetzt geht es um die Wirkung: Was machen diese Bilder mit uns?',
    },
    // Schritt 7: Aufgabe – Begründete Stellungnahme (Freetext, AFB III)
    {
      stepNumber: 7,
      area: 'aufgabe',
      operator: 'Beurteile (AFB III)',
      description: 'Ist es ein Problem, wenn KI-Bilder Stereotypen verstärken?',
      contextBridge: 'Du hast gesehen, wie Bilder wirken. Jetzt die zentrale Frage: Ist das ein Problem – auch wenn niemand absichtlich diskriminiert?',
      taskConfig: {
        title: 'Deine Stellungnahme',
        operator: 'Beurteile (AFB III)',
        instruction:
          'Ist es ein Problem, wenn KI-Bilder Stereotypen verstärken – auch wenn niemand absichtlich diskriminiert? Formuliere eine begründete Stellungnahme. Beziehe dich auf das, was du bisher gelernt hast.',
        inputType: 'freetext',
        scaffolding: [
          'Denke an das Wahrnehmungsexperiment aus Schritt 6.',
          'Wer ist betroffen, wenn bestimmte Gruppen in KI-Bildern nicht vorkommen?',
          'Macht es einen Unterschied, ob die Bilder in der Schule, in der Werbung oder in sozialen Medien auftauchen?',
        ],
        minLength: 150,
      },
    },
    // Schritt 8: Einordnen E3 – Section: Unsichtbarkeit + Lena-Szenario
    {
      stepNumber: 8,
      area: 'einordnen',
      unitId: 'e3',
      sectionId: 'e3-invisible-heading',
      sectionEndId: 'e3-einordnung-callout',
      description: 'Unsichtbarkeit und Konsequenzen: Was passiert, wenn du nicht vorkommst?',
      contextBridge: 'Du hast Stellung bezogen. Jetzt ein konkretes Beispiel: Was passiert, wenn eine Schülerin in KI-Bildern nie vorkommt?',
    },
    // Schritt 9: Einordnen E5 – Section: Prompt-Strategien + PromptCompare
    {
      stepNumber: 9,
      area: 'einordnen',
      unitId: 'e5',
      sectionId: 'e5-strategies-heading',
      sectionEndId: 'e5-strategies-reflection',
      description: 'Prompt-Strategien: Drei Ansätze, die Ergebnisse zu verändern.',
      contextBridge: 'Du weißt jetzt, warum Bias ein Problem ist. Aber du bist nicht machtlos – dein Prompt ist ein Hebel. Welche Strategien gibt es?',
    },
    // Schritt 10: Aufgabe – Transfer: Eigenen Prompt entwerfen (Freetext, AFB III)
    {
      stepNumber: 10,
      area: 'aufgabe',
      operator: 'Gestalte (AFB III)',
      description: 'Formuliere einen verantwortungsvollen Prompt – und begründe deine Entscheidungen.',
      contextBridge: 'Du kennst die Strategien. Jetzt bist du dran: Formuliere einen Prompt, der bewusst mit den Mustern umgeht, die du entdeckt hast.',
      taskConfig: {
        title: 'Dein bewusster Prompt',
        operator: 'Gestalte (AFB III)',
        instruction:
          'Formuliere einen Prompt für eine Lehrkraft deines Fachs aus Schritt 1, der bewusst mit den Mustern umgeht, die du entdeckt hast. Begründe deine Formulierung: Warum hast du bestimmte Begriffe gewählt? Welche Strategie verfolgst du?',
        inputType: 'freetext',
        previousStepRef: 1,
        scaffolding: [
          'Welche der drei Strategien aus Schritt 9 nutzt du?',
          'Welche Merkmale spezifizierst du bewusst – und welche lässt du offen?',
          'Was erhoffst du dir von deinem Prompt im Vergleich zum Standard-Ergebnis?',
        ],
        minLength: 200,
      },
    },
    // Schritt 11: Abschluss (Debriefing)
    {
      stepNumber: 11,
      area: 'abschluss',
      description: 'Rückblick: Wie hat sich dein Blick auf KI-Bilder verändert?',
      contextBridge: 'Du hast Muster entdeckt, Wirkungen eingeordnet und einen eigenen Prompt entworfen. Zeit für den Rückblick.',
    },
  ],
};

export const LEARNING_PATHS: LearningPath[] = [
  PATH_WER_UNTERRICHTET,
  PATH_BROT_BAGUETTE_PAO,
  PATH_DREI_MODELLE,
  PATH_VOM_MUSTER,
];

export function getPathById(id: string): LearningPath | undefined {
  return LEARNING_PATHS.find(path => path.id === id);
}

export function getAllPaths(): LearningPath[] {
  return LEARNING_PATHS;
}

export interface ComingSoonPath {
  id: string;
  title: string;
  subtitle: string;
  teaser: string;
  estimatedDuration: string;
  focus: string[];
  requiredContent: string;
}

export const COMING_SOON_PATHS: ComingSoonPath[] = [
  {
    id: 'wessen-haut',
    title: 'Wessen Haut?',
    subtitle: 'Hautfarbe, Defaults und blinde Flecken',
    teaser:
      'Warum erzeugt KI überwiegend helle Hauttöne? Untersuche die Standardeinstellungen, lerne die Monk Skin Tone Scale kennen und reflektiere, was „Default Whiteness" für Betroffene bedeutet.',
    estimatedDuration: '35–45 Min.',
    focus: ['Hautfarben-Bias', 'Default Whiteness', 'Repräsentation'],
    requiredContent: 'E6 (Wessen Haut?), SkinToneSortingActivity, Hautfarben-Filter in Entdecken',
  },
  {
    id: 'hinter-den-kulissen',
    title: 'Hinter den Kulissen',
    subtitle: 'Wer arbeitet für die KI – und zu welchem Preis?',
    teaser:
      'Simuliere Clickwork unter Zeitdruck, erfahre etwas über die Arbeitsbedingungen hinter den Trainingsdaten und berechne den ökologischen Fußabdruck eines KI-Bildes.',
    estimatedDuration: '40–50 Min.',
    focus: ['Clickwork', 'Arbeitsbedingungen', 'Nachhaltigkeit'],
    requiredContent: 'E7 (Wer arbeitet für die KI?), Er2 (Clickwork-Simulator), Er3 (Vision-Vergleich), E4 (Strom für Pixel)',
  },
  {
    id: 'echt-oder-ki',
    title: 'Echt oder KI?',
    subtitle: 'Erkennst du den Unterschied?',
    teaser:
      'Teste im Swipe-Spiel, ob du echte Fotos von KI-Bildern unterscheiden kannst. Lerne typische Artefakte kennen und entwickle Regeln für den Umgang mit Bildern unsicherer Herkunft.',
    estimatedDuration: '30–40 Min.',
    focus: ['Deepfakes', 'KI-Artefakte', 'Medienkompetenz'],
    requiredContent: 'V4 (KI-Bilder erkennen), Er1 (Swipe-Spiel), fotorealistische Bildserien',
  },
];

