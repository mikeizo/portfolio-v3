# Domain Glossary

Canonical vocabulary for this project. Keep terms here precise; code and tests should use these words.

- **Feed** — the URL segment naming a content collection in API routes (`/api/admin/<feed>`). A feed is only writable when it is a registered _writable collection_.
- **Writable collection** — one of the four content collections that accept writes through the admin API: `settings`, `experience`, `about`, `work`. Anything else is read-only or off-limits.
- **Singleton collection** — a collection holding exactly one document (`settings`; `about` entries are edited per-document). Updates target "the" document rather than one selected by id.
- **Admin** — an authenticated user who may read and write everything in the admin area.
- **Guest** — an authenticated demo user who may view the admin area but whose writes are refused by the server. Gating is a server-side rule, not a UI convention.
- **Session** — a signed, expiring proof of login carried by the browser. Sessions nearing expiry are silently renewed on protected pages only.
- **Contact message / phone** — optional fields on the public contact form. An empty message or phone is _valid by design_; only non-empty values are held to format and length rules.
- **Description fields** — rich-text content authored in the admin (`work.description`, `about.description`, `settings.about`). Only a fixed whitelist of formatting markup survives; everything else is stripped on every write.
