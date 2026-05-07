Generate a complete new CRUD module following the exact same patterns as the `role` module in this codebase.

## Input

The user provides a configuration string as `$ARGUMENTS`. Parse it using this format:

```
<ModuleName> --endpoint=<api-endpoint> [--fields="<field>:<type>[,...]"] [--subject=<SubjectName>]
```

Examples:

- `Course --endpoint=/cms-courses --fields="title:string,description:string,status:CourseStatus"`
- `Student --endpoint=/cms-students --fields="firstName:string,lastName:string,email:string,status:StudentStatus"`

If `--fields` is not provided, default to `name:string,status:<ModuleName>Status`.
If `--subject` is not provided, use `<ModuleName>s` (pluralized ModuleName).

From the input, derive:

- `ModuleName` — PascalCase singular (e.g., `Course`)
- `moduleName` — camelCase singular (e.g., `course`)
- `moduleNames` — camelCase plural (e.g., `courses`)
- `ModuleNames` — PascalCase plural (e.g., `Courses`)
- `module-name` — kebab-case singular (e.g., `course`)
- `module-names` — kebab-case plural (e.g., `courses`)
- `MODULE_NAME` — SCREAMING_SNAKE singular (e.g., `COURSE`)
- `endpoint` — API endpoint (e.g., `/cms-courses`)
- `fields` — parsed field list
- `SubjectName` — for RBAC (e.g., `Courses`)

## Files to Create

Generate ALL of the following files verbatim, substituting the derived names. Follow the role module code style exactly (no extra comments, same import order, same formatting).

---

### 1. `src/types/<module-name>.ts`

```typescript
import type { Audit, Params, Response } from './common';

export enum <ModuleName>Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export interface <ModuleName> {
  id: number;
  // Add each field from --fields here as TypeScript properties
  status: <ModuleName>Status;
  auditMetadata?: Audit;
}

export interface Create<ModuleName>Payload {
  // Add each non-status field as required, status as <ModuleName>Status
}

export interface Edit<ModuleName>Payload extends Partial<Create<ModuleName>Payload> {
  id: string;
}

export interface Get<ModuleNames>Params extends Params {
  status?: <ModuleName>Status;
}

export type Get<ModuleNames>Response = Response<<ModuleName>[]>;
```

Map TypeScript types: `string` → `string`, `number` → `number`, `boolean` → `boolean`, `<ModuleName>Status` → `<ModuleName>Status`.

---

### 2. `src/schemas/<module-name>.ts`

```typescript
import * as yup from 'yup';

import { <ModuleName>Status } from '@/types/<module-name>';

import { VALIDATION_MESSAGE } from './message';

export const createEdit<ModuleName>Schema = yup.object().shape({
  // Add yup validation for each field:
  // string → yup.string().required(VALIDATION_MESSAGE.REQUIRED)
  // number → yup.number().required(VALIDATION_MESSAGE.REQUIRED)
  // boolean → yup.boolean().required(VALIDATION_MESSAGE.REQUIRED)
  // status → yup.mixed<<ModuleName>Status>().oneOf(Object.values(<ModuleName>Status)).required(VALIDATION_MESSAGE.REQUIRED)
});

export type CreateEdit<ModuleName>FormData = yup.InferType<typeof createEdit<ModuleName>Schema>;
```

---

### 3. `src/services/apis/<module-name>.ts`

```typescript
import type { Message } from '@/types/common';
import type {
  Create<ModuleName>Payload,
  Edit<ModuleName>Payload,
  Get<ModuleNames>Params,
  Get<ModuleNames>Response,
  <ModuleName>,
} from '@/types/<module-name>';

import axiosInstance from '@/services/axios-instance';

const <moduleName>Api = {
  getAll: (params: Get<ModuleNames>Params): Promise<Get<ModuleNames>Response> =>
    axiosInstance.get('<endpoint>', { params }),
  getById: (id: string): Promise<<ModuleName>> => axiosInstance.get(`<endpoint>/${id}`),
  create: (payload: Create<ModuleName>Payload): Promise<<ModuleName>> =>
    axiosInstance.post('<endpoint>', payload),
  edit: ({ id, ...payload }: Edit<ModuleName>Payload): Promise<<ModuleName>> =>
    axiosInstance.patch(`<endpoint>/${id}`, payload),
  delete: (ids: number[]): Promise<Message> =>
    axiosInstance.delete('<endpoint>', { data: { ids } }),
};

export default <moduleName>Api;
```

