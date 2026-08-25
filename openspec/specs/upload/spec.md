# upload Specification

## Purpose
Authenticated single-file image upload used by the UI concurrent uploader and ZIP flow.
## Requirements
### Requirement: Single file upload endpoint

`POST /api/upload/single` MUST be protected. The file part MUST be named `image` or `file`. Success JSON MUST include `success` true and a `result` object with `id`, `status` `success`, and `urls.original`.

#### Scenario: JPEG upload

- **WHEN** a valid JPEG under the size limit is posted with a valid API key
- **THEN** the response is success and `result.urls.original` is an absolute URL

#### Scenario: Missing file

- **WHEN** the multipart body has no `image` or `file` part
- **THEN** the response is a JSON error with `success` false

### Requirement: Maximum upload size is 70MB

Files larger than 70,154,752 bytes MUST be rejected with HTTP 413.

#### Scenario: Oversized file

- **WHEN** Content-Length or file size exceeds 70MB
- **THEN** the status is 413

### Requirement: Supported formats

jpeg, jpg, png, gif, webp, and avif MUST be accepted. Other formats MUST be rejected.

#### Scenario: Unsupported format

- **WHEN** a non-image file is uploaded
- **THEN** the response is a JSON error

### Requirement: Default stored variant is WebP

JPEG and PNG files at or under 20MB MUST store a WebP object when `generateWebp` is not false. AVIF objects MUST be stored only when `generateAvif` is true. Otherwise `paths.avif` MAY equal the original path so `urls.avif` is a `/cdn-cgi/image` URL with AVIF long side at most 1200px.

#### Scenario: Default JPEG upload

- **WHEN** a JPEG under 20MB is posted without `generateAvif=true`
- **THEN** a WebP object is stored and `urls.avif` is a transform URL or omitted stored avif object

### Requirement: Large files are not Images-binding compressed

Files larger than 20MB MUST be stored as the original object without `IMAGES.input()`. Variant URLs MUST use `/cdn-cgi/image` markers. The handler MUST NOT call `arrayBuffer()` on the full file body for those uploads.

#### Scenario: 40MB JPEG

- **WHEN** a 40MB JPEG is uploaded
- **THEN** the original is stored on R2 and WebP/AVIF URLs are transform URLs

### Requirement: GIF is original-only

GIF uploads MUST store only the original object. WebP and AVIF URLs for GIFs MUST be empty.

#### Scenario: GIF upload

- **WHEN** a GIF is uploaded
- **THEN** `result.format` is `gif` and `result.urls.webp` and `result.urls.avif` are empty strings or omitted

### Requirement: Tags and expiry

`tags` is a comma-separated string. `expiryMinutes` > 0 MUST set `expiryTime`. `0` or omitted MUST leave the image non-expiring.

#### Scenario: Tags applied

- **WHEN** `tags=cat,nature` is posted
- **THEN** the stored image has those tags (sanitized)

