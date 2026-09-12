<script lang="ts">
	/**
	 * DnaAnythingLogo — the DNAnything wordmark with a DNA double-helix
	 * replacing one of the letters (the "N"). Theme-aware via currentColor.
	 *
	 * This is a placeholder implementation; the final logo will be refined
	 * per docs/plans/BRANDING_AND_LOGO.md (prototype helix-as-N vs
	 * helix-as-A, pick the legible-at-16px winner).
	 */
	interface Props {
		/** Logo size in pixels (height). */
		size?: number;
		/** Accessible label when used as a navigable link. Omit for decorative use. */
		ariaLabel?: string;
		/** Extra classes for the root element. */
		class?: string;
	}

	let { size = 32, ariaLabel, class: className, ...rest }: Props = $props();
</script>

<span
	class="inline-flex items-center gap-0.5 font-bold tracking-tight {className}"
	style="font-size: {size}px; line-height: 1;"
	aria-label={ariaLabel}
	aria-hidden={ariaLabel ? undefined : 'true'}
	{...rest}
>
	<span>D</span>
	<!-- Double-helix N: two diagonal strands with base-pair rungs -->
	<svg
		class="inline-block"
		width={size * 0.7}
		height={size}
		viewBox="0 0 24 32"
		fill="none"
		stroke="currentColor"
		stroke-width="2.5"
		stroke-linecap="round"
		aria-hidden="true"
	>
		<!-- Left strand (diagonal of N) -->
		<line x1="4" y1="4" x2="20" y2="28" />
		<!-- Right strand (diagonal of N) -->
		<line x1="20" y1="4" x2="4" y2="28" />
		<!-- Base-pair rungs (the crossbars of the helix) -->
		<line x1="8" y1="8" x2="16" y2="8" stroke-width="1.5" opacity="0.7" />
		<line x1="6" y1="16" x2="18" y2="16" stroke-width="1.5" opacity="0.7" />
		<line x1="8" y1="24" x2="16" y2="24" stroke-width="1.5" opacity="0.7" />
	</svg>
	<span>A</span>
	<span class="font-normal opacity-80">nything</span>
</span>
