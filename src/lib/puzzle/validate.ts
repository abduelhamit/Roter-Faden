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

/** Every rule `validatePuzzle` can report. */
export type Rule =
	| 'structure'
	| 'adjacency'
	| 'crossing'
	| 'coverage'
	| 'faden-edges'
	| 'word-count'
	| 'word-length'
	| 'dictionary'
	| 'uniqueness';

/** One drawn path, which has a row of its own in the editor. */
export type RowSubject = { kind: 'faden' } | { kind: 'word'; index: number };

/** The editor row a violation belongs to: the faden, one theme word or the whole puzzle. */
export type ViolationSubject = RowSubject | { kind: 'puzzle' };

export interface Violation {
	rule: Rule;
	/** German message, unchanged since before the violations carried addresses. */
	message: string;
	/** Cells the editor should highlight; empty when no single cell is at fault. Uniqueness
	 * violations list the word's own cells first, then the group it collides with. */
	cells: number[];
	subject: ViolationSubject;
}

export type ValidationResult = { ok: true } | { ok: false; violations: Violation[] };

/** A theme word shorter than this is not a word: rule 5 rejects it and rules 7 and 8 skip it. */
const MIN_WORD_LENGTH = 4;

const PUZZLE_ROW: ViolationSubject = { kind: 'puzzle' };
const FADEN_ROW: ViolationSubject = { kind: 'faden' };
/** Theme words carry no text, so they are addressed by their position. */
const wordRow = (index: number): RowSubject => ({ kind: 'word', index });

const violation = (
	rule: Rule,
	message: string,
	subject: ViolationSubject,
	cells: number[] = []
): Violation => ({ rule, message, cells, subject });

/** The label of a path's row; the puzzle itself has no row to name. */
const rowLabel = (subject: RowSubject): string =>
	subject.kind === 'faden' ? 'Roter Faden' : `Themenwort ${subject.index + 1}`;

/** Row identity: two rows are the same when they are the same word index or both the faden. */
const sameRow = (a: RowSubject, b: RowSubject): boolean =>
	a.kind === 'word' && b.kind === 'word' ? a.index === b.index : a.kind === b.kind;

/** Every path paired with the row it belongs to, faden first. */
const paths = (puzzle: Puzzle): Array<[number[], RowSubject]> => [
	[puzzle.faden, FADEN_ROW],
	...puzzle.words.map((path, index): [number[], RowSubject] => [path, wordRow(index)])
];

/** A theme word as spelled by its path. */
export interface SpelledWord {
	index: number;
	path: number[];
	word: string;
	/** `short` never reaches the dictionary; `unknown` never reaches the uniqueness search. */
	status: 'short' | 'unknown' | 'known';
}

/** Spells every theme word and asks the dictionary once per word; rules 5, 7 and 8 share it. */
export function spellWords(puzzle: Puzzle, isWord: (word: string) => boolean): SpelledWord[] {
	return puzzle.words.map((path, index) => {
		const word = spellPath(puzzle.letters, path);
		const status: SpelledWord['status'] =
			word.length < MIN_WORD_LENGTH ? 'short' : isWord(word) ? 'known' : 'unknown';
		return { index, path, word, status };
	});
}

/**
 * Checks every puzzle rule and returns all violations, in a stable order
 * (structure, adjacency, crossings, coverage, faden, word count, then per word:
 * length, dictionary, uniqueness, and the faden's uniqueness last).
 * The dictionary is injected as `isWord`; the Roter Faden is exempt from it.
 * The single checks are exported so the editor can run the decidable ones on a
 * partial draft without duplicating any rule. Run `checkStructure` first: the
 * other checks assume in-range indices.
 * Editor-only: the game must not run this on puzzles decoded from a URL — rule 8's
 * search is exponential, and crafted input could stall the player's tab.
 */