---

### 4. `src/hooks/apis/<module-names>/useGet<ModuleNames>.tsx`

```typescript
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { Get<ModuleNames>Params } from '@/types/<module-name>';

import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { <moduleName>Api } from '@/services/apis';

const useGet<ModuleNames> = (params: Get<ModuleNames>Params) =>
  useQuery({
    queryKey: [REACT_QUERY_KEYS.<MODULE_NAME>.LIST, params],
    queryFn: () => <moduleName>Api.getAll(params),
    placeholderData: keepPreviousData,
  });

export default useGet<ModuleNames>;
```

---

### 5. `src/hooks/apis/<module-names>/useGet<ModuleName>ById.tsx`

```typescript
import { useQuery } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { <moduleName>Api } from '@/services/apis';

const useGet<ModuleName>ById = (id: string) =>
  useQuery({
    queryKey: [REACT_QUERY_KEYS.<MODULE_NAME>.BY_ID, id],
    queryFn: () => <moduleName>Api.getById(id),
  });

export default useGet<ModuleName>ById;
```

---

### 6. `src/hooks/apis/<module-names>/useCreate<ModuleName>.tsx`

```typescript
import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { <moduleName>Api } from '@/services/apis';

const useCreate<ModuleName> = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: <moduleName>Api.create,
    onSuccess: () => {
      toast.success(t('<moduleNames>.toast.createSuccess'));

      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.<MODULE_NAME>.LIST],
      });
    },
    onError: (err) => {
      toast.danger(t('<moduleNames>.toast.createError'), {
        description: err.message,
      });
    },
  });
};

export default useCreate<ModuleName>;
```

---

### 7. `src/hooks/apis/<module-names>/useEdit<ModuleName>.tsx`

```typescript
import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { <moduleName>Api } from '@/services/apis';

const useEdit<ModuleName> = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: <moduleName>Api.edit,
    onSuccess: () => {
      toast.success(t('<moduleNames>.toast.updateSuccess'));

      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.<MODULE_NAME>.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.<MODULE_NAME>.BY_ID],
      });
    },
    onError: (err) => {
      toast.danger(t('<moduleNames>.toast.updateError'), {
        description: err.message,
      });
    },
  });
};

export default useEdit<ModuleName>;
```

---

### 8. `src/hooks/apis/<module-names>/useDelete<ModuleName>.tsx`

```typescript
import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { <moduleName>Api } from '@/services/apis';

const useDelete<ModuleName> = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: <moduleName>Api.delete,
    onSuccess: () => {
      toast.success(t('<moduleNames>.toast.deleteSuccess'));

      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.<MODULE_NAME>.LIST],
      });
    },
    onError: (err) => {
      toast.danger(t('<moduleNames>.toast.deleteError'), {
        description: err.message,
      });
    },
  });
};

export default useDelete<ModuleName>;
```

---

### 9. `src/hooks/apis/<module-names>/index.ts`

```typescript
export { default as useGet<ModuleNames> } from './useGet<ModuleNames>';
export { default as useGet<ModuleName>ById } from './useGet<ModuleName>ById';
export { default as useCreate<ModuleName> } from './useCreate<ModuleName>';
export { default as useEdit<ModuleName> } from './useEdit<ModuleName>';
export { default as useDelete<ModuleName> } from './useDelete<ModuleName>';
```

---

### 10. `src/hooks/forms/useCreateEdit<ModuleName>.tsx`

