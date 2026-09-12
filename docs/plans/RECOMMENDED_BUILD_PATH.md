# Recommended Build Path

**Objective**: A sequenced roadmap for building DNAnything, ordering the
work so each phase produces something testable and the riskiest/most
foundational pieces come first.

## Guiding Principles

1. **Pure logic first** — the GA engine is framework-agnostic TypeScript;
  build and fully test it before any UI or DB work.
2. **Data access abstraction before implementation** — define the
  `Repository` interface before writing Drizzle queries, so the rest of
  the app is decoupled from the backend from day one.
3. **Vertical slices over horizontal layers** — once the foundation is in,
  build one full feature (type → items → ratings → similar) end-to-end
  before broadening.
4. **Test as you go** — every phase ships with its tests (Vitest for
  logic, Playwright for workflows).

## Phases

### Phase 0 — Project Scaffold & Twintrinsic Wiring
**Goal**: A running SvelteKit dev server with the Twintrinsic shell.

- [ ] Scaffold SvelteKit (Svelte 5, TypeScript, Tailwind 4, Biome) — match
  `fo4-tools` versions.
- [ ] `vite.config.ts` with `twintrinsic` alias to `../twintrinsic/src/lib`.
- [ ] `src/app.css` importing Tailwind + Twintrinsic theme + `@source`
  directives.
- [ ] `src/app.html` with Iconify runtime + theme bootstrap script.
- [ ] `src/routes/+layout.svelte` using Twintrinsic `App` shell + brand
  placeholder.
- [ ] Add `dnanything` to root `pnpm-workspace.yaml`.
- [ ] Verify hot reload works across `dnanything/` and `../twintrinsic/`.

**Deliverable**: App shell renders at `localhost:5173` with Twintrinsic
components and themed styling.

### Phase 1 — Domain Types & Data Access Layer
**Goal**: Typed domain model + swappable DB connector + repository
interface (no real DB yet).

- [ ] `src/lib/types.ts` — `ItemType`, `Item`, `Rating`, `Attribute`
  (from `CORE_GENETIC_ALGORITHM.md`).
- [ ] `src/lib/db/types.ts` — `Repository` interface + `New*` input types.
- [ ] `src/lib/db/client.ts` — Drizzle connector factory (env-based).
- [ ] `src/lib/db/schema.ts` — Drizzle schema (Postgres tables).
- [ ] `src/lib/db/repositories.ts` — all Drizzle calls, implements
  `Repository`.
- [ ] `src/lib/db/index.ts` — exports singleton `repository`.
- [ ] `tests/unit/db/inMemoryRepository.ts` — in-memory impl for tests.
- [ ] Vitest: repository contract tests against the in-memory impl.

**Deliverable**: Data access layer compiles, in-memory repository passes
contract tests. See `DATA_ACCESS_LAYER.md`.

### Phase 2 — Core Genetic Algorithm Engine
**Goal**: The heart of the app, pure TS, fully tested.

- [ ] `src/lib/ga/types.ts` — genome, weight vector, GA options.
- [ ] `src/lib/ga/distance.ts` — weighted distance + fitness.
- [ ] `src/lib/ga/engine.ts` — GA loop (selection, crossover, mutation,
  elitism) with seeded RNG.
- [ ] `src/lib/ga/similarity.ts` — `findSimilar()` fast + deep modes,
  single + selection targets.
- [ ] `src/lib/ga/worker.ts` — Web Worker wrapper with progress messages.
- [ ] Vitest: distance, fitness, GA convergence, `findSimilar`,
  worker contract — all deterministic with seeded RNG.

**Deliverable**: GA engine passes full unit test suite. See
`CORE_GENETIC_ALGORITHM.md` + `SIMILAR_ITEMS.md`.

### Phase 3 — Supabase Backend Setup
**Goal**: A real remote DB with schema, RLS, auth, and triggers.

- [ ] Create Supabase project.
- [ ] Apply Drizzle schema as a migration (`drizzle-kit push` or SQL).
- [ ] Enable RLS; write policies (public read; auth write + ownership).
- [ ] Add average-recalculation Postgres trigger.
- [ ] Configure GitHub OAuth + email magic link.
- [ ] `.env.example` with all keys (no real secrets committed).
- [ ] Verify repository works against the real DB (smoke test).

