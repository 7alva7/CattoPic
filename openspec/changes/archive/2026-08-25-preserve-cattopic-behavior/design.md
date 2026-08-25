## Context

Brownfield freeze. Specs describe today's Worker + Next.js app. Implementation of the later merge lives in `unify-on-workers`.

## Goals / Non-Goals

Goals:
- Requirements a tester can check with curl or the UI without reading source
- Match actual code, not outdated `docs/API.md` examples (R2 keys are `original/{orientation}/...`, not `images/...`)

Non-Goals:
- Rewriting the app
- Inventing `/r2/*` Worker proxy (docs mention it; code does not)

## Decisions

- Spec the code, not the docs, when they disagree.
- Error strings may be Chinese or English as in current handlers; freeze the HTTP status and `success` flag, not every localized sentence, except 401 `Unauthorized`.

## Risks / Trade-offs

Freeze specs will be archived into `openspec/specs/` and then modified by the merge change. If freeze is wrong, the merge will "preserve" the wrong contract.

## Migration Plan

None.

## Open Questions

None.
