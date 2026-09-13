# Plan: Auth Requirements, Flag System & User Anonymization

## Summary

This plan defines three interrelated policies for data integrity and
moderation:

1. **Auth required for persistent contributions** — creating or modifying
   data that is visible to the community (types, items, ratings, reviews,
   recommendations) requires a logged-in account. Anonymous users can make
   local changes (ratings, reviews, etc.) that are stored in localStorage
   and merged with DB data on the client side, but these changes are only
   visible to that user — they are not persisted to the cloud or shown to
   others. Similarity analysis (GA-based matching) is not available to
   anonymous users.
2. **Flag-based moderation instead of hard deletes** — no data is ever hard
   deleted. Instead, any logged-in user can flag content as inaccurate,
   offensive, spam, or other. Flags are reviewed by moderators who can hide,
   revert, or dismiss the flag.
3. **User self-removal with anonymization** — users can remove their
   account at any time. Their identifying data (display name, avatar) is
   anonymized, not deleted. Their contributions (types, items, ratings,
   reviews, change log entries) remain in the catalog with an anonymized
   author. This preserves the change history without dangling foreign keys.

> **Note**: The local-data-merge feature (anonymous users making local
> changes visible only to themselves) and the local Docker deployment
> target are **future features**. The initial implementation requires auth
> for all contributions and deploys to a cloud host. See the "Future
> Features" section below.

## Motivation

### Why require auth for persistent contributions?

The original plan allowed anonymous users to rate items locally and upload
on login. The revised policy is more nuanced:

- **Persistent contributions require auth**: Data that affects the community
  (public ratings, reviews, recommendations, types, items) must come from
  an authenticated user. This ensures accountability and data quality.
- **Local experimentation is allowed**: Anonymous users can still rate
  items, write reviews, and make changes locally. These changes are stored
  in localStorage and merged with the DB response on the client side, so
  the user sees their own data overlaid on the public catalog. This is
  useful for trying the app before committing to an account, or for users
  who want to experiment privately.
- **Local changes are private**: Local data is never sent to the server and
  never visible to other users. It exists only in that browser's
  localStorage. On login, the user can optionally upload their local data to
  the cloud (making it public), or discard it.
- **Similarity analysis requires auth**: The GA-based similarity search is
  computationally expensive and is not available to anonymous users. This
  prevents abuse and keeps server costs predictable. Anonymous users can
  still browse and view item DNA profiles — they just can't run the
  matching engine.

### Why flags instead of deletes?

- **Provenance**: Hard deletes break the change log. If an item is deleted,
  every change log entry referencing it becomes a dangling reference.
  Flags preserve the entity and its history while hiding it from view.
- **Reversibility**: A flag can be dismissed. A hard delete cannot be
  undone.
- **Community moderation**: Any user can flag content they believe is
  inaccurate or offensive. This distributes moderation work across the
  community rather than relying solely on admins.
- **Audit trail**: The flag itself is a record — who flagged what, when,
  and why. This is valuable for understanding patterns of abuse.

### Why anonymize instead of delete users?

- **Referential integrity**: User IDs are referenced by types, items,
  ratings, reviews, recommendations, and change logs. Deleting a user
  would require either cascading deletes (losing all their contributions)
  or updating every reference (expensive and error-prone).
- **Change history**: The change log records who made each change. If a
  user is deleted, their change log entries lose their author. Anonymizing
  (replacing the display name with "Anonymous User" and clearing the
  avatar) preserves the history while removing personally identifiable
  information.
- **Community ownership**: Types and items created by a user remain in the
  catalog. The community owns them. Only the author's identity is removed.

## Data Model

### New Table: `flags`

