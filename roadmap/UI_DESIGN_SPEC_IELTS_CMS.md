# UI Design Spec — IELTS CMS Test Builder (Phase 2)

> **Audience**: Frontend / design team (backoffice)
> **Purpose**: Pixel-level guidance for the admin CMS — creating and managing IELTS tests
> **Scope**: Backoffice app (`myenglish-bo-vite`) — screens A1–A3 only
> **Related spec**: `UI_DESIGN_SPEC_IELTS_STUDENT.md` — student-facing test-taking app

---

## 0. Design System Reference

This app uses **HeroUI v3** (`@heroui/react`) + **Tailwind CSS v4**. All new screens must follow the existing backoffice conventions.

### Existing patterns to follow

| Pattern                       | Where to find                                                       |
| ----------------------------- | ------------------------------------------------------------------- |
| List page with search + table | `src/pages/_main.passages._index.tsx` + `PassagesTable.tsx`         |
| Create / Edit form page       | `src/pages/_main.passages.create.tsx` + `PassageForm.tsx`           |
| Table component               | `src/components/shared/table/TanstackTable.tsx`                     |
| Breadcrumbs, page header      | Mirror passages pages exactly                                       |
| Toast notifications           | HeroUI `addToast` (already wired in `src/root.tsx`)                 |
| Confirm dialog / delete       | Follow pattern in passages delete flow                              |
| Drawer (right-side panel)     | HeroUI `<Drawer>` — use for inline sub-forms (e.g. Passage builder) |

### HeroUI component mapping

| UI element                 | HeroUI component                                                      |
| -------------------------- | --------------------------------------------------------------------- |
| Skill badge chip           | `<Chip>` with `color` variant                                         |
| Typeahead passage search   | `<Autocomplete>`                                                      |
| Question type select       | `<Select>` + `<SelectItem>`                                           |
| Duration number input      | `<NumberInput>`                                                       |
| Segmented TFN/YNN picker   | `<ButtonGroup>` of `<Button variant="bordered">`                      |
| Drag-sortable list         | `@dnd-kit/sortable` (already used elsewhere) — wrap items in `<Card>` |
| Inline passage drawer      | `<Drawer placement="right" size="lg">`                                |
| Question tabs (Q1, Q2…)    | `<Tabs>` + `<Tab>`                                                    |
| Publish confirmation modal | `<Modal>` + `<ModalContent>`                                          |
| Save Draft label spinner   | `<Spinner size="sm">` inside `<Button>`                               |
| Word bank chip             | `<Chip variant="bordered" onClose={…}>`                               |
| Warning / info banner      | `<Alert color="warning">` / `<Alert color="primary">`                 |

### Color tokens (Tailwind CSS v4 + HeroUI oklch)

Use semantic color names — do NOT hardcode hex values.

| Purpose                       | Token                      |
| ----------------------------- | -------------------------- |
| Primary action                | `primary` (HeroUI default) |
| Danger / delete               | `danger`                   |
| Warning (unanswered, draft)   | `warning`                  |
| Success (published, complete) | `success`                  |
| Skill: READING                | `<Chip color="primary">`   |
| Skill: LISTENING              | `<Chip color="success">`   |
| Skill: WRITING                | `<Chip color="warning">`   |
| Skill: SPEAKING               | `<Chip color="secondary">` |
| Skill: Full Test (null)       | `<Chip color="default">`   |

### Typography

Follow HeroUI default scale. Page titles: `text-2xl font-semibold`. Section headings: `text-base font-medium`. Table cell text: `text-sm`.

### Dark mode

ThemeProvider is mounted in `src/root.tsx`. All components must work in both light and dark themes — use HeroUI semantic color tokens only, never hardcode light-specific colors.

---

## 1. Data Model Quick Reference

```
Test
  └── TestSection[]            ← ordered, each has duration_minutes + skill
        ├── Passage             ← title + Paragraph[] (ordered text blocks)
        └── QuestionGroup[]    ← ordered, each has questionType + guideline
              └── Question[]   ← ordered, content (jsonb), questionNumber (global, auto-incremented)
                    └── QuestionAnswer   ← correctAnswer (jsonb), explanation
```

