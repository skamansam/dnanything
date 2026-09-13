/**
 * Repository implementation — ALL Drizzle/ORM calls live in this file.
 *
 * To swap Drizzle for Prisma, Supabase-js, or raw SQL, rewrite only this
 * file to satisfy the Repository interface. The rest of the app is
 * unchanged. See docs/plans/DATA_ACCESS_LAYER.md.
 */

import { and, desc, eq } from 'drizzle-orm';
import type { Db } from './client';
import { items, itemTypes, ratings, reviews, recommendations, profiles, changeLogs } from './schema';
import type { Repository } from './types';
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

/**
 * Creates a Repository backed by the given Drizzle instance.
 *
 * @param db - The Drizzle DB instance from createDb().
 * @returns A Repository implementation.
 */
export function createRepository(db: Db): Repository {
	return {
		// ── Types ──────────────────────────────────────────────
		async getType(slug: string): Promise<ItemType | null> {
			const [row] = await db
				.select()
				.from(itemTypes)
				.where(eq(itemTypes.slug, slug))
				.limit(1);
			return row ? toItemType(row) : null;
		},

		async getTypeById(id: string): Promise<ItemType | null> {
			const [row] = await db
				.select()
				.from(itemTypes)
				.where(eq(itemTypes.id, id))
				.limit(1);
			return row ? toItemType(row) : null;
		},

		async listTypes(): Promise<ItemType[]> {
			const rows = await db.select().from(itemTypes);
			return rows.map(toItemType);
		},

		async createType(input: NewItemType): Promise<ItemType> {
			const [row] = await db
				.insert(itemTypes)
				.values({
					slug: input.slug,
					name: input.name,
					description: input.description,
					parentTypeId: input.parentTypeId,
					attributes: input.attributes,
					fields: input.fields,
					subcategories: input.subcategories,
					createdBy: input.createdByUserId
				})
				.returning();
			return toItemType(row);
		},

		async updateType(id: string, input: Partial<NewItemType>): Promise<ItemType> {
			const [row] = await db
				.update(itemTypes)
				.set({
					...(input.slug !== undefined && { slug: input.slug }),
					...(input.name !== undefined && { name: input.name }),
					...(input.description !== undefined && { description: input.description }),
					...(input.attributes !== undefined && { attributes: input.attributes }),
					...(input.parentTypeId !== undefined && { parentTypeId: input.parentTypeId }),
					...(input.fields !== undefined && { fields: input.fields }),
					...(input.subcategories !== undefined && { subcategories: input.subcategories }),
					updatedAt: new Date()
				})
				.where(eq(itemTypes.id, id))
				.returning();
			return toItemType(row);
		},

		// ── Items ─────────────────────────────────────────────
		async listItems(typeId: string): Promise<Item[]> {
			const rows = await db.select().from(items).where(eq(items.typeId, typeId));
			return rows.map(toItem);
		},

		async getItem(id: string): Promise<Item | null> {
			const [row] = await db.select().from(items).where(eq(items.id, id)).limit(1);
			return row ? toItem(row) : null;
		},

		async createItem(input: NewItem): Promise<Item> {
			const [row] = await db
				.insert(items)
				.values({
					typeId: input.typeId,
					name: input.name,
					description: input.description,
					metadata: input.metadata,
					subcategoryIds: input.subcategoryIds,
					createdBy: input.createdByUserId
				})
				.returning();
			return toItem(row);
		},

		async updateItem(id: string, input: Partial<NewItem>): Promise<Item> {
			const [row] = await db
				.update(items)
				.set({
					...(input.name !== undefined && { name: input.name }),
					...(input.description !== undefined && { description: input.description }),
					...(input.metadata !== undefined && { metadata: input.metadata }),
					...(input.subcategoryIds !== undefined && { subcategoryIds: input.subcategoryIds }),
					updatedAt: new Date()
				})
				.where(eq(items.id, id))
				.returning();
			return toItem(row);
		},

		// ── Ratings ───────────────────────────────────────────
		async getRatings(itemId: string): Promise<Rating[]> {
			const rows = await db.select().from(ratings).where(eq(ratings.itemId, itemId));
			return rows.map(toRating);
		},

		async getUserRating(itemId: string, userId: string): Promise<Rating | null> {
			const [row] = await db
				.select()
				.from(ratings)
				.where(and(eq(ratings.itemId, itemId), eq(ratings.userId, userId)))
				.limit(1);
			return row ? toRating(row) : null;
		},

		async upsertRating(input: NewRating): Promise<Rating> {
			// Check for existing rating
			const existing = await this.getUserRating(input.itemId, input.userId);
			if (existing) {
				const [row] = await db
					.update(ratings)
					.set({ values: input.values, updatedAt: new Date() })
					.where(eq(ratings.id, existing.id))
					.returning();
				await this.recalculateAverages(input.itemId);
				return toRating(row);
			}
			const [row] = await db
				.insert(ratings)
				.values({
					itemId: input.itemId,
					userId: input.userId,
					values: input.values
				})
				.returning();
			await this.recalculateAverages(input.itemId);
			return toRating(row);
		},

		// ── Reviews ───────────────────────────────────────────
		async getReviews(itemId: string): Promise<Review[]> {
			const rows = await db.select().from(reviews).where(eq(reviews.itemId, itemId));
			return rows.map(toReview);
		},

		async getUserReview(itemId: string, userId: string): Promise<Review | null> {
			const [row] = await db
				.select()
				.from(reviews)
				.where(and(eq(reviews.itemId, itemId), eq(reviews.userId, userId)))
				.limit(1);
			return row ? toReview(row) : null;
		},

		async createReview(input: NewReview): Promise<Review> {
			const [row] = await db
				.insert(reviews)
				.values({
					itemId: input.itemId,
					userId: input.userId,
					title: input.title,
					body: input.body,
					score: input.score
				})
				.returning();
			await this.recalculateReviewScore(input.itemId);
			return toReview(row);
		},

		async updateReview(id: string, input: Partial<NewReview>): Promise<Review> {
			const [row] = await db
				.update(reviews)
				.set({
					...(input.title !== undefined && { title: input.title }),
					...(input.body !== undefined && { body: input.body }),
					...(input.score !== undefined && { score: input.score }),
					updatedAt: new Date()
				})
				.where(eq(reviews.id, id))
				.returning();
			await this.recalculateReviewScore(row.itemId);
			return toReview(row);
		},

		async deleteReview(id: string): Promise<void> {
			const [row] = await db.delete(reviews).where(eq(reviews.id, id)).returning();
			if (row) {
				await this.recalculateReviewScore(row.itemId);
			}
		},

		// ── Recommendations ─────────────────────────────────────
		async getRecommendationsForItem(targetItemId: string): Promise<Recommendation[]> {
			const rows = await db
				.select()
				.from(recommendations)
				.where(eq(recommendations.targetItemId, targetItemId));
			return rows.map(toRecommendation);
		},

		async getRecommendationsByUser(userId: string): Promise<Recommendation[]> {
			const rows = await db
				.select()
				.from(recommendations)
				.where(eq(recommendations.userId, userId));
			return rows.map(toRecommendation);
		},

		async createRecommendation(input: NewRecommendation): Promise<Recommendation> {
			const [row] = await db
				.insert(recommendations)
				.values({
					itemId: input.itemId,
					targetItemId: input.targetItemId,
					userId: input.userId,
					reason: input.reason
				})
				.returning();
			return toRecommendation(row);
		},

		async deleteRecommendation(id: string): Promise<void> {
			await db.delete(recommendations).where(eq(recommendations.id, id));
		},

		// ── Aggregates ────────────────────────────────────────
		async recalculateAverages(itemId: string): Promise<void> {
			const allRatings = await this.getRatings(itemId);
			if (allRatings.length === 0) {
				await db
					.update(items)
					.set({ averageRatings: {}, ratingCount: 0 })
					.where(eq(items.id, itemId));
				return;
			}
			const sums: Record<string, number> = {};
			for (const r of allRatings) {
				for (const [attrId, value] of Object.entries(r.values)) {
					sums[attrId] = (sums[attrId] ?? 0) + value;
				}
			}
			const averages: Record<string, number> = {};
			for (const [attrId, sum] of Object.entries(sums)) {
				averages[attrId] = sum / allRatings.length;
			}
			await db
				.update(items)
				.set({ averageRatings: averages, ratingCount: allRatings.length })
				.where(eq(items.id, itemId));
		},

		async recalculateReviewScore(itemId: string): Promise<void> {
			const allReviews = await this.getReviews(itemId);
			if (allReviews.length === 0) {
				await db
					.update(items)
					.set({ averageReviewScore: 0, reviewCount: 0 })
					.where(eq(items.id, itemId));
				return;
			}
			const total = allReviews.reduce((sum, r) => sum + r.score, 0);
			const avg = total / allReviews.length;
			await db
				.update(items)
				.set({ averageReviewScore: avg, reviewCount: allReviews.length })
				.where(eq(items.id, itemId));
		},

		// ── Users ─────────────────────────────────────────────
		async getUser(id: string): Promise<User | null> {
			const [row] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
			return row ? toUser(row) : null;
		},

		async listUsers(): Promise<User[]> {
			const rows = await db.select().from(profiles);
			return rows.map(toUser);
		},

		// ── Change Logs ───────────────────────────────────────
		async getChangeLogs(entityType: ChangeLog['entityType'], entityId: string): Promise<ChangeLog[]> {
			const rows = await db
				.select()
				.from(changeLogs)
				.where(and(eq(changeLogs.entityType, entityType), eq(changeLogs.entityId, entityId)))
				.orderBy(desc(changeLogs.createdAt));
			return rows.map(toChangeLog);
		},

		async getChangeLogsByUser(userId: string): Promise<ChangeLog[]> {
			const rows = await db
				.select()
				.from(changeLogs)
				.where(eq(changeLogs.userId, userId))
				.orderBy(desc(changeLogs.createdAt));
			return rows.map(toChangeLog);
		},

		async getRecentChangeLogs(limit = 20): Promise<ChangeLog[]> {
			const rows = await db.select().from(changeLogs).orderBy(desc(changeLogs.createdAt)).limit(limit);
			return rows.map(toChangeLog);
		},

		async createChangeLog(input: NewChangeLog): Promise<ChangeLog> {
			const [row] = await db
				.insert(changeLogs)
				.values({
					entityType: input.entityType,
					entityId: input.entityId,
					action: input.action,
					userId: input.userId,
					snapshot: input.snapshot,
					summary: input.summary
				})
				.returning();
			return toChangeLog(row);
		}
	};
}

