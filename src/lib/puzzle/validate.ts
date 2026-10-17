import {
	CELL_COUNT,
	COLS,
	ROWS,
	cellsEqual,
	isAdjacent,
	isCells,
	spellPath,
	type Puzzle
} from './model.js';

export type ValidationResult = { ok: true } | { ok: false; errors: string[] };

/** Theme words carry no text, so they are addressed by their position. */
const wordLabel = (index: number): string => `Themenwort ${index + 1}`;

/**
 * Checks every puzzle rule and returns all violations as readable German messages,
 * in a stable order (structure, adjacency, crossings, coverage, faden, words, uniqueness).
 * The dictionary is injected as `isWord`; the Roter Faden is exempt from it.
 * Editor-only: the game must not run this on puzzles decoded from a URL — rule 8's
 * search is exponential, and crafted input could stall the player's tab.
 */
export function validatePuzzle(
	puzzle: Puzzle,
	isWord: (word: string) => boolean
): ValidationResult {
	const errors: string[] = [];
	const { letters, words, faden } = puzzle;

	// Structure — bail out early, later rules assume usable indices and letters.
	if (typeof letters !== 'string' || !/^[A-Z]{48}$/.test(letters)) {
		errors.push('Die Buchstaben müssen genau 48 Großbuchstaben A–Z sein.');
	}
	if (!isCells(faden) || !Array.isArray(words) || !words.every(isCells)) {
		errors.push('Zellindizes müssen ganze Zahlen zwischen 0 und 47 sein.');
	}
	if (errors.length > 0) return { ok: false, errors };

	// 1. every path is 8-adjacent and never reuses a cell
	const checkPath = (path: number[], name: string): void => {
		const seen = new Set<number>();
		for (let i = 0; i < path.length; i++) {
			if (i > 0 && !isAdjacent(path[i - 1], path[i])) {
				errors.push(`${name} ist nicht benachbart (Zelle ${path[i - 1]} → ${path[i]}).`);
			}
			if (seen.has(path[i])) errors.push(`${name} verwendet Zelle ${path[i]} mehrfach.`);
			seen.add(path[i]);
		}
	};
	checkPath(faden, 'Roter Faden');
	words.forEach((path, i) => checkPath(path, wordLabel(i)));

	// 2. no crossings: two diagonals of a 2×2 block are both walked (within or between paths)
	const segments = new Set<number>();
	const walkSegments = (path: number[]): void => {
		for (let i = 1; i < path.length; i++) {
			segments.add(Math.min(path[i - 1], path[i]) * 64 + Math.max(path[i - 1], path[i]));
		}
	};
	walkSegments(faden);
	words.forEach(walkSegments);
	for (let r = 0; r < ROWS - 1; r++) {
		for (let c = 0; c < COLS - 1; c++) {
			const tl = r * COLS + c;
			const tr = tl + 1;
			const bl = tl + COLS;
			const br = bl + 1;
			if (segments.has(tl * 64 + br) && segments.has(tr * 64 + bl)) {
				errors.push(`Linien kreuzen sich in einem 2×2-Block ab Zelle ${tl}.`);
			}
		}
	}

	// 3. every one of the 48 cells is in exactly one path
	const owner = new Array<number>(CELL_COUNT).fill(-1);
	const claim = (path: number[], id: number): void => {
		for (const cell of path) {
			if (owner[cell] !== -1 && owner[cell] !== id) {
				errors.push(`Zelle ${cell} gehört zu mehreren Pfaden.`);
			} else {
				owner[cell] = id;
			}
		}
	};
	claim(faden, 0);
	words.forEach((path, i) => claim(path, i + 1));
	for (let cell = 0; cell < CELL_COUNT; cell++) {
		if (owner[cell] === -1) errors.push(`Zelle ${cell} gehört zu keinem Pfad.`);
	}

	// 4. the Roter Faden touches two opposite edges
	const left = faden.some((c) => c % COLS === 0);
	const right = faden.some((c) => c % COLS === COLS - 1);
	const top = faden.some((c) => c < COLS);
	const bottom = faden.some((c) => c >= CELL_COUNT - COLS);
	if (!((left && right) || (top && bottom))) {
		errors.push(
			'Der Roter Faden muss gegenüberliegende Ränder berühren (links+rechts oder oben+unten).'
		);
	}

	// 5–8. word rules: length, dictionary, uniqueness — all on the text derived from the path
	if (words.length < 1) errors.push('Mindestens ein Themenwort ist erforderlich.');
	words.forEach((path, i) => {
		const word = spellPath(letters, path);
		if (word.length < 4) {
			errors.push(`${wordLabel(i)} hat weniger als 4 Buchstaben.`);
			return;
		}
		if (!isWord(word)) {
			errors.push(`„${word}“ kommt nicht im Wörterbuch vor.`);
			// Not a word, so its uniqueness does not matter — and the search below is exponential.
			return;
		}
		if (hasOtherSpelling(letters, word, path)) {
			errors.push(`„${word}“ ist auch mit anderen Feldern bildbar.`);
		}
	});

	// Rule 8 also covers the Roter Faden: matchFaden compares letters, so a second
	// group spelling the same text would let a player claim the faden without
	// ever drawing the line. No dictionary gate — the faden's text is free.
	if (hasOtherSpelling(letters, spellPath(letters, faden), faden)) {
		errors.push('Der Roter Faden ist auch mit anderen Feldern bildbar.');
	}

	return errors.length > 0 ? { ok: false, errors } : { ok: true };
}

function neighbors(cell: number): number[] {
	const row = Math.floor(cell / COLS);
	const col = cell % COLS;
	const out: number[] = [];
	for (let dr = -1; dr <= 1; dr++) {
		for (let dc = -1; dc <= 1; dc++) {
			if (dr === 0 && dc === 0) continue;
			const r = row + dr;
			const c = col + dc;
			if (r >= 0 && r < ROWS && c >= 0 && c < COLS) out.push(r * COLS + c);
		}
	}
	return out;
}

/**
 * Rule 8: searches the whole grid for every path spelling `word` and reports whether
 * any of them uses a different cell group than the word's own path. Repeated letters
 * (the BESSER case) only produce other orderings of the same group, which is fine.
 * shortcut: the search is exponential — dictionary words only reach it once accepted,
 * but the faden's text reaches it ungated, and a long text on a letter-repetitive grid
 * can still stall for seconds. Harmless as long as only the editor calls validatePuzzle;
 * upgrade to a node budget if puzzle creation hangs.
 */
function hasOtherSpelling(letters: string, word: string, ownPath: number[]): boolean {
	let found = false;
	const dfs = (cell: number, used: Set<number>, path: number[]): void => {
		if (found) return;
		const next = [...path, cell];
		if (next.length === word.length) {
			if (!cellsEqual(next, ownPath)) found = true;
			return;
		}
		for (const n of neighbors(cell)) {
			if (used.has(n) || letters[n] !== word[next.length]) continue;
			used.add(n);
			dfs(n, used, next);
			used.delete(n);
		}
	};
	for (let start = 0; start < CELL_COUNT && !found; start++) {
		if (letters[start] !== word[0]) continue;
		dfs(start, new Set([start]), []);
	}
	return found;
}
