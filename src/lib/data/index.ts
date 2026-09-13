/**
 * Seed data for DNAnything.
 *
 * JSON files matching the domain types in `src/lib/types.ts`.
 * These can be loaded into the browser (localStorage) or the database
 * when the backends are fleshed out. For now they serve as static
 * fixtures for page development.
 */
import type { Attribute, ChangeLog, Item, ItemType, Rating, Recommendation, Review, User } from '$lib/types';
import changeLogs from './change-logs.json';
import items from './items.json';
import ratings from './ratings.json';
import recommendations from './recommendations.json';
import reviews from './reviews.json';
import types from './types.json';
import users from './users.json';

export const seedTypes: ItemType[] = types as unknown as ItemType[];
export const seedItems: Item[] = items as unknown as Item[];
export const seedRatings: Rating[] = ratings as unknown as Rating[];
export const seedReviews: Review[] = reviews as unknown as Review[];
export const seedRecommendations: Recommendation[] = recommendations as unknown as Recommendation[];
export const seedUsers: User[] = users as unknown as User[];
export const seedChangeLogs: ChangeLog[] = changeLogs as unknown as ChangeLog[];

/** Find a type by slug. */
export function getTypeBySlug(slug: string): ItemType | undefined {
	return seedTypes.find((t) => t.slug === slug);
}

/** Get all types. */
export function getAllTypes(): ItemType[] {
	return seedTypes;
}

/** Find a type by id. */
export function getTypeById(id: string): ItemType | undefined {
	return seedTypes.find((t) => t.id === id);
}

/** Get the parent type of a type, if any. */
export function getParentType(typeId: string): ItemType | undefined {
	const type = getTypeById(typeId);
	if (!type?.parentTypeId) return undefined;
	return getTypeById(type.parentTypeId);
}

/** Get all child types of a type. */
export function getChildTypes(parentTypeId: string): ItemType[] {
	return seedTypes.filter((t) => t.parentTypeId === parentTypeId);
}

/** Get all root types (types with no parent). */
export function getRootTypes(): ItemType[] {
	return seedTypes.filter((t) => !t.parentTypeId);
}

/** Get all items belonging to a type. */
export function getItemsByTypeId(typeId: string): Item[] {
	return seedItems.filter((i) => i.typeId === typeId);
}

/** Find an item by id. */
export function getItemById(id: string): Item | undefined {
	return seedItems.find((i) => i.id === id);
}

/** Get all ratings for an item. */
export function getRatingsByItemId(itemId: string): Rating[] {
	return seedRatings.filter((r) => r.itemId === itemId);
}

/** Count items for a type. */
export function getItemCount(typeId: string): number {
	return seedItems.filter((i) => i.typeId === typeId).length;
}

/** Find an attribute definition by id across all types. */
export function getAttributeById(id: string): { attribute: Attribute; type: ItemType } | undefined {
	for (const type of seedTypes) {
		const attribute = type.attributes.find((a) => a.id === id);
		if (attribute) return { attribute, type };
	}
	return undefined;
}

/** Get all items that have a rating for a given attribute, with the rating value and rating count. */
export function getItemsByAttributeId(attributeId: string): Array<{ item: Item; type: ItemType; rating: number; ratingCount: number }> {
	return seedItems
		.map((item) => {
			const type = getTypeById(item.typeId);
			if (!type) return null;
			const rating = item.averageRatings[attributeId];
			if (rating === undefined) return null;
			return { item, type, rating, ratingCount: item.ratingCount };
		})
		.filter((x): x is NonNullable<typeof x> => x !== null);
}

/** Get all reviews for an item. */
export function getReviewsByItemId(itemId: string): Review[] {
	return seedReviews.filter((r) => r.itemId === itemId);
}

/** Get all recommendations where this item is the target (items recommended as similar to this one). */
export function getRecommendationsForItem(targetItemId: string): Recommendation[] {
	return seedRecommendations.filter((r) => r.targetItemId === targetItemId);
}

/** Get all recommendations made by a user. */
export function getRecommendationsByUser(userId: string): Recommendation[] {
	return seedRecommendations.filter((r) => r.userId === userId);
}

/** Get the top user-suggested items for a type, sorted by review score desc then rating count desc. */
export function getTopItemsForType(typeId: string, limit = 5): Item[] {
	return getItemsByTypeId(typeId)
		.filter((i) => i.reviewCount > 0 || i.ratingCount > 0)
		.sort((a, b) => {
			// Primary: average review score (0–5)
			if (b.averageReviewScore !== a.averageReviewScore) {
				return b.averageReviewScore - a.averageReviewScore;
			}
			// Secondary: review count (more reviews = stronger certainty)
			if (b.reviewCount !== a.reviewCount) {
				return b.reviewCount - a.reviewCount;
			}
			// Tertiary: rating count
			return b.ratingCount - a.ratingCount;
		})
		.slice(0, limit);
}

