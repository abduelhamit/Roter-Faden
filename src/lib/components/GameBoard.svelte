<script lang="ts">
	import {
		cellAtPoint,
		cellNearPoint,
		emptySelection,
		reduce,
		type SelectionEvent,
		type SelectionState
	} from '#lib/game/selection.js';
	import { COLS, ROWS, spellPath } from '#lib/puzzle/model.js';

	type LineVariant = 'theme-word' | 'faden' | 'word-hint';

	let {
		letters,
		lines = [],
		onsubmit
	}: {
		letters: string;
		lines?: { cells: number[]; variant: LineVariant }[];
		onsubmit?: (path: number[]) => void;
	} = $props();

	let sel = $state<SelectionState>(emptySelection());
	let root = $state<HTMLDivElement>();
	// Plain on purpose: pointer identity must not trigger re-renders.
	let activePointer: number | null = null;

	const lineStrokes: Record<LineVariant, { circle: string; polyline: string }> = {
		'theme-word': { circle: 'fill-theme-word', polyline: 'stroke-theme-word' },
		faden: { circle: 'fill-faden', polyline: 'stroke-faden' },
		'word-hint': { circle: 'fill-none stroke-word-hint stroke-[0.025]', polyline: '' }
	};

	const points = (cells: number[]): string => cells.map((c) => `${posx(c)},${posy(c)}`).join(' ');

	const posx = (cell: number): number => (cell % COLS) + 0.5;
	const posy = (cell: number): number => Math.floor(cell / COLS) + 0.5;

	function apply(event: SelectionEvent) {
		const { state, submit } = reduce(sel, event);
		sel = state;
		if (submit) onsubmit?.(submit);
	}

	function onpointerdown(event: PointerEvent) {
		if (activePointer !== null || event.button > 0 || !root) return;
		activePointer = event.pointerId;
		root.setPointerCapture(event.pointerId);
		apply({
			type: 'press',
			cell: cellAtPoint(root.getBoundingClientRect(), event.clientX, event.clientY)
		});
	}

	function onpointermove(event: PointerEvent) {
		if (event.pointerId !== activePointer || !root) return;
		apply({
			type: 'move',
			cell: cellNearPoint(root.getBoundingClientRect(), event.clientX, event.clientY)
		});
	}

	function onpointerup(event: PointerEvent) {
		if (event.pointerId !== activePointer) return;
		activePointer = null;
		apply({ type: 'release' });
	}

	function onpointercancel(event: PointerEvent) {
		if (event.pointerId !== activePointer) return;
		activePointer = null;
		apply({ type: 'cancel' });
	}

	// Tap outside the board clears the selection (a tap on the board is ours to handle).
	$effect(() => {
		if (sel.path.length === 0 || !root) return;
		const board = root;
		const onOutsidePress = (event: PointerEvent) => {
			if (activePointer === null && event.target instanceof Node && !board.contains(event.target))
				apply({ type: 'press', cell: null });
		};
		document.addEventListener('pointerdown', onOutsidePress, true);
		return () => document.removeEventListener('pointerdown', onOutsidePress, true);
	});
</script>

<p
	data-testid="selected-letters"
	class="min-h-8 text-center text-xl font-semibold tracking-widest text-word-hint"
>
	{spellPath(letters, sel.path)}
</p>
<div
	bind:this={root}
	role="presentation"
	class="relative aspect-3/4 w-full touch-none overflow-hidden rounded-md select-none"
	{onpointerdown}
	{onpointermove}
	{onpointerup}
	{onpointercancel}
>
	<svg
		class="pointer-events-none absolute inset-0 h-full w-full"
		aria-hidden="true"
		viewBox="0 0 {COLS} {ROWS}"
		preserveAspectRatio="none"
	>
		{#each lines as line (line)}
			{#each line.cells as cell (cell)}
				<circle class={lineStrokes[line.variant].circle} r="5%" cx={posx(cell)} cy={posy(cell)} />
			{/each}
			<!-- A zero-length segment (one cell) is drawn by the circles above; iOS Safari
			     renders it as an oversized stroke instead. -->
			{#if line.cells.length > 1}
				<polyline
					fill="none"
					stroke-width="12"
					stroke-linecap="round"
					stroke-linejoin="round"
					vector-effect="non-scaling-stroke"
					class={lineStrokes[line.variant].polyline}
					points={points(line.cells)}
				/>
			{/if}
		{/each}
		{#each sel.path as cell (cell)}
			<circle class="fill-game-line" r="5%" cx={posx(cell)} cy={posy(cell)} />
		{/each}
		{#if sel.path.length > 1}
			<polyline
				fill="none"
				stroke-width="12"
				stroke-linecap="round"
				stroke-linejoin="round"
				vector-effect="non-scaling-stroke"
				class="stroke-game-line"
				points={points(sel.path)}
			/>
		{/if}
	</svg>
	<div
		class="relative grid h-full w-full grid-cols-6 grid-rows-8 border-t border-l border-border-default"
	>
		{#each [...letters] as letter, i (i)}
			<div
				data-cell={i}
				class="flex items-center justify-center border-r border-b border-border-default text-xl font-semibold"
			>
				{letter}
			</div>
		{/each}
	</div>
</div>
