# DNAnything

Compare anything using a genetic algorithm. Rate attributes, find similar items, discover new favorites.

## Overview

DNAnything treats every item as a genome — a vector of attribute ratings. Use the genetic algorithm to find items with similar attribute profiles across any category (books, music, movies, wine, beer, or your own custom types).

## Tech Stack

- **Framework**: Svelte 5 + SvelteKit
- **Styling**: Tailwind CSS 4 + [Twintrinsic](https://github.com/samansam/twintrinsic) component library
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **ORM**: Drizzle ORM (centralized in `src/lib/db/`, swappable)
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Language**: TypeScript

## Getting Started

```bash
pnpm install
pnpm dev
```

The dev server starts at `http://localhost:5173`.

## Project Structure

```
dnanything/
├── docs/plans/              # Implementation plan documents
├── src/
│   ├── lib/
│   │   ├── components/      # Svelte components (DnaAnythingLogo, etc.)
│   │   ├── ga/              # Genetic algorithm engine (pure TS)
│   │   ├── db/              # Data access layer (repository pattern)
│   │   ├── types.ts         # Domain types
│   │   └── theme.ts         # Theme definitions
│   ├── routes/              # SvelteKit routes
│   ├── app.css              # Tailwind + Twintrinsic theme
│   └── app.html             # HTML shell
├── static/                  # Static assets (favicon, manifest)
├── package.json
└── vite.config.ts           # Twintrinsic local alias
```

## Design Quality

This project uses [impeccable](https://impeccable.style) to catch UI
anti-patterns and design-quality issues. Scan locally with:

```bash
npx impeccable detect src/
```

CI runs the same scan on UI files changed in each PR and fails on
findings (`.github/workflows/impeccable.yml`). Waive a false positive
where it lives with an inline `impeccable-disable` comment, or manage
repo-wide ignores with `npx impeccable ignores` (stored in
`.impeccable/config.json`). Agent skills live in the user-level install:
`npx impeccable install --user`.

## AI Policy

AI is a tool, nothing more. Every human associated with a PR holds the
responsibility for the code it contains — if it is bad code, or does not
conform to the ideas set forth in this project, it will be rejected.

I, Samuel "Skaman Sam" C Tyler, am the project lead. I have decades of PR
reviews under my belt and can be fairly strict with submitted code. To
that end, CI runs checks that catch overly generated code (see
[Design Quality](#design-quality)) — your PRs must pass those checks in
order to be merged.

## Documentation

See `docs/plans/` for detailed implementation plans, including:
- `RECOMMENDED_BUILD_PATH.md` — the sequenced roadmap
- `BACKEND_DATABASE_RESEARCH.md` — DB backend comparison
- `DATA_ACCESS_LAYER.md` — swappable backend/ORM architecture
- `CORE_GENETIC_ALGORITHM.md` — the GA engine spec

## License

MIT
