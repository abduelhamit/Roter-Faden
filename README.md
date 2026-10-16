# Roter Faden

Ein deutsches Worträtsel im Strands-Stil: Auf einem Raster aus 6 Spalten und 8 Reihen (48 Buchstaben) gilt es, alle Themawörter entlang ihrer Wörterpfade zu finden. Jeder Buchstabe gehört genau einem Themawort oder dem roten Faden, der das ganze Raster durchzieht. Rätsel lassen sich per URL-Hash teilen.

Gebaut mit SvelteKit 3, Svelte 5 (Runes) und Tailwind CSS 4, statisch gebunden mit `adapter-static` und gehostet unter `/Roter-Faden/`.

## Entwicklung

```sh
pnpm install             # Abhängigkeiten installieren
pnpm dev                 # Entwicklungsserver starten
pnpm check               # svelte-check
pnpm lint                # prettier --check + eslint
pnpm format              # Prettier schreibt Dateien um
pnpm build               # Produktions-Build
pnpm preview             # Build lokal ausliefern (Port 4173)
pnpm test:unit -- --run  # Vitest einmalig
pnpm test:e2e            # baut und startet Preview, dann Playwright
pnpm test                # beides
```

Aktuell gibt es nur einen Platzhalter-Unit-Test (`src/routes/+layout.test.ts`); `pnpm test:e2e` scheitert noch mit „no tests found", bis die ersten E2E-Tests existieren.

## Deployment

Beim Push auf `main` baut der Workflow `.github/workflows/deploy.yml` die Seite (inklusive `check`, `lint` und Unit-Tests) und veröffentlicht sie mit `actions/deploy-pages` auf GitHub Pages. Pull Requests laufen nur durch Build und Checks. Voraussetzung ist, dass die Pages-Quelle in den Repository-Einstellungen auf „GitHub Actions" steht. `static/.nojekyll` sorgt dafür, dass Pages den `_app/`-Ordner ausliefert. Die Seite läuft unter <https://abduelhamit.github.io/Roter-Faden/>.
