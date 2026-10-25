# Roter Faden

Ein deutsches Worträtsel auf einem Raster aus 6 Spalten und 8 Reihen (48 Buchstaben): Hier gilt es, alle Themawörter entlang ihrer Wörterpfade zu finden. Jeder Buchstabe gehört genau einem Themawort oder dem roten Faden, der das ganze Raster durchzieht. Rätsel lassen sich per URL-Anker teilen.

Gebaut mit SvelteKit 3, Svelte 5 (Runes) und Tailwind CSS 4, statisch gebunden mit `adapter-static` und gehostet unter `/Roter-Faden/`.

## Entwicklung

```sh
pnpm install          # Abhängigkeiten installieren
pnpm dev              # Entwicklungsserver starten
pnpm check            # svelte-check
pnpm lint             # prettier --check + eslint
pnpm format           # Prettier schreibt Dateien um
pnpm build            # Produktions-Build
pnpm preview          # Build lokal ausliefern (Port 4173)
pnpm test:unit --run  # Vitest einmalig
pnpm test:e2e         # baut und startet Preview, dann Playwright
pnpm test             # beides
```

## Design-System

Das UI folgt Primers Design-System. `src/routes/layout.css` übersetzt Primer-Tokens über `@theme inline` in Tailwind-Klassen (z. B. `text-fg-default`, `bg-canvas`, `border-border-default`) — im Code gibt es keine festen Farben, Abstände oder Schriften. Die Spiel-Farben sind ebenso Tokens: `bg-theme-word` (Akzentblau), `bg-faden` (Danger-Rot), `text-word-hint` (Grau).

Der Farbmodus (Hell/Dunkel/System, Standard: System) wird über `data-color-mode` an `<html>` gesteuert und in `localStorage` gemerkt; ein Inline-Script in `src/app.html` verhindert einen Blitz beim Laden. „System" folgt dem Betriebssystem live, rein über CSS.

Die Farbtokens liegen als gekürzte Fassung in `src/lib/styles/primer-tokens.css`, generiert aus den installierten Primer-Primitives. Nach einem Upgrade von `@primer/primitives` `pnpm generate:tokens` laufen lassen (das Skript steht in `scripts/generate-primer-tokens.mjs`) und anschließend `pnpm test:e2e` prüfen.

## Rechtliches

Impressum und Datenschutzerklärung liegen als eigene Routen unter `/impressum` und `/datenschutz` und sind über den Footer (in `src/routes/+layout.svelte`) auf jeder Seite erreichbar. Die Anbieterdaten stehen einmalig in `src/lib/provider.ts` und werden von beiden Seiten verwendet; der Datenschutz-Text beschreibt genau das, was die Seite wirklich tut (localStorage, gehostetes Wörterbuch, GitHub Pages) und muss mit jeder neuen externen Abhängigkeit angepasst werden.

## Rätsel-Format

