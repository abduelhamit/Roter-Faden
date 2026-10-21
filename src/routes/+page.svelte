<script lang="ts">
	import { onMount } from 'svelte';
	import GameBoard from '#lib/components/GameBoard.svelte';
	import { decodePuzzle } from '#lib/puzzle/codec.js';
	import type { Puzzle } from '#lib/puzzle/model.js';

	type Status =
		| { kind: 'unmounted' }
		| { kind: 'empty' }
		| { kind: 'loading'; previous: Puzzle | null }
		| { kind: 'failed' }
		| { kind: 'ready'; puzzle: Puzzle };

	// null = hash not read yet (prerendered HTML stays blank); '' = no hash.
	let hash = $state<string | null>(null);
	let decoded = $state<{ hash: string; puzzle: Puzzle } | null>(null);
	let failedHash = $state<string | null>(null);

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
		const current = hash;
		if (!current) return;
		let stale = false;
		decodePuzzle(current)
			.then((p) => {
				if (!stale) decoded = { hash: current, puzzle: p };
			})
			.catch(() => {
				if (!stale) failedHash = current;
			});
		return () => {
			stale = true;
		};
	});

	const status = $derived.by<Status>(() => {
		if (hash === null) return { kind: 'unmounted' };
		if (hash === '') return { kind: 'empty' };
		if (decoded?.hash === hash) return { kind: 'ready', puzzle: decoded.puzzle };
		if (failedHash === hash) return { kind: 'failed' };
		// Keep the previous puzzle on screen until the new link decodes.
		return { kind: 'loading', previous: decoded?.puzzle ?? null };
	});

	const shown = $derived(
		status.kind === 'ready' ? status.puzzle : status.kind === 'loading' ? status.previous : null
	);
</script>

{#if status.kind === 'unmounted'}
	<!-- Render nothing until the hash is known. -->
{:else if status.kind === 'empty'}
	<p class="p-md text-fg-muted">Kein Rätsel gefunden. Bitte einen geteilten Link öffnen.</p>
{:else if status.kind === 'failed'}
	<p class="p-md text-fg-muted">Das Rätsel konnte nicht geladen werden. Bitte den Link prüfen.</p>
{:else if shown}
	<main class="mx-auto flex w-full max-w-96 flex-col gap-md p-md">
		<h1 class="text-lg font-semibold">{shown.clue}</h1>
		<!-- Issue #8: evaluation goes here — <GameBoard onsubmit={...} /> -->
		<!-- Keyed by letters: a new puzzle must not inherit the old selection. -->
		{#key shown.letters}
			<GameBoard letters={shown.letters} />
		{/key}
	</main>
{:else}
	<p class="p-md text-fg-muted">Lädt …</p>
{/if}
