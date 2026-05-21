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
- `src/utils/mongodb.ts` is the single gateway to Mongo via Mongoose. It memoizes the connection (`isConnected`) and exposes `fetchData`, `fetchDataById`, `updateData`, `insertData`, `deleteData` — all keyed on a raw collection name.
- Requires `MONGODB_URI` and `MONGODB_DB` env vars.
- **Writes go through per-collection Mongoose Models** in `src/models/` (`Settings`, `Experience`, `About`, `Work`), registered in `src/models/index.ts` as `writeModels`. Each Schema uses `strict: 'throw'` so unknown fields cause Mongoose to throw `StrictModeError`; the API handler maps that (plus `ValidationError` / `CastError`) to HTTP 400. `insertData` / `updateData` / `deleteData` resolve the right Model from the collection-name string via this registry and call Model methods with `runValidators: true`. Reads (`fetchData`, `fetchDataById`) still hit the raw collection — read shape is whatever Mongo holds.
- Each Schema is typed `Schema<T>` / `Model<T>` against its matching type in `src/types/portfolio.d.ts` (e.g. `Schema<WorkType>`), so schema field names stay aligned with the TypeScript types at compile time.
- The `Work` schema manages `created` / `updated` ISO-string timestamps server-side via `pre('validate')` (sets `created` on new docs and `updated` on every save) and `pre('findOneAndUpdate')` (sets `updated` on update queries). `created` is `immutable: true`. Clients must not send these fields — the hooks overwrite any supplied value.
- HTML-bearing fields are sanitized server-side in the same hooks: `description` on `Work` and `About`, and `about` on `Settings`. Each model calls `sanitizeDocFields(this, [...])` in `pre('validate')` and `sanitizeUpdateFields(this, [...])` in `pre('findOneAndUpdate')` — both live in `src/utils/sanitizeHtml.ts`, wrapping a single `sanitizeDescription` config (allowed tags: `p, b, strong, em, i, h1, h2, h3, code, a, ul, ol, li`; anchors keep `href/target/rel`; schemes restricted to `http/https/mailto`). Sanitization runs on every write path (`insertData` and `updateData`), so the rule cannot be bypassed by direct API calls. Empty-after-sanitize values fall through to the schema's existing `required` check and surface as 400s.
- **Adding a new writable collection requires**: (1) a Model in `src/models/`, (2) registering it in `writeModels` in `src/models/index.ts`, and (3) a mirrored valibot schema in `src/utils/formSchema.ts` for the corresponding Vue form's `UForm`. `ALLOWED_FEEDS` in `src/pages/api/admin/[feed].ts` is derived from `Object.keys(writeModels)`, so it stays in sync automatically.
- Public read API: `src/pages/api/[feed]/index.ts` — dynamic `[feed]` param maps directly to a Mongo collection name, with optional `?sort=&order=` query.
- Admin write API: `src/pages/api/admin/[feed].ts`, plus `presign.ts` / `s3-delete.ts` for S3 uploads (AWS SDK v3, presigned URLs). Client flow: request a presigned PUT from `presign.ts`, PUT the file directly to S3, call `s3-delete.ts` on removal — orchestrated by the `useS3Upload` composable.
- Contact form: `src/components/Contact.vue` (modal form) POSTs to `src/pages/api/mail.ts`, which verifies a reCAPTCHA Enterprise token server-side, sanitizes fields with `sanitize-html`, and sends mail via the Mailgun API.

Since the public read API still addresses collections by string, validate/whitelist the `feed` param when adding read endpoints that could be reached by untrusted input.

### Admin area
- Routes under `src/pages/admin/*.astro` use `src/layouts/Admin.astro` and mount Vue components from `src/components/admin/`.
- `AdminLayout.vue` / `AdminNavbar.vue` / `AdminSidebar.vue` wrap page-level components in `src/components/admin/pages/`.
- Forms use Nuxt UI + Valibot (client-side schemas live in `src/utils/formSchema.ts`, hand-mirrored from the server Mongoose Schemas in `src/models/` — keep both in sync when changing fields); rich text via Tiptap; media via S3 presigned uploads (`presign.ts` → client PUTs → `s3-delete.ts` on removal).

### State & utilities
- Global state via `nanostores` + `@nanostores/vue` (`src/stores/theme.ts`).
- `src/composables/`:
  - `useCurrentUser.ts` — exposes `user`, `isAdmin`, `isGuest`. The session user is provided to Vue islands via Astro (`locals.user` → `Admin.astro`); prefer this over re-fetching `/api/auth/me`.
  - `useInputRotation.ts` — mouse/touch/gyroscope input tracking with lerp smoothing, used for visual effects.
  - `useObserver.ts` — `IntersectionObserver` wrapper for mount/unmount visibility tracking.
  - `useS3Upload.ts` — file validation + presigned-URL S3 upload with progress tracking.
- `src/utils/` holds shared helpers: `api.ts` (fetch wrappers), `forms.ts`, `validation.ts` (form field validators + `validateForm`), `slug.ts`, `animation.ts` (GSAP), `request.ts`, `auth.ts` (JWT sign/verify, cookie helpers), `sanitizeHtml.ts` (`sanitizeDescription` + `sanitizeDocFields` / `sanitizeUpdateFields` Mongoose hook helpers).
- Animations use GSAP; there is also a Three.js dependency for visual elements.
- Coding conventions (TypeScript strict, Vue 3 Composition API, Astro patterns, BEM naming, accessibility) are documented in `.cursorrules`.

### Styling
- Tailwind 4 via `@tailwindcss/vite`, configured through `@nuxt/ui` in `astro.config.mjs` (primary=blue, neutral=slate, plus table slot overrides). Prefer extending the Nuxt UI theme there rather than adding ad-hoc global CSS.
- SCSS is available (`sass`) for component-scoped styles.

### Auth & roles

- Login flow entry points: page at `src/pages/login.astro` (mounts `src/components/pages/Login.vue`) posts to `src/pages/api/auth/login.ts`. `logout.ts` clears the cookie; `me.ts` returns the current user. Middleware explicitly skips `/api/auth/*` so these endpoints remain reachable when unauthenticated.
- Login is gated by `src/middleware.ts`. Unauthenticated requests to `/admin/*` are redirected to `/login?next=<path>`; unauthenticated requests to `/api/admin/*` get 401. Writes to `/api/admin/*` (POST/PATCH/PUT/DELETE) require `role: 'admin'` — guests get 403.
- Sessions are signed JWTs (HS256, `jose`) in an httpOnly cookie (`portfolio_session` by default), 7-day TTL, refreshed on activity when <2 days remain.
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

`PUBLIC_*` vars are exposed to the client; all others are server-only.

## Deployment

Vercel (`@astrojs/vercel` adapter, `vercel.json` present). Server output — every route is a serverless function unless explicitly prerendered.
