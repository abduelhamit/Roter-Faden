import {
	CELL_COUNT,
	normalizeText,
	problem,
	rowLabel,
	withSubjects,
	type Problem,
	type RowSubject
} from './model.js';

/** One answer's row in the editor: its text and the path drawn for it, if any. */
export interface DraftRow {
	/** Normalized A–Z. May be shorter or longer than the path. */
	text: string;
	/** Drawn cells in order, or null while the row is undrawn; `setRowPath` stores an empty path as null. */
	path: number[] | null;
}

/** A puzzle being built: deliberately lenient, so incomplete work can be kept. */
export interface Draft {
	id: string;
	/** Free German text, not normalized. */
	clue: string;
	faden: DraftRow;
	words: DraftRow[];
	/** Milliseconds since the epoch; every edit stamps it, and a saved draft keeps that value. */
	changedAt: number;
}

/** Every editor-only check. None of these are puzzle rules. */
export type DraftRule = 'empty-clue' | 'missing-path' | 'length-mismatch';

export type DraftProblem = Problem<DraftRule>;

/** A new, empty draft with an id that stays put for the draft's whole life. */
export const createDraft = (): Draft => ({
	id: crypto.randomUUID(),
	clue: '',
	faden: { text: '', path: null },
	words: [],
	changedAt: Date.now()
});

/** Every edit stamps the time, so a stored draft can be sorted by when it last changed. */
const touch = (draft: Draft): Draft => ({ ...draft, changedAt: Date.now() });

const updateRow = (draft: Draft, subject: RowSubject, update: (row: DraftRow) => DraftRow): Draft =>
	touch(
		subject.kind === 'faden'
			? { ...draft, faden: update(draft.faden) }
			: {
					...draft,
					words: draft.words.map((word, index) => (index === subject.index ? update(word) : word))
				}
	);

/** Folds a row's text while it is typed; the clue stays free text through `setClue`. */
export const setRowText = (draft: Draft, subject: RowSubject, raw: string): Draft =>
	updateRow(draft, subject, (row) => ({ ...row, text: normalizeText(raw) }));

export const setRowPath = (draft: Draft, subject: RowSubject, path: number[] | null): Draft =>
	updateRow(draft, subject, (row) => ({
		...row,
		path: path === null || path.length === 0 ? null : [...path]
	}));

/** A word that normalizes to nothing is kept as an empty row. */
export const addWord = (draft: Draft, raw: string): Draft =>
	touch({ ...draft, words: [...draft.words, { text: normalizeText(raw), path: null }] });

/** Removing a row removes its path too, so its cells and letters go back to the pool. */
export const removeWord = (draft: Draft, index: number): Draft =>
	touch({
		...draft,
		words: draft.words.filter((_, i) => i !== index)
	});

export const setClue = (draft: Draft, clue: string): Draft => touch({ ...draft, clue });

/**
 * The 48 cells as one string, blank cells a space. Each path writes its row's text in
 * path order; rows go faden first, then the theme words in order, and the first letter
 * written to a cell keeps it — so the faden wins a shared cell. A cell past the end of
 * its row's text stays free for another row.
 */
export function draftLetters(draft: Draft): string {
	const letters = new Array<string>(CELL_COUNT).fill(' ');
	for (const [row] of withSubjects(draft.faden, draft.words)) {
		row.path?.forEach((cell, index) => {
			// The draft is lenient, so an index outside the grid must not stretch the string.
			if (cell < 0 || cell >= CELL_COUNT) return;
			if (letters[cell] !== ' ') return;
			if (row.text[index] !== undefined) letters[cell] = row.text[index];
		});
	}
	return letters.join('');
}

/** German count with the right plural: "1 Buchstabe", "3 Buchstaben". */
const plural = (count: number, one: string, many: string): string =>
	`${count} ${count === 1 ? one : many}`;

/**
 * The editor-only checks, kept out of `validatePuzzle`: an empty clue, a row without a
 * path, and a text length that differs from its path length.
 */
export function checkDraft(draft: Draft): DraftProblem[] {
	const out: DraftProblem[] = [];
	if (draft.clue.trim() === '') {
		out.push(problem('empty-clue', 'Der Hinweis fehlt.', { kind: 'puzzle' }));
	}
	for (const [row, subject] of withSubjects(draft.faden, draft.words)) {
		if (row.path === null || row.path.length === 0) {
			out.push(problem('missing-path', `${rowLabel(subject)} hat noch keinen Pfad.`, subject));
		} else if (row.text.length !== row.path.length) {
			// Only the cells that get no letter are at fault.
			const cells = row.path.slice(row.text.length);
			out.push(
				problem(
					'length-mismatch',
					`${rowLabel(subject)} hat ${plural(row.text.length, 'Buchstabe', 'Buchstaben')}, der Pfad aber ${plural(row.path.length, 'Zelle', 'Zellen')}.`,
					subject,
					cells
				)
			);
		}
	}
	return out;
}