```typescript
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import type { CreateEdit<ModuleName>FormData } from '@/schemas/<module-name>';

import { createEdit<ModuleName>Schema } from '@/schemas/<module-name>';

interface UseCreateEdit<ModuleName>FormOptions {
  defaultValues?: Partial<CreateEdit<ModuleName>FormData>;
}

const useCreateEdit<ModuleName>Form = (prop: UseCreateEdit<ModuleName>FormOptions = {}) =>
  useForm<CreateEdit<ModuleName>FormData>({
    resolver: yupResolver(createEdit<ModuleName>Schema),
    defaultValues: prop.defaultValues,
  });

export default useCreateEdit<ModuleName>Form;
```

---

### 11. `src/components/<module-names>/<ModuleName>Form.tsx`

Generate a form with `Controller` wrappers for each field:

- `string` fields → `TextField` + `Input` (variant="secondary")
- `boolean` fields → `Switch`
- `<ModuleName>Status` fields → `Select` with ACTIVE/INACTIVE options

Include submit/cancel buttons at the bottom exactly as in `RoleForm`. Import from `@heroui/react`, `react-hook-form`, `react-i18next`. Use `t('<moduleNames>.form.<fieldName>')` for labels.

---

### 12. `src/components/<module-names>/<ModuleNames>Table.tsx`

Generate a TanStack Table with:

- A `status` column with `Chip` using `statusColorMap`
- All other fields as simple accessor columns
- Two audit columns using the shared `AuditItem` component from `@/components/shared/AuditItem`:
  - `createdBy` — `columnHelper.accessor('auditMetadata', { id: 'createdBy', header: t('common.createdBy'), cell: ... })` rendering `<AuditItem user={audit?.createdBy} dateTime={audit?.createdAt} />`, returns `'-'` when both are absent
  - `updatedBy` — same pattern with `updatedBy` / `updatedAt`
- An `actions` column with view/edit/delete `MyButton`s using `PermissionAction` and `SubjectName.<SubjectName>`
- `FooterTable` and `TanstackTable` exactly as in `RolesTable`
- `useDelete<ModuleName>` for the delete mutation with `ConfirmWrapper`

---

### 13. `src/components/<module-names>/Create<ModuleName>.tsx`

```typescript
import { useNavigate } from 'react-router';

import type { CreateEdit<ModuleName>FormData } from '@/schemas/<module-name>';
import type { Create<ModuleName>Payload } from '@/types/<module-name>';

import { useCreate<ModuleName> } from '@/hooks/apis/<module-names>';
import useCreateEdit<ModuleName>Form from '@/hooks/forms/useCreateEdit<ModuleName>';
import { <ModuleName>Status } from '@/types/<module-name>';

import <ModuleName>Form from './<ModuleName>Form';

const Create<ModuleName> = () => {
  const navigate = useNavigate();
  const { mutateAsync: create<ModuleName>, isPending: isCreating } = useCreate<ModuleName>();

  const form = useCreateEdit<ModuleName>Form({
    defaultValues: {
      // sensible defaults: '' for strings, false for booleans, ACTIVE for status
      status: <ModuleName>Status.ACTIVE,
    },
  });

  const onSubmit = async (payload: CreateEdit<ModuleName>FormData) => {
    try {
      await create<ModuleName>(payload as Create<ModuleName>Payload);
      navigate('/<module-names>');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <<ModuleName>Form
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isCreating}
      onCancel={() => navigate('/<module-names>')}
    />
  );
};

export default Create<ModuleName>;
```

---

### 14. `src/components/<module-names>/Edit<ModuleName>.tsx`

Mirror `EditRole.tsx` exactly: fetch by id, `useEffect` to reset form when data arrives, call `edit<ModuleName>` on submit, show `<ModuleName>Skeleton` while loading.

---

### 15. `src/components/<module-names>/View<ModuleName>.tsx`

Display all fields in a 2-column grid (like `ViewRole`). Show `status` as a `Chip` with `statusColorMap`. Include Back and Edit buttons at the bottom.

---

