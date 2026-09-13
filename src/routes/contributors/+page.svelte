<script lang="ts">
	import { Card } from 'twintrinsic';
	import { getTopContributors, getRecentChangeLogs, getUserById, getItemById, getTypeById } from '$lib/data';

	const contributors = $derived(getTopContributors(20));
	const recentActivity = $derived(getRecentChangeLogs(10));
</script>

<svelte:head>
	<title>Contributors — DNAnything</title>
	<meta name="description" content="Top contributors to the DNAnything catalog and recent activity." />
</svelte:head>

<div class="px-8 py-6 max-w-5xl mx-auto">
	<!-- Breadcrumb -->
	<nav class="text-sm text-muted mb-4">
		<a href="/" class="hover:text-primary">Home</a>
		<span class="mx-1">/</span>
		<span class="text-text">Contributors</span>
	</nav>

	<!-- Header -->
	<header class="mb-8 pb-6 border-b border-border">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Community</p>
		<h1 class="text-3xl font-bold mb-2">Top Contributors</h1>
		<p class="text-muted max-w-3xl leading-relaxed">
			The users who have contributed the most to the catalog — creating types and items,
			providing ratings, writing reviews, and making recommendations. Contributions are weighted
			equally across all activity types.
		</p>
	</header>

	<!-- Contributors table -->
	{#if contributors.length === 0}
		<p class="text-muted py-8 text-center">No contributors yet.</p>
	{:else}
		<div class="overflow-x-auto mb-12">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="py-2 pr-4 w-12 text-muted font-medium">#</th>
						<th class="py-2 pr-4">Contributor</th>
						<th class="py-2 pr-4 text-muted font-medium text-right">Types</th>
						<th class="py-2 pr-4 text-muted font-medium text-right">Items Created</th>
						<th class="py-2 pr-4 text-muted font-medium text-right">Items Edited</th>
						<th class="py-2 pr-4 text-muted font-medium text-right">Ratings</th>
						<th class="py-2 pr-4 text-muted font-medium text-right">Reviews</th>
						<th class="py-2 pr-4 text-muted font-medium text-right">Recommendations</th>
						<th class="py-2 pr-4 text-muted font-medium text-right">Total</th>
					</tr>
				</thead>
				<tbody>
					{#each contributors as c, i (c.user.id)}
						<tr class="border-b border-border/50 hover:bg-surface/50 transition-colors">
							<td class="py-3 pr-4 tabular-nums text-muted">{String(i + 1).padStart(2, '0')}</td>
							<td class="py-3 pr-4">
								<a href="/users/{c.user.id}" class="font-medium hover:text-primary">{c.user.displayName}</a>
							</td>
							<td class="py-3 pr-4 text-right tabular-nums text-muted">{c.typesCreated}</td>
							<td class="py-3 pr-4 text-right tabular-nums text-muted">{c.itemsCreated}</td>
							<td class="py-3 pr-4 text-right tabular-nums text-muted">{c.itemsUpdated}</td>
							<td class="py-3 pr-4 text-right tabular-nums text-muted">{c.ratingsCount}</td>
							<td class="py-3 pr-4 text-right tabular-nums text-muted">{c.reviewsCount}</td>
							<td class="py-3 pr-4 text-right tabular-nums text-muted">{c.recommendationsCount}</td>
							<td class="py-3 pr-4 text-right tabular-nums font-medium">{c.totalContributions}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Recent activity -->
	{#if recentActivity.length > 0}
		<section>
			<p class="text-xs uppercase tracking-widest text-muted mb-1">§ Recent Activity</p>
			<p class="text-sm text-muted mb-4">The most recent changes across the entire catalog.</p>
			<ol class="flex flex-col gap-2">
				{#each recentActivity as entry (entry.id)}
					{@const author = entry.userId ? getUserById(entry.userId) : null}
					{@const entity = entry.entityType === 'item' ? getItemById(entry.entityId) : entry.entityType === 'type' ? getTypeById(entry.entityId) : null}
					<li class="text-sm flex items-baseline gap-2 border-b border-border/50 pb-2">
						<span class="text-xs uppercase tracking-wider text-muted w-16 shrink-0">{entry.action}</span>
						<span class="flex-1">
							{entry.summary ?? `${entry.action} ${entry.entityType}`}
							{#if entity && 'name' in entity}
								<a href="/{entry.entityType === 'type' ? 'types' : 'items'}/{entry.entityType === 'type' ? (entity as { slug: string }).slug : entry.entityId}" class="text-primary hover:underline ml-1">
									→
								</a>
							{/if}
						</span>
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