export function validatePuzzle(
	puzzle: Puzzle,
	isWord: (word: string) => boolean
): ValidationResult {
	// Later checks assume usable indices and letters, so structure bails out early.
	const structure = checkStructure(puzzle);
	if (structure.length > 0) return { ok: false, violations: structure };

	// Rules 5, 7 and 8 need the spelled words, so the dictionary is asked once here.
	const spelled = spellWords(puzzle, isWord);
	const violations = [
		...checkAdjacency(puzzle),
		...checkCrossings(puzzle),
		...checkCoverage(puzzle),
		...checkFadenEdges(puzzle),
		...checkWordCount(puzzle),
		// One theme word at a time: violations[0] is then the earliest faulty word,
		// which is the one the editor shows first.
		...spelled.flatMap((word) => [
			...checkWordLength([word]),
			...checkDictionary([word]),
			...checkUniqueness(puzzle, [word])
		]),
		...checkFadenUniqueness(puzzle)
	];
	return violations.length > 0 ? { ok: false, violations } : { ok: true };
}

/** The letters are 48 × A–Z and every cell index is inside the grid. */
export function checkStructure(puzzle: Puzzle): Violation[] {
	const out: Violation[] = [];
	if (typeof puzzle.letters !== 'string' || !/^[A-Z]{48}$/.test(puzzle.letters)) {
		out.push(
			violation('structure', 'Die Buchstaben müssen genau 48 Großbuchstaben A–Z sein.', PUZZLE_ROW)
		);
	}
	if (!isCells(puzzle.faden) || !Array.isArray(puzzle.words) || !puzzle.words.every(isCells)) {
		out.push(
			violation('structure', 'Zellindizes müssen ganze Zahlen zwischen 0 und 47 sein.', PUZZLE_ROW)
		);
	}
	return out;
}

/** Rule 1: every path is 8-adjacent and never reuses a cell. */
export function checkAdjacency(puzzle: Puzzle): Violation[] {
	const out: Violation[] = [];
	for (const [path, subject] of paths(puzzle)) {
		const seen = new Set<number>();
		for (let i = 0; i < path.length; i++) {
			if (i > 0 && !isAdjacent(path[i - 1], path[i])) {
				out.push(
					violation(
						'adjacency',
						`${rowLabel(subject)} ist nicht benachbart (Zelle ${path[i - 1]} → ${path[i]}).`,
						subject,
						[path[i - 1], path[i]]
					)
				);
			}
			if (seen.has(path[i])) {
				out.push(
					violation(
						'adjacency',
						`${rowLabel(subject)} verwendet Zelle ${path[i]} mehrfach.`,
						subject,
						[path[i]]
					)
				);
			}
			seen.add(path[i]);
		}
	}
	return out;
}

/** Rule 2: no crossings — two diagonals of a 2×2 block are both walked, within or between paths. */
export function checkCrossings(puzzle: Puzzle): Violation[] {
	const owner = new Map<number, RowSubject>();
	for (const [path, subject] of paths(puzzle)) {
		for (let i = 1; i < path.length; i++) {
			const key = Math.min(path[i - 1], path[i]) * 64 + Math.max(path[i - 1], path[i]);
			if (!owner.has(key)) owner.set(key, subject);
		}
	}
	const out: Violation[] = [];
	for (let r = 0; r < ROWS - 1; r++) {
		for (let c = 0; c < COLS - 1; c++) {
			const tl = r * COLS + c;
			const tr = tl + 1;
			const bl = tl + COLS;
			const br = bl + 1;
			const down = owner.get(tl * 64 + br);
			const up = owner.get(tr * 64 + bl);
			if (down !== undefined && up !== undefined) {
				// A self-crossing belongs to its path; a crossing between paths belongs to
				// neither row alone, so it is a puzzle-level violation.
				const subject = sameRow(down, up) ? down : PUZZLE_ROW;
				out.push(
					violation('crossing', `Linien kreuzen sich in einem 2×2-Block ab Zelle ${tl}.`, subject, [
						tl,
						tr,
						bl,
						br
					])
				);
			}
		}
	}
	return out;
}

/** Rule 3: every one of the 48 cells is in exactly one path. */
export function checkCoverage(puzzle: Puzzle): Violation[] {
	const out: Violation[] = [];
	const owner = new Array<number>(CELL_COUNT).fill(-1);
	paths(puzzle).forEach(([path, subject], id) => {
		for (const cell of path) {
			if (owner[cell] !== -1 && owner[cell] !== id) {
				out.push(
					violation('coverage', `Zelle ${cell} gehört zu mehreren Pfaden.`, subject, [cell])
				);
			} else {
				owner[cell] = id;
			}
		}
	});
	for (let cell = 0; cell < CELL_COUNT; cell++) {
		if (owner[cell] === -1) {
			out.push(violation('coverage', `Zelle ${cell} gehört zu keinem Pfad.`, PUZZLE_ROW, [cell]));
		}
	}
	return out;
}

