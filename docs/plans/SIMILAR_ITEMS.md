# Similar Items Plan

**Objective**: Users can look at similar items for **one item**, or similar
items for a **selection of items**. Both modes are supported: a fast
distance-based default and a "deep match" GA mode that evolves attribute
weights.

## Two Modes (confirmed)

1. **Fast mode (default)** — rank candidates by weighted distance to the
   target using **uniform weights**. O(n) per query, instant. Good for the
   common "show me things like this" case.
2. **Deep match mode** — run the genetic algorithm to **evolve a weight
   vector** that best separates the target(s) from the rest, then rank by
   that weighted distance. Slower but surfaces non-obvious matches; the
   evolved weights are shown to the user as "what mattered most".

## Single-Item Similarity

Given a target item `t` and the candidate set (all other items in the same
`ItemType`):

- **Fast**: `findSimilar(t, candidates, { mode: 'fast' })` → ranked list
  with similarity score (1 / (1 + distance)).
- **Deep**: `findSimilar(t, candidates, { mode: 'ga', gaOptions })` → runs
  the GA, returns the ranked list **plus** the evolved weight vector so the
  UI can show "matched heavily on: female vocals, heavy beats".

## Multi-Item (Selection) Similarity

Given a selection `S = {t1, t2, …, tk}`:

- Compute a **target profile** = the element-wise mean of the selected
  items' attribute vectors: `p = (1/k) Σ ti`.
- Run similarity against `p` instead of a single item.
- **Deep mode** evolves weights that best match the *cluster* — fitness
  favors candidates close to `p` and penalizes candidates close to items
  *outside* the selection (negative sampling) so the GA learns what makes
  the selection coherent.

UX: a "Compare" action on a multi-select list/grid launches the selection
similarity view.

## UI

- **Item data page**: a "Similar items" panel using Twintrinsic `Table` or
  `Card` grid, with a mode toggle (`Switch` or `RadioGroup`: Fast / Deep
  Match). Each result shows the item name, similarity %, and (deep mode) the
  top contributing attributes as `Tag`s.
- **Selection flow**: a multi-select on the type browse page → "Find
  similar" button → results page.
- **Deep match progress**: the GA runs client-side; show a Twintrinsic
  `Progress` bar bound to the generation count, and a "Stop" button to
  accept the current best weights.

## Performance

- Candidate sets are bounded by the number of items in a type (expected
  hundreds, not millions) → GA runs client-side in a Web Worker to keep the
  UI responsive.
- `src/lib/ga/worker.ts` — wraps the engine in a `Worker`; posts progress
  each generation and the final ranked list.
- Cache the last result per (target id(s), mode) in a small LRU so repeated
  toggles don't recompute.

## Tasks

1. Extend `findSimilar()` (from `CORE_GENETIC_ALGORITHM.md`) with selection
   support: accept `target: Item | Item[]`.
2. Implement target-profile aggregation (mean vector) for selections.
3. Implement negative-sampling fitness for deep-match-on-selection.
4. Wrap the GA in a Web Worker with progress messages.
5. Build the "Similar items" panel on the item data page (mode toggle +
   results + contributing-attribute tags).
6. Build the selection → "Find similar" flow on the type browse page.
7. Add a small LRU result cache.
8. Vitest: selection aggregation, negative-sampling fitness, worker message
   contract (mocked). Playwright: single-item similar panel renders,
   deep-match progress completes.

## Open Questions

- How many items can a user select for multi-item similarity? Recommend a
  soft cap (e.g. 10) for performance and meaningful aggregation.
- Should deep-match results be shareable via URL (encoded target ids + mode)?
  Recommend yes — deep links are cheap and useful.