```sql
create table flags (
  id uuid primary key default gen_random_uuid(),
  -- The entity that was flagged
  entity_type text not null,  -- 'type' | 'item' | 'rating' | 'review' | 'recommendation' | 'user'
  entity_id uuid not null,
  -- The user who submitted the flag
  flagger_user_id uuid not null references profiles(id) on delete set null,
  -- The reason category
  reason text not null,  -- 'inaccurate' | 'offensive' | 'spam' | 'copyright' | 'other'
  -- Optional detailed explanation from the flagger
  detail text,
  -- Status: 'pending' | 'reviewing' | 'actioned' | 'dismissed'
  status text not null default 'pending',
  -- The moderator who resolved the flag (if actioned/dismissed)
  moderator_user_id uuid references profiles(id) on delete set null,
  -- Optional moderator resolution note
  resolution_note text,
  -- The action taken by the moderator (if any)
  -- 'hide' | 'revert' | 'delete_content' | 'no_action'
  resolution_action text,
  created_at timestamptz default now(),
  resolved_at timestamptz,
  unique (entity_type, entity_id, flagger_user_id)  -- one flag per user per entity
);
```

### New Columns on `profiles`

```sql
alter table profiles
  add column is_anonymized boolean not null default false,
  add column anonymized_at timestamptz;
```

When a user requests self-removal:

1. Set `is_anonymized = true` and `anonymized_at = now()`.
2. Set `display_name = 'Anonymous User'`.
3. Set `avatar_url = null`.
4. **Do not delete the row.** The `id` remains for referential integrity.
5. Disable login for this profile (the Supabase auth user can be disabled
   or deleted, but the profile row stays).

### New Columns on `item_types` and `items`

```sql
alter table item_types
  add column is_hidden boolean not null default false,
  add column hidden_at timestamptz,
  add column hidden_by_user_id uuid references profiles(id) on delete set null;

alter table items
  add column is_hidden boolean not null default false,
  add column hidden_at timestamptz,
  add column hidden_by_user_id uuid references profiles(id) on delete set null;
```

When a moderator actions a flag with `resolution_action = 'hide'`:

1. Set `is_hidden = true` and `hidden_at = now()`.
2. The entity remains in the database but is excluded from all public
   queries (filtered by `WHERE is_hidden = false`).
3. The entity is still visible to moderators and admins on a separate
   moderation dashboard.

### Domain Types

```typescript
// New: Flag entity
interface Flag {
  id: string;
  entityType: 'type' | 'item' | 'rating' | 'review' | 'recommendation' | 'user';
  entityId: string;
  flaggerUserId: string;
  reason: 'inaccurate' | 'offensive' | 'spam' | 'copyright' | 'other';
  detail?: string;
  status: 'pending' | 'reviewing' | 'actioned' | 'dismissed';
  moderatorUserId?: string;
  resolutionNote?: string;
  resolutionAction?: 'hide' | 'revert' | 'delete_content' | 'no_action';
  createdAt: string;
  resolvedAt?: string;
}

interface NewFlag {
  entityType: Flag['entityType'];
  entityId: string;
  flaggerUserId: string;
  reason: Flag['reason'];
  detail?: string;
}

// Updated: User
interface User {
  id: string;
  displayName: string;
  avatarUrl?: string;
  isAnonymized: boolean;
  anonymizedAt?: string;
  createdAt: string;
}

// Updated: ItemType
interface ItemType {
  // ... existing fields ...
  isHidden: boolean;
  hiddenAt?: string;
  hiddenByUserId?: string;
}

// Updated: Item
interface Item {
  // ... existing fields ...
  isHidden: boolean;
  hiddenAt?: string;
  hiddenByUserId?: string;
}
```

## Auth Policy Changes

### What requires auth (updated)

| Action | Anonymous (local) | Logged-in (cloud) |
|--------|-------------------|-------------------|
| Browse types/items | Yes | Yes |
| View item DNA, reviews, recommendations | Yes | Yes |
| Use similarity search (GA matching) | **No** | Yes |
| Rate an item's attributes | Local only (private) | Yes (public) |
| Write a review | Local only (private) | Yes (public) |
| Create a recommendation | Local only (private) | Yes (public) |
| Create a type | **No** | Yes |
| Create an item | **No** | Yes |
| Edit a type or item | **No** | Yes |
| Flag content | **No** | Yes |

### Local data merge (future feature)

Anonymous users can rate items, write reviews, and make recommendations
locally. These changes are:

