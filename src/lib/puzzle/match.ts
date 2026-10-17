import { spellPath, type Puzzle } from './model.js';

/**
 * The theme word that `path` spells, or null. The order inside the group is free;
 * which cells were picked is the editor's job — it guarantees every theme word is
 * spelled by exactly one cell group. Never consults a dictionary.
 * shortcut: matches by letters, not cells, so a crafted link that breaks that
 * guarantee can still match a word from a second group — switch to a cell-group
 * check only if wrong matches from shared links are ever reported.
 */
export function matchWord(puzzle: Puzzle, path: number[]): string | null {
	const spelled = spellPath(puzzle.letters, path);
	for (const cells of puzzle.words) {
		if (spellPath(puzzle.letters, cells) === spelled) return spelled;
	}
	return null;
}

/**
 * True if `path` spells the same letters as the Roter Faden. Never consults a dictionary:
 * the faden's text is the creator's free choice — a sentence like DASISTCOOL is a valid
 * faden. The drawn direction is part of the match on purpose: the reverse path spells the
 * faden backwards and is rejected.
 * shortcut: matches by letters, not cells — `validatePuzzle` guarantees one cell group
 * per text, but only for editor-made puzzles; a crafted link can still match from a
 * second group.
 */
export function matchFaden(puzzle: Puzzle, path: number[]): boolean {
	return spellPath(puzzle.letters, path) === spellPath(puzzle.letters, puzzle.faden);
}
