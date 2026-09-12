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

## Documentation

See `docs/plans/` for detailed implementation plans, including:
- `RECOMMENDED_BUILD_PATH.md` — the sequenced roadmap
- `BACKEND_DATABASE_RESEARCH.md` — DB backend comparison
- `DATA_ACCESS_LAYER.md` — swappable backend/ORM architecture
- `CORE_GENETIC_ALGORITHM.md` — the GA engine spec

## License

MIT
