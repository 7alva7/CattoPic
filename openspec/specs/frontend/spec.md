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

### Requirement: Gallery thumbnails

Manage gallery cards MUST request `/cdn-cgi/image` thumbnails from the original object URL (not a stored WebP object). Widths MUST be only 400, 800, or 1200. GIF cards MUST use the original object without transformation. Opening a card MUST show the image in a dialog, using a transformed preview (1200px max) rather than an uncapped original.

#### Scenario: Thumbnail uses original source

- **WHEN** a JPEG is listed in the gallery
- **THEN** the card image URL is a `/cdn-cgi/image` URL whose source path is the original object

#### Scenario: Dialog shows a picture

- **WHEN** the user opens an image from the gallery
- **THEN** the dialog displays the image

### Requirement: Theme persistence

The UI MUST support light and dark themes and persist the choice in `localStorage` key `theme`.

#### Scenario: Dark mode roundtrip

- **WHEN** the user enables dark mode and reloads
- **THEN** the document still has the dark class

