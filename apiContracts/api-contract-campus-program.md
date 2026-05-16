# API Contract — Campus & Program

Base URL: `/api` (per global prefix)
Auth: Bearer JWT in `Authorization` header. All endpoints require auth and CASL permissions.

Common types:

```ts
type Status = 'ACTIVE' | 'INACTIVE' | 'DELETED';

interface AuditMetadata {
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  createdBy?: string; // user UUID
  updatedBy?: string; // user UUID
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

## 1. Campus

Resource: `/campuses`
CASL subject: `campus`

### Entity

```ts
interface Campus {
  id: string; // UUID
  code: string; // unique, ^[A-Z0-9-]+$, max 32
  name: string; // max 255
  address?: string; // max 500
  phone?: string; // max 32
  status: Status; // default ACTIVE
  auditMetadata: AuditMetadata;
}
```

### Endpoints

#### GET `/campuses` — list (paginated)

Permission: `read:campus`

Query:

| Name    | Type   | Required | Default | Notes                    |
| ------- | ------ | -------- | ------- | ------------------------ |
| page    | int    | no       | 1       | min 1                    |
| take    | int    | no       | 10      | 1..1000                  |
| keyword | string | no       | —       | matches `code` or `name` |
| status  | Status | no       | —       | filter by status         |

Response `200`: `Pagination<Campus>`

#### GET `/campuses/:id` — detail

Permission: `read:campus`
Path: `id` (UUID v4)
Response `200`: `Campus`
Errors: `404` if not found.

#### POST `/campuses` — create

Permission: `create:campus`

Body:

```ts
{
  code: string;       // required, ^[A-Z0-9-]+$, max 32, unique
  name: string;       // required, max 255
  address?: string;   // max 500
  phone?: string;     // max 32
  status?: Status;    // default ACTIVE
}
```

Response `201`: `Campus`
Errors: `400` validation, `409` duplicate `code`.

#### PATCH `/campuses/:id` — update

Permission: `update:campus`
Path: `id` (UUID v4)
Body: `Partial<CreateCampusDto>`
Response `200`: `Campus`
Errors: `400`, `404`, `409` on duplicate `code`.

#### DELETE `/campuses` — bulk delete (soft)

Permission: `delete:campus`

Body:

```ts
{ ids: string[]; }   // min 1, each UUID v4
```

Response `200`: `{ affected: number }` (sets `status = DELETED`).

---

## 2. Program

Resource: `/programs`
CASL subject: `program`

### Entity

```ts
interface Program {
  id: string; // UUID
  code: string; // unique, ^[A-Z0-9_]+$, max 50
  name: string; // max 255
  description?: string; // text, optional
  status: Status; // default ACTIVE
  auditMetadata: AuditMetadata;
}
```

### Endpoints

#### GET `/programs` — list (paginated)

Permission: `read:program`

Query:

| Name    | Type   | Required | Default | Notes                    |
| ------- | ------ | -------- | ------- | ------------------------ |
| page    | int    | no       | 1       | min 1                    |
| take    | int    | no       | 10      | 1..1000                  |
| keyword | string | no       | —       | matches `code` or `name` |
| status  | Status | no       | —       | filter by status         |

Response `200`: `Pagination<Program>`

#### GET `/programs/:id` — detail

Permission: `read:program`
Path: `id` (UUID v4)
Response `200`: `Program`
Errors: `404`.

#### POST `/programs` — create

Permission: `create:program`

Body:

```ts
{
  code: string;        // required, ^[A-Z0-9_]+$, max 50, unique
  name: string;        // required, max 255
  description?: string;
  status?: Status;     // default ACTIVE
}
```

Response `201`: `Program`
Errors: `400`, `409` duplicate `code`.

#### PATCH `/programs/:id` — update

Permission: `update:program`
Path: `id` (UUID v4)
Body: `Partial<CreateProgramDto>`
Response `200`: `Program`
Errors: `400`, `404`, `409`.

#### DELETE `/programs` — bulk delete (soft)

Permission: `delete:program`

Body:

```ts
{ ids: string[]; }   // min 1, each UUID v4
```

Response `200`: `{ affected: number }` (sets `status = DELETED`).

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
