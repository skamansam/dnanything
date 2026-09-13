<script lang="ts">
	import { Tag } from 'twintrinsic';
	import SupportButton from '$lib/components/SupportButton/SupportButton.svelte';

	const contributionTypes = [
		{
			title: 'Create Item Types',
			body: 'Define new categories of items — books, music, movies, wine, beer, or anything you can imagine. Each type specifies the rated attributes and metadata fields that every item of that type will share. Types are the foundation of the catalog: without them, there are no items to compare.',
			requirement: 'Requires a free account.'
		},
		{
			title: 'Add Items',
			body: 'Add items to existing types. Fill in the metadata fields (artist, year, label, etc.) and assign subcategories. Once an item exists, the community can rate its attributes, write reviews, and find similar items through the genetic algorithm.',
			requirement: 'Requires a free account.'
		},
		{
			title: 'Rate Attributes',
			body: 'Rate the attributes of items on a 0–5 scale. Your ratings contribute to the community average, which forms the item\'s DNA — the attribute vector used by the similarity engine. More ratings mean stronger consensus and better matching.',
			requirement: 'Requires a free account (public). Local-only ratings coming soon.'
		},
		{
			title: 'Write Reviews',
			body: 'Share your assessment of an item with a written review and an overall score (0–5). Reviews appear on item pages alongside the attribute ratings, giving other users qualitative context beyond the numbers.',
			requirement: 'Requires a free account (public). Local-only reviews coming soon.'
		},
		{
			title: 'Recommend Items',
			body: 'Recommend one item as similar to or worth pairing with another. Recommendations appear on item pages and help other users discover connections the genetic algorithm might not surface — especially across different types or subcategories.',
			requirement: 'Requires a free account.'
		},
		{
			title: 'Use Similarity Search',
			body: 'Run the genetic algorithm matching engine to find items similar to your selection. The GA evolves the optimal weighting of attributes to surface non-obvious connections. Both fast (distance-based) and deep (GA-based) modes are available.',
			requirement: 'Requires a free account.'
		},
		{
			title: 'Edit and Improve',
			body: 'Update item metadata, correct errors, and refine type definitions. Every change is tracked in a wiki-style change log, so the full history of who changed what and when is preserved. This keeps the catalog accurate and accountable.',
			requirement: 'Requires a free account.'
		},
		{
			title: 'Flag Inaccurate Content',
			body: 'Help moderate the catalog by flagging content that is inaccurate, offensive, spam, or otherwise problematic. Flags are reviewed by moderators who can hide, revert, or dismiss them. This community-driven moderation keeps the catalog trustworthy without relying solely on admins.',
			requirement: 'Requires a free account.'
		}
	];

	const costs = [
		{ item: 'Database hosting (Supabase / Postgres)', detail: 'Stores all types, items, ratings, reviews, recommendations, and change logs. Scales with the number of users and catalog entries.' },
		{ item: 'Authentication (Supabase Auth)', detail: 'Manages user accounts, OAuth providers (GitHub, email magic link), and session management. Free tier covers the first 50,000 monthly active users.' },
		{ item: 'Web hosting', detail: 'Serves the SvelteKit application. The app is static-first, but server-side rendering and API routes require a Node.js runtime.' },
		{ item: 'Domain registration', detail: 'Annual cost for the dnanything.com domain.' },
		{ item: 'Development time', detail: 'Ongoing maintenance, bug fixes, feature development, and dependency updates. This is volunteer labor — your support makes it sustainable.' }
	];

	const privacyPoints = [
		{
			title: 'Read-Only Anonymous Access',
			body: 'Anonymous users can browse the entire catalog, view item DNA profiles, read reviews, and read recommendations — all without creating an account. No data is collected from anonymous browsing. You only need an account to make public contributions (rate, review, recommend, create, edit, flag) or use similarity search.'
		},
		{
			title: 'Local Contributions (Coming Soon)',
			body: 'A future feature will allow anonymous users to make local contributions — ratings, reviews, and recommendations stored in the browser\'s localStorage and merged with public data on the client side. These changes are private to your browser and never sent to the server. On login, you can choose to upload your local data to the cloud (making it public) or keep it private. This feature is deferred until local Docker deployment support is ready.'
		},
		{
			title: 'No Tracking',
			body: 'DNAnything does not use analytics, advertising trackers, or third-party cookies. We do not track your browsing behavior, clicks, or time on page. The only data we collect is what you explicitly create: types, items, ratings, reviews, recommendations, and flags.'
		},
		{
			title: 'Account Data',
			body: 'When you create an account via Supabase Auth (GitHub OAuth or email magic link), we store your display name and a unique user ID. We do not collect or store your email address directly — Supabase manages authentication and provides us with an opaque ID.'
		},
		{
			title: 'Public Contributions',
			body: 'All data you contribute while logged in — types, items, ratings, reviews, recommendations, and change log entries — is publicly visible. Your display name is associated with your contributions. If you want to browse without being tracked, simply use the site without logging in.'
		},
		{
			title: 'Account Removal via Anonymization',
			body: 'You can remove your account at any time. We anonymize rather than delete: your display name is replaced with "Anonymous User", your avatar is removed, and login is disabled. Your contributions (types, items, ratings, reviews, recommendations) remain in the catalog, attributed to "Anonymous User". This preserves the change history and community-owned content without leaving your personal data attached. The action is irreversible.'
		},
		{
			title: 'Flag-Based Moderation',
			body: 'No data is hard-deleted. If content is flagged as inaccurate, offensive, or spam, it is hidden pending moderator review. Hidden content remains in the database for audit purposes but is not visible to the public. This ensures the change log stays intact and moderation decisions are reversible.'
		},
		{
			title: 'Cookies',
			body: 'DNAnything uses a single session cookie to maintain your authentication state after login. No other cookies are set. The cookie is removed when you log out or close your browser.'
		},
		{
			title: 'Third-Party Services',
			body: 'The app uses Bunny Fonts (GDPR-friendly font delivery) and Buy Me A Coffee (payment processing for financial contributions). Bunny Fonts does not track users. Buy Me A Coffee processes payments on their own platform — we do not handle or store payment information.'
		},
		{
			title: 'Local Deployment (Coming Soon)',
			body: 'DNAnything is designed to be deployable to a local server using Docker, setting up a local cloud environment. This enables self-hosting and offline-capable local contributions. In a local deployment, similarity search may be available to all users on the local network. This feature is planned for a future release.'
		}
	];
