import { describe, expect, it } from 'vitest';
import {
	cellAtPoint,
	cellNearPoint,
	emptySelection,
	reduce,
	type SelectionState
} from './selection.js';

/** Press a cell and keep the resulting state. */
function press(state: SelectionState, cell: number | null): SelectionState {
	return reduce(state, { type: 'press', cell }).state;
}

/** Drag to a cell and keep the resulting state. */
function move(state: SelectionState, cell: number | null): SelectionState {
	return reduce(state, { type: 'move', cell }).state;
}

describe('emptySelection', () => {
	it('has an empty path and no gesture', () => {
		expect(emptySelection()).toEqual({ path: [], gesture: null });
	});
});

describe('press', () => {
	it('starts a selection on an empty board', () => {
		expect(press(emptySelection(), 5).path).toEqual([5]);
	});

	it('extends an adjacent cell, diagonally included', () => {
		let state = press(emptySelection(), 7);
		state = reduce(state, { type: 'release' }).state;
		expect(press(state, 14).path).toEqual([7, 14]);
	});

	it('is ignored while a gesture is already active (second finger)', () => {
		const state = press(emptySelection(), 0);
		expect(press(state, 7).path).toEqual([0]);
	});

	it('leaves the path unchanged when the last cell is hit again', () => {
		const state: SelectionState = { path: [0, 1, 2], gesture: null };
		expect(press(state, 2).path).toEqual([0, 1, 2]);
	});

	it('cuts back to an earlier cell, which stays selected', () => {
		const state: SelectionState = { path: [0, 1, 2, 3], gesture: null };
		expect(press(state, 1).path).toEqual([0, 1]);
	});

	it('clears when a non-adjacent cell is hit', () => {
		const state: SelectionState = { path: [0, 1, 2], gesture: null };
		expect(press(state, 15).path).toEqual([15]);
	});

	it('clears when the pointer goes down outside any cell', () => {
		const state: SelectionState = { path: [0, 1, 2], gesture: null };
		expect(press(state, null).path).toEqual([]);
	});
});

describe('move', () => {
	it('is ignored without an active gesture', () => {
		const state: SelectionState = { path: [0, 1], gesture: null };
		expect(move(state, 2).path).toEqual([0, 1]);
	});

	it('appends an adjacent cell', () => {
		let state = press(emptySelection(), 0);
		state = move(state, 1);
		expect(state.path).toEqual([0, 1]);
	});

	it('ignores a non-adjacent jump and keeps the path', () => {
		let state = press(emptySelection(), 0);
		state = move(state, 9);
		expect(state.path).toEqual([0]);
	});

	it('ignores the current last cell', () => {
		let state = press(emptySelection(), 0);
		state = move(state, 1);
		const again = move(state, 1);
		expect(again).toBe(state);
	});

	it('does not mark a tap-extension as a drag when the pointer re-hits the last cell', () => {
		let state = reduce(press(emptySelection(), 0), { type: 'release' }).state;
		state = press(state, 1);
		state = move(state, 1);
		expect(reduce(state, { type: 'release' }).submit).toBeNull();
	});

	it('performs elastic undo onto the previous cell', () => {
		let state = press(emptySelection(), 0);
		state = move(state, 1);
		state = move(state, 2);
		state = move(state, 1);
		expect(state.path).toEqual([0, 1]);
		state = move(state, 2);
		expect(state.path).toEqual([0, 1, 2]);
	});

	it('cuts back to any earlier cell on a fast retrace', () => {
		let state = press(emptySelection(), 0);
		state = move(state, 1);
		state = move(state, 2);
		state = move(state, 3);
		state = move(state, 1);
		expect(state.path).toEqual([0, 1]);
	});

	it('keeps the path when the pointer leaves the board', () => {
		let state = press(emptySelection(), 0);
		state = move(state, 1);
		state = move(state, null);
		expect(state.path).toEqual([0, 1]);
	});
});

