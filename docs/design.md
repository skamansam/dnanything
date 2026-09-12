# DNAnything — Design Specification

> This document defines the visual design language for DNAnything. It is the
> single source of truth for colors, typography, spacing, layout, components,
> and page-level design decisions. All implementation should reference this
> doc.

---

## 1. Design Philosophy

### The concept

DNAnything looks like an **academic catalog** — a scholarly reference work
where every item is a specimen with a data sheet. Think JSTOR meets Discogs;
a well-organized discography with academic rigor. The visual language borrows
from both worlds:

- **From academic publishing**: structured sections, abstracts, metadata
  blocks, ruled tables, small caps, footnotes, generous margins, restrained
  color, numbered references.
- **From music catalogs (Discogs, RYM, AllMusic)**: dense data displays,
  rating scales, tag clouds, cross-referenced entries, item grids, cover
  art, community-contributed ratings, "see also" links.

The result is a site that feels authoritative and precise, but rich with
data — like browsing a well-curated museum catalog or a peer-reviewed
database of cultural artifacts.

### Tone

Scholarly but not stuffy. The DNA/genetics metaphor runs through the
language — genomes, helixes, base pairs, specimens, catalog numbers. The
UI should feel like a research tool that happens to be about music, books,
wine, and beer — not a tech dashboard, and not a casual social app.

### Key principles

1. **Content over chrome** — minimize visual noise; let data and typography
   carry the page.
2. **Rules, not boxes** — separate sections with horizontal rules (like
   academic tables), not heavy borders or card shadows.
3. **Restrained color** — off-white and charcoal with wine accents used
   sparingly for emphasis, never decoration.
4. **Dense but legible** — pack information tightly (catalog style) but
   maintain clear hierarchy through type scale and whitespace.
5. **Numbered and cross-referenced** — items have catalog numbers,
   sections are numbered, cross-references link between entries.

---

## 2. Brand Identity

### Name
**DNAnything** — a play on "DNA" + "Anything", reflecting the app's core idea:
any item can be encoded as a genome (attribute vector) and compared
genetically.

### Logo
The wordmark is **D · N · A · nything** where the **N** is rendered as a DNA
double helix. The helix-N is also the standalone square icon (favicon, app
icon).

- **Wordmark**: `D` + helix-N + `A` + `nything` (lighter weight)
- **Standalone icon**: the helix-N glyph only
- **Themeable**: uses `currentColor` / `var(--theme-primary)` so it recolors
  with the active theme
- **Sizes**: 16px (favicon), 24px (sidebar), 32px (header default), 48px+
  (landing hero)

See `docs/plans/BRANDING_AND_LOGO.md` for the full logo plan.

---

## 3. Color System

### Architecture

The color system has three layers:

1. **Twintrinsic base tokens** — the full 50–900 palette for primary,
   secondary, success, warning, error, info (defined in
   `twintrinsic/src/lib/twintrinsic.css`). These are the defaults.
2. **DNAnything theme overrides** — `src/app.css` overrides the primary,
   secondary, success, background, surface, text, and border tokens with
   CSS variables (`--theme-*`) that are swapped at runtime.
3. **Runtime theme switching** — `src/lib/theme.ts` defines named themes;
   `app.html` applies the stored theme before paint (no FOUC).

### Default Theme: Wine

A clean, light palette. Off-white backgrounds with wine-colored highlights —
deep burgundy reds evoking stained gels, aged wine, and refined lab
instruments. Not bright red — a mature, purple-undertoned burgundy. Color
is used sparingly, as accent only — the page is predominantly black text
on cream.

| Token | Value | Usage |
|-------|-------|-------|
| `--theme-primary` | `#9B2335` (rosewood) | Links, active states, logo helix, section numbers |
| `--theme-secondary` | `#e7e5e4` (stone-200) | App shell, sidebar background |
| `--theme-accent` | `#B73A4A` (lighter wine) | Hover/active highlights, focus rings |
| `--theme-bg` | `#faf8f5` (warm off-white) | Main content area — the "paper" |
| `--theme-border` | `#d6d3d1` (stone-300) | Rules, dividers, table lines |
| `--theme-text` | `#1c1917` (stone-900) | Body text, headings — the "ink" |

