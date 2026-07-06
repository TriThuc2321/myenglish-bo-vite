# UI Design Spec — IELTS Student Test-Taking App (Phase 2)

> **Audience**: Frontend / design team (student-facing app)
> **Purpose**: Pixel-level guidance for the student test experience
> **Scope**: Student-facing app — screens S1–S5 only
> **Related spec**: `UI_DESIGN_SPEC_IELTS_CMS.md` — backoffice admin test builder

---

## 0. Design System Reference

The student app is a separate frontend from the backoffice. These specs assume a similar HeroUI v3 + Tailwind CSS v4 setup unless the student app has its own design system.

### Color tokens

| Purpose                         | Token                                  |
| ------------------------------- | -------------------------------------- |
| Primary action / answered state | `primary`                              |
| Timer warning (2–5 min)         | `warning`                              |
| Timer critical (< 2 min)        | `danger`                               |
| Correct answer (review mode)    | `success`                              |
| Incorrect answer (review mode)  | `danger`                               |
| Unanswered / flagged            | `warning`                              |
| Background (test shell)         | neutral surface — no distracting color |

### Typography

Clean, readable sans-serif. Passage body text: `text-base leading-relaxed` (minimum 16px, 1.6 line-height). Question text: `text-sm` or `text-base`. Never use decorative fonts.

### Dark mode

Provide both light and dark variants. Dark mode is especially important for long reading/listening sessions.

### Responsive

| Breakpoint | Layout                                                                       |
| ---------- | ---------------------------------------------------------------------------- |
| ≥ 1280px   | Side-by-side passage + questions (50/50)                                     |
| 768–1279px | Passage collapsed accordion (expandable), questions full width               |
| < 768px    | Unsupported — show gate: "Please use a desktop or tablet to take this test." |

---

## 1. Data Model Quick Reference