/** Get the top user-suggested items for a subcategory within a type. */
export function getTopItemsForSubcategory(typeId: string, subcategoryId: string, limit = 5): Item[] {
	return getItemsByTypeId(typeId)
		.filter((i) => i.subcategoryIds.includes(subcategoryId))
		.filter((i) => i.reviewCount > 0 || i.ratingCount > 0)
		.sort((a, b) => {
			if (b.averageReviewScore !== a.averageReviewScore) {
				return b.averageReviewScore - a.averageReviewScore;
			}
			if (b.reviewCount !== a.reviewCount) {
				return b.reviewCount - a.reviewCount;
			}
			return b.ratingCount - a.ratingCount;
		})
		.slice(0, limit);
}

/** Get items filtered by subcategory within a type. */
export function getItemsBySubcategory(typeId: string, subcategoryId: string): Item[] {
	return getItemsByTypeId(typeId).filter((i) => i.subcategoryIds.includes(subcategoryId));
}

// ── Users ────────────────────────────────────────────────────

/** Find a user by id. */
export function getUserById(id: string): User | undefined {
	return seedUsers.find((u) => u.id === id);
}

/** Get all users. */
export function getAllUsers(): User[] {
	return seedUsers;
}

/** Contribution summary for a user. */
export interface UserContributions {
	user: User;
	typesCreated: number;
	itemsCreated: number;
	itemsUpdated: number;
	ratingsCount: number;
	reviewsCount: number;
	recommendationsCount: number;
	totalContributions: number;
}

/** Get a user's contribution summary. */
export function getUserContributions(userId: string): UserContributions | undefined {
	const user = getUserById(userId);
	if (!user) return undefined;

	const typesCreated = seedTypes.filter((t) => t.createdByUserId === userId).length;
	const itemsCreated = seedItems.filter((i) => i.createdByUserId === userId).length;
	const itemsUpdated = seedItems.filter((i) => i.updatedByUserId === userId && i.createdByUserId !== userId).length;
	const ratingsCount = seedRatings.filter((r) => r.userId === userId).length;
	const reviewsCount = seedReviews.filter((r) => r.userId === userId).length;
	const recommendationsCount = seedRecommendations.filter((r) => r.userId === userId).length;

	return {
		user,
		typesCreated,
		itemsCreated,
		itemsUpdated,
		ratingsCount,
		reviewsCount,
		recommendationsCount,
		totalContributions: typesCreated + itemsCreated + itemsUpdated + ratingsCount + reviewsCount + recommendationsCount
	};
}

/** Get top contributors sorted by total contributions descending. */
export function getTopContributors(limit = 10): UserContributions[] {
	return seedUsers
		.map((u) => getUserContributions(u.id))
		.filter((c): c is UserContributions => c !== undefined)
		.sort((a, b) => b.totalContributions - a.totalContributions)
		.slice(0, limit);
}

/** Get all ratings by a user. */
export function getRatingsByUserId(userId: string): Rating[] {
	return seedRatings.filter((r) => r.userId === userId);
}

/** Get all reviews by a user. */
export function getReviewsByUserId(userId: string): Review[] {
	return seedReviews.filter((r) => r.userId === userId);
}

/** Get all recommendations by a user. */
export function getRecommendationsByUserId(userId: string): Recommendation[] {
	return seedRecommendations.filter((r) => r.userId === userId);
}

/** Get all items created by a user. */
export function getItemsCreatedByUser(userId: string): Item[] {
	return seedItems.filter((i) => i.createdByUserId === userId);
}

/** Get all types created by a user. */
export function getTypesCreatedByUser(userId: string): ItemType[] {
	return seedTypes.filter((t) => t.createdByUserId === userId);
}

// ── Change Logs ──────────────────────────────────────────────

/** Get change log entries for a specific entity. */
export function getChangeLogsForEntity(entityType: ChangeLog['entityType'], entityId: string): ChangeLog[] {
	return seedChangeLogs
		.filter((c) => c.entityType === entityType && c.entityId === entityId)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Get all change log entries by a user. */
export function getChangeLogsByUserId(userId: string): ChangeLog[] {
	return seedChangeLogs
		.filter((c) => c.userId === userId)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Get recent change log entries across all entities. */
export function getRecentChangeLogs(limit = 20): ChangeLog[] {
	return [...seedChangeLogs]
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
		.slice(0, limit);
}