### 16. `src/components/<module-names>/Skeleton.tsx`

```typescript
import { Skeleton } from '@heroui/react';

export default function <ModuleName>Skeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Skeleton className="h-14 w-full rounded-lg" />
      <Skeleton className="h-14 w-full rounded-lg" />
      <Skeleton className="h-14 w-full rounded-lg" />
      <Skeleton className="h-14 w-full rounded-lg" />
    </div>
  );
}
```

---

### 17. `src/components/<module-names>/index.ts`

```typescript
export { default as Create<ModuleName> } from './Create<ModuleName>';
export { default as Edit<ModuleName> } from './Edit<ModuleName>';
export { default as <ModuleName>Form } from './<ModuleName>Form';
export { default as <ModuleName>Skeleton } from './Skeleton';
export { default as <ModuleNames>Table } from './<ModuleNames>Table';
export { default as View<ModuleName> } from './View<ModuleName>';
```

---

### 18. `src/pages/_main.<module-names>.tsx`

```typescript
import { Outlet } from 'react-router';

export default function <ModuleNames>Layout() {
  return <Outlet />;
}
```

---

### 19. `src/pages/_main.<module-names>._index.tsx`

Mirror `_main.roles._index.tsx` exactly: search input, create button with `PermissionAction.Create` / `SubjectName.<SubjectName>`, `useGet<ModuleNames>` hook, `<ModuleNames>Table`. Use `t('<moduleNames>.searchPlaceholder')` etc.

---

### 20. `src/pages/_main.<module-names>.create.tsx`

Mirror `_main.roles.create.tsx`: breadcrumbs linking back to `/<module-names>`, `Card` wrapping `Create<ModuleName>`.

---

### 21. `src/pages/_main.<module-names>.$id.tsx`

Mirror `_main.roles.$id.tsx`: breadcrumbs, `Card` wrapping `View<ModuleName>`.

---

### 22. `src/pages/_main.<module-names>.$id.edit.tsx`

Mirror `_main.roles.$id.edit.tsx`: breadcrumbs, `Card` wrapping `Edit<ModuleName>`.

---

## Files to Update

After creating the files above, update these existing files:

### `src/constants/reactQuery.ts`

Add inside `REACT_QUERY_KEYS`:

```typescript
  <MODULE_NAME>: {
    LIST: '<moduleName>.list',
    BY_ID: '<moduleName>.byId',
  },
```

### `src/services/apis/index.ts`

Add export:

```typescript
export { default as <moduleName>Api } from './<module-name>';
```

### `src/types/auth.ts`

Add to `SubjectName` enum:

```typescript
  <SubjectName> = '<module-names>',
```

### `src/i18n/locales/en.ts`

Add a `<moduleNames>` key with the same structure as `roles`:

```typescript
  <moduleNames>: {
    createTitle: 'Create <ModuleName>',
    editTitle: 'Edit <ModuleName>',
    detailTitle: '<ModuleName> Detail',
    searchPlaceholder: 'Search...',
    createButton: 'Create <ModuleName>',
    deleteTitle: 'Delete <module-name>',
    deleteConfirm: 'Are you sure you want to delete "{{name}}"?',
    toast: {
      createSuccess: '<ModuleName> created successfully',
      createError: 'Failed to create <module-name>',
      updateSuccess: '<ModuleName> updated successfully',
      updateError: 'Failed to update <module-name>',
      deleteSuccess: '<ModuleName> deleted successfully',
      deleteError: 'Failed to delete <module-name>',
    },
    table: {
      // one key per field
    },
    form: {
      // one key per field
    },
  },
```

Also add `<moduleNames>: '<ModuleNames>'` to `sidebar` in both `en.ts` and `vi.ts`. For `vi.ts`, use the same English strings (the user will translate later).

---

## After Generation

Report a summary:

- List every file created with its path
- List every file updated with the specific change made
- Note any fields or types the user should review/customize (e.g., if a field type was ambiguous)
- Remind the user to add the new route to the sidebar navigation config if applicable
