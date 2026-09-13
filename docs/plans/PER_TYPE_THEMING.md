# Plan: Per-Type Theming

## Summary

Allow each item type to define custom visual theming that applies to all pages
related to that type — type browse pages, item detail pages, attribute pages,
and similar items pages. Theming includes a header banner image and custom CSS
that can be scoped to the type or to individual subcategories.

## Motivation

The catalog currently uses a single global theme (off-white paper, wine
accents, Crimson Pro serif). While this consistency is valuable, it means every
type looks identical. A wine type should feel different from a books type, and
a red wine subcategory should feel different from a white wine subcategory.

Per-type theming lets the community customize the visual identity of each type
without touching the global theme. A music type could use a darker, more
vibrant palette; a wine type could use vineyard photography; a books type
could use a parchment texture. Subcategory-level CSS allows finer control —
red wines might use deep burgundy accents while white wines use pale gold.

## Scope

### In Scope

- **Header banner images** per type, uploaded by type creators/moderators.
- **Custom CSS** per type, applied to all pages within that type's namespace.
- **Custom CSS** per subcategory, applied when a subcategory filter is active.
- **Image storage** via Supabase Storage (or localStorage for anonymous users).
- **CSS sanitization** to prevent XSS and layout breakage.
- **Fallback** to the global theme when no custom theme is defined.

### Out of Scope

- Full theme editor UI (future enhancement — initially CSS is entered as text).
- Per-item theming (too granular; type and subcategory levels are sufficient).
- Custom fonts per type (could be added later via the same mechanism).
- Custom JavaScript per type (security risk; not planned).

## Data Model

### Database Changes

Add columns to `item_types`:

```sql
ALTER TABLE item_types
  ADD COLUMN header_image_url text,
  ADD COLUMN custom_css text,
  ADD COLUMN subcategory_css jsonb DEFAULT '{}';
```

- `header_image_url` — URL of the uploaded banner image (stored in Supabase
  Storage or as a data URL in localStorage).
- `custom_css` — raw CSS string, scoped to the type at render time.
- `subcategory_css` — JSON object mapping subcategory id → CSS string.

### Domain Types

```typescript
// In src/lib/types.ts — extend ItemType:

interface ItemType {
  // ... existing fields ...
  /** URL of the header banner image, if one is set. */
  headerImageUrl?: string;
  /** Custom CSS for this type, scoped at render time. */
  customCss?: string;
  /** Per-subcategory CSS: { subcategoryId: cssString }. */
  subcategoryCss?: Record<string, string>;
}
```

### Storage

- **Authenticated users**: Images uploaded to Supabase Storage bucket
  `type-headers`. The bucket is public-read, write-restricted to authenticated
  users. URLs are stored in `item_types.header_image_url`.
- **Anonymous users**: Images stored as base64 data URLs in localStorage
  (size-limited to ~500KB). Uploaded to Storage on login.

## CSS Scoping

Custom CSS must be scoped so it only affects pages within the type's
namespace. Two approaches:

### Approach 1: CSS Class Scoping (Recommended)

Wrap all type-related page content in a container with a type-specific class:

```html
<div class="type-theme type-{slug}">
  <!-- page content -->
</div>
```

The custom CSS is then injected inside a `<style>` tag, and authors write
their CSS relative to `.type-{slug}`:

```css
/* Author writes: */
.type-music .entry-title {
  font-style: italic;
  color: #6b21a8;
}

/* System scopes it to: */
.type-theme.type-music .entry-title {
  font-style: italic;
  color: #6b21a8;
}
```

Scoping is done at injection time by prefixing every selector with
`.type-theme.type-{slug}`. This is simpler than Shadow DOM and allows
inheritance from the global theme.

### Approach 2: Shadow DOM (Future)

For stronger isolation, each type's page content could be rendered inside a
Shadow DOM, with the custom CSS injected as the shadow root's stylesheet.
This prevents global CSS from leaking in and type CSS from leaking out, but
makes theming harder (authors can't reference global CSS variables without
explicit `@import`).

**Decision**: Start with Approach 1 (class scoping). Consider Shadow DOM if
isolation issues arise.

## CSS Sanitization

Custom CSS is user-generated content and must be sanitized before injection:

1. **Remove `@import`** — prevents loading external stylesheets.
2. **Remove `url()` with external URLs** — prevents loading external resources
   (except for `url(#...)` SVG references). Data URLs are allowed for
   background images.
3. **Remove `expression()`** — IE-specific, but strip for safety.
4. **Remove `javascript:` URLs** — any `url(javascript:...)` is stripped.
5. **Remove `position: fixed`** — prevents overlay attacks.
6. **Scope all selectors** — prefix with `.type-theme.type-{slug}` (or the
   subcategory variant).

Sanitization happens server-side before storage and client-side before
injection (defense in depth).

Implementation: a small sanitization function in `src/lib/theme/sanitize-css.ts`,
tested with Vitest.

## Header Banner Image

### Rendering

On type-related pages (`/types/[slug]`, `/items/[id]`, `/attributes/[id]`,
`/similar`), if the resolved type has a `headerImageUrl`:

1. Render a banner `<div>` at the top of the page content (below the
   breadcrumb, above the page header).
2. The banner uses `background-image: url(...)` with `background-size: cover`
   and a fixed height (e.g., 200px).
