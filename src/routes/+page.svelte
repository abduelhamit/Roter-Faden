<script lang="ts">
	import { onMount } from 'svelte';
	import GameBoard from '#lib/components/GameBoard.svelte';
	import { decodePuzzle } from '#lib/puzzle/codec.js';
	import type { Puzzle } from '#lib/puzzle/model.js';

	let puzzle = $state<Puzzle | null>(null);
	let hash = $state('');

	// The hash only exists client-side: read it after mount, then follow hashchange.
	onMount(() => {
		hash = location.hash;
		const onhashchange = () => {
			hash = location.hash;
		};
		window.addEventListener('hashchange', onhashchange);
		return () => window.removeEventListener('hashchange', onhashchange);
	});

	$effect(() => {
		if (hash === '') {
			puzzle = null;
			return;
		}
		let stale = false;
		decodePuzzle(hash)
			.then((p) => {
				if (!stale) puzzle = p;
			})
			.catch(() => {
				if (!stale) puzzle = null;
			});
		return () => {
			stale = true;
		};
	});
</script>

{#if puzzle}
	<main class="mx-auto flex w-full max-w-96 flex-col gap-md p-md">
		<h1 class="text-lg font-semibold">{puzzle.clue}</h1>
		<!-- Issue #8: evaluation goes here — <GameBoard onsubmit={...} /> -->
		<!-- Keyed by letters: a new puzzle must not inherit the old selection. -->
		{#key puzzle.letters}
			<GameBoard letters={puzzle.letters} />
		{/key}
	</main>
{:else}
	<p class="p-md text-fg-muted">Kein Rätsel gefunden. Bitte einen geteilten Link öffnen.</p>
{/if}
