<script lang="ts">
	import { Tag } from 'twintrinsic';
	import DnaAnythingLogo from '$lib/components/DnaAnythingLogo.svelte';
	import { seedTypes, seedItems, seedUsers, seedReviews, seedRatings, seedRecommendations } from '$lib/data';

	const stats = [
		{ label: 'Item Types', value: seedTypes.length },
		{ label: 'Catalog Items', value: seedItems.length },
		{ label: 'Contributors', value: seedUsers.length },
		{ label: 'Ratings', value: seedRatings.length },
		{ label: 'Reviews', value: seedReviews.length },
		{ label: 'Recommendations', value: seedRecommendations.length }
	];

	const methodology = [
		{
			number: '01',
			title: 'Attribute Encoding',
			body: 'Every item is encoded as a genome — a vector of attribute ratings on a 0–5 scale. These ratings form the item\'s DNA, a compact representation of its essential character that can be compared against any other item of the same type.'
		},
		{
			number: '02',
			title: 'Distance Calculation',
			body: 'The Fast Match mode uses weighted Euclidean distance between attribute vectors. Each attribute contributes to the distance according to its weight, producing a similarity score in (0, 1]. Higher scores indicate greater similarity. This mode is deterministic and instant.'
		},
		{
			number: '03',
			title: 'Genetic Algorithm',
			body: 'The Deep Match mode runs a genetic algorithm that evolves the optimal weighting of attributes for a given query. Starting from a random population of weight vectors, the GA selects, crosses over, and mutates candidates across hundreds of generations, converging on weightings that surface non-obvious connections.'
		},
		{
			number: '04',
			title: 'Major & Minor Attributes',
			body: 'Each item\'s DNA is visualized as a bar chart with attributes in the type-defined order. The top seven attributes rated above 50 are "major" — the dominant characteristics. The next seven are "minor" — secondary traits. Attributes at or below 50 appear as muted bars, present but not defining.'
		},
		{
			number: '05',
			title: 'Community Consensus',
			body: 'Average ratings are computed from all user ratings for an item. The number of ratings indicates certainty: more ratings mean stronger consensus. Items with the same average score but different rating counts are ranked by the count, so a 4.5 from 20 ratings ranks above a 4.5 from 2.'
		},
		{
			number: '06',
			title: 'Wiki-Style Change Tracking',
			body: 'Every change to the catalog — creating a type, adding an item, updating a rating, writing a review — is logged in a wiki-style change history. Each entry records who made the change, what action was taken, and when. This creates a full provenance trail for every entity in the catalog. No data is ever hard-deleted; flagged content is hidden pending moderator review, preserving the full history.'
		}
	];

	const principles = [
		{ title: 'Auth-Required Public Contributions', body: 'All public contributions — creating types, adding items, rating attributes, writing reviews, making recommendations, using similarity search — require a free account. This ensures accountability and data quality. Anonymous users can browse everything.' },
		{ title: 'Local Contributions (Coming Soon)', body: 'A future feature will let anonymous users make local contributions stored in their browser and merged with public data on the client. These are private to that browser and uploadable on login. Deferred until local Docker deployment support is ready.' },
		{ title: 'Cloud Persistence', body: 'Signed-in users (Supabase Auth) get cloud persistence. All public contributions are stored in Postgres and immediately visible to the community.' },
		{ title: 'Community-Owned', body: 'Types and items are created by users and remain in the catalog. If a user removes their account, their contributions stay but are anonymized — attributed to "Anonymous User".' },
		{ title: 'Flag-Based Moderation', body: 'No data is hard-deleted. Content can be flagged by any logged-in user as inaccurate, offensive, or spam. Moderators review flags and can hide, revert, or dismiss them. This preserves the change log and keeps moderation reversible.' },
		{ title: 'Local Deployment (Coming Soon)', body: 'The app is designed to be deployable to a local server using Docker, setting up a local cloud environment. This enables self-hosting and offline-capable local contributions.' },
		{ title: 'Open Data', body: 'Seed data ships with the app as JSON files matching the database schema. When the backend is wired up, the same data loads into Postgres.' }
	];
</script>

<svelte:head>
	<title>About — DNAnything</title>
	<meta name="description" content="How DNAnything works — genetic algorithm matching, attribute encoding, and community-driven cataloging." />
</svelte:head>

