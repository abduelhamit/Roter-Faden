import { describe, expect, it } from 'vitest';
import { validPuzzle } from './fixtures.js';
import { cellsEqual, isAdjacent, isPuzzleShape, normalizeText, spellPath } from './model.js';

describe('normalizeText', () => {
	it('uppercases and expands umlauts', () => {
		expect(normalizeText('grüße')).toBe('GRUESSE');
		expect(normalizeText('Ärmel, Öl, Übermut')).toBe('AERMELOELUEBERMUT');
		// capital ẞ survives uppercasing, so normalizeText has to write it out itself
		expect(normalizeText('STRAẞE')).toBe('STRASSE');
	});

	it('keeps only A–Z', () => {
		expect(normalizeText('straße!')).toBe('STRASSE');
		expect(normalizeText('Haus 4')).toBe('HAUS');
		expect(normalizeText('')).toBe('');
	});
});

describe('isAdjacent', () => {
	it('accepts horizontal, vertical and diagonal steps', () => {
		expect(isAdjacent(0, 1)).toBe(true);
		expect(isAdjacent(0, 6)).toBe(true);
		expect(isAdjacent(0, 7)).toBe(true);
		expect(isAdjacent(5, 4)).toBe(true);
	});

	it('rejects knight moves, same cell and wrap-around', () => {
		expect(isAdjacent(0, 0)).toBe(false);
		expect(isAdjacent(0, 13)).toBe(false);
		expect(isAdjacent(5, 6)).toBe(false); // end of row 0 to start of row 1
		expect(isAdjacent(11, 12)).toBe(false); // end of row 1 to start of row 2
	});
});

describe('cellsEqual', () => {
	it('is order-free', () => {
		expect(cellsEqual([1, 2, 3], [3, 1, 2])).toBe(true);
		expect(cellsEqual([1, 2, 3], [1, 2, 4])).toBe(false);
		expect(cellsEqual([1, 2], [1, 2, 3])).toBe(false);
		expect(cellsEqual([1, 2, 2], [1, 2, 3])).toBe(false); // repeated cell never matches
		expect(cellsEqual([1, 2, 3], [1, 2, 2])).toBe(false); // …in either argument
	});
});

describe('spellPath', () => {
	it('reads letters along the path and treats out-of-range cells as empty', () => {
		expect(spellPath('ABCDEF', [0, 1, 5])).toBe('ABF');
		expect(spellPath('AB', [0, 1, 47])).toBe('AB');
	});
});

describe('isPuzzleShape', () => {
	it('accepts the fixture', () => {
		expect(isPuzzleShape(validPuzzle())).toBe(true);
	});

	it('rejects broken grids, indices and types', () => {
		expect(isPuzzleShape({ ...validPuzzle(), letters: 'Z'.repeat(47) })).toBe(false);
		expect(isPuzzleShape({ ...validPuzzle(), letters: 'z'.repeat(48) })).toBe(false);
		expect(isPuzzleShape({ ...validPuzzle(), words: [[48]] })).toBe(false);
		expect(isPuzzleShape({ ...validPuzzle(), words: [[1.5]] })).toBe(false);
		expect(isPuzzleShape({ ...validPuzzle(), faden: 'nope' })).toBe(false);
		expect(isPuzzleShape(null)).toBe(false);
		expect(isPuzzleShape('v1.abc')).toBe(false);
	});
});
