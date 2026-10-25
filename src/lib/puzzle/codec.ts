import { roterfaden } from './puzzle.pb.js';
import { isPuzzleShape, type Puzzle } from './model.js';

const VERSION = 'v1.';

/**
 * Static 256-bit AES-GCM key, public by design: Web Crypto runs in the browser,
 * so anyone with the bundle can decrypt. This stops casual spoilers when a URL is
 * shared, not a determined attacker — which is exactly the threat model of issue #4.
 */
export const KEY = Uint8Array.from(
	'ad0b29a19aecd44c09954de5cb0d6d41ea93fc07d8c7a294a560aa4f266f7a39'
		.match(/../g)!
		.map((byte) => parseInt(byte, 16))
);

/** Everything the codec refuses: broken URLs, failed decryption, structurally invalid puzzles. */
export class PuzzleError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PuzzleError';
	}
}

/**
 * Puzzle → `v1.<base64url>` (no '#'): protobuf → AES-GCM → base64url.
 * The IV is derived from the plaintext, so the same puzzle always yields the same
 * URL — and two different plaintexts can never share an IV, which is what GCM needs.
 * Word order is canonical: decoding returns the words sorted by path, so an unsorted
 * puzzle does not round-trip unchanged.
 */
export async function encodePuzzle(puzzle: Puzzle): Promise<string> {
	if (!isPuzzleShape(puzzle)) throw new PuzzleError('Ungültiges Puzzle.');
	// Canonical word order, so any permutation of the same puzzle encodes identically.
	const words = [...puzzle.words].sort((a, b) => {
		for (let i = 0; i < Math.min(a.length, b.length); i++) {
			if (a[i] !== b[i]) return a[i] - b[i];
		}
		return a.length - b.length;
	});
	const plain = Uint8Array.from(
		roterfaden.Puzzle.encode(
			roterfaden.Puzzle.create({
				clue: puzzle.clue,
				letters: puzzle.letters,
				words: words.map((path) => ({ path })),
				faden: puzzle.faden
			})
		).finish()
	);
	const iv = new Uint8Array(await crypto.subtle.digest('SHA-256', plain)).slice(0, 12);
	const cipher = new Uint8Array(
		await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await importKey(), plain)
	);
	return VERSION + toBase64Url(new Uint8Array([...iv, ...cipher]));
}

/**
 * `#v1.…` or `v1.…` back to a puzzle; throws PuzzleError on broken URLs and on anything
 * not structurally sound (48 uppercase letters, whole cell indices). Game rules are not
 * checked here: a crafted URL can carry coverage, crossing or dictionary violations, and
 * the game must accept them — `validatePuzzle` belongs to the editor alone (the
 * uniqueness search is exponential).
 */
export async function decodePuzzle(anchor: string): Promise<Puzzle> {
	const data = anchor.startsWith('#') ? anchor.slice(1) : anchor;
	if (!data.startsWith(VERSION)) throw new PuzzleError('Unbekannte URL-Version.');

	let bytes: Uint8Array;
	try {
		bytes = fromBase64Url(data.slice(VERSION.length));
	} catch {
		throw new PuzzleError('URL ist beschädigt.');
	}
	if (bytes.length <= 12 + 16) throw new PuzzleError('URL ist beschädigt.');

	let plain: Uint8Array;
	try {
		plain = new Uint8Array(
			await crypto.subtle.decrypt(
				{ name: 'AES-GCM', iv: bytes.slice(0, 12) },
				await importKey(),
				bytes.slice(12)
			)
		);
	} catch {
		throw new PuzzleError('URL ist beschädigt.');
	}

	let message: roterfaden.Puzzle;
	try {
		message = roterfaden.Puzzle.decode(plain);
	} catch {
		throw new PuzzleError('URL ist beschädigt.');
	}
	const puzzle: Puzzle = {
		clue: message.clue,
		letters: message.letters,
		words: message.words.map((word) => [...(word.path ?? [])]),
		faden: [...message.faden]
	};
	if (!isPuzzleShape(puzzle)) throw new PuzzleError('URL enthält ein ungültiges Puzzle.');
	return puzzle;
}

async function importKey(): Promise<CryptoKey> {
	return crypto.subtle.importKey('raw', KEY, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

function toBase64Url(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(data: string): Uint8Array {
	const binary = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}