<div class="px-8 py-6 max-w-4xl mx-auto">
	<!-- Breadcrumb -->
	<nav class="text-sm text-muted mb-4">
		<a href="/" class="hover:text-primary">Home</a>
		<span class="mx-1">/</span>
		<span class="text-text">About</span>
	</nav>

	<!-- Hero -->
	<header class="mb-12 pb-8 border-b border-border">
		<div class="mb-6">
			<DnaAnythingLogo size={80} variant="long" />
		</div>
		<p class="text-lg text-muted max-w-3xl leading-relaxed">
			A catalog and comparison tool that uses a genetic algorithm to find similar items —
			books, music, movies, wine, beer, and anything else you can define. Items are encoded
			as attribute vectors called DNA, and similarity is computed by evolving the optimal
			weighting of those attributes.
		</p>
	</header>

	<!-- Stats -->
	<section class="mb-12">
		<p class="text-xs uppercase tracking-widest text-muted mb-4">§ Catalog at a Glance</p>
		<div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
			{#each stats as stat (stat.label)}
				<div>
					<p class="text-3xl font-bold tabular-nums">{stat.value}</p>
					<p class="text-sm text-muted mt-1">{stat.label}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Abstract -->
	<section class="mb-12">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Abstract</p>
		<div class="border-l-2 border-primary pl-6">
			<p class="text-base leading-relaxed">
				DNAnything treats cultural artifacts — albums, books, films, wines — as specimens in a
				research catalog. Each specimen has a DNA profile: a vector of rated attributes that
				captures its measurable characteristics. A genetic algorithm evolves the optimal
				weighting of these attributes to find similar specimens, surfacing connections that
				simple distance metrics miss. The catalog is community-built: users create types,
				add items, rate attributes, write reviews, and recommend pairings. Every change is
				tracked in a wiki-style change log.
			</p>
		</div>
	</section>

	<!-- Methodology -->
	<section class="mb-12">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Methodology</p>
		<h2 class="text-2xl font-bold mb-2">How the Matching Works</h2>
		<p class="text-muted mb-8 max-w-3xl leading-relaxed">
			The similarity engine encodes items as genomes, calculates weighted distances, and
			optionally evolves the optimal weighting using a genetic algorithm.
		</p>
		<div class="flex flex-col gap-8">
			{#each methodology as method (method.number)}
				<div class="flex gap-6">
					<div class="text-2xl font-bold tabular-nums text-muted shrink-0 w-12">
						{method.number}
					</div>
					<div>
						<h3 class="text-lg font-bold mb-2">{method.title}</h3>
						<p class="text-muted leading-relaxed">{method.body}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Principles -->
	<section class="mb-12">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Design Principles</p>
		<h2 class="text-2xl font-bold mb-8">How the App is Built</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
			{#each principles as principle (principle.title)}
				<div class="border-l-2 border-border pl-4">
					<h3 class="font-bold mb-1">{principle.title}</h3>
					<p class="text-sm text-muted leading-relaxed">{principle.body}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Tech stack -->
	<section class="mb-12">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Technology</p>
		<h2 class="text-2xl font-bold mb-4">Built With</h2>
		<div class="flex flex-wrap gap-1.5">
			<Tag size="md" outline>SvelteKit</Tag>
			<Tag size="md" outline>Svelte 5</Tag>
			<Tag size="md" outline>TypeScript</Tag>
			<Tag size="md" outline>Tailwind CSS 4</Tag>
			<Tag size="md" outline>Twintrinsic</Tag>
			<Tag size="md" outline>Vite</Tag>
			<Tag size="md" outline>Supabase</Tag>
			<Tag size="md" outline>Drizzle ORM</Tag>
			<Tag size="md" outline>Postgres</Tag>
			<Tag size="md" outline>Vitest</Tag>
			<Tag size="md" outline>Playwright</Tag>
			<Tag size="md" outline>Biome</Tag>
			<Tag size="md" outline>pnpm</Tag>
			<Tag size="md" outline>Bunny Fonts</Tag>
		</div>
	</section>

	<!-- CTA -->
	<section class="text-center py-8 border-t border-border">
		<p class="text-xs uppercase tracking-widest text-muted mb-4">§ Get Started</p>
		<h2 class="text-2xl font-bold mb-2">Explore the Catalog</h2>
		<p class="text-muted mb-6 max-w-xl mx-auto">
			Browse item types, explore attribute DNA profiles, and find similar items using
			genetic algorithm matching.
		</p>
		<div class="flex justify-center gap-4">
			<a href="/types" class="text-primary hover:underline font-medium">Browse Types →</a>
			<a href="/contributors" class="text-primary hover:underline font-medium">Top Contributors →</a>
		</div>
	</section>
</div>
