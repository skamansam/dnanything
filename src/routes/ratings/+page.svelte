<script lang="ts">
	import { Tag } from 'twintrinsic';
	import { getRatingsByUserId, getItemById, getTypeById } from '$lib/data';
	import type { Rating, Item, ItemType } from '$lib/types';

	// TODO: replace with actual logged-in user ID from Supabase session
	const currentUserId = 'user-local-001';
	const userRatings = $derived(getRatingsByUserId(currentUserId));

	// Expand each rating into individual attribute ratings, then group by type
	const ratingsByType = $derived.by(() => {
		const groups: Record<string, { type: ItemType; items: Map<string, { item: Item; rating: Rating; attributes: { name: string; value: number }[] }[]> }> = {};
		for (const rating of userRatings) {
			const item = getItemById(rating.itemId);
			if (!item) continue;
			const type = getTypeById(item.typeId);
			if (!type) continue;
			if (!groups[type.id]) {
				groups[type.id] = { type, items: new Map() };
			}
			const attributes = Object.entries(rating.values).map(([attrId, value]) => {
				const attr = type.attributes.find((a) => a.id === attrId);
				return { name: attr?.name ?? attrId, value };
			});
			const existing = groups[type.id].items.get(item.id);
			if (existing) {
				existing.push({ item, rating, attributes });
			} else {
				groups[type.id].items.set(item.id, [{ item, rating, attributes }]);
			}
		}
		return Object.values(groups).map((g) => ({
			type: g.type,
			items: Array.from(g.items.entries()).map(([itemId, ratings]) => ({
				itemId,
				item: ratings[0].item,
				ratings
			}))
		}));
	});

	// Total number of individual attribute ratings
	const totalAttributeRatings = $derived(
		userRatings.reduce((sum, r) => sum + Object.keys(r.values).length, 0)
	);

	// Average rating value (0-5 → 0-100)
	const avgRating = $derived.by(() => {
		let total = 0;
		let count = 0;
		for (const r of userRatings) {
			for (const v of Object.values(r.values)) {
				total += v;
				count++;
			}
		}
		return count > 0 ? (total / count * 20).toFixed(1) : '—';
	});
</script>

<svelte:head>
	<title>My Ratings — DNAnything</title>
</svelte:head>

<div class="px-8 py-6 max-w-4xl mx-auto">
	<!-- Header -->
	<header class="mb-8 pb-6 border-b border-border">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Account</p>
		<h1 class="text-3xl font-bold mb-2">My Ratings</h1>
		<p class="text-muted max-w-2xl leading-relaxed">
			Your attribute ratings across the catalog. Each rating contributes to the community
			average and helps power the similarity engine.
		</p>
	</header>

	<!-- Auth notice -->
	<div class="mb-8 p-4 border border-border rounded-lg bg-surface text-sm text-muted">
		<iconify-icon icon="mdi:information-outline" class="text-lg align-middle mr-1"></iconify-icon>
		You need to be <a href="/login" class="text-primary hover:underline">signed in</a> to view and manage your ratings.
	</div>

	{#if userRatings.length === 0}
		<!-- Empty state -->
		<div class="text-center py-16">
			<iconify-icon icon="mdi:star-off-outline" class="text-5xl text-muted mb-4"></iconify-icon>
			<h2 class="text-xl font-medium mb-2">No ratings yet</h2>
			<p class="text-muted mb-6">Browse the catalog and start rating items to build your collection.</p>
			<a
				href="/types"
				class="inline-block px-6 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
			>
				Browse Types
			</a>
		</div>
	{:else}
		<!-- Stats -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
			<div class="p-4 rounded-lg border border-border">
				<p class="text-2xl font-bold tabular-nums">{userRatings.length}</p>
				<p class="text-sm text-muted">Items Rated</p>
			</div>
			<div class="p-4 rounded-lg border border-border">
				<p class="text-2xl font-bold tabular-nums">{ratingsByType.length}</p>
				<p class="text-sm text-muted">Types</p>
			</div>
			<div class="p-4 rounded-lg border border-border">
				<p class="text-2xl font-bold tabular-nums">{totalAttributeRatings}</p>
				<p class="text-sm text-muted">Attribute Ratings</p>
			</div>
			<div class="p-4 rounded-lg border border-border">
				<p class="text-2xl font-bold tabular-nums">{avgRating}</p>
				<p class="text-sm text-muted">Avg (0–100)</p>
			</div>
		</div>

		<!-- Ratings by type -->
		{#each ratingsByType as group (group.type.id)}
			<section class="mb-8">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold">
						<a href="/types/{group.type.slug}" class="hover:text-primary">{group.type.name}</a>
					</h2>
					<span class="text-sm text-muted">{group.items.length} item(s)</span>
				</div>

				<div class="border border-border rounded-lg overflow-hidden">
					<table class="w-full">
						<thead>
							<tr class="border-b border-border bg-surface">
								<th class="text-left text-xs font-medium uppercase tracking-wider text-muted px-4 py-3">Item</th>
								<th class="text-left text-xs font-medium uppercase tracking-wider text-muted px-4 py-3 hidden sm:table-cell">Attributes</th>
								<th class="text-right text-xs font-medium uppercase tracking-wider text-muted px-4 py-3 hidden md:table-cell">Rated</th>
							</tr>
						</thead>
						<tbody>
							{#each group.items as { item, ratings } (item.id)}
								<tr class="border-b border-border last:border-0 hover:bg-surface">
									<td class="px-4 py-3">
										<a href="/items/{item.id}" class="font-medium hover:text-primary">{item.name}</a>
										<p class="text-xs text-muted mt-0.5">{ratings.length} rating(s)</p>
									</td>
									<td class="px-4 py-3 hidden sm:table-cell">
										<div class="flex flex-wrap gap-1.5">
											{#each ratings[0].attributes as attr}
												<Tag size="sm" outline>{attr.name}: {attr.value}/5</Tag>
											{/each}
										</div>
									</td>
									<td class="px-4 py-3 text-right text-sm text-muted hidden md:table-cell">
										{new Date(ratings[0].rating.createdAt).toLocaleDateString()}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/each}
	{/if}
</div>