**Question types**

| Enum                        | Display label                             |
| --------------------------- | ----------------------------------------- |
| `SINGLE_ANSWER`             | Multiple Choice — single                  |
| `MULTIPLE_ANSWER`           | Multiple Choice — multiple                |
| `TFN_ANSWER`                | True / False / Not Given                  |
| `YNN_ANSWER`                | Yes / No / Not Given                      |
| `MATCHING_PARAGRAPH`        | Matching Headings / Information           |
| `NOTE_COMPLETION_WITH_HINT` | Note / Summary Completion (with word box) |
| `NOTE_COMPLETION_NO_HINT`   | Note / Summary Completion (free fill)     |
| `DIAGRAM_LABEL_COMPLETION`  | Diagram Label Completion                  |

---

## 2. Screen Inventory

| #   | Screen          | Route                        | App        |
| --- | --------------- | ---------------------------- | ---------- |
| A1  | Test List       | `/tests`                     | Backoffice |
| A2  | Test Builder    | `/tests/new` · `/tests/:id`  | Backoffice |
| A3  | Question Editor | Embedded in A2 (right panel) | Backoffice |

---

## A1 — Test List Page

### Route

`/tests`

### Layout

Mirror the existing **Passages list page** (`_main.passages._index.tsx`) exactly — same page header pattern, same `TanstackTable`, same search + filter toolbar.

```
┌─────────────────────────────────────────────────────────────────────┐
│ Tests                                          [ + Create Test ]    │
├─────────────────────────────────────────────────────────────────────┤
│ 🔍 Search title or code…              Skill ▾   Status ▾           │
├──────────┬──────────────────────┬────────┬────────┬────────────────┤
│ Code     │ Title                │ Skill  │Sections│ Last Updated   │
├──────────┼──────────────────────┼────────┼────────┼────────────────┤
│ IELTS-R1 │ Academic Reading 1   │READING │   3    │ 09 Jun 2025    │
│ IELTS-L1 │ Listening Practice 1 │LISTEN  │   4    │ 07 Jun 2025    │
│ PLACE-01 │ Placement Test Full  │ —      │   4    │ 05 Jun 2025    │
└──────────┴──────────────────────┴────────┴────────┴────────────────┘
│ « 1 2 3 »                                               10 / page ▾│
```

- Row click → navigate to `/tests/:id`
- "+ Create Test" → navigate to `/tests/new`
- Skill column → `<Chip>` with color per token table above
- Bulk delete → checkbox column + "Delete selected" toolbar (same as passages)
- Status column → same `<Chip>` pattern as passages (`ACTIVE`=success, `DRAFT`=warning)

---

## A2 — Test Builder Page

### Route

`/tests/new` (create) · `/tests/:id` (edit)

