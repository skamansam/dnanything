<script lang="ts">
	/**
	 * SupportButton — client-only wrapper for sveltemeacoffee.
	 *
	 * The sveltemeacoffee package is a Svelte 3 component that uses
	 * @svelte-web-fonts/google, which can fail during SSR. This wrapper
	 * dynamically imports the component on the client only.
	 */
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let BuyMeACoffee: any = null;

	interface Props {
		text?: string;
		width?: string;
		height?: string;
		scale?: number;
	}

	let { text = 'Support Us', width = '180', height = '60', scale = 0.5 }: Props = $props();

	onMount(async () => {
		const mod = await import('sveltemeacoffee');
		BuyMeACoffee = mod.default;
		mounted = true;
	});
</script>

{#if mounted && BuyMeACoffee}
	<BuyMeACoffee {text} bgColor="#9b2335" outlineColor="#9b2335" textColor="#fff" coffeeColor="#e8e4e1" {width} {height} {scale} />
{:else}
	<div
		style="width: {Number(width) * scale * 0.392}px; height: {Number(height) * scale * 0.392}px;"
		class="inline-block"
	></div>
{/if}
