## MODIFIED Requirements

### Requirement: Random image redirects to a file URL

`GET /api/random` MUST return HTTP 302 with a `Location` header pointing at an R2 public URL or a `/cdn-cgi/image/...` URL on that public origin. The Worker MUST NOT proxy image bytes. `Cache-Control` MUST be `no-cache, no-store, must-revalidate`. Browser navigation to `/api/random` MUST invoke the Worker, not the SPA `index.html`.

#### Scenario: Successful selection

- **WHEN** at least one non-expired image matches the filters
- **THEN** the response status is 302 and `Location` is an absolute HTTP(S) URL

#### Scenario: Address bar is not the SPA

- **WHEN** a browser navigates to `/api/random`
- **THEN** the response is 302 or JSON 404, never `text/html` for the SPA shell

#### Scenario: No match

- **WHEN** no image matches the filters
- **THEN** the response is a JSON error with `success` false and HTTP 404
