# Test Mode — Full IELTS Test Framework + Reading Section (Phase 1)

Date: 2026-06-14
Status: Approved

## Goal

Build the **Test mode** that the reading-section spec deferred: a full IELTS test
experience with strict timing, server-side grading, and raw-score→band conversion. This is
the first of several phases that together deliver a complete 4-section IELTS test (Listening,
Reading, Writing, Speaking) for both the **Academic** and **General Training** modules.

**Phase 1 (this spec)** delivers the shared test framework plus a fully working **Reading**
section, because Reading is fully auto-gradable and the cheapest section to build (its answer
widgets already exist). Later phases plug Listening (TTS audio), Writing (Gemini grading),
and Speaking (mic + Gemini grading) into the same framework.

## Phasing (agreed)

1. **Phase 1 — Test framework + Reading** (this spec).
2. Phase 2 — Listening section (Gemini TTS audio, single-play player, 40 Qs auto-graded).
3. Phase 3 — Writing section (Task 1 + Task 2, Gemini API band + criterion feedback).
4. Phase 4 — Speaking section (browser mic recording, transcription, Gemini grading).
5. Content — author full Academic + GT papers for every section.

AI provider for later phases: **Gemini API key (Google AI Studio)**, single `GEMINI_API_KEY`.
Writing/Speaking grading + Listening TTS all go through the Gemini API.

## Why a new app (`apps.exams`)

Practice mode (`apps.reading`) constrains one passage per `(question_type, level)` — it
cannot represent a single test made of 3 passages spanning mixed question types. Test mode
gets its own app so the two modes evolve independently. Models are shaped now so Listening /
Writing / Speaking attach without rework.

## Backend — `apps.exams`

### Models

- **`TestPaper`** — `module` (`academic` | `general`), `title`, `slug` (unique), `is_published`
  (default False), `order`.
- **`TestSection`** — FK→paper (`related_name="sections"`), `kind`
  (`listening`/`reading`/`writing`/`speaking`), `order`, `duration_seconds` (Reading = 3600).
  Unique `(paper, kind)`.
- **`SectionPart`** — FK→section (`related_name="parts"`), `order`, `title`, `instructions`
  (TextField, blank), `passage_text` (TextField, blank — the Reading passage), `audio`
  (FileField/CharField, blank — Listening, later). Reading = the 3 passages.
- **`QuestionGroup`** — FK→part (`related_name="groups"`), `order`, `instruction` (e.g.
  "Questions 1–6 — Do the statements agree…? TRUE / FALSE / NOT GIVEN"), `widget`
  (`radio`/`dropdown`/`text`), `shared_options` (JSONField default list — shared option list
  for Matching Headings / Features etc.; empty for plain text/radio groups).
- **`TestQuestion`** — FK→group (`related_name="questions"`), `number` (1–40, unique within
  section), `stem` (TextField, blank — gap-fill rows can be stem-less), `options` (JSONField
  default list — per-question radio options as `[{label, text}]`), `accepted_answers`
  (JSONField default list — for text widget and matching keys), `correct_option` (CharField
  blank — the correct label for radio/dropdown), `explanation` (TextField blank), `order`.
- **`TestAttempt`** — FK→user (`related_name="exam_attempts"`), FK→paper, `status`
  (`in_progress` | `submitted`), `started_at` (auto), `submitted_at` (null), `overall_band`
  (Decimal null). One active in-progress attempt per `(user, paper)` reused on restart.
- **`SectionAttempt`** — FK→attempt (`related_name="section_attempts"`), FK→section,
  `raw_score` (int), `band` (Decimal), `submitted_at`. Unique `(attempt, section)`.
- **`QuestionResponse`** — FK→section_attempt (`related_name="responses"`), FK→question,
  `given_answer` (TextField blank), `is_correct` (bool). Unique `(section_attempt, question)`.

### Grading

- `TestQuestion.check_answer(given)` — mirrors practice mode: `text` widget normalizes
  (trim + lowercase) and matches any of `accepted_answers`; `radio`/`dropdown` compares the
  given label to `correct_option`. Word-limit rules (e.g. "NO MORE THAN TWO WORDS") are
  enforced at authoring time by keeping accepted answers within the limit.
