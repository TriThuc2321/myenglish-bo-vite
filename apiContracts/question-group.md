# Question Group Module — API Contract

Base path: `/question-groups`  
Auth: Bearer JWT required on all routes  
Permissions: CASL — subject `question_group`

---

## Enums

```
QuestionType : SINGLE_ANSWER | MULTIPLE_ANSWER | YNN_ANSWER | TFN_ANSWER
             | MATCHING_PARAGRAPH | NOTE_COMPLETION_WITH_HINT
             | NOTE_COMPLETION_NO_HINT | DIAGRAM_LABEL_COMPLETION
```

---

## Endpoints

### GET /question-groups

List question groups with pagination and filters.

**Permission:** `Read.question_group`

**Query parameters**

| Field           | Type         | Required | Default | Notes                                  |
| --------------- | ------------ | -------- | ------- | -------------------------------------- |
| `page`          | integer      | No       | 1       | Min 1                                  |
| `take`          | integer      | No       | 10      | Min 1, max 1000                        |
| `keyword`       | string       | No       | —       | Case-insensitive search on `guideline` |
| `testSectionId` | UUID         | No       | —       | Filter by test section                 |
| `questionType`  | QuestionType | No       | —       | Filter by question type                |

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "testSectionId": "uuid",
      "questionType": "SINGLE_ANSWER",
      "guideline": "Choose the best answer for each question.",
      "order": 1,
      "testSection": {
        "id": "uuid",
        "testId": "uuid",
        "passageId": "uuid",
        "order": 1
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
    "totalCount": 42
  }
}
```

Results are ordered by `testSectionId`, then `order` ASC.

---

### GET /question-groups/by-ids

Fetch multiple question groups by IDs, each including their `testSection` and `questions` (ordered by `order` ASC).

**Permission:** `Read.question_group`

**Query parameters**

| Field | Type     | Required | Notes                         |
| ----- | -------- | -------- | ----------------------------- |
| `ids` | string[] | Yes      | Array of question group UUIDs |

**Response `200`** — array of `QuestionGroup` objects (see [QuestionGroup shape](#questiongroup))

**Response `400`** — no IDs provided.

**Response `404`** — no question groups found for the given IDs.

---

### GET /question-groups/by-test-section/:testSectionId

Fetch all question groups belonging to a test section, including their `questions` (both ordered by `order` ASC).

**Permission:** `Read.question_group`

**Path parameters**

| Field           | Type   | Notes             |
| --------------- | ------ | ----------------- |
| `testSectionId` | string | Test Section UUID |

**Response `200`** — array of `QuestionGroup` objects (see [QuestionGroup shape](#questiongroup))

---

### GET /question-groups/:id

Get a single question group with its `testSection` and `questions` (ordered by `order` ASC).

**Permission:** `Read.question_group`

**Path parameters**

| Field | Type   | Notes               |
| ----- | ------ | ------------------- |
| `id`  | string | Question Group UUID |

**Response `200`** — `QuestionGroup` object (see [QuestionGroup shape](#questiongroup))

**Response `404`** — question group not found.

---

### POST /question-groups

Create a new question group. The `order` is auto-assigned as `max(order) + 1` within the test section. Uses a pessimistic write lock on the parent test section to prevent race conditions.

**Permission:** `Create.question_group`

**Request body**

```json
{
  "testSectionId": "uuid",
  "questionType": "SINGLE_ANSWER",
  "guideline": "Choose the best answer for each question.",
  "questions": [
    {
      "uuid": "uuid",
      "order": 1,
      "content": {
        "text": "What is the capital?",
        "options": ["A", "B", "C", "D"]
      }
    }
  ]
}
```

| Field           | Type                | Required | Constraints                        |
| --------------- | ------------------- | -------- | ---------------------------------- |
| `testSectionId` | UUID                | Yes      | Must reference an existing section |
| `questionType`  | QuestionType        | Yes      | —                                  |
| `guideline`     | string              | Yes      | —                                  |
| `questions`     | CreateQuestionDto[] | No       | Nested questions to create         |

**CreateQuestionDto**

| Field     | Type           | Required | Constraints                          |
| --------- | -------------- | -------- | ------------------------------------ |
| `uuid`    | UUID           | Yes      | Frontend sync UUID (globally unique) |
| `order`   | integer        | Yes      | Min 0, unique within group           |
| `content` | object (JSONB) | Yes      | Question-specific data               |

`questionNumber` is server-managed and must not be included in create/update
payloads. In responses it is the inclusive range start. A `MULTIPLE_ANSWER`
question consumes one number per distinct ID in `content.answer.optionIds`;
every other question consumes one.

**Response `201`** — returns the saved `QuestionGroup` with its section and renumbered questions.

---

### PATCH /question-groups/:id

Update an existing question group. All fields are optional. If `questions` is provided, existing questions are **replaced** (delete-all then insert).

**Permission:** `Update.question_group`

**Path parameters**

| Field | Type   | Notes               |
| ----- | ------ | ------------------- |
| `id`  | string | Question Group UUID |

**Request body** — same fields as `POST /question-groups`, all optional.

> **Note:** Omitting `questions` leaves existing questions untouched. Passing `questions: []` deletes all questions in the group.

**Response `200`** — returns the updated `QuestionGroup` with its section and renumbered questions.

**Response `404`** — question group not found.

---

### DELETE /question-groups

Hard-delete one or more question groups. Child `questions` are cascade-deleted automatically.

**Permission:** `Delete.question_group`

**Request body**

```json
{
  "ids": ["uuid-1", "uuid-2"]
}
```

| Field | Type     | Required | Notes                            |
| ----- | -------- | -------- | -------------------------------- |
| `ids` | string[] | Yes      | One or more question group UUIDs |

**Response `200`**

```json
{
  "message": "Successfully deleted question group(s)"
}
```

---

## Common error shapes

```json
{ "statusCode": 400, "message": ["validation error detail"], "error": "Bad Request" }
{ "statusCode": 400, "message": "No question group IDs provided" }
{ "statusCode": 401, "message": "Unauthorized" }
{ "statusCode": 403, "message": "Forbidden resource" }
{ "statusCode": 404, "message": "Question group with ID <id> not found" }
{ "statusCode": 404, "message": "No question groups found for the provided IDs" }
```

---

## Shared types

### QuestionGroup

```json
{
  "id": "uuid",
  "testSectionId": "uuid",
  "questionType": "SINGLE_ANSWER",
  "guideline": "Choose the best answer for each question.",
  "order": 1,
  "testSection": {
    "id": "uuid",
    "testId": "uuid",
    "passageId": "uuid",
    "order": 1
  },
  "questions": [
    {
      "id": "uuid",
      "questionGroupId": "uuid",
      "uuid": "uuid",
      "order": 1,
      "content": { "text": "What is the capital?", "options": ["A", "B", "C", "D"] },
      "questionNumber": 1,
      "auditMetadata": { "...AuditMetadata..." }
    }
  ],
  "auditMetadata": { "...AuditMetadata..." }
}
```

For an eight-option `MULTIPLE_ANSWER` with five correct option IDs,
`questionNumber: 1` represents Q1–Q5; the next question has `questionNumber: 6`.

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