### Alternate Themes

| Name | Primary | Background | Vibe |
|------|---------|------------|------|
| Wine | `#9B2335` | `#faf8f5` | Default — lighter wine, readable, refined |
| Burgundy | `#A00030` | `#fff8f0` | Classic, bold, premium |
| Merlot | `#8B3A42` | `#f5f0eb` | Warm, vintage, muted |
| Oxblood | `#6B1414` | `#f0eeec` | Deep, earthy, industrial |

### Static Colors (theme-independent)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-warning-500` | `#f59e0b` | Warnings, unsynced data indicator |
| `--color-error-500` | `#ef4444` | Errors, delete actions |
| `--color-info-500` | `#3b82f6` | Info alerts, tooltips |

### Dark Mode: Charcoal + Wine

Twintrinsic's default dark mode uses dark blue (`#0f172a`) with purple
primary tones. DNAnything overrides both the neutrals and the primary
scale — warm charcoal background with wine/crimson highlights that are
brightened for readability against the dark surface.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `#1a1818` | App shell, sidebar (warm charcoal) |
| `--color-surface` | `#252323` | Main content area, panels |
| `--color-text` | `#e8e4e1` | Body text, headings |
| `--color-muted` | `#9a9390` | Secondary text, placeholders |
| `--color-border` | `#3a3635` | Borders, dividers |
| `--color-hover` | `#2a2727` | Hover backgrounds |
| `--color-focus-ring` | `var(--theme-accent)` | Focus rings (wine accent) |
| `--color-primary-500` | `#9b2335` | Primary actions (rosewood) |
| `--color-primary-600` | `#b73a4a` | Hover/active (lighter wine) |
| `--color-primary-700` | `#c85060` | Brighter accent for dark bg |

The wine primary scale is brightened in dark mode (`#8b3a47` instead of
`#722f37`) to maintain contrast against the charcoal background. The hue
stays in the same wine/crimson family — no purple, no blue.

### Color Usage Rules

- **Primary (wine)** is an accent color, not a fill. Use it for: links,
  active nav, section numbers, the logo helix, key data points. Never use
  it as a large background fill.
- **Background** is the "paper" — off-white, warm, never pure white. The
  content area should feel like aged journal paper.
- **Text** is the "ink" — dark, near-black, but never pure `#000`.
- **Rules and borders** are subtle — thin, low-contrast. Tables use
  horizontal rules only (top, bottom, header bottom), never full grids.
- **Contrast**: all text/background combinations must meet WCAG AA (4.5:1).
  The default Wine theme is designed for this.

---

## 4. Typography

### Font Stack

```
font-sans: "Crimson Pro", Georgia, "Times New Roman", serif
```

DNAnything uses **Crimson Pro**, a classic book serif from Bunny Fonts
(GDPR-friendly, no Google tracking). The serif typeface is the foundation
of the academic aesthetic — it reads like a well-typeset journal or
catalog rather than a tech dashboard. Crimson Pro's name also fits the wine
color palette. Loaded via Bunny Fonts CDN with weights 400–700
(roman + italic).

### Type Scale

| Element | Tailwind class | Size | Weight | Style | Usage |
|---------|----------------|------|--------|-------|-------|
| Catalog title | `text-4xl` | 36px | `font-bold` | small caps | Landing hero, site name |
| Page title | `text-2xl` | 24px | `font-semibold` | normal | Page headers (e.g. "Music") |
| Section heading | `text-xl` | 20px | `font-semibold` | normal | "1. Overview", "2. Ratings" |
| Subsection | `text-lg` | 18px | `font-medium` | italic | "2.1 Average Ratings" |
| Entry title | `text-lg` | 18px | `font-semibold` | normal | Item names in catalog entries |
| Body | `text-base` | 16px | `font-normal` | normal | Default text, descriptions |
| Body small | `text-sm` | 14px | `font-normal` | normal | Metadata, table cells |
| Caption | `text-xs` | 12px | `font-normal` | normal | Tags, catalog numbers, timestamps |
| Catalog number | `text-xs` | 12px | `font-normal` | tabular-nums | e.g. "DNA-MUS-0042" |

