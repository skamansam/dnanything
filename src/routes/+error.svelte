<script lang="ts">
	import { page } from '$app/stores';
	import DnaAnythingLogo from '$lib/components/DnaAnythingLogo.svelte';
</script>

<svelte:head>
	<title>{page.status} — DNAnything</title>
</svelte:head>

<div class="min-h-[70vh] flex flex-col items-center justify-center px-6 py-12 text-center">
	<DnaAnythingLogo size={48} variant="long" class="mb-8" />

	<p class="text-6xl font-bold tabular-nums text-primary mb-4">{page.status}</p>

	<h1 class="text-2xl font-semibold mb-3">
		{#if page.status === 404}
			Page Not Found
		{:else if page.status === 500}
			Server Error
		{:else}
			Something Went Wrong
		{/if}
	</h1>

	<p class="text-muted max-w-md mb-8 leading-relaxed">
		{#if page.status === 404}
			The page you're looking for doesn't exist or may have been moved.
			Browse the catalog to find what you're looking for.
		{:else if page.status === 500}
			An unexpected error occurred on the server. Please try again in a moment.
		{:else}
			{page.error?.message ?? 'An unexpected error occurred.'}
		{/if}
	</p>

	<div class="flex gap-4">
		<a
			href="/"
			class="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
		>
			Go Home
		</a>
		<a
			href="/types"
			class="px-6 py-3 rounded-lg border border-border text-text font-medium hover:bg-surface transition-colors"
		>
			Browse Catalog
		</a>
	</div>
</div>
