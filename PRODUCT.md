# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Enthusiast communities — people who rate, catalog, and compare cultural
artifacts (music, books, movies, wine, beer) the way Discogs/RYM
communities do. They browse and read freely; contributing (types, items,
ratings, reviews, recommendations, flags, similarity search) requires a
free account.

## Product Purpose

DNAnything is a community catalog where any kind of item can be encoded as
a "genome" — a vector of attribute ratings on a 0–5 scale — and compared
genetically. Users define item types with their own attribute sets, rate
items, write reviews, and find similar items. Success means a living,
accurate, community-maintained catalog where similarity search surfaces
genuinely useful matches.

## Positioning

A combination no neighbor product truthfully offers together:

- **GA-evolved matching** — a "Deep Match" genetic algorithm evolves
  attribute weightings to surface non-obvious similarity, alongside a
  deterministic Fast Match distance mode.
- **Rate-anything flexibility** — one data model covers any domain; users
  create the types and attributes, not the platform.
- **Catalog rigor** — wiki-style provenance on every entity, no hard
  deletes, reversible flag-based moderation, anonymization instead of
  data loss when users leave.

## Operating Context

Public hosted community: SvelteKit on Vercel, Supabase (Postgres + Auth)
backend. Anonymous users are read-only. Deferred but planned: local
Docker self-hosting and private local (browser-stored) contributions that
merge with public data on the client.

## Capabilities and Constraints

- User-defined item types with custom attribute sets; attributes rated 0–5.
- Community average ratings with rating-count-weighted consensus.
- Two similarity modes: Fast Match (weighted distance) and Deep Match (GA).
- Reviews, recommendations, contributor pages, wiki-style change log.
- Auth: Supabase Auth (GitHub OAuth + email magic link). All public
  contributions require auth; anonymous browsing stays free.
- Moderation: flag-based; flagged content hidden pending review; nothing
  hard-deleted. Account removal anonymizes contributions ("Anonymous
  User") rather than deleting them.
- Undecided/deferred: local contributions merge, local Docker deployment,
  per-type theming.

## Brand Commitments

- Name: **DNAnything** ("DNA" + "Anything").
- Wordmark: `D` + helix-N + `A` + `nything`; the helix-N doubles as the
  standalone icon. See `docs/plans/BRANDING_AND_LOGO.md`.
- The DNA/genetics metaphor is part of the product vocabulary: genomes,
  helixes, base pairs, specimens, catalog numbers.
- Voice: scholarly catalog, authoritative but not stuffy — a research
  tool about culture, not a tech dashboard or casual social app.
- Incumbent visual system: `docs/design.md` (academic-catalog identity,
  wine/burgundy palette) is the design authority.

## Evidence on Hand

- Seed data as JSON in `src/lib/data` — types, items, users, ratings,
  reviews, recommendations matching the DB schema.
- `docs/design.md` — full design specification.
- `docs/plans/` — feature plans and the sequenced roadmap.
- No testimonials, metrics, or external proof exist; do not fabricate any.

## Product Principles

1. **One model for anything** — user-defined types and attributes, never
   a fixed domain taxonomy.
2. **Accountability for contributions** — public writes require identity;
   browsing never does.
3. **Provenance over deletion** — history is preserved; moderation is
   reversible; leaving users are anonymized, not erased.
4. **Algorithmic depth** — similarity is a real GA, not a tag count;
   both instant and exploratory answers are first-class.
5. **Community-owned data** — contributions outlive their authors and
   belong to the catalog.
