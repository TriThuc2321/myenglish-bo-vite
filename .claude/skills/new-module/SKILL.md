---
name: new-module
description: Scaffold a new CRUD module (types, schema, API, hooks, components, pages, i18n, query keys, sidebar) by mirroring the existing `passage` and `user` modules. Trigger when the user asks to "create/add a new module", "scaffold a resource", or "implement module <X>".
---

# new-module

Generate a complete CRUD module that exactly mirrors the patterns used by the `passage` and `user` modules already in this repo. Do **not** invent new patterns — read the reference files first, then copy their structure with renamed identifiers.

## Step 1 — Gather inputs

Ask the user (only if missing) for:

- **ModuleName** (PascalCase singular, e.g. `Course`)
- **API endpoint** (e.g. `/cms-courses`)
- **Fields** — list of `name:type` pairs (e.g. `title:string, level:number, status:CourseStatus`). If omitted, default to `name:string, status:<ModuleName>Status`.
- **CASL subject** — defaults to `<ModuleNames>` (PascalCase plural).
- Whether an **infinite-scroll** list hook is needed (passage has one; user does not).

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

Reference: `passage` module

- `src/types/passage.ts`
- `src/schemas/passage.ts`
- `src/services/apis/passage.ts`
- `src/services/apis/index.ts`
- `src/hooks/apis/passages/` (all files + `index.ts`)
- `src/hooks/forms/useCreateEditPassage.tsx`
- `src/components/passages/` (all files + `index.ts`, `constants.ts`)
- `src/pages/_main.passages*.tsx` (all 6 route files)

Reference: `user` module (cross-check for variations)

- `src/types/user.ts`, `src/schemas/user.ts`, `src/services/apis/user.ts`
- `src/hooks/apis/users/` and `src/hooks/forms/useCreateEditUser.tsx`
- `src/components/users/`
- `src/pages/_main.users*.tsx`

Also read these shared files (do not duplicate logic in them — register the new module instead):

- `src/constants/reactQuery.ts` — add a `<MODULE_NAME>` block of query keys
- `src/services/apis/index.ts` — re-export the new api
- `src/i18n/locales/vi.ts` and `src/i18n/locales/en.ts` — add the namespace (`<moduleNames>: { ... }`) following the `passages` shape (createTitle, editTitle, detailTitle, searchPlaceholder, createButton, deleteTitle, deleteConfirm, toast.{create,update,delete}{Success,Error}, plus column labels)
- `src/components/layout/` sidebar source (find via `grep -rn "sidebar.passages" src/`) — add a sidebar entry guarded by `<Can I="read" a="<ModuleNames>">`
- `src/types/role.ts` — add `<ModuleNames>` to the permission subjects union if applicable

## Step 3 — Generate files

Mirror the **passage** module 1:1 (or **user** if the new module needs a non-table detail like `ViewUser`). Produce these files, substituting the derived names and the user's fields:

1. `src/types/<module-name>.ts` — `<ModuleName>`, `<ModuleName>Status` enum (ACTIVE/INACTIVE/DELETED), `Create<ModuleName>Payload`, `Edit<ModuleName>Payload`, `Get<ModuleNames>Params`, `Get<ModuleNames>Response`. Use `Audit`, `Params`, `Response` from `./common`.
2. `src/schemas/<module-name>.ts` — `createEdit<ModuleName>Schema` (yup) and inferred `CreateEdit<ModuleName>FormData`. Use `VALIDATION_MESSAGE` from `./message`.
3. `src/services/apis/<module-name>.ts` — `getAll`, `getById`, `create`, `edit`, `delete` using the configured endpoint. Match `passage.ts` exactly.
4. `src/services/apis/index.ts` — add the re-export.
5. `src/hooks/apis/<module-names>/` — `useGet<ModuleNames>.tsx`, `useGet<ModuleName>ById.tsx`, `useCreate<ModuleName>.tsx`, `useEdit<ModuleName>.tsx`, `useDelete<ModuleName>.tsx`, optional `useGet<ModuleNames>Infinity.ts`, plus `index.ts` barrel.
6. `src/hooks/forms/useCreateEdit<ModuleName>.tsx` — react-hook-form + yupResolver, mirrors `useCreateEditPassage.tsx`.
7. `src/components/<module-names>/` — `<ModuleNames>Table.tsx` (TanstackTable), `<ModuleName>Form.tsx`, `Create<ModuleName>.tsx`, `Edit<ModuleName>.tsx`, `View<ModuleName>.tsx`, `Skeleton.tsx`, optional `constants.ts`, and `index.ts` barrel.
8. `src/pages/_main.<module-names>.tsx`, `_main.<module-names>._index.tsx`, `_main.<module-names>.create.tsx`, `_main.<module-names>.$id.tsx`, `_main.<module-names>.$id._index.tsx`, `_main.<module-names>.$id.edit.tsx` — wire up via `<Can>`, breadcrumbs, and the components above.
9. Update `src/constants/reactQuery.ts`, both i18n locales, and the sidebar.

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
- Toasts use `toast.success(t('<moduleNames>.toast.<event>'))` from `@heroui/react`.
- All mutation hooks invalidate the `LIST` query key on success and (where applicable) the `BY_ID` key.
- Permission gating uses `<Can I="..." a="<ModuleNames>">` — actions are typically `read`, `create`, `update`, `delete`.
- Yup status fields: `yup.mixed<<ModuleName>Status>().oneOf(Object.values(<ModuleName>Status)).required(...)`.
- Commit message (if user asks to commit) follows Conventional Commits: `feat: module <module-name>`.
