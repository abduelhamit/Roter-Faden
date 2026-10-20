import { CELL_COUNT, isAdjacent } from './model.js';

/** The loaded list — full text (editor) or a board's spellable words (game) — plus
 *  the board it answers for (`undefined` = full list); written together, never apart. */
let dictionary: string | Set<string> | undefined;
let loadedLetters: string | undefined;
let pending: Promise<void> | undefined;

/** 8-directional neighbours of each cell, from the model's own adjacency rule. */
const NEIGHBORS: number[][] = Array.from({ length: CELL_COUNT }, (_, cell) => {
	const out: number[] = [];
	for (let other = 0; other < CELL_COUNT; other++) if (isAdjacent(cell, other)) out.push(other);
	return out;
});

/**
 * Lazily loads the gzipped word list (static/dictionary.txt.gz) for `isWord` — call
 * only after the board has rendered, so the download never blocks the first paint.
 * Single-flight, retryable after failure. The list must arrive sorted, one word per
 * line (the committed asset is; dictionary.test.ts asserts it). The caller resolves
 * the URL — this module stays free of SvelteKit so it runs unchanged in node tests.
 *
 * `letters` is the game board's 48 letters (`Puzzle.letters`, codec-validated). With
 * it, only the words a player can trace there — an 8-directional path of distinct
 * cells — are kept as a `Set` and the full text is dropped; without it the full text
 * is kept and binary-searched (the editor's path). One shape at a time: same letters
 * are a no-op, changed letters load anew (a dropped text cannot be re-filtered) —
 * except a still-held full text, which is filtered in place.
 */
export async function loadDictionary(url: string, letters?: string): Promise<void> {
	for (;;) {
		if (dictionary !== undefined && loadedLetters === letters) return;
		if (pending !== undefined) {
			await pending; // may resolve to any shape — re-check before deciding
			continue;
		}
		if (typeof dictionary === 'string' && letters !== undefined) {
			dictionary = filterToBoard(dictionary, letters);
			loadedLetters = letters;
			return;
		}
		pending = fetchAndParse(url).then(
			(body) => {
				// Bind the result before releasing `pending`, so no awaiter sees a cleared slot.
				dictionary = letters === undefined ? body : filterToBoard(body, letters);
				loadedLetters = letters;
				pending = undefined;
			},
			(error) => {
				pending = undefined;
				throw error;
			}
		);
	}
}

/**
 * Drop-in for validatePuzzle's `isWord`. Throws until loadDictionary has resolved —
 * a silent `false` would report „kommt nicht im Wörterbuch vor“ for valid words.
 * Board mode answers from its Set: a word no path spells is `false` by design.
 */
export function isWord(word: string): boolean {
	if (dictionary === undefined)
		throw new Error('dictionary not loaded — await loadDictionary() first');
	return typeof dictionary === 'string' ? includesLine(dictionary, word) : dictionary.has(word);
}

/**
 * The words of `text` a player can spell on the `letters` board (the game's tracing
 * rule): a cheap letter-multiset test first — most words die there — then a DFS with
 * visited cells over the survivors. Kept words are copied via String.fromCharCode,
 * never `text.slice()`: V8 slices retain their parent, pinning the whole text this
 * function exists to free.
 * shortcut: synchronous over the whole list (~0.2s desktop, several-fold slower on a
 * mid-range phone), paid once per board after the download; chunk it only if real
 * devices ever jank here.
 */
function filterToBoard(text: string, letters: string): Set<string> {
	const board = new Int32Array(26);
	const starts: number[][] = Array.from({ length: 26 }, () => []);
	for (let i = 0; i < letters.length; i++) {
		const c = letters.charCodeAt(i) - 65;
		board[c]++;
		starts[c].push(i);
	}
	const need = new Int32Array(26);
	const visited = new Uint8Array(CELL_COUNT);
	const keep = new Set<string>();
	let start = 0;
	while (start < text.length) {
		const end = text.indexOf('\n', start);
		let counted = 0;
		while (counted < end - start) {
			const c = text.charCodeAt(start + counted) - 65;
			if (need[c] + 1 > board[c]) break; // over the board's count — drop the word
			need[c]++;
			counted++;
		}
		for (let i = 0; i < counted; i++) need[text.charCodeAt(start + i) - 65]--;
		if (counted === end - start) {
			const word = text.slice(start, end); // temporary — only the copy below is kept
			if (spellsPath(word, starts, letters, visited))
				keep.add(String.fromCharCode(...Array.from(word, (ch) => ch.charCodeAt(0))));
		}
		start = end + 1;
	}
	return keep;
}

/** True if some path of 8-directionally adjacent, unreused cells spells `word`. */
function spellsPath(
	word: string,
	starts: number[][],
	letters: string,
	visited: Uint8Array
): boolean {
	const first = starts[word.charCodeAt(0) - 65];
	if (first === undefined) return false; // empty word or a letter outside A–Z
	const last = word.length - 1;
	const walk = (depth: number, cell: number): boolean => {
		if (depth === last) return true;
		visited[cell] = 1;
		for (const nb of NEIGHBORS[cell]) {
			if (!visited[nb] && letters[nb] === word[depth + 1] && walk(depth + 1, nb)) {
				visited[cell] = 0;
				return true;
			}
		}
		visited[cell] = 0;
		return false;
	};
	return first.some((cell) => walk(0, cell));
}

/**
 * True if `word` is one of `text`'s lines. Binary search over '\n'-terminated lines;
 * contract: sorted ascending, unique, no empty lines (JS string order is byte order
 * for pure ASCII A–Z — dictionary.test.ts asserts all three on the committed asset).
 * An unsorted list silently misses words. Full-text mode only.
 */
function includesLine(text: string, word: string): boolean {
	let lo = 0;
	let hi = text.length; // exclusive; lo and hi always sit on line starts (or past end)
	while (lo < hi) {
		const mid = lo + ((hi - lo) >>> 1);
		// Snap mid back to its line start, so every comparison is between whole lines.
		const start = mid === 0 || text[mid - 1] === '\n' ? mid : text.lastIndexOf('\n', mid - 1) + 1;
		const end = text.indexOf('\n', start);
		if (text.slice(start, end) < word)
			lo = end + 1; // past this whole line
		else hi = start;
	}
	// lo is the insertion point: the first line start that is >= word.
	return lo < text.length && text.slice(lo, text.indexOf('\n', lo)) === word;
}

async function fetchAndParse(url: string): Promise<string> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`dictionary fetch failed (${res.status}): ${url}`);
	const bytes = new Uint8Array(await res.arrayBuffer());
	if (new TextDecoder().decode(bytes.subarray(0, 23)) === 'version https://git-lfs')
		throw new Error(
			`dictionary asset is a Git LFS pointer — run \`git lfs pull\` or \`pnpm generate:dictionary\`: ${url}`
		);
	// Servers may pre-decode .gz (Content-Encoding), so accept plain text as well.
	// The body stays one flat string: splitting into millions of strings up front costs
	// well over 100MB of heap. Only filterToBoard's kept words become strings of their
	// own, and those copies are what let the text be freed.
	const text =
		bytes[0] === 0x1f && bytes[1] === 0x8b
			? await new Response(
					new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
				).text()
			: new TextDecoder().decode(bytes);
	// A missing final newline would spin includesLine's walker (its `lo = end + 1`
	// resets to 0 on the unterminated last line); the plain-text fallback accepts
	// bodies from any server, so normalize here rather than trust the contract.
	return text.endsWith('\n') ? text : `${text}\n`;
}
