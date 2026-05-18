# API Contract — Student

Base URL: `/api` (per global prefix)
Auth: Bearer JWT in `Authorization` header. All endpoints require auth and CASL permissions.

Common types:

```ts
type Status = 'ACTIVE' | 'INACTIVE' | 'DELETED';

type Gender = 'MALE' | 'FEMALE' | 'OTHER';

type StudentSegment = 'KIDS' | 'TEENS' | 'UNI' | 'ADULT';

type ParentRelationship = 'MOM' | 'DAD' | 'OTHER';

interface UserSummary {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
}

interface UserProfile {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  phone: string | null;
  dateOfBirth: string | null; // ISO yyyy-MM-dd
  gender: Gender | null;
}

interface AuditMetadata {
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  createdById?: string; // user UUID
  updatedById?: string; // user UUID
  createdBy?: UserSummary; // populated on list responses
  updatedBy?: UserSummary; // populated on list responses
}

interface PageMeta {
  page: number;
  take: number;
  totalCount: number;
}

interface Pagination<T> {
  data: T[];
  meta: PageMeta;
}
```

---

## Student

Resource: `/students`
CASL subject: `student`

### Entity

Every `Student` is backed by a `User` record created at the same time. Personal data (`firstName`, `lastName`, `dob`, `gender`, `phone`, `email`) lives on the linked `User`; the `Student` record only holds academic / enrollment metadata.

Login access is granted automatically when the student signs in via Google OAuth using the email set by the admin. On first Google login the system sets `emailVerified = true` on the linked `User`.

```ts
interface Student {
  id: string; // UUID
  studentCode: string; // unique, max 50, auto-generated as MYE-{yyyy}-{seq} when omitted
  user: UserProfile; // always present; personal data lives here
  entryLevelCode?: string; // max 50, e.g. "STARTERS", "IELTS_4_5_5"
  segment: StudentSegment;
  parentName?: string; // max 255 (required for KIDS / TEENS)
  parentPhone?: string; // max 32  (required for KIDS / TEENS)
  parentEmail?: string; // max 255
  parentRelationship?: ParentRelationship;
  note?: string; // free-form
  status: Status; // default ACTIVE
  auditMetadata: AuditMetadata;
}
```

### Segment rules

Enforced server-side on create / update:

- `KIDS` or `TEENS` — `parentName` AND `parentPhone` are required.

Violations return `400 Bad Request`.

---

### Endpoints

#### GET `/students` — list (paginated)

Permission: `read:student`

Query:

| Name           | Type           | Required | Default     | Notes                                                                                                   |
| -------------- | -------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| page           | int            | no       | 1           | min 1                                                                                                   |
| take           | int            | no       | 10          | 1..1000                                                                                                 |
| keyword        | string         | no       | —           | matches `studentCode`, `user.firstName`, `user.lastName`, `user.email`, `user.phone` (case-insensitive) |
| segment        | StudentSegment | no       | —           | filter by segment                                                                                       |
| entryLevelCode | string         | no       | —           | exact match                                                                                             |
| status         | Status         | no       | non-DELETED | when omitted, excludes `DELETED` rows                                                                   |

Sorted by `updatedAt DESC NULLS LAST, createdAt DESC`.

Response `200`: `Pagination<Student>` (audit metadata includes populated `createdBy` / `updatedBy` user summaries).

---

#### GET `/students/:id` — detail

Permission: `read:student`
Path: `id` (UUID v4)
Response `200`: `Student` with `user` relation populated.
Errors: `404` if not found or soft-deleted.

---

#### POST `/students` — create

Permission: `create:student`

Creates a `User` record and a linked `Student` record in a single transaction. Personal fields are stored on the `User`.

Body:

```ts
{
  studentCode?: string;                     // max 50; auto-generated when omitted (MYE-{yyyy}-{seq})
  firstName: string;                        // required, max 255 — stored as user.firstName
  lastName?: string;                        // max 255 — stored as user.lastName
  dob?: string;                             // ISO yyyy-MM-dd — stored as user.dateOfBirth
  gender?: Gender;                          // stored on user
  phone?: string;                           // max 32 — stored on user
  email?: string;                           // valid email, max 255 — stored on user
  entryLevelCode?: string;                  // max 50
  segment: StudentSegment;                  // required
  parentName?: string;                      // max 255
  parentPhone?: string;                     // max 32
  parentEmail?: string;                     // valid email, max 255
  parentRelationship?: ParentRelationship;
  note?: string;
  status?: Status;                          // default ACTIVE
}
```

Response `201`: `Student` (includes `user` object)
Errors:

- `400` validation or segment-rule violation.
- `409` duplicate `studentCode` or `email` already in use.

---

#### PATCH `/students/:id` — update

Permission: `update:student`
Path: `id` (UUID v4)

Personal fields (`firstName`, `lastName`, `dob`, `gender`, `phone`, `email`) are proxied through to the linked `User` record. Student-specific fields are updated on the `Student` record.

Body: `Partial<CreateStudentDto>` (all fields optional)

Segment rules re-evaluated using the merged (incoming + existing) state.

Response `200`: `Student`
Errors: `400`, `404`, `409` (duplicate `studentCode` or `email` already in use).

---

#### DELETE `/students` — bulk delete (soft)

Permission: `delete:student`

Body:

```ts
{ ids: string[]; }   // min 1, each UUID v4
```

Sets `status = DELETED` and updates audit metadata on every matched row.

Response `200`:

```ts
{
  message: string;
} // e.g. "Successfully deleted 3 student(s)"
```

Errors: `404` when any id does not resolve to a non-deleted student (message lists the missing ids).

---

## Error envelope

Standard NestJS error response:

```ts
{
  statusCode: number;
  message: string | string[];
  error: string;
}
```

Validation errors return `400` with `message: string[]` listing failed constraints.
