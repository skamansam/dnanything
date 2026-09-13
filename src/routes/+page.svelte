<script lang="ts">
	import DnaAnythingLogo from '$lib/components/DnaAnythingLogo.svelte';
	import { seedTypes, seedItems, seedUsers, seedRatings, seedReviews } from '$lib/data';

	const stats = [
		{ label: 'Item Types', value: seedTypes.length },
		{ label: 'Catalog Items', value: seedItems.length },
		{ label: 'Contributors', value: seedUsers.length },
		{ label: 'Ratings', value: seedRatings.length },
		{ label: 'Reviews', value: seedReviews.length }
	];

	const sections = [
		{
			number: '01',
			title: 'Genetic Algorithm Matching',
			icon: 'mdi:dna',
			body: 'DNAnything encodes every item as a genome — a vector of attribute ratings that captures its essential character. When you ask "find similar," a genetic algorithm evolves the optimal weighting of those attributes to surface the closest matches. Two modes are available: Fast Match uses deterministic distance calculations for instant results, while Deep Match runs the full genetic algorithm across hundreds of generations to discover non-obvious connections.'
		},
		{
			number: '02',
			title: 'Any Item Type',
			icon: 'mdi:shape-outline',
			body: 'Music, books, movies, wine, beer — these are just the beginning. DNAnything lets you define any item type with its own custom attribute set. A wine type might have tannin, acidity, body, sweetness, and finish. A book type might have prose density, plot complexity, character development, world-building, and pacing. Each attribute gets a 0–5 rating scale that forms the item\'s DNA.'
		},
		{
			number: '03',
			title: 'Community Ratings',
			icon: 'mdi:star-outline',
			body: 'Every user rates items independently, and DNAnything computes a community average in real time. The item data page shows both the aggregate score that represents the consensus and each individual rating that contributes to it. More ratings mean stronger certainty — a 4.5 from 20 ratings ranks above a 4.5 from 2.'
		},
		{
			number: '04',
			title: 'Wiki-Style Change Tracking',
			icon: 'mdi:history',
			body: 'Every change to the catalog — creating a type, adding an item, updating a rating, writing a review — is logged in a wiki-style change history. Each entry records who made the change, what action was taken, and when. No data is ever hard-deleted; flagged content is hidden pending moderator review, preserving the full history.'
		}
	];

	const typeLinks = [
		{ name: 'Music', slug: 'music', icon: 'mdi:music' },
		{ name: 'Books', slug: 'books', icon: 'mdi:book-open-variant' },
		{ name: 'Movies', slug: 'movies', icon: 'mdi:movie' },
		{ name: 'Wine', slug: 'wine', icon: 'mdi:glass-wine' },
		{ name: 'Beer', slug: 'beer', icon: 'mdi:glass-mug' }
	];
</script>

<svelte:head>
	<title>DNAnything — Genetic Algorithm Catalog of Cultural Artifacts</title>
	<meta name="description" content="Compare anything using a genetic algorithm. Rate attributes, find similar items, and build a community catalog." />
</svelte:head>

<div class="flex flex-col">
	<!-- Hero -->
	<header class="flex flex-col items-center justify-center text-center py-20 px-6 gap-6">
		<DnaAnythingLogo size={72} variant="long" />
		<p class="text-xl text-muted max-w-2xl leading-relaxed">
			A genetic-algorithm catalog of cultural artifacts.
			Encode any item as a genome of attributes, rate it, and discover
			similar items through evolutionary matching.
		</p>
		<div class="flex gap-4 mt-2">
			<a
				href="/types"
				class="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
			>
				Browse Catalog
			</a>
			<a
				href="/about"
				class="px-6 py-3 rounded-lg border border-border text-text font-medium hover:bg-surface transition-colors"
			>
				Learn More
			</a>
		</div>
	</header>

	<!-- Stats -->
	<section class="px-6 py-8 max-w-4xl mx-auto w-full">
		<div class="grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
			{#each stats as stat (stat.label)}
				<div>
					<p class="text-3xl font-bold tabular-nums">{stat.value}</p>
					<p class="text-sm text-muted mt-1">{stat.label}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Catalog types -->
	<section class="px-6 py-8 max-w-4xl mx-auto w-full">
		<p class="text-xs uppercase tracking-widest text-muted mb-4 text-center">§ Browse by Type</p>
		<div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
			{#each typeLinks as t (t.slug)}
				<a
					href="/types/{t.slug}"
					class="flex flex-col items-center gap-3 p-6 rounded-lg border border-border hover:border-primary hover:bg-surface transition-colors"
				>
					<iconify-icon icon={t.icon} class="text-3xl text-primary"></iconify-icon>
					<span class="font-medium">{t.name}</span>
				</a>
			{/each}
		</div>
	</section>

	<!-- Feature sections -->
	{#each sections as section, i (section.number)}
		<section class="px-6 py-16 max-w-4xl mx-auto w-full">
			<div class="flex flex-col md:flex-row items-center gap-8 {i % 2 === 1 ? 'md:flex-row-reverse' : ''}">
				<div class="flex-shrink-0 w-24 h-24 flex items-center justify-center rounded-full border-2 border-primary bg-surface">
					<iconify-icon icon={section.icon} class="text-4xl text-primary"></iconify-icon>
				</div>
				<div class="flex-1 max-w-xl">
					<div class="flex items-baseline gap-3 mb-3">
						<span class="text-sm font-normal text-primary tabular-nums">{section.number}</span>
						<h2 class="text-2xl font-semibold">{section.title}</h2>
					</div>
					<p class="text-base text-muted leading-relaxed">{section.body}</p>
				</div>
			</div>
		</section>
	{/each}

	<!-- CTA -->
	<section class="text-center py-16 px-6 border-t border-border">
		<p class="text-xs uppercase tracking-widest text-muted mb-4">§ Get Started</p>
		<h2 class="text-2xl font-bold mb-4">Explore the Catalog</h2>
		<p class="text-muted mb-6 max-w-xl mx-auto">
			Browse item types, explore attribute DNA profiles, and find similar items.
			Create an account to rate, review, and contribute.
		</p>
		<div class="flex justify-center gap-4">
			<a
				href="/types"
				class="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
			>
				Browse Types
			</a>
			<a
				href="/contribute"
				class="px-6 py-3 rounded-lg border border-border text-text font-medium hover:bg-surface transition-colors"
			>
				Contribute
			</a>
		</div>
	</section>
</div>