- **Stored in localStorage** under a `dnanything:local` key.
- **Merged with DB data on the client side** — when the page loads, the
  client fetches public data from the DB and overlays the user's local
  changes. The user sees their own ratings/reviews mixed with the community
  data, but only in their browser.
- **Never sent to the server** — local data is private to that browser.
- **Optional upload on login** — when the user logs in, they can choose to
  upload their local data to the cloud (making it public) or discard it.

This feature is a **future enhancement**. The initial deployment requires
auth for all contributions and does not implement the local merge. The
feature will be prioritized when the app is deployed to a local Docker
environment (see "Future Features" below).

### Impact on the upload-on-login flow

The upload-on-login flow is **restored** (it was briefly removed in an
earlier draft). When the local data merge feature is implemented:

1. User logs in.
2. If local data exists, a prompt asks: "Upload your local data to the
   cloud? This will make your ratings and reviews visible to the
   community."
3. On confirm, local data is pushed to the DB and cleared from
   localStorage.
4. On decline, local data remains in localStorage (private to that
   browser).

Until the local merge feature is implemented, anonymous users are
read-only and the upload prompt does not appear.

## Flag System

### Flagging Flow

1. Any logged-in user clicks "Flag" on a type, item, review, or
   recommendation.
2. A Twintrinsic `Modal` opens with:
   - Reason selector (Inaccurate / Offensive / Spam / Copyright / Other).
   - Optional detail textarea.
   - Submit button.
3. A `Flag` row is created with `status = 'pending'`.
4. The flagger sees a confirmation toast: "Thank you. A moderator will
   review your flag."

### Moderation Flow

1. Moderators (users with a `moderator` role — stored in a `roles` table
   or as a boolean on `profiles`) see a "Moderation" link in the nav.
2. The moderation dashboard lists pending flags, sorted by `created_at`.
3. For each flag, the moderator can:
   - **View** the flagged entity in context.
   - **Dismiss** the flag (`status = 'dismissed'`, `resolution_action =
     'no_action'`).
   - **Hide** the entity (`status = 'actioned'`, `resolution_action =
     'hide'`, set `is_hidden = true` on the entity).
   - **Revert** the entity to a previous state (`status = 'actioned'`,
     `resolution_action = 'revert'` — uses the change log to restore a
     prior version).
   - **Delete content** (`status = 'actioned'`, `resolution_action =
     'delete_content'` — soft-deletes by hiding + marking as deleted in
     the change log; the row remains for audit).
4. The moderator adds a resolution note explaining the decision.
5. The flagger can see the status of their flags on their user profile
   page.

### Duplicate Flags

- One flag per user per entity (enforced by the unique constraint).
- If multiple users flag the same entity, each flag is a separate row.
- The moderation dashboard groups flags by entity, showing the count and
  all reasons.

### Auto-Hide Threshold

If an entity receives N flags (configurable, e.g., 5) within a time
window (e.g., 24 hours), it is automatically hidden pending moderator
review. This prevents viral abuse from staying visible while moderators
catch up.

## User Self-Removal (Anonymization)

### Flow

1. User goes to their profile settings and clicks "Delete My Account".
2. A confirmation modal explains:
   - Your display name and avatar will be removed.
   - Your contributions (types, items, ratings, reviews, recommendations)
     will remain in the catalog, attributed to "Anonymous User".
   - Your change history will remain, attributed to "Anonymous User".
   - This action is irreversible.
3. On confirm:
   - `profiles.is_anonymized = true`
   - `profiles.anonymized_at = now()`
   - `profiles.display_name = 'Anonymous User'`
   - `profiles.avatar_url = null`
   - The Supabase auth user is disabled (not deleted — the profile row
     needs the auth user to exist for the foreign key, but login is
     blocked).
4. The user is logged out and redirected to the home page.

### What Changes in the UI

After anonymization:

- All references to this user's `displayName` show "Anonymous User".
- All links to `/users/{id}` still work but show the anonymized profile.
- The user's avatar is replaced with a default silhouette.
- The change log entries remain, attributed to "Anonymous User".
- The user's created types and items remain, with "Created by Anonymous
  User" in the attribution.

