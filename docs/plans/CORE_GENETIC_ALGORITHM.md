# Core Genetic Algorithm & Data Model Plan

**Objective**: Use a genetic algorithm to compare items of the same type.
Each item type defines a list of common attributes; each item rates how
strongly each attribute is present (0–5). The GA uses these attribute
vectors as "genomes" to find similar items.

## Concept

Every item is represented as an **attribute vector** (the "genome"):

```
ItemType "music" attributes: [female_vocals, male_vocals, heavy_beats, violin, ...]

Item "Song A":  [5, 0, 4, 0, ...]   // heavy female vocals, no violin
Item "Song B":  [4, 1, 5, 0, ...]   // similar profile
```

Similarity between items is a function of the distance between their
attribute vectors. The **genetic algorithm** is used to evolve a set of
**attribute weights** so that "similar" matches the user's intent — see
`SIMILAR_ITEMS.md` for the two modes (fast distance default + deep GA match).

This plan covers the **core data model and the GA engine** itself; the
similarity UX is in `SIMILAR_ITEMS.md`.

## Data Model (TypeScript domain types)

```ts
/** A measurable property shared by all items of a type. */
interface Attribute {
  id: string;          // stable slug, e.g. "female_vocals"
  name: string;        // display name, e.g. "Female Vocals"
  description?: string;
}

/** A category of items (books, music, movies, wine, beer, ...). */
interface ItemType {
  id: string;          // uuid
  slug: string;        // url-safe, e.g. "music"
  name: string;        // "Music"
  description?: string;
  attributes: Attribute[];
  createdByUserId: string | null;  // null = seeded/builtin
  createdAt: string;
  updatedAt: string;
}

/** A single user's rating of one item's attributes. */
interface Rating {
  id: string;
  itemId: string;
  userId: string;      // anonymous users get a local pseudo-id
  values: Record<AttributeId, number>;  // 0..5
  createdAt: string;
  updatedAt: string;
}

/** An item belongs to exactly one ItemType. */
interface Item {
  id: string;
  typeId: string;
  name: string;
  description?: string;
  metadata?: Record<string, string>;  // artist, author, year, etc.
  averageRatings: Record<AttributeId, number>;  // cached mean across users
  ratingCount: number;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}
```

The `averageRatings` and `ratingCount` fields on `Item` are **cached
aggregates** kept in sync with the `Rating` rows (see
`TYPES_ITEMS_AND_RATINGS.md` for the recalculation strategy).

## Genetic Algorithm Engine

The GA lives in `src/lib/ga/` and is **pure, framework-agnostic TypeScript**
so it can be unit-tested in isolation with Vitest.

### Genome representation

- An item's genome = its attribute vector `g ∈ [0,5]^n`.
- A **weight vector** `w ∈ [0,1]^n` is the evolvable "DNA" of the GA. Weights
  express how important each attribute is for a given similarity query.

### Fitness function

For a target item `t` and a candidate `c`, with weights `w`:

```
distance(t, c, w) = sqrt( Σ_i w_i * (t_i - c_i)^2 )
fitness(c) = 1 / (1 + distance(t, c, w))
```

Higher fitness = more similar to the target under the current weights.

### GA loop

1. **Initialize** a population of weight vectors (random + seeded with
   uniform weights).
2. **Evaluate** fitness for each weight vector against the target vs. all
   candidates.
3. **Select** parents via tournament selection.
4. **Crossover** (uniform crossover of weight vectors).
5. **Mutate** (Gaussian perturbation on a random weight, clamped to [0,1]).
6. **Elitism** — carry forward the best `k` individuals unchanged.
7. Repeat for `N` generations or until fitness plateaus.
8. **Return** the best weight vector + the ranked candidate list.

### Tunable parameters

| Parameter | Default | Notes |
|-----------|---------|-------|
| `populationSize` | 50 | larger = more exploration, slower |
| `generations` | 40 | stop early on plateau |
| `mutationRate` | 0.1 | per-gene probability |
| `elitismCount` | 2 | preserved each generation |
| `tournamentSize` | 3 | selection pressure |

All exposed as options so the "deep match" mode and tests can dial them.

## File Layout

```
src/lib/ga/
├── types.ts            # Genome, WeightVector, GAOptions
├── distance.ts         # weighted distance + fitness
├── engine.ts           # the GA loop (pure functions)
├── similarity.ts       # high-level API: findSimilar(target, items, options)
└── index.ts            # public exports
```

## Tasks

1. Define domain types (`types.ts`) — shared with the data layer.
2. Implement weighted distance + fitness (`distance.ts`).
3. Implement the GA loop (`engine.ts`) with the tunable options above.
4. Implement `findSimilar()` high-level API (`similarity.ts`) that:
   - Fast mode: rank by weighted distance with uniform weights.
   - Deep mode: run the GA to evolve weights, then rank.
5. Seed a few builtin `ItemType`s (music, books, movies, wine, beer) with
   starter attributes for demo data.
6. Write Vitest unit tests for distance, fitness, GA convergence, and
   `findSimilar` (deterministic with seeded RNG).

## Testing Focus

- **Determinism**: seed the RNG so GA tests are reproducible.
- **Convergence**: assert the best fitness is non-decreasing across
  generations (elitism guarantees this).
- **Sanity**: an item compared to itself returns distance 0 / fitness 1.
- **Edge cases**: single attribute, all-zero vectors, single candidate.

## Open Questions

- Rating scale: **0–5** integers, or allow 0–5 with half-steps (0, 0.5, …, 5)?
  Recommend 0–5 integers for input simplicity; averages become floats.
- Should attributes be ordered (affecting weight initialization) or purely
  nominal? Recommend nominal.
