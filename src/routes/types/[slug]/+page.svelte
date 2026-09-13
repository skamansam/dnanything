<script lang="ts">
	import { page } from '$app/stores';
	import { Tag, Button } from 'twintrinsic';
	import SimilarItemCard from '$lib/components/SimilarItemCard/SimilarItemCard.svelte';
	import { getTypeBySlug, getItemsByTypeId, getTopItemsForType, getTopItemsForSubcategory, getItemsBySubcategory, getUserById, getChangeLogsForEntity, getParentType, getChildTypes } from '$lib/data';
	import type { Item, ItemType } from '$lib/types';

	const slug = $derived($page.params.slug);
	const type = $derived(getTypeBySlug(slug));
	const items = $derived(type ? getItemsByTypeId(type.id) : []);
	const createdBy = $derived(type?.createdByUserId ? getUserById(type.createdByUserId) : null);
	const updatedBy = $derived(type?.updatedByUserId ? getUserById(type.updatedByUserId) : null);
	const changeLogs = $derived(type ? getChangeLogsForEntity('type', type.id) : []);
	const topItems = $derived(type ? getTopItemsForType(type.id, 5) : []);
	const parentType = $derived(type ? getParentType(type.id) : undefined);
	const childTypes = $derived(type ? getChildTypes(type.id) : []);

	// Subcategory filter state — empty string = all
	let activeSubcategory = $state('');

	const filteredItems = $derived(
		type && activeSubcategory
			? getItemsBySubcategory(type.id, activeSubcategory)
			: items
	);

	const topForSubcategory = $derived(
		type && activeSubcategory
			? getTopItemsForSubcategory(type.id, activeSubcategory, 5)
			: topItems
	);

	// Multi-select for "Find Similar"
	let selectedIds = $state<Set<string>>(new Set());

	function toggleSelect(id: string) {
		if (selectedIds.has(id)) {
			selectedIds.delete(id);
		} else {
			selectedIds.add(id);
		}
		selectedIds = new Set(selectedIds);
	}

	const canFindSimilar = $derived(selectedIds.size >= 2);

	/** Convert 0–5 stored rating to 0–100 display value. */
	function toDisplay(value: number): number {
		return Math.round(value * 20);
	}

	/** Get the top-rated attribute name for an item. */
	function topAttribute(item: Item, itemType: ItemType): string | null {
		const entries = Object.entries(item.averageRatings);
		if (entries.length === 0) return null;
		const sorted = entries.sort((a, b) => b[1] - a[1]);
		const top = sorted[0];
		const attr = itemType.attributes.find((a) => a.id === top[0]);
		return attr?.name ?? null;
	}
</script>

