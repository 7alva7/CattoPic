# 更新日志

此项目的所有重要更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [未发布]

### 修复

- GitHub Actions 和文档改为 `pnpm run deploy`。直接写 `pnpm deploy` 会走 pnpm 的 workspace 发布命令，报 `ERR_PNPM_CANNOT_DEPLOY`。

## [1.0.0] - 2026-08-25

单 Worker 应用的首个版本。管理界面和 API 共用一个域名。图片字节仍由 `R2_PUBLIC_URL` 提供。

### 新增

- **OpenSpec** — 在 `openspec/` 下冻结现有行为（`preserve-cattopic-behavior` 已归档），并用 `unify-on-workers` 跟踪合并。
- **同域 Worker SPA** — 管理界面作为 Cloudflare Static Assets 与 Hono API 部署在同一个 Worker。`GET /` 与 `GET /manage` 不调用 Worker 脚本。
- **持久化 R2 删除任务** — D1 `deletion_jobs` 表：元数据可以立即删除，R2 清理失败后由 Queue、Cron 或 `POST /api/cleanup` 重试。
- **Cloudflare Queues 可选** — 在 `wrangler.jsonc` 中设置 `USE_QUEUE` 为 `"true"` 使用异步删除，为 `"false"` 则同步删除。
- **ZIP 批量上传** — 浏览器用 JSZip 解压，每批 50 张，统一标签，跳过非图片和超过 70MB 的文件。

### 变更

- 用 Vite + React Router + `@cloudflare/vite-plugin` 替换 Next.js / Vercel。本地与生产均为一条 `pnpm dev` / `pnpm run deploy`。
- 界面请求相对路径 `/api/*`。Worker 域名即界面 origin。图片文件仍走 `R2_PUBLIC_URL`。
- `wrangler.jsonc` 绑定生产资源：R2 `cattopic`、D1 `CattoPic-D1`、KV `cattopic-kv`、Queue `cattopic-delete-queue`、Images `IMAGES`。`USE_QUEUE` 为 `"true"`。
- 配置改为 `wrangler.jsonc`，`run_worker_first: ["/api/*"]`。`compatibility_date` 为 `2026-08-25`。
- Images binding 压缩仅用于 ≤20MB 文件（官方 `.input()` 上限）。对外上传上限仍为 70MB。
- AVIF 长边限制为 1200px（Cloudflare Images 限额）。
- 图库缩略图 `/cdn-cgi/image` 宽度量化为 400/800/1200，控制 unique transformation。
- 去掉 KV prefix list+delete 失效。图库以 D1 为准。
- 生产日志采样 5%。
- 过期图片清理会写入持久化 R2 删除任务，并由 Cron / 手动清理重试。
- `/api/random` 改为 302 重定向到实际图片 URL，不再由 Worker 代理图片字节。
- `/api/images` 增加 `format` 筛选：`all|gif|webp|avif|original`。
- 管理页单页 60 张；默认 `maxUploadCount` 为 50；上传并发为 5。
- 管理页瀑布流和上传侧边栏使用 TanStack Virtual。
- UI 列表使用 `/cdn-cgi/image/width=...` 请求缩略图。
- Transform-URL 参数按配置输出（不再附加额外参数；未设置最大尺寸时不强制 AVIF 缩放）。
- GitHub Actions 使用 pnpm 10.24.0 和 Node.js 24；Secrets 仅为 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID`。

### 移除

- Next.js App Router 前端、Vercel 部署、`NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WORKER_URL`，以及未鉴权的 Next `/api/config` 发现接口。
- 独立的 `worker/` 包（`worker/package.json`、`worker/wrangler.toml`）。
- 文档中的 `GET /r2/*` Worker 图片反代（代码里从未实现）。图片字节从 `R2_PUBLIC_URL` 读取。

### 修复

- `PUT /api/images/:id` 中 `expiryMinutes: 0` 无法清除过期时间。
- 定时清理真正删除前，列表、详情、随机图和标签计数都会隐藏已过期图片。
- 批量改标签、删除标签和过期清理后 image detail 缓存可能返回旧数据。
- 批量标签更新增加数量上限和 D1 分片，避免 SQL 变量数/语句长度限制。
- API Key 的 `last_used_at` 仅在校验时更新，不再把每个受保护读请求都变成 D1 写入。
- WebP / AVIF 方向检测读取实际尺寸，不再默认 1920×1080。
- 删除图片后上传页/管理页无需强刷即可消失。
- 随机图链接生成器使用当前 origin（同域 Worker），不再输出 `https://your-worker.workers.dev`。
- `/api/images` 分页参数有边界；标签更新会清洗/归一化。
- 管理页在未提供 API Key 时不再请求受保护接口。
- 管理页虚拟瀑布流在生产构建中的 React #301 无限重渲染。
- `/favicon.ico` 重定向到 `/static/favicon.ico`。
- 未设置 API Key 时不再发送 `Authorization: Bearer null`。
- 重命名/删除标签时校验路由参数。
- 上传接口接受 `image` 或 `file` 字段名。
- 处理器在调用元数据/缓存服务前校验缺失或格式错误的图片/标签路由参数。

### 安全

- 更新存在安全风险的传递依赖 lockfile 条目：`ajv`、`brace-expansion`、`flatted`、`minimatch`、`picomatch`、`postcss` 以及 Worker 侧的 `undici`。
- 收紧标签管理接口的标签清洗规则。

[未发布]: https://github.com/Yuri-NagaSaki/CattoPic/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Yuri-NagaSaki/CattoPic/releases/tag/v1.0.0
