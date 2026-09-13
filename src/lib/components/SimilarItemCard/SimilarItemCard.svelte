<script lang="ts">
	/**
	 * SimilarItemCard — reusable card for displaying a similar item.
	 *
	 * Shows the item name — author, an optional similarity percentage,
	 * an optional description, and a mini DNA bar chart. Used in both
	 * the "{type} Like This" section on item pages and the /similar page.
	 */
	import { Card } from 'twintrinsic';
	import AttributeBarChart from '$lib/components/AttributeBarChart/AttributeBarChart.svelte';
	import type { Attribute, Item, ItemType } from '$lib/types';

	interface Props {
		/** The item to display. */
		item: Item;
		/** The type definition (for attribute order and first field label). */
		type: ItemType;
		/** Similarity percentage (0–100). Omit to hide. */
		similarity?: number;
		/** Whether to show the item description. */
		showDescription?: boolean;
		/** Mini chart height in pixels. */
		chartHeight?: number;
		/** Mini chart width in pixels. */
		chartWidth?: number;
		/** Whether to show x-axis labels on the chart. */
		showChartLabels?: boolean;
		/** Card compact mode. */
		compact?: boolean;
	}

	let {
		item,
		type,
		similarity = undefined,
		showDescription = false,
		chartHeight = 150,
		chartWidth = 700,
		showChartLabels = false,
		compact = false
	}: Props = $props();

	/** First metadata field value (artist, author, winery, etc.). */
	const author = $derived(item.metadata?.[type.fields[0]?.id] ?? '');
</script>

<Card href="/items/{item.id}" hoverable {compact}>
	{#snippet header()}
		<div class="flex items-baseline justify-between">
			<h3 class={compact ? 'font-medium entry-title' : 'text-lg font-medium entry-title'}>
				{item.name}{author ? ` — ${author}` : ''}
			</h3>
			{#if similarity !== undefined}
				<span class="text-sm tabular-nums font-medium text-accent">
					{similarity}% similar
				</span>
			{/if}
		</div>
	{/snippet}

	{#if showDescription && item.description}
		<p class="text-sm text-muted mb-3">{item.description}</p>
	{/if}

	<div class="mt-2">
		<AttributeBarChart
			attributes={type.attributes}
			ratings={item.averageRatings}
			height={chartHeight}
			width={chartWidth}
			showLabels={showChartLabels}
		/>
	</div>
</Card>
