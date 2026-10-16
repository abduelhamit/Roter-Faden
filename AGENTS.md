# Roter Faden

German word-search puzzle (Strands-style) on a 6 columns × 8 rows grid of 48 letters. Currently a fresh `sv` scaffold: the game is not built yet.

## Stack & commands

- pnpm (`pnpm-lock.yaml`, `engine-strict=true`). Scripts call `npm run` internally; that's fine, but install and run with `pnpm`.
- `pnpm check` (svelte-check), `pnpm lint` (prettier --check + eslint), `pnpm format`, `pnpm build`.
- `pnpm test:unit -- --run` runs Vitest once. `pnpm test:e2e` runs Playwright: it builds, then previews on port 4173. E2E files must be named `*.e2e.ts`.
- `pnpm test` fails while there are no `*.e2e.ts` files; neither Vitest nor Playwright has a "pass with no tests" option set. There is one placeholder unit test, `src/routes/+layout.test.ts`, so `pnpm test:unit -- --run` is green.
- Extend `README.md` as the project develops; it holds the short project description.
- Vitest uses `environment: 'node'` and `requireAssertions: true`. `vitest-browser-svelte` is installed but not wired up, so component tests need a browser project added to `vite.config.ts` first.

## SvelteKit 3 quirks (differ from older docs and training data)

- No `svelte.config.js`. Kit options (adapter, `paths.base`, compiler options) live in the `sveltekit({...})` call in `vite.config.ts`.
- Import the lib folder with `#lib` / `#lib/*` (`package.json` `imports`), not `$lib`.
- Runes mode is forced for every file outside `node_modules`. Use Svelte 5 runes only.
- Tailwind v4 is set up in CSS (`src/routes/layout.css`, which uses `@plugin`). There is no `tailwind.config`.

## Static hosting under `/Roter-Faden/`

- `adapter-static` with `prerender = true` in `src/routes/+layout.ts`. No server code, no `+page.server.ts`, no runtime API.
- Base path is `/Roter-Faden`. Build internal links with `resolve()` from `$app/paths` and reference assets through imports or `base`. Never hardcode `/`. In Playwright tests, `page.goto` needs the `/Roter-Faden/...` prefix.
- GitHub Pages runs Jekyll, which ignores `_app/`. `static/.nojekyll` prevents that; keep it. Deploy runs via `.github/workflows/deploy.yml` on push to `main` (checks + build also run on pull requests, deploy is skipped there). Pages source in the repo settings must stay "GitHub Actions".
- Shared puzzles live entirely in the URL **hash** (`#...`). The hash only exists in the browser, so prerendering can't see it: decode it client-side (`onMount`/`$effect`/`hashchange`).

## Game rules agents tend to get wrong

- All text is uppercase A–Z only. Umlauts and ß are written out: Ä→AE, Ö→OE, Ü→UE, ß→SS. Grid letters, theme words and dictionary entries all use this form.
- Every one of the 48 cells belongs to exactly one theme word or to the Roter Faden. No letter is left over and no cell is shared. The editor must check this.
- Adjacency is 8-directional. A path never reuses a cell.
- A submission matches a word only if it uses exactly that word's group of cells and spells the word. The path order inside the group is free: the E's and S's of BESSER may be swapped. The editor must reject any word that can also be spelled by a different group of cells.
- Further editor rules: the puzzle's paths must not cross, neither each other nor themselves (diagonal X inside a 2×2 block). Every theme word must be in the dictionary; the Roter Faden is exempt. Players may cross lines freely, and a found word's bubble follows the player's traced path.
- Roter Faden (red) must touch two opposite edges: left+right or top+bottom. Theme words are blue. A valid non-theme dictionary word (4+ letters) is gray and feeds the hint meter.
- Hints: every 3 non-theme words earns 1 hint. At most 100 non-theme words count, so at most 33 hints. A hint draws dashed rings around the cells of a random undiscovered theme word. It does not reveal the order. The Roter Faden is only hinted once it's the last word left. The hint button is also the meter, filling from left to right.
- UI is German only and follows GitHub's Primer design system. Color mode: light, dark or system (default system).
- `/Roter-Faden/` with a hash shows the game. Without one, it goes to the editor at `/Roter-Faden/editor`, which never has a hash. Game progress and work-in-progress puzzles live in `localStorage`. Only work-in-progress puzzles and solved puzzles can be edited, never a puzzle straight from a URL.
- Found words never lock their cells. The player can still select any cell.
- Selection rules:
  - Drag: release submits. Moving back over the previous cell undoes the last step.
  - Tap: tapping the last cell again submits. Tapping an earlier selected cell cuts the selection back to that cell. Tapping a non-adjacent cell or outside the board clears it.
- No strikes, timers or penalties. The share text uses 🔵 for a theme word, 🔴 for the Roter Faden and 💡 for a hint used, in the order they happened.
- The German dictionary has to ship as a static asset or be bundled at build time. No word list exists in the repo yet.
