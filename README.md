# Roter Faden

Ein deutsches Worträtsel im Strands-Stil: Auf einem Raster aus 6 Spalten und 8 Reihen (48 Buchstaben) gilt es, alle Themawörter entlang ihrer Wörterpfade zu finden. Jeder Buchstabe gehört genau einem Themawort oder dem roten Faden, der das ganze Raster durchzieht. Rätsel lassen sich per URL-Hash teilen.

Gebaut mit SvelteKit 3, Svelte 5 (Runes) und Tailwind CSS 4, statisch gebunden mit `adapter-static` und gehostet unter `/Roter-Faden/`.

## Entwicklung

```sh
pnpm install   # Abhängigkeiten installieren
pnpm dev       # Entwicklungsserver starten
pnpm check     # svelte-check
pnpm lint      # prettier --check + eslint
pnpm build     # Produktions-Build
```
