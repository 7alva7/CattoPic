# CattoPic API 文档

[English](./API_EN.md)

## 概述

CattoPic 1.0 把管理界面和 API 放在同一个 Cloudflare Worker。浏览器打开 Worker 域名就是界面；HTTP 客户端调用同一域名下的 `/api/*`。

图片文件不经过 Worker。对象存在 R2，由 `R2_PUBLIC_URL` 对外提供。

### 基础信息

| 项目 | 说明 |
|------|------|
| API 基址 | Worker 域名。下文示例使用 `https://app.example.com` |
| 图片基址 | `wrangler.jsonc` 中的 `R2_PUBLIC_URL`。下文示例使用 `https://r2.example.com` |
| 认证方式 | Bearer Token（API Key） |
| 响应格式 | JSON（`GET /api/random` 成功时为 302） |
| 字符编码 | UTF-8 |

### 技术架构

- **界面**: Vite + React，作为 Worker Static Assets
- **API**: Hono，仅 `/api/*` 调用 Worker 脚本
- **数据库**: Cloudflare D1（SQLite）
- **存储**: Cloudflare R2（对象存储）
- **压缩**: Cloudflare Images binding（单文件 ≤20MB）

---

## 认证说明

除公开接口外，所有 API 请求需要在 Header 中携带 API Key：

```
Authorization: Bearer <your-api-key>
```

### 认证失败响应

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**HTTP 状态码**: `401`

---

## 公开接口

以下接口无需认证即可访问。

### 获取随机图像

获取一张随机图像，支持标签过滤和格式转换。

**请求**

```
GET /api/random
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `tags` | string | 否 | 逗号分隔的标签，图像必须包含所有标签 | `landscape,nature` |
| `exclude` | string | 否 | 逗号分隔的排除标签 | `blurry,test` |
| `orientation` | string | 否 | 方向: `landscape` / `portrait` / `auto` | `auto` |
| `format` | string | 否 | 格式: `original` / `webp` / `avif` | `webp` |

**响应**

- **成功**: 返回 302 重定向到实际图片 URL
  - `Location`: 最终图片 URL（R2 公网 URL 或 `/cdn-cgi/image/...` 转换 URL）
  - `Cache-Control`: `no-cache, no-store, must-revalidate`

- **失败** (无匹配图像):
```json
{
  "success": false,
  "error": "No images found matching criteria"
}
```

**curl 示例**

```bash
# 获取随机图像
curl -L "https://app.example.com/api/random"

# 获取带标签过滤的随机图像
curl -L "https://app.example.com/api/random?tags=nature,outdoor&orientation=landscape"

# 获取 WebP 格式
curl -L "https://app.example.com/api/random?format=webp" -o random.webp
```

**使用场景示例**

```bash
# 场景 1: 网站随机背景图（桌面端横向）
curl -L "https://app.example.com/api/random?orientation=landscape&format=webp"

# 场景 2: 手机壁纸 API（竖向）
curl -L "https://app.example.com/api/random?orientation=portrait&tags=wallpaper"

# 场景 3: 猫咪图片 API（排除 NSFW 内容）
curl -L "https://app.example.com/api/random?tags=cat&exclude=nsfw,private"

# 场景 4: 自然风景（多标签组合）
curl -L "https://app.example.com/api/random?tags=nature,landscape&exclude=city"

# 场景 5: 在 HTML img 标签中直接使用
# <img src="https://app.example.com/api/random?orientation=auto" />

# 场景 6: 自动方向检测（根据 User-Agent）
# 移动设备会返回竖向图片，桌面设备会返回横向图片
curl -L -A "Mozilla/5.0 (iPhone)" "https://app.example.com/api/random?orientation=auto"
```

---

### 图像文件（R2 公网）

Worker **没有** `GET /r2/{path}`。图片字节从 `R2_PUBLIC_URL` 直接读取。

**对象键**

| 变体 | 键 |
|------|-----|
| 原图 | `original/{orientation}/{id}.{ext}` |
| WebP | `{orientation}/webp/{id}.webp` |
| AVIF | `{orientation}/avif/{id}.avif` |

GIF 只保存原图。大于 20MB 的 JPEG/PNG 不会写入 WebP/AVIF 对象；接口返回的 `urls.webp` / `urls.avif` 可能是 `https://r2.example.com/cdn-cgi/image/...` 转换地址。

