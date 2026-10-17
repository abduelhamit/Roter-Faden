import type { Puzzle } from './model.js';

/** The six theme words of `validPuzzle`, derived from letters along the row paths. */
export const THEME_WORDS = ['BESSER', 'DIENST', 'ZUCKER', 'MONTAG', 'WEINEN', 'SCHLAF'] as const;

/** Dictionary stub until the real one arrives with issue #5. */
export const testIsWord = (word: string): boolean =>
	(THEME_WORDS as readonly string[]).includes(word);

/**
 * A puzzle that passes every rule of validatePuzzle: six 6-letter theme words as
 * rows, the Roter Faden covering the bottom two rows (left+right edges).
 * Verified: no word can be spelled with a different cell group on this grid.
 */
export function validPuzzle(): Puzzle {
	return {
		clue: 'Zeit, die alles heilt',
		letters: 'BESSERDIENSTZUCKERMONTAGWEINENSCHLAFRMGDRMERZYEI',
		words: [
			[0, 1, 2, 3, 4, 5],
			[6, 7, 8, 9, 10, 11],
			[12, 13, 14, 15, 16, 17],
			[18, 19, 20, 21, 22, 23],
			[24, 25, 26, 27, 28, 29],
			[30, 31, 32, 33, 34, 35]
		],
		faden: [36, 37, 38, 39, 40, 41, 47, 46, 45, 44, 43, 42]
	};
}

/**
 * Same puzzle, but row 6 spells BESSER as well — rule 8 must reject it. The new letters
 * also give SCHLAF a second spelling (38→31→32→33→34→35), so assert per word, not globally.
 */
export function duplicateBesserPuzzle(): Puzzle {
	return { ...validPuzzle(), letters: 'BESSERDIENSTZUCKERMONTAGWEINENSCHLAFBESSERERZYEI' };
}

/**
 * Same puzzle, but the bottom two rows repeat WEINEN and SCHLAF, and the faden snakes
 * back through row 6 — its text NENIEWSCHLAF is also spelled by the two word rows
 * (29→24→30→35). Rule 8 must reject it. The repeated words break uniqueness themselves,
 * so assert the faden message, not the error count.
 */
export function duplicateFadenPuzzle(): Puzzle {
	return {
		...validPuzzle(),
		letters: 'BESSERDIENSTZUCKERMONTAGWEINENSCHLAFWEINENSCHLAF',
		faden: [41, 40, 39, 38, 37, 36, 42, 43, 44, 45, 46, 47]
	};
}
