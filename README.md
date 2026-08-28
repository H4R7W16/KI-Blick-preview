# KI:Blick – Bilder, Bias und Blickwinkel

Digitale Lernumgebung zur kritischen Analyse KI-generierter Bilder.
Für Schülerinnen und Schüler weiterführender Schulen in Baden-Württemberg.

[Live-Demo](https://ki-blick.kmz-es.de/) · [Informationen](https://ki-blick.kmz-es.de/#/informationen)

---

## Was ist KI:Blick?

KI:Blick macht Bias in KI-generierten Bildern sichtbar und diskutierbar.
Die Plattform arbeitet mit **848 vorgenerierten WebP-Bildern** (darunter 480
Lehrkräfte-Porträts in 10 Fächern × 3 KI-Modellen × 16 Variationen sowie 368
weitere Bilder für Wissensmodule und Oberflächenelemente).

Statt selbst Bilder zu generieren, analysieren Lernende systematisch vorgenerierte
Bildserien – geeignet auch für Schulen, in denen Live-Generierung nicht eingesetzt
werden kann.

## Bereiche

- **Verstehen** – Wie generative Bild-KI funktioniert
- **Entdecken** – Bildserien erkunden, Muster finden
- **Einordnen** – Bias verstehen, Wirkung reflektieren
- **Lernen** – Geführte Lernpfade durch alle Bereiche

## Technik

React · TypeScript · Tailwind CSS · Vite
Reine Client-Anwendung – kein Backend, kein Tracking, keine Accounts.

## Entwicklung

Dieses Verzeichnis ist der veröffentlichungsfähige App-Quellbaum. Planung,
Kommunikation, Rohbilder und interne Analysewerkzeuge liegen ausschließlich im
privaten Quell-Repository und werden nicht in das öffentliche Repository gespiegelt.

```bash
npm install
npm run dev
```

## Build-Ziele

```bash
# Eigenständiger öffentlicher Build (Root-Pfad /)
npm run build

# GitHub-Project-Pages-Build unter /KI-Blick-preview/
npm run build:preview

# Nur im privaten Quell-Repository: Rohbilder synchronisieren,
# Downloadpakete erzeugen und anschließend bauen
npm run build:release
```

## Lizenz

- **Code:** MIT License (siehe [LICENSE](LICENSE))
- **Inhalte (Texte, Materialien):** CC BY-SA 4.0 (siehe [LICENSE-CONTENT](LICENSE-CONTENT))
- **Bilder:** KI-generiert, Weiterverwendung mit Namensnennung erwünscht

## Attribution

Konzept und inhaltliche Steuerung: **Jan Hartwig**, Regioberater des LMZ am
Kreismedienzentrum Esslingen.

Technische Umsetzung: KI-gestützt (Claude Code, Claude Cowork, OpenAI Codex).