### Academic Typography Conventions

- **Section numbering**: Sections are numbered ("1. Overview", "2. Ratings",
  "3. Similar Items") like a paper. Subsections use dotted numbering
  ("2.1 Average Ratings", "2.2 Individual Ratings").
- **Small caps** for the site title and major section labels. Use
  `font-variant: small-caps` or `tracking-wider uppercase text-sm` for
  labels like "ABSTRACT", "METHOD", "CATALOG ENTRY".
- **Italic** for item titles within body text (like academic citations:
  "see *Dark Side of the Moon*").
- **Drop caps** optional for the opening paragraph of item descriptions —
  a large initial letter sets the catalog-entry tone.
- **Tabular figures** (`tabular-nums`) for all numeric data: ratings,
  scores, catalog numbers, counts.
- **Justified text** for long-form descriptions (item descriptions, type
  descriptions) to match the academic-paper look. Use
  `text-align: justify` with `hyphens: auto` for clean breaks.

### Typography Rules

- Headings use `font-bold` or `font-semibold`; body uses `font-normal`.
- The logo wordmark uses `font-bold` for "DNA" and `font-normal` for "nything"
  to create visual hierarchy within the wordmark itself.
- Long-form descriptions (item descriptions, type descriptions) use the
  same Crimson Pro serif — it's readable at paragraph length.
- Numbers in rating displays and similarity scores use `tabular-nums` for
  alignment in tables.
- Metadata labels use small caps: "ARTIST", "YEAR", "LABEL", "FORMAT".

---

## 5. Layout

### App Shell

Uses Twintrinsic's `App` component, but the visual treatment is academic:
thin rules instead of heavy borders, generous margins, the sidebar reads
like a table of contents.

- **Left sidebar**: navigation — styled like a table of contents with
  dotted leaders to page numbers (or just clean section links)
- **Right sidebar**: hidden by default; on item pages, can show
  "References" (cross-linked items) or "Cited by" (items that link here)
- **Header**: brand logo + minimal nav + theme toggle
- **Main content**: the "page" — scrollable, with generous margins like a
  printed page

```
┌─────────────────────────────────────────────────────┐
│ Header: [DNA logo]  Home Types About    [theme]    │
├──────────┬──────────────────────────────────────────┤
│ Contents │ Main content (the "page")                 │
│          │                                           │
│ 1. Browse│   ┌─────────────────────────────────┐    │
│   Music  │   │ Abstract / Summary               │    │
│   Books  │   │ ──────────────────────────────── │    │
│   Movies │   │ 1. Overview                      │    │
│   Wine   │   │ 2. Ratings                        │    │
│   Beer   │   │ 3. Similar Items                  │    │
│ 2. Create│   │   3.1 Fast Match                 │    │
│   Type   │   │   3.2 Deep Match                  │    │
│   Item   │   │ References                        │    │
│ 3. Account│  └─────────────────────────────────┘    │
│   Ratings│                                          │
│   Login  │                                           │
└──────────┴──────────────────────────────────────────┘
```

### Content Widths

Academic pages use generous margins. The content column should feel like a
printed page — not edge-to-edge.

| Page type | Max width | Notes |
|-----------|-----------|-------|
| Landing/hero | `max-w-4xl` (896px) | Centered, generous padding |
| Type browse (grid) | `max-w-6xl` (1152px) | Multi-column catalog grid |
| Item data page | `max-w-4xl` | Single-column "paper" layout |
| Similar items results | `max-w-6xl` | Wide table for data density |
| Create forms | `max-w-2xl` (672px) | Centered, focused forms |

### Spacing

Follows Tailwind's default spacing scale. Key patterns:

- Page padding: `p-8` (32px) on desktop — more generous than typical apps,
  matching academic page margins
- Section gaps: `gap-8` (32px) between major sections, separated by
  horizontal rules
- Table cell padding: `py-2 px-4` — compact but readable
- Form field gaps: `gap-4` between fields

### Responsive Breakpoints

Standard Tailwind breakpoints:

