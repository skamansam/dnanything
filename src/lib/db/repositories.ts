/**
 * Repository implementation — ALL Drizzle/ORM calls live in this file.
 *
 * To swap Drizzle for Prisma, Supabase-js, or raw SQL, rewrite only this
 * file to satisfy the Repository interface. The rest of the app is
 * unchanged. See docs/plans/DATA_ACCESS_LAYER.md.
 */

import { and, eq } from 'drizzle-orm';
import type { Db } from './client';
import { items, itemTypes, ratings } from './schema';
import type { Repository } from './types';
import type { Item, ItemType, NewItem, NewItemType, NewRating, Rating } from '$lib/types';

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
					attributes: input.attributes,
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
		attributes: row.attributes as ItemType['attributes'],
		createdByUserId: row.createdBy ?? null,
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
		averageRatings: (row.averageRatings as Record<string, number>) ?? {},
		ratingCount: row.ratingCount,
		createdByUserId: row.createdBy ?? null,
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