### Layout — 3-column builder

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Tests   /   [IELTS-R1] Academic Reading 1          [Save Draft] [Publish] │
├───────────────┬──────────────────────────────┬──────────────────────────────┤
│  SECTIONS     │  SECTION DETAIL              │  QUESTION EDITOR             │
│  220px fixed  │  flex-1                      │  400px fixed                 │
│               │                              │                              │
│  + Add Section│                              │                              │
│  ─────────    │                              │                              │
│  § Section 1  │                              │                              │
│    Reading    │                              │                              │
│    20 min     │                              │                              │
│  ─────────    │                              │                              │
│  § Section 2  │                              │                              │
│  ─────────    │                              │                              │
│  § Section 3  │                              │                              │
│               │                              │                              │
└───────────────┴──────────────────────────────┴──────────────────────────────┘
```

**Column widths**: 220px fixed · flex-1 · 400px fixed
**Tablet (768–1279px)**: stacked accordion — Section list → Section detail → Question editor
**Mobile (< 768px)**: not supported — same "use desktop" gate as test-taking

**Empty state** (new test, no sections yet): centre panel shows illustration + "Add your first section →" CTA.

---

### A2.1 Test Header (top bar)

Fields inline in top bar, editable on click:

| Field | HeroUI input                                   | Validation                |
| ----- | ---------------------------------------------- | ------------------------- |
| Title | `<Input variant="underlined">` (h1 style)      | Required, max 255         |
| Code  | `<Input variant="bordered">` rendered as badge | Required, unique, max 255 |
| Skill | `<Select>` (IELTSSkill enum + "Full Test")     | Optional                  |

- **[Save Draft]** — `PATCH /tests/:id`, non-blocking. Button shows `<Spinner size="sm">` while in-flight, then "Saved ✓" for 2s.
- **[Publish]** — `PATCH /tests/:id { status: "ACTIVE" }`. Disabled until test has ≥ 1 section with ≥ 1 question group. On click: show validation modal listing unmet conditions before blocking.
- Code uniqueness: check `GET /tests?keyword=<code>` on blur; show inline error if duplicate found.

---

### A2.2 Left Rail — Section List

```
┌─────────────────────┐
│  Sections           │
│                     │
│  ┌──────────────┐   │
│  │ ⠿ § 1 Read  │ ← selected (primary border)
│  │   20 min     │   │
│  │   1 passage  │   │
│  │   3 groups   │   │
│  └──────────────┘   │
│  ┌──────────────┐   │
│  │ ⠿ § 2 Read  │   │
│  │   20 min     │   │
│  └──────────────┘   │
│                     │
│  [ + Add Section ]  │
└─────────────────────┘
```

- HeroUI `<Card isPressable>` per section; selected = `border-primary`
- Drag handle `⠿` on left — reorder via `@dnd-kit/sortable`; fires `PATCH /test-sections/:id { order }` on drop
- Hover card → show `<Button isIconOnly variant="light" color="danger">` trash icon
- Delete confirms with modal: "Delete section and all its questions?"
- Warning badge `<Chip color="warning" size="sm">` on section card if it has 0 question groups (blocks Publish)
- "+ Add Section" → `POST /test-sections` immediately → auto-select new section in centre panel

---

### A2.3 Centre Panel — Section Detail

```
┌────────────────────────────────────────────────────────────────┐
│ Section 1                                          [✕ Remove]  │
│                                                                │
│ Skill          [READING ▾]                                     │
│ Duration       [20        ] minutes                            │
│                                                                │
│ ─── Passage ──────────────────────────────────────────────────│
│                                                                │
│  [🔍 Search existing passage…           ]   [ + New Passage ]  │
│                                                                │
│  ┌───────────────────────────────────────────────────┐        │
│  │ ✓  The Rise of Electric Vehicles                  │        │
│  │    4 paragraphs · Updated 08 Jun 2025             │        │
│  └───────────────────────────────────────────────────┘        │
│  [× Clear passage]                                             │
│                                                                │
│ ─── Question Groups ──────────────────────────────────────────│
│                                                                │
│  ┌─────────────────────────────────────────────────┐          │
│  │ ⠿  Group 1 · SINGLE_ANSWER · Q1–Q7  [Edit] [✕] │          │
│  └─────────────────────────────────────────────────┘          │
│  ┌─────────────────────────────────────────────────┐          │
│  │ ⠿  Group 2 · TFN_ANSWER   · Q8–Q13 [Edit] [✕] │          │
│  └─────────────────────────────────────────────────┘          │
│                                                                │
│  [ + Add Question Group ]                                      │
└────────────────────────────────────────────────────────────────┘
```

**Passage search** — HeroUI `<Autocomplete>` querying `GET /passages?keyword=…`; shows title + paragraph count in item label.

**"+ New Passage"** → opens HeroUI `<Drawer placement="right" size="lg">` with inline Passage builder (see A2.5). Does NOT navigate away from builder.

**"+ Add Question Group"** → opens a bottom sheet / modal with type picker (8 question type options as `<RadioGroup>`), then populates right panel with question editor for the selected type.

**Group card** — HeroUI `<Card>` with drag handle. Shows: group number, question type label, question range (Q1–Q7). [Edit] opens right panel. [✕] deletes after confirm.

**Section with no groups** — groups area shows a prominent "+ Add Question Group" `<Button variant="bordered" fullWidth>` CTA instead of empty space.

---

### A2.4 Right Panel — Question Group Editor

Activated when user clicks "Edit" on a group or selects a type from "+ Add Question Group".

```
┌─────────────────────────────────────────────────────────────────┐
│ Group 1                                                         │
│                                                                 │
│ Type      [ SINGLE_ANSWER — Multiple Choice (single) ▾ ]       │
│                                                                 │
│ Guideline                                                       │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ Choose the best answer A, B, C or D.                    │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ Questions ─────────────────────────────────────────────────    │
│                                                                 │
│  [Q1]  [Q2]  [Q3]  [+ Add Q]                                   │
│                                                                 │
│  ┌──────────────── Q1 ─────────────────────────────────┐       │
│  │ Q# 5  ← auto-assigned, read-only display            │       │
│  │                                                     │       │
│  │ [Question form — varies by type, see A3]            │       │
│  │                                                     │       │
│  │ ─── Answer ──────────────────────────────────────── │       │
│  │ [Answer form — varies by type, see A3]              │       │
│  │                                                     │       │
│  │ Explanation (optional)                              │       │
│  │ ┌─────────────────────────────────────────────┐    │       │
│  │ │                                             │    │       │
│  │ └─────────────────────────────────────────────┘    │       │
│  └─────────────────────────────────────────────────── ┘       │
│                                                                 │
│             [ Cancel ]          [ Save Group ]                  │
└─────────────────────────────────────────────────────────────────┘
```

**Question number (`questionNumber`)** — auto-assigned sequentially across the entire test (global, not per-section). Display as read-only badge `<Chip>`. Frontend computes next available number from existing groups; server validates uniqueness on save.

**Question tabs** — HeroUI `<Tabs>` component. Each tab labelled "Q1", "Q2", etc. "+ Add Q" tab appends a new question to the group.

**Changing Type** — show confirm modal: "Changing type will clear all questions in this group. Continue?" Only wipe on confirm.

**[Save Group]** — `POST /question-groups` (create) or `PATCH /question-groups/:id` (update). Button shows spinner while in-flight.

**Unsaved changes guard** — if user clicks away with unsaved edits: modal "You have unsaved changes. Leave anyway?"

Group order within section is drag-sortable (same `@dnd-kit` pattern). Fires `PATCH /question-groups/:id { order }` on drop.

---

## A3 — Question Forms by Type

Each type has two sub-forms embedded in the right panel: **Question content** and **Correct answer**.

---

### A3.1 SINGLE_ANSWER — Multiple Choice (1 correct)

**Question form**

```
Question text *
┌────────────────────────────────────────────────────┐
│ The main purpose of the passage is to…             │
└────────────────────────────────────────────────────┘

