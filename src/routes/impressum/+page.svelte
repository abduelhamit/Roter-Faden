<script lang="ts">
	import { PROVIDER } from '#lib/provider.js';
</script>

<svelte:head><title>Impressum – Roter Faden</title></svelte:head>

<main class="mx-auto w-full max-w-2xl space-y-md px-lg py-lg">
	<h1 class="text-lg font-semibold">Impressum</h1>

	<section>
		<h2 class="text-base font-semibold">Angaben gemäß § 5 DDG</h2>
		<p class="mt-xs">
			{PROVIDER.name}<br />
			{#each PROVIDER.address as line, i (i)}{line}<br />{/each}
		</p>
	</section>

	<section>
		<h2 class="text-base font-semibold">Kontakt</h2>
		<p class="mt-xs">
			E-Mail: <a class="text-fg-accent hover:underline" href="mailto:{PROVIDER.email}"
				>{PROVIDER.email}</a
			>
		</p>
	</section>
</main>
