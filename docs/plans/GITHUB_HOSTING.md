# GitHub Hosting Plan

**Objective**: Host the DNAnything project on GitHub — source control,
CI/CD, and frontend deployment — with the Supabase backend (see
`BACKEND_DATABASE_RESEARCH.md`).

## Repository

- **Location**: `github.com/<user>/dnanything` (new repo).
- **Visibility**: Public (portfolio project). The repo lives at
  `/home/sam/workspace-other/dnanything` locally.
- **Monorepo note**: `dnanything` is part of the local pnpm workspace
  (root `pnpm-workspace.yaml` lists it alongside `twintrinsic`,
  `fo4-tools`, etc.). The GitHub repo should contain **only** the
  `dnanything/` subtree, with Twintrinsic referenced as a local dev
  alias (not committed). For CI, install Twintrinsic from its published
  npm package or a git dependency.

### `.gitignore` (SvelteKit + Supabase essentials)
```
node_modules
.svelte-kit
build
dist
.env
.env.*
!.env.example
.vercel
.netlify
.DS_Store
test-results
```

### Secrets handling
- `.env.example` documents `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` (service role only for migrations, never
  shipped to the client), `GITHUB_OAUTH_CLIENT_ID/SECRET`.
- Real values live in GitHub Actions secrets + the host's env vars.
- **Never** commit `.env` or service-role keys.

## Frontend Hosting

The SvelteKit frontend is a static/edge app; the data lives in Supabase.
Two good options:

| Host | Free tier | Adapter | Notes |
|---|---|---|---|
| **Vercel** | Hobby (free) | `@sveltejs/adapter-vercel` | Best SvelteKit DX, edge functions, preview deploys per PR |
| **Netlify** | Starter (free) | `@sveltejs/adapter-netlify` | Also great, 100GB bandwidth |

**Recommendation: Vercel** — first-class SvelteKit support, automatic
preview deployments for every PR (great for reviewing GA/similarity
changes), and free hobby tier. Use `adapter-vercel`.

If preferring to stay fully on GitHub infra: **GitHub Pages** with
`adapter-static` is possible but loses SvelteKit SSR/edge features; only
choose this if you want zero external hosting dependency. Given Supabase is
already external, Vercel adds no new vendor risk.

## CI/CD (GitHub Actions)

`.github/workflows/ci.yml` runs on push + PR:

1. **Install** — `pnpm install` (with `twintrinsic` resolved from npm or a
   git URL in CI).
2. **Lint/format** — `pnpm check` (svelte-check) + Biome lint.
3. **Unit tests** — `pnpm test:unit` (Vitest) with coverage upload.
4. **E2E tests** — `pnpm test:e2e` (Playwright) against a preview build.
5. **Build** — `pnpm build` to confirm the production bundle compiles.

Vercel handles deploy on merge to `main`; PRs get preview URLs automatically.

## Tasks

1. `git init` in `dnanything/`, create the GitHub repo, push initial commit.
2. Add `.gitignore`, `.env.example`, `README.md` (with logo + setup steps).
3. Add `AGENTS.md` (project guide for agents, mirroring fo4-tools' style).
4. Add `.github/workflows/ci.yml` (check + unit + e2e + build).
5. Install `@sveltejs/adapter-vercel`; configure `svelte.config.js`.
6. Connect the GitHub repo to Vercel; set env vars (Supabase keys, OAuth).
7. Configure GitHub OAuth app with the Vercel callback URL.

## Open Questions

- Repo name: `dnanything` (matches the local dir)? Recommend yes.
- License: MIT (matches Twintrinsic) or another? Recommend MIT.
