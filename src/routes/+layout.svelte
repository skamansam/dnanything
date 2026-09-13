<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { App, type MenuItem, setIconset } from 'twintrinsic';
	import { page } from '$app/stores';
	import DnaAnythingLogo from '$lib/components/DnaAnythingLogo.svelte';
	import SupportButton from '$lib/components/SupportButton/SupportButton.svelte';
	import { type ColorTheme, colorThemes } from '$lib/theme';

	setIconset('mdi');

	let { children } = $props();

	const STORAGE_KEY = 'dnanything-theme';

	function loadFromStorage() {
		if (typeof window === 'undefined') return null;
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? JSON.parse(stored) : null;
		} catch {
			return null;
		}
	}

	function applyTheme(theme: ColorTheme) {
		document.documentElement.style.setProperty('--theme-primary', theme.primary);
		document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
		document.documentElement.style.setProperty('--theme-accent', theme.accent);
		document.documentElement.style.setProperty('--theme-bg', theme.bg);
		document.documentElement.style.setProperty('--theme-border', theme.border);
		document.documentElement.style.setProperty('--theme-text', theme.text);
	}

	onMount(() => {
		const stored = loadFromStorage();
		if (stored) {
			applyTheme(colorThemes[stored.selectedTheme] ?? colorThemes[0]);
		}
	});

	const siteLinks = [
		{ label: 'Home', href: '/', current: $page.url.pathname === '/' },
		{ label: 'Types', href: '/types', current: $page.url.pathname.startsWith('/types') },
		{ label: 'Contributors', href: '/contributors', current: $page.url.pathname.startsWith('/contributors') },
		{ label: 'Contribute', href: '/contribute', current: $page.url.pathname === '/contribute' },
		{ label: 'About', href: '/about', current: $page.url.pathname === '/about' }
	];

	const siteMenu: MenuItem[] = [
		{
			title: 'Browse',
			children: [
				{ title: 'All Types', link: '/types' },
				{ title: 'Music', link: '/types/music' },
				{ title: 'Books', link: '/types/books' },
				{ title: 'Movies', link: '/types/movies' },
				{ title: 'Wine', link: '/types/wine' },
				{ title: 'Beer', link: '/types/beer' }
			]
		},
		{
			title: 'Create',
			children: [
				{ title: 'New Type', link: '/types/new' },
				{ title: 'New Item', link: '/items/new' }
			]
		},
		{
			title: 'Account',
			children: [
				{ title: 'My Ratings', link: '/ratings' },
				{ title: 'Log In', link: '/login' }
			]
		}
	];

	// Hide the left sidebar and show search on the landing page
	const isHomePage = $page.url.pathname === '/';

	function handleSearch(payload: { query: string }) {
		// TODO: wire to actual search once types/items exist
		console.log('search:', payload.query);
	}
</script>

{#snippet logo(size)}
	<DnaAnythingLogo {size} />
{/snippet}

{#snippet leftPanel()}
	<div class="p-4 mt-auto">
		<p class="text-xs uppercase tracking-widest text-muted mb-3">§ Support the Project</p>
		<p class="text-sm text-muted mb-3 leading-relaxed">
			Help cover server costs. Every contribution keeps the catalog running.
		</p>
		<a href="https://www.buymeacoffee.com/skamansam" target="_blank" rel="noopener noreferrer" class="inline-block">
			<SupportButton text="Support Us" width="180" height="60" scale={0.5} />
		</a>
	</div>
{/snippet}

{#snippet footer()}
	<footer class="px-8 py-4 flex items-center justify-between gap-4 text-sm text-muted border-t border-border">
		<p>DNAnything — Genetic algorithm-based item comparison.</p>
		<a href="https://www.buymeacoffee.com/skamansam" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 hover:text-primary">
			<SupportButton text="Support Us" width="120" height="40" scale={0.35} />
		</a>
	</footer>
{/snippet}

<div class="min-h-screen bg-background text-text">
	<App
		appName="DNAnything"
		leftSidebarHidden={isHomePage}
		rightSidebarHidden
		showSearch
		user={{ name: 'Guest', href: '/login' }}
		brand={{
			name: 'DNAnything',
			href: '/',
			logo
		}}
		{siteMenu}
		{siteLinks}
		{leftPanel}
		{footer}
		onsearch={handleSearch}
	>
		{@render children?.()}
	</App>
</div>

<style lang="postcss">
	/* The logo wordmark already says "DNAnything" — hide the duplicate text label */
	:global(.app-header-brand-name) {
		display: none;
	}
</style>
