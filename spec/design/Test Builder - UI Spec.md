# Test Builder — Screen · UI Spec

**Module:** Tests (Admin)
**Screen:** Test builder (`route = "test-builder"`, param `{ id }` — `'new'` or an existing test id)
**Source of truth:** `screens/test-builder.jsx` → `TestBuilder({ testId, nav })` (exported as `window.TestBuilder`)
**Depends on:** `window.TB` (model helpers/registries) + `window.QuestionGroupEditor` + `window.MiniModal` — all from `screens/question-editor.jsx` (see `Question Group Editor - UI Spec.md`).
**Audience:** Frontend + full-stack engineers
**Status:** Documents the screen as currently built. **⚠ Gap / Recommendation** marks behavior not yet implemented.

---

## 1. Purpose

The Test builder is the authoring surface for a test. It lets staff:

- Create a new test or edit an existing one (title, code, skill, status).
- Add / remove **sections** and set each section's skill and duration.
- Link (or inline-create) a **reading passage** per reading section.
- Add / edit / remove **question groups** within a section (the actual questions live in the right-panel editor).
- Track global question numbering across the whole test.
- Save as **draft** or run publish validation and **publish**.

It is a three-pane workspace: **section rail · section detail · question-group editor**.

---

## 2. Layout & components

Full-bleed workspace: outer `height: calc(100vh - 104px)`, `margin: -24` (cancels the app content padding), `flex-direction: column`. A fixed top bar over a 3-column grid.

```
┌──────────────────────────────────────────────────────────────────────┐
│ TopBar  [‹Tests] [CODE] Title……………  [skill▾]   NQ·Nsec [DRAFT] [Save][Publish] │
├───────────┬──────────────────────────────────┬───────────────────────┤
│ Section   │ Section detail                    │ Question group editor  │
│ rail      │  skill · duration                 │  (right panel — from   │
│ 230px     │  passage (reading)                │   question-editor.jsx) │
│           │  question groups list             │  420px                 │
│ [+ add]   │  [+ add group]                    │                        │
└───────────┴──────────────────────────────────┴───────────────────────┘
        grid-template-columns: 230px 1fr 420px
```

### 2.1 Top bar (`TopBar`)

- **Back** — `‹ Tests` button → `guardThen(() => nav('tests'))` (unsaved-edit guard, §5.3).
- **Code** — uppercasing text input, mono, in a `surface-2` chip; writes `model.code`.
- **Title** — borderless input, 18/600, underlines primary on focus; writes `model.title`.
- **Skill** — `<Select>` (width 150) of `TB.SKILL_OPTS` (Reading / Listening / Writing / Speaking / Full Test); writes `model.skill`.
- **Right cluster:** `{numbering.total}Q · {sections.length} sec` (mono); status `<Pill>` (`success`+`PUBLISHED` if `model.status==='ACTIVE'`, else `muted`+`DRAFT`); **Save draft** button (secondary; label cycles `Save draft → Saving… → Saved` with a `check` icon); **Publish** button (primary, `arrowRight` right icon).

### 2.2 Section rail (`SectionRail`, 230px, scrolls)

- `Sections` mono label.
- Per-section card (active = `primary-soft` bg + primary border):
  - drag handle (`chevUpDown`) + `Section {i+1}` + delete button (`trash`, stops propagation).
  - `<Pill tone={SKILL_TONE[skill]}>` + `{durationMinutes}min`.
  - meta line: `{passage ? '1 passage · '}{groups.length} group(s) · {ΣgroupCount}Q`.
  - `No questions` warning pill when the section has zero groups.
- **Add section** — dashed button → `addSection()` (appends a `TB.blankSection`, selects it).

### 2.3 Section detail (centre, `SectionDetail` / `EmptyCentre`)

When no section is selected → `EmptyCentre` (icon, "No section selected", `Add your first section` CTA).
When a section is selected (`maxWidth 760`, centered):

- **Header** — `Section {index+1}` + `Remove` button (→ `deleteSection`, confirm).
- **Skill + Duration** — two-col: skill `<Select>` (writes `section.skill`), duration number input (minutes).
- **Passage** (reading sections only, `SectionDivider label="Passage"`):
  - If linked: a primary-soft card with check tile, `passage.title`, `{paragraphs.length} paragraphs · updated {date}`, and a `Clear` button (`clearPassage`).
  - If not: `PassageSearch` typeahead (search `D.passages` by title/code, 7 results, `onMouseDown` select) + `New passage` button (opens `PassageDrawer`, §2.5).
- **Question groups** (`SectionDivider label="Question groups"`, right = `{Σ} questions`):
  - Empty → large dashed `Add the first question group` CTA (opens type picker).
  - Otherwise → one row per group: drag handle, index tile, `TB.Q_TYPE_LABEL[type]`, `groupRange · {count} item(s)`, `Edit` button, delete `x`. Row click and `Edit` both call `onEditGroup(id)`.
  - `Add question group` dashed button.

