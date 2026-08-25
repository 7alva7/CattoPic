# tags Specification

## Purpose
Authenticated tag catalog and image-tag association.
## Requirements
### Requirement: List tags

`GET /api/tags` MUST return `{ success: true, tags: [{ name, count }] }`. Counts MUST exclude expired images.

#### Scenario: Empty catalog

- **WHEN** no tags exist
- **THEN** `tags` is an empty array and `success` is true

### Requirement: Create and rename

`POST /api/tags` with `{ name }` MUST create a sanitized tag. `PUT /api/tags/:name` with `{ newName }` MUST rename. Empty names MUST be rejected.

#### Scenario: Create tag

- **WHEN** `{ "name": "nature" }` is posted
- **THEN** a later list includes `nature`

### Requirement: Delete tag deletes associated images

`DELETE /api/tags/:name` MUST delete the tag and associated image metadata, and MUST schedule R2 cleanup for those images.

#### Scenario: Delete tagged images

- **WHEN** a tag with associated images is deleted
- **THEN** those images no longer appear in `GET /api/images`

### Requirement: Batch tag updates

`POST /api/tags/batch` MUST accept `imageIds`, optional `addTags`, optional `removeTags`. Image ids MUST be valid. At most 500 image ids and 50 add/remove tags per request.

#### Scenario: Add tag to images

- **WHEN** batch add is called with valid ids and a tag name
- **THEN** `updatedCount` is returned and those images include the tag

