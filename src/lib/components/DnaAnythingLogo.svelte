<script lang="ts">
	/**
	 * DnaAnythingLogo — the DNAnything wordmark in three variants.
	 *
	 * - **short**: "DNA" — the D and N in text, the A rendered as the
	 *   double-helix glyph from the favicon.
	 * - **long**: "DNAnything" — D, N, helix-A, then "nything" in a lighter
	 *   weight.
	 * - **icon**: just the helix-A glyph (the favicon), used as a
	 *   standalone square mark.
	 *
	 * The helix-A SVG path is identical to `static/favicon.svg` so the
	 * logo, favicon, and icon all share the same mark.
	 *
	 * Theme-aware via `currentColor`.
	 */
	interface Props {
		/** Logo size in pixels (height). */
		size?: number;
		/** Which logo variant to render. */
		variant?: 'short' | 'long' | 'icon';
		/** Accessible label when used as a navigable link. Omit for decorative use. */
		ariaLabel?: string;
		/** Extra classes for the root element. */
		class?: string;
	}

	let { size = 32, variant = 'long', ariaLabel, class: className, ...rest }: Props = $props();
</script>

{#if variant === 'icon'}
	<!-- Single-use icon: just the helix-A glyph (same as favicon.svg) -->
	<svg
		class="inline-block {className}"
		width={size}
		height={size}
		viewBox="0 0 32 32"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="square"
		aria-label={ariaLabel}
		aria-hidden={ariaLabel ? undefined : 'true'}
		{...rest}
	>
		<path
			d="m8.083 3.967c.722 3.455 1.924 5.529 4.748 7.031m12.2-6.821c-.841 3.245-1.923 5.289-5.769 6.911M8.018 27.837c5.564-19.543 10.793-19.844 16.991.186M9.947 22.977h13.096M10.127 7.993l12.921.03M9.075 5.048H23.98"
			fill="none"
			opacity="0.7"
		/>
	</svg>
{:else}
	<span
		class="inline-flex items-center gap-0.5 font-bold tracking-tight {className}"
		style="font-size: {size}px; line-height: 1;"
		aria-label={ariaLabel}
		aria-hidden={ariaLabel ? undefined : 'true'}
		{...rest}
	>
		<span>D</span>
		<span>N</span>
		<!-- Helix-A: the double-helix glyph from the favicon, scaled to match the text height -->
		<svg
			class="inline-block"
			width={size * 0.7}
			height={size}
			viewBox="0 -5 32 37"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="square"
			aria-hidden="true"
		>
			<path
				d="m8.083 3.967c.722 3.455 1.924 5.529 4.748 7.031m12.2-6.821c-.841 3.245-1.923 5.289-5.769 6.911M8.018 27.837c5.564-19.543 10.793-19.844 16.991.186M9.947 22.977h13.096M10.127 7.993l12.921.03M9.075 5.048H23.98"
				fill="none"
			/>
		</svg>
		{#if variant === 'long'}
			<span class="font-normal opacity-80">nything</span>
		{/if}
	</span>
{/if}
