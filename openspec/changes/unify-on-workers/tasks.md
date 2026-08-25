## 1. OpenSpec freeze

- [x] 1.1 Validate and archive `preserve-cattopic-behavior` so main specs exist
- [x] 1.2 Validate `unify-on-workers` artifacts

## 2. Dead code

- [x] 2.1 Delete unused ImageDetail, upload/ImageSidebar, StatusMessage, useConfig, unused hooks, unused npm deps
- [x] 2.2 Left `icons.tsx` barrel in place (dead lucide aliases only; no extra packages)

## 3. Layout

- [x] 3.1 Move `worker/src` → `src/worker` and `app` → `src/react-app` with git mv
- [x] 3.2 Add root `wrangler.jsonc`, `vite.config.ts`, `index.html`, merge package.json, remove `worker/package.json`

## 4. Worker

- [x] 4.1 `run_worker_first: ["/api/*"]`, SPA not_found_handling, compatibility_date 2026-08-25, observability sample 0.05
- [x] 4.2 Keep handwritten `Env` plus optional `ASSETS`; `wrangler types` available via `pnpm cf-typegen` after real IDs are filled
- [x] 4.3 Upload: 20MB binding gate; no triple 70MB buffers; AVIF max 1200
- [x] 4.4 Remove KV prefix list invalidation and runtime CREATE TABLE
- [x] 4.5 Remove Worker favicon routes
- [x] 4.6 Unit tests for ID/tag validation and discrete thumbnail widths (full workerd route tests need real bindings)

## 5. SPA

- [x] 5.1 React Router `/` and `/manage`; replace next/link, next/image, next/font
- [x] 5.2 Same-origin request helper; delete Next `/api/config` discovery
- [x] 5.3 Discrete thumbnail widths 400/800/1200
- [x] 5.4 Upload state remains in `useUploadState`; ImageFile/ImageData still coexist (no user-visible change)

## 6. Ship

- [x] 6.1 Root CI: pnpm build, tsc, lint, wrangler types --check, wrangler deploy
- [x] 6.2 Update README, DEPLOYMENT, API docs, AGENTS/CLAUDE
- [x] 6.3 Update CHANGELOG.md and CHANGELOG_CN.md
- [x] 6.4 `pnpm build` produces client assets + worker bundle; typecheck and unit tests pass. Browser/E2E against live D1/R2 not run in this environment.
