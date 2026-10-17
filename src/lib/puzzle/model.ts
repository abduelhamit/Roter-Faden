/** Grid geometry: 6 columns × 8 rows, cell indices 0–47, row-major. */
export const COLS = 6;
export const ROWS = 8;
export const CELL_COUNT = 48;

/**
 * A puzzle as it travels through the URL. Theme words are not stored: their text
 * is reconstructable from the letters along the path that spells them.
 */
export interface Puzzle {
	/** German clue, carried as-is. */
	clue: string;
	/** Exactly 48 uppercase letters A–Z. */
	letters: string;
	/** One ordered cell path per theme word (≥ 1 words). */
	words: number[][];
	/** Ordered path of the Roter Faden — has no word, exempt from the dictionary. */
	faden: number[];
}

/**
 * Uppercase, Ä→AE, Ö→OE, Ü→UE, ß→SS (via uppercase), then keep only A–Z.
 * ẞ survives uppercasing, so it is written out explicitly.
 */
export function normalizeText(raw: string): string {
	return raw
		.toUpperCase()
		.replace(/Ä/g, 'AE')
		.replace(/Ö/g, 'OE')
		.replace(/Ü/g, 'UE')
		.replace(/ẞ/g, 'SS')
		.replace(/[^A-Z]/g, '');
}

/** 8-directional neighbour test (row/col deltas), so 5→6 is NOT adjacent. */
export function isAdjacent(a: number, b: number): boolean {
	const dr = Math.abs(Math.floor(a / COLS) - Math.floor(b / COLS));
	const dc = Math.abs((a % COLS) - (b % COLS));
	return dr <= 1 && dc <= 1 && dr + dc > 0;
}

/** Order-free exact cell-set equality; a path with repeated cells never equals one without. */
export function cellsEqual(a: number[], b: number[]): boolean {
	if (a.length !== b.length) return false;
	const setA = new Set(a);
	const setB = new Set(b);
	return setA.size === a.length && setB.size === b.length && b.every((cell) => setA.has(cell));
}

/** Letters along `path` in its own order; an out-of-range index yields '' so it can never equal a word. */
export function spellPath(letters: string, path: number[]): string {
	return path.map((i) => letters[i] ?? '').join('');
}

/** A list of whole cell indices inside the grid. */
export const isCells = (v: unknown): v is number[] =>
	Array.isArray(v) && v.every((n) => Number.isInteger(n) && n >= 0 && n < CELL_COUNT);

/** Structural guard for anything coming out of the codec, before it is trusted. */
export function isPuzzleShape(p: unknown): p is Puzzle {
	if (typeof p !== 'object' || p === null) return false;
	const { clue, letters, words, faden } = p as Partial<Puzzle>;
	return (
		typeof clue === 'string' &&
		typeof letters === 'string' &&
		/^[A-Z]{48}$/.test(letters) &&
		Array.isArray(words) &&
		words.every(isCells) &&
		isCells(faden)
	);
}
