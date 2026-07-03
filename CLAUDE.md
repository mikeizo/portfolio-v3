# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Astro dev server (port from `PORT` env var)
- `npm run build` — production build to `./dist/`
- `npm run preview` — preview the production build
- `npm run lint` / `npm run lint:fix` — ESLint over `.js,.ts,.vue,.astro`
- `npm run test:e2e` — Playwright e2e tests (`src/tests/e2e/`)
  - Single file: `npx playwright test src/tests/e2e/work.spec.ts`
  - Single test: `npx playwright test --grep "test name"`
  - HTML report/artifacts land in `.playwright/` (gitignored)

No unit test runner is configured (`src/tests/unit/` is empty).

### Playwright setup

`playwright.config.ts` loads `.env` via `process.loadEnvFile()` (the runner is a separate process from the dev server). Tests expect port **3030** (`baseURL` = `SITE_URL` ?? `http://localhost:3030`); the `webServer` block starts `npm run dev` there but reuses an already-running server locally. `src/tests/e2e/helpers.ts` logs in through the real login form using a seeded **guest** test user from `LOGIN_USER` / `LOGIN_PASS` env vars.

Two conventions the helpers encode — reuse them:
- `client:load` islands aren't interactive until hydrated; clicks/fills before hydration are silently lost. Wrap interactions in `expect(async () => {...}).toPass()` retries (`fillField`, `login`, `openFirstRowMenu`).
- Guest write-gating is **server-side** (403 from middleware), not client-side hiding. `expectAdminWrite` asserts the `/api/admin/<feed>` response status plus the surfaced toast text, registering the response listener before the click.

## Architecture

Astro 6 SSR site (`output: 'server'`, Vercel adapter) with Vue 3 islands, Tailwind 4, and a MongoDB-backed admin CMS.

### Rendering model
- Public pages (`src/pages/*.astro`) are server-rendered with Vue islands mounted via `@astrojs/vue`. Page-level components live in `src/components/pages/` (`home/`, `about/`, `work/`), shared chrome in `src/components/regions/` (`Header`, `Nav`, `Footer`).
- Page `<title>`/description come from `getMetaData(page)` in `src/meta/meta.ts`, backed by `src/meta/meta.json`.
- `@` is aliased to `/src` in Vite.
- `trailingSlash: 'never'`.

