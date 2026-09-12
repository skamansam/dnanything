# Types, Items, Ratings & Auth Plan

**Objective**: Users can create new types and new items in any type. When
different users rate the same item, an average is created and stored
alongside each individual rating, both shown on the item's data page.

## Auth & Storage Model (confirmed)

- **Full auth for cloud storage** (Supabase Auth). Logged-in users' data
  lives in the remote Postgres DB.
- **Anonymous users** work against `localStorage` only, under a local
  pseudo-user id.
- **Creating new types/items requires auth.** Anonymous users can browse and
  rate, but cannot create new types or items.
- **Local → remote sync on login**: when a user logs in and there is unsaved
  local data (ratings, drafts), prompt: "Upload your local data to the
  cloud?" On confirm, push local ratings to the remote DB and clear the
  local buffer.

## Data Flow

```
Anonymous user                Logged-in user
─────────────                 ──────────────
rate item ──▶ localStorage    rate item ──▶ Supabase (Rating row)
                                │
                                └─▶ trigger recalculates Item.averageRatings

login ──▶ detect local unsaved data ──▶ prompt upload ──▶ push to Supabase
```

## Remote Schema (Supabase / Postgres)

```sql
-- profiles mirror auth.users (1:1)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

create table item_types (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  attributes jsonb not null,           -- [{id,name,description}, ...]
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table items (
  id uuid primary key default gen_random_uuid(),
  type_id uuid not null references item_types on delete cascade,
  name text not null,
  description text,
  metadata jsonb default '{}',
  average_ratings jsonb default '{}',  -- cached {attributeId: mean}
  rating_count int default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (type_id, name)
);

create table ratings (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  values jsonb not null,               -- {attributeId: 0..5}
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (item_id, user_id)            -- one rating per user per item
);

-- RLS: public read for types/items/ratings; write requires auth + ownership
alter table item_types enable row level security;
alter table items enable row level security;
alter table ratings enable row level security;
```

### Average recalculation

Two strategies; use **(A) for v1**, keep (B) as a scaling option:

- **(A) Postgres trigger**: on `ratings` insert/update/delete, recompute
  `items.average_ratings` and `items.rating_count` for the affected item.
  Simple, consistent, fine for the free tier's write volume.
- **(B) Materialized view / scheduled refresh**: defer recalculation for
  high write volumes. Overkill at launch.

## Local Schema (localStorage)

A single namespaced key `dnanything:local` holds:

```ts
interface LocalState {
  pseudoUserId: string;          // generated on first visit
  ratings: Rating[];             // pending uploads
  draftTypes: DraftItemType[];   // created while anonymous (upload on login)
  draftItems: DraftItem[];       // created while anonymous (upload on login)
  lastSyncedAt: string | null;
}
```

Drafts created while anonymous become real `item_types`/`items` rows on
upload. If a draft's slug/name already exists remotely, merge instead of
duplicate (prompt the user to confirm).

## Sync Service

`src/lib/services/sync.ts` exposes:

- `getLocalState(): LocalState`
- `hasUnsyncedData(): boolean`
- `uploadLocalToRemote(userId): Promise<SyncResult>` — pushes ratings +
  drafts, returns counts of what was uploaded/merged/skipped.
- `clearLocal()` — called after a successful upload.

Called from the auth callback / login flow: if `hasUnsyncedData()`, show a
Twintrinsic `Modal` offering to upload.

## Tasks

1. Define shared domain types (`src/lib/types.ts`) — see
   `CORE_GENETIC_ALGORITHM.md`.
2. Set up Supabase project + schema + RLS policies + average-recalc trigger.
3. Implement `supabaseClient` + auth helpers (`src/lib/services/auth.ts`).
4. Implement remote CRUD for types/items/ratings
   (`src/lib/services/api.ts`).
5. Implement local storage layer (`src/lib/services/local.ts`).
6. Implement sync service (`src/lib/services/sync.ts`) with the upload prompt.
7. Build "Create Type" and "Create Item" forms (Twintrinsic form components)
   — gated behind auth; anonymous users see a "log in to create" prompt.
8. Build the Item data page showing the average ratings + the per-user
   rating list.
9. Vitest tests for local store + sync merge logic; Playwright test for the
   anonymous→login→upload flow.

## Open Questions

- Auth provider(s): email/password + GitHub OAuth? Recommend GitHub OAuth
  (matches the GitHub-hosted project) + email magic link as a fallback.
- Should anonymous ratings on items that don't exist remotely (draft items)
  be uploadable, or only ratings on existing remote items? Recommend
  allowing both — drafts become items on upload.
