# Types, Items, Ratings & Auth Plan

**Objective**: Users can create new types and new items in any type. When
different users rate the same item, an average is created and stored
alongside each individual rating, both shown on the item's data page.

## Auth & Storage Model (updated)

> **Note**: The auth policy has been updated. See
> `AUTH_FLAGS_AND_ANONYMIZATION.md` for the full policy. The key changes are:
>
> 1. **Persistent (cloud) contributions require auth** — creating types,
>    items, ratings, reviews, and recommendations that are visible to the
>    community requires a logged-in account.
> 2. **Local contributions are a future feature** — anonymous users will
>    eventually be able to make local changes (ratings, reviews) stored in
>    localStorage and merged with DB data on the client side. These changes
>    are private to that browser. This is deferred until the local Docker
>    deployment is ready.
> 3. **Similarity search requires auth** — the GA-based matching engine is
>    not available to anonymous users. They can browse and view DNA
>    profiles but cannot run the matching engine.
> 4. **Flag-based moderation** replaces hard deletes. Any logged-in user
>    can flag content. See `AUTH_FLAGS_AND_ANONYMIZATION.md`.
> 5. **User self-removal uses anonymization** — the user's display name
>    and avatar are removed but their contributions remain, attributed to
>    "Anonymous User". See `AUTH_FLAGS_AND_ANONYMIZATION.md`.

- **Full auth for cloud storage** (Supabase Auth). Logged-in users' data
  lives in the remote Postgres DB and is immediately visible to the
  community.
- **Anonymous users are read-only** in the initial deployment. They can
  browse the catalog, view item DNA, read reviews, but cannot rate,
  review, recommend, create, or use similarity search.
- **Local data merge (future)**: Anonymous users will be able to make
  local changes stored in localStorage and merged with DB data on the
  client. These changes are private to that browser. On login, the user
  can optionally upload their local data to the cloud. This feature is
  deferred until the local Docker deployment is ready.
- **Creating types/items/ratings/reviews/recommendations requires auth**
  for persistent (public) contributions.

## Data Flow

```
Anonymous user (initial)          Logged-in user
───────────────────               ──────────────
browse catalog (read-only)        rate item ──▶ Supabase (Rating row)
view DNA profiles                    │
read reviews                         └─▶ trigger recalculates Item.averageRatings
NO similarity search
NO contributions                   login ──▶ authenticated ──▶ can rate, review,
                                                    recommend, create, flag,
                                                    use similarity search

Anonymous user (future — local data merge)
─────────────────────────────────────────────
rate item ──▶ localStorage (private)
view page ──▶ DB data + local data merged on client
login ──▶ prompt: "Upload local data to cloud?" ──▶ yes/no
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

> **Updated**: In the initial deployment, localStorage is used only for UI
> preferences. The local data merge (anonymous contributions) is a future
> feature deferred until the local Docker deployment is ready. See
> `AUTH_FLAGS_AND_ANONYMIZATION.md`.

### UI Preferences (initial deployment)

A single namespaced key `dnanything:preferences` holds:

```ts
interface LocalPreferences {
  selectedTheme: string;
  sidebarCollapsed: boolean;
  lastVisitedType?: string;
}
```

### Local Data (future — local data merge)

When the local data merge feature is implemented, a second key
`dnanything:local` will hold anonymous contributions:

```ts
interface LocalState {
  pseudoUserId: string;          // generated on first visit
  ratings: Rating[];             // private local ratings
  reviews: Review[];             // private local reviews
  recommendations: Recommendation[]; // private local recommendations
  lastSyncedAt: string | null;
}
```

On login, the user can choose to upload local data to the cloud (making
it public) or keep it private. If uploaded, local data is cleared after
successful sync.

## Sync Service

> **Updated**: In the initial deployment, there is no data sync —
> anonymous users are read-only. The sync service will be implemented as
> a future feature when the local data merge is added. See
> `AUTH_FLAGS_AND_ANONYMIZATION.md`.

### UI Preferences (initial deployment)

`src/lib/services/preferences.ts` exposes:

- `getPreferences(): LocalPreferences`
- `savePreferences(prefs: Partial<LocalPreferences>): void`

### Data Sync (future — local data merge)

When the local data merge feature is implemented, `src/lib/services/sync.ts`
will expose:

- `getLocalState(): LocalState`
- `hasUnsyncedData(): boolean`
- `uploadLocalToRemote(userId): Promise<SyncResult>` — pushes local
  ratings/reviews/recommendations to the cloud, returns counts.
- `clearLocal()` — called after a successful upload.
- `mergeLocalWithRemote(remoteData, localState)` — client-side merge for
  rendering.

Called from the auth callback / login flow: if `hasUnsyncedData()`, show a
Twintrinsic `Modal` offering to upload.

## Tasks

1. Define shared domain types (`src/lib/types.ts`) — see
   `CORE_GENETIC_ALGORITHM.md`.
2. Set up Supabase project + schema + RLS policies + average-recalc trigger.
3. Implement `supabaseClient` + auth helpers (`src/lib/services/auth.ts`).
4. Implement remote CRUD for types/items/ratings
   (`src/lib/services/api.ts`).
5. Implement UI preference storage (`src/lib/services/preferences.ts`) —
   theme, sidebar state only (no data sync).
6. Build "Create Type" and "Create Item" forms (Twintrinsic form components)
   — gated behind auth; anonymous users see a "log in to create" prompt.
7. Build the Item data page showing the average ratings + the per-user
   rating list.
8. Add auth checks to all mutation endpoints and forms — ratings, reviews,
   recommendations, type/item creation, and editing all require auth.
   Anonymous users see "Log in to rate/review/recommend" prompts.
9. Implement flag system — flag table, flag creation UI, moderation
   dashboard. See `AUTH_FLAGS_AND_ANONYMIZATION.md`.
10. Implement user self-removal with anonymization. See
    `AUTH_FLAGS_AND_ANONYMIZATION.md`.
11. Vitest tests for auth enforcement + flag logic; Playwright test for the
    auth-gated contribution flow.

## Open Questions

- Auth provider(s): email/password + GitHub OAuth? Recommend GitHub OAuth
  (matches the GitHub-hosted project) + email magic link as a fallback.
- Should anonymous ratings on items that don't exist remotely (draft items)
  be uploadable, or only ratings on existing remote items? Recommend
  allowing both — drafts become items on upload.

## Parent Types & Cloning

Types support an optional **parent type** for hierarchical organization:

- `ItemType.parentTypeId` — optional reference to another type.
- No runtime inheritance — the child type is fully independent. The parent
  link is for display and organization only (breadcrumb navigation,
  sub-type listings on the types index and type detail pages).
- Items can be added to any type in the hierarchy (parent or child).

**Cloning**: The `/types/new` page includes a "Clone from Existing Type"
selector. When a type is selected and "Clone" is clicked:

1. The source type's attributes, fields, and subcategories are copied as
   drafts into the form.
2. The name is pre-filled as "{Source Name} (Copy)" and the slug is
   auto-generated.
3. The parent type is set to the source type.
4. The user can modify any of the copied data before creating the new type.
5. After creation, the new type is fully independent — changes to the
   source type do not affect it and vice versa.
