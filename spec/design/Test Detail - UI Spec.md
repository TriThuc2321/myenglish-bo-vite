# Test Detail — Screen · UI Spec

**Module:** Tests (Admin)
**Screen:** Test detail (`route = "test-detail"`, param `{ id }`)
**Source of truth:** `screens/tests.jsx` → `TestDetail({ testId, nav })` (exported as `window.TestDetail`)
**Audience:** Frontend + full-stack engineers
**Status:** Documents the screen as currently built. Sections marked **⚠ Gap / Recommendation** describe behavior that is _not yet_ implemented and is proposed for the production build.

Companion specs: `Test Bank List - UI Spec.md`, `Test Builder - UI Spec.md`, `Question Group Editor - UI Spec.md`.

---

## 1. Purpose

The Test detail screen is the read view for a single test. It lets staff:

- See a test's identity, structure summary, and IELTS-skill context.
- Inspect the section-by-section structure.
- Preview a skill-appropriate sample of the test as a student would see it.
- Review the list of attempts (who sat it, when, raw score, band).
- Read performance analytics (band distribution, hardest sections).
- Jump into the builder to edit, or assign / duplicate the test.

It is **read-first**: all authoring happens in the builder (`test-builder`); grading happens on the assessment screens.

---

## 2. Layout & components

Vertical stack, `gap: 16px`, top→bottom:

```
┌─────────────────────────────────────────────────────────────┐
│ Breadcrumbs   Tests → {title}                                 │
├─────────────────────────────────────────────────────────────┤
│ Hero card                                                     │
│  ▢80  Title  [TYPE][STATUS]              [Assign to class]    │
│       code · skill · band                [Edit test]          │
│       {skill description}                [Duplicate]          │
│       Parts │ Questions │ Duration │ Created by  (4-col)      │
├─────────────────────────────────────────────────────────────┤
│ IELTS 4-skill context card   ▢L ▢R ▢W ▢S  (this-test lit)     │
├─────────────────────────────────────────────────────────────┤
│ Tabs  [Structure][Preview][Attempts][Analytics]              │
├─────────────────────────────────────────────────────────────┤
│ Active tab panel                                              │
└─────────────────────────────────────────────────────────────┘
```

Guard: if `H.byId(D.tests, testId)` is null, render `Test not found.` (padding 40) and nothing else.

### 2.1 Breadcrumbs

`<Breadcrumbs items={[{ label:'Tests', to:'tests' }, { label: test.title }]} onNav={nav}/>` — first crumb navigates back to the list.

### 2.2 Hero card (`<Card padding={24}>`)

Row, `gap: 20`, `align-items: flex-start`:

- **Icon tile** — 80×80, radius 16, `background: SKILL_META[skill].soft`, `color: SKILL_META[skill].color`, `<Icon size={32}>`.
- **Identity block** (flex 1):
  - Title `h1` 22 / 600 / `-0.02em`, followed inline by `<Pill dot>` type (`TYPE_TONES[type]`) and `<Pill dot>` status (`success` if `PUBLISHED` else `muted`).
  - `code · skill · band {band}` — 13, muted, mono.
  - `SKILL_META[skill].desc` — 13, `line-height 1.55` (full structure sentence, see §3.3).
  - **4-col stat grid** (`repeat(4,1fr)`, gap 22) via `Field3`: **Parts / sections** (`sections.length`), **Total questions** (`totalQuestions`, mono), **Duration** (`{durationMin} min`), **Created by** (`teacher.name` or `—`).
- **Action column** (`flex-direction: column`, gap 8):
  - `Assign to class` — primary, icon `sparkle`. _(⚠ no handler — §6.)_
  - `Edit test` — secondary, icon `edit` → `nav('test-builder', { id })`.
  - `Duplicate` — ghost, icon `enrollments`. _(⚠ no handler — §6.)_

### 2.3 IELTS 4-skill context card

`<Card title="IELTS 4-skill context" subtitle="A complete IELTS assessment combines all four skills">`. A `repeat(4,1fr)` grid of the four fixed skills (Listening / Reading / Writing / Speaking):

- The **current** test's skill: `SKILL_META[s].soft` bg, `1.5px` colored border, opacity 1, shows a `<Pill tone="primary">This test</Pill>`.
- Others: `surface-2` bg, transparent border, opacity 0.7.
- Each shows icon + skill name + `shortDesc` (mono).

This block is **presentation only** — it contextualizes a single-skill test within the 4-skill IELTS whole; it is not interactive.

### 2.4 Tabs

`<Tabs active={tab} onChange={setTab}>` with initial `tab = 'structure'`:

| id          | label     | icon          | count             |
| ----------- | --------- | ------------- | ----------------- |
| `structure` | Structure | `panel`       | `sections.length` |
| `preview`   | Preview   | `eye`         | —                 |
| `attempts`  | Attempts  | `enrollments` | `attempts.length` |
| `analytics` | Analytics | `dashboard`   | —                 |

---

## 2.5 Tab panels

### Structure (`<Card padding={0}>`)

One row per `sections[]` item, grid `40px 1fr auto auto`, gap 16, bottom border between rows:

