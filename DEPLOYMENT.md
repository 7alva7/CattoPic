# ImageFlow 部署指南

## 项目架构

```
┌─────────────────────┐         ┌─────────────────────────────────┐
│                     │         │          Cloudflare             │
│   Vercel            │         │                                 │
│   ┌─────────────┐   │  HTTPS  │   ┌─────────────┐               │
│   │  Next.js    │   │ ──────► │   │   Worker    │               │
│   │  Frontend   │   │         │   │   (Hono)    │               │
│   └─────────────┘   │         │   └──────┬──────┘               │
│                     │         │          │                      │
└─────────────────────┘         │    ┌─────┴─────┐                │
                                │    │           │                │
                                │ ┌──▼───┐   ┌───▼──┐             │
                                │ │  R2  │   │  KV  │             │
                                │ │Bucket│   │Store │             │
                                │ └──────┘   └──────┘             │
                                └─────────────────────────────────┘
```

| 组件 | 平台 | 用途 |
|------|------|------|
| Frontend | Vercel | Next.js 16 前端应用 |
| API | Cloudflare Worker | 后端 API 服务 (Hono) |
| Storage | Cloudflare R2 | 图片文件存储 |
| Database | Cloudflare KV | 元数据和 API Key 存储 |

---

## 前置条件

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) 包管理器
- [Cloudflare 账户](https://dash.cloudflare.com/)
- [Vercel 账户](https://vercel.com/)
- [GitHub 账户](https://github.com/)（用于 Vercel 部署）

---

## 一、Cloudflare 资源配置

### 1.1 登录 Wrangler CLI

```bash
cd worker
pnpm install
pnpm wrangler login
```

### 1.2 创建 R2 Bucket

```bash
pnpm wrangler r2 bucket create imageflow-bucket
```

### 1.3 创建 KV Namespace

```bash
# 生产环境
pnpm wrangler kv namespace create KV
# 记录返回的 id，例如:

# 预览环境
pnpm wrangler kv namespace create KV --preview
# 记录返回的 preview_id
```

### 1.4 配置 wrangler.toml

编辑 `worker/wrangler.toml`，填入上一步获取的 ID：

```toml
name = "imageflow-worker"
main = "src/index.ts"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[vars]
ENVIRONMENT = "production"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "imageflow-bucket"

[[kv_namespaces]]
binding = "KV"
id = "<your-kv-namespace-id>"
preview_id = "<your-kv-preview-namespace-id>"
```

---

## 二、Cloudflare Worker 部署

### 2.1 部署 Worker

```bash
cd worker
pnpm wrangler deploy
```

部署成功后输出示例：
```
Uploaded imageflow-worker (9.79 sec)
Deployed imageflow-worker triggers (4.67 sec)
  https://imageflow-worker.<your-subdomain>.workers.dev
```

### 2.2 添加 API Key

**重要**：API Key 必须以 JSON 数组格式存储在 `api_keys` 键中。

```bash
# 单个 API Key
pnpm wrangler kv key put \
  --namespace-id=<your-kv-namespace-id> \
  "api_keys" '["your-api-key"]' \
  --remote

# 多个 API Key
pnpm wrangler kv key put \
  --namespace-id=<your-kv-namespace-id> \
  "api_keys" '["key1", "key2", "key3"]' \
  --remote
```

### 2.3 验证部署

```bash
# 测试认证
curl -H "Authorization: Bearer your-api-key" \
  https://imageflow-worker.<your-subdomain>.workers.dev/api/images

# 预期返回
{"success":true,"images":[],"page":1,"limit":12,"total":0,"totalPages":0}
```

### 2.4 （可选）绑定自定义域名

1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → imageflow-worker
3. Settings → Triggers → Custom Domains
4. 添加域名，如 `api.yourdomain.com`

---

## 三、Vercel 部署

### 3.1 推送代码到 GitHub

```bash
# 在项目根目录
git init
git add .
git commit -m "Initial commit: ImageFlow project"
git branch -M main
git remote add origin https://github.com/<username>/imageflow-nextjs.git
git push -u origin main
```

### 3.2 在 Vercel 创建项目

1. 访问 [vercel.com/new](https://vercel.com/new)
2. 点击 "Import Git Repository"
3. 选择 `imageflow-nextjs` 仓库
4. Framework Preset 选择 `Next.js`

### 3.3 配置环境变量

在 Vercel 项目设置中添加环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_WORKER_URL` | `https://imageflow-worker.xxx.workers.dev` | Worker API 地址 |

### 3.4 部署

点击 "Deploy" 按钮，等待部署完成。

部署成功后获得地址：`https://your-project.vercel.app`

---

## 四、本地开发

### 4.1 启动 Worker（本地）

```bash
cd worker
pnpm dev
# 运行在 http://localhost:8787
```

### 4.2 启动前端（本地）

```bash
# 项目根目录
pnpm dev
# 运行在 http://localhost:3000
```

### 4.3 本地环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_WORKER_URL=http://localhost:8787
```

---

## 五、API 参考

### 认证方式

所有受保护的 API 需要在请求头中添加：

```
Authorization: Bearer <your-api-key>
```

### API 端点

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/random` | ❌ | 随机获取图片 |
| GET | `/r2/*` | ❌ | 访问图片文件 |
| POST | `/api/validate-api-key` | ✅ | 验证 API Key |
| POST | `/api/upload` | ✅ | 上传图片 |
| GET | `/api/images` | ✅ | 获取图片列表 |
| GET | `/api/images/:id` | ✅ | 获取图片详情 |
| PUT | `/api/images/:id` | ✅ | 更新图片信息 |
| DELETE | `/api/images/:id` | ✅ | 删除图片 |
| GET | `/api/tags` | ✅ | 获取标签列表 |
| POST | `/api/tags` | ✅ | 创建标签 |
| PUT | `/api/tags/:name` | ✅ | 重命名标签 |
| DELETE | `/api/tags/:name` | ✅ | 删除标签 |

---

## 六、常见问题

### Q1: 401 Unauthorized 错误

**原因**：API Key 格式不正确

**解决方案**：确保 KV 中 `api_keys` 是 JSON 数组格式：

```bash
pnpm wrangler kv key put \
  --namespace-id=<id> \
  "api_keys" '["your-api-key"]' \
  --remote
```

### Q2: CORS 错误

**原因**：跨域请求被阻止

**解决方案**：Worker 默认允许所有来源。如需限制，修改 `worker/src/index.ts`：

```typescript
app.use('*', cors({
  origin: ['https://your-domain.vercel.app'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

然后重新部署：`pnpm wrangler deploy`

### Q3: 图片上传失败

**检查项**：
1. R2 Bucket 是否正确绑定
2. 文件大小是否超过限制（Worker 默认 100MB）
3. API Key 是否有效

### Q4: 如何添加新的 API Key

```bash
# 先获取现有 keys
pnpm wrangler kv key get \
  --namespace-id=<id> \
  "api_keys" --remote

# 添加新 key 到数组
pnpm wrangler kv key put \
  --namespace-id=<id> \
  "api_keys" '["old-key", "new-key"]' \
  --remote
```

---

## 七、部署检查清单

- [ ] Cloudflare R2 Bucket 已创建
- [ ] Cloudflare KV Namespace 已创建
- [ ] wrangler.toml 配置正确
- [ ] Worker 已部署
- [ ] API Key 已添加（JSON 数组格式）
- [ ] 代码已推送到 GitHub
- [ ] Vercel 项目已创建
- [ ] Vercel 环境变量已配置
- [ ] 部署验证通过

---

## 八、项目地址示例

| 资源 | 地址 |
|------|------|
| 前端 | https://your-project.vercel.app |
| API | https://imageflow-worker.your-subdomain.workers.dev |
| 随机图片 API | https://imageflow-worker.your-subdomain.workers.dev/api/random |

---

## 更新部署

### 更新 Worker

```bash
cd worker
pnpm wrangler deploy
```

### 更新前端

推送代码到 GitHub，Vercel 会自动部署：

```bash
git add .
git commit -m "Update: description"
git push
```
