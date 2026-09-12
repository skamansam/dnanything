# Testing Plan (Vitest + Playwright)

**Objective**: Test DNAnything with **Vitest** for unit/logic tests and
**Playwright** for end-to-end workflow tests, following the patterns in the
`vitest` and `playwright` skills (sourced from `fo4-tools/.devin/skills`).

## Stack

- **Vitest** — unit tests for pure logic (GA engine, distance, similarity,
  local store, sync merge) and Svelte component rendering.
- **@testing-library/svelte** + **@testing-library/user-event** — component
  queries and realistic user interactions.
- **Playwright** — e2e tests covering real user workflows across routes.
- **jsdom** — DOM environment for component unit tests.

Configuration mirrors `fo4-tools` (and Twintrinsic): `vitest.config.ts` for
unit, `playwright.config.ts` for e2e.

## Test Pyramid

```
        ┌─────────────────┐
        │  Playwright e2e │  few, broad, slow — user workflows
        ├─────────────────┤
        │  Vitest components│  medium — component behavior
        ├─────────────────┤
        │  Vitest logic    │  many, fast, deterministic — pure functions
        └─────────────────┘
```

## Unit Tests (Vitest) — `tests/unit/`

### GA engine (`tests/unit/ga/`)
- `distance.test.ts` — weighted distance + fitness: self-distance = 0,
  fitness = 1; symmetry; weight scaling.
- `engine.test.ts` — GA loop with **seeded RNG**: best fitness
  non-decreasing (elitism); converges within N generations on a known
  dataset; mutation/crossover keep weights in [0,1].
- `similarity.test.ts` — `findSimilar()` fast + deep modes; single target
  and selection (mean-vector) targets; negative-sampling fitness for
  selections; result shape and ranking order.
- `worker.test.ts` — worker message contract (mocked `postMessage`):
  progress messages per generation, final ranked list payload.

### Services (`tests/unit/services/`)
- `local.test.ts` — localStorage store: read/write, pseudo-user id
  generation, `hasUnsyncedData()`, `clearLocal()`.
- `sync.test.ts` — merge logic: duplicate ratings update vs insert; draft
  type/item dedup by slug/name; `SyncResult` counts.
- `auth.test.ts` — auth state helpers (mocked Supabase client).

### Components (`tests/unit/components/`)
- `DnaAnythingLogo.test.ts` — renders, respects `size` prop, applies theme
  variable color.
- Form components — "Create Type" / "Create Item" validation, disabled
  state when anonymous, submit callbacks.
- "Similar items" panel — mode toggle switches fast/deep, renders ranked
  results, shows contributing-attribute tags in deep mode.

### Patterns (from the vitest skill)
- Use `@testing-library/svelte` `render` + `screen` with **semantic
  queries** (`getByRole`, `getByLabel`).
- Use `userEvent.setup()` over `fireEvent` for realistic interactions.
- Mock external deps (`vi.mock('$lib/services/api', ...)`); mock Supabase
  client in service tests.
- Seed RNG (`vi.spyOn(Math, 'random')` or a seeded PRNG) for GA tests.
- Aim for >80% statement coverage on `src/lib/ga/` and `src/lib/services/`.

## E2E Tests (Playwright) — `tests/e2e/`

### `auth.test.ts`
- Anonymous user can browse types/items and rate (writes to localStorage).
- GitHub OAuth login flow (mocked in CI via a test account / preview env).
- On login with local data, the upload prompt appears; accepting uploads
  and clears local.

### `types_items.test.ts`
- Logged-in user creates a new type with attributes → it appears in browse.
- Logged-in user creates an item in a type → item data page renders.
- Anonymous user sees "log in to create" prompt on create forms.

### `ratings.test.ts`
- User rates an item's attributes → item data page shows the average and
  the user's individual rating.
- A second user rates the same item → average updates to the mean.

### `similar.test.ts`
- Item data page "Similar items" panel renders results in fast mode.
- Toggling to deep match shows a progress bar then ranked results with
  contributing-attribute tags.
- Selecting multiple items → "Find similar" → results page renders.

### Patterns (from the playwright skill)
- Use **semantic locators** (`page.getByRole`, `page.getByLabel`); avoid
  CSS selectors.
- Use **assertions over hard waits** (`await expect(locator).toBeVisible()`
  instead of `waitForTimeout`).
- Each test independent; use `test.beforeEach` for navigation/setup.
- Mock Supabase in CI with a seeded preview DB or a local Supabase
  instance (Supabase CLI `supabase start`) to keep e2e deterministic.

## Configuration

### `vitest.config.ts`
- `environment: 'jsdom'`, `globals: true`, setup file importing
  `@testing-library/jest-dom` matchers.
- Coverage: `v8` provider, thresholds on `src/lib/ga` + `src/lib/services`.
- Alias `twintrinsic` → local lib (same as `vite.config.ts`).

### `playwright.config.ts`
- `webServer` auto-starts `pnpm dev` on port 5173.
- Projects: chromium, firefox, webkit.
- `retries: 2` on CI, `0` locally; baseURL from env.

## Tasks

1. Add dev deps: `vitest`, `@testing-library/svelte`,
   `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`,
   `@vitest/coverage-v8`, `@playwright/test`.
2. Write `vitest.config.ts` + `playwright.config.ts`.
3. Write GA engine unit tests first (TDD — write failing test, implement,
   pass).
4. Write service unit tests (local store, sync merge).
5. Write component unit tests as components are built.
6. Write e2e tests per workflow above; wire a seeded Supabase for CI.
7. Add `pnpm test:unit`, `pnpm test:e2e`, `pnpm test` scripts.

## Open Questions

- E2E Supabase strategy: local Supabase CLI in CI vs a dedicated preview
  project? Recommend local Supabase CLI (`supabase start`) in CI for
  isolation and determinism.
- Coverage gating: enforce thresholds in CI from day one, or ramp up?
  Recommend enforce on `src/lib/ga` from day one (pure logic), ramp the
  rest.