### 2.4 Right panel

`window.QuestionGroupEditor` when a group is being edited; otherwise `RightEmpty` ("Question editor" placeholder with an add-group CTA if a section exists). Full contract in the Question Group Editor spec.

### 2.5 Passage drawer (`PassageDrawer`)

Right-side drawer (620px) for inline passage creation, backdrop dims + blurs, `Esc` closes, body scroll locked:

- Title (required), Subtitle/source, paragraph-label style toggle (Numbers `1,2,3` / Letters `A,B,C`).
- Repeatable paragraph rows (label tile + textarea + remove; min 1). `Add paragraph`.
- Footer: paragraph count + `Cancel` / `Save passage` (enabled when title + first paragraph filled).
- On save: builds a full passage record (code auto-derived, word count + read-minutes computed), pushes to `D.passages`, and selects it into the current section via `createPassage`.

---

## 3. Data model

### 3.1 Builder working model (in-memory, not the stored shape)

```
model = { id, code, title, skill, status: 'DRAFT'|'ACTIVE', sections: Section[] }
Section = { id, skill, durationMinutes, passage: PassageRef|null, groups: Group[] }
PassageRef = { id, title, paragraphs: [{letter}], updatedAt }
Group = see Question Group Editor spec §3
```

- **New** (`id==='new'` or falsy): `{ id: TB.uid('TST-'), code:'', title:'', skill:'READING', status:'DRAFT', sections:[] }`.
- **Existing:** `seedFromTest(test)` maps a stored `D.tests` record into the working model:
  - stored `skill` (`Reading`…) → builder skill enum (`READING`…).
  - each stored `sections[]` item → a `TB.blankSection`, name copied, duration split evenly across sections.
  - reading sections try to attach a real passage from `D.passages` (matched via `usedIn` or title substring).
  - **⚠ Demo seeding:** only the **first reading section** is populated with two sample groups (`sampleReadingGroups`); all other sections come back with **empty** `groups`. This is illustrative, not a faithful load of stored questions — real questions are not persisted today (§6).

### 3.2 Numbering (`buildNumbering(model)`)

Walks sections→groups in order, assigning each group a global start number; returns `{ map: {groupId→start}, total }`. Diagram groups count `diagram.labels.length`; all others count `questions.length`. Drives the top-bar `NQ`, per-group ranges, and the editor's `startNumber`.

### 3.3 Save / publish → stored shape (`writeBack(status)`)

Maps the working model back to a `D.tests` record and upserts it (`findIndex` by id), then dispatches `me:datachange` (`{collection:'tests'}`) so the list refreshes:

- `skill` enum → display (`READING`→`Reading`…, `FULL`→`Full Test`).
- `durationMin` = Σ section durations; `totalQuestions` = `numbering.total`.
- `sections[]` = `{ n, name (or passage title / "Section n"), questions: Σ groupCount, type: label of first group }`.
- **⚠ Lossy:** `band` is hardcoded `'5.0–7.0'`, `type` hardcoded `'PRACTICE'`, `attempts` reset to `0`, `avgBand` null, `createdBy` hardcoded `'TCH-001'`. See §6.

### 3.4 ⚠ Suggested API contract (full-stack)

- `POST /api/tests` (create) / `PUT /api/tests/:id` (save draft) / `POST /api/tests/:id/publish`.
- Persist the **full** section → group → question tree (the current build discards questions on write-back).
- `band`, `type`, `createdBy` must be **real editable fields**, not constants.
- Passage create → `POST /api/passages` returning the id, then link by reference on the section.
- Server re-validates publish rules (§5.2) and rejects incomplete tests.

---

## 4. Actions & state transitions

| Action                          | Handler                                            | Effect                                                                                            |
| ------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Add section                     | `addSection`                                       | append `TB.blankSection(skill)`, select it, clear editing group                                   |
| Delete section                  | `deleteSection`                                    | confirm modal → remove; reselect first remaining                                                  |
| Select section                  | `onSelect`                                         | behind `guardThen` (unsaved guard); sets active, clears editing group                             |
| Patch section                   | `setSection(id, patch)`                            | merge skill / duration / passage / groups                                                         |
| Add group                       | picker → `addGroupOfType`                          | append `TB.blankGroup(type)`, open it in the editor                                               |
| Edit group                      | `openGroup`                                        | behind `guardThen`; set `editingGroup`                                                            |
| Save group                      | `saveGroup(draft)`                                 | replace group in section, clear dirty, toast "Question group saved"                               |
| Delete group                    | `deleteGroup`                                      | confirm modal → remove                                                                            |
| Select / clear / create passage | `selectPassage` / `clearPassage` / `createPassage` | reading only                                                                                      |
| Save draft                      | `saveDraft`                                        | `saving` → `writeBack('DRAFT')` (fake 550ms) → `saved` (1.8s) → `idle`                            |
| Publish                         | `tryPublish`                                       | run `publishChecks`; if issues → `pubModal`; else `writeBack('ACTIVE')`, set status ACTIVE, toast |

