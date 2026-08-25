## Context

Official Cloudflare path: [Hono + React SPA](https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/hono/) with [SPA routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/). Template: `cloudflare/templates/vite-react-template`.

CattoPic has two client routes, Hono API, cron, optional queue.

## Goals / Non-Goals

Goals:
- One origin for UI + API
- Zero Worker invocations for HTML/JS/CSS
- Preserve freeze specs
- Stay under 128MB isolate during 70MB uploads

Non-Goals:
- vinext/OpenNext
- Serving originals through the Worker
- Durable Objects, Workflows, Smart Placement
- Hosted Cloudflare Images storage (keep R2)

## Decisions

### Vite SPA, not Next

HTML is Static Assets (`not_found_handling: single-page-application`). `run_worker_first: ["/api/*"]` so address-bar `/api/random` is Hono 302, not `index.html`. Never `run_worker_first: true` ([billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)).

### Keep Module Worker export

```ts
export default { fetch: app.fetch, scheduled, queue };
```

Do not `export default app`.

### Two hostnames

Worker custom domain: SPA + `/api/*`. `R2_PUBLIC_URL`: bytes + `/cdn-cgi/image`.

### Upload memory

`formData` is required for tags/options. After parsing, do not keep extra ArrayBuffer copies of >20MB files beyond what FormData already held. Compress only ≤20MB via `env.IMAGES`. Larger: original to R2 + transform marker paths (existing fallback). Frontend concurrency stays 5 for small files.

### Cache

Delete `invalidateByPrefix`. Do not KV-cache image lists. D1 is cheaper at admin QPS.

### Layout

```
index.html
src/react-app/
src/worker/
src/shared/
vite.config.ts
wrangler.jsonc
worker/migrations/
```

Single pnpm package.

## Risks / Trade-offs

- FormData still buffers multipart; 70MB + compression in one isolate is tight. Mitigate by skipping in-request compress above 20MB.
- Vercel hostname must CNAME to Worker or 404 after cutover (ops, not code).

## Migration Plan

1. Freeze specs archived.
2. Move code to template layout.
3. Switch wrangler.jsonc + Vite.
4. Cut DNS from Vercel to Worker.
5. Keep `name = cattopic-worker` so the existing Worker identity remains.

## Open Questions

None. Worker name stays `cattopic-worker`.