Options (min 2, max 6)
  A  [ describe a scientific discovery              ] [✕]
  B  [ analyse competing theories                   ] [✕]
  C  [ summarise historical events                  ] [✕]
  D  [ evaluate government policy                   ] [✕]
     [ + Add option ]
```

Each option row: auto-labelled A, B, C… HeroUI `<Input>` + `<Button isIconOnly color="danger">` remove.

**Answer form**

```
Correct option   ○ A  ○ B  ● C  ○ D
```

HeroUI `<RadioGroup>` with inline option labels.

**`content` shape**

```json
{ "text": "The main purpose…", "options": [{"id":"uuid","label":"A","text":"describe…"}, …] }
```

**`correctAnswer` shape**

```json
{ "option_id": "uuid-of-C" }
```

---

### A3.2 MULTIPLE_ANSWER — Multiple Choice (N correct)

Same as A3.1 plus:

```
Number of correct answers *   [ 2 ▾ ]
```

HeroUI `<Select>` with options 2–(option count - 1).

**Answer form** — HeroUI `<CheckboxGroup>` instead of RadioGroup.

**`correctAnswer` shape**

```json
{ "option_ids": ["uuid-A", "uuid-C"] }
```

---

### A3.3 TFN_ANSWER / YNN_ANSWER — True-False-Not Given / Yes-No-Not Given

**Question form**

```
Statement *
┌────────────────────────────────────────────────────┐
│ The author believes renewable energy is more…      │
└────────────────────────────────────────────────────┘
```

**Answer form**

HeroUI `<ButtonGroup>` (same visual as student-facing for consistency):

```
Correct answer   [ TRUE ]  [ FALSE ]  [ NOT GIVEN ]
```

Selected button: `variant="solid" color="primary"`. Unselected: `variant="bordered"`.

**`content` shape**

```json
{ "statement": "The author believes…" }
```

**`correctAnswer` shape**

```json
{ "value": "TRUE" }
```

---

### A3.4 MATCHING_PARAGRAPH — Matching Headings / Information

**Question form** — one `<Input>` row per question in the group:

```
Statement for Q11 *
┌────────────────────────────────────────────────────┐
│ Evidence of early migration                        │
└────────────────────────────────────────────────────┘
```

Options auto-populated from the linked passage's `markedBy` field (A–G or 1–7).
If no passage is linked: show `<Alert color="warning">` "Link a passage to this section to auto-populate paragraph labels."

**Answer form** — one `<Select>` per question:

```
Q11 correct paragraph  [ A ▾ ]
Q12 correct paragraph  [ C ▾ ]
```

**`content` shape** (per question)

```json
{ "statement": "Evidence of early migration" }
```

**`correctAnswer` shape** (per question)

```json
{ "paragraph_label": "A" }
```

---

### A3.5 NOTE_COMPLETION_WITH_HINT — Fill-in with word box

**Word bank** — stored in `QuestionGroup.content.word_bank: string[]` (backend must support this field on `QuestionGroup`).

**Group-level word bank editor:**

```
Word bank
  [ significant ✕ ] [ dramatic ✕ ] [ coastal ✕ ] [ annual ✕ ]   [ + Add word ]
