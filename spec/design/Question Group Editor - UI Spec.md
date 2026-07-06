# Question Group Editor — Component · UI Spec

**Module:** Tests (Admin) → Test builder right panel
**Component:** `window.QuestionGroupEditor` (also exports `window.MiniModal` and the `window.TB` registry)
**Source of truth:** `screens/question-editor.jsx`
**Mounted by:** `screens/test-builder.jsx` (right column, 420px) — see `Test Builder - UI Spec.md`.
**Audience:** Frontend + full-stack engineers
**Status:** Documents the component as currently built. **⚠ Gap / Recommendation** marks behavior not yet implemented.

---

## 1. Purpose

The Question Group Editor authors a single **question group** — its type, student-facing guideline, supporting assets (word bank / linked-passage labels / diagram), and the individual questions with their correct answers and explanations. It is the innermost authoring surface of the Tests module and the home of all **8 IELTS question types**.

It edits a working **draft** (a deep clone of the group), reports dirtiness to the builder, and commits on **Save group**.

---

## 2. Props & lifecycle

```
<QuestionGroupEditor
   group        // the group to edit (deep-cloned into local `draft`)
   section      // parent section — used for passage-derived paragraph labels
   startNumber  // global number of this group's first question (from buildNumbering)
   onSave(draft)
   onCancel()
   onDirty(bool)/>
```