```bash
curl "https://r2.example.com/original/landscape/550e8400-e29b-41d4-a716-446655440000.jpg" -o image.jpg
```

`GET /api/random` 的 `Location` 指向这类 URL。需要跟着重定向下载文件时使用 `curl -L`。

---

## 图像管理接口

### 获取图像列表

分页获取所有图像，支持标签和方向过滤。

**请求**

```
GET /api/images
```

**请求头**

```
Authorization: Bearer <api-key>
```

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 页码 |
| `limit` | number | 12 | 每页数量 |
| `tag` | string | - | 按标签过滤 |
| `orientation` | string | - | `landscape` 或 `portrait` |
| `format` | string | `all` | `all` / `gif` / `webp` / `avif` / `original` |

**响应**

```json
{
  "success": true,
  "images": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "originalName": "photo.jpg",
      "uploadTime": "2024-12-08T10:30:00Z",
      "expiryTime": null,
      "orientation": "landscape",
      "tags": ["nature", "outdoor"],
      "format": "jpg",
      "width": 1920,
      "height": 1080,
      "paths": {
        "original": "original/landscape/550e8400-e29b-41d4-a716-446655440000.jpg",
        "webp": "landscape/webp/550e8400-e29b-41d4-a716-446655440000.webp",
        "avif": "landscape/avif/550e8400-e29b-41d4-a716-446655440000.avif"
      },
      "sizes": {
        "original": 245632,
        "webp": 156789,
        "avif": 134567
      },
      "urls": {
        "original": "https://r2.example.com/original/landscape/550e8400-e29b-41d4-a716-446655440000.jpg",
        "webp": "https://r2.example.com/landscape/webp/550e8400-e29b-41d4-a716-446655440000.webp",
        "avif": "https://r2.example.com/landscape/avif/550e8400-e29b-41d4-a716-446655440000.avif"
      }
    }
  ],
  "page": 1,
  "limit": 12,
  "total": 150,
  "totalPages": 13
}
```

**curl 示例**

```bash
# 获取第一页
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://app.example.com/api/images?page=1&limit=12"

# 按标签过滤
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://app.example.com/api/images?tag=nature&orientation=landscape"
```

---

### 获取图像详情

获取指定图像的详细信息。

**请求**

```
GET /api/images/{id}
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 图像 UUID |

**响应**

```json
{
  "success": true,
  "image": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "originalName": "photo.jpg",
    "uploadTime": "2024-12-08T10:30:00Z",
    "expiryTime": null,
    "orientation": "landscape",
    "tags": ["nature", "outdoor"],
    "format": "jpg",
    "width": 1920,
    "height": 1080,
    "paths": {
      "original": "original/landscape/550e8400-e29b-41d4-a716-446655440000.jpg",
      "webp": "landscape/webp/550e8400-e29b-41d4-a716-446655440000.webp",
      "avif": "landscape/avif/550e8400-e29b-41d4-a716-446655440000.avif"
    },
    "sizes": {
      "original": 245632,
      "webp": 156789,
      "avif": 134567
    },
    "urls": {
      "original": "https://r2.example.com/original/landscape/...",
      "webp": "https://r2.example.com/landscape/webp/...",
      "avif": "https://r2.example.com/landscape/avif/..."
    }
  }
}
```

**错误响应**

```json
{
  "success": false,
  "error": "Invalid image ID"
}
```

```json
{
  "success": false,
  "error": "Image not found"
}
```

**curl 示例**

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://app.example.com/api/images/550e8400-e29b-41d4-a716-446655440000"
```

---

### 更新图像元数据

更新图像的标签和过期时间。

**请求**

