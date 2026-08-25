# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed

- GitHub Actions and docs call `pnpm run deploy`. Bare `pnpm deploy` is pnpm's workspace publish command and fails with `ERR_PNPM_CANNOT_DEPLOY`.

## [1.0.0] - 2026-08-25

First release of the single-Worker app. Admin UI and API share one hostname. Image bytes stay on `R2_PUBLIC_URL`.

### Added

- **OpenSpec** — Behavior freeze under `openspec/` (`preserve-cattopic-behavior` archived; `unify-on-workers` tracks the merge).
- **Same-origin Worker SPA** — React UI is Cloudflare Static Assets on the same Worker as the Hono API. `GET /` and `GET /manage` do not invoke the Worker script.
- **Durable R2 deletion jobs** — D1 `deletion_jobs` table so metadata can be removed immediately while failed R2 cleanup is retried by Queue, Cron, or `POST /api/cleanup`.
- **Optional Cloudflare Queues** — Set `USE_QUEUE` to `"true"` in `wrangler.jsonc` for async R2 deletes, or `"false"` for synchronous deletes.
- **ZIP batch upload** — Browser-side JSZip extraction, 50-image batches, shared tags, skip non-images and files over 70MB.

### Changed

- Replace Next.js + Vercel with Vite + React Router + `@cloudflare/vite-plugin`. One `pnpm dev` / `pnpm run deploy`.
- UI calls relative `/api/*`. Worker hostname is the UI origin. `R2_PUBLIC_URL` remains the image object CDN.
- Bind production resources in `wrangler.jsonc`: R2 `cattopic`, D1 `CattoPic-D1`, KV `cattopic-kv`, Queue `cattopic-delete-queue`, Images `IMAGES`. `USE_QUEUE` is `"true"`.
- Config is `wrangler.jsonc` with `run_worker_first: ["/api/*"]`. `compatibility_date` is `2026-08-25`.
- Images binding compression only for files ≤ 20MB (official `.input()` limit). Advertised max upload stays 70MB.
- AVIF long side capped at 1200px per Cloudflare Images limits.
- Gallery `/cdn-cgi/image` widths quantized to 400/800/1200 to bound unique transformations.
- Stop KV prefix list+delete invalidation; D1 is the gallery source of truth.
- Production Workers logs sampled at 5%.
- Expired image cleanup records durable R2 deletion jobs and retries from Cron/manual cleanup.
- `/api/random` redirects (302) to the selected image URL instead of proxying bytes.
- `/api/images` `format` filter: `all|gif|webp|avif|original`.
- Manage page page size 60; default `maxUploadCount` 50; upload concurrency 5.
- Virtualize Manage masonry and upload sidebars with TanStack Virtual.
- Request resized thumbnails via `/cdn-cgi/image/width=...`.
- Transform-URL parameters follow configured settings (no extra flags; no forced AVIF resize unless a max size is specified).
- GitHub Actions deploy uses pnpm 10.24.0 and Node.js 24; secrets are `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` only.

### Removed

- Next.js App Router frontend, Vercel deploy, `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WORKER_URL`, and the unauthenticated Next `/api/config` discovery route.
- Separate `worker/` package (`worker/package.json`, `worker/wrangler.toml`).
- Documented `GET /r2/*` Worker image proxy (it was never implemented). Image bytes are read from `R2_PUBLIC_URL`.

### Fixed

- Clearing expiry with `expiryMinutes: 0` in `PUT /api/images/:id`.
- Hide expired images from list, detail, random-image, and tag-count reads before scheduled cleanup deletes them.
- Stale image detail caches after batch tag edits, tag deletion, and expired-image cleanup.
- Bound and chunk batch tag updates to avoid D1 SQL variable/statement limits.
- API key `last_used_at` is updated only when validating the key, not on every protected read.
- Orientation detection for WebP and AVIF reads real dimensions instead of defaulting to 1920×1080.
- Deleted images disappear from Upload/Manage without a hard refresh.
- Random API link generator uses the current origin (same-origin Worker) instead of `https://your-worker.workers.dev`.
- Clamp `/api/images` pagination; normalize/sanitize tag updates.
- Do not fetch protected image data before an API key is available on Manage.
- Production-only React render-loop crash (#301) in Manage virtual masonry.
- `/favicon.ico` redirects to `/static/favicon.ico`.
- Do not send `Authorization: Bearer null` when no API key is set.
- Validate tag route params for rename/delete.
- Accept multipart uploads using either `image` or `file`.
- Validate missing or malformed image/tag route parameters before handlers call metadata/cache services.

### Security

- Update vulnerable transitive lockfile entries for `ajv`, `brace-expansion`, `flatted`, `minimatch`, `picomatch`, `postcss`, and Worker-side `undici`.
- Tighten tag sanitization on tag management endpoints.

[Unreleased]: https://github.com/Yuri-NagaSaki/CattoPic/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Yuri-NagaSaki/CattoPic/releases/tag/v1.0.0