```
Test
  └── TestSection[]            ← ordered, each has duration_minutes + skill
        ├── Passage             ← title + Paragraph[] (ordered text blocks)
        └── QuestionGroup[]    ← ordered, each has questionType + guideline
              └── Question[]   ← ordered, content (jsonb), questionNumber (global)
                    └── QuestionAnswer   ← correctAnswer (jsonb), explanation

TestAttempt
  ├── purpose: PLACEMENT | PRACTICE | MIDTERM | FINAL | PROGRESS
  ├── status: IN_PROGRESS | COMPLETED | ABANDONED
  └── StudentAnswer[]          ← per question: answerData (jsonb), timeSpent

TestResult (after submit)
  ├── listening_score, reading_score, writing_score, speaking_score
  ├── overall_band  (IELTS 0.5 increment)
  └── status: PARTIAL | COMPLETE
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

| #   | Screen      | Route                                 | Trigger                             |
| --- | ----------- | ------------------------------------- | ----------------------------------- |
| S1  | Test Lobby  | `/test/:attemptId/lobby`              | POST /test-attempts → redirect here |
| S2  | Test Taking | `/test/:attemptId/section/:sectionId` | "Start" or "Resume" from S1         |
| S3  | Submit Gate | `/test/:attemptId/submit`             | "Submit Test" CTA                   |
| S4  | Results     | `/test/:attemptId/result`             | After scoring completes             |
| S5  | Review      | `/test/:attemptId/review`             | From Results, if enabled            |

---

## 3. S1 — Test Lobby

### Purpose

Brief the student before the clock starts. No timer running yet.

### Layout

```
┌─────────────────────────────────────────────────────┐
│  ← Back           [Test Code: IELTS-2025-P1]        │
├─────────────────────────────────────────────────────┤
│                                                      │
│   📄  Academic Reading Test                          │
│       Placement — 3 Sections · 40 Questions          │
│                                                      │
│  ┌──────────┬──────────┬──────────┬──────────┐       │
│  │ Section  │  Skill   │Questions │  Time    │       │
│  ├──────────┼──────────┼──────────┼──────────┤       │
│  │    1     │ READING  │    13    │ 20 min   │       │
│  │    2     │ READING  │    13    │ 20 min   │       │
│  │    3     │ READING  │    14    │ 20 min   │       │
│  └──────────┴──────────┴──────────┴──────────┘       │
│                                                      │
│  ⚠ Instructions                                      │
│   · Each section is individually timed.             │
│   · You cannot return to a previous section.        │
│   · Answers auto-save on every change.              │
│   · Time up → current section is auto-submitted.    │
│                                                      │
│                  [ Start Test  → ]                   │
└─────────────────────────────────────────────────────┘
```

### States

**New attempt**: "Start Test →" button.

**Resuming in-progress attempt**: "Resume Test →" button + "Started at HH:MM" badge. Do not reset timer. Show which section is currently active (e.g., row highlight on Section 2). Completed sections show a ✓ checkmark in the table.

**Placement context** (`purpose = PLACEMENT`): show banner above the section table — "This is a Placement Test. Your result will determine your starting level."

---

## 4. S2 — Test Taking

### 4.1 Global Shell

```
┌────────────────────────────────────────────────────────────────────┐
│ Logo   Section 1 of 3 · READING              ⏱ 19:42   Submit ›   │
├──────────────────────────────┬─────────────────────────────────────┤
│                              │                                     │
│   PASSAGE PANEL              │   QUESTION PANEL                    │
│   (left / top half)          │   (right / bottom half)             │
│                              │                                     │
├──────────────────────────────┴─────────────────────────────────────┤
│ Q nav: [1✓][2✓][3·][4·]...[13·]   🚩 Flag   [← Prev]  [Next →]    │
└────────────────────────────────────────────────────────────────────┘
```

**Header bar** (sticky, always visible):

- Section label + skill icon
- Countdown timer — `CountdownTimer` component with color states (see Section 9)
- "Submit Section" (mid-test) or "Submit Test" (last section) button — requires confirm dialog

**Bottom nav bar** (sticky):

- Numbered question buttons. States:
  - `unanswered` — grey border
  - `answered` — filled primary color
  - `flagged` — amber/warning border
  - `current` — outlined ring (focus indicator)
- Flag toggle: bookmark icon toggles `flagged` state on current question
- "Last saved HH:MM:SS" label near nav bar (subtle, `text-xs text-default-400`)
- Prev / Next arrows

**Resizable divider** (desktop): drag handle between passage and question panels to resize the split. Default 50/50.

---

### 4.2 Section Transition Flow

When a section ends (timer = 0 OR student clicks Submit Section):

1. **Timer = 0**: Modal auto-appears — "Time's up for Section 1. Your answers have been saved. Starting Section 2…" with a 5s countdown and "Continue →" button to skip wait.
2. **Student submits section early**: Confirm dialog — "Submit Section 1? You cannot return to previous sections." → [Cancel] [Submit Section]
3. After confirm / timer: `POST /test-attempts/:id/submit-section { sectionId }` → redirect to next section's URL (`/test/:attemptId/section/:nextSectionId`).
4. **Last section**: "Submit Test" flow → redirect to S3 Submit Gate.

**Resume mid-test**: if student has completed sections 1 and 2, and section 3 is IN_PROGRESS, S1 lobby shows "Resume →" and redirects directly to `/test/:attemptId/section/:section3Id`. Completed sections are not accessible.

---

### 4.3 Section Layouts by Skill

#### READING — Passage + Questions (side-by-side)

```
┌──────────────────────────┬──────────────────────────────┐
│  Passage Panel           │  Question Panel              │
│  ─────────────           │  ─────────────               │
│  [Title]                 │  Questions 1–13              │
│  [Subtitle]              │                              │
│                          │  Group 1: guideline text     │
│  A  Paragraph 1 text…    │  ─────────────────────────   │
│  B  Paragraph 2 text…    │  Q1 [question render]        │
│  C  Paragraph 3 text…    │  Q2 [question render]        │
│  ...                     │  ...                         │
│  (independently          │  (independently              │
│   scrollable)            │   scrollable)                │
└──────────────────────────┴──────────────────────────────┘
```

- Each panel scrolls independently.
- Paragraph letters (A, B, C…) or numbers per `passage.markedBy`.
- Passage panel has `role="region" aria-label="Reading passage"`.
- Question panel has `role="region" aria-label="Questions"`.

**Tablet (768–1279px)**: passage is in a collapsible accordion at top. Student taps to expand/collapse. Questions fill full width below.

#### LISTENING

```
┌───────────────────────────────────────────────────────────┐
│  🔊  Section 2 — Track 1                                  │
│  [════════════●════════════════]  02:15 / 05:30  [▶/⏸]   │
│  Playback: ×1.0 ▾   Rewind 10s ↺                         │
├───────────────────────────────────────────────────────────┤
│  Questions 14–26   (scrollable, same question renders)    │
└───────────────────────────────────────────────────────────┘
```

- Audio player is sticky top.
- Audio auto-plays when section starts.
- **IELTS rule** (when `test.is_review_enabled = false`): student cannot replay from the beginning — rewind button is disabled or hidden.
- **Placement / Practice** (`purpose = PLACEMENT | PRACTICE`): allow full replay and rewind.
- When audio ends: no auto-advance. Student answers questions then submits manually.

#### WRITING

```
┌───────────────────────────────────────────────────────────┐
│  Task 1 — Academic Writing                                │
│  ────────────────────────────────────────────────────────│
│  [Task prompt / diagram image]                           │
│                                                          │
│  Write at least 150 words:                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (textarea — autosave debounced 2s)               │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│  Word count: 0 / 150+                                    │
└───────────────────────────────────────────────────────────┘
```

- `answerData = { content: "...", word_count: N }` saved to `StudentAnswer`.
- Word count computed client-side (split on whitespace, trim). Updates live as student types.
- Word count label turns `warning` color when below minimum, `success` when above.

#### SPEAKING

```
┌───────────────────────────────────────────────────────────┐
│  Part 1 — Introduction                                   │
│  ────────────────────────────────────────────────────────│
│  [Cue card prompt text]                                  │
│                                                          │
│  Preparation time: 01:00  [▶ Start Recording]            │
│                                                          │
│  ●  Recording  00:42 / 02:00                             │
│     ▃▅▇▅▃▁▄▆▄▂  (waveform visualiser)                   │
│  [Stop & Save]                                           │
└───────────────────────────────────────────────────────────┘
```

- `answerData = { audio_url: "...", duration_seconds: N }` saved to `StudentAnswer`.
- Prep timer counts down; recording starts automatically when prep timer hits 0, or on student tap of "Start Recording".
- Upload to Cloudinary in background via `MediaRecorder` API; save URL to backend on stop.
- If upload fails: retry toast — "Upload failed. Tap to retry."

---

### 4.4 Question Renderers

#### SINGLE_ANSWER (MCQ)

```
Q3. The main purpose of the passage is to…

  ○  A. describe a scientific discovery
  ●  B. analyse competing theories        ← selected
  ○  C. summarise historical events
  ○  D. evaluate government policy
