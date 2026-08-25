# frontend Specification

## Purpose
Operator UI for uploading and managing images.
## Requirements
### Requirement: Upload page at `/`

The `/` route MUST provide image selection, optional ZIP upload, tag and expiry controls, compression settings, and an upload action that calls `POST /api/upload/single` per file with the stored API key.

#### Scenario: Upload requires API key

- **WHEN** no API key is stored
- **THEN** the user is prompted for a key before authenticated API calls succeed

### Requirement: Manage page at `/manage`

`/manage` MUST list images in a scrollable gallery, support format/orientation/tag filters, open image details, copy URLs, delete images, manage tags, and show a random-API link builder.

#### Scenario: Gallery loads with key

- **WHEN** a valid API key is present
- **THEN** the manage page requests `GET /api/images` and renders returned images

#### Scenario: Delete from gallery

- **WHEN** the user deletes an image
- **THEN** the card disappears without a full page reload

### Requirement: Theme persistence

The UI MUST support light and dark themes and persist the choice in `localStorage` key `theme`.

#### Scenario: Dark mode roundtrip

- **WHEN** the user enables dark mode and reloads
- **THEN** the document still has the dark class

