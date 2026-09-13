# AGENTS

## Mission
DNAnything is a SvelteKit application that uses a genetic algorithm to compare items of the same type (books, music, movies, wine, beer, etc.) by their rated attributes. Users can create new types and items, rate attributes 0–5, and find similar items using both fast distance-based and deep GA-based similarity matching.

## Core Responsibilities
1. **Genetic algorithm engine** – Maintain a pure, well-tested GA engine in `src/lib/ga/` that evolves attribute weights for similarity matching.
2. **Data access layer** – Keep all ORM (Drizzle) calls centralized in `src/lib/db/repositories.ts` behind the `Repository` interface, so backends and ORMs are swappable.
3. **Twintrinsic UI** – Build all UI with Twintrinsic components (local library at `../twintrinsic`), wired via Vite alias.
4. **Auth + moderation** – Public contributions (types, items, ratings, reviews, recommendations, flags, similarity search) require auth (Supabase). Anonymous users are read-only initially; local data merge (private local contributions) is a future feature for local Docker deployment. Flag-based moderation replaces hard deletes. User self-removal via anonymization. See `docs/plans/AUTH_FLAGS_AND_ANONYMIZATION.md`.
5. **Testing** – Vitest for unit/logic tests, Playwright for e2e workflows.

## Toolbelt & Scripts
Use `pnpm` to run the scripts below:

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Run the Vite-powered SvelteKit dev server. |
| `pnpm build` / `pnpm preview` | Build and preview the production bundle. |
| `pnpm check` | `svelte-check` type/diagnostic sweep. |
| `pnpm test:unit` | Run Vitest unit tests. |
| `pnpm test:e2e` | Run Playwright e2e tests. |
| `pnpm test` | Run all tests (unit + e2e). |
| `pnpm lint` / `pnpm format` | Biome lint/format. |

## Twintrinsic Integration
- **Dev mode**: Vite resolves `twintrinsic` to `../twintrinsic/src/lib` (local source, hot reload). The alias is conditional — only applied when `command === 'serve'`.
- **Production (Vercel)**: `twintrinsic` is installed from GitHub (`"github:skamansam/twintrinsic"` in `package.json`). Vercel clones the repo and runs its `prepare` script to build `dist/`.
- **Watch mode**: Vite watches both `src/` and `../twintrinsic/` for hot reload in dev.
- **Imports**: `import { App, Button, Card } from 'twintrinsic'`.
- **Theme**: Theme tokens defined in `src/app.css` using `@theme`; wine/burgundy palette by default.

## Architecture Notes
- **GA engine** (`src/lib/ga/`): Pure TypeScript, no framework deps. Seeded PRNG for deterministic tests. See `docs/plans/CORE_GENETIC_ALGORITHM.md`.
- **Data access** (`src/lib/db/`): Repository pattern. All Drizzle calls in `repositories.ts`. Swap backend via `client.ts` (connection string), swap ORM via `repositories.ts`. See `docs/plans/DATA_ACCESS_LAYER.md`.
- **Domain types** (`src/lib/types.ts`): Shared across GA, DB, services, and UI.
- **Auth**: Supabase Auth (GitHub OAuth + email magic link). Public contributions require auth. Anonymous users are read-only initially; local data merge (private local contributions merged with DB data on client) is a future feature for local Docker deployment. Similarity search requires auth. Flag-based moderation; user self-removal via anonymization. See `docs/plans/AUTH_FLAGS_AND_ANONYMIZATION.md`.

## Planning
All implementation plans are in `docs/plans/`. Start with `RECOMMENDED_BUILD_PATH.md` for the sequenced roadmap.