```

Radio button list. Selected: filled circle in primary color.
`answerData = { selected_id: "uuid-of-answer" }`

#### MULTIPLE_ANSWER

```
Q5. Which TWO of the following are mentioned? (Choose TWO)

  ☑  A. Increased urbanisation           ← checked
  ☐  B. Changes in diet
  ☑  C. Decline in biodiversity          ← checked
  ☐  D. Industrial growth
```

Checkbox list. "Choose TWO" / "Choose THREE" label derived from `content.max_choices`.
`answerData = { selected_ids: ["uuid1", "uuid2"] }`

Once `max_choices` is reached, remaining unchecked options become disabled (prevent over-selection).

#### TFN_ANSWER / YNN_ANSWER

```
Q8. The author believes renewable energy is more cost-effective.

  [ TRUE ]   [ FALSE ]   [ NOT GIVEN ]
```

Segmented button group. Selected: filled background primary color. Unselected: bordered.
`answerData = { value: "TRUE" | "FALSE" | "NOT GIVEN" }`

#### MATCHING_PARAGRAPH

```
Q11–Q15. Match each statement with the correct paragraph.

  Q11. Evidence of early migration      [ A ▾ ]
  Q12. A disputed interpretation        [ B ▾ ]
  Q13. The role of trade routes         [   ▾ ]
