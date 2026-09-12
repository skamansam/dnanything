# Twintrinsic UI Integration Plan

**Objective**: Build the DNAnything UI using the Twintrinsic component
library (local Svelte 5 library at `/home/sam/workspace-other/twintrinsic`),
wired in for local development the same way `fo4-tools` does it.

## How fo4-tools Wires Twintrinsic (reference)

`fo4-tools` is the canonical example of consuming Twintrinsic locally:

- **`vite.config.ts`** — resolves the `twintrinsic` import to the local
  source via an alias, and lets the dev server FS access the sibling dir:
  ```ts
  resolve: { alias: { twintrinsic: path.resolve(dirname, "../twintrinsic/src/lib") } },
  server: { fs: { allow: [path.resolve(dirname, "..")] } },
  ```
- **`src/app.css`** — imports Tailwind + Twintrinsic's theme CSS, and adds
  `@source` directives so Tailwind scans both the app's and Twintrinsic's
  `.svelte` files for class usage:
  ```css
  @import "tailwindcss";
  @import "../../twintrinsic/src/lib/twintrinsic.css";
  @source "../../twintrinsic/src/lib/components/**/*.svelte";
  @source "./routes/**/*.svelte";
  ```
- **`src/routes/+layout.svelte`** — imports from `twintrinsic` directly
  (`App`, `TwintrinsicLogo`, `setIconset`, `MenuItem`) and renders the
  `App` shell with a `brand` logo snippet, `siteMenu`, and `siteLinks`.
- **`src/app.html`** — loads the Iconify runtime script and applies theme
  variables before paint to avoid FOUC.

DNAnything will replicate this exact wiring.

## DNAnything Wiring

### `vite.config.ts`
```ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const dirname = typeof __dirname !== "undefined"
  ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: { alias: { twintrinsic: path.resolve(dirname, "../twintrinsic/src/lib") } },
  server: { fs: { allow: [path.resolve(dirname, "..")] } },
  plugins: [sveltekit(), tailwindcss()],
});
```

### `src/app.css`
Import Tailwind + Twintrinsic theme; define DNAnything's theme tokens
(DNA-themed palette — e.g. a double-helix green/teal primary) via `@theme`,
mirroring the `fo4-tools` pattern but with DNAnything's identity.

### `src/routes/+layout.svelte`
Use Twintrinsic `App` shell with:
- `brand` → `DnaAnythingLogo` snippet (from `BRANDING_AND_LOGO.md`)
- `siteMenu` → Types (browse), Create Type, Create Item, My Ratings, About
- `siteLinks` → Home, Types, Similar, About
- Auth-aware menu (show "Log in" / user display name via Twintrinsic
  `Avatar`/`Tag`)

### `pnpm-workspace.yaml` (root)
Add `dnanything` to the monorepo so the local Twintrinsic link resolves:
```yaml
packages:
  - "fo4-tools"
  - "questlists-svelte"
  - "twintrinsic"
  - "gothic-remake-tools"
  - "dnanything"
```

## Component Mapping

| DNAnything surface | Twintrinsic component |
|---|---|
| App shell / nav / sidebar | `App`, `AppHeader`, `Sidebar` |
| Logo in header | `DnaAnythingLogo` (custom) via `brand` snippet |
| Type browse grid | `Card` / `Panel` + `Tag` for attributes |
| Item data page | `Panel`, `Table` (ratings), `Rating` (input), `TagGroup` |
| Attribute rating input (0–5) | `Rating` or `Slider` |
| Create Type / Create Item forms | `TextInput`, `Textarea`, `Select`, `Button`, `Fieldset` |
| Similar items results | `Table` or `Card` grid + `Progress` (deep match) + `Tag` (weights) |
| Mode toggle (Fast / Deep) | `Switch` or `RadioGroup` |
| Auth / login | `Modal` + `Button` (OAuth) |
| Local→remote upload prompt | `Modal` + `Alert` |
| Toasts (saved, errors) | `Toast` |
| Loading states | `Skeleton` |
| Charts (rating distributions) | `PieChart` / `AreaChart` / `MetricGrid` |

## Theming

- Define DNAnything theme tokens in `src/app.css` `@theme` block:
  `--color-primary` (helix green), `--color-secondary`, `--color-accent`,
  `--color-background`, `--color-surface`, `--color-text`, `--color-border`.
- Follow the `fo4-tools` runtime-theme pattern (CSS variables set on
  `:root` from localStorage before paint) so themes persist.
- The `DnaAnythingLogo` uses `currentColor` / theme vars to recolor.

## Tasks

1. Scaffold SvelteKit project in `dnanything/` (Svelte 5, TypeScript,
   Tailwind 4, Biome — match `fo4-tools` versions).
2. Add `vite.config.ts` alias + `app.css` imports + `@source` directives.
3. Add `dnanything` to the root `pnpm-workspace.yaml`.
4. Build `+layout.svelte` with Twintrinsic `App` shell + brand logo.
5. Build the route pages (home, type browse, item data, create forms,
   similar results) using the component mapping above.
6. Wire `setIconset('mdi')` and load Iconify runtime in `app.html`.
7. Verify hot reload works across `dnanything/` and `../twintrinsic/`.

## Open Questions

- Theme palette: a DNA-inspired green/teal default, or let the user pick
  (like fo4-tools' theme switcher)? Recommend a fixed DNA-themed default
  for v1, add a theme switcher later.
