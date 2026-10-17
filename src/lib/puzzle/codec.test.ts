import { describe, expect, it } from 'vitest';
import { KEY, PuzzleError, decodePuzzle, encodePuzzle } from './codec.js';
import { THEME_WORDS, validPuzzle } from './fixtures.js';
import { roterfaden } from './puzzle.pb.js';

/** Encrypt arbitrary plaintext into a `v1.` URL, exactly like the encoder does. */
const craftUrl = async (bytes: Uint8Array): Promise<string> => {
	const plain = Uint8Array.from(bytes);
	const iv = new Uint8Array(await crypto.subtle.digest('SHA-256', plain)).slice(0, 12);
	const key = await crypto.subtle.importKey('raw', KEY, { name: 'AES-GCM' }, false, ['encrypt']);
	const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
	let binary = '';
	for (const byte of new Uint8Array([...iv, ...cipher])) binary += String.fromCharCode(byte);
	return 'v1.' + btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const expectRejected = async (anchor: string): Promise<void> => {
	await expect(decodePuzzle(anchor)).rejects.toThrow(PuzzleError);
};

describe('encodePuzzle/decodePuzzle', () => {
	it('round-trips a puzzle unchanged', async () => {
		const puzzle = validPuzzle();
		expect(await decodePuzzle(await encodePuzzle(puzzle))).toEqual(puzzle);
	});

	it('is deterministic: the same puzzle always yields the same URL', async () => {
		expect(await encodePuzzle(validPuzzle())).toBe(await encodePuzzle(validPuzzle()));
	});

	it('ignores word order: a permuted list yields the same URL and decodes canonicalized', async () => {
		const puzzle = validPuzzle();
		const permuted = { ...puzzle, words: [...puzzle.words].reverse() };
		expect(await encodePuzzle(permuted)).toBe(await encodePuzzle(puzzle));
		// the words come back sorted by path — an unsorted puzzle does not round-trip unchanged
		expect(await decodePuzzle(await encodePuzzle(permuted))).toEqual(puzzle);
	});

	it('produces a v1 URL that decodes with and without the # prefix', async () => {
		const url = await encodePuzzle(validPuzzle());
		expect(url).toMatch(/^v1\.[A-Za-z0-9_-]+$/);
		expect(await decodePuzzle(url)).toEqual(validPuzzle());
		expect(await decodePuzzle('#' + url)).toEqual(validPuzzle());
	});

	it('refuses to encode a puzzle that fails the shape guard', async () => {
		await expect(encodePuzzle({ ...validPuzzle(), letters: 'short' })).rejects.toThrow(PuzzleError);
	});

	it('keeps every theme word out of the URL and its base64url-decoded bytes', async () => {
		const url = await encodePuzzle(validPuzzle());
		const binary = atob(url.slice('v1.'.length).replace(/-/g, '+').replace(/_/g, '/'));
		for (const word of THEME_WORDS) {
			expect(url).not.toContain(word);
			expect(binary).not.toContain(word);
		}
	});

	describe('fails cleanly on broken or malicious input', () => {
		it('rejects non-v1 input', async () => {
			await expectRejected('garbage');
			await expectRejected('#v2.abc');
			await expectRejected('#');
		});

		it('rejects undecodable base64url', async () => {
			await expectRejected('#v1.');
			await expectRejected('#v1.!!!!');
		});

		it('rejects truncated or tampered ciphertext (GCM tag)', async () => {
			const url = await encodePuzzle(validPuzzle());
			await expectRejected(url.slice(0, -6));
			const flipped = url.slice(0, 10) + (url[10] === 'A' ? 'B' : 'A') + url.slice(11);
			await expectRejected(flipped);
		});

		it('rejects authenticated protobuf that is not a puzzle', async () => {
			const notAPuzzle = roterfaden.Puzzle.encode(
				roterfaden.Puzzle.create({ clue: 'x', letters: 'short', words: [], faden: [] })
			).finish();
			await expectRejected(await craftUrl(notAPuzzle));
		});

		it('rejects authenticated garbage bytes', async () => {
			await expectRejected(await craftUrl(new Uint8Array(40).fill(0xff)));
		});
	});
});
