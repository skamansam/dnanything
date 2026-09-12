/**
 * Public data access API.
 *
 * The rest of the app imports `repository` from here and programs against
 * the Repository interface — never against Drizzle directly.
 *
 * See docs/plans/DATA_ACCESS_LAYER.md.
 */

import { createDb } from './client';
import { createRepository } from './repositories';

// Lazy-init: only create the DB connection when first accessed on the server.
// In the browser, data access goes through the Supabase client instead.
let _repository: ReturnType<typeof createRepository> | null = null;

/**
 * Gets the singleton repository instance.
 *
 * On the server, this creates a Drizzle connection to Postgres.
 * In tests, inject a mock/in-memory repository via `setRepository()`.
 *
 * @returns The Repository instance.
 */
export function getRepository() {
	if (!_repository) {
		_repository = createRepository(createDb());
	}
	return _repository;
}

/**
 * Injects a repository instance (for testing).
 *
 * @param repo - The repository to use (e.g. an InMemoryRepository).
 */
export function setRepository(repo: ReturnType<typeof createRepository>) {
	_repository = repo;
}

export type { Repository, SyncResult } from './types';
