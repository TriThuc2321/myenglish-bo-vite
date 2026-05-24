# API Contract — Level Module

> Changes introduced by the `level` module branch.
> Base URL: `/api` (or as configured). All endpoints require a valid JWT (`Authorization: Bearer <token>`).

---

## Common types

### `AuditMetadata`

```json
{
  "createdAt": "2026-05-24T07:00:00.000Z",
  "createdById": "uuid",
  "createdBy": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "avatar": "string | null"
  },
  "updatedAt": "2026-05-24T07:00:00.000Z",
  "updatedById": "uuid | null",
  "updatedBy": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "avatar": "string | null"
  }
}
```

`createdBy` / `updatedBy` are omitted when the corresponding `*ById` is `null`.

### `LevelSummary` (embedded inside Program responses)

```json
{
  "id": "uuid",
  "code": "STARTERS",
  "name": "Starters",
  "displayOrder": 0,
  "ageMin": 6,
  "ageMax": 10,
  "status": "ACTIVE"
}
```

### `Level` (full, returned by Level endpoints)

```json
{
  "id": "uuid",
  "programId": "uuid",
  "program": { "id": "uuid", "code": "CAMBRIDGE", "name": "Cambridge" },
  "code": "STARTERS",
  "name": "Starters",
  "displayOrder": 0,
  "ageMin": 6,
  "ageMax": 10,
  "status": "ACTIVE",
  "auditMetadata": { ...AuditMetadata }
}
```

### `Pagination<T>`

```json
{
  "data": [ ...T ],
  "meta": { "page": 1, "take": 10, "totalCount": 42 }
}
```

---

## Level endpoints

### `GET /levels`

List levels with pagination and optional filters.

**Permission required:** `read:level`

**Query parameters**

| Field       | Type   | Required | Default | Description                              |
| ----------- | ------ | -------- | ------- | ---------------------------------------- |
| `page`      | int    | No       | `1`     | Page number (min: 1)                     |
| `take`      | int    | No       | `10`    | Items per page (min: 1, max: 1000)       |
| `keyword`   | string | No       | —       | Case-insensitive match on code or name   |
| `programId` | uuid   | No       | —       | Filter by program                        |
| `status`    | enum   | No       | —       | `ACTIVE` \| `INACTIVE` (never `DELETED`) |

**Response `200`**

```json
{
  "data": [ ...Level ],
  "meta": { "page": 1, "take": 10, "totalCount": 5 }
}
```

Ordered by `program_id ASC, display_order ASC, created_at DESC`. Soft-deleted levels are always excluded.

---

### `GET /levels/:id`

Get a single level by UUID.

**Permission required:** `read:level`

**Path parameters**

| Field | Type | Description |
| ----- | ---- | ----------- |
| `id`  | uuid | Level UUID  |

**Response `200`** — `Level`

**Response `404`**

```json
{ "statusCode": 404, "message": "Level with ID <id> not found" }
```

---

### `POST /levels`

Create a level.

**Permission required:** `create:level`

**Request body**

```json
{
  "programId": "uuid", // required
  "code": "STARTERS", // required, max 50 chars, unique per program
  "name": "Starters", // required, max 255 chars
  "displayOrder": 0, // optional, int >= 0, default 0
  "ageMin": 6, // optional, int >= 0
  "ageMax": 10, // optional, int >= 0
  "status": "ACTIVE" // optional, ACTIVE | INACTIVE, default ACTIVE
}
```

**Response `201`** — `Level`

**Response `409`**

```json
{
  "statusCode": 409,
  "message": "Level with code \"STARTERS\" already exists in this program"
}
```

---

### `PATCH /levels/:id`

Partially update a level. All fields are optional; only provided fields are changed.

**Permission required:** `update:level`

**Path parameters**

| Field | Type | Description |
| ----- | ---- | ----------- |
| `id`  | uuid | Level UUID  |

**Request body** — same fields as `POST /levels`, all optional.

**Response `200`** — `Level`

**Response `404`**

```json
{ "statusCode": 404, "message": "Level with ID <id> not found" }
```

**Response `409`**

```json
{
  "statusCode": 409,
  "message": "Level with code \"<code>\" already exists in this program"
}
```

---

### `DELETE /levels`

Soft-delete one or more levels (sets `status = DELETED`).

**Permission required:** `delete:level`

**Request body**

```json
{
  "ids": ["uuid", "uuid"] // required, min 1 element
}
```

**Response `200`**

```json
{ "message": "Successfully deleted 2 level(s)" }
```

**Response `404`** — when any ID is not found or already deleted

```json
{ "statusCode": 404, "message": "Level(s) not found: <id>, <id>" }
```

---

## Changed Program endpoints

### `POST /programs` — now supports inline level creation

A `levels` array can be included to atomically create levels together with the program. If omitted, behavior is unchanged.

**Added request body field**

```json
{
  ...existingProgramFields,
  "levels": [
    {
      "code": "STARTERS",      // required, max 50 chars, unique within array
      "name": "Starters",      // required, max 255 chars
      "displayOrder": 0,        // optional, int >= 0; defaults to array index if omitted
      "ageMin": 6,              // optional, int >= 0
      "ageMax": 10              // optional, int >= 0
    }
  ]
}
```

`status` is not accepted per level here; all inline levels are created as `ACTIVE`.  
Creation is transactional — if any level fails, the entire program creation is rolled back.

**Response `409`** — duplicate codes within the `levels` array

```json
{
  "statusCode": 409,
  "message": "Levels contain duplicate codes within the same program"
}
```

---

### `GET /programs/options`

Return a flat list of all active programs for use in dropdowns. No pagination.

**Permission required:** `read:program`

**Response `200`**

```json
[
  { "id": "uuid", "code": "CAMBRIDGE", "name": "Cambridge YLE" },
  { "id": "uuid", "code": "IELTS", "name": "IELTS" }
]
```

Ordered by `name ASC`. Only programs with `status = ACTIVE` are included.

---

### `GET /programs/:id` — response now includes `levels`

The program detail response now embeds the program's non-deleted levels, ordered by `display_order ASC, created_at ASC`.

**Added response field**

```json
{
  ...existingProgramFields,
  "levels": [ ...LevelSummary ]
}
```

`levels` is an empty array (`[]`) when the program has no active or inactive levels.

---

### `PATCH /programs/:id` — now supports level upsert and removal

Level management can now be performed atomically alongside any program field update. Both `levels` and `removeLevelIds` are optional; omitting them leaves existing levels untouched.

**Added request body fields**

```json
{
  ...existingProgramFields,
  "levels": [
    {
      "id": "uuid",        // optional — if present, updates that level; if omitted, creates a new one
      "code": "STARTERS",  // required for new levels; optional when updating
      "name": "Starters",
      "displayOrder": 0,
      "ageMin": 6,
      "ageMax": 10
    }
  ],
  "removeLevelIds": ["uuid", "uuid"]  // optional — soft-deletes these levels (status = DELETED)
}
```

- **Upsert**: entries in `levels` with an `id` update the matching level; entries without `id` create new levels under this program.
- **Remove**: IDs in `removeLevelIds` are soft-deleted. Only levels that belong to this program are affected.
- The entire operation (program fields + upserts + removals) runs in a single transaction.

**Response `200`** — full program with updated `levels` array (same shape as `GET /programs/:id`).

**Response `404`** — program not found, or a level `id` in `levels` does not belong to this program

```json
{ "statusCode": 404, "message": "Level with ID <id> not found in this program" }
```
