<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from 'twintrinsic';
	import SimilarItemCard from '$lib/components/SimilarItemCard/SimilarItemCard.svelte';
	import { getItemById, getTypeById, getItemsByTypeId } from '$lib/data';
	import { fitness, toVector, uniformWeights } from '$lib/ga';
	import type { Item, ItemType } from '$lib/types';

	/** Query param: comma-separated item IDs. */
	const itemIds = $derived(
		($page.url.searchParams.get('items') ?? '').split(',').filter(Boolean)
	);

	/** The selected items (the ones the user is finding matches for). */
	const selectedItems = $derived(
		itemIds.map((id) => getItemById(id)).filter((i): i is Item => i !== undefined)
	);

	/** All selected items should belong to the same type. Use the first one's type. */
	const type = $derived(
		selectedItems.length > 0 ? getTypeById(selectedItems[0].typeId) ?? null : null
	);

	/** Attribute id order from the type definition. */
	const attrOrder = $derived(type ? type.attributes.map((a) => a.id) : []);
	const weights = $derived(uniformWeights(attrOrder.length));

	/** Compute similarity percentage of a candidate vs the selected item(s). */
	function similarityPercent(candidate: Item): number {
		if (!type || selectedItems.length === 0) return 0;
		const candidateVec = toVector(candidate.averageRatings, attrOrder);
		// Average fitness across all selected items
		let total = 0;
		for (const sel of selectedItems) {
			const selVec = toVector(sel.averageRatings, attrOrder);
			total += fitness(selVec, candidateVec, weights);
		}
		return Math.round((total / selectedItems.length) * 100);
	}

	/** Similar items with similarity percentages, sorted by similarity descending. */
	const similarItems = $derived(
		type
			? getItemsByTypeId(type.id)
					.filter((i) => !itemIds.includes(i.id))
					.map((i) => ({ item: i, similarity: similarityPercent(i) }))
					.sort((a, b) => b.similarity - a.similarity)
			: []
	);

	/** Simple pluralizer for type names. */
	function pluralize(name: string): string {
		const uncountable = ['Music'];
		if (uncountable.includes(name)) return name;
		if (name.endsWith('s')) return name;
		return name + 's';
	}
</script>

<svelte:head>
	<title>Similar Items — DNAnything</title>
</svelte:head>

{#if !type || selectedItems.length === 0}
	<div class="px-8 py-16 max-w-2xl mx-auto text-center">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Error</p>
		<h1 class="text-2xl font-bold mb-4">No items selected</h1>
		<p class="text-muted mb-6">Select items from a type page to find similar entries.</p>
		<Button href="/types" variant="secondary">← Browse Types</Button>
	</div>
{:else}
	<div class="px-8 py-6 max-w-4xl mx-auto">
		<!-- Breadcrumb -->
		<nav class="text-sm text-muted mb-4">
			<a href="/types" class="hover:text-primary">Types</a>
			<span class="mx-1">/</span>
			<a href="/types/{type.slug}" class="hover:text-primary">{type.name}</a>
			<span class="mx-1">/</span>
			<span class="text-text">Similar</span>
		</nav>

		<!-- Header -->
		<header class="mb-8 pb-6 border-b border-border">
			<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Similar {pluralize(type.name)}</p>
			<h1 class="text-2xl font-bold mb-2">
				{#if selectedItems.length === 1}
					{type.name} like <em class="entry-title">{selectedItems[0].name}</em>
				{:else}
					{type.name} like these {selectedItems.length} items
				{/if}
			</h1>
			<p class="text-muted max-w-2xl">
				{selectedItems.length === 1
					? `Other ${type.name.toLowerCase()} in the catalog with similar attribute profiles.`
					: `Other ${type.name.toLowerCase()} that share traits with the selected items.`}
			</p>

			<!-- Selected items summary -->
			<div class="mt-4 flex flex-wrap gap-2">
				{#each selectedItems as sel (sel.id)}
					<a href="/items/{sel.id}" class="text-sm text-accent hover:underline">
						{sel.name}
					</a>
				{/each}
			</div>
		</header>

		<!-- Similar items list -->
		{#if similarItems.length === 0}
			<p class="text-muted py-8 text-center">No other {type.name.toLowerCase()} in the catalog.</p>
		{:else}
			<div class="flex flex-col gap-4">
				{#each similarItems as { item: sim, similarity } (sim.id)}
					<SimilarItemCard
						item={sim}
						{type}
						{similarity}
						showDescription
						chartHeight={150}
						chartWidth={700}
					/>
				{/each}
			</div>
		{/if}
	</div>
{/if}
