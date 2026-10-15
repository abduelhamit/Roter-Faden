# Roter Faden

German word-search puzzle (Strands-style) on a 6 columns × 8 rows grid of 48 letters. Currently a fresh `sv` scaffold: the game is not built yet.

## Stack & commands

- pnpm (`pnpm-lock.yaml`, `engine-strict=true`). Scripts call `npm run` internally; that's fine, but install and run with `pnpm`.
- `pnpm check` (svelte-check), `pnpm lint` (prettier --check + eslint), `pnpm format`, `pnpm build`.
- `pnpm test:unit -- --run` runs Vitest once. `pnpm test:e2e` runs Playwright: it builds, then previews on port 4173. E2E files must be named `*.e2e.ts`.
- `pnpm test` fails while there are no unit test files. Vitest has no "pass with no tests" option set.
- Vitest uses `environment: 'node'` and `requireAssertions: true`. `vitest-browser-svelte` is installed but not wired up, so component tests need a browser project added to `vite.config.ts` first.

## SvelteKit 3 quirks (differ from older docs and training data)

- No `svelte.config.js`. Kit options (adapter, `paths.base`, compiler options) live in the `sveltekit({...})` call in `vite.config.ts`.
- Import the lib folder with `#lib` / `#lib/*` (`package.json` `imports`), not `$lib`.
- Runes mode is forced for every file outside `node_modules`. Use Svelte 5 runes only.
- Tailwind v4 is set up in CSS (`src/routes/layout.css`, which uses `@plugin`). There is no `tailwind.config`.

## Static hosting under `/Roter-Faden/`

- `adapter-static` with `prerender = true` in `src/routes/+layout.ts`. No server code, no `+page.server.ts`, no runtime API.
- Base path is `/Roter-Faden`. Build internal links with `resolve()` from `$app/paths` and reference assets through imports or `base`. Never hardcode `/`. In Playwright tests, `page.goto` needs the `/Roter-Faden/...` prefix.
- GitHub Pages runs Jekyll, which ignores `_app/`. Add `static/.nojekyll` before deploying. No deploy workflow exists yet.
- Shared/editor puzzles live entirely in the URL **hash** (`#...`). The hash only exists in the browser, so prerendering can't see it: decode it client-side (`onMount`/`$effect`/`hashchange`).
- `src/routes/demo/` and `<DemoLinks />` in `+layout.svelte` are scaffold demos. Delete them (and update the demo e2e test) when building real pages.

## Game rules agents tend to get wrong

- All text is uppercase A–Z only. Umlauts and ß are written out: Ä→AE, Ö→OE, Ü→UE, ß→SS. Grid letters, theme words and dictionary entries all use this form.
- Every one of the 48 cells belongs to exactly one theme word or to the Roter Faden. No letter is left over and no cell is shared. The editor must check this.
- Adjacency is 8-directional. A path never reuses a cell.
- Roter Faden (red) must touch two opposite edges: left+right or top+bottom. Theme words are blue. A valid non-theme dictionary word (4+ letters) is gray and feeds the hint meter.
- Hints: every 3 non-theme words earns 1 hint. At most 100 non-theme words count, so at most 33 hints. A hint draws dashed rings around the cells of one undiscovered theme word. It does not reveal the order.
- Found words never lock their cells. The player can still select any cell.
- Selection rules:
  - Drag: release submits. Moving back over the previous cell undoes the last step.
  - Tap: tapping the last cell again submits. Tapping an earlier selected cell cuts the selection back to that cell. Tapping a non-adjacent cell or outside the board clears it.
- No strikes, timers or penalties. The share text uses 🔵 for a theme word, 🔴 for the Roter Faden and 💡 for a hint used, in the order they happened.
- The German dictionary has to ship as a static asset or be bundled at build time. No word list exists in the repo yet.
