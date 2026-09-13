<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from 'twintrinsic';
	import SimilarItemCard from '$lib/components/SimilarItemCard/SimilarItemCard.svelte';
	import { getAttributeById, getItemsByAttributeId } from '$lib/data';
	import { fitness, toVector, uniformWeights } from '$lib/ga';

	const id = $derived($page.params.id);
	const attrData = $derived(getAttributeById(id));

	/** Items with this attribute, sorted by rating desc, then rating count desc. */
	const rankedItems = $derived(
		attrData
			? getItemsByAttributeId(id)
					.sort((a, b) => {
						if (b.rating !== a.rating) return b.rating - a.rating;
						return b.ratingCount - a.ratingCount;
					})
			: []
	);

	/** Convert 0–5 stored rating to 0–100 display value. */
	function toDisplay(value: number): number {
		return Math.round(value * 20);
	}

	/** Similarity percentage between two items (for the SimilarItemCard). */
	function similarityPercent(itemA: typeof rankedItems[number]['item'], itemB: typeof rankedItems[number]['item']): number {
		const type = attrData?.type;
		if (!type) return 0;
		const order = type.attributes.map((a) => a.id);
		const weights = uniformWeights(order.length);
		const vecA = toVector(itemA.averageRatings, order);
		const vecB = toVector(itemB.averageRatings, order);
		return Math.round(fitness(vecA, vecB, weights) * 100);
	}
</script>

<svelte:head>
	<title>{attrData?.attribute.name ?? 'Attribute'} — DNAnything</title>
	{#if attrData?.attribute.description}
		<meta name="description" content={attrData.attribute.description} />
	{/if}
</svelte:head>

{#if !attrData}
	<div class="px-8 py-16 max-w-2xl mx-auto text-center">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Error</p>
		<h1 class="text-2xl font-bold mb-4">Attribute not found</h1>
		<p class="text-muted mb-6">No attribute with id "{id}" exists in the catalog.</p>
		<Button href="/types" variant="secondary">← Browse Types</Button>
	</div>
{:else}
	<div class="px-8 py-6 max-w-4xl mx-auto">
		<!-- Breadcrumb -->
		<nav class="text-sm text-muted mb-4">
			<a href="/types" class="hover:text-primary">Types</a>
			<span class="mx-1">/</span>
			<a href="/types/{attrData.type.slug}" class="hover:text-primary">{attrData.type.name}</a>
			<span class="mx-1">/</span>
			<span class="text-text">{attrData.attribute.name}</span>
		</nav>

		<!-- Attribute header -->
		<header class="mb-8 pb-6 border-b border-border">
			<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Attribute · {attrData.type.name}</p>
			<h1 class="text-3xl font-bold mb-2">{attrData.attribute.name}</h1>
			{#if attrData.attribute.description}
				<p class="text-muted max-w-3xl leading-relaxed">{attrData.attribute.description}</p>
			{/if}
			<p class="text-sm text-muted mt-4">
				{rankedItems.length} {rankedItems.length === 1 ? 'item' : 'items'} rated on this attribute.
			</p>
		</header>

		<!-- Ranked items -->
		{#if rankedItems.length === 0}
			<p class="text-muted py-8 text-center">No items have been rated on this attribute yet.</p>
		{:else}
			<div class="flex flex-col gap-4">
				{#each rankedItems as ranked, i (ranked.item.id)}
					<div class="relative">
						<!-- Rank number -->
						<div class="absolute -left-10 top-3 text-2xl tabular-nums text-muted font-bold hidden sm:block">
							{String(i + 1).padStart(2, '0')}
						</div>
						<SimilarItemCard
							item={ranked.item}
							type={ranked.type}
							similarity={similarityPercent(rankedItems[0].item, ranked.item)}
							showDescription
							chartHeight={150}
							chartWidth={700}
						/>
						<!-- Rating badge -->
						<div class="mt-2 flex items-center gap-4 text-sm text-muted">
							<span class="tabular-nums">
								<span class="font-medium text-text">{toDisplay(ranked.rating)}</span>
								<span class="text-muted">/100 {attrData.attribute.name}</span>
							</span>
							<span class="tabular-nums">
								{ranked.ratingCount} {ranked.ratingCount === 1 ? 'rating' : 'ratings'}
							</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}