- **Number tile** — 36×36, `SKILL_META.soft`/`.color`, mono 14/700, `sec.n`.
- **Name + type** — `sec.name` (14/600) over `sec.type` (12, muted, mono).
- **Questions** — right-aligned label + `sec.questions` (16/600, mono).
- **Action** — `<IconButton icon="edit">` → `nav('test-builder', { id })`. _(⚠ opens the builder at the test level, not the specific section — §6.)_
- **Footer bar** — `surface-2`, `Total` ↔ `{totalQuestions} questions · {durationMin} min`.

### Preview (`TestPreview`)

Renders a **skill-specific** hardcoded sample (not generated from this test's real question data — §6):

- **Listening** — audio-player mock (play button, `00:00 / 06:42`, progress track) + a "STUDENT REGISTRATION FORM" with 5 `SamplGap` fill rows; amber "you will hear the recording once only" note.
- **Reading** — two-column: "The story of silk" passage excerpt (scrollable, `max-height 320`) + Questions 1–4 as True/False/Not Given cards (Q1 pre-marked TRUE for illustration).
- **Writing** — two Cards: Task 1 (20 min / 150 words, process-diagram placeholder) + Task 2 (40 min / 250 words, opinion prompt). Task 2 only if `sections[1]` exists.
- **Speaking** — examiner script card, one block per section with a fixed set of Part 1 / Part 2 / Part 3 prompts.

Returns `null` for any other skill value.

### Attempts (`<Card padding={0}>`)

`<Table density="compact">` over `attempts = D.testAttempts.filter(a => a.test === test.id)`:

| Column      | Cell                                                                     |
| ----------- | ------------------------------------------------------------------------ |
| Student     | `<Avatar square size={28}>` + name (13/600) + student id (mono, muted)   |
| Date        | `H.fmtDate(date)`, mono 12                                               |
| Purpose     | `<Pill tone={TYPE_TONES[purpose]}>`                                      |
| Duration    | `{duration} min`, mono 12                                                |
| Raw score   | `score/max` (mono, 600) when `score != null`, else `Rubric-only` (muted) |
| Band        | `band.toFixed(1)`, mono 14/700; **green** if `band >= 6`                 |
| _(actions)_ | right-aligned `<IconButton icon="eye">` _(⚠ no handler — §6)_            |

**Empty:** when `attempts.length === 0`, render `No attempts yet.` centered, padding 30, muted. This is the reference empty-state treatment for the module (see list spec §6).

### Analytics

Grid `2fr 1fr`, gap 14:

- **Band distribution** (`<Card title="Band distribution" subtitle="Across {attempts} attempts">`) — `BandDistribution` renders a 9-bin histogram (bands 4.0–8.0) **synthesized** from `avgBand` (normal-ish weighting), with the bin nearest the mean highlighted primary. Footer shows mean + approximate median. _(⚠ synthetic — §6.)_
- **Question-level difficulty** (`<Card title="Question-level difficulty">`) — "Top 3 hardest sections" using the first 3 sections with **hardcoded** fail rates `60% / 46% / 32%` and a `<Progress>` bar. _(⚠ synthetic — §6.)_

---

## 3. Data model

### 3.1 Test — `H.byId(D.tests, testId)`

Same record as the list spec §3.1. Fields read on this screen: `id, code, title, skill, band, type, durationMin, totalQuestions, sections[], attempts, avgBand, status, createdBy`. `createdBy` is resolved with `H.byId(D.teachers, createdBy)` → `creator.name`.

**`sections[]` item:** `{ n, name, questions, type }` — the Structure tab reads all four fields.

### 3.2 Attempt — `D.testAttempts[]`

`{ id, test→FK, student→FK, date(ISO), score:int|null, max:int, band:number, purpose:enum, duration:int(min) }`.

- Joined per row via `H.byId(D.students, attempt.student)` for name/id.
- `score === null` ⇒ render `Rubric-only` (Writing/Speaking, graded by rubric not raw count).
- `purpose` reuses `TYPE_TONES` for pill coloring.

### 3.3 `SKILL_META` (presentation tokens — server-agnostic)

| skill     | icon      | color / soft (oklch)              | `desc`                                                              | `shortDesc`     |
| --------- | --------- | --------------------------------- | ------------------------------------------------------------------- | --------------- |
| Listening | `classes` | `0.55 0.15 240` / `0.95 0.04 240` | 4 sections · 40 questions · ~30 min audio + 10 min transfer         | 40Q · 40min     |
| Reading   | `book`    | `0.50 0.18 300` / `0.95 0.05 300` | 3 passages · 40 questions · 60 min                                  | 40Q · 60min     |
| Writing   | `edit`    | `0.55 0.16 75` / `0.96 0.06 85`   | Task 1 (150 words, 20min) + Task 2 (250 words, 40min)               | 2 tasks · 60min |
| Speaking  | `sparkle` | `0.50 0.18 25` / `0.95 0.05 25`   | Part 1 interview + Part 2 long turn + Part 3 discussion · 11–14 min | 3 parts · 14min |

`TYPE_TONES`: `PLACEMENT → info`, `PROGRESS → muted`, `MIDTERM → warning`, `FINAL → primary`, `PRACTICE → muted`.

### 3.4 ⚠ Suggested API contract (full-stack)

- `GET /api/tests/:id` → full `Test` incl. real `sections[]` with question payloads for Preview.
- `GET /api/tests/:id/attempts?page=` → `{ items: Attempt[], total }` — paginate; do not ship the whole attempt history inline.
- `GET /api/tests/:id/analytics` → server-computed `{ bandHistogram: {band:count}[], sectionDifficulty: {section, failRate}[] }`. The UI must **not** synthesize these (it does today — §6).

---

## 4. Interaction & navigation

```
Test detail
 ├─ breadcrumb "Tests" ......... → tests
 ├─ Edit test / structure edit . → test-builder { id }
 ├─ Assign to class ............ (⚠ no handler — open class-picker)
 ├─ Duplicate .................. (⚠ no handler — clone → test-builder { id: newId })
 ├─ tab switch ................. local state, no route change
 └─ attempt eye ................ (⚠ no handler — → attempt review)
```

- Route `test-detail` keeps the **Tests** nav item active (see `app.jsx` active-state logic).
- Tab state is local (`useState('structure')`); it does **not** persist to the URL. **⚠ Recommendation:** reflect the active tab in a query param so a link can deep-link to Attempts/Analytics.

---

## 5. Permissions & roles

Reuses the `tests` permission module (see list spec §7). Applied to this screen:

| Control                          | Gate                                                    |
| -------------------------------- | ------------------------------------------------------- |
| Screen visible at all            | `tests.view`                                            |
| `Edit test` + structure-row edit | `tests.edit`                                            |
| `Assign to class`                | `tests.edit` (or a dedicated `tests.assign`)            |
| `Duplicate`                      | `tests.create`                                          |
| Attempts tab                     | `tests.view`; per-attempt review may need `tests.grade` |

### 5.1 ⚠ Gap — not gated today

`Edit`, `Assign`, `Duplicate` render for everyone. Production must hide/disable them per the table and enforce server-side.

---

## 6. States & ⚠ gaps

| Area                   | Current                                                                                 | Required                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Not found**          | `Test not found.` bare text                                                             | ⚠ Proper empty/error card with a back-to-list CTA.                                   |
| **Loading**            | None (synchronous in-memory)                                                            | ⚠ Skeleton hero + tab panel while `GET /tests/:id` is in flight.                     |
| **Preview**            | Hardcoded per-skill sample, ignores real `sections`/questions                           | ⚠ Render from the test's actual question groups (share the student-taker renderers). |
| **Analytics**          | `BandDistribution` synthesizes from `avgBand`; section fail rates hardcoded `60/46/32%` | ⚠ Replace with server-computed aggregates; hide the card when `attempts === 0`.      |
| **Attempts**           | Renders all rows unpaginated; `eye` has no handler                                      | ⚠ Paginate; wire `eye` → attempt review; sort by date desc.                          |
| **Assign / Duplicate** | Buttons present, no handlers                                                            | ⚠ Wire assign (class picker) + duplicate (clone → builder), or hide until built.     |
| **Structure edit**     | `edit` icon opens builder at test level                                                 | ⚠ Deep-link to the specific section in the builder.                                  |

---

## 7. Responsive behavior

The current build uses fixed `repeat(4,1fr)` grids (hero stats, skill-context, analytics) and a wide attempts table — desktop-only, no reflow. Required breakpoints:

| Width      | Hero stats                                      | Skill context                 | Analytics     | Attempts                  |
| ---------- | ----------------------------------------------- | ----------------------------- | ------------- | ------------------------- |
| ≥ 1024px   | 4 cols                                          | 4 cols                        | 2fr/1fr       | full table                |
| 640–1023px | 2 cols                                          | 2 cols                        | stack (1 col) | drop Duration + Purpose   |
| < 640px    | 1 col; action buttons full-width under identity | horizontal scroll-snap or 2×2 | stack         | stacked cards per attempt |

Other rules: hero action buttons wrap below the identity block on mobile; tab bar becomes horizontally scrollable; touch targets ≥ 44px.

---

## 8. Acceptance checklist

- [ ] Missing id renders a real empty/error state (not bare text) with a back-to-list action.
- [ ] Hero shows correct skill icon/color, type + status pills, and the 4 stat fields.
- [ ] Skill-context card highlights exactly the test's skill and dims the other three.
- [ ] Tabs default to Structure; counts on Structure/Attempts match the data.
- [ ] Structure rows sum to the footer total (`totalQuestions` / `durationMin`).
- [ ] Preview renders from the test's real questions (not a hardcoded sample).
- [ ] Attempts join students correctly; `score===null` ⇒ `Rubric-only`; band ≥6 ⇒ green; empty ⇒ "No attempts yet."
- [ ] Analytics uses server aggregates and hides when there are no attempts.
- [ ] Edit / Assign / Duplicate / attempt-review all wired and permission-gated (server-enforced).
- [ ] Loading skeletons present; layout reflows at tablet and mobile with ≥44px targets.