### What Does NOT Change

- The user's `id` remains in all foreign keys. No dangling references.
- The user's ratings still contribute to item averages.
- The user's reviews remain visible (unless separately flagged and
  hidden).
- The user's recommendations remain visible.
- The change log entries remain with the original timestamp and entity
  id.

## Repository Changes

### New Flag Methods

```typescript
// In Repository interface:
createFlag(input: NewFlag): Promise<Flag>;
getFlagsForEntity(entityType: Flag['entityType'], entityId: string): Promise<Flag[]>;
getPendingFlags(limit?: number): Promise<Flag[]>;
resolveFlag(id: string, moderatorUserId: string, action: Flag['resolutionAction'], note?: string): Promise<Flag>;
getFlagsByUser(userId: string): Promise<Flag[]>;
```

### Updated Query Methods

All `listItems`, `listTypes`, `getItem`, `getType` methods must filter
`WHERE is_hidden = false` for public queries. A separate set of admin
methods (`listItemsIncludingHidden`, etc.) is available to moderators.

### New User Methods

```typescript
anonymizeUser(userId: string): Promise<void>;
getUser(id: string): Promise<User | null>;  // returns anonymized display name if is_anonymized
```

## Implementation Phases

### Phase 1: Data Model + Schema

- Add `flags` table to schema.
- Add `is_anonymized`, `anonymized_at` to `profiles`.
- Add `is_hidden`, `hidden_at`, `hidden_by_user_id` to `item_types` and
  `items`.
- Update domain types.
- Update repository methods to filter hidden entities.
- Add seed data for a few sample flags.

### Phase 2: Auth Enforcement

- Require auth for all persistent (cloud) contributions: types, items,
  ratings, reviews, recommendations, and flags.
- Anonymous users are read-only in the initial deployment (local data
  merge is a future feature — see "Future Features").
- Add auth checks to all mutation endpoints and forms.
- Update UI to show "Log in to rate/review/recommend" prompts for
  anonymous users.
- Gate similarity search behind auth — anonymous users see "Log in to use
  similarity search" prompt.
- Update the contribute page and about page to reflect the policy.

### Phase 3: Flag UI

- Add "Flag" button to item pages, type pages, reviews, and
  recommendations.
- Build the flag modal (reason selector + detail textarea).
- Wire to `repository.createFlag()`.
- Show flag status on the user profile page.

### Phase 4: Moderation Dashboard

- Add `moderator` role to profiles.
- Build `/moderation` page listing pending flags grouped by entity.
- Implement dismiss/hide/revert/delete actions.
- Add resolution notes.
- Implement auto-hide threshold.

### Phase 5: User Self-Removal

- Add "Delete My Account" to user profile settings.
- Implement the anonymization flow.
- Update all user display to check `is_anonymized`.
- Disable Supabase auth user on anonymization.

### Phase 6: Local Data Merge (Future)

> Deferred until the local Docker deployment is ready.

- Implement `src/lib/services/local.ts` — localStorage store for
  anonymous ratings, reviews, and recommendations.
- Implement client-side merge logic — overlay local data on DB data when
  rendering pages.
- Implement the upload-on-login prompt — "Make your local data public?"
- Implement the discard option — "Keep local data private."
- Vitest: local store + merge logic + upload/discard flows.

### Phase 7: Local Docker Deployment (Future)

- Write `docker-compose.yml` with SvelteKit app, Postgres, and auth service.
- Add environment variable configuration for local vs. cloud deployment.
- Document the local setup process in README.
- Test the local data merge feature in a local deployment context.
- Optionally enable similarity search for all local network users.

## Security Considerations

- **Flag spam**: A user can only flag each entity once (unique constraint).
  Rate-limiting on flag creation prevents automated abuse.
- **Moderator abuse**: Moderator actions are logged in the change log.
  Admins can review moderator activity.
- **Anonymization irreversibility**: Once anonymized, a user cannot be
  un-anonymized (the display name and avatar are gone). This is by design
  — it's a deletion request, not a pause.
