import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeText } from './model.js';
import { THEME_WORDS, validPuzzle } from './fixtures.js';

const asset = readFileSync(new URL('../../../static/dictionary.txt.gz', import.meta.url));
// Lazy on purpose: if the file is an un-pulled Git LFS pointer, the pointer test below
// must report it clearly instead of the whole file throwing during collection.
const text = (): string => gunzipSync(asset).toString('ascii');
const lines = (): string[] => text().slice(0, -1).split('\n');

/** The module keeps load state at module level, so every test starts from a fresh copy. */
const freshDictionary = async () => {
	vi.resetModules();
	return await import('./dictionary.js');
};

afterEach(() => vi.unstubAllGlobals());

describe('loadDictionary / isWord', () => {
	it('throws from isWord until the dictionary has loaded', async () => {
		const d = await freshDictionary();
		expect(() => d.isWord('HUNDE')).toThrow(/not loaded/);
	});

	it("answers the issue's Done-when questions on the real asset", async () => {
		const d = await freshDictionary();
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(new Response(asset)))
		);
		await d.loadDictionary('/dictionary.txt.gz');
		expect(d.isWord('HUNDE')).toBe(true);
		expect(d.isWord('HUNDES')).toBe(true);
		expect(d.isWord(normalizeText('Mädchen'))).toBe(true); // Ä→AE
		expect(d.isWord(normalizeText('Böse'))).toBe(true); // Ö→OE
		expect(d.isWord(normalizeText('Über'))).toBe(true); // Ü→UE
		expect(d.isWord(normalizeText('Straße'))).toBe(true); // ß→SS
		expect(d.isWord('XQZT')).toBe(false);
		expect(d.isWord('Mädchen')).toBe(false); // raw umlauts never enter the word list
	});

	it('fetches once for concurrent and repeat calls (plain-text responses accepted)', async () => {
		const d = await freshDictionary();
		const fetchSpy = vi.fn(() => Promise.resolve(new Response('BOESE\nHUNDE\n')));
		vi.stubGlobal('fetch', fetchSpy);
		await Promise.all([d.loadDictionary('/dict'), d.loadDictionary('/dict')]);
		await d.loadDictionary('/dict');
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(d.isWord('HUNDE')).toBe(true);
		expect(d.isWord('DIENST')).toBe(false);
	});

	it('tolerates a plain-text body without a trailing newline', async () => {
		const d = await freshDictionary();
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(new Response('BOESE\nHUNDE')))
		);
		await d.loadDictionary('/dict');
		expect(d.isWord('HUNDE')).toBe(true); // last line — an infinite loop before the guard
		expect(d.isWord('BOESE')).toBe(true);
	});

	it('binary-searches first, last and prefix lines of the sorted text', async () => {
		const d = await freshDictionary();
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(new Response('KATZ\nKATZE\nMAUS\n')))
		);
		await d.loadDictionary('/dict');
		expect(d.isWord('KATZ')).toBe(true); // first line
		expect(d.isWord('KATZE')).toBe(true); // prefix of another line
		expect(d.isWord('MAUS')).toBe(true); // last line
		expect(d.isWord('KAT')).toBe(false); // prefix of the first line
		expect(d.isWord('KATZEN')).toBe(false); // longer than every line
		expect(d.isWord('LATSCH')).toBe(false); // strictly between lines
	});

	it('rejects a failed fetch and can retry afterwards', async () => {
		const d = await freshDictionary();
		const fetchSpy = vi
			.fn()
			.mockResolvedValueOnce(new Response('down', { status: 503 }))
			.mockResolvedValueOnce(new Response('HUNDE\n'));
		vi.stubGlobal('fetch', fetchSpy);
		await expect(d.loadDictionary('/dict')).rejects.toThrow(/fetch failed \(503\)/);
		await d.loadDictionary('/dict');
		expect(fetchSpy).toHaveBeenCalledTimes(2);
		expect(d.isWord('HUNDE')).toBe(true);
	});

	it('explains an unfetched Git LFS pointer instead of failing to gunzip', async () => {
		const d = await freshDictionary();
		vi.stubGlobal(
			'fetch',
			vi.fn(() =>
				Promise.resolve(
					new Response('version https://git-lfs.github.com/spec/v1\noid sha256:abc\nsize 6411029')
				)
			)
		);
		await expect(d.loadDictionary('/dict')).rejects.toThrow(/git lfs pull/);
	});
});

