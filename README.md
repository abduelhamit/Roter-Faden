# Roter Faden

Ein deutsches Worträtsel im Strands-Stil: Auf einem Raster aus 6 Spalten und 8 Reihen (48 Buchstaben) gilt es, alle Themawörter entlang ihrer Wörterpfade zu finden. Jeder Buchstabe gehört genau einem Themawort oder dem roten Faden, der das ganze Raster durchzieht. Rätsel lassen sich per URL-Anker teilen.

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

## Rätsel-Format

Puzzle-Modell, Matching, Validierung und URL-Codec liegen als reines TypeScript in `src/lib/puzzle/` (Tests daneben). Ein geteiltes Rätsel steckt im URL-Anker als `#v1.<base64url>`: Protobuf-Serialisierung → AES-256-GCM (statischer Schlüssel im Bundle — schützt vor neugierigen Spoilern, nicht vor ernsthaften Angreifern) → base64url. Die Wörter werden nicht als Text gespeichert, sondern aus den Buchstaben entlang ihrer Zellpfade rekonstruiert; der Anker verrät damit keine Wörter — die Zellgruppen selbst stecken als Pfade darin. Die Validierung prüft alle Spielregeln und meldet Verstöße auf Deutsch; das Wörterbuch wird als `isWord`-Funktion injiziert (siehe Issue #5). Validiert wird nur im Editor — das Spiel wertet dekodierte URLs nicht damit aus, weil die Eindeutigkeitssuche (Regel 8) exponentiell ist. Deshalb garantiert `decodePuzzle` auch nur die Struktur (48 Buchstaben, ganze Zellindizes) — Regelverstöße aus handgebauten URLs laufen bewusst durch.

Das Protobuf-Schema liegt in `src/lib/puzzle/puzzle.proto`. Nach einer Änderung `pnpm generate:proto` laufen lassen — das erzeugt `puzzle.pb.js` und `puzzle.pb.d.ts`, die mit eingecheckt werden (wie die Primer-Tokens oben).

## Deployment

Beim Push auf `main` baut der Workflow `.github/workflows/deploy.yml` die Seite (inklusive `check`, `lint` und Unit-Tests) und veröffentlicht sie mit `actions/deploy-pages` auf GitHub Pages. Pull Requests laufen nur durch Build und Checks. Voraussetzung ist, dass die Pages-Quelle in den Repository-Einstellungen auf „GitHub Actions" steht. `static/.nojekyll` sorgt dafür, dass Pages den `_app/`-Ordner ausliefert. Die Seite läuft unter <https://abduelhamit.github.io/Roter-Faden/>.
