<script lang="ts">
	import { page } from '$app/stores';
	import { Tag, Button } from 'twintrinsic';
	import AttributeBarChart from '$lib/components/AttributeBarChart/AttributeBarChart.svelte';
	import SimilarItemCard from '$lib/components/SimilarItemCard/SimilarItemCard.svelte';
	import { getItemById, getTypeById, getItemsByTypeId, getUserById, getChangeLogsForEntity, getReviewsByItemId, getRecommendationsForItem } from '$lib/data';
	import { fitness, toVector, uniformWeights } from '$lib/ga';
	import type { Attribute } from '$lib/types';

	const id = $derived($page.params.id);
	const item = $derived(getItemById(id));
	const type = $derived(item ? getTypeById(item.typeId) : null);

	/** Users who created and last modified this item. */
	const createdBy = $derived(item?.createdByUserId ? getUserById(item.createdByUserId) : null);
	const updatedBy = $derived(item?.updatedByUserId ? getUserById(item.updatedByUserId) : null);

	/** Change log entries for this item. */
	const changeLogs = $derived(item ? getChangeLogsForEntity('item', item.id) : []);

	/** Reviews and recommendations for this item. */
	const reviews = $derived(item ? getReviewsByItemId(item.id) : []);
	const recommendations = $derived(item ? getRecommendationsForItem(item.id) : []);

	/** Convert 0–5 stored rating to 0–100 display value. */
	function toDisplay(value: number): number {
		return Math.round(value * 20);
	}

	/** Simple pluralizer for type names. */
	function pluralize(name: string): string {
		const uncountable = ['Music'];
		if (uncountable.includes(name)) return name;
		if (name.endsWith('s')) return name;
		return name + 's';
	}

	/** Ranked attributes sorted by rating descending. */
	const ranked = $derived(
		type && item
			? type.attributes
					.map((attr: Attribute) => ({
						attr,
						value: item.averageRatings[attr.id] ?? 0,
						display: toDisplay(item.averageRatings[attr.id] ?? 0)
					}))
					.sort((a, b) => b.value - a.value)
			: []
	);

	/** Major attributes: top 7 rated, only those above 50 display. */
	const majorAttributes = $derived(ranked.filter((e) => e.display > 50).slice(0, 7));

	/** Minor attributes: next 7 rated (ranks 8–14), only those above 50. */
	const minorAttributes = $derived(ranked.filter((e) => e.display > 50).slice(7, 14));

	/** Attribute id order and uniform weights for similarity calculation. */
	const attrOrder = $derived(type ? type.attributes.map((a) => a.id) : []);
	const weights = $derived(uniformWeights(attrOrder.length));

	/** Similarity percentage of a candidate vs the current item. */
	function similarityPercent(candidate: typeof item): number {
		if (!type || !item || !candidate) return 0;
		const itemVec = toVector(item.averageRatings, attrOrder);
		const candidateVec = toVector(candidate.averageRatings, attrOrder);
		return Math.round(fitness(itemVec, candidateVec, weights) * 100);
	}

	/** Similar items with similarity scores, sorted by similarity descending. */
	const similarItems = $derived(
		type && item
			? getItemsByTypeId(type.id)
					.filter((i) => i.id !== item.id)
					.map((i) => ({ item: i, similarity: similarityPercent(i) }))
					.sort((a, b) => b.similarity - a.similarity)
					.slice(0, 4)
			: []
	);
</script>

