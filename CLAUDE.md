# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Astro dev server (port from `PORT` env var)
- `npm run build` — production build to `./dist/`
- `npm run preview` — preview the production build
- `npm run lint` / `npm run lint:fix` — ESLint over `.js,.ts,.vue,.astro`

No test suite is configured.

## Architecture

Astro 5 SSR site (`output: 'server'`, Vercel adapter) with Vue 3 islands, Tailwind 4 + Nuxt UI, and a MongoDB-backed admin CMS.

### Rendering model
- Public pages (`src/pages/*.astro`) are server-rendered with Vue islands mounted via `@astrojs/vue`. The Vue app entrypoint is `src/app.ts` (see `astro.config.mjs`).
- `@` is aliased to `/src` in Vite.
- `trailingSlash: 'never'`.

### Data layer
- `src/utils/mongodb.ts` is the single gateway to Mongo via Mongoose. It memoizes the connection (`isConnected`) and exposes `fetchData`, `fetchDataById`, `updateData`, `insertData`, `deleteData` — all keyed on a raw collection name (no per-collection Mongoose models).
- Requires `MONGODB_URI` and `MONGODB_DB` env vars.
- Public read API: `src/pages/api/[feed]/index.ts` — dynamic `[feed]` param maps directly to a Mongo collection name, with optional `?sort=&order=` query.
- Admin write API: `src/pages/api/admin/[feed].ts`, plus `presign.ts` / `s3-delete.ts` for S3 uploads (AWS SDK v3, presigned URLs).

Since collections are addressed by string, validate/whitelist the `feed` param when adding endpoints that could be reached by untrusted input.

### Admin area
- Routes under `src/pages/admin/*.astro` use `src/layouts/Admin.astro` and mount Vue components from `src/components/admin/`.
- `AdminLayout.vue` / `AdminNavbar.vue` / `AdminSidebar.vue` wrap page-level components in `src/components/admin/pages/`.
- Forms use Nuxt UI + Valibot; rich text via Tiptap; media via S3 presigned uploads (`presign.ts` → client PUTs → `s3-delete.ts` on removal).

### State & utilities
- Global state via `nanostores` + `@nanostores/vue` (`src/stores/theme.ts`).
- `src/utils/` holds shared helpers: `api.ts` (fetch wrappers), `forms.ts`, `validation.ts` (Valibot), `slug.ts`, `animation.ts` (GSAP), `request.ts`.
- Animations use GSAP; there is also a Three.js dependency for visual elements.

### Styling
- Tailwind 4 via `@tailwindcss/vite`, configured through `@nuxt/ui` in `astro.config.mjs` (primary=blue, neutral=slate, plus table slot overrides). Prefer extending the Nuxt UI theme there rather than adding ad-hoc global CSS.
- SCSS is available (`sass`) for component-scoped styles.

## Deployment

Vercel (`@astrojs/vercel` adapter, `vercel.json` present). Server output — every route is a serverless function unless explicitly prerendered.
