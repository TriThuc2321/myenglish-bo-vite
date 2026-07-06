# Test Module — API Contract

Base path: `/tests`  
Auth: Bearer JWT required on all routes  
Permissions: CASL — subject `Test`

---

## Enums

```
IELTSSkill    : READING | LISTENING | WRITING | SPEAKING
TestType      : PLACEMENT | PROGRESS | MIDTERM | FINAL | PRACTICE
PublishStatus : PUBLISHED | DRAFT
Status        : ACTIVE | INACTIVE | DELETED
AttemptStatus : IN_PROGRESS | COMPLETED | ABANDONED
```

---

## Endpoints

### GET /tests

List tests with pagination and filters.

**Permission:** `Read.Test`

**Query parameters**

| Field     | Type       | Required | Default | Notes                                  |
| --------- | ---------- | -------- | ------- | -------------------------------------- |
| `page`    | integer    | No       | 1       | Min 1                                  |
| `take`    | integer    | No       | 10      | Min 1, max 1000                        |
| `keyword` | string     | No       | —       | Case-insensitive search on title, code |
| `skill`   | IELTSSkill | No       | —       | Filter by skill                        |
| `type`    | TestType   | No       | —       | Filter by type                         |

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "IELTS Reading Test 1",
      "code": "IELTS-R-001",
      "skill": "READING",
      "type": "PRACTICE",
      "band": "5.0–7.5",
      "durationMin": 60,
      "totalQuestions": 40,
      "publishStatus": "PUBLISHED",
      "status": "ACTIVE",
      "sectionCount": 3,
      "attempts": 120,
      "avgBand": 6.2,
      "auditMetadata": {
        "createdAt": "2026-01-01T00:00:00.000Z",
        "createdById": "uuid",
        "createdBy": {
          "id": "uuid",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "avatar": "https://..."
        },
        "updatedAt": "2026-01-10T00:00:00.000Z",
        "updatedById": "uuid",
        "updatedBy": { "...same shape as createdBy..." }
      }
    }
  ],
  "meta": {
    "page": 1,
    "take": 10,
    "totalCount": 42
  }
}
```

---

### GET /tests/by-ids

Fetch multiple tests by IDs. Returns only `ACTIVE` tests.

**Permission:** `Read.Test`

**Query parameters**

| Field | Type     | Required | Notes               |
| ----- | -------- | -------- | ------------------- |
| `ids` | string[] | Yes      | Array of test UUIDs |

**Response `200`**

```json
[
  {
    "id": "uuid",
    "title": "IELTS Reading Test 1",
    "code": "IELTS-R-001",
    "skill": "READING",
    "type": "PRACTICE",
    "band": "5.0–7.5",
    "durationMin": 60,
    "totalQuestions": 40,
    "publishStatus": "PUBLISHED",
    "status": "ACTIVE",
    "auditMetadata": { "...AuditMetadata..." }
  }
]
```

---

### GET /tests/:id

Get a single test with its sections, passages, and question groups.

**Permission:** `Read.Test`

**Path parameters**

| Field | Type   | Notes     |
| ----- | ------ | --------- |
| `id`  | string | Test UUID |

**Response `200`**

```json
{
  "id": "uuid",
  "title": "IELTS Reading Test 1",
  "code": "IELTS-R-001",
  "skill": "READING",
  "type": "PRACTICE",
  "band": "5.0–7.5",
  "durationMin": 60,
  "totalQuestions": 40,
  "publishStatus": "PUBLISHED",
  "sections": [
    {
      "id": "uuid",
      "order": 1,
      "passage": {
        "id": "uuid",
        "title": "The History of Science"
      },
      "questionGroups": [ { "...QuestionGroup..." } ]
    }
  ]
}
```

**Response `404`** — test not found.

---

### POST /tests

Create a new test.

**Permission:** `Create.Test`

**Request body**

```json
{
  "title": "IELTS Reading Test 1",
  "code": "IELTS-R-001",
  "skill": "READING",
  "type": "PRACTICE",
  "band": "5.0–7.5",
  "durationMin": 60,
  "totalQuestions": 40,
  "publishStatus": "DRAFT"
}
```

| Field            | Type          | Required | Constraints          |
| ---------------- | ------------- | -------- | -------------------- |
| `title`          | string        | Yes      | —                    |
| `code`           | string        | Yes      | Unique (non-deleted) |
| `skill`          | IELTSSkill    | No       | —                    |
| `type`           | TestType      | No       | —                    |
| `band`           | string        | No       | Max 50 chars         |
| `durationMin`    | integer       | No       | Min 1                |
| `totalQuestions` | integer       | No       | Min 1                |
| `publishStatus`  | PublishStatus | No       | Default: `DRAFT`     |

**Response `201`** — returns the created `Test` entity (same shape as single-get, without sections).

**Response `409`** — duplicate code.

---

### PATCH /tests/:id

Update an existing test. All fields optional.

**Permission:** `Update.Test`

**Path parameters**

| Field | Type   | Notes     |
| ----- | ------ | --------- |
| `id`  | string | Test UUID |

**Request body** — same fields as `POST /tests`, all optional.

**Response `200`** — returns the updated `Test` entity.

**Response `404`** — test not found.

**Response `409`** — duplicate code.

---

### DELETE /tests

Soft-delete one or more tests (sets `status → DELETED`).

**Permission:** `Delete.Test`

**Request body**

```json
{
  "ids": ["uuid-1", "uuid-2"]
}
```

| Field | Type     | Required | Notes                  |
| ----- | -------- | -------- | ---------------------- |
| `ids` | string[] | Yes      | One or more test UUIDs |

**Response `200`**

```json
{
  "message": "Successfully deleted 2 test(s)"
}
```

---

## Common error shapes

```json
{ "statusCode": 400, "message": ["validation error detail"], "error": "Bad Request" }
{ "statusCode": 401, "message": "Unauthorized" }
{ "statusCode": 403, "message": "Forbidden resource" }
{ "statusCode": 404, "message": "Test not found" }
{ "statusCode": 409, "message": "Test code already exists" }
```

---

## Shared types

### AuditMetadata

```json
{
  "createdAt": "ISO 8601",
  "createdById": "uuid | null",
  "createdBy": { "id": "uuid", "email": "string", "firstName": "string", "lastName": "string", "avatar": "string" },
  "updatedAt": "ISO 8601 | null",
  "updatedById": "uuid | null",
  "updatedBy": { "...same as createdBy..." }
}
```

### PageMeta

```json
{
  "page": 1,
  "take": 10,
  "totalCount": 100
}
```
