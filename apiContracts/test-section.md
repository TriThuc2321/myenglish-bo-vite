# Test Section Module — API Contract

Base path: `/test-sections`  
Auth: Bearer JWT required on all routes  
Permissions: CASL — subject `Test`

---

## Enums

```
IELTSSkill    : READING | LISTENING | WRITING | SPEAKING
TestType      : PLACEMENT | PROGRESS | MIDTERM | FINAL | PRACTICE
PublishStatus : PUBLISHED | DRAFT
Status        : ACTIVE | INACTIVE | DELETED
ContentStatus : PUBLISHED | DRAFT | DELETED
MarkedBy      : ALPHABET | NUMBER
QuestionType  : SINGLE_ANSWER | MULTIPLE_ANSWER | YNN_ANSWER | TFN_ANSWER
              | MATCHING_PARAGRAPH | NOTE_COMPLETION_WITH_HINT
              | NOTE_COMPLETION_NO_HINT | DIAGRAM_LABEL_COMPLETION
```

---

## Endpoints

### GET /test-sections

List test sections with pagination and filters.

**Permission:** `Read.Test`

**Query parameters**

| Field       | Type    | Required | Default | Notes                                 |
| ----------- | ------- | -------- | ------- | ------------------------------------- |
| `page`      | integer | No       | 1       | Min 1                                 |
| `take`      | integer | No       | 10      | Min 1, max 1000                       |
| `testId`    | string  | No       | —       | Filter by test UUID                   |
| `passageId` | string  | No       | —       | Filter by passage UUID                |
| `keyword`   | string  | No       | —       | Case-insensitive search on test title |

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "testId": "uuid",
      "passageId": "uuid | null",
      "order": 1,
      "test": {
        "id": "uuid",
        "title": "IELTS Reading Test 1",
        "code": "IELTS-R-001"
      },
      "passage": {
        "id": "uuid",
        "title": "The History of Science"
      },
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
    "totalCount": 25
  }
}
```

---

### GET /test-sections/by-ids

Fetch multiple test sections by IDs.

**Permission:** `Read.Test`

**Query parameters**

| Field | Type     | Required | Notes                       |
| ----- | -------- | -------- | --------------------------- |
| `ids` | string[] | Yes      | Array of test section UUIDs |

**Response `200`**

```json
[
  {
    "id": "uuid",
    "testId": "uuid",
    "passageId": "uuid | null",
    "order": 1,
    "test": { "id": "uuid", "title": "string", "code": "string" },
    "passage": { "id": "uuid", "title": "string" },
    "questionGroups": [ { "...QuestionGroup..." } ],
    "auditMetadata": { "...AuditMetadata..." }
  }
]
```

**Response `400`** — `ids` is empty.  
**Response `404`** — none of the provided IDs found.

---

### GET /test-sections/by-test/:testId

Get all sections belonging to a specific test, ordered by `order` ASC.

**Permission:** `Read.Test`

**Path parameters**

| Field    | Type   | Notes     |
| -------- | ------ | --------- |
| `testId` | string | Test UUID |

**Response `200`**

```json
[
  {
    "id": "uuid",
    "testId": "uuid",
    "passageId": "uuid | null",
    "order": 1,
    "passage": { "id": "uuid", "title": "string" },
    "questionGroups": [ { "...QuestionGroup..." } ]
  }
]
```

---

### GET /test-sections/:id

Get a single test section with its passage and question groups.

**Permission:** `Read.Test`

**Path parameters**

| Field | Type   | Notes            |
| ----- | ------ | ---------------- |
| `id`  | string | TestSection UUID |

**Response `200`**

```json
{
  "id": "uuid",
  "testId": "uuid",
  "passageId": "uuid | null",
  "order": 1,
  "test": {
    "id": "uuid",
    "title": "IELTS Reading Test 1",
    "code": "IELTS-R-001"
  },
  "passage": {
    "id": "uuid",
    "title": "The History of Science"
  },
  "questionGroups": [
    {
      "id": "uuid",
      "testSectionId": "uuid",
      "questionType": "SINGLE_ANSWER",
      "guideline": "Choose the correct answer.",
      "order": 1
    }
  ]
}
```

**Response `404`** — section not found.

---

### POST /test-sections

Create a new test section. `order` is auto-assigned as `max(existing order) + 1` for the given test.

**Permission:** `Create.Test`

**Request body**

```json
{
  "testId": "uuid",
  "passageId": "uuid"
}
```

| Field       | Type   | Required | Notes                          |
| ----------- | ------ | -------- | ------------------------------ |
| `testId`    | string | Yes      | UUID of the parent test        |
| `passageId` | string | No       | UUID of the passage (nullable) |

**Response `201`** — returns the created `TestSection` entity.

**Response `400`** — validation error.  
**Response `404`** — test not found.

---

### PATCH /test-sections/:id

Update an existing test section.

**Permission:** `Update.Test`

**Path parameters**

| Field | Type   | Notes            |
| ----- | ------ | ---------------- |
| `id`  | string | TestSection UUID |

**Request body** — all fields optional.

```json
{
  "testId": "uuid",
  "passageId": "uuid | null"
}
```

**Response `200`** — returns the updated `TestSection` entity.

**Response `404`** — section not found.

---

### DELETE /test-sections

Delete one or more test sections.

**Permission:** `Delete.Test`

**Request body**

```json
{
  "ids": ["uuid-1", "uuid-2"]
}
```

| Field | Type     | Required | Notes                          |
| ----- | -------- | -------- | ------------------------------ |
| `ids` | string[] | Yes      | One or more test section UUIDs |

**Response `200`**

```json
{
  "message": "Successfully deleted test section(s)"
}
```

**Response `400`** — `ids` is empty.

---

## Business rules

- `order` is scoped per test and auto-incremented on creation; unique constraint on `(testId, order)`.
- Deleting the parent `Test` cascade-deletes all its sections.
- Deleting a `Passage` sets `passageId → NULL` on associated sections (no cascade).
- Each section holds an ordered list of `QuestionGroup`s; deleting a section cascade-deletes its groups.

---

## Common error shapes

```json
{ "statusCode": 400, "message": ["validation error detail"], "error": "Bad Request" }
{ "statusCode": 401, "message": "Unauthorized" }
{ "statusCode": 403, "message": "Forbidden resource" }
{ "statusCode": 404, "message": "Test section not found" }
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

### QuestionGroup

```json
{
  "id": "uuid",
  "testSectionId": "uuid",
  "questionType": "QuestionType",
  "guideline": "string | null",
  "order": 1
}
```