### Data layer
- `src/utils/mongodb.ts` is the single gateway to Mongo via Mongoose. It memoizes the connection (`isConnected`) and exposes `fetchData`, `fetchDataById`, `updateData`, `insertData`, `deleteData` — all keyed on a raw collection name.
- **Reads are SSR, in-process**: public pages (`index.astro`, `about.astro`, `work.astro`, `Layout.astro`) and the admin `.astro` pages call `fetchData` directly, then pass results as props to `client:load` Vue islands (e.g. `admin/work/index.astro` → `<AdminWorkList data={work}>`). There is no client-side read fetching in the app.
- Requires `MONGODB_URI` and `MONGODB_DB` env vars.
- **Writes go through per-collection Mongoose Models** in `src/models/` (`Settings`, `Experience`, `About`, `Work`), registered in `src/models/index.ts` as `writeModels`. Each Schema uses `strict: 'throw'` so unknown fields cause Mongoose to throw `StrictModeError`; the API handler maps that (plus `ValidationError` / `CastError`) to HTTP 400. `insertData` / `updateData` / `deleteData` resolve the right Model from the collection-name string via this registry and call Model methods with `runValidators: true`. Reads (`fetchData`, `fetchDataById`) still hit the raw collection — read shape is whatever Mongo holds.
- Each Schema is typed `Schema<T>` / `Model<T>` against its matching type in `src/types/portfolio.d.ts` (e.g. `Schema<WorkType>`), so schema field names stay aligned with the TypeScript types at compile time.
- The `Work` schema manages `created` / `updated` ISO-string timestamps server-side via `pre('validate')` (sets `created` on new docs and `updated` on every save) and `pre('findOneAndUpdate')` (sets `updated` on update queries). `created` is `immutable: true`. Clients must not send these fields — the hooks overwrite any supplied value.
- HTML-bearing fields are sanitized server-side in the same hooks: `description` on `Work` and `About`, and `about` on `Settings`. Each model calls `sanitizeDocFields(this, [...])` in `pre('validate')` and `sanitizeUpdateFields(this, [...])` in `pre('findOneAndUpdate')` — both live in `src/utils/sanitizeHtml.ts`, wrapping a single `sanitizeDescription` config (allowed tags: `p, b, strong, em, i, h1, h2, h3, code, a, ul, ol, li`; anchors keep `href/target/rel`; schemes restricted to `http/https/mailto`). Sanitization runs on every write path (`insertData` and `updateData`), so the rule cannot be bypassed by direct API calls. Empty-after-sanitize values fall through to the schema's existing `required` check and surface as 400s.
- **Adding a new writable collection requires**: (1) a Model in `src/models/`, (2) registering it in `writeModels` in `src/models/index.ts`, and (3) a mirrored valibot schema in `src/utils/formSchema.ts` (`v.strictObject`, hand-mirrored from the Mongoose Schema — keep both in sync when changing fields) that the Vue form validates with `v.safeParse` before POSTing. `ALLOWED_FEEDS` in `src/pages/api/admin/[feed].ts` is derived from `Object.keys(writeModels)`, so it stays in sync automatically.
- Public read API: `src/pages/api/[feed]/index.ts` (list, optional `?sort=&order=`) and `[id].ts` (single doc). The `[feed]` param maps directly to a Mongo collection name and is **not whitelisted**; nothing in the app consumes these endpoints anymore, but they remain publicly reachable — validate/whitelist `feed` before building on them.
- Admin write API: `src/pages/api/admin/[feed].ts`, plus `presign.ts` / `s3-delete.ts` for S3 uploads (AWS SDK v3, presigned URLs). Client flow: request a presigned PUT from `presign.ts`, PUT the file directly to S3, call `s3-delete.ts` on removal — orchestrated by the `useS3Upload` composable.
- Contact form: `src/components/Contact.vue` (modal form) POSTs to `src/pages/api/mail.ts`, which verifies a reCAPTCHA Enterprise token server-side, sanitizes fields with `sanitize-html`, and sends mail via the Mailgun API. Its field validators live in `src/utils/validation.ts`.

### Admin area
- Routes under `src/pages/admin/*.astro` use `src/layouts/Admin.astro`, which mounts the `AdminLayout.vue` shell (`client:load`) around page components from `src/components/admin/pages/`.
- The admin UI is **hand-built** (no component library): shell pieces in `src/components/admin/` (`Sidebar`, `Topbar`, `Breadcrumb`, `DropdownMenu`, `ConfirmDialog`, `Toast`, `StubPanel`) and form primitives in `src/components/admin/form/` (`TextField`, `RichTextEditor` (Tiptap), `ImageUpload`, `GalleryUpload`). Icons via `lucide-vue-next` (admin chrome) and `devicon` (experience tech icons).
- Forms validate with valibot (`v.safeParse` against `src/utils/formSchema.ts`) then `fetch()` directly to `/api/admin/<feed>`; success/failure surfaces through the toast store. Deletes go through `useConfirmDelete` + `ConfirmDialog`.
- Theming: `src/styles/admin.css` is the admin Tailwind entry, defining semantic tokens (`--bg`, `--surface`, `--accent`, `--danger`, …) that all admin markup reads. Dark mode is a custom variant keyed on `[data-theme="dark"]` on `<html>` — **not** Tailwind's `.dark` class; the collapsed sidebar is `[data-rail="collapsed"]`. Both are persisted in localStorage (`admin-new-color-scheme` via `useColorMode` in `AdminLayout.vue`, `admin-new-rail` via `useStorage`) and pre-painted by an inline script in `Admin.astro` to avoid FOUC. Keep the vueuse `storageKey` custom — the default key collides with the public site's theme handling.
- Style admin work with Tailwind utilities on these tokens; don't add hand-written CSS.

