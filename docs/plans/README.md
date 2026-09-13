# DNAnything — Planning Documents

This folder contains implementation plan documents for DNAnything, one per
top-level feature bullet from the project brief. Each plan is self-contained
and actionable; together they form the roadmap for the app.

## Active Documents

| File | Feature Bullet |
|------|----------------|
| **[BRANDING_AND_LOGO.md](./BRANDING_AND_LOGO.md)** | App name "DNAnything" + DNA double-helix logo |
| **[CORE_GENETIC_ALGORITHM.md](./CORE_GENETIC_ALGORITHM.md)** | Genetic algorithm to compare items by rated attributes |
| **[TYPES_ITEMS_AND_RATINGS.md](./TYPES_ITEMS_AND_RATINGS.md)** | User-created types/items, average ratings, auth + local/remote sync |
| **[SIMILAR_ITEMS.md](./SIMILAR_ITEMS.md)** | Similar items for one item or a selection (both GA modes) |
| **[BACKEND_DATABASE_RESEARCH.md](./BACKEND_DATABASE_RESEARCH.md)** | 5 free-tier DB backends compared + recommendation |
| **[DATA_ACCESS_LAYER.md](./DATA_ACCESS_LAYER.md)** | DB connector scheme + centralized repository (swappable backend/ORM) |
| **[TWINTRINSIC_UI_INTEGRATION.md](./TWINTRINSIC_UI_INTEGRATION.md)** | Twintrinsic component library integration |
| **[GITHUB_HOSTING.md](./GITHUB_HOSTING.md)** | GitHub repository + hosting strategy |
| **[TESTING.md](./TESTING.md)** | Vitest (unit) + Playwright (e2e) testing strategy |
| **[RECOMMENDED_BUILD_PATH.md](./RECOMMENDED_BUILD_PATH.md)** | Sequenced 13-phase roadmap for building the app |
| **[PER_TYPE_THEMING.md](./PER_TYPE_THEMING.md)** | Per-type header images + custom CSS theming (future) |
| **[AUTH_FLAGS_AND_ANONYMIZATION.md](./AUTH_FLAGS_AND_ANONYMIZATION.md)** | Auth for all contributions, flag-based moderation, user anonymization |

## Cross-Cutting Decisions

These decisions were confirmed up front and are assumed by every plan:

- **Auth model**: Full auth for cloud storage (Supabase Auth). Anonymous users
  work against `localStorage`; on login, unsaved local data is offered for
  upload to the remote DB. **Creating new types/items requires auth.**
- **Recommended backend**: **Supabase** (Postgres + Auth + Realtime + Storage).
  See `BACKEND_DATABASE_RESEARCH.md` for the full comparison and rationale.
- **ORM**: **Drizzle ORM**, with all ORM calls centralized in a single
  repository module behind a swappable DB connector. See
  `DATA_ACCESS_LAYER.md`.
- **Genetic algorithm scope**: **Both modes** — a fast distance-based
  similarity default, plus a "deep match" GA mode that evolves attribute
  weights for exploratory results. See `SIMILAR_ITEMS.md`.
- **UI library**: **Twintrinsic** (local Svelte 5 component library at
  `/home/sam/workspace-other/twintrinsic`), wired in via Vite alias the same
  way `fo4-tools` does it. See `TWINTRINSIC_UI_INTEGRATION.md`.
- **Testing**: **Vitest** for unit/logic tests, **Playwright** for e2e
  workflows. See `TESTING.md`.
- **Hosting**: GitHub repo + Supabase backend + a static/edge host for the
  SvelteKit frontend. See `GITHUB_HOSTING.md`.

## Guidelines for Planning Files

- Keep them concise and focused on actionable items.
- Update progress regularly as work completes.
- Link to relevant code, PRs, or issues when applicable.
- Archive or remove completed plans to keep the folder organized.