</script>

<svelte:head>
	<title>Contribute — DNAnything</title>
	<meta name="description" content="How to contribute to DNAnything — data, financial support, and privacy policy." />
</svelte:head>

<div class="px-8 py-6 max-w-4xl mx-auto">
	<!-- Breadcrumb -->
	<nav class="text-sm text-muted mb-4">
		<a href="/" class="hover:text-primary">Home</a>
		<span class="mx-1">/</span>
		<span class="text-text">Contribute</span>
	</nav>

	<!-- Hero -->
	<header class="mb-12 pb-8 border-b border-border">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Contribute</p>
		<h1 class="text-3xl font-bold mb-4">Help Build the Catalog</h1>
		<p class="text-lg text-muted max-w-3xl leading-relaxed">
			DNAnything is a community-driven catalog. It exists because users contribute their time,
			knowledge, and (occasionally) money. There are two ways to help: contribute data by
			creating types, adding items, and rating attributes, or contribute financially to cover
			server costs and keep the project running.
		</p>
	</header>

	<!-- Contributing Data -->
	<section class="mb-12">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Contributing Data</p>
		<h2 class="text-2xl font-bold mb-2">Ways to Contribute</h2>
		<p class="text-muted mb-8 max-w-3xl leading-relaxed">
			Every contribution — from a single rating to a fully defined item type — makes the catalog
			more useful. Here are the ways you can help, and what each requires.
		</p>
		<div class="flex flex-col gap-6">
			{#each contributionTypes as c (c.title)}
				<div class="border-l-2 border-border pl-6">
					<div class="flex items-baseline justify-between mb-1">
						<h3 class="text-lg font-bold">{c.title}</h3>
						<Tag size="sm" variant="secondary" outline>{c.requirement}</Tag>
					</div>
					<p class="text-muted leading-relaxed">{c.body}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Financial Support -->
	<section class="mb-12">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Financial Support</p>
		<h2 class="text-2xl font-bold mb-2">Why We Need Your Help</h2>
		<p class="text-muted mb-6 max-w-3xl leading-relaxed">
			DNAnything is free to use and open-source. It runs on infrastructure that costs real money
			every month. There are no ads, no premium tiers, and no venture capital — just a community
			of users who want a better way to compare cultural artifacts. Your financial support
			directly covers the costs below.
		</p>

		<!-- Cost breakdown -->
		<div class="mb-8">
			<p class="text-xs uppercase tracking-widest text-muted mb-3">Where Your Money Goes</p>
			<dl class="grid grid-cols-1 gap-4">
				{#each costs as cost (cost.item)}
					<div class="border-b border-border/50 pb-3">
						<dt class="font-medium">{cost.item}</dt>
						<dd class="text-sm text-muted mt-1 leading-relaxed">{cost.detail}</dd>
					</div>
				{/each}
			</dl>
		</div>

		<!-- Buy Me A Coffee CTA -->
		<div class="border-l-2 border-primary pl-6 py-4">
			<h3 class="text-lg font-bold mb-2">Support Us on Buy Me A Coffee</h3>
			<p class="text-muted mb-4 leading-relaxed max-w-2xl">
				We use Buy Me A Coffee for financial contributions because it's simple, transparent,
				and doesn't require a subscription. You can contribute any amount, one time. Every
				contribution goes directly to server costs — there are no middlemen and no profit
				margin. If you can't contribute financially, contributing data is equally valuable.
			</p>
			<a href="https://www.buymeacoffee.com/skamansam" target="_blank" rel="noopener noreferrer" class="inline-block">
				<SupportButton text="Support DNAnything" width="220" height="60" scale={0.5} />
			</a>
		</div>
	</section>

	<!-- Privacy Policy -->
	<section class="mb-12">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Privacy Policy</p>
		<h2 class="text-2xl font-bold mb-2">How We Handle Your Data</h2>
		<p class="text-muted mb-8 max-w-3xl leading-relaxed">
			DNAnything is designed to be as privacy-respecting as possible. The app is local-first,
			uses no trackers, and collects only the data you explicitly create. Here's the full
			breakdown.
		</p>
		<div class="flex flex-col gap-6">
			{#each privacyPoints as p (p.title)}
				<div class="border-l-2 border-border pl-6">
					<h3 class="font-bold mb-1">{p.title}</h3>
					<p class="text-sm text-muted leading-relaxed">{p.body}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Summary / CTA -->
	<section class="text-center py-8 border-t border-border">
		<p class="text-xs uppercase tracking-widest text-muted mb-4">§ Get Started</p>
		<h2 class="text-2xl font-bold mb-2">Start Contributing</h2>
		<p class="text-muted mb-6 max-w-xl mx-auto">
			Browse the catalog, rate a few items, or create a new type. Every contribution counts.
		</p>
		<div class="flex justify-center gap-4">
			<a href="/types" class="text-primary hover:underline font-medium">Browse Types →</a>
			<a href="/contributors" class="text-primary hover:underline font-medium">See Top Contributors →</a>
			<a href="/about" class="text-primary hover:underline font-medium">Learn More →</a>
		</div>
	</section>
</div>