**Deliverable**: Remote DB accepts reads/writes via the repository; auth
works. See `TYPES_ITEMS_AND_RATINGS.md` + `BACKEND_DATABASE_RESEARCH.md`.

### Phase 4 — Local Storage & Sync Service
**Goal**: Anonymous users can rate locally; login uploads local data.

- [ ] `src/lib/services/local.ts` — localStorage store (pseudo-user id,
  ratings, drafts).
- [ ] `src/lib/services/sync.ts` — `hasUnsyncedData()`,
  `uploadLocalToRemote()`, merge logic (dedup by slug/name).
- [ ] `src/lib/services/auth.ts` — Supabase auth helpers (login, logout,
  session).
- [ ] Vitest: local store + sync merge logic (in-memory repository).

**Deliverable**: Anonymous rating persists locally; login flow detects and
uploads. See `TYPES_ITEMS_AND_RATINGS.md`.

### Phase 5 — Branding & Logo
**Goal**: The DNAnything identity.

- [ ] Prototype helix-as-N and helix-as-A SVG concepts.
- [ ] Pick the legible-at-16px winner; refine wordmark.
- [ ] `src/lib/components/DnaAnythingLogo.svelte` (theme-aware, `size`
  prop).
- [ ] `static/favicon.svg`, `static/manifest.json`, `static/og.png`.
- [ ] Wire logo into `App` brand snippet + `app.html` favicon.
- [ ] Vitest: logo renders, respects `size`, applies theme color.

**Deliverable**: Branded app shell + favicon. See `BRANDING_AND_LOGO.md`.

### Phase 6 — UI: Type Browse & Item Data Pages
**Goal**: Users can browse types and view items with their average ratings.

- [ ] Home page (`/`) — type grid (Twintrinsic `Card`s).
- [ ] Type browse page (`/types/[slug]`) — item list for a type.
- [ ] Item data page (`/items/[id]`) — average ratings (`Table` +
  `MetricGrid`), individual ratings list, metadata.
- [ ] Seed builtin types (music, books, movies, wine, beer) with demo
  items + ratings.
- [ ] Playwright: browse type → view item → see averages.

**Deliverable**: Browseable catalog with rating displays. See
`TWINTRINSIC_UI_INTEGRATION.md`.

### Phase 7 — UI: Create Type & Create Item (Auth-Gated)
**Goal**: Logged-in users can create new types and items.

- [ ] "Create Type" form (`/types/new`) — name, slug, attributes editor
  (Twintrinsic form components).
- [ ] "Create Item" form (`/items/new?type=[slug]`) — name, description,
  metadata, initial ratings.
- [ ] Auth gate: anonymous users see "Log in to create" prompt.
- [ ] Wire forms to `repository.createType()` / `repository.createItem()`.
- [ ] Playwright: logged-in user creates a type + item; anonymous sees the
  gate.

**Deliverable**: Authenticated content creation. See
`TYPES_ITEMS_AND_RATINGS.md`.

### Phase 8 — UI: Ratings Input
**Goal**: Users can rate an item's attributes (0–5); averages update.

- [ ] Rating input UI on item data page (Twintrinsic `Rating` or `Slider`
  per attribute).
- [ ] Anonymous → localStorage; logged-in → repository.
- [ ] Average recalculation display updates after rating.
- [ ] Playwright: rate an item → average updates; second user rates →
  mean reflects both.

**Deliverable**: Full rating workflow. See `TYPES_ITEMS_AND_RATINGS.md`.

### Phase 9 — UI: Similar Items (Single + Selection)
**Goal**: The flagship GA feature, both modes.

- [ ] "Similar items" panel on item data page — mode toggle (Fast / Deep
  Match via `Switch`/`RadioGroup`).
- [ ] Fast mode: instant ranked results (`Table`/`Card` grid).
- [ ] Deep mode: GA in Web Worker, `Progress` bar, ranked results +
  contributing-attribute `Tag`s.
