/**
 * Domain types for DNAnything.
 *
 * These are the core entities used across the GA engine, data access layer,
 * services, and UI. See docs/plans/CORE_GENETIC_ALGORITHM.md for the full
 * data model spec.
 */

/** A measurable property shared by all items of a type. */
export interface Attribute {
	/** Stable slug, e.g. "female_vocals". */
	id: string;
	/** Display name, e.g. "Female Vocals". */
	name: string;
	/** Optional longer description of what this attribute measures. */
	description?: string;
}

/** A category of items (books, music, movies, wine, beer, ...). */
export interface ItemType {
	id: string;
	/** URL-safe slug, e.g. "music". */
	slug: string;
	/** Display name, e.g. "Music". */
	name: string;
	description?: string;
	attributes: Attribute[];
	/** null for seeded/builtin types. */
	createdByUserId: string | null;
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
	/** Free-form metadata: artist, author, year, etc. */
	metadata?: Record<string, string>;
	/** Cached mean across all user ratings, keyed by attribute id. */
	averageRatings: Record<string, number>;
	/** Number of ratings contributing to the average. */
	ratingCount: number;
	createdByUserId: string | null;
	createdAt: string;
	updatedAt: string;
}

/** Input for creating a new ItemType. */
export interface NewItemType {
	slug: string;
	name: string;
	description?: string;
	attributes: Attribute[];
	createdByUserId: string | null;
}

/** Input for creating a new Item. */
export interface NewItem {
	typeId: string;
	name: string;
	description?: string;
	metadata?: Record<string, string>;
	createdByUserId: string | null;
}

/** Input for creating/upserting a Rating. */
export interface NewRating {
	itemId: string;
	userId: string;
	values: Record<string, number>;
}

/** Attribute id alias for readability. */
type AttributeId = string;
