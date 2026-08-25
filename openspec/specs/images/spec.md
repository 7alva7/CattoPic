# images Specification

## Purpose
Authenticated image list, detail, metadata update, and delete.
## Requirements
### Requirement: Paginated image list

`GET /api/images` MUST be protected. It MUST return `{ success: true, images, page, limit, total, totalPages }`. `page` defaults to 1. `limit` defaults to 12 and MUST be clamped to 1..100. Optional `tag`, `orientation` (`landscape`|`portrait`), and `format` (`all`|`gif`|`webp`|`avif`|`original`) MUST filter the list. Expired images MUST NOT appear. List responses MUST be read from D1 (not a KV list cache). `format=webp` and `format=avif` MUST NOT treat a marker path equal to the original key as a stored variant.

#### Scenario: First page

- **WHEN** `GET /api/images` is called with a valid key and no query
- **THEN** `page` is 1, `images` is an array, and each item has `id` and `urls.original`

#### Scenario: Limit clamp

- **WHEN** `limit=999` is requested
- **THEN** the effective page size is at most 100

### Requirement: Image detail

`GET /api/images/:id` MUST reject non-UUID/non-image-id values. Missing or expired images MUST 404.

#### Scenario: Unknown id

- **WHEN** a well-formed id that does not exist is requested
- **THEN** the response is 404 with `success` false

### Requirement: Update tags and expiry

`PUT /api/images/:id` MAY accept `tags` (array, comma string, or null) and `expiryMinutes`. `expiryMinutes` 0 MUST clear expiry.

#### Scenario: Clear expiry

- **WHEN** `expiryMinutes` is 0
- **THEN** the returned image has no expiry time

### Requirement: Delete removes metadata immediately

`DELETE /api/images/:id` MUST remove the image from subsequent list/detail reads. R2 objects MUST be deleted either immediately or via a durable deletion job.

#### Scenario: Delete then list

- **WHEN** an image is deleted then listed
- **THEN** that id is absent from `images`