```
PUT /api/images/{id}
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 图像 UUID |

**请求体**

```json
{
  "tags": ["nature", "outdoor", "landscape"],
  "expiryMinutes": 1440
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `tags` | string[] \| string | 新的标签列表（数组或逗号分隔字符串） |
| `expiryMinutes` | number | 过期时间（分钟），`0` 表示移除过期时间 |

**响应**

```json
{
  "success": true,
  "image": {
    // 更新后的图像对象，格式同获取详情
  }
}
```

**curl 示例**

```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["nature", "outdoor"], "expiryMinutes": 1440}' \
  "https://app.example.com/api/images/550e8400-e29b-41d4-a716-446655440000"
```

---

### 删除图像

删除图像及其所有格式版本。

**请求**

```
DELETE /api/images/{id}
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 图像 UUID |

**响应**

```json
{
  "success": true,
  "message": "Image deleted"
}
```

**说明**

删除操作会：
1. 从 R2 删除所有格式版本（original, webp, avif）
2. 从数据库删除元数据记录
3. 自动清理关联的标签关系

**curl 示例**

```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_API_KEY" \
  "https://app.example.com/api/images/550e8400-e29b-41d4-a716-446655440000"
```

---

## 上传接口

### 上传图像（单文件）

每次请求上传 1 张图片；多图上传请并发多次请求（前端已使用并发上传实现）。

**请求**

```
POST /api/upload/single
```

**请求头**

```
Authorization: Bearer <api-key>
Content-Type: multipart/form-data
```

**请求体 (FormData)**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image`（或 `file`） | File | 是 | 单张图片文件，最大 70MB |
| `tags` | string | 否 | 逗号分隔的标签 |
| `expiryMinutes` | number | 否 | 过期时间（分钟），`0` 表示永不过期 |

**上传限制**

| 限制项 | 值 |
|--------|-----|
| 单文件大小 | 70MB |
| 支持格式 | jpeg, jpg, png, gif, webp, avif |

**响应**

```json
{
  "success": true,
  "result": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "success",
    "urls": {
      "original": "https://r2.example.com/original/landscape/550e8400-e29b-41d4-a716-446655440000.jpg",
      "webp": "https://r2.example.com/landscape/webp/550e8400-e29b-41d4-a716-446655440000.webp",
      "avif": "https://r2.example.com/landscape/avif/550e8400-e29b-41d4-a716-446655440000.avif"
    },
    "orientation": "landscape",
    "tags": ["nature", "outdoor"],
    "sizes": {
      "original": 245632,
      "webp": 156789,
      "avif": 134567
    },
    "expiryTime": "2024-12-15T10:30:00Z"
  }
}
```

**自动处理**

- 检测方向（`landscape` / `portrait`）
- JPEG/PNG 且 ≤20MB：写入 WebP 和 AVIF 对象
- 更大的 JPEG/PNG：只存原图，变体 URL 使用 `/cdn-cgi/image`
- GIF / 已是 WebP 或 AVIF：只存原图
- 按 `expiryMinutes` 计算过期时间

**curl 示例**

```bash
# 上传单个文件
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "image=@photo.jpg" \
  -F "tags=nature,outdoor" \
  "https://app.example.com/api/upload/single"
```

---

## 标签管理接口

### 获取所有标签

获取所有标签及其使用计数。

**请求**

```
GET /api/tags
```

**响应**

```json
{
  "success": true,
  "tags": [
    { "name": "nature", "count": 45 },
    { "name": "outdoor", "count": 32 },
    { "name": "landscape", "count": 28 },
    { "name": "portrait", "count": 15 }
  ]
}
```

**curl 示例**

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://app.example.com/api/tags"
```

---

### 创建新标签

创建一个新标签。

**请求**

```
POST /api/tags
```

**请求体**

```json
{
  "name": "mountain"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 标签名称（自动转小写，支持中文） |

**标签命名规则**

- 自动转换为小写
- 支持中文字符
- 允许连字符（-）和下划线（_）
- 最长 50 个字符
- 自动去除首尾空格

**响应**

```json
{
  "success": true,
  "tag": {
    "name": "mountain",
    "count": 0
  }
}
```

**curl 示例**

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "mountain"}' \
  "https://app.example.com/api/tags"
```

---

### 重命名标签

重命名标签，自动更新所有相关图像。

**请求**

```
PUT /api/tags/{name}
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | string | 原始标签名称（需 URL 编码） |

**请求体**

```json
{
  "newName": "mountains"
}
```

**响应**

```json
{
  "success": true,
  "tag": {
    "name": "mountains",
    "count": 12
  }
}
```

**错误响应**

```json
{
  "success": false,
  "error": "New name must be different from old name"
}
```

**curl 示例**

```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"newName": "mountains"}' \
  "https://app.example.com/api/tags/mountain"
```

---

### 删除标签

删除标签（仅移除标签，不删除图像）。

**请求**

```
DELETE /api/tags/{name}
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | string | 标签名称（需 URL 编码） |

**响应**

```json
{
  "success": true,
  "message": "Tag deleted",
  "affectedImages": 28
}
```

**curl 示例**

```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_API_KEY" \
  "https://app.example.com/api/tags/mountain"
```

---

### 批量更新标签

为多个图像批量添加或移除标签。

**请求**

```
POST /api/tags/batch
```

**请求体**

```json
{
  "imageIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001"
  ],
  "addTags": ["landscape", "nature"],
  "removeTags": ["test", "draft"]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `imageIds` | string[] | 图像 UUID 数组 |
| `addTags` | string[] | 要添加的标签数组 |
| `removeTags` | string[] | 要移除的标签数组 |

**响应**

```json
{
  "success": true,
  "updatedCount": 2
}
```

**curl 示例**

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "imageIds": ["550e8400-e29b-41d4-a716-446655440000"],
    "addTags": ["landscape"],
    "removeTags": ["draft"]
  }' \
  "https://app.example.com/api/tags/batch"
