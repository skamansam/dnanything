<script lang="ts">
	import { Button, Tag } from 'twintrinsic';
	import { page } from '$app/stores';
	import { getAllTypes, getTypeBySlug } from '$lib/data';
	import type { ItemType } from '$lib/types';

	interface AttributeDraft {
		id: string;
		name: string;
		description: string;
	}

	interface FieldDraft {
		id: string;
		name: string;
		description: string;
		required: boolean;
	}

	interface SubcategoryDraft {
		id: string;
		name: string;
		description: string;
	}

	const allTypes = $derived(getAllTypes());

	let cloneFromSlug = $state('');
	let parentTypeId = $state<string | null>(null);
	let name = $state('');
	let slug = $state('');
	let description = $state('');
	let step = $state(1);

	let attributes = $state<AttributeDraft[]>([{ id: '', name: '', description: '' }]);
	let fields = $state<FieldDraft[]>([{ id: '', name: '', description: '', required: false }]);
	let subcategories = $state<SubcategoryDraft[]>([{ id: '', name: '', description: '' }]);

	let errors = $state<Record<string, string>>({});

	/** Clone an existing type's attributes, fields, and subcategories as a starting point. */
	function handleClone() {
		if (!cloneFromSlug) return;
		const source = getTypeBySlug(cloneFromSlug);
		if (!source) return;

		// Pre-fill name and description as suggestions (user can change them)
		name = `${source.name} (Copy)`;
		description = source.description ?? '';
		slug = slugFromName(name);
		parentTypeId = source.id;

		// Copy attributes
		attributes = source.attributes.map((a) => ({
			id: a.id,
			name: a.name,
			description: a.description ?? ''
		}));

		// Copy fields
		fields = source.fields.map((f) => ({
			id: f.id,
			name: f.name,
			description: f.description ?? '',
			required: f.required ?? false
		}));

		// Copy subcategories
		subcategories = source.subcategories.map((s) => ({
			id: s.id,
			name: s.name,
			description: s.description ?? ''
		}));
	}

	/** Auto-generate slug from name. */
	function generateSlug() {
		if (!slug || slug === slugFromName(name)) {
			slug = slugFromName(name);
		}
	}

	function slugFromName(n: string): string {
		return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}

	function addAttribute() {
		attributes = [...attributes, { id: '', name: '', description: '' }];
	}

	function removeAttribute(i: number) {
		attributes = attributes.filter((_, idx) => idx !== i);
	}

	function addField() {
		fields = [...fields, { id: '', name: '', description: '', required: false }];
	}

	function removeField(i: number) {
		fields = fields.filter((_, idx) => idx !== i);
	}

	function addSubcategory() {
		subcategories = [...subcategories, { id: '', name: '', description: '' }];
	}

	function removeSubcategory(i: number) {
		subcategories = subcategories.filter((_, idx) => idx !== i);
	}

	function validateStep(s: number): boolean {
		errors = {};
		if (s === 1) {
			if (!name.trim()) errors.name = 'Name is required';
			if (!slug.trim()) errors.slug = 'Slug is required';
		}
		if (s === 2) {
			const validFields = fields.filter((f) => f.name.trim());
			if (validFields.length === 0) errors.fields = 'At least one field is required';
		}
		if (s === 3) {
			const validAttrs = attributes.filter((a) => a.name.trim());
			if (validAttrs.length === 0) errors.attributes = 'At least one attribute is required';
		}
		return Object.keys(errors).length === 0;
	}

	function nextStep() {
		if (validateStep(step)) {
			step = Math.min(step + 1, 4);
		}
	}

	function prevStep() {
		step = Math.max(step - 1, 1);
	}

	function handleSubmit() {
		// TODO: wire to repository.createType()
		const cleanAttributes = attributes
			.filter((a) => a.name.trim())
			.map((a) => ({
				id: a.id || slugFromName(a.name),
				name: a.name.trim(),
				description: a.description.trim() || undefined
			}));
		const cleanFields = fields
			.filter((f) => f.name.trim())
			.map((f) => ({
				id: f.id || slugFromName(f.name),
				name: f.name.trim(),
				description: f.description.trim() || undefined,
				required: f.required
			}));
		const cleanSubcats = subcategories
			.filter((s) => s.name.trim())
			.map((s) => ({
				id: s.id || slugFromName(s.name),
				name: s.name.trim(),
				description: s.description.trim() || undefined
			}));

		console.log('Create type:', { name, slug, description, parentTypeId, attributes: cleanAttributes, fields: cleanFields, subcategories: cleanSubcats });
		// TODO: redirect to /types/{slug}
	}

	const steps = ['Name & Description', 'Metadata Fields', 'Attributes', 'Subcategories & Review'];
</script>

<svelte:head>
	<title>Create Type — DNAnything</title>
</svelte:head>

