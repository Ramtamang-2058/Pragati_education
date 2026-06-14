# Reading Section — IELTS Exam UI + Persisted Progress

Date: 2026-06-14
Status: Approved (practice mode this pass; Test mode deferred)

## Goal

Complete the reading **practice** section and fully connect it to the backend:
real questions for every question type, an IELTS computer-delivered-test-style UI, and
per-user progress/completion stored server-side. The 100 full mock tests ("Test" mode) are
designed-for but built in a later phase.

## Decisions (confirmed)

- **Structure:** keep practice-by-question-type (existing sidebar) × levels, rendered in an
  IELTS exam-style UI. A separate **Test** mode (100 full mock tests) comes later.
- **Content + widgets:** author real, type-appropriate content seeded into the backend DB.
  The 12+ types map onto 3 reusable widgets.
- **Completion:** store each question attempt per user (answer, correct?, completed_at). A
  level (type × difficulty) auto-completes when all its questions are submitted.
  "Completed" = submitted/finished — not "must be correct".
- **Replace** `Question.tsx` / `QuestionList.tsx` and the `DUMMY_QUESTIONS` views.
- **Practice timer:** soft per-set timer (not a strict 60-min countdown — that belongs to
  Test mode).

## Type → widget mapping

- `radio`: Multiple Choice, Identifying Information (T/F/NG), Identifying Writer's Views
  (Yes/No/Not Given).
- `dropdown` (select from a shared list): Matching Headings, Matching Information,
  Matching Features, Matching Sentence Endings.
- `text` (gap-fill; case-insensitive, trimmed, any accepted answer): Sentence Completion,
  Summary Completion, Note/Table/Flowchart Completion, Diagram Label Completion,
  Short-Answer Questions.

## Backend (`apps.reading` rework)

### Models

- `ReadingPassage` — `question_type`, `level` (easy/medium/hard), `title`, `body`,
  `order`. One passage per (type × level): the left-pane text.
- `ReadingQuestion` — FK→passage, `number`, `widget` (radio/dropdown/text), `stem`,
  `accepted_answers` (JSON list, for text widget), `explanation`, `order`.
- `ReadingChoice` — FK→question, `label`, `text`, `is_correct` (radio + dropdown; a
  question's shared option set powers "matching" types).
- `QuestionAttempt` — FK→user, FK→question, `given_answer`, `is_correct`, `completed_at`.
  Unique `(user, question)` (upsert on resubmit).
- `LevelCompletion` — FK→user, `question_type`, `level`, `total`, `correct`,
  `completed_at`. Unique `(user, question_type, level)`. Written when the last question of
  a level is submitted.

### API (auth required; tied to `request.user`)

- `GET /api/reading/passage/?type=&level=` → passage + questions **without** answer keys.
- `POST /api/reading/questions/{id}/submit/` body `{answer}` → grades server-side, upserts
  `QuestionAttempt`, returns `{is_correct, explanation, correct_answer}`; writes
  `LevelCompletion` when the level is finished.
- `GET /api/reading/progress/?type=&level=` → per-question state for the grid.
- `GET /api/reading/progress/levels/` → completed-levels overview for the results page.

### Seeding

`python manage.py seed_reading` authors one real passage + ~6–8 type-appropriate questions
per (type × level), replacing the `"Sample passage for question N"` placeholders and the
copied-MCQ JSON files. Idempotent (safe to re-run).

## Frontend (IELTS computer-delivered test UI)

New components under `app/(protected)/reading/components/exam/`:

- `ExamHeader` — soft timer, type/level label, font-size (A / A+) toggle.
- `SplitPane` — left passage pane (scrollable), right question pane, draggable divider.
- `QuestionPalette` — sticky bottom bar, numbered 1…N with states answered / current /
  flagged-for-review / unanswered; click to jump; per-question "Review" checkbox.
- Widgets: `RadioQuestion`, `DropdownQuestion`, `GapFillQuestion`.

Flow: sidebar selects type + level → exam UI loads that passage/question set from the API →
answer → "Submit" grades & persists → finishing shows a results summary → the type grid and
results page reflect completion read from the backend.

## Testing

- **Backend (automated, `manage.py test`)**: seed sanity; submit grading for each widget
  (radio correct/incorrect, gap-fill trim/case/synonyms, dropdown); attempt upsert; level
  auto-completion; auth required.
- **Frontend**: no test runner configured in the repo — verify via `tsc` / `next build`
  plus a manual run. Adding a JS test framework is out of scope this pass.

## Deferred to next phase (Test mode)

100 full mock tests in the "Test" sidebar entry: standard IELTS rules (strict 60-min
countdown auto-submitting at zero, 3 passages, 40 questions, raw-score→band conversion),
full attempt history with band score, retakes, and a JSON/CSV importer + admin to load the
100 tests. The models above are shaped to extend into `TestPaper` / `TestAttempt` without
rework.