- `band.py` — `reading_band(raw, module)` returns the band for a 0–40 raw score using the
  standard published Academic and General Training Reading conversion tables (they differ;
  GT requires more correct answers for the same band). Boundary values covered by tests.
- Section grading is **all-at-once** on submit: compute `is_correct` for every question,
  upsert `QuestionResponse` rows, sum `raw_score`, derive `band`, write `SectionAttempt`.
  `overall_band` = average of submitted section bands (Reading only in Phase 1), rounded to
  the nearest 0.5 per IELTS rounding.

### API (auth required; tied to `request.user`), under `/api/exams/`

- `GET /api/exams/papers/?module=academic` → published papers for the module: `slug`,
  `title`, `module`, section summary (kind + question count + duration).
- `GET /api/exams/papers/{slug}/` → full structure for the runner: sections → parts →
  groups → questions, **answer keys stripped** (no `correct_option`, `accepted_answers`,
  `explanation`).
- `POST /api/exams/attempts/` body `{paper_slug}` → create (or reuse existing in-progress)
  `TestAttempt`; returns `{attempt_id, status}`.
- `POST /api/exams/attempts/{id}/sections/reading/submit/` body
  `{answers: {questionId: value}}` → grade section server-side, upsert responses, write
  `SectionAttempt`, return `{raw_score, band}`. Idempotent re-submit overwrites.
- `GET /api/exams/attempts/{id}/results/` → per-section `raw_score`/`band` + `overall_band`,
  plus per-question review (`number`, `given_answer`, `correct_answer`, `is_correct`,
  `explanation`) now that the test is over.

Only the attempt's owner can read/submit it (404 otherwise).

### Seeding

`python manage.py seed_exams` authors **two full Reading papers**, idempotent (keyed on
`slug`, safe to re-run):

- **Academic**: 3 passages of increasing difficulty, 40 questions total, authentic IELTS
  type distribution (T/F/NG, Matching Headings, MCQ, sentence/summary/note completion,
  matching information/features).
- **General Training**: Section 1 (everyday notices/ads, short-answer + matching), Section 2
  (workplace/training texts), Section 3 (one longer text), 40 questions.

**Copyright:** passages and questions are **original, authored in the authentic IELTS style,
format, and difficulty** modeled on real past-paper structure — not copied from real exams.

## Frontend — Next.js (`(protected)` route group)

New `lib/exams.ts` — typed API client (axios `withCredentials`), mirroring `lib/reading.ts`.

- **`/test`** — landing: choose module (Academic / GT) → choose paper → rules overview →
  "Start test" (calls `POST /attempts/`, routes to the runner).
- **`/test/[attemptId]`** — the exam runner. Reading reuses/adapts the existing
  `reading/components/exam/` components:
  - `SplitPane` — passage left (scrollable, switches with the active passage), questions right.
  - `QuestionPalette` — 1–40 across all passages; answered / current / flagged states;
    jump-to; per-question review flag.
  - `ExamHeader` — **strict 60-min countdown that auto-submits at zero** (no soft timer).
  - Question widgets reuse radio/dropdown/text rendering in **test mode**: capture answers,
    **no inline grading**. "Submit test" with a confirm dialog.
  - Answers held in client state; submitted in one payload.
- **`/test/[attemptId]/results`** — overall band + Reading raw/band; passage-by-passage
  answer review (your answer vs. correct + explanation).

The existing Reading sidebar already has a "Test" entry; it links to `/test`.

## Testing

- **Backend (`manage.py test`)**: seed sanity (each paper has exactly 40 questions across 3
  parts); section grading per widget (radio correct/incorrect, text trim/case/synonyms,
  dropdown/matching); band conversion at boundary scores for both modules; public paper
  endpoint strips answer keys; attempt reuse + response upsert; auth required; non-owner gets
  404.
- **Frontend**: no JS test runner in the repo — verify via `tsc` / `next build` plus a manual
  run. Adding a test framework is out of scope.

## Out of scope (later phases)

Listening (TTS + player), Writing (Gemini), Speaking (mic + Gemini), full content for those
sections, and a teacher/consultancy review dashboard. The models and `/api/exams/` namespace
are shaped to extend into them without rework.
