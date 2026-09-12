/**
 * Repository interface — the contract the rest of the app programs
 * against. All ORM (Drizzle) calls are centralized in repositories.ts;
 * swapping the ORM or backend means rewriting only that file.
 *
 * See docs/plans/DATA_ACCESS_LAYER.md.
 */

import type { Item, ItemType, NewItem, NewItemType, NewRating, Rating } from '$lib/types';

/** The data access contract. Implementations live in repositories.ts. */
export interface Repository {
	// ── Types ──────────────────────────────────────────────────
	/** Get a type by its slug. */
	getType(slug: string): Promise<ItemType | null>;
	/** Get a type by id. */
	getTypeById(id: string): Promise<ItemType | null>;
	/** List all types. */
	listTypes(): Promise<ItemType[]>;
	/** Create a new type. Requires auth (createdByUserId must be set). */
	createType(input: NewItemType): Promise<ItemType>;
	/** Update an existing type. */
	updateType(id: string, input: Partial<NewItemType>): Promise<ItemType>;

	// ── Items ──────────────────────────────────────────────────
	/** List all items in a type. */
	listItems(typeId: string): Promise<Item[]>;
	/** Get a single item by id. */
	getItem(id: string): Promise<Item | null>;
	/** Create a new item. Requires auth. */
	createItem(input: NewItem): Promise<Item>;
	/** Update an existing item. */
	updateItem(id: string, input: Partial<NewItem>): Promise<Item>;

	// ── Ratings ────────────────────────────────────────────────
	/** Get all ratings for an item. */
	getRatings(itemId: string): Promise<Rating[]>;
	/** Get a specific user's rating for an item. */
	getUserRating(itemId: string, userId: string): Promise<Rating | null>;
	/** Insert or update a user's rating for an item (upsert). */
	upsertRating(input: NewRating): Promise<Rating>;

	// ── Aggregates ─────────────────────────────────────────────
	/** Recalculate the cached average ratings + count for an item. */
	recalculateAverages(itemId: string): Promise<void>;
}

/** Result of a local→remote sync upload. */
export interface SyncResult {
	ratingsUploaded: number;
	typesUploaded: number;
	itemsUploaded: number;
	ratingsMerged: number;
	typesMerged: number;
	itemsMerged: number;
	ratingsSkipped: number;
}