- `sm`: 640px — mobile landscape
- `md`: 768px — tablet (catalog grids go 2-col)
- `lg`: 1024px — desktop (sidebar visible, 3-col grids)
- `xl`: 1280px — wide desktop

The app is desktop-first (data-heavy catalog) but must be usable on tablet.
Mobile is a secondary target — the sidebar collapses to a menu, grids go
single-column, margins shrink.

---

## 6. Academic Catalog Conventions

These conventions define how items are presented — the core of the
"academic paper meets music catalog" aesthetic.

### Catalog Numbers

Every item gets a catalog number in the format `DNA-{TYPE}-{NUMBER}`:
- `DNA-MUS-0042` — Music item #42
- `DNA-BOK-0107` — Book item #107
- `DNA-WIN-0003` — Wine item #3

Catalog numbers are displayed in `tabular-nums`, `text-xs`, muted color,
and appear in the item header and in cross-references.

### Metadata Blocks

Item pages open with a structured metadata block (like a citation or
catalog card), displayed as a definition list with small-caps labels:

```
ARTIST      Pink Floyd
YEAR        1973
LABEL       Harvest Records
FORMAT      Vinyl LP, 42:50
CATALOG     DNA-MUS-0042
```

Labels use `text-xs uppercase tracking-wider` muted; values use
`text-sm font-normal`.

### Abstracts

Item and type pages begin with an "Abstract" — a short summary paragraph
in a distinct block (slightly indented or bordered with a left rule),
labeled "ABSTRACT" in small caps. This mirrors the structure of an
academic paper.

### Tables

Tables are the primary data display — ratings, similar items, item lists.
They follow academic table style:

- **Horizontal rules only**: top border, bottom border, and a rule under
  the header row. No vertical borders, no full grid.
- **Header row**: `font-semibold`, small caps or uppercase, `text-sm`
- **Body rows**: `text-sm`, `tabular-nums` for numeric columns
- **Row hover**: subtle background tint (`bg-stone-100` or equivalent),
  not a full color change
- **Zebra striping**: optional, very subtle — only for long tables (20+ rows)

### Cross-References

Items reference each other like academic citations:
- "See also: *Dark Side of the Moon* (DNA-MUS-0042)"
- "Cited by: 3 items" (expandable to show which items link here)
- "Related types: Progressive Rock, Psychedelic"

Cross-references use italic for item titles and wine color for links.

### Footnotes / Annotations

Optional annotations can appear as footnotes at the bottom of an item
page — short notes about the rating methodology, data sources, or
editorial decisions. Numbered superscript in the text, note body at the
bottom in `text-sm`, separated by a thin rule.

---

## 7. Component Usage

All UI uses Twintrinsic components. Below is the mapping of DNAnything
surfaces to Twintrinsic components and the design rules for each.

### Layout Components

| Component | Usage | Design notes |
|----------|-------|--------------|
| `App` | App shell | Right sidebar hidden; left sidebar for ToC-style nav |
| `AppHeader` | Top bar (via App) | Brand logo + site links + theme toggle |
| `Sidebar` | Left nav (via App) | Styled like a table of contents |
| `Panel` | Content sections | Use as "section blocks" with thin rules, not heavy cards |
| `Card` | Item/type cards in grids | Minimal styling — title, metadata, tags; hover shows rule |
| `Section` | Page sections | Vertical rhythm between numbered sections |
| `Separator` | Visual dividers | Horizontal rules between sections (academic style) |

### Data Display Components

| Component | Usage | Design notes |
|----------|-------|--------------|
| `Table` | Ratings list, similar items, item catalog | Horizontal rules only, no vertical borders |
| `Tag` / `TagGroup` | Attribute labels, genre tags | Small, muted — like keywords in a paper |
| `Badge` | Rating counts, catalog status | Small, inline, restrained |
| `MetricGrid` | Average ratings display | One metric per attribute, with label + value |
| `StatsCard` | Item summary stats | Rating count, avg score — like a data summary block |
| `Progress` | GA deep-match progress | Thin bar, wine-colored fill |
| `Skeleton` | Loading states | While fetching data |
| `Timeline` | Rating history (optional) | Per-user rating changes over time |