- [ ] Selection flow: multi-select on type browse → "Find similar" →
  results page (mean-vector target + negative sampling).
- [ ] Result LRU cache.
- [ ] Playwright: single-item similar renders; deep match completes;
  selection flow works.

**Deliverable**: Working genetic-algorithm similarity, both modes. See
`SIMILAR_ITEMS.md`.

### Phase 10 — Auth Flow & Local→Remote Upload
**Goal**: Complete login experience with the upload prompt.

- [ ] Login modal (Twintrinsic `Modal`) — GitHub OAuth + email magic link.
- [ ] On login with local data → upload prompt (`Modal` + `Alert`).
- [ ] User menu (avatar, display name, logout) in `AppHeader`.
- [ ] Playwright: anonymous rates → login → upload prompt → data appears
  remotely.

**Deliverable**: Full auth + sync UX. See `TYPES_ITEMS_AND_RATINGS.md`.

### Phase 11 — GitHub Repo, CI & Deployment
**Goal**: Source on GitHub, CI green, deployed to Vercel.

- [ ] `git init`, create GitHub repo, push.
- [ ] `.gitignore`, `.env.example`, `README.md`, `AGENTS.md`.
- [ ] `.github/workflows/ci.yml` — check + unit + e2e + build.
- [ ] Install `@sveltejs/adapter-vercel`; configure `svelte.config.js`.
- [ ] Connect repo to Vercel; set env vars; configure OAuth callback URL.
- [ ] First production deploy.

**Deliverable**: Live app at a Vercel URL with CI on every PR. See
`GITHUB_HOSTING.md`.

### Phase 12 — Polish & Hardening
**Goal**: Production-ready quality.

- [ ] Coverage thresholds enforced in CI for `src/lib/ga` + `src/lib/db`.
- [ ] Accessibility audit (keyboard nav, ARIA, contrast) across pages.
- [ ] Responsive design pass (mobile/tablet/desktop breakpoints).
- [ ] Error states (Twintrinsic `Alert`/`Toast`) for failed loads/saves.
- [ ] Loading states (`Skeleton`) for async data.
- [ ] Empty states for new types with no items.

**Deliverable**: Polished, accessible, resilient app.

## Dependency Graph

```
Phase 0 (scaffold)
  └─▶ Phase 1 (types + data layer)
        ├─▶ Phase 2 (GA engine) ──────────────┐
        └─▶ Phase 3 (Supabase)                │
              └─▶ Phase 4 (local + sync)      │
                    └─▶ Phase 5 (branding)    │
                          └─▶ Phase 6 (browse)│
                                ├─▶ Phase 7 (create) ──▶ Phase 8 (rate)
                                │                       │
                                └─▶ Phase 9 (similar) ◀─┘ (uses GA engine)
                                      │
                                      └─▶ Phase 10 (auth flow)
                                            └─▶ Phase 11 (GitHub + deploy)
                                                  └─▶ Phase 12 (polish)
```

Phases 1 and 2 can be done in parallel (different files, no dependencies
on each other). Phases 3–5 can partially overlap once Phase 1 is done.

## Estimated Effort Distribution

| Phase | Relative effort | Risk |
|-------|----------------|------|
| 0 Scaffold | Small | Low |
| 1 Data layer | Medium | Low |
| 2 GA engine | Medium | Medium (algorithm correctness) |
| 3 Supabase | Small | Low |
| 4 Local + sync | Medium | Medium (merge edge cases) |
| 5 Branding | Small | Low |
| 6 Browse UI | Medium | Low |
| 7 Create UI | Medium | Low |
| 8 Ratings UI | Medium | Low |
| 9 Similar items | Large | Medium (Web Worker + GA UX) |
| 10 Auth flow | Medium | Medium (OAuth + sync prompt) |
| 11 GitHub + deploy | Small | Low |
| 12 Polish | Medium | Low |

The highest-value, highest-risk work is **Phase 2 (GA engine)** and
**Phase 9 (similar items UX)** — both are front-loaded or built on the
front-loaded engine so issues surface early.
