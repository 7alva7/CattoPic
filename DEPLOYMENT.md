# CattoPic 部署

[English](./docs/DEPLOYMENT_EN.md)

1.0.0 起一个 Worker 提供界面和 API。打开 Worker 域名即可使用，不再部署独立前端。需要 Node.js 24+ 和 pnpm。

图片文件在 R2，由 `R2_PUBLIC_URL` 对外提供（对象 CDN）。不要把原图走 Worker 反代。

## 绑定

见根目录 `wrangler.jsonc`：

| Binding | 资源 |
|---------|------|
| `R2_BUCKET` | R2 `cattopic` |
| `DB` | D1 `CattoPic-D1` |
| `CACHE_KV` | KV `cattopic-kv` |
| `DELETE_QUEUE` | Queue `cattopic-delete-queue` |
| `IMAGES` | Cloudflare Images |
| `ASSETS` | 静态界面 |

`USE_QUEUE` 为 `'true'`。

Fork 或新账号：复制 `wrangler.example.jsonc` 为 `wrangler.jsonc`，填入 D1 `database_id` 和 KV `id`。

```bash
pnpm wrangler d1 list
pnpm wrangler kv namespace list
pnpm wrangler r2 bucket list
pnpm wrangler queues list
```

## 部署

```bash
pnpm install
pnpm wrangler login
pnpm wrangler d1 migrations apply CattoPic-D1 --remote
pnpm wrangler d1 execute CattoPic-D1 --remote --command "
INSERT OR IGNORE INTO api_keys (key, created_at) VALUES ('your-api-key', datetime('now'));
"
pnpm run deploy
```

部署输出里的 `*.workers.dev`（或已绑的自定义域）就是管理界面和 API 的地址。

```bash
curl -X POST -H "Authorization: Bearer your-api-key" \
  https://cattopic-worker.<subdomain>.workers.dev/api/validate-api-key
```

## R2 公开访问

图床 URL 需要桶可公开读（自定义域或 r2.dev）。在 R2 桶设置里打开 Public access，把自定义域写进 `wrangler.jsonc` 的 `vars.R2_PUBLIC_URL`，再 `pnpm run deploy`。

## GitHub Actions

Secrets：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。配置用仓库中的 `wrangler.jsonc`，不必再放一份 `WRANGLER_TOML`。

## 本地

```bash
pnpm dev   # http://localhost:5173
```

本地默认用模拟绑定。连线上资源需要 Wrangler 的 remote binding，见 [Workers 本地开发](https://developers.cloudflare.com/workers/local-development/)。
