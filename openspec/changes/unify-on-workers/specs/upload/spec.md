## MODIFIED Requirements

### Requirement: Maximum upload size is 70MB

Files larger than 70,154,752 bytes MUST be rejected with HTTP 413. Files at or under 70MB MUST be accepted without requiring the Worker isolate to hold original plus WebP plus AVIF copies of a 70MB body.

#### Scenario: Oversized file

- **WHEN** Content-Length or file size exceeds 70MB
- **THEN** the status is 413

#### Scenario: Large original stored

- **WHEN** a JPEG between 20MB and 70MB is uploaded
- **THEN** the original is stored on R2 and the response is success without Images-binding compression

### Requirement: Images binding only for files 20MB and under

In-Worker Images binding compression MUST run only when file size is ≤ 20,971,520 bytes and the IMAGES binding is present. Larger still images MUST use original storage plus transform-URL markers for WebP/AVIF when requested.

#### Scenario: Small JPEG compressed

- **WHEN** a JPEG under 20MB is uploaded with WebP and AVIF requested
- **THEN** the response includes webp and avif URLs (stored or transform)

#### Scenario: Over binding limit

- **WHEN** a 25MB JPEG is uploaded
- **THEN** the Worker MUST NOT call Images binding compression
