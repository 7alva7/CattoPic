## Why

CattoPic is about to merge the Next.js frontend and Hono Worker onto one Cloudflare Worker. Without a written behavior freeze, the merge will silently change auth, upload, random-image, or storage contracts.

## What Changes

- Capture the current public and authenticated HTTP behavior as OpenSpec capabilities.
- Capture the current operator UI surfaces (`/` upload and `/manage` gallery).
- No product code changes in this change.

## Capabilities

### New Capabilities

- `auth`: Bearer API keys, public vs protected routes, 401 body
- `upload`: single-file upload, size/format/compression, tags and expiry
- `images`: list/detail/update/delete and expiry hiding
- `random-api`: unauthenticated random image 302
- `tags`: tag CRUD, delete-with-images, batch update
- `storage`: R2 key scheme and URL construction
- `frontend`: upload page, manage gallery, tag manager, random-API helper, API key, theme

### Modified Capabilities

- (none; this change only adds freeze specs)

## Impact

Planning only. Source of truth for later `unify-on-workers`. Code paths referenced: `worker/src/index.ts`, handlers, `app/page.tsx`, `app/manage/page.tsx`.