3. A semi-transparent overlay ensures text readability if the banner is used
   as a backdrop for the page title.
4. If no `headerImageUrl` is set, no banner is rendered (current behavior).

### Upload UI

On the type edit page (future), a file input allows uploading a header image:

- Accepted formats: JPEG, PNG, WebP.
- Max file size: 2MB (server-side), 500KB (localStorage for anonymous).
- Recommended dimensions: 1200×200px (banner aspect ratio).
- The image is uploaded to Supabase Storage (or stored as a data URL locally),
  and the URL is saved to `item_types.header_image_url`.

### Fallback

If the image URL is broken or the file is missing, the banner silently
collapses (no broken image icon). The page renders normally without it.

## Subcategory CSS

When a subcategory filter is active on the type page, the corresponding CSS
from `subcategoryCss[subcategoryId]` is injected in addition to the type-level
CSS. Both are scoped:

```html
<div class="type-theme type-wine subcategory-red">
  <!-- page content -->
</div>
```

```css
/* Type-level CSS (scoped to .type-wine) */
.type-theme.type-wine .entry-title { color: #722f37; }

/* Subcategory CSS (scoped to .type-wine.subcategory-red) */
.type-theme.type-wine.subcategory-red .entry-title { color: #5c1a1a; }
```

This allows subcategory-specific overrides without duplicating the full
type CSS.

## Pages Affected

| Page | Type Resolved From | Banner | CSS Scope |
|------|--------------------|--------|-----------|
| `/types/[slug]` | URL param | Yes | `.type-{slug}` |
| `/items/[id]` | Item's `typeId` | Yes | `.type-{slug}` |
| `/attributes/[id]` | Attribute's type | Yes | `.type-{slug}` |
| `/similar?items=...` | First selected item's type | Yes | `.type-{slug}` |
| `/types` (grid) | N/A (all types) | No | No |

## Implementation Phases

### Phase 1: Data Model + Storage

- Add `headerImageUrl`, `customCss`, `subcategoryCss` to `ItemType` domain type.
- Add columns to `item_types` table schema.
- Update repository `createType`/`updateType`/`toItemType` to handle new fields.
- Set up Supabase Storage bucket `type-headers`.
- Add seed data with sample header images and CSS for one or two types.

### Phase 2: CSS Sanitization + Injection

- Implement `sanitizeCss(css, scopeClass)` in `src/lib/theme/sanitize-css.ts`.
- Write Vitest tests for the sanitizer (XSS vectors, selector scoping, etc.).
- Create a `TypeTheme.svelte` component that:
  - Wraps page content in `.type-theme.type-{slug}`.
  - Injects sanitized `<style>` tag for type-level CSS.
  - Injects sanitized `<style>` tag for active subcategory CSS.
  - Renders the header banner image if present.
- Integrate `TypeTheme` into the four affected pages.

### Phase 3: Header Banner Upload UI

- Add file upload to the type edit page (future, once type editing exists).
- Client-side image validation (format, size, dimensions).
- Upload to Supabase Storage or store as data URL in localStorage.
- Save URL to `item_types.header_image_url`.

### Phase 4: CSS Editor UI

- Add a CSS textarea to the type edit page.
- Live preview of the CSS against a sample item card.
- Syntax highlighting (optional, via CodeMirror or similar).
- Validation feedback (sanitization warnings shown to the user before save).

### Phase 5: Subcategory CSS

- Add per-subcategory CSS textareas to the type edit page.
- Inject subcategory CSS when the subcategory filter is active on the type
  page.
- Test that subcategory CSS overrides type CSS correctly.

## Security Considerations

- **XSS**: CSS sanitization prevents `javascript:` URLs, `expression()`,
  and external `@import`. All CSS is scoped to a type-specific class.
- **Layout breakage**: `position: fixed` is stripped. Scoping prevents CSS
  from affecting the global layout, header, or footer.
- **Data exfiltration**: External `url()` references are stripped. Data URLs
  are allowed (for background images stored locally).
- **Storage abuse**: Image uploads are size-limited and format-restricted.
  CSS is size-limited (e.g., 10KB max).
- **Change log**: All theme changes (header image, CSS) are logged in the
  change log with the user and timestamp, like all other entity changes.

## Testing

- **Unit**: `sanitizeCss` function — test with XSS vectors, external URLs,
  selector scoping, and valid CSS.
- **Unit**: `TypeTheme` component — test that it renders the banner, injects
  scoped CSS, and falls back gracefully when no theme is set.
- **E2E**: Navigate to a type page with a custom theme and verify the banner
  renders and the CSS is applied. Navigate to a type without a theme and
  verify the fallback.
- **E2E**: Verify that type CSS does not leak to other types or to the global
  layout.

## Open Questions

1. **Image hosting for anonymous users**: Data URLs in localStorage work but
   are size-limited. Should anonymous users be unable to set header images
   until they log in? **Recommendation**: Yes — header images require auth.
2. **CSS size limit**: 10KB should be plenty for type-level theming. Should we
   allow more? **Recommendation**: Start with 10KB, increase if needed.
3. **Community moderation**: If a user uploads an inappropriate header image
   or CSS, how is it flagged and removed? **Recommendation**: Add a report
   button on type pages; moderators can revert to the default theme.
4. **Caching**: Header images and CSS should be cached aggressively. Use
   Supabase Storage's CDN for images and cache the CSS in memory on the
   client.