/** Rule 4: the Roter Faden touches two opposite edges. */
export function checkFadenEdges({ faden }: Puzzle): Violation[] {
	const left = faden.some((c) => c % COLS === 0);
	const right = faden.some((c) => c % COLS === COLS - 1);
	const top = faden.some((c) => c < COLS);
	const bottom = faden.some((c) => c >= CELL_COUNT - COLS);
	if ((left && right) || (top && bottom)) return [];
	return [
		violation(
			'faden-edges',
			'Der Roter Faden muss gegenüberliegende Ränder berühren (links+rechts oder oben+unten).',
			FADEN_ROW,
			faden
		)
	];
}

/** Rule 6: at least one theme word exists. */
export function checkWordCount({ words }: Puzzle): Violation[] {
	return words.length < 1
		? [violation('word-count', 'Mindestens ein Themenwort ist erforderlich.', PUZZLE_ROW)]
		: [];
}

/** Rule 5: a theme word has at least 4 letters. */
export function checkWordLength(words: SpelledWord[]): Violation[] {
	const out: Violation[] = [];
	for (const { index, path, status } of words) {
		if (status === 'short') {
			const subject = wordRow(index);
			out.push(
				violation(
					'word-length',
					`${rowLabel(subject)} hat weniger als ${MIN_WORD_LENGTH} Buchstaben.`,
					subject,
					path
				)
			);
		}
	}
	return out;
}

/** Rule 7: every theme word is in the dictionary; the Roter Faden is exempt. */
export function checkDictionary(words: SpelledWord[]): Violation[] {
	const out: Violation[] = [];
	for (const { index, path, word, status } of words) {
		if (status !== 'unknown') continue;
		out.push(
			violation('dictionary', `„${word}“ kommt nicht im Wörterbuch vor.`, wordRow(index), path)
		);
	}
	return out;
}

/**
 * Rule 8: no other cell group may spell a theme word. Repeated letters (the BESSER case)
 * only produce other orderings of the same group, which is fine. `spellWords` only
 * marks accepted words as known, because the search below is exponential.
 */
export function checkUniqueness(puzzle: Puzzle, words: SpelledWord[]): Violation[] {
	const out: Violation[] = [];
	for (const { index, path, word, status } of words) {
		if (status !== 'known') continue;
		const other = otherSpelling(puzzle.letters, word, path);
		if (other) {
			out.push(
				violation(
					'uniqueness',
					`„${word}“ ist auch mit anderen Feldern bildbar.`,
					wordRow(index),
					// Both groups, so the editor can show what the word collides with.
					[...new Set([...path, ...other])]
				)
			);
		}
	}
	return out;
}

/**
 * Rule 8 also covers the Roter Faden: matchFaden compares letters, so a second group
 * spelling the same text would let a player claim the faden without ever drawing the
 * path. No dictionary gate — the faden's text is free.
 */
export function checkFadenUniqueness({ letters, faden }: Puzzle): Violation[] {
	const other = otherSpelling(letters, spellPath(letters, faden), faden);
	return other
		? [
				violation(
					'uniqueness',
					'Der Roter Faden ist auch mit anderen Feldern bildbar.',
					FADEN_ROW,
					[...new Set([...faden, ...other])]
				)
			]
		: [];
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
 * Rule 8: searches the whole grid for every path spelling `word` and returns the first
 * one that uses a different cell group than the word's own path, or null when there is
 * none. Repeated letters (the BESSER case) only produce other orderings of the same
 * group, which is fine.
 * shortcut: the search is exponential — dictionary words only reach it once accepted,
 * but the faden's text reaches it ungated, and a long text on a letter-repetitive grid
 * can still stall for seconds. Harmless as long as only the editor calls validatePuzzle;
 * upgrade to a node budget if puzzle creation hangs.
 */
function otherSpelling(letters: string, word: string, ownPath: number[]): number[] | null {
	let found: number[] | null = null;
	const dfs = (cell: number, used: Set<number>, path: number[]): void => {
		if (found) return;
		const next = [...path, cell];
		if (next.length === word.length) {
			if (!cellsEqual(next, ownPath)) found = next;
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
