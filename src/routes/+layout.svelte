<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { App, type MenuItem, setIconset } from 'twintrinsic';
	import { page } from '$app/stores';
	import DnaAnythingLogo from '$lib/components/DnaAnythingLogo.svelte';
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
		onsearch={handleSearch}
	>
		{@render children?.()}
	</App>
</div>