```

Dropdown per question. Options = passage paragraph labels (A–G or 1–7).
`answerData = { matches: { "q-uuid-11": "A", "q-uuid-12": "B", ... } }`

#### NOTE_COMPLETION_WITH_HINT

```
Q16–Q20. Complete the notes. Choose ONE WORD from the box.

  [ significant ] [ dramatic ] [ coastal ] [ annual ] [ severe ]

  The study found a _____________ (16) increase in temperature
  in _____________ (17) regions over the past decade.
```

Word chips in a bank — tap/click to select, then tap blank to place. Or drag-and-drop.
Once placed, chip is greyed out (opacity 40%). Tap placed word in the sentence to remove and return it to the bank.
`answerData = { fills: { "q-uuid-16": "significant", "q-uuid-17": "coastal" } }`

#### NOTE_COMPLETION_NO_HINT

```
Q21. The researcher concluded the effect was _____________.
     (Write NO MORE THAN TWO WORDS)
```

Plain text input inline in the sentence. Trim + lowercase on save. Max word hint from `content.max_words`.
`answerData = { value: "largely irrelevant" }`

#### DIAGRAM_LABEL_COMPLETION

```
[Diagram image with numbered callout arrows]

  21 ___________    22 ___________    23 ___________
```

Image rendered from `content.image_url`.
If `layout = "positioned"`: inputs positioned over image via `content.labels[].x` and `y` percentages using absolute positioning.
If `layout = "listed"`: inputs listed below image in order.
`answerData = { labels: { "21": "turbine", "22": "valve", ... } }`

---

## 5. S3 — Submit Gate

### Layout

```
┌─────────────────────────────────────────────────────┐
│            Ready to submit?                         │
│                                                     │
│  Section 1   ✓ 13/13 answered                       │
│  Section 2   ⚠ 11/13 answered  (2 unanswered)       │
│  Section 3   ✓ 14/14 answered                       │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ ⚠ 2 questions unanswered in Section 2.      │    │
│  │ Unanswered questions will score zero.       │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│   [ Go Back ]              [ Submit Test → ]        │
└─────────────────────────────────────────────────────┘
```

- "Go Back" only enabled if time allows (i.e., the current section timer has not expired). Disabled with tooltip "Cannot go back — section time has expired."
- On "Submit Test": `POST /test-attempts/:id/submit` → redirect to S4 (poll until result ready).

---

## 6. S4 — Results

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  Test Complete · IELTS-2025-P1                           │
│  Completed: 14 Jun 2025, 10:42                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   Overall Band Score                                     │
│   ┌──────────────────┐                                   │
│   │       6.5        │  ← large (text-6xl), centered     │
│   └──────────────────┘                                   │
│                                                          │
│  Skill Breakdown                                         │
│  ┌──────────┬────────────────────┬──────────────────┐    │
│  │ Skill    │ Score bar          │  Band            │    │
│  ├──────────┼────────────────────┼──────────────────┤    │
│  │ Listening│ ████████████░░░░   │  6.5             │    │
│  │ Reading  │ ██████████░░░░░░   │  6.0             │    │
│  │ Writing  │ ─── Pending ───    │  —               │    │
│  │ Speaking │ ─── Pending ───    │  —               │    │
│  └──────────┴────────────────────┴──────────────────┘    │
│                                                          │
│  ⚠  Writing & Speaking are being graded manually.        │
│     Overall band will update when complete.              │
│                                                          │
│  ┌─────────────────────────────────────────────────┐     │
│  │ 💡 Suggested Level                              │     │
│  │    Upper-Intermediate (B2)  ·  Band 6.0–7.0    │     │
│  │    Recommended courses: [ IELTS Prep 6.5+ ]    │     │
│  └─────────────────────────────────────────────────┘     │
│                                                          │
│  [ Review My Answers ]          [ Back to Dashboard ]    │
└──────────────────────────────────────────────────────────┘
```

### States

**PARTIAL** (Writing/Speaking pending):

- Show "Pending" rows with a pulsing skeleton bar.
- Show `<Alert color="warning">` banner about manual grading.
- Overall band score shows current auto-scored partial score OR "Pending" if not yet calculable.
- Poll `GET /test-attempts/:id/result` every 30s; update UI when COMPLETE.

