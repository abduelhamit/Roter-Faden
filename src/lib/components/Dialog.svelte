<script lang="ts">
	import type { Snippet } from 'svelte';
	import octicons from '@primer/octicons';

	let {
		open = $bindable(false),
		title,
		children,
		footer
	}: {
		open?: boolean;
		title: Snippet;
		children: Snippet;
		footer?: Snippet;
	} = $props();

	let dialog = $state<HTMLDialogElement | undefined>();

	$effect(() => {
		if (open && !dialog?.open) dialog?.showModal();
		else if (!open && dialog?.open) dialog?.close();
	});

	function close() {
		open = false;
	}

	// Clicking the backdrop (the dialog element itself) closes it
	function ondialogclick(event: MouseEvent) {
		if (event.target === dialog) close();
	}
</script>

<dialog
	bind:this={dialog}
	onclose={close}
	onclick={ondialogclick}
	aria-labelledby="dialog-title"
	class="w-(--overlay-width-medium) max-w-[calc(100vw-2*var(--space-lg))] rounded-md border border-border-default bg-overlay p-0 text-fg-default shadow-floating [&::backdrop]:bg-overlay-backdrop"
>
	<div class="flex items-center justify-between border-b border-border-default px-lg py-md">
		<h2 id="dialog-title" class="text-base font-semibold">{@render title()}</h2>
		<button
			type="button"
			aria-label="Schließen"
			onclick={close}
			class="rounded-sm p-xs text-fg-muted hover:bg-canvas-muted hover:text-fg-default"
		>
			<!-- octicons.toSVG() returns a static SVG that is hard-coded in the package -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html octicons['x'].toSVG({ height: 16 })}
		</button>
	</div>
	<div class="px-lg py-lg">{@render children()}</div>
	{#if footer}
		<div class="flex justify-end gap-sm border-t border-border-default px-lg py-md">
			{@render footer()}
		</div>
	{/if}
</dialog>
