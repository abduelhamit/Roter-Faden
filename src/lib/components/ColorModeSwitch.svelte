<script lang="ts">
	import { onMount } from 'svelte';
	import { COLOR_MODES, normalizeMode, STORAGE_KEY, type ColorMode } from '#lib/color-mode.js';

	// Starts as 'auto' on both server and client (no hydration mismatch), then picks up the
	// stored mode after mount. Only drives the radio checked state; the highlight is pure CSS
	// on the html attribute (see the style block), so it is correct before hydration too.
	let mode = $state<ColorMode>('auto');

	const labels: Record<ColorMode, string> = { light: 'Hell', dark: 'Dunkel', auto: 'System' };

	onMount(() => {
		mode = normalizeMode(document.documentElement.getAttribute('data-color-mode'));
	});

	function select(next: ColorMode) {
		mode = next;
		document.documentElement.setAttribute('data-color-mode', next);
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			/* Private browsing: the mode still applies for this session */
		}
	}
</script>

<fieldset
	class="inline-flex items-center rounded-md border border-border-default bg-control-bg p-xxs"
>
	<legend class="sr-only">Farbmodus</legend>
	{#each COLOR_MODES as m (m)}
		<input
			type="radio"
			name="color-mode"
			id="color-mode-{m}"
			value={m}
			checked={mode === m}
			onchange={() => select(m)}
			class="peer sr-only"
		/>
		<label
			for="color-mode-{m}"
			class="cursor-pointer rounded-sm px-md py-xxs text-sm text-fg-muted peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring hover:bg-canvas-muted"
		>
			{labels[m]}
		</label>
	{/each}
</fieldset>

<style>
	/* Unlayered, so these beat the Tailwind utilities above. Keyed off the attribute the
	   app.html script sets before first paint — the highlight is right before hydration. */
	:global(html[data-color-mode='light']) input[value='light'] + label,
	:global(html[data-color-mode='dark']) input[value='dark'] + label,
	:global(html[data-color-mode='auto']) input[value='auto'] + label {
		background-color: var(--bgColor-default);
		color: var(--fgColor-default);
		font-weight: 600;
		box-shadow: var(--shadow-resting-xsmall);
	}
</style>