### Form Components

| Component | Usage | Design notes |
|----------|-------|--------------|
| `TextInput` | Name, slug, metadata fields | Standard inputs, thin borders |
| `Textarea` | Descriptions | For longer text — abstracts, notes |
| `Select` / `SelectGroup` | Type selection, attribute type | Dropdowns |
| `Slider` | Attribute rating input (0–5) | Primary rating UI — thin, wine-colored track |
| `Rating` | Alternative rating input (stars) | If slider feels too technical |
| `Switch` / `RadioGroup` | Fast/Deep match mode toggle | Mode selector |
| `Button` | Actions (create, save, find similar) | Primary (wine) for CTAs, secondary (outline) for cancel |
| `Fieldset` | Grouped form sections | Attribute editor groups |

### Feedback Components

| Component | Usage | Design notes |
|----------|-------|--------------|
| `Modal` | Login, upload prompt, confirm dialogs | Centered, backdrop dim |
| `Alert` | Errors, unsynced data warning | Inline, color-coded, thin border |
| `Toast` | Save confirmations, sync results | Transient, top-right |
| `Tooltip` | Attribute descriptions, score explanations | On hover/focus |

### Navigation Components

| Component | Usage | Design notes |
|----------|-------|--------------|
| `Breadcrumb` | Type > Item navigation | On item data pages |
| `Tabs` | Item data page sections (Overview, Ratings, Similar) | Tabbed content — or use numbered sections instead |
| `Stepper` | Create type flow (name → attributes → review) | Multi-step forms |

---

## 8. Page Designs

### Home / Landing (`/`)

**Goal**: Introduce the catalog, invite exploration. Reads like the front
matter of a journal.

```
┌──────────────────────────────────────────┐
│           [DNA logo, large]              │
│            DNAnything                     │
│   A genetic-algorithm catalog of          │
│   cultural artifacts.                     │
├──────────────────────────────────────────┤
│  ABSTRACT                                 │
│  ─────────────────────────────────────── │
│  DNAnything treats every item as a       │
│  genome — a vector of attribute ratings. │
│  The genetic algorithm evolves which     │
│  attributes matter most and surfaces     │
│  the closest matches.                     │
├──────────────────────────────────────────┤
│  1. Features                              │
│  ─────────────────────────────────────── │
│  [Feature]  [Feature]                     │
│  [Feature]  [Feature]                     │
├──────────────────────────────────────────┤
│  2. Catalog Types                         │
│  ─────────────────────────────────────── │
│  [Music] [Books] [Movies] [Wine] [Beer]  │
├──────────────────────────────────────────┤
│         [ Browse Catalog → ]              │
└──────────────────────────────────────────┘
```

- Hero section centered with large logo + tagline
- "ABSTRACT" block with summary (small-caps label, left rule or indent)
- Numbered sections (1. Features, 2. Catalog Types)
- Builtin types as clickable `Tag`s — like keywords
- Primary CTA at the bottom

### Type Browse (`/types` and `/types/[slug]`)

**Goal**: Show available types or items within a type — like a catalog
index.

**All Types view** (`/types`):
- Grid of minimal `Card`s, one per type
- Each card: type name (entry-title style), attribute count, item count,
  a few attribute `Tag`s as keywords
- "Create New Type" at the end of the grid (auth-gated)

**Single Type view** (`/types/[slug]`):
- Type header: name, description (as abstract), attribute list as `Tag`s
- Item table or grid: entries with name, metadata, average rating
- Multi-select checkboxes for "Find Similar" selection
- "Find Similar" button appears when 2+ items selected
- "Create New Item" button (auth-gated)

### Item Data Page (`/items/[id]`)

**Goal**: Show an item's full attribute profile and ratings — reads like
a catalog entry or data sheet.