- On mount and whenever `group.id` changes: reseed `draft = cloneGroup(group)`, reset `activeQ=0`, `dirty=false`.
- Every mutation calls `markDirty()`; `dirty` is pushed up via `onDirty` (drives the builder's unsaved-changes guard).
- **Cancel** → `onCancel()` (guarded by the builder). **Save group** → `onSave(draft)` (enabled only when valid, §5).

---

## 3. Data model

### 3.1 Group

```
Group = {
  id, type,                 // one of the 8 Q_TYPES values
  guideline: string,        // instructions shown to the student
  wordBank: string[],       // used only by NOTE_COMPLETION_WITH_HINT
  questions: Question[]     // absent for DIAGRAM_LABEL_COMPLETION
  diagram?: {               // DIAGRAM_LABEL_COMPLETION only
    imageUrl, layout: 'listed'|'positioned',
    labels: [{ id, number, hint, x, y, answer }]
  }
}
Question = { id, content, correctAnswer, explanation }
```

### 3.2 The 8 question types (`TB.Q_TYPES`)

| value                       | label                                 | `content` shape                                     | `correctAnswer` shape               |
| --------------------------- | ------------------------------------- | --------------------------------------------------- | ----------------------------------- | ------- | -------------- |
| `SINGLE_ANSWER`             | Multiple Choice — single              | `{ text, options:[{id,label,text}] }` (A–D default) | `{ optionId }`                      |
| `MULTIPLE_ANSWER`           | Multiple Choice — multiple            | same as single                                      | `{ optionIds: [] }`                 |
| `TFN_ANSWER`                | True / False / Not Given              | `{ statement }`                                     | `{ value: 'TRUE'                    | 'FALSE' | 'NOT GIVEN' }` |
| `YNN_ANSWER`                | Yes / No / Not Given                  | `{ statement }`                                     | `{ value: 'YES'                     | 'NO'    | 'NOT GIVEN' }` |
| `MATCHING_PARAGRAPH`        | Matching Headings / Information       | `{ statement }`                                     | `{ paragraphLabel }` (from passage) |
| `NOTE_COMPLETION_WITH_HINT` | Note / Summary Completion (word box)  | `{ before, after, maxWords }`                       | `{ value }` (from word bank)        |
| `NOTE_COMPLETION_NO_HINT`   | Note / Summary Completion (free fill) | `{ before, after, maxWords }`                       | `{ acceptedValues: string[] }`      |
| `DIAGRAM_LABEL_COMPLETION`  | Diagram Label Completion              | group-level `diagram` (no `questions`)              | per-label `answer`                  |

`maxWords` options: `ONE WORD`, `TWO WORDS`, `ONE WORD / NUMBER`, `NO MORE THAN TWO WORDS`, `NO MORE THAN THREE WORDS`.
Blank shapes come from `defaultContent(type)` / `defaultAnswer(type)`; ids from `uid(prefix)`.

### 3.3 `TB` registry (shared with the builder)

Exports: `Q_TYPES`, `Q_TYPE_LABEL`, `SKILL_OPTS`, `SKILL_TONE`, `SKILL_LABEL`, `uid`, `blankQuestion`, `blankGroup`, `blankSection`, `cloneGroup`, `defaultContent`, `defaultAnswer`. Skill tones: Reading `primary`, Listening `success`, Writing `warning`, Speaking `violet`, Full `muted`.

### 3.4 ⚠ Suggested API contract (full-stack)

- The group tree is persisted as part of the test (see builder spec §3.4). Correct answers must be **server-side only** — never serialized into the student-facing payload.
- Free-fill matching (`acceptedValues`) should be normalized (trim + case-fold) at grade time; store the raw variants.

---

## 4. Layout & controls

Column, full height; scrollable body + sticky footer.

```
┌─────────────────────────────────────┐
│ ▣ Question group          [Unsaved]  │
│ Type            [Select ▾]           │
│ Guideline       [textarea]           │
│ (⚠ passage warning — matching)       │
│ (Word bank — note-with-hint)         │
│ ───────────────────────────────────  │
│ DiagramForm   |  Question tabs        │
│               |  [Q3][Q4][+ Add Q]    │
│               |  ┌ active question ─┐  │
│               |  │ per-type sub-form│  │
│               |  │ Explanation      │  │
│               |  └──────────────────┘  │
├─────────────────────────────────────┤
│ N questions        [Cancel][Save grp]│
└─────────────────────────────────────┘
```

### 4.1 Header & shared fields

- Title `Question group` + `<Pill tone="warning" dot>Unsaved</Pill>` when `dirty`.
- **Type** `<Select>` of `Q_TYPES`. Changing it opens a **confirm** ("Switching to … will clear all questions in this group"). Confirm → `applyTypeChange` rebuilds the group from `blankGroup(newType)`, keeping `id` and `guideline`. _(⚠ this also resets `wordBank` — §6.)_
- **Guideline** textarea — the instruction line shown to students.
- **Matching passage warning** — for `MATCHING_PARAGRAPH` with no passage labels: amber note "Link a passage to this section to auto-populate paragraph labels (A–G)".
- **Word bank** — for `NOTE_COMPLETION_WITH_HINT`: `WordBank` chip input (type + Enter to add, Backspace to remove last, dedupes). Required.

### 4.2 Questions area

- **Diagram type:** renders `DiagramForm` at group level (no question tabs).
- **All other types:** question tabs (`Q{startNumber+i}`) + `Add Q`, then the **active question card**:
  - Header: `Q# {qNumber}` pill + `Remove` (disabled when only one question).
  - Body: the per-type sub-form (§4.3) + an optional **Explanation** textarea ("shown in review mode").

### 4.3 Per-type sub-forms

- **MCQForm** (`SINGLE_ANSWER` / `MULTIPLE_ANSWER`) — question text; option rows A–F (**2–6**, add relabels sequentially). Tap the leading control to mark correct: a **circle** (radio, single) or **rounded square** (checkbox, multi). Removing an option prunes any answer refs.
- **TFNForm** (`TFN_ANSWER` / `YNN_ANSWER`) — statement textarea + `SegChoice` (TRUE/FALSE/NOT GIVEN or YES/NO/NOT GIVEN).
- **MatchingForm** — statement + paragraph `<Select>` built from the linked passage's paragraph letters; shows "Link a passage to populate labels" when none.
- **NoteHintForm** — before/after text, `maxWords` hint select, correct word `<Select>` (from the word bank) + a **live gap preview** (`before [answer] after`).
- **NoteNoHintForm** — before/after text, `maxWords` constraint, and a repeatable **Accepted answers** list (alternative spellings; min 1).
- **DiagramForm** (group-level) — image URL; layout toggle **Listed below** / **Positioned on image**; repeatable labels (`number`, `hint`, `answer`; min 1). In _positioned_ mode, a per-label "click image…" button lets you drop the marker on the image (stores `x,y` %); markers render on the preview.

### 4.4 Footer

`{count} question(s)/label(s)` + `Cancel` (ghost) + `Save group` (primary, `check`; disabled unless valid — §5).

---

## 5. Validation

`Save group` is enabled only when `valid && wordBankOK`:

- **valid** — diagram: `≥1 label` and **every** label has both `number` and `answer`; all other types: `questions.length > 0`.
- **wordBankOK** — for `NOTE_COMPLETION_WITH_HINT`, `wordBank` must be non-empty; otherwise always true.

### 5.1 ⚠ Validation gaps

- `passageOK` (matching type has passage labels) **is computed but not enforced** on Save — a matching group can be saved with no passage/answer. (The builder's publish check catches the missing passage, but not a null `paragraphLabel`.)
- No per-question content validation: empty MCQ text/options, blank statements, empty `before`, or an unselected correct answer can all be saved.
- `MULTIPLE_ANSWER` does not require ≥ 2 (or even ≥ 1) selected options.
- `NOTE_COMPLETION_NO_HINT` allows empty `acceptedValues` entries.
- **Recommendation:** add per-question required-field checks and surface them inline before enabling Save; enforce all of them server-side.

---

## 6. States & ⚠ gaps

| Area                      | Current                                                                      | Required                                                                 |
| ------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Type change**           | Clears all questions (expected) but also silently resets `wordBank`          | ⚠ Preserve reusable assets where sensible, or warn explicitly.           |
| **Reordering**            | No drag-reorder of questions or MCQ options                                  | ⚠ Support reorder; keep numbering/labels in sync.                        |
| **Answer secrecy**        | Correct answers live in the same object graph as content                     | ⚠ Never ship answers in the student payload; split at the API.           |
| **Diagram image**         | URL paste only; no upload; positioned markers can't be dragged after placing | ⚠ Add upload + drag-to-move markers.                                     |
| **Explanations**          | Free text, optional, no formatting                                           | Acceptable; consider markdown/preview parity with review mode.           |
| **Per-question validity** | Not checked (see §5.1)                                                       | ⚠ Add inline validation + block Save.                                    |
| **Autosave**              | None — edits held in `draft` until Save; Cancel/leave discards               | ⚠ Optional draft autosave; already guarded by the builder's dirty check. |

---

## 7. Interaction flows

```
Question group editor
 ├─ change type ............ confirm → applyTypeChange (clears questions)
 ├─ edit guideline / word bank / passage-derived labels
 ├─ add / remove question (tabs)   [non-diagram]
 ├─ per-type sub-form edits → mark correct answer
 ├─ diagram: set image, layout, labels, positions [diagram]
 ├─ Cancel ................. onCancel() (builder guards if dirty)
 └─ Save group ............. valid && wordBankOK → onSave(draft) → builder replaces group + toast
```

`window.MiniModal` (also exported here) backs the type-change confirm and is reused by the builder for the group-type picker and delete/leave confirms.

---

## 8. Acceptance checklist

- [ ] Draft is a clone; editing never mutates the committed group until Save.
- [ ] `dirty` propagates via `onDirty` and drives the builder's unsaved-changes guard.
- [ ] Type change confirms, clears questions, and rebuilds correctly (and does not silently drop reusable assets without warning).
- [ ] Each of the 8 types renders its correct sub-form and produces the documented `content` / `correctAnswer` shapes.
- [ ] MCQ options are 2–6, relabel on add/remove, and prune answer refs on removal.
- [ ] Note-with-hint requires a non-empty word bank; the gap preview reflects the chosen word.
- [ ] Matching cannot be saved with a null `paragraphLabel` (fix §5.1); missing passage is surfaced.
- [ ] Diagram: ≥1 label, every label has number + answer; positioned markers place and render.
- [ ] Per-question required-field validation blocks Save with clear inline errors.
- [ ] Correct answers are excluded from the student-facing payload (server split).
- [ ] Save commits `draft` via `onSave` and the builder shows the "Question group saved" toast.