<div class="px-8 py-6 max-w-3xl mx-auto">
	<!-- Breadcrumb -->
	<nav class="text-sm text-muted mb-4">
		<a href="/types" class="hover:text-primary">Types</a>
		<span class="mx-1">/</span>
		<span class="text-text">New Type</span>
	</nav>

	<!-- Header -->
	<header class="mb-8 pb-6 border-b border-border">
		<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Create</p>
		<h1 class="text-3xl font-bold mb-2">New Item Type</h1>
		<p class="text-muted max-w-2xl leading-relaxed">
			Define a new category of items. Each type specifies the metadata fields (like artist,
			year, label) and the rated attributes (like complexity, intensity, sweetness) that form
			each item's DNA.
		</p>
	</header>

	<!-- Auth notice -->
	<div class="mb-8 p-4 border border-border rounded-lg bg-surface text-sm text-muted">
		<iconify-icon icon="mdi:information-outline" class="text-lg align-middle mr-1"></iconify-icon>
		Creating types requires a free account. <a href="/login" class="text-primary hover:underline">Sign in</a> to continue.
	</div>

	<!-- Clone from existing -->
	{#if step === 1}
		<div class="mb-8 p-4 border border-border rounded-lg bg-surface">
			<p class="text-xs uppercase tracking-widest text-muted mb-2">§ Clone from Existing Type</p>
			<p class="text-sm text-muted mb-3">
				Start from an existing type to copy its attributes, fields, and subcategories as a
				starting point. The new type is fully independent after creation.
			</p>
			<div class="flex gap-3 items-end">
				<div class="flex-1">
					<label for="clone-from" class="block text-sm font-medium mb-1.5">Clone from</label>
					<select
						id="clone-from"
						bind:value={cloneFromSlug}
						class="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
					>
						<option value="">— Select a type to clone —</option>
						{#each allTypes as t (t.id)}
							<option value={t.slug}>{t.name}</option>
						{/each}
					</select>
				</div>
				<Button variant="secondary" onclick={handleClone} disabled={!cloneFromSlug}>
					Clone
				</Button>
			</div>
		</div>
	{/if}

	<!-- Step indicator -->
	<div class="flex items-center gap-2 mb-8">
		{#each steps as s, i (s)}
			<div class="flex items-center gap-2">
				<span
					class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium tabular-nums
					{step > i + 1 ? 'bg-primary text-white' : step === i + 1 ? 'border-2 border-primary text-primary' : 'border border-border text-muted'}"
				>
					{step > i + 1 ? '✓' : i + 1}
				</span>
				<span class="text-sm {step === i + 1 ? 'text-text font-medium' : 'text-muted'} hidden sm:inline">{s}</span>
			</div>
			{#if i < steps.length - 1}
				<div class="flex-1 h-px {step > i + 1 ? 'bg-primary' : 'bg-border'}"></div>
			{/if}
		{/each}
	</div>

	<!-- Step 1: Name & Description -->
	{#if step === 1}
		<section class="flex flex-col gap-5">
			<div>
				<label for="name" class="block text-sm font-medium mb-1.5">Type Name <span class="text-primary">*</span></label>
				<input
					id="name"
					type="text"
					bind:value={name}
					oninput={generateSlug}
					placeholder="e.g. Music, Books, Wine"
					class="w-full px-4 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
				/>
				{#if errors.name}<p class="text-sm text-primary mt-1">{errors.name}</p>{/if}
			</div>

			<div>
				<label for="slug" class="block text-sm font-medium mb-1.5">URL Slug <span class="text-primary">*</span></label>
				<input
					id="slug"
					type="text"
					bind:value={slug}
					placeholder="e.g. music, books, wine"
					class="w-full px-4 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
				/>
				<p class="text-xs text-muted mt-1.5">Used in the URL: /types/{slug || '...'}</p>
				{#if errors.slug}<p class="text-sm text-primary mt-1">{errors.slug}</p>{/if}
			</div>

			<div>
				<label for="parent-type" class="block text-sm font-medium mb-1.5">Parent Type</label>
				<select
					id="parent-type"
					bind:value={parentTypeId}
					class="w-full px-4 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
				>
					<option value={null}>— No parent (root type) —</option>
					{#each allTypes as t (t.id)}
						<option value={t.id}>{t.name}</option>
					{/each}
				</select>
				<p class="text-xs text-muted mt-1.5">
					Optional. Sets a hierarchical link for organization. No runtime inheritance —
					the new type is fully independent.
				</p>
			</div>

			<div>
				<label for="description" class="block text-sm font-medium mb-1.5">Description</label>
				<textarea
					id="description"
					bind:value={description}
					rows="3"
					placeholder="Describe what this type is about..."
					class="w-full px-4 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
				></textarea>
			</div>
		</section>

	<!-- Step 2: Fields -->
	{:else if step === 2}
		<section class="flex flex-col gap-4">
			<p class="text-sm text-muted mb-2">
				Define the metadata fields that each item of this type will have (e.g. artist, year, label).
				These are text fields, not rated — they describe the item, not its character.
			</p>
			{#if errors.fields}<p class="text-sm text-primary">{errors.fields}</p>{/if}
			{#each fields as field, i (i)}
				<div class="border border-border rounded-lg p-4 flex flex-col gap-3">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-muted">Field {i + 1}</span>
						{#if fields.length > 1}
							<button type="button" onclick={() => removeField(i)} class="text-muted hover:text-primary text-sm">
								Remove
							</button>
						{/if}
					</div>
					<input
						type="text"
						bind:value={field.name}
						placeholder="Field name (e.g. Artist, Year, Label)"
						class="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
					/>
					<input
						type="text"
						bind:value={field.description}
						placeholder="Description (optional)"
						class="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
					/>
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" bind:checked={field.required} class="rounded" />
						Required field
					</label>
				</div>
			{/each}
			<Button variant="secondary" onclick={addField} class="self-start">
				+ Add Field
			</Button>
		</section>

	<!-- Step 3: Attributes -->
	{:else if step === 3}
		<section class="flex flex-col gap-4">
			<p class="text-sm text-muted mb-2">
				Define the rated attributes that form each item's DNA. These are the characteristics
				that users rate on a 0–5 scale (displayed as 0–100). They power the similarity engine.
			</p>
			{#if errors.attributes}<p class="text-sm text-primary">{errors.attributes}</p>{/if}
			{#each attributes as attr, i (i)}
				<div class="border border-border rounded-lg p-4 flex flex-col gap-3">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-muted">Attribute {i + 1}</span>
						{#if attributes.length > 1}
							<button type="button" onclick={() => removeAttribute(i)} class="text-muted hover:text-primary text-sm">
								Remove
							</button>
						{/if}
					</div>
					<input
						type="text"
						bind:value={attr.name}
						placeholder="Attribute name (e.g. Complexity, Intensity, Sweetness)"
						class="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
					/>
					<input
						type="text"
						bind:value={attr.description}
						placeholder="Description (optional)"
						class="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
			{/each}
			<Button variant="secondary" onclick={addAttribute} class="self-start">
				+ Add Attribute
			</Button>
		</section>

	<!-- Step 4: Subcategories & Review -->
	{:else if step === 4}
		<section class="flex flex-col gap-6">
			<!-- Subcategories -->
			<div class="flex flex-col gap-4">
				<p class="text-sm text-muted">
					Define optional subcategories (boolean tags like "Red", "White", "Rosé" for wine).
					Items can belong to multiple subcategories.
				</p>
				{#each subcategories as sub, i (i)}
					<div class="border border-border rounded-lg p-4 flex flex-col gap-3">
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium text-muted">Subcategory {i + 1}</span>
							{#if subcategories.length > 1}
								<button type="button" onclick={() => removeSubcategory(i)} class="text-muted hover:text-primary text-sm">
									Remove
								</button>
							{/if}
						</div>
						<input
							type="text"
							bind:value={sub.name}
							placeholder="Subcategory name (e.g. Red, White, Rosé)"
							class="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
						/>
						<input
							type="text"
							bind:value={sub.description}
							placeholder="Description (optional)"
							class="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
				{/each}
				<Button variant="secondary" onclick={addSubcategory} class="self-start">
					+ Add Subcategory
				</Button>
			</div>

			<!-- Review -->
			<div class="border-t border-border pt-6">
				<p class="text-xs uppercase tracking-widest text-muted mb-4">§ Review</p>
				<dl class="grid grid-cols-2 gap-4 text-sm">
					<div>
						<dt class="text-muted">Name</dt>
						<dd class="font-medium">{name || '—'}</dd>
					</div>
					<div>
						<dt class="text-muted">Slug</dt>
						<dd class="font-medium">/types/{slug || '—'}</dd>
					</div>
					<div>
						<dt class="text-muted">Parent Type</dt>
						<dd class="font-medium">
							{#if parentTypeId}
								{allTypes.find((t) => t.id === parentTypeId)?.name ?? '—'}
							{:else}
								—
							{/if}
						</dd>
					</div>
					<div>
						<dt class="text-muted">Fields</dt>
						<dd class="font-medium">{fields.filter((f) => f.name.trim()).length} field(s)</dd>
					</div>
					<div>
						<dt class="text-muted">Attributes</dt>
						<dd class="font-medium">{attributes.filter((a) => a.name.trim()).length} attribute(s)</dd>
					</div>
					<div>
						<dt class="text-muted">Subcategories</dt>
						<dd class="font-medium">{subcategories.filter((s) => s.name.trim()).length} subcategory(ies)</dd>
					</div>
				</dl>
			</div>
		</section>
	{/if}

	<!-- Navigation -->
	<div class="flex justify-between mt-8 pt-6 border-t border-border">
		<Button variant="secondary" onclick={prevStep} disabled={step === 1}>
			← Back
		</Button>
		{#if step < 4}
			<Button variant="primary" onclick={nextStep}>
				Next →
			</Button>
		{:else}
			<Button variant="primary" onclick={handleSubmit}>
				Create Type
			</Button>
		{/if}
	</div>
</div>