```
┌──────────────────────────────────────────┐
│  Breadcrumb: Types > Music > Song Name    │
├──────────────────────────────────────────┤
│  Song Name                                │
│  DNA-MUS-0042                             │
├──────────────────────────────────────────┤
│  ARTIST      Pink Floyd                   │
│  YEAR        1973                         │
│  LABEL       Harvest Records              │
│  FORMAT      Vinyl LP, 42:50              │
├──────────────────────────────────────────┤
│  ABSTRACT                                 │
│  A concept album exploring themes of     │
│  time, conflict, and madness...           │
├──────────────────────────────────────────┤
│  1. Attribute Ratings                      │
│  ─────────────────────────────────────── │
│  1.1 Average Ratings                      │
│  [MetricGrid: female_vocals: 4.2, ...]   │
│  Rating count: 7                          │
│                                            │
│  1.2 Individual Ratings                   │
│  [Table: user columns, attribute rows]    │
├──────────────────────────────────────────┤
│  2. Similar Items                         │
│  ─────────────────────────────────────── │
│  [Mode toggle: Fast | Deep Match]         │
│  [Results table with similarity scores]  │
├──────────────────────────────────────────┤
│  References                               │
│  See also: *Wish You Were Here* (0043)   │
│  Cited by: 3 items                        │
└──────────────────────────────────────────┘
```

- **Metadata block**: definition list with small-caps labels at the top
- **Abstract**: short description in a distinct block
- **Numbered sections**: "1. Attribute Ratings", "2. Similar Items"
- **Subsections**: "1.1 Average Ratings", "1.2 Individual Ratings"
- **Ratings table**: academic table style (horizontal rules, tabular nums),
  average row at top, each user's ratings below, own rating highlighted
- **Similar items**: mode toggle, results table with scores and
  contributing-attribute tags
- **References**: cross-linked items at the bottom, like a bibliography

### Create Type (`/types/new`)

**Goal**: Authenticated users define a new item type.

- `Stepper`: Name & Slug → Attributes → Review
- Step 1: `TextInput` for name, auto-generates slug, `Textarea` for abstract
- Step 2: Attribute editor — add/remove `Attribute` rows, each with name +
  optional description; drag to reorder
- Step 3: Review summary, "Create Type" button
- Auth gate: if anonymous, show "Log in to create" `Alert` with login button

### Create Item (`/items/new`)

**Goal**: Authenticated users add an item to the catalog.

- `Select` for type (pre-selected if navigated from a type page)
- `TextInput` for name, `Textarea` for abstract/description
- Metadata key-value pairs (add/remove rows) — like filling in a catalog card
- Initial attribute ratings (optional `Slider` inputs)
- Auth gate same as Create Type

### Similar Items Results (`/similar` or inline panel)

**Goal**: Display GA-matched items — like a search results or reference list.

- Mode toggle: `RadioGroup` or `Switch` (Fast / Deep Match)
- **Fast mode**: instant results, ranked `Table` with scores
- **Deep mode**: `Progress` bar during GA run, then results
- Each result: item name (italic, linked), catalog number, similarity score,
  contributing attributes as `Tag`s (deep mode only)
- "Stop" button during deep match to accept current best
- Results are shareable via URL (encoded target + mode)

### Login Modal

- `Modal` with two options: GitHub OAuth button, email magic link
- Triggered from sidebar "Log In" or auth-gated action prompts
- After login: if local unsynced data exists, show upload prompt `Modal`

### Upload Prompt Modal

- `Modal` + `Alert` showing counts of local ratings/drafts
- "Upload to Cloud" (primary) / "Keep Local" (secondary) buttons
- On upload: `Toast` confirmation with counts

---

## 9. Iconography

Uses the **Material Design Icons (MDI)** iconset via Iconify, matching
`fo4-tools`:

```ts
setIconset('mdi');
```

### Key Icons

| Icon | MDI name | Usage |
|------|----------|-------|
| DNA helix | `mdi:dna` | Logo, GA feature, loading |
| Type/shape | `mdi:shape-outline` | Type cards, "any type" feature |
| Star/rating | `mdi:star-outline` | Ratings feature |
| Cloud sync | `mdi:cloud-sync-outline` | Local+cloud feature |
| Add/create | `mdi:plus` | Create buttons |
| Search/find | `mdi:magnify` | Find similar |
| Login | `mdi:login` | Auth actions |
| Logout | `mdi:logout` | Auth actions |
| User | `mdi:account-outline` | User menu |
| Warning | `mdi:alert-outline` | Unsynced data, errors |
| Chart | `mdi:chart-bar` | Average ratings display |

