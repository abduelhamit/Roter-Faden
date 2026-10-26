import { describe, expect, it, vi } from 'vitest';
import { testIsWord, validPuzzle } from './fixtures.js';
import {
	addWord,
	checkDraft,
	createDraft,
	draftLetters,
	removeWord,
	setClue,
	setRowPath,
	setRowText,
	type Draft,
	type DraftProblem
} from './draft.js';
import type { RowSubject } from './model.js';
import { validatePuzzle } from './validate.js';

const faden: RowSubject = { kind: 'faden' };
const word = (index: number): RowSubject => ({ kind: 'word', index });

/** A draft with a clue and the faden's text and path; a null path leaves it undrawn. */
const withFaden = (text: string, path: number[] | null): Draft =>
	setRowPath(setRowText(setClue(createDraft(), 'Zeit'), faden, text), faden, path);

describe('createDraft', () => {
	it('starts empty with a stable id', () => {
		const draft = createDraft();
		expect(draft.id).toEqual(expect.any(String));
		expect(draft.id).not.toBe('');
		expect(draft.clue).toBe('');
		expect(draft.faden).toEqual({ text: '', path: null });
		expect(draft.words).toEqual([]);
		expect(createDraft().id).not.toBe(draft.id);
	});

	it('keeps the id through edits', () => {
		const draft = createDraft();
		const edited = setRowPath(
			setRowText(setClue(draft, 'Zeit'), faden, 'ROT'),
			faden,
			[42, 43, 44]
		);
		expect(edited.id).toBe(draft.id);
	});

	it('refreshes the time on every edit', () => {
		vi.useFakeTimers();
		try {
			const created = createDraft();
			const later = created.changedAt + 1000;
			vi.setSystemTime(later);
			expect(setClue(created, 'Zeit').changedAt).toBe(later);
			expect(setRowText(created, faden, 'ROT').changedAt).toBe(later);
			expect(setRowPath(created, faden, [0]).changedAt).toBe(later);
			expect(addWord(created, 'BESSER').changedAt).toBe(later);
			expect(removeWord(addWord(created, 'BESSER'), 0).changedAt).toBe(later);
		} finally {
			vi.useRealTimers();
		}
	});
});

describe('draftLetters', () => {
	it('writes a theme word and the Roter Faden in path order', () => {
		let draft = addWord(createDraft(), 'BESSER');
		draft = setRowPath(draft, word(0), [5, 4, 3, 2, 1, 0]);
		draft = setRowText(draft, faden, 'ROT');
		draft = setRowPath(draft, faden, [47, 46, 45]);
		const letters = draftLetters(draft);
		expect(letters).toHaveLength(48);
		expect(letters.slice(0, 6)).toBe('RESSEB');
		expect(letters.slice(45, 48)).toBe('TOR');
	});

	it('leaves unclaimed cells and cells past a row’s text blank', () => {
		let draft = addWord(createDraft(), 'AB');
		draft = setRowPath(draft, word(0), [0, 1, 2, 3]);
		const letters = draftLetters(draft);
		expect(letters.slice(0, 4)).toBe('AB  ');
		expect(letters.slice(4)).toBe(' '.repeat(44));
	});

	it('ignores cells outside the grid instead of stretching the string', () => {
		let draft = addWord(createDraft(), 'ROT');
		draft = setRowPath(draft, word(0), [47, 99, -1]);
		const letters = draftLetters(draft);
		expect(letters).toHaveLength(48);
		expect(letters[47]).toBe('R');
	});

	it('keeps the first letter when paths share a cell', () => {
		let draft = addWord(addWord(createDraft(), 'AB'), 'CD');
		draft = setRowPath(draft, word(0), [5, 6]);
		draft = setRowPath(draft, word(1), [5, 7]);
		const letters = draftLetters(draft);
		expect(letters[5]).toBe('A');
		expect(letters[6]).toBe('B');
		expect(letters[7]).toBe('D');
	});

	it('lets the faden keep a cell it shares with a word', () => {
		let draft = setRowText(createDraft(), faden, 'R');
		draft = addWord(draft, 'A');
		draft = setRowPath(draft, faden, [5]);
		draft = setRowPath(draft, word(0), [5]);
		expect(draftLetters(draft)[5]).toBe('R');
	});

	it('leaves a cell free when the first path’s text ends there', () => {
		let draft = addWord(addWord(createDraft(), 'A'), 'B');
		draft = setRowPath(draft, word(0), [5, 6]);
		draft = setRowPath(draft, word(1), [6]);
		expect(draftLetters(draft)[6]).toBe('B');
	});
});

