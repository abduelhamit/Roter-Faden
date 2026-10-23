<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import ColorModeSwitch from '#lib/components/ColorModeSwitch.svelte';
	import { resolve } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Roter Faden – Worträtsel</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<header class="flex items-center justify-between border-b border-border-default px-lg py-sm">
		<span class="text-base font-semibold">Roter Faden</span>
		<ColorModeSwitch />
	</header>
	{@render children()}
	<!-- In the layout rather than the pages, so the legal pages stay „leicht erkennbar,
	     unmittelbar erreichbar“ on every route. `mt-auto` pins it to the bottom on short screens. -->
	<footer class="mt-auto border-t border-border-default px-lg py-sm text-sm">
		<nav class="flex gap-md text-fg-muted">
			<a class="hover:text-fg-accent hover:underline" href={resolve('/impressum')}>Impressum</a>
			<a class="hover:text-fg-accent hover:underline" href={resolve('/datenschutz')}>Datenschutz</a>
		</nav>
	</footer>
</div>
