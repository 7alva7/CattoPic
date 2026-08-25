## Purpose

API key authentication for CattoPic HTTP APIs.

## ADDED Requirements

### Requirement: Bearer authentication for protected routes

Protected routes MUST require `Authorization: Bearer <api-key>` where the key exists in the `api_keys` table. Missing or invalid keys MUST return HTTP 401 with JSON `{ "success": false, "error": "Unauthorized" }`.

#### Scenario: Missing header

- **WHEN** a client calls `GET /api/images` with no Authorization header
- **THEN** the response status is 401 and the body has `success` false and `error` `Unauthorized`

#### Scenario: Invalid key

- **WHEN** a client calls `GET /api/images` with `Authorization: Bearer not-a-real-key`
- **THEN** the response status is 401 and the body has `success` false

### Requirement: Public routes skip authentication

`GET /api/random` MUST be callable without an API key.

#### Scenario: Random without key

- **WHEN** a client calls `GET /api/random` with no Authorization header
- **THEN** the Worker MUST NOT return 401 for authentication failure

### Requirement: API key validation endpoint

`POST /api/validate-api-key` MUST be a protected route. A valid key MUST yield `{ "success": true, "valid": true }`.

#### Scenario: Valid key

- **WHEN** a client POSTs `/api/validate-api-key` with a stored Bearer key
- **THEN** the response is 200 and `valid` is true
