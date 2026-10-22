import { COLS, ROWS, cellsEqual, isAdjacent } from '../puzzle/model.js';

/**
 * The player's in-progress path. `gesture` is the reducer's own bookkeeping while a
 * pointer is down; consumers only ever read `path` (and hand back the state unchanged).
 */
export interface SelectionState {
	/** Selected cells in order; `[]` when nothing is selected. Never contains a repeat. */
	path: number[];
	/** `pressPath` is the path as it was *before* the press — tap vs drag is derived from it. */
	gesture: { pressPath: number[]; movedByDrag: boolean } | null;
}

/** `cell: null` means the pointer was not over any cell (board gap or outside the board). */
export type SelectionEvent =
	| { type: 'press'; cell: number | null }
	| { type: 'move'; cell: number | null }
	| { type: 'release' }
	| { type: 'cancel' };

export interface SelectionResult {
	state: SelectionState;
	/** The path to submit, or null. Only ever set by `release`. */
	submit: number[] | null;
}

export const emptySelection = (): SelectionState => ({ path: [], gesture: null });

/**
 * Advance the path toward `cell`, or null if that's not possible.
 * Re-hitting the last cell is a no-op (same reference), hitting an earlier one cuts
 * the path back to it, and an adjacent new cell appends; anything else is rejected.
 * The empty-path guard must come first: unchecked, both indices are -1 and match the end.
 */
function step(path: number[], cell: number): number[] | null {
	if (path.length === 0) return null;
	const i = path.indexOf(cell);
	if (i === path.length - 1) return path;
	if (i >= 0) return path.slice(0, i + 1);
	if (isAdjacent(path[path.length - 1], cell)) return [...path, cell];
	return null;
}

/**
 * One event, one pure step. The rules:
 * - press: extend if adjacent; cut back to an earlier cell if hit; start fresh otherwise;
 *   `null` clears. A press while a gesture is active is ignored (second finger).
 * - move: elastic undo (landing on an in-path cell cuts back to it), else append when
 *   adjacent, else ignore — a stray jump never clears a path mid-drag.
 * - release: submits iff the path has ≥ 2 cells and grew by dragging, or is untouched
 *   since the press (tap the last cell again). Otherwise the path stays as it is — a
 *   lone cell is a valid resting selection, which is what lets a tap-only player build
 *   a word step by step.
 * - cancel: ends the gesture, keeps the path.
 *
 * "Tap a non-adjacent cell clears the selection" means the old selection is discarded
 * and the tap starts over on that cell; tapping outside the board clears to nothing.
 */
export function reduce(state: SelectionState, event: SelectionEvent): SelectionResult {
	const { path, gesture } = state;
	switch (event.type) {
		case 'press': {
			if (gesture) return { state, submit: null };
			if (event.cell === null) return { state: emptySelection(), submit: null };
			const next = step(path, event.cell) ?? [event.cell];
			return {
				state: { path: next, gesture: { pressPath: path, movedByDrag: false } },
				submit: null
			};
		}
		case 'move': {
			if (!gesture || event.cell === null) return { state, submit: null };
			const next = step(path, event.cell);
			// `next === path` means the last cell was hit again — a no-op, not a change.
			if (next === null || next === path) return { state, submit: null };
			return {
				state: { path: next, gesture: { ...gesture, movedByDrag: true } },
				submit: null
			};
		}
		case 'release': {
			if (!gesture) return { state, submit: null };
			if (path.length >= 2 && (gesture.movedByDrag || cellsEqual(path, gesture.pressPath)))
				return { state: emptySelection(), submit: path };
			return { state: { path, gesture: null }, submit: null };
		}
		case 'cancel':
			return { state: gesture ? { path, gesture: null } : state, submit: null };
	}
}

/** The board's outer rectangle; a DOMRect satisfies it. */
export interface BoardRect {
	left: number;
	top: number;
	width: number;
	height: number;
}

/** pointerdown: the whole cell counts — pressing anywhere in it starts the selection. */
export function cellAtPoint(rect: BoardRect, x: number, y: number): number | null {
	if (rect.width <= 0 || rect.height <= 0) return null;
	if (x < rect.left || x > rect.left + rect.width) return null;
	if (y < rect.top || y > rect.top + rect.height) return null;
	const col = Math.min(COLS - 1, Math.floor((x - rect.left) / (rect.width / COLS)));
	const row = Math.min(ROWS - 1, Math.floor((y - rect.top) / (rect.height / ROWS)));
	return row * COLS + col;
}

/** The inner fraction of a cell that counts as a move target ("smaller hit area"). */
const HIT = 0.8;

/**
 * pointermove: only the inner 80% of a cell registers. Drifting along a row edge or
 * crossing a shared corner mid-diagonal lands on nothing, so the path holds until the
 * pointer is meaningfully inside the next cell — diagonals without accidental neighbours.
 */
export function cellNearPoint(rect: BoardRect, x: number, y: number): number | null {
	if (rect.width <= 0 || rect.height <= 0) return null;
	const cw = rect.width / COLS;
	const ch = rect.height / ROWS;
	const col = Math.round((x - rect.left) / cw - 0.5);
	const row = Math.round((y - rect.top) / ch - 0.5);
	if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
	const dx = Math.abs(x - rect.left - (col + 0.5) * cw);
	const dy = Math.abs(y - rect.top - (row + 0.5) * ch);
	if (dx > (cw / 2) * HIT || dy > (ch / 2) * HIT) return null;
	return row * COLS + col;
}
