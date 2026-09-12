# Branding & Logo Plan

**Objective**: Name the app "DNAnything" and create a cool logo where the
letters **DNA** are depicted with one of the letters rendered as a double
helix.

## Goals

- A recognizable wordmark "DNAnything" usable in the App header, favicon,
  OG/social preview, and the README.
- A standalone square icon (the DNA double-helix glyph) for favicon, app
  icon, and loading states.
- Themable: the logo must respect the app theme color (CSS variables), like
  Twintrinsic's `TwintrinsicLogo` component does, so it works on any theme.

## Design Direction

The wordmark is **D · N · A** + "nything", where the middle **N** (or the
**A**) is drawn as a vertical double helix that reads as the letter at a
glance. Two concepts to prototype:

1. **Helix-as-N**: Two sinusoidal strands cross twice to form the diagonal
   strokes of an `N`, with rung pairs as the connecting base pairs. Reads
   as "D-N-A" at small sizes.
2. **Helix-as-A**: The double helix forms the legs of an `A` with a base-pair
   rung as the crossbar. Slightly less literal but visually distinctive.

Recommendation: prototype both as SVG and pick the one that stays legible at
16×16 (favicon size). The helix letter becomes the standalone square icon.

## Deliverables

- [ ] `static/logo.svg` — full wordmark (D-helix-A + "nything")
- [ ] `static/favicon.svg` — square helix glyph only
- [ ] `static/manifest.json` — PWA manifest referencing icon variants
- [ ] `src/lib/components/DnaAnythingLogo.svelte` — Svelte 5 component
      wrapping the SVG, accepting a `size` prop and inheriting `currentColor`
      / theme CSS variables so it themes correctly
- [ ] OG/social preview image (`static/og.png`, 1200×630) — export of the
      wordmark on a themed background
- [ ] README badge/header using the logo

## Implementation Notes

- **SVG-first**: author the logo as inline SVG so it scales crisply and can
  be themed via `fill="currentColor"` / CSS variables. No raster assets
  except the OG preview.
- **Twintrinsic integration**: the `App` component accepts a `brand.logo`
  snippet (see `fo4-tools/src/routes/+layout.svelte`). Pass a snippet that
  renders `DnaAnythingLogo` so it appears in the app header.
- **Theme variables**: use `var(--theme-primary)` / `var(--theme-accent)`
  for the helix strands so the logo recolors with the active theme, matching
  the pattern in `fo4-tools/src/app.css`.
- **Accessibility**: the logo component should expose an `aria-label`
  ("DNAnything home") when used as a link, and a decorative `aria-hidden`
  mode when used purely as a mark.

## Tasks

1. Sketch the two helix-letter concepts (SVG).
2. Pick the legible-at-16px winner; refine the wordmark.
3. Build `DnaAnythingLogo.svelte` (Svelte 5 runes, `size` prop, theme-aware).
4. Export favicon variants + OG preview.
5. Wire into `App` brand snippet and `app.html` `<title>`/favicon.
6. Add a Vitest unit test asserting the logo renders and respects `size`.

## Open Questions

- Which letter should be the helix — **N** or **A**? (Prototype both first.)
- Brand color palette beyond the theme — any preferred accent for the helix
  strands, or always follow the active theme?
