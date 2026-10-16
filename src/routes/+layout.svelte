<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import ColorModeSwitch from '#lib/components/ColorModeSwitch.svelte';
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
</div>