- **Hidden content leakage**: Hidden entities must be filtered in all
  public queries, including API endpoints, search, and similarity
  calculations. The similarity engine should exclude hidden items from
  results.

## Testing

- **Unit**: Flag creation, resolution, auto-hide threshold logic.
- **Unit**: User anonymization — verify display name changes, ratings
  remain, change log remains.
- **Unit**: Hidden entity filtering — verify hidden items are excluded
  from `listItems`, `getItem`, and similarity search.
- **E2E**: Anonymous user sees "Log in to rate" prompt; logged-in user
  can rate.
- **E2E**: Anonymous user sees "Log in to use similarity search" prompt;
  logged-in user can run similarity search.
- **E2E**: User flags an item; moderator sees it in the dashboard;
  moderator hides it; item disappears from public view.
- **E2E**: User deletes their account; their contributions show
  "Anonymous User"; their ratings still count in averages.
- **E2E (future)**: Anonymous user makes local changes; changes are
  visible only to them; on login, upload prompt appears; uploaded data
  becomes public.

## Open Questions

1. **Moderator roles**: Store as a boolean `is_moderator` on `profiles`,
   or a separate `roles` table? **Recommendation**: Boolean for v1; roles
   table if we need fine-grained permissions later.
2. **Auto-hide threshold**: What's the right number of flags and time
   window? **Recommendation**: 5 flags in 24 hours, configurable via an
   admin setting.
3. **Revert mechanism**: How deep should revert go? **Recommendation**:
   Revert to the last version before the flagged change, using the change
   log snapshot. Full version history (like a wiki) is a future
   enhancement.
4. **Appeals**: Should users be able to appeal a moderation decision?
   **Recommendation**: Yes — a flagged user can submit one appeal per
   flag, reviewed by an admin (not the same moderator).

## Future Features

### Local Data Merge (Anonymous Contributions)

> **Status**: Future — not in the initial deployment.

Anonymous users can make local changes (ratings, reviews, recommendations)
that are stored in localStorage and merged with DB data on the client side.
These changes are:

- **Private**: Only visible to that user in that browser.
- **Merged on read**: When the page loads, the client fetches public data
  from the DB and overlays the user's local changes. The user sees their
  own ratings/reviews mixed with the community data.
- **Uploadable on login**: When the user logs in, they can choose to make
  their local data public (upload to the cloud) or discard it.

This feature is deferred because it requires the client-side merge logic
and the upload prompt to be implemented and tested. It will be prioritized
when the app is deployed to a local Docker environment (see below).

### Local Docker Deployment

> **Status**: Future — not in the initial deployment.

The app is designed to be deployable to a local server using Docker,
setting up a local cloud environment. This enables:

- **Self-hosting**: Users who want full control can run DNAnything on
  their own hardware.
- **Offline-capable local contributions**: In a local deployment, the
  local data merge feature becomes more valuable — users on a local
  network can contribute without cloud accounts.
- **Docker Compose setup**: A `docker-compose.yml` will define the
  SvelteKit app, a Postgres database, and a Supabase-compatible auth
  service (or a lightweight alternative). Environment variables configure
  the connection.
- **Local-first architecture**: The app should work with a local Postgres
  instance and a local auth provider, falling back to localStorage when
  no server is available.

The initial deployment targets a cloud host (Vercel + Supabase). The
Docker setup will be added once the core features are stable and the
local data merge is implemented.

### Similarity Analysis Gating

> **Status**: Future — not in the initial deployment.

Similarity analysis (GA-based matching) is not available to anonymous
users. This is a deliberate choice:

- **Server cost**: The GA engine is computationally expensive. Allowing
  anonymous users to run it would make server costs unpredictable.
- **Incentive to register**: Restricting the flagship feature to
  logged-in users encourages account creation, which improves data
  quality and accountability.
- **Local deployment exception**: In a local Docker deployment, the
  similarity analysis could be made available to all users on the local
  network, since the compute cost is borne by the local server owner.

In the initial deployment, anonymous users who try to use similarity
search see a "Log in to use similarity search" prompt. They can still
browse items, view DNA profiles, and read reviews.
