# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CattoPic is an image hosting service. A single Cloudflare Worker serves a React SPA (Static Assets) and a Hono API. R2 stores files, D1 stores metadata, KV is optional cache, Images binding compresses uploads ≤20MB.

**Package manager: pnpm only.**

Behavior changes go through OpenSpec (`openspec/`).

## Commands

```bash
pnpm install
pnpm dev          # Vite + workerd at localhost:5173
pnpm build        # SPA + worker
pnpm deploy       # wrangler deploy
pnpm typecheck
pnpm test
pnpm wrangler d1 migrations apply <database> --remote
```

## Architecture

```
├── src/react-app/          # Vite React SPA (`/`, `/manage`)
├── src/worker/             # Hono API, cron, optional queue
│   └── migrations/         # D1 migrations
├── public/static/          # favicons
├── wrangler.jsonc          # Worker + Static Assets
└── openspec/               # behavior specs
```

`assets.run_worker_first` is `["/api/*"]` only. HTML/JS/CSS must not invoke the Worker.

## Environment

Copy `wrangler.example.jsonc` to `wrangler.jsonc` and fill R2/D1/KV ids. `R2_PUBLIC_URL` is the image CDN, not the Worker origin.

## Changelog

Functional changes must update both:

- `CHANGELOG.md` (English)
- `CHANGELOG_CN.md` (中文)

Keep a Changelog sections: Added, Changed, Deprecated, Removed, Fixed, Security.
