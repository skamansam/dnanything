/**
 * Drizzle schema definitions for the Postgres tables.
 *
 * Mirrors the SQL schema in docs/plans/TYPES_ITEMS_AND_RATINGS.md.
 * To swap to a non-Postgres backend (e.g. Turso/SQLite), rewrite this
 * file with the appropriate Drizzle dialect.
 */

import { jsonb, pgTable, text, timestamp, uniqueIndex, uuid, integer } from 'drizzle-orm/pg-core';

/** Profiles mirror auth.users 1:1 (Supabase Auth). */
export const profiles = pgTable('profiles', {
	id: uuid('id').primaryKey(),
	displayName: text('display_name').notNull(),
	avatarUrl: text('avatar_url'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

/** Item types (books, music, movies, wine, beer, ...). */
export const itemTypes = pgTable(
	'item_types',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		slug: text('slug').notNull().unique(),
		name: text('name').notNull(),
		description: text('description'),
		/** Optional parent type for hierarchical organization (e.g. "Red Wine" → "Wine"). No runtime inheritance. */
		parentTypeId: uuid('parent_type_id').references((): PgColumn => itemTypes.id),
		/** Array of { id, name, description? } — rated attributes (0–100 scale) */
		attributes: jsonb('attributes').notNull(),
		/** Array of { id, name, description?, required? } — metadata fields */
		fields: jsonb('fields').notNull(),
		/** Array of { id, name, description? } — boolean subcategories */
		subcategories: jsonb('subcategories').notNull(),
		createdBy: uuid('created_by').references(() => profiles.id),
		updatedBy: uuid('updated_by').references(() => profiles.id),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		slugIdx: uniqueIndex('item_types_slug_idx').on(table.slug)
	})
);

/** Items belong to exactly one ItemType. */
export const items = pgTable('items', {
	id: uuid('id').defaultRandom().primaryKey(),
	typeId: uuid('type_id')
		.notNull()
		.references(() => itemTypes.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	metadata: jsonb('metadata').default({}),
	/** Array of subcategory ids from the type's subcategories */
	subcategoryIds: jsonb('subcategory_ids').default([]),
	/** Cached { attributeId: mean } */
	averageRatings: jsonb('average_ratings').default({}),
	ratingCount: integer('rating_count').default(0).notNull(),
	/** Cached mean of all review scores (0–5). */
	averageReviewScore: integer('average_review_score').default(0).notNull(),
	/** Number of reviews contributing to the average. */
	reviewCount: integer('review_count').default(0).notNull(),
	createdBy: uuid('created_by').references(() => profiles.id),
	updatedBy: uuid('updated_by').references(() => profiles.id),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

/** A single user's rating of one item's attributes. */
export const ratings = pgTable('ratings', {
	id: uuid('id').defaultRandom().primaryKey(),
	itemId: uuid('item_id')
		.notNull()
		.references(() => items.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => profiles.id, { onDelete: 'cascade' }),
	/** { attributeId: 0..5 } */
	values: jsonb('values').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

/** A user's text review of an item. */
export const reviews = pgTable('reviews', {
	id: uuid('id').defaultRandom().primaryKey(),
	itemId: uuid('item_id')
		.notNull()
		.references(() => items.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => profiles.id, { onDelete: 'cascade' }),
	title: text('title'),
	body: text('body').notNull(),
	/** Overall rating for this item (0–5), separate from attribute ratings. */
	score: integer('score').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

/** A user's recommendation of one item as similar to / paired with another. */
export const recommendations = pgTable('recommendations', {
	id: uuid('id').defaultRandom().primaryKey(),
	/** The item being recommended. */
	itemId: uuid('item_id')
		.notNull()
		.references(() => items.id, { onDelete: 'cascade' }),
	/** The item it's recommended as similar to / paired with. */
	targetItemId: uuid('target_item_id')
		.notNull()
		.references(() => items.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => profiles.id, { onDelete: 'cascade' }),
	reason: text('reason'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

/** Wiki-style change log tracking who changed what and when. */
export const changeLogs = pgTable('change_logs', {
	id: uuid('id').defaultRandom().primaryKey(),
	/** The entity that was changed: "type", "item", "rating", "review", "recommendation". */
	entityType: text('entity_type').notNull(),
	/** The id of the entity that was changed. */
	entityId: uuid('entity_id').notNull(),
	/** The action: "create", "update", or "delete". */
	action: text('action').notNull(),
	userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
	/** JSON snapshot of the entity state after the change (or before, for deletes). */
	snapshot: jsonb('snapshot').notNull(),
	/** Optional edit summary, like a wiki commit message. */
	summary: text('summary'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
