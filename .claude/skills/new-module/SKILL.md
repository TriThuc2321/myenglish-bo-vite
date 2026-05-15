---
name: new-module
description: Scaffold a new CRUD module (types, schema, API, hooks, components, pages, i18n, query keys, sidebar) by mirroring the existing `user` and `teacher` modules. Trigger when the user asks to "create/add a new module", "scaffold a resource", or "implement module <X>".
---

# new-module

Generate a complete CRUD module that exactly mirrors the patterns used by the `user` and `teacher` modules already in this repo. Do **not** invent new patterns — read the reference files first, then copy their structure with renamed identifiers.

## Step 1 — Gather inputs

Ask the user (only if missing) for:

- **ModuleName** (PascalCase singular, e.g. `Course`)
- **API endpoint** (e.g. `/cms-courses`) — CMS endpoints conventionally start with `/cms-`.
- **Fields** — list of `name:type` pairs (e.g. `title:string, level:number, status:CourseStatus`). If omitted, **ask** rather than assume — a guessed schema will almost always be wrong, and reshaping the type/schema/form/table later is costly. At minimum confirm: scalar fields, any nested objects (like `teacher.user`), any array relations (like `teacher.skills`), and which fields are immutable after creation.
- **SubjectName key** — the enum value to add to `SubjectName` in `src/types/auth.ts` (defaults to `<ModuleNames>`, e.g. `Courses`).
- **i18n namespace** — defaults to camelCase plural (`courses`). Note that this may differ from the plural form (e.g. the user module's namespace is `cmsUsers`, not `users`). Confirm with user if ambiguous.
- Whether an **infinite-scroll** list hook is needed (rare — only `passage` and `test` have one).

Derive name variants:

| Variant                            | Example   |
| ---------------------------------- | --------- |
| `ModuleName` (PascalCase singular) | `Course`  |
| `moduleName` (camelCase singular)  | `course`  |
| `ModuleNames` (PascalCase plural)  | `Courses` |
| `moduleNames` (camelCase plural)   | `courses` |
| `module-name` (kebab singular)     | `course`  |
| `MODULE_NAME` (SCREAMING_SNAKE)    | `COURSE`  |

## Step 2 — Read the reference modules

**Always read these files first** so the generated code matches current conventions (imports, file layout, hook signatures, table column patterns, form orchestration, toast keys, etc.). Do not skip — patterns drift.

Primary reference: `teacher` module (closest to a generic CRUD with status + audit)

- `src/types/teacher.ts`
- `src/schemas/teacher.ts`
- `src/services/apis/teacher.ts`
- `src/hooks/apis/teachers/` (all files + `index.ts`)
- `src/hooks/forms/useCreateEditTeacher.tsx`
- `src/components/teachers/` (all files + `index.ts`, `constants.ts`)
- `src/pages/_main.teachers*.tsx` (all 6 route files)

Cross-check: `user` module (slightly different — uses `cmsUsers` i18n namespace, `CMS_USER` query key block, custom `ViewUser`)

- `src/types/user.ts`, `src/schemas/user.ts`, `src/services/apis/user.ts`
- `src/hooks/apis/users/` and `src/hooks/forms/useCreateEditUser.tsx`
- `src/components/users/`
- `src/pages/_main.users*.tsx`

Shared files to register the new module in (do not duplicate logic — add an entry):

- `src/types/auth.ts` — add the new value to the `SubjectName` enum.
- `src/constants/reactQuery.ts` — add a `<MODULE_NAME>` (or `CMS_<MODULE_NAME>`) block with at minimum `LIST` and `BY_ID` keys.
- `src/services/apis/index.ts` — re-export the new api module.
- `src/configs/menu.ts` — add an entry to `MENU_LIST` with `title`, `route`, `icon` (pick a `react-icons/lu` or `pi` icon), and `object: SubjectName.<X>`. The sidebar component itself handles permission gating via the `object` field — no `<Can>` wrapper needed in `menu.ts`.
- `src/i18n/locales/vi.ts` and `src/i18n/locales/en.ts` — add:
  - a `sidebar.<moduleNames>` label (and `nav.<moduleNames>` if present).
  - a `<i18n-namespace>: { ... }` block following the `teachers` shape: `createTitle`, `editTitle`, `detailTitle`, `searchPlaceholder`, `createButton`, `deleteTitle`, `deleteConfirm`, `toast.{create,update,delete}{Success,Error}`, `table.<columns>`, `form.<fields>`.

## Step 3 — Generate files

Mirror the **teacher** module 1:1 (use **user** as the reference if the new module needs a non-table detail like `ViewUser`'s identity/contact/access cards). Produce these files, substituting the derived names and the user's fields:

1. `src/types/<module-name>.ts` — `<ModuleName>`, `<ModuleName>Status` enum (`ACTIVE`/`INACTIVE`/`DELETED`), `Create<ModuleName>Payload`, `Edit<ModuleName>Payload`, `Get<ModuleNames>Params` extending `Params`, `Get<ModuleNames>Response = Response<<ModuleName>[]>`. Use `Audit`, `Params`, `Response` from `./common`.
   - **Edit payload shape**: `Partial<Omit<Create<ModuleName>Payload, 'someImmutableField'>> & { id: string }`, where the omitted keys are fields that cannot change after creation (e.g. `teacher.ts` omits `userId`). If nothing is immutable, use `Partial<Create<ModuleName>Payload> & { id: string }`.
   - **Gender re-export**: if the module exposes a `gender` field (mirroring `teacher`/`user`), follow the teacher convention of `import { Gender } from './common'; export { Gender };` so downstream feature files can import it from the module's own type file.
2. `src/schemas/<module-name>.ts` — `createEdit<ModuleName>Schema` (yup) and inferred `CreateEdit<ModuleName>FormData`. Use `VALIDATION_MESSAGE` from `./message`. Status fields: `yup.mixed<<ModuleName>Status>().oneOf(Object.values(<ModuleName>Status)).required(VALIDATION_MESSAGE.REQUIRED)`.
3. `src/services/apis/<module-name>.ts` — `<moduleName>Api` object with `getAll`, `getById`, `create`, `edit`, `delete` using the configured endpoint. Match `teacher.ts` exactly (default export). `delete` takes `ids: string[]` and sends `{ data: { ids } }`.
4. `src/services/apis/index.ts` — add `export { default as <moduleName>Api } from './<module-name>';`.
5. `src/hooks/apis/<module-names>/` — `useGet<ModuleNames>.tsx`, `useGet<ModuleName>ById.tsx`, `useCreate<ModuleName>.tsx`, `useEdit<ModuleName>.tsx`, `useDelete<ModuleName>.tsx`, optional `useGet<ModuleNames>Infinity.ts`, plus `index.ts` barrel. Toasts use `toast.success(t('<namespace>.toast.<event>Success'))` and `toast.danger(t('<namespace>.toast.<event>Error'), { description: err.message })` (note: `toast.danger`, **not** `toast.error`).
6. `src/hooks/forms/useCreateEdit<ModuleName>.tsx` — react-hook-form + yupResolver, mirrors `useCreateEditTeacher.tsx`.
7. `src/components/<module-names>/` — `<ModuleNames>Table.tsx` (TanstackTable), `<ModuleName>Form.tsx`, `Create<ModuleName>.tsx`, `Edit<ModuleName>.tsx`, `View<ModuleName>.tsx`, `Skeleton.tsx`, optional `constants.ts` (status/area color maps), and `index.ts` barrel that re-exports `<ModuleName>Skeleton` from `./Skeleton` (note: barrel renames `Skeleton` → `<ModuleName>Skeleton`).
8. `src/pages/_main.<module-names>.tsx` (Outlet wrapper), `_main.<module-names>._index.tsx` (list with search/pagination + `MyButton` create), `_main.<module-names>.create.tsx`, `_main.<module-names>.$id.tsx` (Outlet), `_main.<module-names>.$id._index.tsx` (view with `Breadcrumbs`), `_main.<module-names>.$id.edit.tsx` — wire up via `MyButton` (with `I={PermissionAction.X}` and `a={SubjectName.Y}` props), `Breadcrumbs` from `@heroui/react`, and the components above. Each page exports a `meta: MetaFunction` built from `pageMeta(title, description)` in `@/utils/metadata`.
9. Update `src/types/auth.ts`, `src/constants/reactQuery.ts`, `src/services/apis/index.ts`, both i18n locales, and `src/configs/menu.ts`.

## Step 4 — Verify

Run:

```bash
pnpm typecheck
pnpm lint:check
```

Fix any errors before reporting done. If route files were added, `pnpm typecheck` already runs `react-router typegen`.

## Conventions (non-negotiable)

- Imports use `@/...` alias, never relative paths across feature boundaries.
- No comments unless something is genuinely non-obvious.
- Toasts come from `@heroui/react`: `toast.success(...)` for success, `toast.danger(...)` for error (NOT `toast.error`).
- All mutation hooks invalidate the `LIST` query key on success and (where applicable) the `BY_ID` key via `queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.<MODULE>.LIST] })`.
- Permission gating in components uses `<MyButton I={PermissionAction.X} a={SubjectName.Y}>` from `@/components/shared/Button` (which internally wraps `<Can>`). Use `PermissionAction` and `SubjectName` enums from `@/types/auth` — never raw strings.
- The sidebar (`src/configs/menu.ts`) handles its own permission gating via the `object: SubjectName.X` field on each menu entry.
- Yup status fields: `yup.mixed<<ModuleName>Status>().oneOf(Object.values(<ModuleName>Status)).required(VALIDATION_MESSAGE.REQUIRED)`.
- Pages use `Breadcrumbs` and `Card` from `@heroui/react`; `Link`, `useNavigate`, `useParams`, `useSearchParams`, `type MetaFunction` from `react-router`.
- Component barrel exports the skeleton renamed: `export { default as <ModuleName>Skeleton } from './Skeleton';`.
- Commit message (if user asks to commit) follows Conventional Commits and the project's terse style: `feat: <module-name>` (e.g. `feat: teacher`), matching the existing history.