describe('text entry', () => {
	it('folds umlauts and ß in the faden and in theme words', () => {
		let draft = setRowText(createDraft(), faden, 'Über die Straße');
		expect(draft.faden.text).toBe('UEBERDIESTRASSE');
		draft = addWord(draft, '  groß  ');
		expect(draft.words[0].text).toBe('GROSS');
	});

	it('keeps the clue as free German text', () => {
		const draft = setClue(createDraft(), 'Grüße aus Köln & Straße');
		expect(draft.clue).toBe('Grüße aus Köln & Straße');
	});

	it('folds a theme word’s text set after it was added', () => {
		const draft = setRowText(addWord(createDraft(), 'BESSER'), word(0), ' über groß ');
		expect(draft.words[0].text).toBe('UEBERGROSS');
	});

	it('adds a row even when the word normalizes to nothing', () => {
		expect(addWord(createDraft(), ' !!! ').words).toEqual([{ text: '', path: null }]);
	});
});

describe('removeWord', () => {
	it('frees the deleted word’s cells and letters', () => {
		let draft = addWord(addWord(createDraft(), 'BESSER'), 'DIENST');
		draft = setRowPath(draft, word(0), [0, 1, 2, 3, 4, 5]);
		draft = setRowPath(draft, word(1), [6, 7, 8, 9, 10, 11]);
		expect(draftLetters(draft).slice(0, 12)).toBe('BESSERDIENST');
		const without = removeWord(draft, 0);
		expect(without.words.map((row) => row.text)).toEqual(['DIENST']);
		expect(draftLetters(without).slice(0, 12)).toBe('      DIENST');
	});
});

describe('checkDraft', () => {
	const expectProblem = (draft: Draft, expected: DraftProblem) =>
		expect(checkDraft(draft)).toContainEqual(expected);

	it('reports an empty clue and the undrawn faden on a new draft', () => {
		expect(checkDraft(createDraft())).toEqual([
			{
				rule: 'empty-clue',
				message: 'Der Hinweis fehlt.',
				cells: [],
				subject: { kind: 'puzzle' }
			},
			{
				rule: 'missing-path',
				message: 'Roter Faden hat noch keinen Pfad.',
				cells: [],
				subject: faden
			}
		]);
	});

	it('reports a listed theme word without a path on that word', () => {
		const draft = addWord(setClue(createDraft(), 'Zeit'), 'BESSER');
		expectProblem(draft, {
			rule: 'missing-path',
			message: 'Themenwort 1 hat noch keinen Pfad.',
			cells: [],
			subject: word(0)
		});
	});

	it('treats an empty path as undrawn, like a missing one', () => {
		const draft = withFaden('', []);
		expectProblem(draft, {
			rule: 'missing-path',
			message: 'Roter Faden hat noch keinen Pfad.',
			cells: [],
			subject: faden
		});
	});

	it('still reports a length mismatch against an empty path', () => {
		expect(checkDraft(withFaden('ROT', []))).toContainEqual({
			rule: 'length-mismatch',
			message: 'Roter Faden hat 3 Buchstaben, der Pfad aber 0 Zellen.',
			cells: [],
			subject: faden
		});
	});

	it('re-raises missing-path once a drawn path is cleared', () => {
		const draft = setRowPath(withFaden('ROT', [42, 43, 44]), faden, null);
		expectProblem(draft, {
			rule: 'missing-path',
			message: 'Roter Faden hat noch keinen Pfad.',
			cells: [],
			subject: faden
		});
	});

	it('reports a text length that differs from the path length with the path’s cells', () => {
		const draft = withFaden('ROT', [42, 43, 44, 45]);
		expectProblem(draft, {
			rule: 'length-mismatch',
			message: 'Roter Faden hat 3 Buchstaben, der Pfad aber 4 Zellen.',
			cells: [42, 43, 44, 45],
			subject: faden
		});
	});

	it('reports a theme word’s length mismatch on that word', () => {
		const draft = setRowPath(addWord(withFaden('ROT', [42, 43, 44]), 'BESSER'), word(0), [0, 1, 2]);
		expectProblem(draft, {
			rule: 'length-mismatch',
			message: 'Themenwort 1 hat 6 Buchstaben, der Pfad aber 3 Zellen.',
			cells: [0, 1, 2],
			subject: word(0)
		});
	});

	it('is quiet once every row has a path that matches its text', () => {
		let draft = withFaden('ROT', [42, 43, 44]);
		draft = addWord(draft, 'BESSER');
		draft = setRowPath(draft, word(0), [0, 1, 2, 3, 4, 5]);
		expect(checkDraft(draft)).toEqual([]);
	});

	it('stays out of validation, which has no opinion on the clue', () => {
		expect(validatePuzzle({ ...validPuzzle(), clue: '' }, testIsWord)).toEqual({ ok: true });
	});
});
