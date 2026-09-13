/**
 * Domain types for DNAnything.
 *
 * These are the core entities used across the GA engine, data access layer,
 * services, and UI. See docs/plans/CORE_GENETIC_ALGORITHM.md for the full
 * data model spec.
 */

/** A metadata field defined by a type (e.g. artist, year, label). */
export interface ItemField {
	/** Stable slug, e.g. "artist". */
	id: string;
	/** Display name, e.g. "Artist". */
	name: string;
	/** Optional longer description of what this field stores. */
	description?: string;
	/** Whether this field is required when creating an item. */
	required?: boolean;
}

/** A measurable property shared by all items of a type. */
export interface Attribute {
	/** Stable slug, e.g. "female_vocals". */
	id: string;
	/** Display name, e.g. "Female Vocals". */
	name: string;
	/** Optional longer description of what this attribute measures. */
	description?: string;
}

/** A boolean subcategory for items within a type (e.g. red/white/rosé for wine). */
export interface Subcategory {
	/** Stable slug, e.g. "red". */
	id: string;
	/** Display name, e.g. "Red". */
	name: string;
	/** Optional longer description. */
	description?: string;
}

/** A user profile. Mirrors Supabase auth.users; anonymous/local users get a pseudo-id. */
export interface User {
	id: string;
	displayName: string;
	/** Optional bio/avatar URL. */
	avatarUrl?: string;
	createdAt: string;
}

/** A wiki-style change log entry tracking who changed what and when. */
export interface ChangeLog {
	id: string;
	/** The entity that was changed: "type", "item", "rating", "review", "recommendation". */
	entityType: 'type' | 'item' | 'rating' | 'review' | 'recommendation';
	/** The id of the entity that was changed. */
	entityId: string;
	/** The action: "create", "update", or "delete". */
	action: 'create' | 'update' | 'delete';
	/** User who made the change. null for seeded data. */
	userId: string | null;
	/** JSON snapshot of the entity state after the change (or before, for deletes). */
	snapshot: Record<string, unknown>;
	/** Optional edit summary, like a wiki commit message. */
	summary?: string;
	createdAt: string;
}

/** A category of items (books, music, movies, wine, beer, ...). */
export interface ItemType {
	id: string;
	/** URL-safe slug, e.g. "music". */
	slug: string;
	/** Display name, e.g. "Music". */
	name: string;
	description?: string;
	/** Optional parent type for hierarchical organization (e.g. "Red Wine" → "Wine"). No runtime inheritance. */
	parentTypeId?: string | null;
	/** Rated attributes (0–100 scale) shared by all items of this type. */
	attributes: Attribute[];
	/** Metadata fields (e.g. artist, year, label) for items of this type. */
	fields: ItemField[];
	/** Boolean subcategories (e.g. red/white/rosé, band/album/song) for items of this type. */
	subcategories: Subcategory[];
	/** null for seeded/builtin types. */
	createdByUserId: string | null;
	/** User who last modified the type. */
	updatedByUserId: string | null;
	createdAt: string;
	updatedAt: string;
}

/** A single user's rating of one item's attributes. */
export interface Rating {
	id: string;
	itemId: string;
	/** Anonymous users get a local pseudo-id. */
	userId: string;
	/** Maps attribute id -> rating value (0..5). */
	values: Record<string, number>;
	createdAt: string;
	updatedAt: string;
}

/** An item belongs to exactly one ItemType. */
export interface Item {
	id: string;
	typeId: string;
	name: string;
	description?: string;
	/** Metadata values keyed by field id, as defined by the type's fields. */
	metadata?: Record<string, string>;
	/** Subcategory ids that apply to this item, from the type's subcategories. */
	subcategoryIds: string[];
	/** Cached mean across all user ratings, keyed by attribute id. */
	averageRatings: Record<string, number>;
	/** Number of ratings contributing to the average. */
	ratingCount: number;
	/** Cached mean of all review scores (0–5). */
	averageReviewScore: number;
	/** Number of reviews contributing to the average. */
	reviewCount: number;
	createdByUserId: string | null;
	/** User who last modified the item. */
	updatedByUserId: string | null;
	createdAt: string;
	updatedAt: string;
}

/** Input for creating a new ItemType. */
export interface NewItemType {
	slug: string;
	name: string;
	description?: string;
	/** Optional parent type ID for hierarchical organization. */
	parentTypeId?: string | null;
	attributes: Attribute[];
	fields: ItemField[];
	subcategories: Subcategory[];
	createdByUserId: string | null;
}

/** Input for creating a new Item. */
export interface NewItem {
	typeId: string;
	name: string;
	description?: string;
	metadata?: Record<string, string>;
	subcategoryIds?: string[];
	createdByUserId: string | null;
}

/** Input for creating/upserting a Rating. */
export interface NewRating {
	itemId: string;
	userId: string;
	values: Record<string, number>;
}

/** A user's text review of an item. */
export interface Review {
	id: string;
	itemId: string;
	userId: string;
	/** Optional review title. */
	title?: string;
	/** Review body (markdown). */
	body: string;
	/** Overall rating for this item (0–5), separate from attribute ratings. */
	score: number;
	createdAt: string;
	updatedAt: string;
}

/** Input for creating a new Review. */
export interface NewReview {
	itemId: string;
	userId: string;
	title?: string;
	body: string;
	score: number;
}

/** A user's recommendation of one item as similar to or worth pairing with another. */
export interface Recommendation {
	id: string;
	/** The item being recommended. */
	itemId: string;
	/** The item it's recommended as similar to / paired with. */
	targetItemId: string;
	userId: string;
	/** Optional reason for the recommendation. */
	reason?: string;
	createdAt: string;
}

/** Input for creating a new Recommendation. */
export interface NewRecommendation {
	itemId: string;
	targetItemId: string;
	userId: string;
	reason?: string;
}

/** Input for creating a ChangeLog entry. */
export interface NewChangeLog {
	entityType: ChangeLog['entityType'];
	entityId: string;
	action: ChangeLog['action'];
	userId: string | null;
	snapshot: Record<string, unknown>;
	summary?: string;
}

/** Attribute id alias for readability. */
type AttributeId = string;