```

HeroUI `<Chip variant="bordered" onClose={removeWord}>`. "+ Add word" → inline `<Input>` + confirm.

**Question form**

```
Text before blank *    [ The study found a ]
Text after blank *     [ increase in temperature ]
Max words hint         [ ONE WORD ▾ ]
```

`<Select>` options: ONE WORD · TWO WORDS · ONE WORD/NUMBER · NO MORE THAN TWO WORDS.

**Answer form**

```
Correct word   [ significant ▾ ]   (dropdown sourced from word bank above)
```

`<Select>` populated from `QuestionGroup.content.word_bank`.

**`content` shape** (per question)

```json
{
  "before": "The study found a",
  "after": "increase in temperature",
  "max_words": "ONE WORD"
}
```

**`correctAnswer` shape**

```json
{ "value": "significant" }
```

---

### A3.6 NOTE_COMPLETION_NO_HINT — Free fill-in

**Question form**

```
Text before blank *    [ The researcher concluded the effect was ]
Text after blank       [ (leave empty if blank is at end of sentence) ]
Max words constraint   [ TWO WORDS ▾ ]
```

**Answer form** — multiple accepted values (alt spellings):

```
Accepted answers
  [ largely irrelevant ]  [✕]
  [ irrelevant           ]  [✕]
  [ + Add accepted answer ]
```

Dynamic list of `<Input>` fields.

**`correctAnswer` shape**

```json
{ "accepted_values": ["largely irrelevant", "irrelevant"] }
```

---

### A3.7 DIAGRAM_LABEL_COMPLETION — Label a diagram

**Question form**

```
Diagram image *
  [ Upload image ]  or  [ Enter image URL ]
  [ Preview thumbnail ]

Label placement
  ○  Listed below image   (default — simpler)
  ○  Positioned on image  (x/y coordinates)

Label # │ Hint text (optional)  │ X %   │ Y %
  [ 21 ] │ [ e.g. rotating part ] │ [42.5] │ [30.1]   (only shown if "Positioned")
  [ 22 ] │ [ e.g. control valve ] │ [68.0] │ [55.4]
  [ + Add label ]
