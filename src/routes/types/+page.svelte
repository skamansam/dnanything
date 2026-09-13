<script lang="ts">
	import { Card, Tag, Button } from 'twintrinsic';
	import { seedTypes, getItemCount, getRootTypes, getChildTypes, getTypeById } from '$lib/data';
	import type { ItemType } from '$lib/types';

	const rootTypes = $derived(getRootTypes());
</script>

<svelte:head>
	<title>Catalog Types — DNAnything</title>
	<meta name="description" content="Browse all item types in the DNAnything catalog." />
</svelte:head>

<div class="px-8 py-6 max-w-6xl mx-auto">
	<header class="mb-8 pb-4 border-b border-border">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Catalog Index</p>
		<h1 class="text-3xl font-bold">Item Types</h1>
		<p class="mt-2 text-muted max-w-2xl">
			Each type defines a set of rated attributes and metadata fields. Items within a type
			share the same genome structure, enabling cross-comparison via the genetic algorithm.
		</p>
	</header>

	<!-- Root types with their children -->
	<div class="flex flex-col gap-8">
		{#each rootTypes as type (type.id)}
			<section>
				{@render typeCard(type)}
				<!-- Child types -->
				{#if getChildTypes(type.id).length > 0}
					<div class="ml-6 mt-4 pl-4 border-l border-border">
						<p class="text-xs uppercase tracking-widest text-muted mb-3">Sub-types</p>
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{#each getChildTypes(type.id) as child (child.id)}
								{@render typeCard(child)}
							{/each}
						</div>
					</div>
				{/if}
			</section>
		{/each}

		<!-- Types with no parent that aren't roots (shouldn't happen, but just in case) -->
		<!-- Create New Type card (auth-gated) -->
		<Card href="/types/new" hoverable class="border-dashed max-w-sm">
			<div class="flex flex-col items-center justify-center h-full py-8 text-center">
				<span class="text-3xl mb-2 text-muted">+</span>
				<p class="font-semibold">Create New Type</p>
				<p class="text-sm text-muted mt-1">Define your own attributes and fields</p>
			</div>
		</Card>
	</div>
</div>

{#snippet typeCard(type: ItemType)}
	<Card href="/types/{type.slug}" hoverable>
		{#snippet header()}
			<div class="flex items-baseline justify-between">
				<h2 class="text-xl font-bold entry-title">{type.name}</h2>
				<span class="text-xs text-muted tabular-nums">
					{getItemCount(type.id)} {getItemCount(type.id) === 1 ? 'item' : 'items'}
				</span>
			</div>
		{/snippet}

		<p class="text-sm text-muted leading-relaxed mb-4">{type.description}</p>

		<dl class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4">
			<dt class="text-muted">Attributes</dt>
			<dd class="tabular-nums">{type.attributes.length}</dd>
			<dt class="text-muted">Fields</dt>
			<dd class="tabular-nums">{type.fields.length}</dd>
		</dl>

		{#snippet footer()}
			<div class="flex flex-wrap gap-1.5">
				{#each type.attributes.slice(0, 5) as attr (attr.id)}
					<Tag size="sm" outline href="/attributes/{attr.id}">{attr.name}</Tag>
				{/each}
				{#if type.attributes.length > 5}
					<Tag size="sm" outline>+{type.attributes.length - 5}</Tag>
				{/if}
			</div>
		{/snippet}
	</Card>
{/snippet}
