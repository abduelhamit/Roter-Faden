import { describe, expect, it } from 'vitest';
import {
	THEME_WORDS,
	duplicateBesserPuzzle,
	duplicateFadenPuzzle,
	testIsWord,
	validPuzzle
} from './fixtures.js';
import type { Puzzle } from './model.js';
import {
	checkAdjacency,
	checkCoverage,
	checkCrossings,
	checkFadenEdges,
	validatePuzzle,
	type Violation
} from './validate.js';

const violationsOf = (puzzle: Puzzle, isWord = testIsWord): Violation[] => {
	const result = validatePuzzle(puzzle, isWord);
	expect(result.ok).toBe(false);
	return result.ok ? [] : result.violations;
};

const expectViolation = (violations: Violation[], expected: Violation): void => {
	expect(violations).toContainEqual(expected);
};

const puzzleRow = { kind: 'puzzle' } as const;
const fadenRow = { kind: 'faden' } as const;
const wordRow = (index: number): Violation['subject'] => ({ kind: 'word', index });

describe('validatePuzzle', () => {
	it('accepts the fixture (proves every rule passes on it)', () => {
		expect(validatePuzzle(validPuzzle(), testIsWord)).toEqual({ ok: true });
	});

	describe('structure', () => {
		it('rejects letters that are not exactly 48 × A–Z', () => {
			const violation: Violation = {
				rule: 'structure',
				message: 'Die Buchstaben müssen genau 48 Großbuchstaben A–Z sein.',
				cells: [],
				subject: puzzleRow
			};
			expectViolation(violationsOf({ ...validPuzzle(), letters: 'Z'.repeat(47) }), violation);
			expectViolation(violationsOf({ ...validPuzzle(), letters: 'z'.repeat(48) }), violation);
		});

		it('rejects out-of-range cell indices', () => {
			const violation: Violation = {
				rule: 'structure',
				message: 'Zellindizes müssen ganze Zahlen zwischen 0 und 47 sein.',
				cells: [],
				subject: puzzleRow
			};
			expectViolation(violationsOf({ ...validPuzzle(), faden: [48] }), violation);
			expectViolation(violationsOf({ ...validPuzzle(), words: [[0, 1, 2, 3, 4, 48]] }), violation);
		});
	});

	describe('rule 1: adjacency and cell reuse', () => {
		it('rejects a path that jumps over a cell', () => {
			const puzzle = validPuzzle();
			puzzle.words[0] = [0, 2, 3, 4, 5, 6];
			expectViolation(violationsOf(puzzle), {
				rule: 'adjacency',
				message: 'Themenwort 1 ist nicht benachbart (Zelle 0 → 2).',
				cells: [0, 2],
				subject: wordRow(0)
			});
		});

		it('rejects a faden that jumps over a cell', () => {
			const puzzle = validPuzzle();
			puzzle.faden = [36, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 37];
			expectViolation(violationsOf(puzzle), {
				rule: 'adjacency',
				message: 'Roter Faden ist nicht benachbart (Zelle 36 → 38).',
				cells: [36, 38],
				subject: fadenRow
			});
		});

		it('rejects a path that visits a cell twice', () => {
			const puzzle = validPuzzle();
			puzzle.words[0] = [0, 1, 2, 3, 4, 1];
			expectViolation(violationsOf(puzzle), {
				rule: 'adjacency',
				message: 'Themenwort 1 verwendet Zelle 1 mehrfach.',
				cells: [1],
				subject: wordRow(0)
			});
		});
	});

	describe('rule 2: crossings', () => {
		it('rejects an X inside one path', () => {
			const puzzle = validPuzzle();
			// 0→7 and 1→6 are both diagonals of the 2×2 block 0/1/6/7
			puzzle.words[0] = [0, 7, 1, 6, 5, 4];
			expectViolation(violationsOf(puzzle), {
				rule: 'crossing',
				message: 'Linien kreuzen sich in einem 2×2-Block ab Zelle 0.',
				cells: [0, 1, 6, 7],
				subject: wordRow(0)
			});
		});

		it('rejects two theme words crossing each other', () => {
			const puzzle = validPuzzle();
			// words 1 and 2 walk both diagonals of the block 6/7/12/13
			puzzle.words[1] = [6, 13, 14, 15, 16, 17];
			puzzle.words[2] = [12, 7, 8, 9, 10, 11];
			expectViolation(violationsOf(puzzle), {
				rule: 'crossing',
				message: 'Linien kreuzen sich in einem 2×2-Block ab Zelle 6.',
				cells: [6, 7, 12, 13],
				subject: puzzleRow
			});
		});

		it('rejects the Roter Faden crossing a theme word', () => {
			const puzzle = validPuzzle();
			// word 3 walks 18–25, the faden walks 19–24: both diagonals of block 18/19/24/25
			puzzle.words[3] = [25, 18, 19, 20, 21, 22];
			puzzle.faden = [24, 19, 18, 12, 6, 0, 1, 2, 3, 4, 5];
			expectViolation(violationsOf(puzzle), {
				rule: 'crossing',
				message: 'Linien kreuzen sich in einem 2×2-Block ab Zelle 18.',
				cells: [18, 19, 24, 25],
				subject: puzzleRow
			});
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
			expectViolation(violationsOf(puzzle), {
				rule: 'coverage',
				message: 'Zelle 42 gehört zu keinem Pfad.',
				cells: [42],
				subject: puzzleRow
			});
		});

		it('rejects a cell claimed by two paths', () => {
			const puzzle = validPuzzle();
			puzzle.words[1] = [0, 7, 8, 9, 10, 11];
			expectViolation(violationsOf(puzzle), {
				rule: 'coverage',
				message: 'Zelle 0 gehört zu mehreren Pfaden.',
				cells: [0],
				subject: wordRow(1)
			});
		});
	});

	describe('rule 4: Roter Faden edges', () => {
		it('rejects a faden that touches no opposite edges', () => {
			const puzzle = validPuzzle();
			puzzle.faden = [14, 15, 16, 17];
			expectViolation(violationsOf(puzzle), {
				rule: 'faden-edges',
				message:
					'Der Roter Faden muss gegenüberliegende Ränder berühren (links+rechts oder oben+unten).',
				cells: [],
				subject: fadenRow
			});
		});

		it('accepts a faden spanning top+bottom (column 0, rows 0–7)', () => {
			const puzzle = validPuzzle();
			puzzle.faden = [0, 6, 12, 18, 24, 30, 36, 42];
			// coverage complains (the old faden cells are free now), but the edge rule holds
			const edgeViolations = checkFadenEdges(puzzle);
			expect(edgeViolations).toEqual([]);
		});
	});

	describe('rule 5: word length', () => {
		it('rejects a word shorter than 4 letters', () => {
			const puzzle = validPuzzle();
			puzzle.words[0] = [0, 1, 2];
			expectViolation(violationsOf(puzzle), {
				rule: 'word-length',
				message: 'Themenwort 1 hat weniger als 4 Buchstaben.',
				cells: [0, 1, 2],
				subject: wordRow(0)
			});
		});
	});

	describe('rule 6: at least one theme word', () => {
		it('rejects a puzzle without theme words', () => {
			expectViolation(violationsOf({ ...validPuzzle(), words: [] }), {
				rule: 'word-count',
				message: 'Mindestens ein Themenwort ist erforderlich.',
				cells: [],
				subject: puzzleRow
			});
		});
	});

	describe('rule 7: dictionary', () => {
		it('rejects a word the dictionary does not know', () => {
			expectViolation(
				violationsOf(validPuzzle(), (w) => w !== 'ZUCKER'),
				{
					rule: 'dictionary',
					message: '„ZUCKER“ kommt nicht im Wörterbuch vor.',
					cells: [12, 13, 14, 15, 16, 17],
					subject: wordRow(2)
				}
			);
		});

		it('never asks the dictionary about the Roter Faden', () => {
			const asked: string[] = [];
			const result = validatePuzzle(validPuzzle(), (word) => {
				asked.push(word);
				return true;
			});
			expect(result.ok).toBe(true);
			// dictionary and uniqueness each ask once per word; a Set lookup makes that cheap
			expect(new Set(asked)).toEqual(new Set(THEME_WORDS));
		});
	});

	describe('rule 8: uniqueness', () => {
		it('rejects a second spelling of BESSER over a different group', () => {
			expectViolation(violationsOf(duplicateBesserPuzzle()), {
				rule: 'uniqueness',
				message: '„BESSER“ ist auch mit anderen Feldern bildbar.',
				cells: [0, 1, 2, 3, 4, 5],
				subject: wordRow(0)
			});
		});

		it('skips the uniqueness search once the dictionary rejected the word', () => {
			// the search is exponential, so it must never run for a word that is not a word
			const violations = violationsOf(duplicateBesserPuzzle(), (w) => w !== 'BESSER');
			expectViolation(violations, {
				rule: 'dictionary',
				message: '„BESSER“ kommt nicht im Wörterbuch vor.',
				cells: [0, 1, 2, 3, 4, 5],
				subject: wordRow(0)
			});
			// only BESSER was rejected — SCHLAF still reports its own second spelling here
			expect(violations.some((v) => v.rule === 'uniqueness' && v.message.includes('BESSER'))).toBe(
				false
			);
		});

		it('rejects a second spelling of the faden over a different group', () => {
			const puzzle = duplicateFadenPuzzle();
			expectViolation(violationsOf(puzzle), {
				rule: 'uniqueness',
				message: 'Der Roter Faden ist auch mit anderen Feldern bildbar.',
				cells: puzzle.faden,
				subject: fadenRow
			});
		});

		it('accepts the many orderings of one group (BESSER with two E and two S)', () => {
			expect(validatePuzzle(validPuzzle(), testIsWord).ok).toBe(true);
		});
	});

	describe('individual checks', () => {
		it('run on a partial draft’s paths', () => {
			const partial: Puzzle = {
				clue: '',
				letters: 'A'.repeat(48),
				words: [[0, 1, 2, 3, 4, 5]],
				faden: [36, 37, 38, 39, 40, 41, 47, 46, 45, 44, 43, 42]
			};
			expect(checkAdjacency(partial)).toEqual([]);
			expect(checkCrossings(partial)).toEqual([]);
			// the 30 cells between the two drawn rows are still free
			expect(checkCoverage(partial)).toEqual(
				Array.from({ length: 30 }, (_, i): Violation => ({
					rule: 'coverage',
					message: `Zelle ${i + 6} gehört zu keinem Pfad.`,
					cells: [i + 6],
					subject: puzzleRow
				}))
			);
		});
	});
});