**COMPLETE**:

- Show all 4 skill bands + Overall.
- "Review My Answers" button enabled only when `TestResult.status = COMPLETE` AND `Test.is_review_enabled = true`.

**Suggested Level card**: only shown for `purpose = PLACEMENT`.

**Score bar**: fill % = `band / 9 * 100`. Progress bar color: matches skill (or primary by default).

---

## 7. S5 — Review Mode

Only accessible when `TestResult.status = COMPLETE` AND `Test.is_review_enabled = true`.

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Results   |   Review — IELTS-2025-P1           │
├──────────────────────────────────────────────────────────┤
│  [Section tabs: Section 1 · Section 2 · Section 3]       │
├──────────────────────────────────────────────────────────┤
│  [ Passage Panel (read-only) ]  [ Question Panel ]        │
│                                                          │
│  Q1 ✅  The author believes X is…                        │
│     Your answer:  B. analyse competing theories  ✅       │
│     Correct:      B. analyse competing theories          │
│                                                          │
│  Q2 ❌  Which finding is supported by…                   │
│     Your answer:  C. Marine erosion             ❌        │
│     Correct:      A. Atmospheric pressure                │
│     Explanation:  Paragraph 3 states that…      [▾]      │
│                                                          │
│  Q3 ─   (not answered)                                  │
│     Correct:      TRUE                                   │
└──────────────────────────────────────────────────────────┘
```

- Section tabs: HeroUI `<Tabs>`. Each tab shows the section number + skill icon.
- All inputs are **disabled / read-only** (no timer, no submit button).
- **Question card states**:
  - `correct` — left border `border-success`, green check icon ✅
  - `incorrect` — left border `border-danger`, red cross icon ❌
  - `unanswered` — left border `border-default`, dash icon —
- **Explanation block**: collapsed by default behind a "Show explanation" chevron toggle (`<Accordion>` or custom). Expand on click.
- Passage panel is the same read-only `PassagePanel` component used during test-taking.

---

## 8. Autosave Behaviour

| Event                                          | Action                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| Answer selection changes                       | Debounce 1s → `PATCH /student-answers/:id` or `POST` if first answer |
| Text input (Writing / fill)                    | Debounce 2s → save                                                   |
| Section end (timer = 0)                        | Immediate flush + auto-submit section                                |
| Browser visibility hidden (`visibilitychange`) | Immediate flush of pending saves                                     |
| Network offline                                | Queue locally (`localStorage`) → retry on reconnect                  |

- Optimistic UI: show saved state immediately; revert on server error with toast.
- "Last saved HH:MM:SS" label near question nav bar.

---

## 9. Timer Details

| State   | Visual                                                     |
| ------- | ---------------------------------------------------------- |
| > 5 min | Neutral text, neutral clock icon                           |
| 2–5 min | `text-warning` + amber clock icon                          |
| < 2 min | `text-danger` + pulsing animation (`animate-pulse`)        |
| 0:00    | Modal: "Time's up! Submitting your answers…" → auto-submit |

- Timer initialised from: `section.duration_minutes − (now − attempt.started_at)` on resume.
- `aria-live="polite"` announcement at 5 min remaining.
- `aria-live="assertive"` announcement at 1 min remaining.
- Server enforces the time limit on submit; client timer is UX-only.

---

## 10. Accessibility Requirements

- All answer controls keyboard-navigable (`Tab` + `Space`/`Enter`).
- Timer announced via `aria-live` (see Section 9).
- Word bank chips: `role="button"` + `aria-label="Select word: [word]"`.
- Passage and question panels: `role="region"` + `aria-label`.
- WCAG AA color contrast on all text elements.
- Focus ring visible on all interactive elements.

---

## 11. Component Inventory

| Component                   | Notes                                                                          |
| --------------------------- | ------------------------------------------------------------------------------ |
| `TestShell`                 | Full-screen layout wrapper, manages global timer + section state               |
| `PassagePanel`              | Scrollable text; renders `Paragraph[]` with letter/number markers              |
| `QuestionPanel`             | Renders `QuestionGroup[]` → individual renderers                               |
| `QuestionRenderer`          | Switch on `questionType`; dispatches to sub-renderers                          |
| `MCQSingle` / `MCQMultiple` | Radio / checkbox lists                                                         |
| `TFNButtons` / `YNNButtons` | Segmented button group                                                         |
| `MatchingDropdowns`         | Dropdown-per-row with shared option list                                       |
| `NoteCompletionWithHint`    | Word bank chips + fill blanks in rich text                                     |
| `NoteCompletionNoHint`      | Inline text inputs in rendered text                                            |
| `DiagramCompletion`         | Image + positioned or listed text inputs                                       |
| `WritingEditor`             | Textarea + live word count                                                     |
| `SpeakingRecorder`          | MediaRecorder API + prep timer + waveform visualiser                           |
| `AudioPlayer`               | HTML5 audio + custom controls + progress bar                                   |
| `QuestionNavBar`            | Numbered button grid with state badges + flag toggle                           |
| `CountdownTimer`            | Colour-changing countdown with pulse at < 2 min                                |
| `ResultBandChart`           | Per-skill progress bar + overall band score                                    |
| `ReviewQuestionCard`        | Read-only question card with correct/incorrect state + collapsible explanation |

---

## 12. API Calls Mapping

| Action                          | Endpoint                                               |
| ------------------------------- | ------------------------------------------------------ |
| Create attempt                  | `POST /test-attempts`                                  |
| Load test structure             | `GET /tests/:id` (with sections, groups, questions)    |
| Load existing answers on resume | `GET /test-attempts/:id/answers`                       |
| Save / update student answer    | `POST /student-answers` / `PATCH /student-answers/:id` |
| Submit section                  | `POST /test-attempts/:id/submit-section { sectionId }` |
| Submit test                     | `POST /test-attempts/:id/submit`                       |
| Poll result                     | `GET /test-attempts/:id/result`                        |
| Load review data                | `GET /test-attempts/:id/review`                        |

---

## 13. i18n Keys

```ts
testLobby: {
  backButton: 'Back',
  startTest: 'Start Test',
  resumeTest: 'Resume Test',
  startedAt: 'Started at {{time}}',
  placementBanner: 'This is a Placement Test. Your result will determine your starting level.',
  columns: { section, skill, questions, time },
  instructions: {
    title: 'Instructions',
    timedSections: 'Each section is individually timed.',
    noReturn: 'You cannot return to a previous section.',
    autoSave: 'Answers auto-save on every change.',
    autoSubmit: 'Time up — current section is auto-submitted.',
  },
}

