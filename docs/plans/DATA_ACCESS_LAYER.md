# Data Access Layer Plan

**Objective**: Introduce a DB connector scheme so backends can be swapped
easily, and centralize **all ORM (Drizzle) calls in a single repository
module** so the ORM itself can be replaced without touching the rest of the
app.

## Why This Layer

- **Backend portability**: Supabase is recommended (see
  `BACKEND_DATABASE_RESEARCH.md`), but switching to Neon is just a
  connection-string change for any Postgres provider. A bigger swap
  (Postgres → Turso/SQLite) needs a different Drizzle dialect — this layer
  is the clean seam for that.
- **ORM portability**: All Drizzle query logic lives in one place. To swap
  Drizzle for Prisma (or raw SQL, or a Supabase-js client), rewrite only
  this module; the rest of the app is unchanged.
- **Testability**: The rest of the app depends on a `Repository` interface,
  not on Drizzle — so services and UI can be tested with a mock/in-memory
  repository.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Routes / UI components / services (sync, auth, GA)     │
│  ─────────────────────────────────────────────────────  │
│  depend only on the Repository interface (types)        │
└───────────────────────┬─────────────────────────────────┘
                        │  import { db } from '$lib/db'
                        ▼
┌─────────────────────────────────────────────────────────┐
│  src/lib/db/                                            │
│                                                         │
│  index.ts      ── public API: exports `db` (Repository) │
│  types.ts      ── Repository interface + domain types   │
│  client.ts     ── DB connector: creates the Drizzle     │
│                   instance from env config (swappable)  │
│  schema.ts     ── Drizzle table definitions             │
│  repositories.ts ── ALL Drizzle calls live here,        │
│                     exposed via the Repository iface    │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
                   Drizzle + Postgres driver
                   (Supabase / Neon / etc. via conn string)
```

## The Connector (`client.ts`)

The connector is the **only** place that knows how to create a DB
connection. It reads env vars and returns a Drizzle instance.

```ts
// src/lib/db/client.ts
import drizzlePg from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "./schema";

/**
 * Creates the Drizzle DB instance from environment configuration.
 * Swapping Postgres providers (Supabase <-> Neon) is a connection-string
 * change in .env. Swapping to a non-Postgres backend means replacing this
 * file with a different Drizzle dialect (or a non-Drizzle client).
 */
export function createDb() {
  const connectionString = import.meta.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const queryClient = postgres(connectionString, { prepare: false });
  return drizzlePg(queryClient, { schema });
}

export type Db = ReturnType<typeof createDb>;
```

For the **browser** (Supabase anon client for auth + realtime), a separate
`createSupabaseClient()` lives in `src/lib/services/supabase.ts` — that's
the Supabase-specific auth/realtime client, not the data-access ORM path.
Server-side data access always goes through Drizzle via `client.ts`.

## The Repository Interface (`types.ts`)

The rest of the app programs against this interface — never against Drizzle:

```ts
// src/lib/db/types.ts
import type { ItemType, Item, Rating, Attribute } from "$lib/types";

export interface Repository {
  // Types
  getType(slug: string): Promise<ItemType | null>;
  listTypes(): Promise<ItemType[]>;
  createType(input: NewItemType): Promise<ItemType>;
  updateType(id: string, input: Partial<NewItemType>): Promise<ItemType>;

  // Items
  listItems(typeId: string): Promise<Item[]>;
  getItem(id: string): Promise<Item | null>;
  createItem(input: NewItem): Promise<Item>;
  updateItem(id: string, input: Partial<NewItem>): Promise<Item>;

  // Ratings
  getRatings(itemId: string): Promise<Rating[]>;
  getUserRating(itemId: string, userId: string): Promise<Rating | null>;
  upsertRating(input: NewRating): Promise<Rating>;

  // Aggregates (average recalculation)
  recalculateAverages(itemId: string): Promise<void>;
}
```

## The Repository Implementation (`repositories.ts`)

**Every Drizzle call in the app lives in this one file.** Swapping the ORM
means rewriting only this file to satisfy the `Repository` interface.

```ts
// src/lib/db/repositories.ts
import { eq, and } from "drizzle-orm";
import type { Db } from "./client";
import { itemTypes, items, ratings } from "./schema";
import type { Repository, NewItemType, NewItem, NewRating } from "./types";
import type { ItemType, Item, Rating } from "$lib/types";

export function createRepository(db: Db): Repository {
  return {
    async getType(slug: string) {
      const [row] = await db.select().from(itemTypes)
        .where(eq(itemTypes.slug, slug)).limit(1);
      return row ? toItemType(row) : null;
    },

    async listTypes() {
      const rows = await db.select().from(itemTypes);
      return rows.map(toItemType);
    },

    // ... all other methods — every Drizzle query lives here
  };
}
```

## The Public API (`index.ts`)

```ts
// src/lib/db/index.ts
import { createDb } from "./client";
import { createRepository } from "./repositories";

const db = createDb();
export const repository = createRepository(db);
export type { Repository } from "./types";
```

The rest of the app imports `repository` from `$lib/db` and never sees
Drizzle, the Postgres driver, or the schema tables.

## Swapping Scenarios

| Swap | What changes | |
|------|-------------|---|
| Supabase → Neon | `.env` `DATABASE_URL` | **Nothing else** — both are Postgres |
| Supabase → Turso | `client.ts` (Drizzle SQLite dialect) + `schema.ts` | Repository stays; SQLite lacks triggers so `recalculateAverages` runs in-app |
| Drizzle → Prisma | `repositories.ts` only | Interface unchanged; rewrite queries in Prisma |
| Drizzle → Supabase-js | `repositories.ts` only | Interface unchanged; rewrite queries using `supabase.from()` |

## Testing

- **In-memory repository**: implement the `Repository` interface with plain
  arrays/Maps for unit tests — no DB needed. Inject it into services under
  test.
- **`vi.mock('$lib/db', ...)`** in component/service tests returns the
  in-memory repository.
- E2E tests use a real (local Supabase CLI) DB through the same interface.

## File Layout

```
src/lib/db/
├── index.ts          # public API: exports `repository`
├── types.ts          # Repository interface + New* input types
├── client.ts         # DB connector (Drizzle instance factory)
├── schema.ts         # Drizzle table definitions
└── repositories.ts   # ALL Drizzle calls, implements Repository
```

## Tasks

1. Define `Repository` interface + `New*` types in `types.ts`.
2. Write Drizzle schema in `schema.ts` (mirrors the SQL in
   `TYPES_ITEMS_AND_RATINGS.md`).
3. Implement `client.ts` (Postgres connector via env).
4. Implement `repositories.ts` (all CRUD + `recalculateAverages`).
5. Export the singleton `repository` from `index.ts`.
6. Build an `InMemoryRepository` for tests in
   `tests/unit/db/inMemoryRepository.ts`.
7. Vitest: repository contract tests run against both the in-memory impl
   and (optionally, in CI) the real Drizzle impl — same assertions.

## Open Questions

- Should `recalculateAverages` always run in-app (via the repository) or
  rely on the Postgres trigger? Recommend **both**: trigger for
  consistency on the remote DB, repository method for the local/in-memory
  path and for SQLite backends that lack triggers.
