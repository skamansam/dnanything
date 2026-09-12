<script lang="ts">
	import { Tag, TagGroup } from 'twintrinsic';
	import DnaAnythingLogo from '$lib/components/DnaAnythingLogo.svelte';

	const builtinTypes = ['Music', 'Books', 'Movies', 'Wine', 'Beer'];

	const sections = [
		{
			number: '01',
			title: 'Genetic Algorithm Matching',
			icon: 'mdi:dna',
			body: [
				'DNAnything encodes every item as a genome — a vector of attribute ratings that captures its essential character. When you ask "find similar," a genetic algorithm evolves the optimal weighting of those attributes to surface the closest matches.',
				'Two modes are available. Fast Match uses deterministic distance calculations for instant results — ideal when you need a quick recommendation. Deep Match runs the full genetic algorithm, evolving candidate solutions across hundreds of generations to discover non-obvious connections that simple distance metrics miss.',
				'The GA tunes itself: mutation rates, crossover points, and selection pressure all adapt based on population diversity. You can watch it converge in real time, stop it early, or let it run to completion. Every result includes a breakdown of which attributes contributed most to the match.'
			]
		},
		{
			number: '02',
			title: 'Any Item Type',
			icon: 'mdi:shape-outline',
			body: [
				'Music, books, movies, wine, beer — these are just the beginning. DNAnything lets you define any item type with its own custom attribute set. A wine type might have tannin, acidity, body, sweetness, and finish. A book type might have prose density, plot complexity, character development, world-building, and pacing.',
				'Creating a new type is straightforward: name it, define the attributes that matter, and start adding items. Each attribute gets a 0–5 rating scale. Zero means the attribute is absent; five means it dominates. A song with heavy female vocals but no violin gets a 5 for female vocals and a 0 for violin.',
				'Types are community-owned once created. Any signed-in user can add items and rate attributes. Anonymous users can browse everything — they just can\'t create or rate until they log in.'
			]
		},
		{
			number: '03',
			title: 'Community Ratings',
			icon: 'mdi:star-outline',
			body: [
				'Every user rates items independently, and DNAnything computes a community average in real time. The item data page shows both: the aggregate score that represents the consensus, and each individual rating that contributes to it.',
				'This dual display matters because averages can mask interesting disagreement. An album that averages 3.5 for "heavy beats" might actually be polarizing — half the raters gave it 5, half gave it 1. Seeing the distribution tells you something the average alone can\'t.',
				'Ratings are stored per-user, so you always have your own rating history. Sign in to sync your ratings to the cloud, or stay anonymous and keep everything in localStorage — your data never leaves your device until you choose to upload it.'
			]
		},
		{
			number: '04',
			title: 'Local + Cloud',
			icon: 'mdi:cloud-sync-outline',
			body: [
				'DNAnything is local-first. You can browse types, view items, and rate attributes without ever creating an account. Everything is stored in your browser\'s localStorage under a pseudo-user ID — no server round-trips, no tracking, no data leaves your device.',
				'When you\'re ready to contribute to the community or access your ratings from another device, sign in with GitHub or email. The app detects any unsaved local data and offers to upload it to your cloud account — no manual export, no lost ratings.',
				'Cloud storage uses Supabase with row-level security, so your ratings are only visible to you until you choose to share them. The backend is abstracted behind a repository interface, meaning the entire data layer can be swapped to a different provider without touching the application code.'
			]
		}
	];
</script>

<div class="flex flex-col">
	<!-- Hero -->
	<header class="flex flex-col items-center justify-center text-center py-24 px-6 gap-6">
		<DnaAnythingLogo size={64} class="mb-2" />
		<h1 class="text-5xl font-bold text-primary-500 tracking-tight">DNAnything</h1>
		<p class="text-xl text-text opacity-70 max-w-2xl leading-relaxed">
			A genetic-algorithm catalog of cultural artifacts.
			Encode any item as a genome of attributes, rate it, and discover
			similar items through evolutionary matching.
		</p>
		<div class="flex gap-4 mt-4">
			<a
				href="/types"
				class="px-6 py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
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

	<!-- Abstract -->
	<section class="px-6 py-12 max-w-3xl mx-auto">
		<div class="border-l-2 border-primary-500 pl-6">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-primary-500 mb-3">Abstract</h2>
			<p class="text-base text-text leading-relaxed">
				DNAnything treats every item — a song, a book, a bottle of wine — as a genome:
				a vector of attribute ratings that captures its essential character. A genetic
				algorithm evolves which attributes matter most for any given comparison, surfacing
				matches that simple similarity metrics miss. Rate anonymously in your browser, or
				sign in to contribute to the community average and sync across devices.
			</p>
		</div>
	</section>

	<!-- Feature sections with alternating layout -->
	{#each sections as section, i (section.number)}
		<section
			class="px-6 py-16 max-w-5xl mx-auto"
		>
			<div class="flex flex-col md:flex-row items-center gap-8 {i % 2 === 1 ? 'md:flex-row-reverse' : ''}">
				<!-- Icon -->
				<div class="flex-shrink-0 w-32 h-32 flex items-center justify-center rounded-full border-2 border-primary-500 bg-surface">
					<iconify-icon icon={section.icon} class="text-5xl text-primary-500"></iconify-icon>
				</div>
				<!-- Text -->
				<div class="flex-1 max-w-xl">
					<div class="flex items-baseline gap-3 mb-4">
						<span class="text-sm font-normal text-primary-500 tabular-nums">{section.number}</span>
						<h2 class="text-2xl font-semibold text-text">{section.title}</h2>
					</div>
					{#each section.body as paragraph}
						<p class="text-base text-text opacity-80 leading-relaxed mb-4">{paragraph}</p>
					{/each}
				</div>
			</div>
		</section>
	{/each}

	<!-- Catalog Types -->
	<section class="px-6 py-12 max-w-3xl mx-auto border-t border-border">
		<h2 class="text-sm font-semibold uppercase tracking-wider text-primary-500 mb-4">Catalog Types</h2>
		<TagGroup>
			{#each builtinTypes as type (type)}
				<Tag label={type} />
			{/each}
		</TagGroup>
	</section>

	<!-- CTA -->
	<section class="text-center py-16 px-6">
		<a
			href="/types"
			class="inline-block px-8 py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
		>
			Browse Catalog →
		</a>
	</section>
</div>