<svelte:head>
	<title>{item?.name ?? 'Item'} — DNAnything</title>
	{#if item?.description}
		<meta name="description" content={item.description} />
	{/if}
</svelte:head>

{#if !item || !type}
	<div class="px-8 py-16 max-w-2xl mx-auto text-center">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Error</p>
		<h1 class="text-2xl font-bold mb-4">Item not found</h1>
		<p class="text-muted mb-6">No item with id "{id}" exists in the catalog.</p>
		<Button href="/types" variant="secondary">← Back to types</Button>
	</div>
{:else}
	<div class="px-8 py-6 max-w-4xl mx-auto">
		<!-- Breadcrumb -->
		<nav class="text-sm text-muted mb-4">
			<a href="/types" class="hover:text-primary">Types</a>
			<span class="mx-1">/</span>
			<a href="/types/{type.slug}" class="hover:text-primary">{type.name}</a>
			<span class="mx-1">/</span>
			<span class="text-text">{item.name}</span>
		</nav>

		<!-- Item header -->
		<header class="mb-6 pb-6 border-b border-border">
			<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Catalog Entry · {item.id.toUpperCase()}</p>
			<h1 class="text-3xl font-bold entry-title mb-2">{item.name}</h1>
			{#if item.description}
				<p class="text-muted max-w-3xl leading-relaxed">{item.description}</p>
			{/if}
			<!-- Created/updated attribution -->
			<div class="mt-4 text-sm text-muted flex flex-wrap gap-x-6 gap-y-1">
				{#if createdBy}
					<span>Created by <a href="/users/{createdBy.id}" class="text-primary hover:underline">{createdBy.displayName}</a></span>
				{/if}
				{#if updatedBy && updatedBy.id !== createdBy?.id}
					<span>Last modified by <a href="/users/{updatedBy.id}" class="text-primary hover:underline">{updatedBy.displayName}</a></span>
				{/if}
				<span class="tabular-nums">Added {new Date(item.createdAt).toLocaleDateString()}</span>
				{#if item.updatedAt !== item.createdAt}
					<span class="tabular-nums">Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
				{/if}
			</div>
		</header>

		<!-- Metadata block -->
		<section class="mb-8">
			<p class="text-xs uppercase tracking-widest text-muted mb-3">§ Metadata</p>
			<dl class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
				{#each type.fields as field (field.id)}
					<div>
						<dt class="text-xs uppercase tracking-wider text-muted">{field.name}</dt>
						<dd class="mt-0.5">{item.metadata?.[field.id] ?? '—'}</dd>
					</div>
				{/each}
			</dl>
			{#if type.subcategories.length > 0 && item.subcategoryIds.length > 0}
				<div class="mt-4">
					<p class="text-xs uppercase tracking-wider text-muted mb-2">Subcategories</p>
					<div class="flex flex-wrap gap-1.5">
						{#each item.subcategoryIds as subId (subId)}
							{@const subcat = type.subcategories.find((s) => s.id === subId)}
							{#if subcat}
								<Tag size="sm" variant="primary" outline>{subcat.name}</Tag>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		</section>

		<!-- Bar chart -->
		<section class="mb-8">
			<p class="text-xs uppercase tracking-widest text-muted mb-3">§ {type.name} DNA</p>
			<AttributeBarChart attributes={type.attributes} ratings={item.averageRatings} />
		</section>

		<!-- Major attributes -->
		{#if majorAttributes.length > 0}
			<section class="mb-6">
				<p class="text-xs uppercase tracking-widest text-muted mb-1">§ Major Attributes</p>
				<p class="text-sm text-muted mb-3 max-w-2xl">
					The seven highest-rated attributes with an average above 50. These define the item's
					dominant characteristics — the traits that most strongly distinguish it within its type.
				</p>
				<ol class="space-y-1">
					{#each majorAttributes as entry, i (entry.attr.id)}
						<li class="flex items-baseline justify-between border-b border-border/50 py-1.5">
							<span class="text-sm">
								<span class="text-muted tabular-nums mr-2">{String(i + 1).padStart(2, '0')}.</span>
								{entry.attr.name}
							</span>
							<span class="text-sm tabular-nums font-medium">{entry.display}</span>
						</li>
					{/each}
				</ol>
			</section>
		{/if}

		<!-- Minor attributes -->
		{#if minorAttributes.length > 0}
			<section class="mb-8">
				<p class="text-xs uppercase tracking-widest text-muted mb-1">§ Minor Attributes</p>
				<p class="text-sm text-muted mb-3 max-w-2xl">
					The next seven highest-rated attributes with an average above 50 (ranks 8–14).
					These are secondary traits — present and notable, but less defining than the major attributes.
				</p>
				<ol class="space-y-1">
					{#each minorAttributes as entry, i (entry.attr.id)}
						<li class="flex items-baseline justify-between border-b border-border/50 py-1.5">
							<span class="text-sm">
								<span class="text-muted tabular-nums mr-2">{String(i + 8).padStart(2, '0')}.</span>
								{entry.attr.name}
							</span>
							<span class="text-sm tabular-nums font-medium">{entry.display}</span>
						</li>
					{/each}
				</ol>
			</section>
		{/if}

		<!-- Rating count -->
		<section class="mb-8 text-sm text-muted">
			<p>Based on {item.ratingCount} {item.ratingCount === 1 ? 'rating' : 'ratings'}.</p>
		</section>

		<!-- Similar items -->
		{#if similarItems.length > 0}
			<section class="mb-8">
				<div class="flex items-center justify-between mb-4">
					<div>
						<p class="text-xs uppercase tracking-widest text-muted mb-1">§ {type.name} Like This</p>
					</div>
					<Button
						href="/similar?items={item.id}"
						variant="ghost"
						class="similar-btn"
					>
						More Similar {pluralize(type.name)} →
					</Button>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{#each similarItems as { item: sim, similarity } (sim.id)}
						<SimilarItemCard
							item={sim}
							{type}
							{similarity}
							compact
							chartHeight={120}
							chartWidth={320}
						/>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Reviews -->
		{#if reviews.length > 0}
			<section class="mb-8">
				<p class="text-xs uppercase tracking-widest text-muted mb-1">§ Reviews ({reviews.length})</p>
				<p class="text-sm text-muted mb-4 max-w-2xl">
					User reviews of this item. Each review includes an overall score (0–5) and a written assessment.
				</p>
				<div class="flex flex-col gap-4">
					{#each reviews as review (review.id)}
						{@const reviewer = getUserById(review.userId)}
						<div class="border-l-2 border-border pl-4 py-2">
							<div class="flex items-baseline justify-between mb-1">
								<div class="flex items-baseline gap-2">
									{#if review.title}
										<h4 class="font-medium">{review.title}</h4>
									{/if}
									<span class="text-sm tabular-nums text-muted">{review.score}/5</span>
								</div>
								{#if reviewer}
									<a href="/users/{reviewer.id}" class="text-sm text-primary hover:underline">{reviewer.displayName}</a>
								{/if}
							</div>
							<p class="text-sm text-muted leading-relaxed">{review.body}</p>
							<p class="text-xs text-muted mt-2 tabular-nums">{new Date(review.createdAt).toLocaleDateString()}</p>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Recommendations -->
		{#if recommendations.length > 0}
			<section class="mb-8">
				<p class="text-xs uppercase tracking-widest text-muted mb-1">§ User Recommendations ({recommendations.length})</p>
				<p class="text-sm text-muted mb-4 max-w-2xl">
					Items that users have recommended as similar to or worth pairing with this one.
				</p>
				<div class="flex flex-col gap-3">
					{#each recommendations as rec (rec.id)}
						{@const recommender = getUserById(rec.userId)}
						{@const recommendedItem = getItemById(rec.itemId)}
						{#if recommendedItem}
							<div class="border-l-2 border-border pl-4 py-2">
								<div class="flex items-baseline justify-between mb-1">
									<a href="/items/{recommendedItem.id}" class="font-medium hover:text-primary">{recommendedItem.name}</a>
									{#if recommender}
										<a href="/users/{recommender.id}" class="text-sm text-primary hover:underline">{recommender.displayName}</a>
									{/if}
								</div>
								{#if rec.reason}
									<p class="text-sm text-muted leading-relaxed">{rec.reason}</p>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			</section>
		{/if}

		<!-- Change log -->
		{#if changeLogs.length > 0}
			<section class="mb-8">
				<p class="text-xs uppercase tracking-widest text-muted mb-1">§ Change History</p>
				<p class="text-sm text-muted mb-4 max-w-2xl">
					A wiki-style log of all changes to this item, tracking who changed what and when.
				</p>
				<ol class="flex flex-col gap-2">
					{#each changeLogs as entry (entry.id)}
						{@const author = entry.userId ? getUserById(entry.userId) : null}
						<li class="text-sm flex items-baseline gap-2 border-b border-border/50 pb-2">
							<span class="text-xs uppercase tracking-wider text-muted w-16 shrink-0">{entry.action}</span>
							<span class="flex-1">{entry.summary ?? `${entry.action} ${entry.entityType}`}</span>
							{#if author}
								<a href="/users/{author.id}" class="text-primary hover:underline text-xs">{author.displayName}</a>
							{:else}
								<span class="text-muted text-xs">system</span>
							{/if}
							<span class="text-muted text-xs tabular-nums">{new Date(entry.createdAt).toLocaleDateString()}</span>
						</li>
					{/each}
				</ol>
			</section>
		{/if}
	</div>
{/if}

<style lang="postcss">
	.similar-btn {
		color: var(--color-accent, #b73a4a);
		background: transparent;
		border: 1px solid var(--color-accent, #b73a4a);
		transition: background 0.15s ease, color 0.15s ease;
	}

	.similar-btn:hover {
		background: var(--color-accent, #b73a4a);
		color: white;
	}
</style>