```

---

## 系统接口

### 验证 API Key

验证 API Key 是否有效。

**请求**

```
POST /api/validate-api-key
```

**请求头**

```
Authorization: Bearer <api-key>
```

**响应**

```json
{
  "success": true,
  "valid": true
}
```

**curl 示例**

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  "https://app.example.com/api/validate-api-key"
```

---

### 获取系统配置

获取系统配置信息（上传限制、支持格式等）。

**请求**

```
GET /api/config
```

**响应**

```json
{
  "success": true,
  "config": {
    "maxUploadCount": 50,
    "maxFileSize": 73400320,
    "supportedFormats": ["jpeg", "jpg", "png", "gif", "webp", "avif"],
    "imageQuality": 80
  }
}
```

| 字段 | 说明 |
|------|------|
| `maxUploadCount` | 单次上传最大文件数 |
| `maxFileSize` | 单文件最大大小（字节） |
| `supportedFormats` | 支持的图像格式列表 |
| `imageQuality` | 图像转换质量（1-100） |

**curl 示例**

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://app.example.com/api/config"
```

---

### 清理过期图像

删除所有已过期的图像。

**请求**

```
POST /api/cleanup
```

**响应**

```json
{
  "success": true,
  "deletedCount": 5
}
```

**说明**

清理操作会：
1. 查询所有过期图像（`expiry_time < 当前时间`）
2. 从 R2 删除所有格式版本
3. 从数据库删除元数据记录

**curl 示例**

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  "https://app.example.com/api/cleanup"
```

---

## 数据类型定义

### ImageMetadata

图像元数据对象。

```typescript
interface ImageMetadata {
  id: string;                           // UUID
  originalName: string;                 // 原始文件名
  uploadTime: string;                   // 上传时间 (ISO 8601)
  expiryTime?: string;                  // 过期时间 (ISO 8601)
  orientation: 'landscape' | 'portrait'; // 方向
  tags: string[];                       // 标签数组
  format: string;                       // 原始格式
  width: number;                        // 宽度（像素）
  height: number;                       // 高度（像素）
  paths: {
    original: string;                   // 原始文件 R2 路径
    webp: string;                       // WebP 格式 R2 路径
    avif: string;                       // AVIF 格式 R2 路径
  };
  sizes: {
    original: number;                   // 原始文件大小（字节）
    webp: number;                       // WebP 文件大小（字节）
    avif: number;                       // AVIF 文件大小（字节）
  };
  urls?: {
    original: string;                   // 原始文件 URL
    webp: string;                       // WebP URL
    avif: string;                       // AVIF URL
  };
}
```

