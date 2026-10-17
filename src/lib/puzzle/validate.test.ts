import { describe, expect, it } from 'vitest';
import {
	THEME_WORDS,
	duplicateBesserPuzzle,
	duplicateFadenPuzzle,
	testIsWord,
	validPuzzle
} from './fixtures.js';
import type { Puzzle } from './model.js';
import { validatePuzzle } from './validate.js';

const errorsOf = (puzzle: Puzzle, isWord = testIsWord): string[] => {
	const result = validatePuzzle(puzzle, isWord);
	expect(result.ok).toBe(false);
	return result.ok ? [] : result.errors;
};

const expectError = (errors: string[], fragment: string): void => {
	expect(errors.some((e) => e.includes(fragment))).toBe(true);
};

describe('validatePuzzle', () => {
	it('accepts the fixture (proves every rule passes on it)', () => {
		expect(validatePuzzle(validPuzzle(), testIsWord)).toEqual({ ok: true });
	});

	describe('structure', () => {
		it('rejects letters that are not exactly 48 × A–Z', () => {
			expectError(
				errorsOf({ ...validPuzzle(), letters: 'Z'.repeat(47) }),
				'genau 48 Großbuchstaben'
			);
			expectError(
				errorsOf({ ...validPuzzle(), letters: 'z'.repeat(48) }),
				'genau 48 Großbuchstaben'
			);
		});

		it('rejects out-of-range cell indices', () => {
			expectError(errorsOf({ ...validPuzzle(), faden: [48] }), 'Zellindizes');
			expectError(errorsOf({ ...validPuzzle(), words: [[0, 1, 2, 3, 4, 48]] }), 'Zellindizes');
		});
	});

	describe('rule 1: adjacency and cell reuse', () => {
		it('rejects a path that jumps over a cell', () => {
			const puzzle = validPuzzle();
			puzzle.words[0] = [0, 2, 3, 4, 5, 6];
			expectError(errorsOf(puzzle), 'nicht benachbart (Zelle 0 → 2)');
		});

		it('rejects a path that visits a cell twice', () => {
			const puzzle = validPuzzle();
			puzzle.words[0] = [0, 1, 2, 3, 4, 1];
			expectError(errorsOf(puzzle), 'verwendet Zelle 1 mehrfach');
		});
	});

	describe('rule 2: crossings', () => {
		it('rejects an X inside one path', () => {
			const puzzle = validPuzzle();
			// 0→7 and 1→6 are both diagonals of the 2×2 block 0/1/6/7
			puzzle.words[0] = [0, 7, 1, 6, 5, 4];
			expectError(errorsOf(puzzle), 'Linien kreuzen sich');
		});

		it('rejects two theme words crossing each other', () => {
			const puzzle = validPuzzle();
			// words 1 and 2 walk both diagonals of the block 6/7/12/13
			puzzle.words[1] = [6, 13, 14, 15, 16, 17];
			puzzle.words[2] = [12, 7, 8, 9, 10, 11];
			expectError(errorsOf(puzzle), 'Linien kreuzen sich');
		});

		it('rejects the Roter Faden crossing a theme word', () => {
			const puzzle = validPuzzle();
			// word 3 walks 18–25, the faden walks 19–24: both diagonals of block 18/19/24/25
			puzzle.words[3] = [25, 18, 19, 20, 21, 22];
			puzzle.faden = [24, 19, 18, 12, 6, 0, 1, 2, 3, 4, 5];
			expectError(errorsOf(puzzle), 'Linien kreuzen sich');
		});

		it('accepts paths touching orthogonally (rows and the faden step do)', () => {
			// the fixture's rows sit directly above each other — contact, but no X
			expect(validatePuzzle(validPuzzle(), testIsWord).ok).toBe(true);
		});
	});

	describe('rule 3: coverage', () => {
		it('rejects an uncovered cell', () => {
			const puzzle = validPuzzle();
			puzzle.faden = [36, 37, 38, 39, 40, 41];
			expectError(errorsOf(puzzle), 'gehört zu keinem Pfad');
		});

		it('rejects a cell claimed by two paths', () => {
			const puzzle = validPuzzle();
			puzzle.words[1] = [0, 7, 8, 9, 10, 11];
			expectError(errorsOf(puzzle), 'gehört zu mehreren Pfaden');
		});
	});

	describe('rule 4: Roter Faden edges', () => {
		it('rejects a faden that touches no opposite edges', () => {
			const puzzle = validPuzzle();
			puzzle.faden = [14, 15, 16, 17];
			expectError(errorsOf(puzzle), 'gegenüberliegende Ränder');
		});

		it('accepts a faden spanning top+bottom (column 0, rows 0–7)', () => {
			const puzzle = validPuzzle();
			puzzle.faden = [0, 6, 12, 18, 24, 30, 36, 42];
			// coverage complains (the old faden cells are free now), but the edge rule holds
			const result = validatePuzzle(puzzle, testIsWord);
			const edgeErrors = result.ok
				? []
				: result.errors.filter((e) => e.includes('gegenüberliegende Ränder'));
			expect(edgeErrors).toEqual([]);
		});
	});

	describe('rule 5: word length', () => {
		it('rejects a word shorter than 4 letters', () => {
			const puzzle = validPuzzle();
			puzzle.words[0] = [0, 1, 2];
			expectError(errorsOf(puzzle), 'weniger als 4 Buchstaben');
		});
	});

	describe('rule 6: at least one theme word', () => {
		it('rejects a puzzle without theme words', () => {
			expectError(errorsOf({ ...validPuzzle(), words: [] }), 'Mindestens ein Themenwort');
		});
	});

	describe('rule 7: dictionary', () => {
		it('rejects a word the dictionary does not know', () => {
			expectError(
				errorsOf(validPuzzle(), (w) => w !== 'ZUCKER'),
				'kommt nicht im Wörterbuch vor'
			);
		});

		it('never asks the dictionary about the Roter Faden', () => {
			const asked: string[] = [];
			const result = validatePuzzle(validPuzzle(), (word) => {
				asked.push(word);
				return true;
			});
			expect(result.ok).toBe(true);
			expect(asked).toEqual([...THEME_WORDS]);
		});
	});

	describe('rule 8: uniqueness', () => {
		it('rejects a second spelling of BESSER over a different group', () => {
			expectError(
				errorsOf(duplicateBesserPuzzle()),
				'„BESSER“ ist auch mit anderen Feldern bildbar'
			);
		});

		it('skips the uniqueness search once the dictionary rejected the word', () => {
			// the search is exponential, so it must never run for a word that is not a word
			const errors = errorsOf(duplicateBesserPuzzle(), (w) => w !== 'BESSER');
			expectError(errors, 'kommt nicht im Wörterbuch vor');
			// only BESSER was rejected — SCHLAF still reports its own second spelling here
			expect(errors.some((e) => e.includes('anderen Feldern') && e.includes('BESSER'))).toBe(false);
		});

		it('rejects a second spelling of the faden over a different group', () => {
			expectError(
				errorsOf(duplicateFadenPuzzle()),
				'Der Roter Faden ist auch mit anderen Feldern bildbar'
			);
		});

		it('accepts the many orderings of one group (BESSER with two E and two S)', () => {
			expect(validatePuzzle(validPuzzle(), testIsWord).ok).toBe(true);
		});
	});
});
