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
	displayName: text('display_name'),
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
		/** Array of { id, name, description? } */
		attributes: jsonb('attributes').notNull(),
		createdBy: uuid('created_by').references(() => profiles.id),
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
	/** Cached { attributeId: mean } */
	averageRatings: jsonb('average_ratings').default({}),
	ratingCount: integer('rating_count').default(0).notNull(),
	createdBy: uuid('created_by').references(() => profiles.id),
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
