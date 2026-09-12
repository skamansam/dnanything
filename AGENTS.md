# AGENTS

## Mission
DNAnything is a SvelteKit application that uses a genetic algorithm to compare items of the same type (books, music, movies, wine, beer, etc.) by their rated attributes. Users can create new types and items, rate attributes 0–5, and find similar items using both fast distance-based and deep GA-based similarity matching.

## Core Responsibilities
1. **Genetic algorithm engine** – Maintain a pure, well-tested GA engine in `src/lib/ga/` that evolves attribute weights for similarity matching.
2. **Data access layer** – Keep all ORM (Drizzle) calls centralized in `src/lib/db/repositories.ts` behind the `Repository` interface, so backends and ORMs are swappable.
3. **Twintrinsic UI** – Build all UI with Twintrinsic components (local library at `../twintrinsic`), wired via Vite alias.
4. **Auth + sync** – Full auth (Supabase) for cloud storage; anonymous users work against localStorage with upload-on-login.
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
- **Path alias**: Vite resolves `twintrinsic` to `../twintrinsic/src/lib` (see `vite.config.ts`).
- **Watch mode**: Vite watches both `src/` and `../twintrinsic/` for hot reload.
- **Imports**: `import { App, Button, Card } from 'twintrinsic'`.
- **Theme**: Theme tokens defined in `src/app.css` using `@theme`; DNA-inspired green palette by default.

## Architecture Notes
- **GA engine** (`src/lib/ga/`): Pure TypeScript, no framework deps. Seeded PRNG for deterministic tests. See `docs/plans/CORE_GENETIC_ALGORITHM.md`.
- **Data access** (`src/lib/db/`): Repository pattern. All Drizzle calls in `repositories.ts`. Swap backend via `client.ts` (connection string), swap ORM via `repositories.ts`. See `docs/plans/DATA_ACCESS_LAYER.md`.
- **Domain types** (`src/lib/types.ts`): Shared across GA, DB, services, and UI.
- **Auth**: Supabase Auth (GitHub OAuth + email magic link). Anonymous users get a local pseudo-user id; data uploads on login.

## Planning
All implementation plans are in `docs/plans/`. Start with `RECOMMENDED_BUILD_PATH.md` for the sequenced roadmap.
