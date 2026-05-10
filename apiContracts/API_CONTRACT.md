# API Contract — CMS Teachers

**Base URL:** `/cms-teachers`  
**Auth:** Bearer JWT required on all endpoints  
**Permission:** CASL-based `[action, Teacher]` check

---

## Enums

| Enum                  | Values                                             |
| --------------------- | -------------------------------------------------- |
| `Status`              | `ACTIVE`, `INACTIVE`, `DELETED`                    |
| `Gender`              | `MALE`, `FEMALE`, `OTHER`                          |
| `SkillTargetAudience` | `KIDS`, `TEEN`, `ADULT`                            |
| `SkillArea`           | `IELTS`, `TOEIC`, `SPEAKING`, `GRAMMAR`, `GENERAL` |
| `SkillLevel`          | `BASIC`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`      |

---

## Shared Types

**`TeacherUser`**

```json
{
  "id": "uuid",
  "email": "string | null",
  "firstName": "string | null",
  "lastName": "string | null",
  "avatar": "string | null",
  "phone": "string | null",
  "dateOfBirth": "ISO date | null",
  "gender": "Gender | null",
  "address": "string | null"
}
```

**`TeacherSkill`**

```json
{
  "id": "uuid",
  "targetAudience": "SkillTargetAudience | null",
  "skillArea": "SkillArea | null",
  "level": "SkillLevel"
}
```

**`TeacherCertificate`**

```json
{
  "id": "uuid",
  "name": "string",
  "issuer": "string | null",
  "issueDate": "ISO date | null",
  "expiryDate": "ISO date | null",
  "score": "string | null",
  "fileUrl": "string | null"
}
```

**`Teacher`** (response object)

```json
{
  "id": "uuid",
  "userId": "uuid",
  "code": "string",
  "nationality": "string | null",
  "status": "Status",
  "user": "TeacherUser",
  "skills": "TeacherSkill[]",
  "certificates": "TeacherCertificate[]",
  "auditMetadata": {
    "createdAt": "ISO datetime",
    "createdById": "uuid",
    "createdBy": "{ id, email, firstName, lastName, avatar } | undefined",
    "updatedAt": "ISO datetime",
    "updatedById": "uuid | undefined",
    "updatedBy": "{ id, email, firstName, lastName, avatar } | undefined"
  }
}
```

---

## Endpoints

### 1. List Teachers

**`GET /cms-teachers`**  
Permission: `[Read, Teacher]`

**Query params:**

| Field            | Type                  | Required | Default | Description                                        |
| ---------------- | --------------------- | -------- | ------- | -------------------------------------------------- |
| `page`           | `number`              | No       | `1`     | Page number                                        |
| `take`           | `number`              | No       | `10`    | Page size                                          |
| `keyword`        | `string`              | No       | —       | Search on `code`, `firstName`, `lastName`, `email` |
| `status`         | `Status`              | No       | —       | Filter by status (defaults to excluding `DELETED`) |
| `skillArea`      | `SkillArea`           | No       | —       | Filter by teacher skill area                       |
| `targetAudience` | `SkillTargetAudience` | No       | —       | Filter by teacher skill target audience            |

**Response `200`:**

```json
{
  "data": "Teacher[]",
  "meta": {
    "page": 1,
    "take": 10,
    "totalCount": 42
  }
}
```

---

### 2. Get Teacher

**`GET /cms-teachers/:id`**  
Permission: `[Read, Teacher]`

| Param | Type   | Required |
| ----- | ------ | -------- |
| `id`  | `UUID` | Yes      |

**Response `200`:** `Teacher`  
**Response `404`:** Teacher not found

---

### 3. Create Teacher

**`POST /cms-teachers`**  
Permission: `[Create, Teacher]`

Exactly one of `userId` or `user` must be provided (not both, not neither).

**Request body:**

```json
{
  "userId": "uuid (optional) — link existing user",
  "user": {
    "firstName": "string (optional, max 255)",
    "lastName": "string (optional, max 255)",
    "email": "string (optional, email, max 255)",
    "avatar": "string (optional, max 255)",
    "phone": "string (optional, max 20)",
    "dateOfBirth": "ISO date (optional)",
    "gender": "Gender (optional)",
    "address": "string (optional, max 500)"
  },
  "code": "string (required, max 50)",
  "nationality": "string (optional, max 100)",
  "status": "Status (required)",
  "skills": [
    {
      "targetAudience": "SkillTargetAudience (optional)",
      "skillArea": "SkillArea (optional)",
      "level": "SkillLevel (required)"
    }
  ],
  "certificates": [
    {
      "name": "string (required, max 255)",
      "issuer": "string (optional, max 255)",
      "issueDate": "ISO date (optional)",
      "expiryDate": "ISO date (optional)",
      "score": "string (optional, max 50)",
      "fileUrl": "string (optional, max 500)"
    }
  ]
}
```

**Response `201`:** `Teacher`  
**Response `400`:** Neither or both `userId`/`user` provided  
**Response `404`:** Linked user not found  
**Response `409`:** Code already exists; user already linked to another teacher

---

### 4. Update Teacher

**`PATCH /cms-teachers/:id`**  
Permission: `[Update, Teacher]`

| Param | Type   | Required |
| ----- | ------ | -------- |
| `id`  | `UUID` | Yes      |

All body fields are optional (same shape as Create) with these rules:

- `userId` is **forbidden** — returns `400` (cannot change user link after creation)
- `user` — updates the linked user's profile fields
- `skills` — **replaces all** existing skills (full replace, not merge); omit to keep existing
- `certificates` — **replaces all** existing certificates (full replace, not merge); omit to keep existing

**Response `200`:** `Teacher`  
**Response `400`:** `userId` included in body  
**Response `404`:** Teacher not found  
**Response `409`:** Code already in use by another teacher

---

### 5. Delete Teachers (Bulk Soft-Delete)

**`DELETE /cms-teachers`**  
Permission: `[Delete, Teacher]`

**Request body:**

```json
{
  "ids": ["uuid", "uuid"]
}
```

- `ids`: non-empty array of UUIDs (required)
- Sets `status = DELETED` on all matched teachers atomically
- Fails entirely if any ID is not found or already deleted

**Response `200`:** `void`  
**Response `404`:** One or more IDs not found / already deleted

---

## Key Behaviors

- **Soft-delete:** records are never physically removed; `status = DELETED` is the tombstone
- **Skills & certificates on update:** pass the full desired array — omitting the field keeps existing data; passing `[]` clears all
- **Transactions:** Create, Update, and Delete all run inside a DB transaction
- **Audit trail:** every mutation stamps `createdById` / `updatedById` from the JWT user
