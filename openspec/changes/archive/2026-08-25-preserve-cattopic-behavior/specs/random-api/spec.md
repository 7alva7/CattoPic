## Purpose

Unauthenticated random image selection used as a 302 URL, including from `<img src>`.

## ADDED Requirements

### Requirement: Random image redirects to a file URL

`GET /api/random` MUST return HTTP 302 with a `Location` header pointing at an R2 public URL or a `/cdn-cgi/image/...` URL on that public origin. The Worker MUST NOT proxy image bytes. `Cache-Control` MUST be `no-cache, no-store, must-revalidate`.

#### Scenario: Successful selection

- **WHEN** at least one non-expired image matches the filters
- **THEN** the response status is 302 and `Location` is an absolute HTTP(S) URL

#### Scenario: No match

- **WHEN** no image matches the filters
- **THEN** the response is a JSON error with `success` false and HTTP 404

### Requirement: Orientation defaults to auto from User-Agent

Omitted or `auto` `orientation` MUST select portrait for mobile User-Agents and landscape otherwise. Explicit `landscape` or `portrait` MUST be honored.

#### Scenario: Mobile auto

- **WHEN** `GET /api/random` is called with an iPhone User-Agent and no orientation
- **THEN** the selected image orientation is portrait when such an image exists

#### Scenario: Explicit landscape

- **WHEN** `GET /api/random?orientation=landscape` is called
- **THEN** the selected image orientation is landscape when such an image exists

### Requirement: Tag include and exclude filters

`tags` is comma-separated AND. `exclude` removes images that have any listed tag.

#### Scenario: Include tags

- **WHEN** `tags=cat,outdoor` is provided
- **THEN** the selected image has both tags

### Requirement: Format selection

GIF MUST always redirect to the original. For other formats, `format=original|webp|avif` MUST pick that variant when present, otherwise original. Omitted format MAY use Accept to pick avif, webp, or original.

#### Scenario: GIF original

- **WHEN** the selected image format is gif
- **THEN** `Location` is the original file URL
