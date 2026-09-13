<script lang="ts">
	/**
	 * AttributeBarChart — the signature visualization for item pages.
	 *
	 * Wraps the Twintrinsic BarChart. Bars are in the type's defined
	 * attribute order (same position for every item of that type).
	 * Major attributes (top 7 above 50) are wine-colored, minor
	 * attributes (next 7 above 50) are a lighter wine, and attributes
	 * at or below 50 are muted. Major and minor attributes are labelled
	 * on the x-axis; below-50 attributes have no label.
	 */
	import { BarChart } from 'twintrinsic';
	import type { Attribute } from '$lib/types';

	interface Props {
		/** Attribute definitions from the type (defines bar order). */
		attributes: Attribute[];
		/** Rating values keyed by attribute id, stored as 0–5. */
		ratings: Record<string, number>;
		/** Chart height in pixels. */
		height?: number;
		/** Chart width in pixels. */
		width?: number;
		/** Whether to show x-axis labels for major/minor attributes. */
		showLabels?: boolean;
	}

	let { attributes, ratings, height = 300, width = 800, showLabels = true }: Props = $props();

	/** Convert stored 0–5 value to 0–100 display value. */
	function toDisplay(value: number): number {
		return Math.round(value * 20);
	}

	/** Entries in type-defined order with display values. */
	const entries = $derived(
		attributes.map((attr) => ({
			attr,
			display: toDisplay(ratings[attr.id] ?? 0)
		}))
	);

	/** Rank by display value descending to determine major/minor. */
	const ranked = $derived([...entries].sort((a, b) => b.display - a.display));

	/** Major: top 7 rated, only those above 50. */
	const majorIds = $derived(new Set(ranked.filter((e) => e.display > 50).slice(0, 7).map((e) => e.attr.id)));

	/** Minor: next 7 rated (ranks 8–14), only those above 50. */
	const minorIds = $derived(new Set(ranked.filter((e) => e.display > 50).slice(7, 14).map((e) => e.attr.id)));

	/** Wine color for major attributes. */
	const majorColor = 'var(--color-primary, #9b2335)';
	/** Lighter wine for minor attributes. */
	const minorColor = 'var(--color-accent, #b73a4a)';
	/** Muted for attributes at or below 50. */
	const mutedColor = 'var(--color-border, #ccc)';

	/** Per-bar colors in type-defined order. */
	const barColors = $derived(
		entries.map((e) =>
			majorIds.has(e.attr.id) ? majorColor
			: minorIds.has(e.attr.id) ? minorColor
			: mutedColor
		)
	);

	/** Labels: attribute name for major/minor, empty for below-50. Suppressed entirely when showLabels is false. */
	const labels = $derived(
		showLabels
			? entries.map((e) =>
				majorIds.has(e.attr.id) || minorIds.has(e.attr.id) ? e.attr.name : ''
			)
			: entries.map(() => '')
	);

	/** Single series with all display values (0–100) in type order. */
	const series = $derived([
		{
			label: 'Rating',
			data: entries.map((e) => e.display)
		}
	]);

	/** ARIA label for the chart. */
	const ariaLabel = $derived(
		`Bar chart of attribute ratings from 0 to 100. ${entries.map((e) => `${e.attr.name}: ${e.display}`).join(', ')}.`
	);
</script>

<BarChart
	{series}
	{labels}
	{barColors}
	{height}
	{width}
	showLegend={false}
	showGrid={true}
	yAxisLabel={undefined}
	aria-label={ariaLabel}
/>