describe('release', () => {
	it('submits a dragged path of two or more cells and clears the selection', () => {
		let state = press(emptySelection(), 0);
		state = move(state, 1);
		const { state: after, submit } = reduce(state, { type: 'release' });
		expect(submit).toEqual([0, 1]);
		expect(after.path).toEqual([]);
		expect(after.gesture).toBeNull();
	});

	it('submits the full path of a long drag', () => {
		let state = press(emptySelection(), 0);
		for (let cell = 1; cell <= 5; cell++) state = move(state, cell);
		expect(reduce(state, { type: 'release' }).submit).toEqual([0, 1, 2, 3, 4, 5]);
	});

	it('submits when the last cell is tapped again without moving', () => {
		let state: SelectionState = { path: [0, 1, 2], gesture: null };
		state = press(state, 2);
		const { state: after, submit } = reduce(state, { type: 'release' });
		expect(submit).toEqual([0, 1, 2]);
		expect(after.path).toEqual([]);
	});

	it('submits the shortened path when a drag retraces and then lifts', () => {
		let state = press(emptySelection(), 0);
		state = move(state, 1);
		state = move(state, 2);
		state = move(state, 1);
		expect(reduce(state, { type: 'release' }).submit).toEqual([0, 1]);
	});

	it('keeps the cut path without submitting when an earlier cell is tapped', () => {
		let state: SelectionState = { path: [0, 1, 2], gesture: null };
		state = press(state, 1);
		const { state: after, submit } = reduce(state, { type: 'release' });
		expect(submit).toBeNull();
		expect(after.path).toEqual([0, 1]);
		expect(after.gesture).toBeNull();
	});

	it('keeps the extended path without submitting when an adjacent cell is tapped', () => {
		let state: SelectionState = { path: [0, 1], gesture: null };
		state = press(state, 7);
		const { state: after, submit } = reduce(state, { type: 'release' });
		expect(submit).toBeNull();
		expect(after.path).toEqual([0, 1, 7]);
	});

	it('starts over on the tapped cell without submitting when a non-adjacent cell is tapped', () => {
		let state: SelectionState = { path: [0, 1, 2], gesture: null };
		state = press(state, 40);
		const { state: after, submit } = reduce(state, { type: 'release' });
		expect(submit).toBeNull();
		expect(after.path).toEqual([40]);
	});

	it('keeps a lone cell as the resting selection without submitting', () => {
		const state = press(emptySelection(), 5);
		const { state: after, submit } = reduce(state, { type: 'release' });
		expect(submit).toBeNull();
		expect(after.path).toEqual([5]);
	});

	it('is a no-op without an active gesture', () => {
		const state: SelectionState = { path: [0, 1], gesture: null };
		expect(reduce(state, { type: 'release' })).toEqual({ state, submit: null });
	});
});

describe('cancel', () => {
	it('ends the gesture, keeps the path and submits nothing', () => {
		let state = press(emptySelection(), 0);
		state = move(state, 1);
		const { state: after, submit } = reduce(state, { type: 'cancel' });
		expect(submit).toBeNull();
		expect(after.path).toEqual([0, 1]);
		expect(after.gesture).toBeNull();
	});

	it('makes later moves ignored', () => {
		let state = press(emptySelection(), 0);
		state = move(state, 1);
		state = reduce(state, { type: 'cancel' }).state;
		expect(move(state, 2).path).toEqual([0, 1]);
	});
});

describe('tap flow', () => {
	it('builds a word by tapping cells, then submits on tapping the last cell again', () => {
		let state = press(emptySelection(), 0);
		state = reduce(state, { type: 'release' }).state;
		state = press(state, 1);
		state = reduce(state, { type: 'release' }).state;
		expect(state.path).toEqual([0, 1]);
		state = press(state, 1);
		expect(reduce(state, { type: 'release' }).submit).toEqual([0, 1]);
	});
});

describe('cellAtPoint', () => {
	// 6×8 board of 60×80 at (10, 20): cells are 10×10.
	const rect = { left: 10, top: 20, width: 60, height: 80 };

	it('maps the centre of a cell to its index', () => {
		expect(cellAtPoint(rect, 15, 25)).toBe(0);
		expect(cellAtPoint(rect, 65, 95)).toBe(47);
		expect(cellAtPoint(rect, 35, 45)).toBe(14);
	});

	it('counts the whole cell, including its far edges', () => {
		expect(cellAtPoint(rect, 10, 20)).toBe(0);
		expect(cellAtPoint(rect, 70, 100)).toBe(47);
	});

	it('returns null outside the board', () => {
		expect(cellAtPoint(rect, 9, 50)).toBeNull();
		expect(cellAtPoint(rect, 71, 50)).toBeNull();
		expect(cellAtPoint(rect, 40, 19)).toBeNull();
		expect(cellAtPoint(rect, 40, 101)).toBeNull();
	});

	it('returns null for an empty rect', () => {
		expect(cellAtPoint({ left: 0, top: 0, width: 0, height: 0 }, 1, 1)).toBeNull();
	});
});

describe('cellNearPoint', () => {
	const rect = { left: 10, top: 20, width: 60, height: 80 };

	it('maps the centre of a cell to its index', () => {
		expect(cellNearPoint(rect, 15, 25)).toBe(0);
		expect(cellNearPoint(rect, 65, 95)).toBe(47);
	});

	it('returns null in the outer margin of a cell (smaller hit area)', () => {
		expect(cellNearPoint(rect, 10.5, 25)).toBeNull();
		expect(cellNearPoint(rect, 19.5, 25)).toBeNull();
		expect(cellNearPoint(rect, 15, 20.5)).toBeNull();
	});

	it('returns null when crossing a shared corner mid-diagonal', () => {
		// Exactly the corner between cells 0, 1, 6 and 7 — the pointer belongs to none of them.
		expect(cellNearPoint(rect, 20, 30)).toBeNull();
	});

	it('returns null outside the board', () => {
		expect(cellNearPoint(rect, 5, 25)).toBeNull();
		expect(cellNearPoint(rect, 15, 105)).toBeNull();
	});

	it('returns null for an empty rect', () => {
		expect(cellNearPoint({ left: 0, top: 0, width: 0, height: 0 }, 1, 1)).toBeNull();
	});
});