---

## 5. Overlays, validation & guards

### 5.1 Overlays (all `window.MiniModal` except the drawer)

- **Group-type picker** (`picker`, wide) — 2-col grid of the 8 `TB.Q_TYPES` (icon tile + label + short description); pick → `addGroupOfType`.
- **Passage drawer** (`passageDrawer`) — §2.5.
- **Confirm** (`confirm`) — generic delete confirm (section / group), warning tone.
- **Leave guard** (`leaveGuard`) — "Unsaved changes … Leave anyway?" when navigating away with a dirty editor.
- **Publish blocker** (`pubModal`) — "Cannot publish yet" listing the failed checks.

### 5.2 Publish validation (`publishChecks`) — returns a list of blocking issues

- Title required. Code required. At least one section.
- Each section must have ≥ 1 question group.
- A section containing a `MATCHING_PARAGRAPH` group must have a linked passage.

If any issue exists, publish is blocked and the list is shown in `pubModal`.

### 5.3 Unsaved-changes guard (`guardThen`)

`groupDirty` (raised by the editor via `onDirty`) gates section-switch, group-open, back-nav, save, and publish: if dirty, the action is deferred behind the leave-guard modal; confirming discards editor edits and runs the pending action.

---

## 6. States & ⚠ gaps

| Area                     | Current                                                                          | Required                                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Question persistence** | `writeBack` discards the section→group→question tree; only counts/labels survive | ⚠ Persist the full tree; reload it in `seedFromTest`.                                                                      |
| **Seeded content**       | Only the first reading section gets demo groups; others load empty               | ⚠ Load real stored questions for every section.                                                                            |
| **Lossy fields**         | `band`/`type`/`createdBy` hardcoded; `attempts` reset to 0 on every save         | ⚠ Make them real fields; never reset attempts.                                                                             |
| **Persistence**          | In-memory `D.tests` push + custom event; lost on reload                          | ⚠ Wire to the API (§3.4); optimistic update + error rollback.                                                              |
| **Reordering**           | Drag handles (`chevUpDown`) on sections and groups are **decorative** — no DnD   | ⚠ Implement drag-reorder (renumbering must follow).                                                                        |
| **Autosave**             | Manual Save draft only (fake latency)                                            | ⚠ Debounced autosave + real save/error indicator.                                                                          |
| **Import test**          | Entry lives on the list; no flow                                                 | ⚠ Build file → parse → preview → commit.                                                                                   |
| **Permissions**          | No gating                                                                        | ⚠ Gate create/edit/publish per the `tests` module; enforce server-side.                                                    |
| **Responsive**           | Fixed `230 / 1fr / 420` grid; assumes wide desktop                               | ⚠ Below ~1100px, collapse to a single active pane + a section/group switcher; builder is desktop-first but must not break. |

---

## 7. Interaction & navigation flows

```
Test builder
 ├─ ‹ Tests / back .............. guardThen → tests
 ├─ edit code/title/skill ....... mutate model (top bar)
 ├─ add / delete / select section
 ├─ link / create passage (reading)
 ├─ add group ................... type picker → new group opens in editor
 ├─ edit group .................. guardThen → editor (right panel)
 ├─ Save draft .................. writeBack('DRAFT') → me:datachange
 └─ Publish ..................... publishChecks → pubModal | writeBack('ACTIVE')
```

- Route `test-builder` keeps the **Tests** nav item active (see `app.jsx`).
- After write-back, the list re-renders via the `me:datachange` event / `useDataVersion()`.
- Entry points: list `New test`/`Edit`, detail `Edit test`, detail structure-row `edit`.

---

## 8. Acceptance checklist

- [ ] New vs. existing: `id==='new'` starts blank; an existing id loads the full stored test (all sections + questions), not just the first reading section.
- [ ] Top bar edits (code upper-cased, title, skill) write to the model; `NQ · Nsec` and status pill stay accurate.
- [ ] Section CRUD works; deleting the active section reselects a neighbor; duration sums into `durationMin`.
- [ ] Reading sections can link an existing passage or create one inline; non-reading sections hide the passage block.
- [ ] Global numbering is contiguous across sections/groups and matches the editor's `startNumber`.
- [ ] Save draft persists via API; Publish runs all `publishChecks` and blocks with a clear issue list.
- [ ] `band` / `type` / `createdBy` persist as real values; `attempts` never reset.
- [ ] Unsaved-editor guard fires on section-switch, group-open, back-nav, save, and publish.
- [ ] Drag-reorder of sections and groups works and renumbers correctly.
- [ ] Create/edit/publish gated by `tests` perms and enforced server-side.
- [ ] Layout degrades gracefully below the 3-pane desktop width.
