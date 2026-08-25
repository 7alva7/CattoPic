# CattoPic deployment

[中文](../DEPLOYMENT.md)

From 1.0.0 one Worker serves the UI and the API. Open the Worker hostname; there is no separate frontend deploy. Requires Node.js 24+ and pnpm.

Image bytes live in R2 and are served from `R2_PUBLIC_URL` (object CDN). Do not proxy originals through the Worker.

## Bindings

See root `wrangler.jsonc`:

| Binding | Resource |
|---------|----------|
| `R2_BUCKET` | R2 `cattopic` |
| `DB` | D1 `CattoPic-D1` |
| `CACHE_KV` | KV `cattopic-kv` |
| `DELETE_QUEUE` | Queue `cattopic-delete-queue` |
| `IMAGES` | Cloudflare Images |
| `ASSETS` | Static UI |

`USE_QUEUE` is `'true'`.

Forks: copy `wrangler.example.jsonc` to `wrangler.jsonc` and fill D1 `database_id` and KV `id`.

```bash
pnpm wrangler d1 list
pnpm wrangler kv namespace list
pnpm wrangler r2 bucket list
pnpm wrangler queues list
```

## Deploy

```bash
pnpm install
pnpm wrangler login
pnpm wrangler d1 migrations apply CattoPic-D1 --remote
pnpm wrangler d1 execute CattoPic-D1 --remote --command "
INSERT OR IGNORE INTO api_keys (key, created_at) VALUES ('your-api-key', datetime('now'));
"
pnpm run deploy
```

The printed `*.workers.dev` URL (or your Custom Domain) is both the admin UI and the API origin.

```bash
curl -X POST -H "Authorization: Bearer your-api-key" \
  https://cattopic-worker.<subdomain>.workers.dev/api/validate-api-key
```

## R2 public access

Image URLs need the bucket readable (custom domain or r2.dev). Enable Public access on the R2 bucket, set `vars.R2_PUBLIC_URL` in `wrangler.jsonc`, then `pnpm run deploy`.

## GitHub Actions

Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. Config is the committed `wrangler.jsonc`; no `WRANGLER_TOML` overlay.

## Local

```bash
pnpm dev   # http://localhost:5173
```

Local mode uses simulated bindings. Remote bindings: [Workers local development](https://developers.cloudflare.com/workers/local-development/).
