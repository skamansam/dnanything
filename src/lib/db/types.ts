/**
 * Repository interface — the contract the rest of the app programs
 * against. All ORM (Drizzle) calls are centralized in repositories.ts;
 * swapping the ORM or backend means rewriting only that file.
 *
 * See docs/plans/DATA_ACCESS_LAYER.md.
 */

import type {
	ChangeLog,
	Item,
	ItemType,
	NewItem,
	NewItemType,
	NewRating,
	NewRecommendation,
	NewReview,
	NewChangeLog,
	Rating,
	Recommendation,
	Review,
	User
} from '$lib/types';

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

	// ── Reviews ────────────────────────────────────────────────
	/** Get all reviews for an item. */
	getReviews(itemId: string): Promise<Review[]>;
	/** Get a specific user's review for an item. */
	getUserReview(itemId: string, userId: string): Promise<Review | null>;
	/** Create a new review. */
	createReview(input: NewReview): Promise<Review>;
	/** Update an existing review. */
	updateReview(id: string, input: Partial<NewReview>): Promise<Review>;
	/** Delete a review. */
	deleteReview(id: string): Promise<void>;
	// ── Recommendations ─────────────────────────────────────────
	/** Get all recommendations where this item is the target (i.e. "items recommended as similar to this one"). */
	getRecommendationsForItem(targetItemId: string): Promise<Recommendation[]>;
	/** Get all recommendations made by a user. */
	getRecommendationsByUser(userId: string): Promise<Recommendation[]>;
	/** Create a new recommendation. */
	createRecommendation(input: NewRecommendation): Promise<Recommendation>;
	/** Delete a recommendation. */
	deleteRecommendation(id: string): Promise<void>;

	// ── Aggregates ─────────────────────────────────────────────
	/** Recalculate the cached average ratings + count for an item. */
	recalculateAverages(itemId: string): Promise<void>;
	/** Recalculate the cached average review score + count for an item. */
	recalculateReviewScore(itemId: string): Promise<void>;

	// ── Users ──────────────────────────────────────────────────
	/** Get a user by id. */
	getUser(id: string): Promise<User | null>;
	/** List all users. */
	listUsers(): Promise<User[]>;

	// ── Change Logs ────────────────────────────────────────────
	/** Get change log entries for a specific entity. */
	getChangeLogs(entityType: ChangeLog['entityType'], entityId: string): Promise<ChangeLog[]>;
	/** Get all change log entries by a user. */
	getChangeLogsByUser(userId: string): Promise<ChangeLog[]>;
	/** Get recent change log entries across all entities. */
	getRecentChangeLogs(limit?: number): Promise<ChangeLog[]>;
	/** Create a change log entry. */
	createChangeLog(input: NewChangeLog): Promise<ChangeLog>;
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
