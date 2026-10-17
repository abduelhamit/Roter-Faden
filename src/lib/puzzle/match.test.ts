import { describe, expect, it } from 'vitest';
import { validPuzzle } from './fixtures.js';
import { matchFaden, matchWord } from './match.js';

describe('matchWord', () => {
	it("matches the theme word's own cells in the editor's order", () => {
		expect(matchWord(validPuzzle(), [0, 1, 2, 3, 4, 5])).toBe('BESSER');
		expect(matchWord(validPuzzle(), [12, 13, 14, 15, 16, 17])).toBe('ZUCKER');
	});

	it('matches the swapped E/S orders inside the BESSER group', () => {
		const puzzle = validPuzzle();
		// cells 1/4 are the two E, cells 2/3 the two S — every order spells BESSER
		expect(matchWord(puzzle, [0, 4, 3, 2, 1, 5])).toBe('BESSER');
		expect(matchWord(puzzle, [0, 1, 3, 2, 4, 5])).toBe('BESSER');
	});

	it('rejects an order that spells something else over the same cells', () => {
		expect(matchWord(validPuzzle(), [0, 1, 2, 3, 5, 4])).toBeNull(); // BESSRE
	});

	it('rejects partial and word paths', () => {
		expect(matchWord(validPuzzle(), [0, 1, 2])).toBeNull();
		expect(matchWord(validPuzzle(), validPuzzle().faden)).toBeNull();
	});
});

describe('matchFaden', () => {
	it('matches the faden path, but not its reversed spelling', () => {
		const puzzle = validPuzzle();
		expect(matchFaden(puzzle, puzzle.faden)).toBe(true);
		expect(matchFaden(puzzle, [...puzzle.faden].reverse())).toBe(false); // spells it backwards
	});

	it('rejects subsets and other paths', () => {
		const puzzle = validPuzzle();
		expect(matchFaden(puzzle, puzzle.faden.slice(0, 6))).toBe(false);
		expect(matchFaden(puzzle, [0, 1, 2, 3, 4, 5])).toBe(false);
	});
});
