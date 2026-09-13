<script lang="ts">
	import { Button, Tag } from 'twintrinsic';
	import { page } from '$app/stores';
	import { getAllTypes, getTypeBySlug, getItemsByTypeId } from '$lib/data';
	import type { ItemType } from '$lib/types';

	const queryType = $derived($page.url.searchParams.get('type') ?? '');
	const allTypes = $derived(getAllTypes());
	const selectedType = $derived(queryType ? getTypeBySlug(queryType) : null);

	let name = $state('');
	let description = $state('');
	let metadata = $state<Record<string, string>>({});
	let subcategoryIds = $state<string[]>([]);
	let errors = $state<Record<string, string>>({});

	function toggleSubcategory(id: string) {
		if (subcategoryIds.includes(id)) {
			subcategoryIds = subcategoryIds.filter((s) => s !== id);
		} else {
			subcategoryIds = [...subcategoryIds, id];
		}
	}

	function handleSubmit() {
		errors = {};
		if (!selectedType) {
			errors.type = 'Please select a type';
			return;
		}
		if (!name.trim()) {
			errors.name = 'Name is required';
			return;
		}
		// Validate required fields
		for (const field of selectedType.fields) {
			if (field.required && !metadata[field.id]?.trim()) {
				errors[`field-${field.id}`] = `${field.name} is required`;
			}
		}

		if (Object.keys(errors).length > 0) return;

		// TODO: wire to repository.createItem()
		console.log('Create item:', {
			typeId: selectedType.id,
			name: name.trim(),
			description: description.trim(),
			metadata,
			subcategoryIds
		});
		// TODO: redirect to /items/{id}
	}
</script>

<svelte:head>
	<title>Add Item — DNAnything</title>
</svelte:head>

<div class="px-8 py-6 max-w-3xl mx-auto">
	<!-- Breadcrumb -->
	<nav class="text-sm text-muted mb-4">
		<a href="/types" class="hover:text-primary">Types</a>
		{#if selectedType}
			<span class="mx-1">/</span>
			<a href="/types/{selectedType.slug}" class="hover:text-primary">{selectedType.name}</a>
		{/if}
		<span class="mx-1">/</span>
		<span class="text-text">Add Item</span>
	</nav>

	<!-- Header -->
	<header class="mb-8 pb-6 border-b border-border">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Create</p>
		<h1 class="text-3xl font-bold mb-2">Add Item</h1>
		<p class="text-muted max-w-2xl leading-relaxed">
			Add a new item to the catalog. Fill in the metadata fields defined by the type,
			assign subcategories, and the community can start rating its attributes.
		</p>
	</header>

	<!-- Auth notice -->
	<div class="mb-8 p-4 border border-border rounded-lg bg-surface text-sm text-muted">
		<iconify-icon icon="mdi:information-outline" class="text-lg align-middle mr-1"></iconify-icon>
		Adding items requires a free account. <a href="/login" class="text-primary hover:underline">Sign in</a> to continue.
	</div>

	{#if !selectedType}
		<!-- Step 1: Select type -->
		<section class="flex flex-col gap-4">
			<label for="type-select" class="block text-sm font-medium mb-1.5">Select a Type <span class="text-primary">*</span></label>
			<p class="text-sm text-muted mb-2">Choose which type of item you're adding.</p>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{#each allTypes as t (t.id)}
					<a
						href="/items/new?type={t.slug}"
						class="p-4 rounded-lg border border-border hover:border-primary hover:bg-surface transition-colors flex items-center justify-between"
					>
						<div>
							<p class="font-medium">{t.name}</p>
							<p class="text-sm text-muted">{t.attributes.length} attributes · {t.fields.length} fields</p>
						</div>
						<iconify-icon icon="mdi:chevron-right" class="text-xl text-muted"></iconify-icon>
					</a>
				{/each}
			</div>
		</section>
	{:else}
		<!-- Step 2: Fill in item details -->
		<section class="flex flex-col gap-5">
			<!-- Selected type badge -->
			<div class="flex items-center gap-2 text-sm">
				<span class="text-muted">Type:</span>
				<Tag size="sm" variant="primary" outline>{selectedType.name}</Tag>
				<a href="/items/new" class="text-muted hover:text-primary text-xs">Change</a>
			</div>

			<!-- Name -->
			<div>
				<label for="name" class="block text-sm font-medium mb-1.5">Item Name <span class="text-primary">*</span></label>
				<input
					id="name"
					type="text"
					bind:value={name}
					placeholder="e.g. The Dark Side of the Moon"
					class="w-full px-4 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
				/>
				{#if errors.name}<p class="text-sm text-primary mt-1">{errors.name}</p>{/if}
			</div>

			<!-- Description -->
			<div>
				<label for="description" class="block text-sm font-medium mb-1.5">Description</label>
				<textarea
					id="description"
					bind:value={description}
					rows="3"
					placeholder="Describe this item..."
					class="w-full px-4 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
				></textarea>
			</div>

			<!-- Metadata fields -->
			{#if selectedType.fields.length > 0}
				<div class="border-t border-border pt-5">
					<p class="text-xs uppercase tracking-widest text-muted mb-4">§ Metadata</p>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{#each selectedType.fields as field (field.id)}
							<div>
								<label for="field-{field.id}" class="block text-sm font-medium mb-1.5">
									{field.name}{field.required ? ' *' : ''}
								</label>
								<input
									id="field-{field.id}"
									type="text"
									bind:value={metadata[field.id]}
									placeholder={field.description ?? field.name}
									class="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
								/>
								{#if errors[`field-${field.id}`]}
									<p class="text-sm text-primary mt-1">{errors[`field-${field.id}`]}</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Subcategories -->
			{#if selectedType.subcategories.length > 0}
				<div class="border-t border-border pt-5">
					<p class="text-xs uppercase tracking-widest text-muted mb-3">§ Subcategories</p>
					<p class="text-sm text-muted mb-3">Select all that apply.</p>
					<div class="flex flex-wrap gap-2">
						{#each selectedType.subcategories as sub (sub.id)}
							<button
								type="button"
								onclick={() => toggleSubcategory(sub.id)}
								class="px-3 py-1.5 rounded-lg text-sm border transition-colors
								{subcategoryIds.includes(sub.id) ? 'border-primary bg-primary text-white' : 'border-border bg-surface hover:bg-hover'}"
							>
								{sub.name}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Attribute preview -->
			{#if selectedType.attributes.length > 0}
				<div class="border-t border-border pt-5">
					<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Attributes</p>
					<p class="text-sm text-muted mb-3">
						This type has {selectedType.attributes.length} rated attributes. After the item is created,
						users can rate each attribute on a 0–5 scale to build its DNA profile.
					</p>
					<div class="flex flex-wrap gap-1.5">
						{#each selectedType.attributes as attr (attr.id)}
							<Tag size="sm" outline>{attr.name}</Tag>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Submit -->
			<div class="flex justify-end gap-3 pt-6 border-t border-border">
				<Button variant="secondary" href="/types/{selectedType.slug}">Cancel</Button>
				<Button variant="primary" onclick={handleSubmit}>Add Item</Button>
			</div>
		</section>
	{/if}
</div>