### UploadResult

上传结果对象。

```typescript
interface UploadResult {
  id: string;                           // 上传成功时的图像 ID
  status: 'success' | 'error';          // 状态
  urls?: {
    original: string;
    webp: string;
    avif: string;
  };
  orientation?: 'landscape' | 'portrait';
  tags?: string[];
  sizes?: {
    original: number;
    webp: number;
    avif: number;
  };
  expiryTime?: string;
  error?: string;                       // 错误时的错误信息
}
```

### Tag

标签对象。

```typescript
interface Tag {
  name: string;   // 标签名称
  count: number;  // 使用该标签的图像数量
}
```

### ApiResponse

通用 API 响应格式。

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## 错误处理

### HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 302 | `/api/random` 重定向到图片 URL |
| 400 | 请求格式错误 |
| 401 | 未授权（缺少或无效的 API Key） |
| 404 | 资源不存在 |
| 413 | 文件过大或批量操作超限 |
| 500 | 服务器内部错误 |

### 错误响应格式

所有错误响应遵循统一格式：

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

### 常见错误

| 错误信息 | 说明 |
|----------|------|
| `Unauthorized` | API Key 无效或缺失 |
| `无效的图片ID` | 图像 ID 不是合法 UUID |
| `图片不存在` | 图像不存在 |
| `No images found matching criteria` | 没有符合条件的图像 |
| `File too large. Maximum size is 70MB` | 单文件超过 70MB |
| `No file provided` | 未提供 `image` 或 `file` 字段 |
| `标签名称不能为空` | 标签名称为空 |
| `新名称不能与旧名称相同` | 新标签名与旧名相同 |

---

## CORS 配置

管理界面与 API 同源，浏览器不必跨域。`/api/*` 仍开启 CORS，供外部脚本调用：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

---

## 附录

### 接口一览表

| 接口 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/random` | GET | 否 | 获取随机图像 |
| `R2_PUBLIC_URL` 对象 | GET | 否 | 直接读图片文件（不经 Worker） |
| `/api/images` | GET | 是 | 获取图像列表 |
| `/api/images/:id` | GET | 是 | 获取图像详情 |
| `/api/images/:id` | PUT | 是 | 更新图像元数据 |
| `/api/images/:id` | DELETE | 是 | 删除图像 |
| `/api/upload/single` | POST | 是 | 上传图像 |
| `/api/tags` | GET | 是 | 获取所有标签 |
| `/api/tags` | POST | 是 | 创建新标签 |
| `/api/tags/:name` | PUT | 是 | 重命名标签 |
| `/api/tags/:name` | DELETE | 是 | 删除标签 |
| `/api/tags/batch` | POST | 是 | 批量更新标签 |
| `/api/validate-api-key` | POST | 是 | 验证 API Key |
| `/api/config` | GET | 是 | 获取系统配置 |
| `/api/cleanup` | POST | 是 | 清理过期图像 |

### 前端请求示例 (JavaScript)

```javascript
// 管理界面与 API 同源时用相对路径即可。外部脚本把 API_URL 换成 Worker 域名。
const API_URL = '';
const API_KEY = 'your-api-key';

// 获取图像列表
async function getImages(page = 1, limit = 12) {
  const response = await fetch(`${API_URL}/api/images?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  return response.json();
}

// 上传图像（每次一张；字段名 `image` 或 `file`）
async function uploadImage(file, tags = []) {
  const formData = new FormData();
  formData.append('image', file);
  if (tags.length > 0) {
    formData.append('tags', tags.join(','));
  }

  const response = await fetch(`${API_URL}/api/upload/single`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    },
    body: formData
  });
  return response.json();
}

// 删除图像
async function deleteImage(id) {
  const response = await fetch(`${API_URL}/api/images/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  return response.json();
}
```