Icons are rendered via the `<iconify-icon>` web component (loaded in
`app.html`). Use `class="text-2xl text-primary-500"` for sizing/coloring.
Icons should be used sparingly — the academic aesthetic favors text and
typography over iconography.

---

## 10. Motion & Interaction

### Principles

- **Subtle**: motion supports content, doesn't distract
- **Fast**: transitions 150–200ms; no slow animations
- **Meaningful**: motion indicates state change (loading, saving, matching)

### Specifics

| Element | Motion | Duration |
|---------|--------|----------|
| Card hover | subtle background tint (no lift) | 150ms |
| Button hover | background color change to accent | 150ms |
| Modal open | fade + scale in | 200ms |
| Toast | slide in from top-right | 200ms |
| GA progress | progress bar fills per generation | linear |
| Skeleton → content | fade in | 200ms |
| Theme switch | instant (no transition — avoid jarring color sweeps) | 0ms |
| Section expand/collapse | height transition | 200ms |

### Reduced Motion

Respect `prefers-reduced-motion`: disable all non-essential animations.
The GA progress bar and skeleton-to-content fade are essential (they
communicate loading state); card hovers and modal transitions are not.

---

## 11. Accessibility

### Requirements

- **WCAG 2.1 AA** minimum across all pages
- **Semantic HTML** first — use native elements, add ARIA only when needed
- **Keyboard navigation**: all interactive elements reachable via Tab;
  custom widgets (mode toggle, attribute editor) follow WAI-ARIA APG
- **Focus indicators**: visible focus rings using `--theme-accent`; never
  remove outline without replacement
- **Color contrast**: 4.5:1 for text, 3:1 for large text and UI components
- **Screen reader**: logo has `aria-label` when used as link; data tables
  have proper `<th>` scope; form inputs have associated `<label>`s

### Specific Patterns

- Rating sliders: `aria-label` per attribute ("Rate Female Vocals, 0 to 5"),
  `aria-valuenow`/`aria-valuemin`/`aria-valuemax`
- Similar items table: `aria-label="Similar items ranked by score"`,
  score column header "Similarity Score"
- GA progress: `aria-label="Genetic algorithm progress"`,
  `aria-valuenow` = current generation
- Mode toggle: `role="radiogroup"` with `aria-label="Similarity mode"`

---

## 12. Empty & Error States

### Empty States

| Scenario | Design |
|----------|--------|
| No types exist yet | "The catalog is empty." + "Create your first type" CTA |
| Type has no items | "No entries in this section." + "Add the first item" button |
| Item has no ratings | "No ratings recorded. Be the first to rate this entry." |
| No similar items found | "No matches found." + suggestion to try deep mode |
| Search returns nothing | "No results for '{query}'." |

### Error States

| Scenario | Design |
|----------|--------|
| Failed to load data | `Alert` (error variant) + retry button |
| Failed to save rating | `Toast` (error) + inline message |
| Auth required for action | `Alert` (warning) + "Log in" button |
| Upload failed | `Modal` with error + retry/cancel |
| GA fails | `Alert` + "Try fast mode instead" suggestion |

---

## 13. Theme Switching

### Mechanism

- Theme stored in `localStorage` under `dnanything-theme`
- Applied before paint via inline script in `app.html` (prevents FOUC)
- `+layout.svelte` reads stored theme on mount and applies CSS variables
- Theme toggle in header (Twintrinsic `ThemeToggle` component)

### Theme Application

CSS variables set on `:root`:
```css
--theme-primary, --theme-secondary, --theme-accent,
--theme-bg, --theme-border, --theme-text
```

These flow into the `@theme` block in `app.css` which generates Tailwind
utilities (`bg-primary-500`, `text-text`, etc.).

### Design Rule

All colors must reference theme variables, never hardcoded hex values
(except static warning/error/info colors). This ensures every surface
recolors correctly when the theme switches.