### State & utilities
- Global state via `nanostores` + `@nanostores/vue`: `src/stores/theme.ts` (public-site theme) and `src/stores/toasts.ts` (`addToast` / `removeToast`, rendered by `admin/Toast.vue`).
- `src/composables/`:
  - `useCurrentUser.ts` — exposes `user`, `isAdmin`, `isGuest` via `inject('currentUser')`; `Admin.astro` passes `Astro.locals.user` into `AdminLayout.vue`, which provides it. Prefer this over re-fetching `/api/auth/me`.
  - `useConfirmDelete.ts` — confirm-dialog state machine wrapping a delete callback.
  - `useInputRotation.ts` — mouse/touch/gyroscope input tracking with lerp smoothing, used for visual effects.
  - `useObserver.ts` — `IntersectionObserver` wrapper for mount/unmount visibility tracking.
  - `useS3Upload.ts` — file validation + presigned-URL S3 upload with progress tracking.
- `src/utils/` holds shared helpers: `auth.ts` (JWT sign/verify, cookie helpers), `mongodb.ts`, `sanitizeHtml.ts`, `formSchema.ts` (valibot), `validation.ts` (contact-form validators), `slug.ts`, `animation.ts` (GSAP).
- Animations use GSAP; there is also a Three.js dependency for visual elements.
- Coding conventions (TypeScript strict, Vue 3 Composition API, Astro patterns, BEM naming, accessibility) are documented in `.cursorrules`.

### Styling
- Tailwind 4 via `@tailwindcss/vite`. The admin area uses it exclusively (through `admin.css` tokens, above).
- The public site is styled with global SCSS in `src/styles/` (`styles.scss` + breakpoint partials) and component-scoped SCSS, following BEM.

### Auth & roles

- Login flow entry points: page at `src/pages/login.astro` (mounts `src/components/pages/Login.vue`) posts to `src/pages/api/auth/login.ts`. `logout.ts` clears the cookie; `me.ts` returns the current user. Middleware explicitly skips `/api/auth/*` so these endpoints remain reachable when unauthenticated.
- Login is gated by `src/middleware.ts`. Unauthenticated requests to `/admin/*` are redirected to `/login?next=<path>`; unauthenticated requests to `/api/admin/*` get 401. Writes to `/api/admin/*` (POST/PATCH/PUT/DELETE) require `role: 'admin'` — guests get 403. Guest gating is enforced only here; the client UI merely adapts (e.g. Edit → View).
- Sessions are signed JWTs (HS256, `jose`) in an httpOnly cookie (`portfolio_session` by default), 7-day TTL, refreshed when <2 days remain on activity to protected paths (`/admin/*`, `/api/admin/*`). Public pages don't refresh the cookie, so they remain ISR-cacheable.
- Required env vars: `AUTH_JWT_SECRET` (32+ random bytes). Optional: `AUTH_COOKIE_NAME`.
- Users live in a `users` collection: `{ email, passwordHash, role: 'admin' | 'guest', createdAt }`. Not exposed through any API — manage directly in MongoDB.

Seed a user with `mongosh`:

```js
db.users.insertOne({
  email: 'you@example.com',
  passwordHash: '<bcrypt hash>',
  role: 'admin',
  createdAt: new Date()
})
```

Generate a hash: `node -e "require('bcryptjs').hash('yourpassword', 10).then(console.log)"`.

## Environment variables

- **MongoDB**: `MONGODB_URI`, `MONGODB_DB`
- **Auth**: `AUTH_JWT_SECRET` (required, 32+ bytes), `AUTH_COOKIE_NAME` (optional)
- **reCAPTCHA Enterprise**: `PUBLIC_RECAPTCHA_SITE_KEY` (client), `RECAPTCHA_PROJECT_ID`, `RECAPTCHA_API_KEY` (server, `api/mail.ts`)
- **Mailgun**: `MAILGUN_URL`, `MAILGUN_KEY` (server, `api/mail.ts`)
- **AWS S3**: `AWS_KEY`, `AWS_SECRET`, `AWS_REGION_APP`, `AWS_BUCKET`
- **App**: `PUBLIC_ASSETS_PATH` (image CDN base), `SITE_URL`, `PORT`, `PROD`
- **E2E tests**: `LOGIN_USER`, `LOGIN_PASS` (seeded guest test user)

`PUBLIC_*` vars are exposed to the client; all others are server-only.

## Deployment

Vercel (`@astrojs/vercel` adapter). Server output — every route is a serverless function unless explicitly prerendered. ISR is enabled in `astro.config.mjs` with a 5-minute expiration; `/api/*`, `/admin/*`, and `/login` are excluded so they always run fresh.
