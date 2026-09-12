# Backend Database Research Plan

**Objective**: Research and compare 5 free-tier relational database
backends, give a breakdown of each, and recommend one for DNAnything.

## Requirements

- **Relational** (preferred) — items, types, ratings, users have clear
  relational structure with joins and aggregates (average ratings).
- **Decent free tier** — this is a hobby/portfolio app; must run for free
  at low traffic.
- **Auth support** is a major plus — the app needs full auth for cloud
  storage (see `TYPES_ITEMS_AND_RATINGS.md`).
- **ORM-friendly** — we'll use Drizzle or Prisma; standard SQL is a plus.

## The 5 Candidates

### 1. Supabase (PostgreSQL + BaaS) — ⭐ RECOMMENDED

| | |
|---|---|
| **Engine** | PostgreSQL 15 |
| **Free storage** | 500 MB |
| **Free projects** | 2 |
| **Auth** | ✅ Built-in (email, OAuth, magic link) — 50K MAU |
| **Realtime** | ✅ Postgres changes broadcast over websockets |
| **Storage** | ✅ 1 GB file storage |
| **Branching** | ❌ (paid only) |
| **Idle behavior** | Pauses after ~7 days inactivity; manual resume |
| **Lock-in** | Low — standard Postgres, export anytime |
| **Always free?** | Yes |

**Why it fits**: Supabase is a full backend, not just a DB. We get Postgres
**plus** auth, realtime, and storage in one free tier — exactly what the
local/remote sync + auth model needs. Row Level Security lets us enforce
"only owners can edit their types/items" at the DB layer. The 7-day pause
is the main downside, but for an actively developed app it's a non-issue,
and paid plans remove it.

### 2. Neon (Serverless PostgreSQL)

| | |
|---|---|
| **Engine** | PostgreSQL 16 |
| **Free storage** | 0.5 GB / project |
| **Free projects** | 100 |
| **Auth** | ❌ Bring your own |
| **Realtime** | ❌ |
| **Branching** | ✅ Instant git-like branches (10/project) |
| **Idle behavior** | Scale-to-zero, auto-wakes in ~570ms; stays reachable |
| **Lock-in** | Low — standard Postgres |
| **Always free?** | Yes |

**Why it's strong**: Pure serverless Postgres with the best cold-start
behavior and instant branching for preview deploys. **But** it's a database
only — we'd have to bolt on auth (Clerk/Auth0) and realtime separately,
adding cost and integration work. Best if we already had an auth provider.

### 3. Turso (Edge SQLite / libSQL)

| | |
|---|---|
| **Engine** | SQLite (libSQL fork) |
| **Free storage** | 5 GB |
| **Free databases** | 100 |
| **Auth** | ❌ |
| **Realtime** | ❌ (embedded replicas, not push) |
| **Branching** | Per-database, instant |
| **Idle behavior** | Always-on (scale-to-zero deprecated Jan 2026) |
| **Lock-in** | Medium — libSQL is a SQLite fork, not Postgres |
| **Always free?** | Yes |

**Why it's interesting**: Most generous storage (5 GB) and great for
multi-tenant/edge read-heavy apps. **But** it's SQLite, not Postgres — no
stored procedures/triggers for average recalculation, and we'd need to
handle aggregates in app code. Plus no built-in auth. Wrong fit for a
relational app that leans on triggers and RLS.

### 4. Cloudflare D1 (Edge SQLite)

| | |
|---|---|
| **Engine** | SQLite |
| **Free storage** | 5 GB |
| **Free reads/writes** | 5M reads/day, 100K writes/day |
| **Auth** | ❌ (pair with Cloudflare Access / Workers Access) |
| **Realtime** | ❌ |
| **Branching** | ❌ |
| **Idle behavior** | Always-on |
| **Lock-in** | Medium — Cloudflare-specific |
| **Always free?** | Yes |

**Why it's interesting**: Generous daily quotas and tight Cloudflare
Workers integration. **But** same SQLite limitations as Turso, plus it's
tied to the Cloudflare ecosystem (we'd host the frontend on Cloudflare
Pages to benefit). No built-in auth and no triggers make the average-rating
recalculation awkward. Better suited to edge-read-heavy workloads than a
write-heavy ratings app.

### 5. CockroachDB Serverless (Postgres-compatible)

| | |
|---|---|
| **Engine** | CockroachDB (Postgres wire-compatible) |
| **Free tier** | 50M Request Units / mo, 10 GB storage |
| **Auth** | ❌ |
| **Realtime** | ❌ |
| **Branching** | ❌ |
| **Idle behavior** | Scale-to-zero |
| **Lock-in** | Low-Medium — Postgres-compatible but not identical |
| **Always free?** | Yes |

**Why it's interesting**: Globally distributed, strongly consistent
Postgres-compatible SQL — survives region failures. **But** the
Postgres-compatibility is wire-protocol only; some Postgres features
(JSONB operators, certain extensions, triggers) have caveats, and there's
no built-in auth or realtime. Overkill for a single-region hobby app, and
the trigger-based average recalculation may need rework.

## Comparison Summary

| Backend | Engine | Free Storage | Auth | Realtime | Branching | Fit |
|---|---|---|---|---|---|---|
| **Supabase** | Postgres | 500 MB | ✅ | ✅ | ❌ | ⭐ Best |
| Neon | Postgres | 0.5 GB | ❌ | ❌ | ✅ | Great DB, no auth |
| Turso | SQLite | 5 GB | ❌ | ❌ | ✅ | Wrong engine |
| Cloudflare D1 | SQLite | 5 GB | ❌ | ❌ | ❌ | Wrong engine |
| CockroachDB | Postgres* | 10 GB | ❌ | ❌ | ❌ | Overkill |

## Recommendation: Supabase

Supabase is the only candidate that delivers **Postgres + Auth + Realtime +
Storage** in a single free tier, which directly satisfies the app's
auth-and-sync requirements without stitching together multiple services.
The 500 MB storage and 50K MAU are ample for a portfolio app; the 7-day
pause is the sole drawback and is a non-issue for an actively used project.

**Neon** is the runner-up if we ever want to drop Supabase's BaaS layer and
own auth ourselves — its branching and cold-start behavior are superior,
and it stays on standard Postgres.

## ORM Choice

Use **Drizzle ORM** (TypeScript-first, lightweight, great SvelteKit
support) with a Supabase connection. Drizzle's schema-as-code pairs well
with the typed domain model in `CORE_GENETIC_ALGORITHM.md`.

## Tasks

1. Create Supabase project; apply schema from `TYPES_ITEMS_AND_RATINGS.md`.
2. Enable RLS; write policies (public read; auth write with ownership).
3. Add the average-recalculation trigger.
4. Configure GitHub OAuth + email magic link auth providers.
5. Wire Drizzle schema + `supabaseClient` into the SvelteKit app.
6. Document connection strings in `.env.example` (never commit real keys).