describe('loadDictionary(url, letters) — board-filtered', () => {
	// Cells 0–4 spell HUNDE as a row; the rest of the board is Q.
	const boardA = `HUNDE${'Q'.repeat(43)}`;
	const boardB = `MAUS${'Q'.repeat(44)}`;
	// Sorted: HUNDE < HUNDEE (prefix) < HUNED (D < E at index 3).
	const body = 'HUNDE\nHUNDEE\nHUNED\nMAUS\nQQQQ\nQQQQQ\n';

	it('keeps only words a path on the board can spell', async () => {
		const d = await freshDictionary();
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(new Response(body)))
		);
		await d.loadDictionary('/dict', boardA);
		expect(d.isWord('HUNDE')).toBe(true); // traced along cells 0→1→2→3→4
		expect(d.isWord('QQQQ')).toBe(true);
		expect(d.isWord('QQQQQ')).toBe(true);
		expect(d.isWord('HUNED')).toBe(false); // letters all fit, but E is not adjacent to N
		expect(d.isWord('HUNDEE')).toBe(false); // second E exceeds the board's count
		expect(d.isWord('MAUS')).toBe(false); // no M on the board
	});

	it('fetches once for concurrent and repeat loads with the same letters', async () => {
		const d = await freshDictionary();
		const fetchSpy = vi.fn(() => Promise.resolve(new Response(body)));
		vi.stubGlobal('fetch', fetchSpy);
		await Promise.all([d.loadDictionary('/dict', boardA), d.loadDictionary('/dict', boardA)]);
		await d.loadDictionary('/dict', boardA);
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(d.isWord('HUNDE')).toBe(true);
	});

	it('re-fetches and rebuilds when the letters change', async () => {
		const d = await freshDictionary();
		const fetchSpy = vi.fn(() => Promise.resolve(new Response(body)));
		vi.stubGlobal('fetch', fetchSpy);
		await d.loadDictionary('/dict', boardA);
		await d.loadDictionary('/dict', boardB);
		expect(fetchSpy).toHaveBeenCalledTimes(2); // the dropped text cannot be re-filtered
		expect(d.isWord('MAUS')).toBe(true);
		expect(d.isWord('HUNDE')).toBe(false); // rebuilt for boardB, not boardA
		expect(d.isWord('QQQQ')).toBe(true);
	});

	it('re-fetches the full list when letters are omitted after a filtered load', async () => {
		const d = await freshDictionary();
		const fetchSpy = vi.fn(() => Promise.resolve(new Response(body)));
		vi.stubGlobal('fetch', fetchSpy);
		await d.loadDictionary('/dict', boardA);
		await d.loadDictionary('/dict');
		expect(fetchSpy).toHaveBeenCalledTimes(2);
		expect(d.isWord('HUNDEE')).toBe(true); // full text again: E×2 needs no board
		expect(d.isWord('HUNED')).toBe(true);
	});

	it('filters a held full list in place when letters arrive later', async () => {
		const d = await freshDictionary();
		const fetchSpy = vi.fn(() => Promise.resolve(new Response(body)));
		vi.stubGlobal('fetch', fetchSpy);
		await d.loadDictionary('/dict');
		await d.loadDictionary('/dict', boardA);
		expect(fetchSpy).toHaveBeenCalledTimes(1); // the text is still in hand — no re-download
		expect(d.isWord('HUNDE')).toBe(true);
		expect(d.isWord('HUNED')).toBe(false);
		expect(d.isWord('HUNDEE')).toBe(false);
	});

	it('settles concurrent loads of different letters, each with its own shape', async () => {
		const d = await freshDictionary();
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(new Response(body)))
		);
		await Promise.all([d.loadDictionary('/dict', boardA), d.loadDictionary('/dict', boardB)]);
		expect(d.isWord('MAUS')).toBe(true); // boardB, the load that finished last
		expect(d.isWord('HUNDE')).toBe(false);
	});

	it('keeps the last line of a newline-less body in board mode', async () => {
		const d = await freshDictionary();
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(new Response('HUNDE')))
		);
		await d.loadDictionary('/dict', boardA);
		expect(d.isWord('HUNDE')).toBe(true); // last line — an infinite loop without the guard
	});

	it("answers the issue's Done-when questions for the fixture board on the real asset", async () => {
		const d = await freshDictionary();
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(new Response(asset)))
		);
		await d.loadDictionary('/dictionary.txt.gz', validPuzzle().letters);
		for (const word of THEME_WORDS) expect(d.isWord(word)).toBe(true); // rows are paths
		expect(d.isWord('ADER')).toBe(true); // traceable fill word
		expect(d.isWord('HUNDE')).toBe(false); // in the dictionary, letters fit — no path spells it
		expect(d.isWord('AACHEN')).toBe(false); // likewise (first line of the asset)
		expect(d.isWord('PARK')).toBe(false); // the board has no P at all
	});
});

describe('committed asset static/dictionary.txt.gz', () => {
	it('is gzip data, not an unfetched LFS pointer', () => {
		expect(asset.subarray(0, 2).toString('hex')).toBe('1f8b');
	});

	it('is newline-terminated A–Z text without CR or empty lines', () => {
		const body = text();
		expect(body.endsWith('\n')).toBe(true);
		expect(body).not.toContain('\r');
		expect(lines().every((w) => w.length > 0)).toBe(true);
	});

	// Count and byte length are the freshness fingerprint of the generated asset:
	// a pipeline change must update them here, deliberately, together with a regeneration.
	it('holds 2,150,606 strictly increasing words of 4+ letters', () => {
		const words = lines();
		expect(words.length).toBe(2_150_606);
		let violations = 0;
		for (let i = 0; i < words.length; i++) {
			if (!/^[A-Z]{4,}$/.test(words[i])) violations++;
			if (i > 0 && words[i] <= words[i - 1]) violations++;
		}
		expect(violations).toBe(0);
	});

	it('has 34,176,843 bytes of raw content', () => {
		expect(Buffer.byteLength(text())).toBe(34_176_843);
	});
});
