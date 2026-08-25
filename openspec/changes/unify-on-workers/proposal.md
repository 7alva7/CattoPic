## Why

The UI on Vercel and the API on a Cloudflare Worker duplicate types, CORS, config discovery, and deploys. Page views should be free Static Assets; only `/api/*` should invoke the Worker.

## What Changes

- Serve the operator UI as a React SPA from the same Worker as Hono (`/` and `/manage`).
- Same-origin `fetch("/api/...")`. Remove Next.js, Vercel, `NEXT_PUBLIC_API_URL`, and the unauthenticated Next `/api/config` route.
- Stream uploads into R2. Compress with Images binding only for files ≤ 20MB (official `.input()` limit). Keep advertised 70MB max.
- Stop KV prefix `list`+delete invalidation. Gallery reads D1.
- Quantize gallery thumbnail transform widths to 400/800/1200.
- Clamp AVIF long side to 1200px per Images limits.
- Production log sampling 5%.
- Worker `compatibility_date` 2026-08-25; `wrangler.jsonc`; `run_worker_first: ["/api/*"]` only.

Not breaking for curl/API clients on the Worker hostname. **BREAKING** for a separately hosted UI that relied on CORS + `NEXT_PUBLIC_API_URL` (that UI is this repo's Next app, which is replaced).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `frontend`: same-origin API, Vite SPA routes `/` and `/manage`
- `upload`: Images binding threshold 20MB; large files stream to R2 without full-buffer copies
- `storage`: AVIF transform/compress long side 1200px; thumbnail widths discrete
- `random-api`: 302 MUST still win over SPA `index.html` for `/api/random`

## Impact

Removes Next.js. One `pnpm dev` / `pnpm deploy`. GitHub Action deploys Worker+assets. R2 public domain unchanged. Dual changelogs.