Puzzle-Modell, Matching, Validierung und URL-Codec liegen als reines TypeScript in `src/lib/puzzle/` (Tests daneben). Ein geteiltes Rätsel steckt im URL-Anker als `#v1.<base64url>`: Protobuf-Serialisierung → AES-256-GCM (statischer Schlüssel im Bundle — schützt vor neugierigen Spoilern, nicht vor ernsthaften Angreifern) → base64url. Die Wörter werden nicht als Text gespeichert, sondern aus den Buchstaben entlang ihrer Zellpfade rekonstruiert; der Anker verrät damit keine Wörter — die Zellgruppen selbst stecken als Pfade darin. Die Validierung prüft alle Spielregeln und meldet Verstöße auf Deutsch; das Wörterbuch wird als `isWord`-Funktion injiziert (siehe Issue #5). Validiert wird nur im Editor — das Spiel wertet dekodierte URLs nicht damit aus, weil die Eindeutigkeitssuche exponentiell ist. Deshalb garantiert `decodePuzzle` auch nur die Struktur (48 Buchstaben, ganze Zellindizes) — Regelverstöße aus handgebauten URLs laufen bewusst durch.

Das Protobuf-Schema liegt in `src/lib/puzzle/puzzle.proto`. Nach einer Änderung `pnpm generate:proto` laufen lassen — das erzeugt `puzzle.pb.js` und `puzzle.pb.d.ts`, die mit eingecheckt werden (wie die Primer-Tokens oben).

## Wörterbuch

Die Wortliste liegt als `static/dictionary.txt.gz` im Repo und ist mit **Git LFS** verwaltet — nach dem Klonen `git lfs install && git lfs pull` ausführen, sonst steht dort nur ein LFS-Pointer. Enthalten sind ausschließlich A–Z-Wörter mit mindestens 4 Buchstaben, normalisiert wie im Rätsel-Code (Großbuchstaben, Ä→AE, Ö→OE, Ü→UE, ß→SS usw.), sortiert und dedupliziert. Einträge, die nach der Normalisierung immer noch Buchstaben außerhalb von A–Z enthalten, werden beim Erzeugen mit Warnung übersprungen statt stillschweigend verstümmelt.

Quelle ist die Free German Dictionary (<https://sourceforge.net/projects/germandict/>), vom Projekt als Public Domain gekennzeichnet; sie wurde überwiegend aus dem deutschen Wikipedia-Dump (CC BY-SA) erzeugt. `pnpm generate:dictionary` lädt die Quelle (sha256-geprüft, danach aus `.cache/`) und erzeugt die Datei neu; `pnpm build` sichert mit `--ensure`, dass die Datei vollständig im Repo liegt. Im Browser lädt `loadDictionary()` aus `src/lib/puzzle/dictionary.ts` die Liste erst, nachdem die Oberfläche gerendert ist — bis dahin wirft `isWord()` einen Fehler. Mit `loadDictionary(url, letters)` filtert das Spiel die Liste beim Laden zusätzlich auf die Wörter, die ein Spieler auf dem Brett tatsächlich zeichnen kann (benachbarte Zellen, keine Wiederholung), behält sie als `Set` und gibt den vollen Text wieder frei; geänderte Buchstaben führen zu einem erneuten Laden.

## Spielfeld und Auswahl

Das Spielfeld liegt als wiederverwendbare Komponente in `src/lib/components/GameBoard.svelte`: Brett (6×8, CSS-Grid), Auswahlbuchstaben darüber und eine SVG-Ebene, die die Auswahl als graue Linie durch die Zellmitte zieht (Wörterlinien in Blau/Rot/Grau als `lines`-Prop, sobald Auswertung und Editor sie füllen). Die Auswahllogik ist als reines State-Machine-Modul in `src/lib/game/selection.ts` (Tests daneben) getrennt von DOM und Zeichnung: Ziehen verlängert nur benachbarte Zellen (Diagonalen über die Zellmitte, Streifen an Kanten werden ignoriert), Zurückziehen über die vorherige Zelle nimmt das letzte Feld zurück, Loslassen reicht ein; Antippen baut die Auswahl Zelle für Zelle auf, ein erneutes Antippen der letzten Zelle reicht, ein Antippen früherer Zellen schneidet zurück, alles andere verwirft die Auswahl. Ausgewertet wird nichts — nach dem Reichen leert das Brett die Auswahl und reicht das Pfad-Array an die Seite über `onsubmit` (Auswertung folgt in Issue #8). Die Seite liest das Rätsel clientseitig aus dem URL-Anker (`decodePuzzle`), ohne Anker oder mit defektem Anker zeigt sie einen Hinweis, ein Rätsel im Speicher gibt es noch nicht.

Bedienung nur mit Maus und Touch: Das Spielfeld lässt sich bisher nicht per Tastatur oder Screenreader bedienen. Tastatursteuerung ist offen (siehe Issue #26).

## Deployment

Beim Push auf `main` baut der Workflow `.github/workflows/deploy.yml` die Seite (inklusive `check`, `lint` und Unit-Tests) und veröffentlicht sie mit `actions/deploy-pages` auf GitHub Pages. Pull Requests laufen nur durch Build und Checks. Voraussetzung ist, dass die Pages-Quelle in den Repository-Einstellungen auf „GitHub Actions" steht. `static/.nojekyll` sorgt dafür, dass Pages den `_app/`-Ordner ausliefert. Die Seite läuft unter <https://abduelhamit.github.io/Roter-Faden/>.
