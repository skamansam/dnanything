/**
 * DB connector — the ONLY place that knows how to create a database
 * connection. Swapping Postgres providers (Supabase <-> Neon) is a
 * connection-string change in .env. Swapping to a non-Postgres backend
 * means replacing this file with a different Drizzle dialect.
 *
 * See docs/plans/DATA_ACCESS_LAYER.md.
 */

import drizzlePg from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Creates the Drizzle DB instance from the DATABASE_URL env var.
 *
 * In the browser, use the Supabase client (src/lib/services/supabase.ts)
 * for auth + realtime. This Drizzle instance is for server-side data
 * access via the repository pattern.
 *
 * @returns A Drizzle instance bound to the Postgres connection.
 * @throws If DATABASE_URL is not set.
 */
export function createDb() {
	const connectionString = process.env.DATABASE_URL ?? import.meta.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('DATABASE_URL is not set. See .env.example.');
	}
	const queryClient = postgres(connectionString, { prepare: false });
	return drizzlePg(queryClient, { schema });
}

export type Db = ReturnType<typeof createDb>;
