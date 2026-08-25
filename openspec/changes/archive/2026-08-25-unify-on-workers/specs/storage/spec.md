## MODIFIED Requirements

### Requirement: Public URLs use R2_PUBLIC_URL

`urls.original` MUST be `R2_PUBLIC_URL` joined with the original key. Transform fallbacks MUST use `{R2_PUBLIC_URL origin}/cdn-cgi/image/{options}{pathname}` and MUST NOT use the Worker origin as the image host. AVIF transform width and height MUST NOT exceed 1200px on the long side.

#### Scenario: Absolute original URL

- **WHEN** an upload succeeds
- **THEN** `result.urls.original` starts with the configured R2 public origin

#### Scenario: Worker origin is not the image CDN

- **WHEN** a WebP or AVIF transform URL is returned
- **THEN** its host is the R2 public origin, not the Worker API host

### Requirement: Gallery thumbnails use discrete widths

UI thumbnail `/cdn-cgi/image` URLs MUST quantize requested width to 400, 800, or 1200 rather than arbitrary CSS pixel widths.

#### Scenario: Discrete width

- **WHEN** a gallery card requests a thumbnail
- **THEN** the transform URL width parameter is one of 400, 800, 1200
