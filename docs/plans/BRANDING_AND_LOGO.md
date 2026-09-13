# Branding & Logo Plan

**Objective**: Name the app "DNAnything" and create a logo system where the
letters **DNA** form the core mark, with the **A** rendered as a double
helix (the favicon glyph).

## Logo System

The logo has three variants, all sharing the same helix-A glyph:

| Variant | Usage | Content |
|---------|-------|---------|
| **long** | App header, README, OG preview | D · N · helix-A · "nything" |
| **short** | Compact spaces, mobile header, PWA | D · N · helix-A |
| **icon** | Favicon, app icon, loading states, about page | Just the helix-A glyph |

### The Helix-A

The **A** in all variants is a double-helix glyph — two sinusoidal strands
that form the legs of an `A`, with base-pair rungs as the crossbar. This is
the same SVG path used in `static/favicon.svg`, so the favicon, app icon,
and logo all share the identical mark.

The glyph is authored as inline SVG using `fill="currentColor"` so it
inherits the theme color automatically.

## Deliverables

- [x] `static/favicon.svg` — the helix-A glyph (32×32 viewBox)
- [x] `static/manifest.json` — PWA manifest with `short_name: "DNA"`
- [x] `src/lib/components/DnaAnythingLogo.svelte` — Svelte 5 component
      with `variant` prop (`short` | `long` | `icon`), `size` prop, and
      `currentColor` theming
- [ ] `static/logo.svg` — standalone long-form wordmark (for README/OG)
- [ ] `static/og.png` — OG/social preview image (1200×630)
- [ ] README badge/header using the logo

## Implementation Notes

- **SVG-first**: the helix-A path is identical to `static/favicon.svg`,
  ensuring visual consistency across all touchpoints.
- **Twintrinsic integration**: the `App` component accepts a `brand.logo`
  snippet. The layout passes a snippet that renders
  `<DnaAnythingLogo variant="long" />` so the full wordmark appears in the
  app header.
- **Theme variables**: the helix-A uses `fill="currentColor"` so it
  recolors with the active theme (wine, burgundy, merlot, oxblood).
- **Accessibility**: the logo component exposes an `aria-label`
  ("DNAnything home") when used as a link, and a decorative `aria-hidden`
  mode when used purely as a mark.
- **PWA manifest**: `short_name` is "DNA" (shown on mobile home screens),
  `name` is "DNAnything" (shown in app install prompts).

## Component API

```svelte
<DnaAnythingLogo size={32} variant="long" />   <!-- DNAnything -->
<DnaAnythingLogo size={32} variant="short" />  <!-- DNA -->
<DnaAnythingLogo size={32} variant="icon" />  <!-- helix-A only -->
```

Props:
- `size` (number, default 32) — height in pixels
- `variant` ('short' | 'long' | 'icon', default 'long')
- `ariaLabel` (string, optional) — for navigable links
- `class` (string, optional) — extra classes

## Tasks

- [x] Build `DnaAnythingLogo.svelte` with three variants.
- [x] Use the favicon SVG path for the helix-A in all variants.
- [x] Wire into `App` brand snippet (long-form in header).
- [x] Update PWA manifest `short_name` to "DNA".
- [ ] Export standalone `logo.svg` for README/OG use.
- [ ] Create OG preview image.
- [ ] Add a Vitest unit test asserting the logo renders all three variants
  and respects `size`.