testTaking: {
  sectionOf: 'Section {{current}} of {{total}}',
  submitSection: 'Submit Section',
  submitTest: 'Submit Test',
  submitConfirm: 'Submit Section {{n}}? You cannot return to previous sections.',
  timeUp: "Time's up for Section {{n}}. Your answers have been saved. Starting Section {{next}}…",
  lastSaved: 'Last saved {{time}}',
  flagQuestion: 'Flag question',
  unflagQuestion: 'Unflag question',
}

submitGate: {
  title: 'Ready to submit?',
  unansweredWarning: '{{count}} questions unanswered in Section {{n}}. Unanswered questions will score zero.',
  goBack: 'Go Back',
  submitTest: 'Submit Test',
  cannotGoBack: 'Cannot go back — section time has expired.',
}

results: {
  title: 'Test Complete',
  overallBand: 'Overall Band Score',
  skillBreakdown: 'Skill Breakdown',
  pendingGrading: 'Writing & Speaking are being graded manually. Overall band will update when complete.',
  suggestedLevel: 'Suggested Level',
  reviewAnswers: 'Review My Answers',
  backToDashboard: 'Back to Dashboard',
  pending: 'Pending',
}

review: {
  backToResults: '← Back to Results',
  correct: 'Correct',
  incorrect: 'Incorrect',
  notAnswered: 'Not answered',
  yourAnswer: 'Your answer',
  correctAnswer: 'Correct answer',
  showExplanation: 'Show explanation',
  hideExplanation: 'Hide explanation',
}
```