```

**Positioned mode UX**: after uploading the image, admin sees a preview with existing label markers (numbered circles). Clicking "+ Add label" and then clicking on the image sets the x/y percentage automatically. Manual X/Y `<NumberInput>` fields allow fine-tuning. Drag existing marker to reposition.

**Listed mode UX**: labels are shown as a simple ordered list below the image — no coordinates needed.

**Answer form**

```
Label 21 answer *  [ turbine   ]
Label 22 answer *  [ valve     ]
```

One `<Input>` per label, in order.

**`content` shape**

```json
{
  "image_url": "https://cdn…/diagram.png",
  "layout": "positioned",
  "labels": [
    { "number": "21", "hint": "rotating part", "x": 42.5, "y": 30.1 },
    { "number": "22", "hint": "control valve", "x": 68.0, "y": 55.4 }
  ]
}
```

**`correctAnswer` shape**

```json
{ "labels": { "21": "turbine", "22": "valve" } }
```

---

## A2.5 — Inline Passage Builder (Drawer)

Triggered by "+ New Passage" inside Section Detail. Opens as HeroUI `<Drawer placement="right" size="lg">`.

```
┌────────────────────────────────────────────────────────┐
│ New Passage                                       [✕]  │
│                                                        │
│ Title *                                                │
│ ┌──────────────────────────────────────────────────┐  │
│ │ The Rise of Electric Vehicles                    │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ Subtitle                                               │
│ ┌──────────────────────────────────────────────────┐  │
│ │ A look at the global transition to EVs           │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ Paragraph labels   ○ Numbers (1, 2, 3…)  ● Letters (A, B, C…)
│                                                        │
│ Paragraphs                                             │
│  ┌── A ───────────────────────────────────────────┐   │
│  │ ⠿  The global shift toward electric vehicles…  │   │
│  └────────────────────────────────────────────────┘   │
│  ┌── B ───────────────────────────────────────────┐   │
│  │ ⠿  Governments across Europe and Asia have…    │   │
│  └────────────────────────────────────────────────┘   │
│  [ + Add Paragraph ]                                   │
│                                                        │
│         [ Cancel ]        [ Save Passage ]             │
└────────────────────────────────────────────────────────┘
```

- **[Save Passage]** → `POST /passages` → passage immediately selected in the section (close drawer, update passage picker).
- Paragraph textarea: HeroUI `<Textarea minRows={3}>`; auto-expands. Plain text only.
- Paragraphs are reorderable via `@dnd-kit` drag handle `⠿`. Min 1 paragraph enforced.
- Delete paragraph: hover → show trash `<Button isIconOnly color="danger" variant="light">`.

---

## A4 — Save & Validation Flow

### Save strategy

| Action                         | API call                                                | When                           |
| ------------------------------ | ------------------------------------------------------- | ------------------------------ |
| Edit test title / code / skill | `PATCH /tests/:id`                                      | On blur / debounce 800ms       |
| Add section                    | `POST /test-sections`                                   | Immediately on "+ Add Section" |
| Reorder sections               | `PATCH /test-sections/:id { order }`                    | On drag end                    |
| Delete section                 | `DELETE /test-sections/:id`                             | After confirm dialog           |
| Save question group            | `POST /question-groups` or `PATCH /question-groups/:id` | On "Save Group" click          |
| Reorder groups                 | `PATCH /question-groups/:id { order }`                  | On drag end                    |
| Publish test                   | `PATCH /tests/:id { status: "ACTIVE" }`                 | On "Publish" click             |

### Validation rules (client-side, mirrored server-side)

| Rule                                             | Where surfaced                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| Title required                                   | Inline error below field                                              |
| Code required + unique                           | Inline error; check `GET /tests?keyword=<code>` on blur               |
| At least 1 question group per section to publish | `<Chip color="warning">` badge on section card in left rail           |
| At least 1 question per group                    | Error on "Save Group"                                                 |
| `questionNumber` globally unique within test     | Warning in question editor: "Q# 5 already used in Section 1, Group 2" |
| Passage required for MATCHING_PARAGRAPH groups   | `<Alert color="warning">` inline in question editor                   |
| Word bank required for NOTE_COMPLETION_WITH_HINT | Inline error in group editor on "Save Group"                          |

### Unsaved changes guard

Browser `beforeunload` + HeroUI `<Modal>` "You have unsaved changes. Leave anyway?"

---

## A5 — Empty & Loading States

| State                       | Display                                                                     |
| --------------------------- | --------------------------------------------------------------------------- |
| New test (no sections yet)  | Centre panel: illustration + "Add your first section →" `<Button>`          |
| Section with no groups      | Groups area: "+ Add Question Group" `<Button variant="bordered" fullWidth>` |
| Passage search — no results | `<AutocompleteItem>` : "No passages match. Create a new one →"              |
| Save in-flight              | `<Spinner size="sm">` replaces Save Draft label                             |
| Save error                  | `<Alert color="danger">` toast "Failed to save. Retry?" with retry button   |
| Publishing validation fail  | `<Modal>` listing unmet conditions before blocking publish                  |
| Passage search loading      | `<Spinner>` inside `<Autocomplete>`                                         |

---

## A6 — API Calls Mapping

| Action                                        | Endpoint                                |
| --------------------------------------------- | --------------------------------------- |
| Create test                                   | `POST /tests`                           |
| Update test metadata                          | `PATCH /tests/:id`                      |
| List tests                                    | `GET /tests`                            |
| Create section                                | `POST /test-sections`                   |
| Update section                                | `PATCH /test-sections/:id`              |
| Delete section                                | `DELETE /test-sections/:id`             |
| Create question group (with nested questions) | `POST /question-groups`                 |
| Update question group                         | `PATCH /question-groups/:id`            |
| Delete question group                         | `DELETE /question-groups/:id`           |
| Search passages                               | `GET /passages?keyword=…`               |
| Create passage (inline)                       | `POST /passages`                        |
| Publish test                                  | `PATCH /tests/:id { status: "ACTIVE" }` |

---

## A7 — Component Inventory (CMS)

| Component             | Purpose                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `TestBuilder`         | Page shell; manages 3-column layout + dirty state                |
| `SectionRail`         | Draggable section list; shows summary + warning badges           |
| `SectionDetail`       | Centre panel; passage picker + group list                        |
| `PassageSearch`       | `<Autocomplete>` typeahead + selected passage preview            |
| `PassageDrawer`       | Inline passage create drawer (A2.5)                              |
| `QuestionGroupEditor` | Right panel; type selector + question tabs + save                |
| `QuestionForm`        | Switches to correct sub-form based on `questionType`             |
| `MCQForm`             | Shared for SINGLE + MULTIPLE_ANSWER                              |
| `TFNForm` / `YNNForm` | Statement + `<ButtonGroup>` correct-answer picker                |
| `MatchingForm`        | Per-statement inputs + paragraph dropdown answers                |
| `NoteWithHintForm`    | Word bank chip manager + per-blank before/after fields           |
| `NoteNoHintForm`      | Before/after fields + multi-accepted-answer list                 |
| `DiagramForm`         | Image upload + label positioner + answer inputs                  |
| `QuestionNumberBadge` | Read-only `<Chip>` showing auto-assigned global `questionNumber` |
| `DragHandle`          | Reusable `⠿` drag affordance for section/group/paragraph reorder |

---

## A8 — i18n Keys (add to `src/i18n/locales/en.ts` and `vi.ts`)

```ts
// Sidebar
tests: 'Tests'

// Test list
tests: {
  searchPlaceholder: 'Search title or code…',
  createTitle: 'Create Test',
  deleteConfirm: 'Are you sure you want to delete the selected tests?',
  columns: { code, title, skill, sections, lastUpdated },
}

// Test builder
testBuilder: {
  saveDraft: 'Save Draft',
  saved: 'Saved',
  publish: 'Publish',
  publishConfirm: 'Publish test?',
  unsavedChanges: 'You have unsaved changes. Leave anyway?',
  addSection: '+ Add Section',
  deleteSectionConfirm: 'Delete section and all its questions?',
  addGroup: '+ Add Question Group',
  deleteGroupConfirm: 'Delete this question group?',
  changeTypeConfirm: 'Changing type will clear all questions in this group. Continue?',
  saveGroup: 'Save Group',
  noSectionsYet: 'Add your first section →',
  linkPassageWarning: 'Link a passage to this section to auto-populate paragraph labels.',
  wordBankRequired: 'Add at least one word to the word bank.',
  questionNumberConflict: 'Q# {{n}} already used in {{location}}.',
}

// Passage drawer
passageDrawer: {
  title: 'New Passage',
  savePassage: 'Save Passage',
  addParagraph: '+ Add Paragraph',
}
```