// ── Row → domain mappers ──────────────────────────────────────

function toItemType(row: typeof itemTypes.$inferSelect): ItemType {
	return {
		id: row.id,
		slug: row.slug,
		name: row.name,
		description: row.description ?? undefined,
		parentTypeId: row.parentTypeId ?? null,
		attributes: row.attributes as ItemType['attributes'],
		fields: row.fields as ItemType['fields'],
		subcategories: row.subcategories as ItemType['subcategories'],
		createdByUserId: row.createdBy ?? null,
		updatedByUserId: row.updatedBy ?? null,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString()
	};
}

function toItem(row: typeof items.$inferSelect): Item {
	return {
		id: row.id,
		typeId: row.typeId,
		name: row.name,
		description: row.description ?? undefined,
		metadata: (row.metadata as Record<string, string>) ?? undefined,
		subcategoryIds: (row.subcategoryIds as string[]) ?? [],
		averageRatings: (row.averageRatings as Record<string, number>) ?? {},
		ratingCount: row.ratingCount,
		averageReviewScore: row.averageReviewScore,
		reviewCount: row.reviewCount,
		createdByUserId: row.createdBy ?? null,
		updatedByUserId: row.updatedBy ?? null,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString()
	};
}

function toRating(row: typeof ratings.$inferSelect): Rating {
	return {
		id: row.id,
		itemId: row.itemId,
		userId: row.userId,
		values: row.values as Record<string, number>,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString()
	};
}

function toReview(row: typeof reviews.$inferSelect): Review {
	return {
		id: row.id,
		itemId: row.itemId,
		userId: row.userId,
		title: row.title ?? undefined,
		body: row.body,
		score: row.score,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString()
	};
}

function toRecommendation(row: typeof recommendations.$inferSelect): Recommendation {
	return {
		id: row.id,
		itemId: row.itemId,
		targetItemId: row.targetItemId,
		userId: row.userId,
		reason: row.reason ?? undefined,
		createdAt: row.createdAt.toISOString()
	};
}

function toUser(row: typeof profiles.$inferSelect): User {
	return {
		id: row.id,
		displayName: row.displayName,
		avatarUrl: row.avatarUrl ?? undefined,
		createdAt: row.createdAt.toISOString()
	};
}

function toChangeLog(row: typeof changeLogs.$inferSelect): ChangeLog {
	return {
		id: row.id,
		entityType: row.entityType as ChangeLog['entityType'],
		entityId: row.entityId,
		action: row.action as ChangeLog['action'],
		userId: row.userId ?? null,
		snapshot: row.snapshot as Record<string, unknown>,
		summary: row.summary ?? undefined,
		createdAt: row.createdAt.toISOString()
	};
}