<svelte:head>
	<title>{type?.name ?? 'Type'} — DNAnything</title>
	{#if type?.description}
		<meta name="description" content={type.description} />
	{/if}
</svelte:head>

{#if !type}
	<div class="px-8 py-16 max-w-2xl mx-auto text-center">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Error</p>
		<h1 class="text-2xl font-bold mb-4">Type not found</h1>
		<p class="text-muted mb-6">No type with slug "{slug}" exists in the catalog.</p>
		<Button href="/types" variant="secondary">← Back to all types</Button>
	</div>
{:else}
	<div class="px-8 py-6 max-w-5xl mx-auto">
		<!-- Breadcrumb -->
		<nav class="text-sm text-muted mb-4">
			<a href="/types" class="hover:text-primary">Types</a>
			{#if parentType}
				<span class="mx-1">/</span>
				<a href="/types/{parentType.slug}" class="hover:text-primary">{parentType.name}</a>
			{/if}
			<span class="mx-1">/</span>
			<span class="text-text">{type.name}</span>
		</nav>

		<!-- Type header -->
		<header class="mb-8 pb-6 border-b border-border">
			<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Type Definition</p>
			<h1 class="text-3xl font-bold mb-2">{type.name}</h1>
			{#if type.description}
				<p class="text-muted max-w-3xl leading-relaxed">{type.description}</p>
			{/if}

			<!-- Parent type link -->
			{#if parentType}
				<div class="mt-2 text-sm text-muted">
					Part of
					<a href="/types/{parentType.slug}" class="text-primary hover:underline">{parentType.name}</a>
				</div>
			{/if}

			<!-- Child types -->
			{#if childTypes.length > 0}
				<div class="mt-2 text-sm text-muted">
					Sub-types:
					{#each childTypes as child, i (child.id)}
						{#if i > 0}<span class="mx-1">·</span>{/if}
						<a href="/types/{child.slug}" class="text-primary hover:underline">{child.name}</a>
					{/each}
				</div>
			{/if}

			<!-- Created/updated attribution -->
			<div class="mt-3 text-sm text-muted flex flex-wrap gap-x-6 gap-y-1">
				{#if createdBy}
					<span>Created by <a href="/users/{createdBy.id}" class="text-primary hover:underline">{createdBy.displayName}</a></span>
				{/if}
				{#if updatedBy && updatedBy.id !== createdBy?.id}
					<span>Last modified by <a href="/users/{updatedBy.id}" class="text-primary hover:underline">{updatedBy.displayName}</a></span>
				{/if}
			</div>

			<!-- Attribute tags -->
			<div class="mt-4">
				<p class="text-xs uppercase tracking-widest text-muted mb-2">Attributes ({type.attributes.length})</p>
				<div class="flex flex-wrap gap-1.5">
					{#each type.attributes as attr (attr.id)}
						<Tag size="sm" outline href="/attributes/{attr.id}">{attr.name}</Tag>
					{/each}
				</div>
			</div>

			<!-- Field tags -->
			<div class="mt-3">
				<p class="text-xs uppercase tracking-widest text-muted mb-2">Fields ({type.fields.length})</p>
				<div class="flex flex-wrap gap-1.5">
					{#each type.fields as field (field.id)}
						<Tag size="sm" variant="secondary" outline>{field.name}{field.required ? ' *' : ''}</Tag>
					{/each}
				</div>
			</div>

			<!-- Subcategory tags -->
			{#if type.subcategories.length > 0}
				<div class="mt-3">
					<p class="text-xs uppercase tracking-widest text-muted mb-2">Subcategories ({type.subcategories.length})</p>
					<div class="flex flex-wrap gap-1.5">
						<Tag
							size="sm"
							variant="primary"
							outline={!activeSubcategory}
							clickable
							onclick={() => activeSubcategory = ''}
						>All</Tag>
						{#each type.subcategories as subcat (subcat.id)}
							<Tag
								size="sm"
								variant="primary"
								outline={activeSubcategory !== subcat.id}
								clickable
								onclick={() => activeSubcategory = subcat.id}
							>{subcat.name}</Tag>
						{/each}
					</div>
				</div>
			{/if}
		</header>

		<!-- Top User Suggestions -->
		{#if topForSubcategory.length > 0}
			<section class="mb-8">
				<p class="text-xs uppercase tracking-widest text-muted mb-1">§ Top User Suggestions</p>
				<p class="text-sm text-muted mb-4 max-w-2xl">
					The highest-rated {type.name.toLowerCase()} in the catalog, ranked by average review score
					and then by the number of ratings (more ratings indicate stronger consensus).
					{#if activeSubcategory}
						Filtered to the {type.subcategories.find((s) => s.id === activeSubcategory)?.name} subcategory.
					{/if}
				</p>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{#each topForSubcategory as item, i (item.id)}
						<div class="relative">
							<div class="absolute -left-8 top-3 text-xl tabular-nums text-muted font-bold hidden sm:block">
								{String(i + 1).padStart(2, '0')}
							</div>
							<SimilarItemCard
								{item}
								{type}
								compact
								chartHeight={120}
								chartWidth={320}
							/>
							<div class="mt-1 flex items-center gap-3 text-xs text-muted px-1">
								<span class="tabular-nums">
									<span class="font-medium text-text">{item.averageReviewScore.toFixed(1)}</span>/5
								</span>
								<span class="tabular-nums">{item.reviewCount} {item.reviewCount === 1 ? 'review' : 'reviews'}</span>
								<span class="tabular-nums">{item.ratingCount} {item.ratingCount === 1 ? 'rating' : 'ratings'}</span>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Item list header -->
		<div class="flex items-center justify-between mb-4">
			<div>
				<p class="text-xs uppercase tracking-widest text-muted mb-1">§ Catalog Entries</p>
				<h2 class="text-xl font-bold">
					Items ({filteredItems.length}){#if activeSubcategory} / {type.subcategories.find((s) => s.id === activeSubcategory)?.name}{/if}
				</h2>
			</div>
			<div class="flex gap-2">
				{#if canFindSimilar}
					<Button href="/similar?items={Array.from(selectedIds).join(',')}" variant="primary">
						Find Similar ({selectedIds.size})
					</Button>
				{/if}
				<Button href="/items/new?type={type.slug}" variant="secondary" outline>
					+ Add Item
				</Button>
			</div>
		</div>

		<!-- Item table -->
		{#if filteredItems.length === 0}
			<p class="text-muted py-8 text-center">
				{#if activeSubcategory}
					No items in this subcategory yet.
				{:else}
					The catalog is empty. No items have been added to this type yet.
				{/if}
			</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border text-left">
							<th class="py-2 pr-2 w-8"></th>
							<th class="py-2 pr-4">Name</th>
							{#each type.fields as field (field.id)}
								<th class="py-2 pr-4 text-muted font-medium">{field.name}</th>
							{/each}
							{#if type.subcategories.length > 0}
								<th class="py-2 pr-4 text-muted font-medium">Subcategories</th>
							{/if}
							<th class="py-2 pr-4 text-muted font-medium">Top Attribute</th>
							<th class="py-2 pr-4 text-muted font-medium text-right">Score</th>
							<th class="py-2 pr-4 text-muted font-medium text-right">Ratings</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredItems as item (item.id)}
							<tr class="border-b border-border/50 hover:bg-surface/50 transition-colors">
								<td class="py-3 pr-2">
									<input
										type="checkbox"
										checked={selectedIds.has(item.id)}
										onchange={() => toggleSelect(item.id)}
										aria-label="Select {item.name} for comparison"
										class="cursor-pointer accent-primary"
									/>
								</td>
								<td class="py-3 pr-4">
									<a href="/items/{item.id}" class="font-medium hover:text-primary entry-title">
										{item.name}
									</a>
								</td>
								{#each type.fields as field (field.id)}
									<td class="py-3 pr-4 text-muted">{item.metadata?.[field.id] ?? '—'}</td>
								{/each}
								{#if type.subcategories.length > 0}
									<td class="py-3 pr-4">
										<div class="flex flex-wrap gap-1">
											{#each item.subcategoryIds as subId (subId)}
												{@const subcat = type.subcategories.find((s) => s.id === subId)}
												{#if subcat}
													<Tag size="sm" variant="primary" outline>{subcat.name}</Tag>
												{/if}
											{/each}
										</div>
									</td>
								{/if}
								<td class="py-3 pr-4 text-muted">{topAttribute(item, type) ?? '—'}</td>
								<td class="py-3 pr-4 text-right tabular-nums">
									{#if item.reviewCount > 0}
										<span class="font-medium">{item.averageReviewScore.toFixed(1)}</span>
										<span class="text-muted text-xs">/5</span>
									{:else}
										<span class="text-muted">—</span>
									{/if}
								</td>
								<td class="py-3 pr-4 text-right tabular-nums text-muted">{item.ratingCount}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if selectedIds.size > 0 && !canFindSimilar}
				<p class="text-sm text-muted mt-4">
					Select {2 - selectedIds.size} more {2 - selectedIds.size === 1 ? 'item' : 'items'} to enable Find Similar.
				</p>
			{/if}
		{/if}

		<!-- Change log -->
		{#if changeLogs.length > 0}
			<section class="mt-8">
				<p class="text-xs uppercase tracking-widest text-muted mb-1">§ Change History</p>
				<p class="text-sm text-muted mb-4 max-w-2xl">
					A wiki-style log of all changes to this type, tracking who changed what and when.
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
