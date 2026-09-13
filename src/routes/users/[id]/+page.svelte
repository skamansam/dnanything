<script lang="ts">
	import { page } from '$app/stores';
	import { Button, Tag } from 'twintrinsic';
	import {
		getUserById,
		getUserContributions,
		getRatingsByUserId,
		getReviewsByUserId,
		getRecommendationsByUserId,
		getItemsCreatedByUser,
		getTypesCreatedByUser,
		getChangeLogsByUserId,
		getItemById,
		getTypeById
	} from '$lib/data';

	const id = $derived($page.params.id);
	const user = $derived(getUserById(id));
	const contributions = $derived(getUserContributions(id));
	const ratings = $derived(getRatingsByUserId(id));
	const reviews = $derived(getReviewsByUserId(id));
	const recommendations = $derived(getRecommendationsByUserId(id));
	const itemsCreated = $derived(getItemsCreatedByUser(id));
	const typesCreated = $derived(getTypesCreatedByUser(id));
	const changeLogs = $derived(getChangeLogsByUserId(id));
</script>

<svelte:head>
	<title>{user?.displayName ?? 'User'} — DNAnything</title>
</svelte:head>

{#if !user}
	<div class="px-8 py-16 max-w-2xl mx-auto text-center">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Error</p>
		<h1 class="text-2xl font-bold mb-4">User not found</h1>
		<p class="text-muted mb-6">No user with id "{id}" exists.</p>
		<Button href="/contributors" variant="secondary">← Back to Contributors</Button>
	</div>
{:else}
	<div class="px-8 py-6 max-w-5xl mx-auto">
		<!-- Breadcrumb -->
		<nav class="text-sm text-muted mb-4">
			<a href="/" class="hover:text-primary">Home</a>
			<span class="mx-1">/</span>
			<a href="/contributors" class="hover:text-primary">Contributors</a>
			<span class="mx-1">/</span>
			<span class="text-text">{user.displayName}</span>
		</nav>

		<!-- User header -->
		<header class="mb-8 pb-6 border-b border-border">
			<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Contributor Profile</p>
			<h1 class="text-3xl font-bold mb-2">{user.displayName}</h1>
			<p class="text-sm text-muted tabular-nums">Member since {new Date(user.createdAt).toLocaleDateString()}</p>

			{#if contributions}
				<!-- Contribution summary -->
				<div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
					<div>
						<p class="text-xs uppercase tracking-wider text-muted">Types Created</p>
						<p class="text-2xl font-bold tabular-nums">{contributions.typesCreated}</p>
					</div>
					<div>
						<p class="text-xs uppercase tracking-wider text-muted">Items Created</p>
						<p class="text-2xl font-bold tabular-nums">{contributions.itemsCreated}</p>
					</div>
					<div>
						<p class="text-xs uppercase tracking-wider text-muted">Ratings</p>
						<p class="text-2xl font-bold tabular-nums">{contributions.ratingsCount}</p>
					</div>
					<div>
						<p class="text-xs uppercase tracking-wider text-muted">Reviews</p>
						<p class="text-2xl font-bold tabular-nums">{contributions.reviewsCount}</p>
					</div>
					<div>
						<p class="text-xs uppercase tracking-wider text-muted">Recommendations</p>
						<p class="text-2xl font-bold tabular-nums">{contributions.recommendationsCount}</p>
					</div>
					<div>
						<p class="text-xs uppercase tracking-wider text-muted">Items Edited</p>
						<p class="text-2xl font-bold tabular-nums">{contributions.itemsUpdated}</p>
					</div>
					<div class="col-span-2">
						<p class="text-xs uppercase tracking-wider text-muted">Total Contributions</p>
						<p class="text-2xl font-bold tabular-nums text-primary">{contributions.totalContributions}</p>
					</div>
				</div>
			{/if}
		</header>

		<!-- Types created -->
		{#if typesCreated.length > 0}
			<section class="mb-8">
				<p class="text-xs uppercase tracking-widest text-muted mb-1">§ Types Created ({typesCreated.length})</p>
				<div class="flex flex-wrap gap-1.5 mt-2">
					{#each typesCreated as t (t.id)}
						<Tag size="md" outline href="/types/{t.slug}">{t.name}</Tag>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Items created -->
		{#if itemsCreated.length > 0}
			<section class="mb-8">
				<p class="text-xs uppercase tracking-widest text-muted mb-1">§ Items Created ({itemsCreated.length})</p>
				<ul class="mt-2 flex flex-col gap-1">
					{#each itemsCreated as item (item.id)}
						{@const itemType = getTypeById(item.typeId)}
						<li class="text-sm border-b border-border/50 pb-1">
							<a href="/items/{item.id}" class="font-medium hover:text-primary">{item.name}</a>
							{#if itemType}
								<span class="text-muted ml-2">({itemType.name})</span>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- Reviews -->
		{#if reviews.length > 0}
			<section class="mb-8">
				<p class="text-xs uppercase tracking-widest text-muted mb-1">§ Reviews ({reviews.length})</p>
				<div class="mt-2 flex flex-col gap-3">
					{#each reviews as review (review.id)}
						{@const reviewedItem = getItemById(review.itemId)}
						<div class="border-l-2 border-border pl-4 py-2">
							<div class="flex items-baseline justify-between mb-1">
								<div class="flex items-baseline gap-2">
									{#if reviewedItem}
										<a href="/items/{reviewedItem.id}" class="font-medium hover:text-primary">{reviewedItem.name}</a>
									{/if}
									<span class="text-sm tabular-nums text-muted">{review.score}/5</span>
								</div>
							</div>
							{#if review.title}
								<h4 class="font-medium text-sm">{review.title}</h4>
							{/if}
							<p class="text-sm text-muted leading-relaxed">{review.body}</p>
							<p class="text-xs text-muted mt-1 tabular-nums">{new Date(review.createdAt).toLocaleDateString()}</p>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Recommendations -->
		{#if recommendations.length > 0}
			<section class="mb-8">
				<p class="text-xs uppercase tracking-widest text-muted mb-1">§ Recommendations ({recommendations.length})</p>
				<div class="mt-2 flex flex-col gap-2">
					{#each recommendations as rec (rec.id)}
						{@const recommendedItem = getItemById(rec.itemId)}
						{@const targetItem = getItemById(rec.targetItemId)}
						<div class="border-l-2 border-border pl-4 py-1">
							<div class="text-sm">
								{#if recommendedItem}
									<a href="/items/{recommendedItem.id}" class="font-medium hover:text-primary">{recommendedItem.name}</a>
								{/if}
								<span class="text-muted mx-1">for</span>
								{#if targetItem}
									<a href="/items/{targetItem.id}" class="hover:text-primary">{targetItem.name}</a>
								{/if}
							</div>
							{#if rec.reason}
								<p class="text-sm text-muted leading-relaxed mt-1">{rec.reason}</p>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Ratings -->
		{#if ratings.length > 0}
			<section class="mb-8">
				<p class="text-xs uppercase tracking-widest text-muted mb-1">§ Ratings ({ratings.length})</p>
				<ul class="mt-2 flex flex-col gap-1">
					{#each ratings as rating (rating.id)}
						{@const ratedItem = getItemById(rating.itemId)}
						<li class="text-sm border-b border-border/50 pb-1">
							{#if ratedItem}
								<a href="/items/{ratedItem.id}" class="font-medium hover:text-primary">{ratedItem.name}</a>
							{/if}
							<span class="text-muted ml-2 tabular-nums">{Object.keys(rating.values).length} attributes rated</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- Change log -->
		{#if changeLogs.length > 0}
			<section class="mb-8">
				<p class="text-xs uppercase tracking-widest text-muted mb-1">§ Activity History ({changeLogs.length})</p>
				<p class="text-sm text-muted mb-4">A complete log of this user's changes to the catalog.</p>
				<ol class="flex flex-col gap-2">
					{#each changeLogs as entry (entry.id)}
						<li class="text-sm flex items-baseline gap-2 border-b border-border/50 pb-2">
							<span class="text-xs uppercase tracking-wider text-muted w-16 shrink-0">{entry.action}</span>
							<span class="flex-1">{entry.summary ?? `${entry.action} ${entry.entityType}`}</span>
							<span class="text-muted text-xs tabular-nums">{new Date(entry.createdAt).toLocaleDateString()}</span>
						</li>
					{/each}
				</ol>
			</section>
		{/if}
	</div>
{/if}
