# Test Mode (Framework + Reading) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Test mode — a new `apps.exams` Django app plus a Next.js `/test` flow — that delivers a fully working, server-graded, strictly-timed IELTS **Reading** test for both Academic and General Training modules, with models shaped to extend into Listening/Writing/Speaking later.

**Architecture:** A standalone `apps.exams` app (separate from practice-mode `apps.reading`) models a paper → sections → parts → question-groups → questions tree, plus per-user attempt/response tables. Grading is all-at-once on section submit, server-side; raw scores convert to bands via published Reading tables. The frontend reuses the existing `reading/components/exam/` primitives (SplitPane, QuestionPalette) and adds test-mode-only components (countdown header, no-inline-grading question pane).

**Tech Stack:** Django 5.2 + DRF 3.16 (cookie-JWT auth via `apps.accounts.authentication.CookieJWTAuthentication`), SQLite, Next.js App Router + TypeScript + axios (`lib/api.ts`, `withCredentials`), Tailwind.

---

## Key codebase facts (read before starting)

- **Settings module is the package** `backend/config/settings/__init__.py` (Python prefers the package over the stale sibling `backend/config/settings.py`). `DJANGO_SETTINGS_MODULE=config.settings`. Register the new app **only** in the package file. Do **not** touch `config/settings.py`.
- DRF defaults (in settings package): `DEFAULT_AUTHENTICATION_CLASSES = CookieJWTAuthentication`, `DEFAULT_PERMISSION_CLASSES = IsAuthenticated`. So views need no explicit auth wiring unless overriding.
- `AUTH_USER_MODEL = 'accounts.User'`; users are created with `User.objects.create_user(email=..., password=...)` (email-based, no username).
- Auth URL names for tests: `auth-login`, `auth-logout` (POST JSON `{email, password}` to login).
- All backend commands run from `backend/`: `python manage.py <cmd>`. Tests: `python manage.py test apps.exams`.
- Mirror `apps.reading` layout exactly: `api/views/`, `api/serializers/`, `api/urls.py`, `models/` package, `management/commands/`, `seed_data.py`, `tests_exams.py`, `constants.py`, `apps.py`, `admin.py`.
- Frontend exam primitives already exist at `frontend/app/(protected)/reading/components/exam/`: `SplitPane` (left/right panes), `QuestionPalette` (numbered grid + Finish), `QuestionWidget` (has inline grading — do NOT reuse for test mode), `ExamHeader` (count-**up** timer — test mode needs count-**down**).
- Sidebar `frontend/app/(protected)/reading/components/Navigation.tsx` line 23 has a `"Test"` entry that currently fires `onSelect("Test")`; it must become a link to `/test`.

## File structure

**Backend — new app `backend/apps/exams/`:**
- `__init__.py`, `apps.py` — app scaffolding.
- `constants.py` — module/kind/widget choices, `READING_DURATION_SECONDS`.
- `models/__init__.py` — re-exports all models.
- `models/papers.py` — `TestPaper`, `TestSection`, `SectionPart`, `QuestionGroup`, `TestQuestion` (+ `check_answer`).
- `models/attempts.py` — `TestAttempt`, `SectionAttempt`, `QuestionResponse`.
- `band.py` — `reading_band(raw, module)`, `round_to_band(value)`.
- `admin.py` — register models for content QA.
- `api/__init__.py`, `api/serializers/__init__.py`, `api/serializers/exams.py`, `api/views/__init__.py`, `api/views/exams.py`, `api/urls.py`.
- `migrations/__init__.py` (+ generated migration).
- `seed_data.py` — authored Academic + GT paper content.
- `management/__init__.py`, `management/commands/__init__.py`, `management/commands/seed_exams.py`.
- `tests_exams.py` — band, grading, seed, API tests.

**Backend — modified:**
- `config/settings/__init__.py` — add `'apps.exams'` to `INSTALLED_APPS`.
- `config/urls.py` — `path('api/', include('apps.exams.api.urls'))`.

**Frontend — new:**
- `frontend/lib/exams.ts` — typed API client.
- `frontend/app/(protected)/test/page.tsx` — landing (module → paper → rules → start).
- `frontend/app/(protected)/test/components/CountdownHeader.tsx` — strict timer, auto-submit.
- `frontend/app/(protected)/test/components/TestQuestionPane.tsx` — renders one passage's questions, no inline grading.
- `frontend/app/(protected)/test/[attemptId]/page.tsx` — runner.
- `frontend/app/(protected)/test/[attemptId]/results/page.tsx` — results + review.

**Frontend — modified:**
- `frontend/app/(protected)/reading/components/Navigation.tsx` — `"Test"` → link to `/test`.

---

## Task 1: Scaffold `apps.exams` and register it

**Files:**
- Create: `backend/apps/exams/__init__.py` (empty)
- Create: `backend/apps/exams/apps.py`
- Create: `backend/apps/exams/constants.py`
- Create: `backend/apps/exams/migrations/__init__.py` (empty)
- Create: `backend/apps/exams/models/__init__.py` (empty for now)
- Modify: `backend/config/settings/__init__.py`
- Modify: `backend/config/urls.py`

- [ ] **Step 1: Create the app config**

`backend/apps/exams/apps.py`:
```python
from django.apps import AppConfig


class ExamsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.exams"
```

- [ ] **Step 2: Create constants**

`backend/apps/exams/constants.py`:
```python
"""Choices and fixed values for the exams (test mode) app."""

# Module (paper variant)
ACADEMIC = "academic"
GENERAL = "general"
MODULE_CHOICES = [(ACADEMIC, "Academic"), (GENERAL, "General Training")]

# Section kinds (only reading graded in Phase 1; others shaped for later)
LISTENING = "listening"
READING = "reading"
WRITING = "writing"
SPEAKING = "speaking"
KIND_CHOICES = [
    (LISTENING, "Listening"),
    (READING, "Reading"),
    (WRITING, "Writing"),
    (SPEAKING, "Speaking"),
]

# Answer widgets (mirror apps.reading)
RADIO = "radio"
DROPDOWN = "dropdown"
TEXT = "text"
WIDGET_CHOICES = [(RADIO, "Radio"), (DROPDOWN, "Dropdown"), (TEXT, "Text")]

# Standard IELTS Reading is 60 minutes.
READING_DURATION_SECONDS = 3600
```

- [ ] **Step 3: Create empty `models/__init__.py`**

`backend/apps/exams/models/__init__.py`: empty file (populated in Tasks 2–3).

- [ ] **Step 4: Register the app in the settings package**

In `backend/config/settings/__init__.py`, add `'apps.exams'` to `INSTALLED_APPS` immediately after `'apps.reading'`:
```python
    'apps.accounts',
    'apps.reading',
    'apps.exams',
    'rest_framework',
```

- [ ] **Step 5: Include the API urls**

In `backend/config/urls.py`, add after the reading include:
```python
    path('api/', include('apps.reading.api.urls')),
    path('api/', include('apps.exams.api.urls')),
```
(The `apps.exams.api.urls` module is created in Task 6. To keep this step runnable now, create a stub `backend/apps/exams/api/__init__.py` (empty) and `backend/apps/exams/api/urls.py` with `urlpatterns = []`. Task 6 replaces the urls file.)

- [ ] **Step 6: Verify Django loads the app**

Run: `cd backend && python manage.py check`
Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 7: Commit**

```bash
git add backend/apps/exams backend/config/settings/__init__.py backend/config/urls.py
git commit -m "feat(exams): scaffold exams app and register it"
```

---

## Task 2: Paper-tree models

**Files:**
- Create: `backend/apps/exams/models/papers.py`
- Modify: `backend/apps/exams/models/__init__.py`
- Test: `backend/apps/exams/tests_exams.py`

- [ ] **Step 1: Write the failing test**

Create `backend/apps/exams/tests_exams.py`:
```python
from django.test import TestCase

from apps.exams.constants import ACADEMIC, RADIO, READING, READING_DURATION_SECONDS
from apps.exams.models import (
    QuestionGroup,
    SectionPart,
    TestPaper,
    TestQuestion,
    TestSection,
)


class PaperTreeTests(TestCase):
    def test_can_build_full_paper_tree(self):
        paper = TestPaper.objects.create(
            module=ACADEMIC, title="Academic Reading 1", slug="academic-reading-1"
        )
        section = TestSection.objects.create(
            paper=paper, kind=READING, duration_seconds=READING_DURATION_SECONDS
        )
        part = SectionPart.objects.create(section=section, order=1, title="Passage 1")
        group = QuestionGroup.objects.create(
            part=part, order=1, instruction="Questions 1-3", widget=RADIO
        )
        q = TestQuestion.objects.create(
            group=group, number=1, stem="What?", correct_option="A"
        )
        self.assertEqual(paper.sections.first(), section)
        self.assertEqual(section.parts.first().groups.first().questions.first(), q)
        self.assertEqual(section.duration_seconds, 3600)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python manage.py test apps.exams.tests_exams.PaperTreeTests -v 2`
Expected: FAIL — `ImportError` (models not defined).

- [ ] **Step 3: Write the models**

`backend/apps/exams/models/papers.py`:
```python
from django.db import models

from apps.exams.constants import (
    KIND_CHOICES,
    MODULE_CHOICES,
    RADIO,
    READING_DURATION_SECONDS,
    TEXT,
    WIDGET_CHOICES,
)


class TestPaper(models.Model):
    """One complete test paper for a module (e.g. Academic Reading 1)."""

    module = models.CharField(max_length=20, choices=MODULE_CHOICES)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    is_published = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["module", "order", "slug"]

    def __str__(self):
        return f"{self.get_module_display()}: {self.title}"


class TestSection(models.Model):
    """One section (reading/listening/writing/speaking) of a paper."""

    paper = models.ForeignKey(
        TestPaper, on_delete=models.CASCADE, related_name="sections"
    )
    kind = models.CharField(max_length=20, choices=KIND_CHOICES)
    order = models.PositiveIntegerField(default=0)
    duration_seconds = models.PositiveIntegerField(default=READING_DURATION_SECONDS)

    class Meta:
        ordering = ["paper", "order"]
        constraints = [
            models.UniqueConstraint(
                fields=["paper", "kind"], name="unique_section_kind_per_paper"
            )
        ]

    def __str__(self):
        return f"{self.paper.slug} / {self.kind}"


class SectionPart(models.Model):
    """A part of a section. For Reading, each part is one passage."""

    section = models.ForeignKey(
        TestSection, on_delete=models.CASCADE, related_name="parts"
    )
    order = models.PositiveIntegerField(default=0)
    title = models.CharField(max_length=255)
    instructions = models.TextField(blank=True)
    passage_text = models.TextField(blank=True)
    audio = models.CharField(max_length=500, blank=True)  # Listening, later

    class Meta:
        ordering = ["section", "order"]

    def __str__(self):
        return f"{self.section} / part {self.order}: {self.title}"


class QuestionGroup(models.Model):
    """A run of questions sharing one instruction and widget."""

    part = models.ForeignKey(
        SectionPart, on_delete=models.CASCADE, related_name="groups"
    )
    order = models.PositiveIntegerField(default=0)
    instruction = models.TextField()
    widget = models.CharField(max_length=20, choices=WIDGET_CHOICES, default=RADIO)
    shared_options = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["part", "order"]

    def __str__(self):
        return f"{self.part} / group {self.order}"


class TestQuestion(models.Model):
    """A single numbered question (1-40 within a section)."""

    group = models.ForeignKey(
        QuestionGroup, on_delete=models.CASCADE, related_name="questions"
    )
    number = models.PositiveIntegerField()
    stem = models.TextField(blank=True)
    options = models.JSONField(default=list, blank=True)  # [{label, text}]
    accepted_answers = models.JSONField(default=list, blank=True)
    correct_option = models.CharField(max_length=20, blank=True)
    explanation = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["group", "order", "number"]
        constraints = [
            models.UniqueConstraint(
                fields=["group", "number"], name="unique_question_number_per_group"
            )
        ]

    def __str__(self):
        return f"Q{self.number} ({self.widget})"

    @property
    def widget(self) -> str:
        return self.group.widget

    def check_answer(self, given) -> bool:
        """Grade one answer. Text widget: trim+lowercase match against
        accepted_answers. radio/dropdown: compare label to correct_option."""
        if self.widget == TEXT:
            normalized = str(given or "").strip().lower()
            return any(
                normalized == str(a).strip().lower() for a in self.accepted_answers
            )
        return bool(self.correct_option) and str(given).strip() == self.correct_option

    def correct_answer_display(self) -> str:
        if self.widget == TEXT:
            return self.accepted_answers[0] if self.accepted_answers else ""
        return self.correct_option
```

- [ ] **Step 4: Re-export from the models package**

`backend/apps/exams/models/__init__.py`:
```python
from apps.exams.models.papers import (
    QuestionGroup,
    SectionPart,
    TestPaper,
    TestQuestion,
    TestSection,
)

__all__ = [
    "QuestionGroup",
    "SectionPart",
    "TestPaper",
    "TestQuestion",
    "TestSection",
]
```

- [ ] **Step 5: Make and run migrations, then the test**

```bash
cd backend && python manage.py makemigrations exams
python manage.py test apps.exams.tests_exams.PaperTreeTests -v 2
```
Expected: migration `0001_initial` created; test PASSES.

- [ ] **Step 6: Commit**

```bash
git add backend/apps/exams/models backend/apps/exams/migrations backend/apps/exams/tests_exams.py
git commit -m "feat(exams): paper-tree models with answer grading"
```

---

## Task 3: Attempt + response models

**Files:**
- Create: `backend/apps/exams/models/attempts.py`
- Modify: `backend/apps/exams/models/__init__.py`
- Test: `backend/apps/exams/tests_exams.py`

- [ ] **Step 1: Write the failing test**

Append to `backend/apps/exams/tests_exams.py`:
```python
from django.contrib.auth import get_user_model

from apps.exams.models import QuestionResponse, SectionAttempt, TestAttempt

User = get_user_model()


class AttemptModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="t@example.com", password="Str0ngPass!23"
        )
        self.paper = TestPaper.objects.create(
            module=ACADEMIC, title="AR1", slug="ar1"
        )
        self.section = TestSection.objects.create(paper=self.paper, kind=READING)

    def test_attempt_response_tree(self):
        attempt = TestAttempt.objects.create(user=self.user, paper=self.paper)
        sa = SectionAttempt.objects.create(
            attempt=attempt, section=self.section, raw_score=0, band=0
        )
        part = SectionPart.objects.create(section=self.section, order=1, title="P1")
        group = QuestionGroup.objects.create(
            part=part, order=1, instruction="Q", widget=RADIO
        )
        q = TestQuestion.objects.create(group=group, number=1, correct_option="A")
        resp = QuestionResponse.objects.create(
            section_attempt=sa, question=q, given_answer="A", is_correct=True
        )
        self.assertEqual(attempt.section_attempts.first(), sa)
        self.assertEqual(sa.responses.first(), resp)
        self.assertEqual(attempt.status, "in_progress")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python manage.py test apps.exams.tests_exams.AttemptModelTests -v 2`
Expected: FAIL — `ImportError` (attempt models not defined).

- [ ] **Step 3: Write the models**

`backend/apps/exams/models/attempts.py`:
```python
from django.conf import settings
from django.db import models

from apps.exams.models.papers import TestPaper, TestQuestion, TestSection

IN_PROGRESS = "in_progress"
SUBMITTED = "submitted"
STATUS_CHOICES = [(IN_PROGRESS, "In progress"), (SUBMITTED, "Submitted")]


class TestAttempt(models.Model):
    """One user's run at a paper. At most one in-progress per (user, paper)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="exam_attempts",
    )
    paper = models.ForeignKey(
        TestPaper, on_delete=models.CASCADE, related_name="attempts"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=IN_PROGRESS)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    overall_band = models.DecimalField(
        max_digits=3, decimal_places=1, null=True, blank=True
    )

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.user_id} -> {self.paper.slug} ({self.status})"


class SectionAttempt(models.Model):
    """Graded result of one section within an attempt."""

    attempt = models.ForeignKey(
        TestAttempt, on_delete=models.CASCADE, related_name="section_attempts"
    )
    section = models.ForeignKey(TestSection, on_delete=models.CASCADE)
    raw_score = models.PositiveIntegerField(default=0)
    band = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    submitted_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["attempt", "section"], name="unique_section_per_attempt"
            )
        ]

    def __str__(self):
        return f"{self.attempt_id}/{self.section.kind}: {self.raw_score} -> {self.band}"


class QuestionResponse(models.Model):
    """One graded answer within a section attempt. Upserted on submit."""

    section_attempt = models.ForeignKey(
        SectionAttempt, on_delete=models.CASCADE, related_name="responses"
    )
    question = models.ForeignKey(TestQuestion, on_delete=models.CASCADE)
    given_answer = models.TextField(blank=True)
    is_correct = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["section_attempt", "question"],
                name="unique_response_per_section_attempt",
            )
        ]

    def __str__(self):
        return f"{self.section_attempt_id} Q{self.question.number}"
```

- [ ] **Step 4: Re-export**

Update `backend/apps/exams/models/__init__.py` to add:
```python
from apps.exams.models.attempts import (
    QuestionResponse,
    SectionAttempt,
    TestAttempt,
)
```
and extend `__all__` with `"QuestionResponse"`, `"SectionAttempt"`, `"TestAttempt"`.

- [ ] **Step 5: Migrate and test**

```bash
cd backend && python manage.py makemigrations exams
python manage.py test apps.exams.tests_exams.AttemptModelTests -v 2
```
Expected: migration `0002_*` created; test PASSES.

- [ ] **Step 6: Commit**

```bash
git add backend/apps/exams/models backend/apps/exams/migrations backend/apps/exams/tests_exams.py
git commit -m "feat(exams): attempt and response models"
```

---

## Task 4: Band conversion (`band.py`)

**Files:**
- Create: `backend/apps/exams/band.py`
- Test: `backend/apps/exams/tests_exams.py`

- [ ] **Step 1: Write the failing test**

Append to `backend/apps/exams/tests_exams.py`:
```python
from decimal import Decimal

from apps.exams.band import reading_band, round_to_band
from apps.exams.constants import GENERAL


class BandTests(TestCase):
    def test_academic_boundaries(self):
        self.assertEqual(reading_band(40, ACADEMIC), Decimal("9.0"))
        self.assertEqual(reading_band(39, ACADEMIC), Decimal("9.0"))
        self.assertEqual(reading_band(37, ACADEMIC), Decimal("8.5"))
        self.assertEqual(reading_band(35, ACADEMIC), Decimal("8.0"))
        self.assertEqual(reading_band(30, ACADEMIC), Decimal("7.0"))
        self.assertEqual(reading_band(23, ACADEMIC), Decimal("6.0"))
        self.assertEqual(reading_band(15, ACADEMIC), Decimal("5.0"))
        self.assertEqual(reading_band(0, ACADEMIC), Decimal("0.0"))

    def test_general_boundaries_are_harder(self):
        self.assertEqual(reading_band(40, GENERAL), Decimal("9.0"))
        self.assertEqual(reading_band(34, GENERAL), Decimal("7.0"))
        self.assertEqual(reading_band(30, GENERAL), Decimal("6.0"))
        self.assertEqual(reading_band(23, GENERAL), Decimal("5.0"))
        # 30 correct => Academic 7.0 but GT only 6.0
        self.assertLess(reading_band(30, GENERAL), reading_band(30, ACADEMIC))

    def test_round_to_band(self):
        self.assertEqual(round_to_band(Decimal("6.25")), Decimal("6.5"))
        self.assertEqual(round_to_band(Decimal("6.75")), Decimal("7.0"))
        self.assertEqual(round_to_band(Decimal("6.1")), Decimal("6.0"))
        self.assertEqual(round_to_band(Decimal("6.0")), Decimal("6.0"))
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python manage.py test apps.exams.tests_exams.BandTests -v 2`
Expected: FAIL — `ModuleNotFoundError: apps.exams.band`.

- [ ] **Step 3: Implement band conversion**

`backend/apps/exams/band.py`:
```python
"""Raw-score (0-40) to IELTS band conversion for Reading.

Tables are the widely published approximate conversions; Academic and General
Training differ (GT requires more correct answers for the same band). Each table
is a list of (min_raw, band) thresholds in descending order.
"""
from decimal import Decimal

from apps.exams.constants import ACADEMIC

# (minimum raw score, band) — first row whose min <= raw wins.
_ACADEMIC = [
    (39, "9.0"), (37, "8.5"), (35, "8.0"), (33, "7.5"), (30, "7.0"),
    (27, "6.5"), (23, "6.0"), (19, "5.5"), (15, "5.0"), (13, "4.5"),
    (10, "4.0"), (8, "3.5"), (6, "3.0"), (4, "2.5"), (3, "2.0"),
    (2, "1.5"), (1, "1.0"), (0, "0.0"),
]

_GENERAL = [
    (40, "9.0"), (39, "8.5"), (37, "8.0"), (36, "7.5"), (34, "7.0"),
    (32, "6.5"), (30, "6.0"), (27, "5.5"), (23, "5.0"), (19, "4.5"),
    (15, "4.0"), (12, "3.5"), (9, "3.0"), (6, "2.5"), (4, "2.0"),
    (2, "1.5"), (1, "1.0"), (0, "0.0"),
]


def reading_band(raw: int, module: str) -> Decimal:
    """Band for a 0-40 raw Reading score in the given module."""
    table = _ACADEMIC if module == ACADEMIC else _GENERAL
    for min_raw, band in table:
        if raw >= min_raw:
            return Decimal(band)
    return Decimal("0.0")


def round_to_band(value) -> Decimal:
    """Round an average to the nearest 0.5 using IELTS rounding (.25 -> .5,
    .75 -> next whole)."""
    value = Decimal(value)
    return (value * 2).quantize(Decimal("1")) / 2
```

Note on `round_to_band`: `Decimal.quantize` defaults to ROUND_HALF_EVEN, but `6.25*2=12.5 -> 12` would give 6.0, which is wrong. Use explicit `ROUND_HALF_UP`:
```python
from decimal import Decimal, ROUND_HALF_UP

def round_to_band(value) -> Decimal:
    value = Decimal(value)
    return ((value * 2).quantize(Decimal("1"), rounding=ROUND_HALF_UP) / 2).quantize(
        Decimal("0.1")
    )
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && python manage.py test apps.exams.tests_exams.BandTests -v 2`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/apps/exams/band.py backend/apps/exams/tests_exams.py
git commit -m "feat(exams): reading raw-to-band conversion"
```

---

## Task 5: Serializers

**Files:**
- Create: `backend/apps/exams/api/serializers/__init__.py` (empty)
- Create: `backend/apps/exams/api/serializers/exams.py`
- Test: `backend/apps/exams/tests_exams.py`

- [ ] **Step 1: Write the failing test**

Append to `backend/apps/exams/tests_exams.py`:
```python
from apps.exams.api.serializers.exams import PaperDetailSerializer


class SerializerTests(TestCase):
    def setUp(self):
        self.paper = TestPaper.objects.create(
            module=ACADEMIC, title="AR1", slug="ar1", is_published=True
        )
        section = TestSection.objects.create(paper=self.paper, kind=READING)
        part = SectionPart.objects.create(
            section=section, order=1, title="P1", passage_text="Body."
        )
        group = QuestionGroup.objects.create(
            part=part, order=1, instruction="Q1", widget=RADIO
        )
        TestQuestion.objects.create(
            group=group, number=1, stem="?",
            options=[{"label": "A", "text": "yes"}],
            correct_option="A", explanation="because",
        )

    def test_detail_strips_answer_keys(self):
        data = PaperDetailSerializer(self.paper).data
        q = data["sections"][0]["parts"][0]["groups"][0]["questions"][0]
        self.assertEqual(q["number"], 1)
        self.assertIn("options", q)
        self.assertNotIn("correct_option", q)
        self.assertNotIn("accepted_answers", q)
        self.assertNotIn("explanation", q)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python manage.py test apps.exams.tests_exams.SerializerTests -v 2`
Expected: FAIL — `ImportError`.

- [ ] **Step 3: Implement serializers**

Create empty `backend/apps/exams/api/serializers/__init__.py`.

`backend/apps/exams/api/serializers/exams.py`:
```python
from rest_framework import serializers

from apps.exams.models import (
    QuestionGroup,
    SectionPart,
    TestPaper,
    TestQuestion,
    TestSection,
)


# ---- Runner (answer keys stripped) ---------------------------------------- #

class RunnerQuestionSerializer(serializers.ModelSerializer):
    widget = serializers.CharField(read_only=True)

    class Meta:
        model = TestQuestion
        fields = ["id", "number", "widget", "stem", "options", "order"]


class RunnerGroupSerializer(serializers.ModelSerializer):
    questions = RunnerQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = QuestionGroup
        fields = ["id", "order", "instruction", "widget", "shared_options", "questions"]


class RunnerPartSerializer(serializers.ModelSerializer):
    groups = RunnerGroupSerializer(many=True, read_only=True)

    class Meta:
        model = SectionPart
        fields = ["id", "order", "title", "instructions", "passage_text", "groups"]


class RunnerSectionSerializer(serializers.ModelSerializer):
    parts = RunnerPartSerializer(many=True, read_only=True)

    class Meta:
        model = TestSection
        fields = ["id", "kind", "order", "duration_seconds", "parts"]


class PaperDetailSerializer(serializers.ModelSerializer):
    sections = RunnerSectionSerializer(many=True, read_only=True)

    class Meta:
        model = TestPaper
        fields = ["slug", "title", "module", "sections"]


# ---- Paper list ----------------------------------------------------------- #

class PaperListSerializer(serializers.ModelSerializer):
    sections = serializers.SerializerMethodField()

    class Meta:
        model = TestPaper
        fields = ["slug", "title", "module", "sections"]

    def get_sections(self, paper):
        out = []
        for s in paper.sections.all():
            count = TestQuestion.objects.filter(group__part__section=s).count()
            out.append(
                {"kind": s.kind, "question_count": count, "duration": s.duration_seconds}
            )
        return out
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && python manage.py test apps.exams.tests_exams.SerializerTests -v 2`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/apps/exams/api/serializers backend/apps/exams/tests_exams.py
git commit -m "feat(exams): runner + list serializers (answer keys stripped)"
```

---

## Task 6: API views + urls

**Files:**
- Create: `backend/apps/exams/api/views/__init__.py` (empty)
- Create: `backend/apps/exams/api/views/exams.py`
- Replace: `backend/apps/exams/api/urls.py` (stub from Task 1)
- Test: `backend/apps/exams/tests_exams.py`

- [ ] **Step 1: Write the failing test**

Append to `backend/apps/exams/tests_exams.py`:
```python
from django.urls import reverse


class ApiFlowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="api@example.com", password="Str0ngPass!23"
        )
        self.client.post(
            reverse("auth-login"),
            {"email": "api@example.com", "password": "Str0ngPass!23"},
            content_type="application/json",
        )
        self.paper = TestPaper.objects.create(
            module=ACADEMIC, title="AR1", slug="ar1", is_published=True
        )
        self.section = TestSection.objects.create(paper=self.paper, kind=READING)
        part = SectionPart.objects.create(section=self.section, order=1, title="P1")
        group = QuestionGroup.objects.create(
            part=part, order=1, instruction="Q", widget=RADIO
        )
        self.q1 = TestQuestion.objects.create(
            group=group, number=1, correct_option="A", explanation="e1"
        )
        self.q2 = TestQuestion.objects.create(
            group=group, number=2, correct_option="B", explanation="e2"
        )

    def test_papers_list_filters_by_module(self):
        resp = self.client.get(reverse("exam-paper-list"), {"module": "academic"})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()[0]["slug"], "ar1")
        self.assertEqual(resp.json()[0]["sections"][0]["question_count"], 2)

    def test_attempt_create_then_submit_grades(self):
        create = self.client.post(
            reverse("exam-attempt-create"),
            {"paper_slug": "ar1"},
            content_type="application/json",
        )
        self.assertEqual(create.status_code, 201)
        attempt_id = create.json()["attempt_id"]

        submit = self.client.post(
            reverse("exam-reading-submit", args=[attempt_id]),
            {"answers": {str(self.q1.id): "A", str(self.q2.id): "Z"}},
            content_type="application/json",
        )
        self.assertEqual(submit.status_code, 200)
        self.assertEqual(submit.json()["raw_score"], 1)

    def test_attempt_create_is_reused(self):
        a = self.client.post(
            reverse("exam-attempt-create"), {"paper_slug": "ar1"},
            content_type="application/json",
        ).json()["attempt_id"]
        b = self.client.post(
            reverse("exam-attempt-create"), {"paper_slug": "ar1"},
            content_type="application/json",
        ).json()["attempt_id"]
        self.assertEqual(a, b)

    def test_results_include_review_after_submit(self):
        attempt_id = self.client.post(
            reverse("exam-attempt-create"), {"paper_slug": "ar1"},
            content_type="application/json",
        ).json()["attempt_id"]
        self.client.post(
            reverse("exam-reading-submit", args=[attempt_id]),
            {"answers": {str(self.q1.id): "A", str(self.q2.id): "Z"}},
            content_type="application/json",
        )
        results = self.client.get(reverse("exam-results", args=[attempt_id]))
        self.assertEqual(results.status_code, 200)
        body = results.json()
        self.assertEqual(body["sections"][0]["raw_score"], 1)
        review = {r["number"]: r for r in body["sections"][0]["review"]}
        self.assertTrue(review[1]["is_correct"])
        self.assertEqual(review[1]["correct_answer"], "A")
        self.assertFalse(review[2]["is_correct"])

    def test_non_owner_gets_404(self):
        attempt_id = self.client.post(
            reverse("exam-attempt-create"), {"paper_slug": "ar1"},
            content_type="application/json",
        ).json()["attempt_id"]
        self.client.post(reverse("auth-logout"))
        User.objects.create_user(email="other@example.com", password="Str0ngPass!23")
        self.client.post(
            reverse("auth-login"),
            {"email": "other@example.com", "password": "Str0ngPass!23"},
            content_type="application/json",
        )
        resp = self.client.get(reverse("exam-results", args=[attempt_id]))
        self.assertEqual(resp.status_code, 404)

    def test_paper_list_requires_auth(self):
        self.client.post(reverse("auth-logout"))
        resp = self.client.get(reverse("exam-paper-list"), {"module": "academic"})
        self.assertEqual(resp.status_code, 401)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python manage.py test apps.exams.tests_exams.ApiFlowTests -v 2`
Expected: FAIL — reverse lookups / imports error.

- [ ] **Step 3: Implement the views**

Create empty `backend/apps/exams/api/views/__init__.py`.

`backend/apps/exams/api/views/exams.py`:
```python
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.exams.api.serializers.exams import (
    PaperDetailSerializer,
    PaperListSerializer,
)
from apps.exams.band import reading_band, round_to_band
from apps.exams.constants import IN_PROGRESS, READING, SUBMITTED
from apps.exams.models import (
    QuestionResponse,
    SectionAttempt,
    TestAttempt,
    TestPaper,
    TestQuestion,
)
```

Note: `IN_PROGRESS` / `SUBMITTED` live in `apps.exams.models.attempts`. Re-export them from constants for a single import site — add to `backend/apps/exams/constants.py`:
```python
# Attempt status
IN_PROGRESS = "in_progress"
SUBMITTED = "submitted"
STATUS_CHOICES = [(IN_PROGRESS, "In progress"), (SUBMITTED, "Submitted")]
```
and change `backend/apps/exams/models/attempts.py` to import them instead of redefining:
```python
from apps.exams.constants import IN_PROGRESS, STATUS_CHOICES, SUBMITTED  # noqa: F401
```
(Keep the module-level names so existing `default=IN_PROGRESS` still works.)

Continue `exams.py`:
```python

class PaperListView(APIView):
    """Published papers for a module + per-section summary."""

    def get(self, request):
        module = request.query_params.get("module")
        papers = TestPaper.objects.filter(is_published=True)
        if module:
            papers = papers.filter(module=module)
        return Response(PaperListSerializer(papers, many=True).data)


class PaperDetailView(APIView):
    """Full runner structure for one paper, answer keys stripped."""

    def get(self, request, slug):
        paper = get_object_or_404(TestPaper, slug=slug, is_published=True)
        return Response(PaperDetailSerializer(paper).data)


class AttemptCreateView(APIView):
    """Create (or reuse the existing in-progress) attempt for a paper."""

    def post(self, request):
        slug = request.data.get("paper_slug")
        paper = get_object_or_404(TestPaper, slug=slug, is_published=True)
        attempt, _ = TestAttempt.objects.get_or_create(
            user=request.user, paper=paper, status=IN_PROGRESS,
        )
        return Response(
            {"attempt_id": attempt.id, "status": attempt.status},
            status=status.HTTP_201_CREATED,
        )


class ReadingSubmitView(APIView):
    """Grade the reading section all at once. Idempotent re-submit overwrites."""

    def post(self, request, attempt_id):
        attempt = get_object_or_404(
            TestAttempt, id=attempt_id, user=request.user
        )
        section = get_object_or_404(
            attempt.paper.sections, kind=READING
        )
        answers = request.data.get("answers", {}) or {}

        questions = TestQuestion.objects.filter(group__part__section=section)
        section_attempt, _ = SectionAttempt.objects.get_or_create(
            attempt=attempt, section=section
        )

        raw_score = 0
        for q in questions:
            given = answers.get(str(q.id), answers.get(q.id, ""))
            is_correct = q.check_answer(given)
            raw_score += 1 if is_correct else 0
            QuestionResponse.objects.update_or_create(
                section_attempt=section_attempt,
                question=q,
                defaults={"given_answer": str(given), "is_correct": is_correct},
            )

        band = reading_band(raw_score, attempt.paper.module)
        section_attempt.raw_score = raw_score
        section_attempt.band = band
        section_attempt.save()

        self._finalize(attempt)
        return Response({"raw_score": raw_score, "band": str(band)})

    @staticmethod
    def _finalize(attempt):
        bands = [sa.band for sa in attempt.section_attempts.all()]
        if bands:
            avg = sum(bands) / len(bands)
            attempt.overall_band = round_to_band(avg)
        attempt.status = SUBMITTED
        attempt.submitted_at = timezone.now()
        attempt.save()


class ResultsView(APIView):
    """Per-section scores + per-question review (post-submit)."""

    def get(self, request, attempt_id):
        attempt = get_object_or_404(
            TestAttempt, id=attempt_id, user=request.user
        )
        sections = []
        for sa in attempt.section_attempts.all():
            responses = {r.question_id: r for r in sa.responses.all()}
            review = []
            questions = TestQuestion.objects.filter(
                group__part__section=sa.section
            )
            for q in questions:
                r = responses.get(q.id)
                review.append(
                    {
                        "number": q.number,
                        "given_answer": r.given_answer if r else "",
                        "correct_answer": q.correct_answer_display(),
                        "is_correct": r.is_correct if r else False,
                        "explanation": q.explanation,
                    }
                )
            sections.append(
                {
                    "kind": sa.section.kind,
                    "raw_score": sa.raw_score,
                    "band": str(sa.band),
                    "review": review,
                }
            )
        return Response(
            {
                "overall_band": str(attempt.overall_band)
                if attempt.overall_band is not None
                else None,
                "status": attempt.status,
                "sections": sections,
            }
        )
```

- [ ] **Step 4: Wire the urls**

Replace `backend/apps/exams/api/urls.py`:
```python
from django.urls import path

from apps.exams.api.views.exams import (
    AttemptCreateView,
    PaperDetailView,
    PaperListView,
    ReadingSubmitView,
    ResultsView,
)

urlpatterns = [
    path("exams/papers/", PaperListView.as_view(), name="exam-paper-list"),
    path("exams/papers/<slug:slug>/", PaperDetailView.as_view(), name="exam-paper-detail"),
    path("exams/attempts/", AttemptCreateView.as_view(), name="exam-attempt-create"),
    path(
        "exams/attempts/<int:attempt_id>/sections/reading/submit/",
        ReadingSubmitView.as_view(),
        name="exam-reading-submit",
    ),
    path(
        "exams/attempts/<int:attempt_id>/results/",
        ResultsView.as_view(),
        name="exam-results",
    ),
]
```

- [ ] **Step 5: Run the API tests**

Run: `cd backend && python manage.py test apps.exams.tests_exams.ApiFlowTests -v 2`
Expected: PASS (all 6).

- [ ] **Step 6: Commit**

```bash
git add backend/apps/exams/api backend/apps/exams/constants.py backend/apps/exams/models/attempts.py backend/apps/exams/tests_exams.py
git commit -m "feat(exams): paper/attempt/submit/results API"
```

---

## Task 7: Admin registration

**Files:**
- Create: `backend/apps/exams/admin.py`

- [ ] **Step 1: Register models with inlines**

`backend/apps/exams/admin.py`:
```python
from django.contrib import admin

from apps.exams.models import (
    QuestionGroup,
    QuestionResponse,
    SectionAttempt,
    SectionPart,
    TestAttempt,
    TestPaper,
    TestQuestion,
    TestSection,
)


@admin.register(TestPaper)
class TestPaperAdmin(admin.ModelAdmin):
    list_display = ["title", "module", "slug", "is_published", "order"]
    list_filter = ["module", "is_published"]
    prepopulated_fields = {"slug": ["title"]}


@admin.register(TestSection)
class TestSectionAdmin(admin.ModelAdmin):
    list_display = ["paper", "kind", "order", "duration_seconds"]
    list_filter = ["kind"]


@admin.register(SectionPart)
class SectionPartAdmin(admin.ModelAdmin):
    list_display = ["section", "order", "title"]


@admin.register(QuestionGroup)
class QuestionGroupAdmin(admin.ModelAdmin):
    list_display = ["part", "order", "widget"]


@admin.register(TestQuestion)
class TestQuestionAdmin(admin.ModelAdmin):
    list_display = ["number", "group", "correct_option"]


admin.site.register(TestAttempt)
admin.site.register(SectionAttempt)
admin.site.register(QuestionResponse)
```

- [ ] **Step 2: Verify**

Run: `cd backend && python manage.py check`
Expected: no issues.

- [ ] **Step 3: Commit**

```bash
git add backend/apps/exams/admin.py
git commit -m "feat(exams): admin registration for content QA"
```

---

## Task 8: Seed data + `seed_exams` command

This authors **two full Reading papers** (Academic + GT), each with exactly **40 questions across 3 parts**, idempotent on `slug`. Content is **original, authored in authentic IELTS style** — not copied from real exams.

**Files:**
- Create: `backend/apps/exams/seed_data.py`
- Create: `backend/apps/exams/management/__init__.py` (empty)
- Create: `backend/apps/exams/management/commands/__init__.py` (empty)
- Create: `backend/apps/exams/management/commands/seed_exams.py`
- Test: `backend/apps/exams/tests_exams.py`

- [ ] **Step 1: Write the failing seed test**

Append to `backend/apps/exams/tests_exams.py`:
```python
from django.core.management import call_command

from apps.exams.constants import GENERAL


class SeedTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_exams")

    def test_two_published_papers(self):
        self.assertEqual(TestPaper.objects.filter(is_published=True).count(), 2)
        self.assertTrue(TestPaper.objects.filter(module=ACADEMIC).exists())
        self.assertTrue(TestPaper.objects.filter(module=GENERAL).exists())

    def test_each_paper_has_40_questions_in_3_parts(self):
        for paper in TestPaper.objects.all():
            section = paper.sections.get(kind=READING)
            self.assertEqual(section.parts.count(), 3)
            count = TestQuestion.objects.filter(
                group__part__section=section
            ).count()
            self.assertEqual(count, 40, f"{paper.slug} has {count} questions")

    def test_question_numbers_are_1_to_40_unique(self):
        for paper in TestPaper.objects.all():
            section = paper.sections.get(kind=READING)
            numbers = sorted(
                TestQuestion.objects.filter(group__part__section=section)
                .values_list("number", flat=True)
            )
            self.assertEqual(numbers, list(range(1, 41)))

    def test_seed_is_idempotent(self):
        call_command("seed_exams")
        self.assertEqual(TestPaper.objects.filter(is_published=True).count(), 2)
        for paper in TestPaper.objects.all():
            section = paper.sections.get(kind=READING)
            count = TestQuestion.objects.filter(
                group__part__section=section
            ).count()
            self.assertEqual(count, 40)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python manage.py test apps.exams.tests_exams.SeedTests -v 2`
Expected: FAIL — `Unknown command: 'seed_exams'`.

- [ ] **Step 3: Author the seed data**

`backend/apps/exams/seed_data.py` defines two papers as plain dicts. Each paper: `{slug, module, title, parts: [part, part, part]}`. Each part: `{title, passage_text, groups: [...]}`. Each group: `{instruction, widget, shared_options, questions: [...]}`. Each question: `{stem, options, accepted_answers, correct_option, explanation}`. Questions are numbered automatically by the command in document order (1-40).

Use this exact schema and authoring rules:
- `widget="radio"`: provide `options` as `[{"label": "A", "text": "..."}]` and `correct_option` (a label). For T/F/NG use labels `"True"/"False"/"Not Given"` with matching `text`.
- `widget="dropdown"`: provide `options` (e.g. matching-heading list `[{"label": "i", "text": "..."}]`) or set `shared_options` at the group level and per-question `options` may repeat them; `correct_option` is the chosen label.
- `widget="text"`: provide `accepted_answers` (list of acceptable strings within the stated word limit); leave `correct_option` empty.

**Question-type distribution (deterministic, totals 40 per paper):**

Academic paper (`slug="academic-reading-1"`, increasing difficulty):
- Part 1 "Passage 1" — Q1-13: T/F/NG ×6 (radio), Sentence Completion ×4 (text), MCQ ×3 (radio).
- Part 2 "Passage 2" — Q14-26: Matching Headings ×6 (dropdown, shared_options of 8 headings), Matching Information ×4 (dropdown, paragraph labels), Summary Completion ×3 (text).
- Part 3 "Passage 3" — Q27-40: Y/N/NG ×5 (radio), Matching Features ×5 (dropdown), MCQ ×4 (radio).

General Training paper (`slug="general-reading-1"`):
- Part 1 "Section 1: Everyday notices" — Q1-13: T/F/NG ×7 (radio), Short-Answer ×6 (text, NO MORE THAN THREE WORDS).
- Part 2 "Section 2: Workplace & training" — Q14-26: Matching Information ×6 (dropdown), Note/Table Completion ×4 (text), MCQ ×3 (radio).
- Part 3 "Section 3: A longer text" — Q27-40: Matching Headings ×6 (dropdown), Sentence Completion ×4 (text), T/F/NG ×4 (radio).

Author full, original passage prose (250-900 words per passage, increasing length/complexity) and questions matching the prose. Below is the **concrete template for the first group** — replicate this structure for every group, authoring real content, until each paper reaches exactly 40 questions in the distribution above:

```python
ACADEMIC_PAPER = {
    "slug": "academic-reading-1",
    "module": "academic",
    "title": "Academic Reading Practice Test 1",
    "parts": [
        {
            "title": "Passage 1",
            "passage_text": (
                "The Origins of Urban Beekeeping\n\n"
                "<author 4-6 paragraphs of original IELTS-style prose here, "
                "label paragraphs A, B, C... if Matching Headings/Information "
                "questions reference them>"
            ),
            "groups": [
                {
                    "instruction": (
                        "Questions 1-6\nDo the following statements agree with the "
                        "information in the passage? Write TRUE, FALSE or NOT GIVEN."
                    ),
                    "widget": "radio",
                    "shared_options": [],
                    "questions": [
                        {
                            "stem": "Urban beekeeping was uncommon before the 1990s.",
                            "options": [
                                {"label": "True", "text": "True"},
                                {"label": "False", "text": "False"},
                                {"label": "Not Given", "text": "Not Given"},
                            ],
                            "accepted_answers": [],
                            "correct_option": "True",
                            "explanation": "Paragraph A states it was rare until the 1990s.",
                        },
                        # ... author Q2-Q6 with the same shape
                    ],
                },
                # ... Sentence Completion group (widget="text"), then MCQ group
            ],
        },
        # ... Part 2 (Passage 2), Part 3 (Passage 3)
    ],
}

GENERAL_PAPER = {
    "slug": "general-reading-1",
    "module": "general",
    "title": "General Training Reading Practice Test 1",
    "parts": [
        # ... three parts following the GT distribution above
    ],
}

PAPERS = [ACADEMIC_PAPER, GENERAL_PAPER]
```

For a `dropdown` Matching Headings group, set the group's `shared_options` to the heading list and each question's `options` to the same list, e.g.:
```python
{
    "instruction": "Questions 14-19\nChoose the correct heading for each paragraph.",
    "widget": "dropdown",
    "shared_options": [
        {"label": "i", "text": "The economic case"},
        {"label": "ii", "text": "Early resistance"},
        # ... up to viii
    ],
    "questions": [
        {
            "stem": "Paragraph A",
            "options": [],  # runner uses group.shared_options when options empty
            "accepted_answers": [],
            "correct_option": "iii",
            "explanation": "Paragraph A introduces the economic argument.",
        },
        # ...
    ],
}
```

For a `text` group:
```python
{
    "instruction": "Questions 7-10\nComplete each sentence. NO MORE THAN TWO WORDS.",
    "widget": "text",
    "shared_options": [],
    "questions": [
        {
            "stem": "Bees rely on ______ to navigate between flowers.",
            "options": [],
            "accepted_answers": ["sunlight", "the sun"],
            "correct_option": "",
            "explanation": "Paragraph C: bees use sunlight to navigate.",
        },
        # ...
    ],
}
```

- [ ] **Step 4: Write the seed command**

`backend/apps/exams/management/commands/seed_exams.py`:
```python
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.exams import seed_data as sd
from apps.exams.constants import READING, READING_DURATION_SECONDS
from apps.exams.models import (
    QuestionGroup,
    SectionPart,
    TestPaper,
    TestQuestion,
    TestSection,
)


class Command(BaseCommand):
    help = "Seed two full Reading papers (Academic + GT). Idempotent on slug."

    @transaction.atomic
    def handle(self, *args, **options):
        total_q = 0
        for paper_src in sd.PAPERS:
            paper, _ = TestPaper.objects.update_or_create(
                slug=paper_src["slug"],
                defaults={
                    "module": paper_src["module"],
                    "title": paper_src["title"],
                    "is_published": True,
                },
            )
            section, _ = TestSection.objects.update_or_create(
                paper=paper,
                kind=READING,
                defaults={"order": 1, "duration_seconds": READING_DURATION_SECONDS},
            )
            # Rebuild the tree each run so the seed stays authoritative.
            section.parts.all().delete()

            number = 1
            for p_order, part_src in enumerate(paper_src["parts"], start=1):
                part = SectionPart.objects.create(
                    section=section,
                    order=p_order,
                    title=part_src["title"],
                    passage_text=part_src["passage_text"],
                )
                for g_order, group_src in enumerate(part_src["groups"], start=1):
                    group = QuestionGroup.objects.create(
                        part=part,
                        order=g_order,
                        instruction=group_src["instruction"],
                        widget=group_src["widget"],
                        shared_options=group_src.get("shared_options", []),
                    )
                    for q_order, q_src in enumerate(group_src["questions"], start=1):
                        TestQuestion.objects.create(
                            group=group,
                            number=number,
                            order=q_order,
                            stem=q_src.get("stem", ""),
                            options=q_src.get("options", []),
                            accepted_answers=q_src.get("accepted_answers", []),
                            correct_option=q_src.get("correct_option", ""),
                            explanation=q_src.get("explanation", ""),
                        )
                        number += 1
                        total_q += 1

        self.stdout.write(
            self.style.SUCCESS(f"Seeded {len(sd.PAPERS)} papers, {total_q} questions.")
        )
```

- [ ] **Step 5: Run the seed tests**

Run: `cd backend && python manage.py test apps.exams.tests_exams.SeedTests -v 2`
Expected: PASS. (If a count assertion fails, the authored distribution doesn't total 40 in 3 parts — fix the seed data, not the test.)

- [ ] **Step 6: Run the seed for real and full suite**

```bash
cd backend && python manage.py seed_exams
python manage.py test apps.exams -v 2
```
Expected: "Seeded 2 papers, 80 questions." and all tests pass.

- [ ] **Step 7: Commit**

```bash
git add backend/apps/exams/seed_data.py backend/apps/exams/management backend/apps/exams/tests_exams.py
git commit -m "feat(exams): author + seed Academic and GT reading papers"
```

---

## Task 9: Frontend API client (`lib/exams.ts`)

**Files:**
- Create: `frontend/lib/exams.ts`

- [ ] **Step 1: Write the typed client**

`frontend/lib/exams.ts`:
```typescript
import { api } from "./api";

export type Module = "academic" | "general";
export type Widget = "radio" | "dropdown" | "text";

export interface Option {
  label: string;
  text: string;
}

export interface RunnerQuestion {
  id: number;
  number: number;
  widget: Widget;
  stem: string;
  options: Option[];
  order: number;
}

export interface RunnerGroup {
  id: number;
  order: number;
  instruction: string;
  widget: Widget;
  shared_options: Option[];
  questions: RunnerQuestion[];
}

export interface RunnerPart {
  id: number;
  order: number;
  title: string;
  instructions: string;
  passage_text: string;
  groups: RunnerGroup[];
}

export interface RunnerSection {
  id: number;
  kind: string;
  order: number;
  duration_seconds: number;
  parts: RunnerPart[];
}

export interface PaperDetail {
  slug: string;
  title: string;
  module: Module;
  sections: RunnerSection[];
}

export interface PaperSummary {
  slug: string;
  title: string;
  module: Module;
  sections: { kind: string; question_count: number; duration: number }[];
}

export interface SubmitResult {
  raw_score: number;
  band: string;
}

export interface ReviewRow {
  number: number;
  given_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
}

export interface Results {
  overall_band: string | null;
  status: string;
  sections: {
    kind: string;
    raw_score: number;
    band: string;
    review: ReviewRow[];
  }[];
}

export async function listPapers(module: Module): Promise<PaperSummary[]> {
  const { data } = await api.get("/api/exams/papers/", { params: { module } });
  return data as PaperSummary[];
}

export async function getPaper(slug: string): Promise<PaperDetail> {
  const { data } = await api.get(`/api/exams/papers/${slug}/`);
  return data as PaperDetail;
}

export async function createAttempt(paperSlug: string): Promise<{
  attempt_id: number;
  status: string;
}> {
  const { data } = await api.post("/api/exams/attempts/", {
    paper_slug: paperSlug,
  });
  return data;
}

export async function submitReading(
  attemptId: number,
  answers: Record<number, string>
): Promise<SubmitResult> {
  const { data } = await api.post(
    `/api/exams/attempts/${attemptId}/sections/reading/submit/`,
    { answers }
  );
  return data as SubmitResult;
}

export async function getResults(attemptId: number): Promise<Results> {
  const { data } = await api.get(`/api/exams/attempts/${attemptId}/results/`);
  return data as Results;
}
```

- [ ] **Step 2: Typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors from `lib/exams.ts`.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/exams.ts
git commit -m "feat(exams): frontend typed API client"
```

---

## Task 10: Test-mode UI components

**Files:**
- Create: `frontend/app/(protected)/test/components/CountdownHeader.tsx`
- Create: `frontend/app/(protected)/test/components/TestQuestionPane.tsx`

- [ ] **Step 1: Countdown header (strict, auto-submit at zero)**

`frontend/app/(protected)/test/components/CountdownHeader.tsx`:
```typescript
"use client";

import { useEffect, useRef, useState } from "react";

interface CountdownHeaderProps {
  title: string;
  durationSeconds: number;
  onExpire: () => void;
}

function format(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export const CountdownHeader = ({
  title,
  durationSeconds,
  onExpire,
}: CountdownHeaderProps) => {
  const [remaining, setRemaining] = useState(durationSeconds);
  const expired = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          if (!expired.current) {
            expired.current = true;
            onExpire();
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onExpire]);

  const low = remaining <= 300; // last 5 minutes

  return (
    <header className="flex items-center justify-between bg-[#2b3a4a] text-white px-6 py-2.5 shadow">
      <span className="font-semibold truncate">{title}</span>
      <div
        className={`flex items-center gap-2 font-mono text-lg tabular-nums ${
          low ? "text-red-400" : ""
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        {format(remaining)}
      </div>
    </header>
  );
};
```

- [ ] **Step 2: Question pane (no inline grading)**

`frontend/app/(protected)/test/components/TestQuestionPane.tsx`:
```typescript
"use client";

import type { RunnerPart, RunnerQuestion } from "@/lib/exams";

interface TestQuestionPaneProps {
  part: RunnerPart;
  answers: Record<number, string>;
  flagged: Record<number, boolean>;
  onAnswer: (questionId: number, value: string) => void;
  onToggleFlag: (questionId: number) => void;
}

function optionsFor(q: RunnerQuestion, groupShared: { label: string; text: string }[]) {
  return q.options.length > 0 ? q.options : groupShared;
}

export const TestQuestionPane = ({
  part,
  answers,
  flagged,
  onAnswer,
  onToggleFlag,
}: TestQuestionPaneProps) => {
  return (
    <div className="p-6 max-w-2xl">
      {part.groups.map((group) => (
        <div key={group.id} className="mb-8">
          <p className="whitespace-pre-line text-sm font-semibold text-gray-700 mb-4">
            {group.instruction}
          </p>
          {group.questions.map((q) => {
            const value = answers[q.id] ?? "";
            const opts = optionsFor(q, group.shared_options);
            return (
              <div key={q.id} className="mb-6" id={`q-${q.number}`}>
                <div className="flex items-start gap-2 mb-2">
                  <span className="font-semibold text-gray-500 text-sm">
                    {q.number}.
                  </span>
                  <p className="text-gray-900 flex-1">{q.stem}</p>
                  <button
                    onClick={() => onToggleFlag(q.id)}
                    className={`text-xs shrink-0 ${
                      flagged[q.id] ? "text-amber-600" : "text-gray-400"
                    }`}
                    aria-label="Flag for review"
                  >
                    ⚑
                  </button>
                </div>

                {group.widget === "radio" && (
                  <div className="space-y-2 ml-6">
                    {opts.map((c) => (
                      <label
                        key={c.label}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer ${
                          value === c.label
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={value === c.label}
                          onChange={() => onAnswer(q.id, c.label)}
                          className="accent-blue-600"
                        />
                        <span className="text-gray-800">{c.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {group.widget === "dropdown" && (
                  <select
                    value={value}
                    onChange={(e) => onAnswer(q.id, e.target.value)}
                    className="ml-6 w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="">— Select —</option>
                    {opts.map((c) => (
                      <option key={c.label} value={c.label}>
                        {c.text}
                      </option>
                    ))}
                  </select>
                )}

                {group.widget === "text" && (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => onAnswer(q.id, e.target.value)}
                    placeholder="Type your answer..."
                    className="ml-6 w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg"
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
```

- [ ] **Step 3: Typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "frontend/app/(protected)/test/components"
git commit -m "feat(exams): countdown header and test question pane"
```

---

## Task 11: `/test` landing page

**Files:**
- Create: `frontend/app/(protected)/test/page.tsx`

- [ ] **Step 1: Build the landing flow**

`frontend/app/(protected)/test/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createAttempt,
  listPapers,
  type Module,
  type PaperSummary,
} from "@/lib/exams";

export default function TestLandingPage() {
  const router = useRouter();
  const [module, setModule] = useState<Module>("academic");
  const [papers, setPapers] = useState<PaperSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setSelected(null);
    listPapers(module)
      .then(setPapers)
      .catch(() => setError("Failed to load tests."))
      .finally(() => setLoading(false));
  }, [module]);

  const start = async () => {
    if (!selected) return;
    setStarting(true);
    try {
      const { attempt_id } = await createAttempt(selected);
      router.push(`/test/${attempt_id}`);
    } catch {
      setError("Could not start the test.");
      setStarting(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">IELTS Test Mode</h1>
      <p className="text-gray-600 mb-6">
        A full, timed Reading test graded like the real exam.
      </p>

      <div className="flex gap-3 mb-6">
        {(["academic", "general"] as Module[]).map((m) => (
          <button
            key={m}
            onClick={() => setModule(m)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              module === m
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {m === "general" ? "General Training" : "Academic"}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-500">Loading tests…</p>
      ) : (
        <div className="space-y-3 mb-8">
          {papers.map((p) => {
            const reading = p.sections.find((s) => s.kind === "reading");
            return (
              <button
                key={p.slug}
                onClick={() => setSelected(p.slug)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  selected === p.slug
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-gray-800">{p.title}</div>
                <div className="text-sm text-gray-500">
                  Reading · {reading?.question_count ?? 40} questions ·{" "}
                  {Math.round((reading?.duration ?? 3600) / 60)} min
                </div>
              </button>
            );
          })}
          {papers.length === 0 && (
            <p className="text-gray-500">No tests available yet.</p>
          )}
        </div>
      )}

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6 text-sm text-amber-800">
        <p className="font-semibold mb-1">Before you start</p>
        <ul className="list-disc list-inside space-y-1">
          <li>The Reading section is 60 minutes and auto-submits at zero.</li>
          <li>You answer all 40 questions, then submit once for grading.</li>
          <li>You can flag questions and jump between them freely.</li>
        </ul>
      </div>

      <button
        onClick={start}
        disabled={!selected || starting}
        className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-40"
      >
        {starting ? "Starting…" : "Start test"}
      </button>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/(protected)/test/page.tsx"
git commit -m "feat(exams): /test landing page"
```

---

## Task 12: `/test/[attemptId]` runner

**Files:**
- Create: `frontend/app/(protected)/test/[attemptId]/page.tsx`

- [ ] **Step 1: Build the runner**

`frontend/app/(protected)/test/[attemptId]/page.tsx`:
```typescript
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SplitPane } from "@/app/(protected)/reading/components/exam/SplitPane";
import { QuestionPalette } from "@/app/(protected)/reading/components/exam/QuestionPalette";
import { CountdownHeader } from "../components/CountdownHeader";
import { TestQuestionPane } from "../components/TestQuestionPane";
import {
  getPaper,
  submitReading,
  type PaperDetail,
  type RunnerPart,
  type RunnerQuestion,
} from "@/lib/exams";

export default function RunnerPage() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = Number(params.attemptId);
  const router = useRouter();

  const [paper, setPaper] = useState<PaperDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePart, setActivePart] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Load the paper by reading the attempt's paper. The attempt was created on
  // the landing page; we fetch the paper structure via the slug carried in the
  // attempt. Since the attempt endpoint returns only ids, list+match by module
  // is avoided: we re-fetch using the paper slug stored alongside the attempt.
  // To keep it simple we look up the single in-progress paper via results meta.
  useEffect(() => {
    let cancelled = false;
    // The attempt's paper slug is needed; fetch it from the results endpoint
    // which is owner-guarded and returns status even before submit.
    import("@/lib/api").then(({ api }) => {
      api
        .get(`/api/exams/attempts/${attemptId}/results/`)
        .then(async (r) => {
          // results doesn't carry slug; instead we stored it in sessionStorage
          const slug = sessionStorage.getItem(`attempt-${attemptId}-slug`);
          if (!slug) {
            setError("Test session not found. Please restart from /test.");
            return;
          }
          const p = await getPaper(slug);
          if (!cancelled) setPaper(p);
        })
        .catch(() => setError("Could not load this attempt."));
    });
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  const readingSection = paper?.sections.find((s) => s.kind === "reading");
  const parts: RunnerPart[] = useMemo(
    () => readingSection?.parts ?? [],
    [readingSection]
  );

  const allQuestions: RunnerQuestion[] = useMemo(
    () =>
      parts.flatMap((part) => part.groups.flatMap((g) => g.questions)),
    [parts]
  );

  const doSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitReading(attemptId, answers);
      router.push(`/test/${attemptId}/results`);
    } catch {
      setError("Submission failed. Please try again.");
      setSubmitting(false);
    }
  }, [answers, attemptId, router, submitting]);

  if (error)
    return <div className="p-8 text-red-600 max-w-xl mx-auto">{error}</div>;
  if (!paper || !readingSection)
    return <div className="p-8 text-gray-500">Loading test…</div>;

  const part = parts[activePart];
  const paletteItems = allQuestions.map((q) => ({
    number: q.number,
    answered: Boolean(answers[q.id]),
    flagged: Boolean(flagged[q.id]),
  }));

  return (
    <div className="flex flex-col h-screen">
      <CountdownHeader
        title={`${paper.title} — Reading`}
        durationSeconds={readingSection.duration_seconds}
        onExpire={doSubmit}
      />

      <div className="flex items-center gap-2 px-6 py-2 border-b bg-gray-50">
        {parts.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => setActivePart(idx)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              idx === activePart
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <SplitPane
        left={
          <div className="p-6 prose max-w-none">
            <h2 className="text-xl font-bold mb-3">{part.title}</h2>
            <div className="whitespace-pre-line text-gray-800 leading-relaxed">
              {part.passage_text}
            </div>
          </div>
        }
        right={
          <TestQuestionPane
            part={part}
            answers={answers}
            flagged={flagged}
            onAnswer={(id, value) =>
              setAnswers((a) => ({ ...a, [id]: value }))
            }
            onToggleFlag={(id) =>
              setFlagged((f) => ({ ...f, [id]: !f[id] }))
            }
          />
        }
      />

      <QuestionPalette
        items={paletteItems}
        current={-1}
        onJump={(idx) => {
          const target = allQuestions[idx];
          const partIdx = parts.findIndex((p) =>
            p.groups.some((g) => g.questions.some((q) => q.id === target.id))
          );
          if (partIdx >= 0) setActivePart(partIdx);
          setTimeout(() => {
            document
              .getElementById(`q-${target.number}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 50);
        }}
        onFinish={() => setConfirming(true)}
        allAnswered={false}
      />

      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Submit test?</h3>
            <p className="text-sm text-gray-600 mb-5">
              You answered {Object.keys(answers).length} of {allQuestions.length}{" "}
              questions. You can’t change answers after submitting.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                Keep working
              </button>
              <button
                onClick={doSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-40"
              >
                {submitting ? "Submitting…" : "Submit test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

Note: `QuestionPalette.onFinish` is enabled regardless of `allAnswered`; we pass `allAnswered={false}` so the footer's own disable would block it — instead we trigger confirm via `onFinish` and need the button enabled. **Adjust** the call to pass `allAnswered={true}` so the Finish button is always clickable in test mode (partial submission is allowed; the confirm dialog shows the count).

- [ ] **Step 2: Persist the slug on the landing page**

Modify `frontend/app/(protected)/test/page.tsx` `start()` to store the slug before navigating (the runner reads it from `sessionStorage`):
```typescript
  const start = async () => {
    if (!selected) return;
    setStarting(true);
    try {
      const { attempt_id } = await createAttempt(selected);
      sessionStorage.setItem(`attempt-${attempt_id}-slug`, selected);
      router.push(`/test/${attempt_id}`);
    } catch {
      setError("Could not start the test.");
      setStarting(false);
    }
  };
```

- [ ] **Step 3: Apply the `allAnswered` fix**

In the runner, change `allAnswered={false}` to `allAnswered={true}` in the `QuestionPalette` usage.

- [ ] **Step 4: Typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "frontend/app/(protected)/test"
git commit -m "feat(exams): timed reading runner"
```

---

## Task 13: `/test/[attemptId]/results` page

**Files:**
- Create: `frontend/app/(protected)/test/[attemptId]/results/page.tsx`

- [ ] **Step 1: Build the results page**

`frontend/app/(protected)/test/[attemptId]/results/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getResults, type Results } from "@/lib/exams";

export default function ResultsPage() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = Number(params.attemptId);
  const router = useRouter();
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getResults(attemptId)
      .then(setResults)
      .catch(() => setError("Could not load your results."));
  }, [attemptId]);

  if (error)
    return <div className="p-8 text-red-600 max-w-xl mx-auto">{error}</div>;
  if (!results)
    return <div className="p-8 text-gray-500">Loading results…</div>;

  const reading = results.sections.find((s) => s.kind === "reading");

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your results</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
          <div className="text-sm text-blue-700">Overall band</div>
          <div className="text-4xl font-bold text-blue-800">
            {results.overall_band ?? "—"}
          </div>
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5">
          <div className="text-sm text-emerald-700">Reading</div>
          <div className="text-4xl font-bold text-emerald-800">
            {reading?.band ?? "—"}
          </div>
          <div className="text-sm text-emerald-700 mt-1">
            {reading?.raw_score ?? 0} / 40 correct
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-3">
        Answer review
      </h2>
      <div className="space-y-2 mb-8">
        {reading?.review.map((r) => (
          <div
            key={r.number}
            className={`rounded-lg border p-3 ${
              r.is_correct
                ? "border-emerald-200 bg-emerald-50"
                : "border-rose-200 bg-rose-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">
                Question {r.number}
              </span>
              <span
                className={
                  r.is_correct ? "text-emerald-700" : "text-rose-700"
                }
              >
                {r.is_correct ? "Correct" : "Incorrect"}
              </span>
            </div>
            <div className="text-sm text-gray-700 mt-1">
              Your answer:{" "}
              <strong>{r.given_answer || "(blank)"}</strong>
              {!r.is_correct && (
                <>
                  {" · "}Correct: <strong>{r.correct_answer}</strong>
                </>
              )}
            </div>
            {r.explanation && (
              <div className="text-sm text-gray-500 mt-1">{r.explanation}</div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/test")}
        className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
      >
        Back to tests
      </button>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/(protected)/test/[attemptId]/results"
git commit -m "feat(exams): results + answer review page"
```

---

## Task 14: Wire the sidebar "Test" entry to `/test`

**Files:**
- Modify: `frontend/app/(protected)/reading/components/Navigation.tsx`

- [ ] **Step 1: Make the "Test" button navigate**

The `"Test"` item is currently rendered in the same `.map` as practice types and only calls `onSelect`. Remove `"Test"` from the `questionTypes` array and add a dedicated link button above the question-type list (next to "View Results"). Edit `Navigation.tsx`:

Remove the `"Test",` line from `questionTypes`:
```typescript
  "Short-Answer Questions",
  "Random",
];
```

Add a link under the existing "View Results" link:
```typescript
      <Link href="/reading/results">
        <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 mb-4">
          View Results
        </button>
      </Link>
      <Link href="/test">
        <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 mb-4">
          Take a Full Test
        </button>
      </Link>
```

- [ ] **Step 2: Typecheck + build**

Run: `cd frontend && npx tsc --noEmit && npx next build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/(protected)/reading/components/Navigation.tsx"
git commit -m "feat(exams): link sidebar Test entry to /test"
```

---

## Task 15: Full verification pass

- [ ] **Step 1: Backend — migrations clean + full suite**

```bash
cd backend && python manage.py makemigrations --check --dry-run
python manage.py test apps.exams -v 2
```
Expected: "No changes detected" (or already-created migrations), all exams tests pass.

- [ ] **Step 2: Backend — seed runs and is idempotent**

```bash
cd backend && python manage.py seed_exams && python manage.py seed_exams
```
Expected: "Seeded 2 papers, 80 questions." both times, no errors.

- [ ] **Step 3: Frontend — typecheck + build**

```bash
cd frontend && npx tsc --noEmit && npx next build
```
Expected: both succeed.

- [ ] **Step 4: Manual smoke test**

Start backend (`python manage.py runserver`) and frontend (`npm run dev`), log in, then:
1. Open `/test`, switch Academic/GT — paper lists load.
2. Start a test → runner loads with 3 passages, palette 1–40, 60:00 countdown.
3. Answer some questions, flag a few, jump via palette, switch passages.
4. Finish → confirm → results show overall band, reading band, raw/40, per-question review.
5. Reload results URL — still loads (owner-guarded).

- [ ] **Step 5: Final commit (if any manual fixes were needed)**

```bash
git add -A
git commit -m "fix(exams): manual smoke-test adjustments"
```

---

## Self-review notes (already applied)

- **Settings:** plan registers the app in the **package** `config/settings/__init__.py`, not the stale `config/settings.py`.
- **`widget` source:** `TestQuestion.widget` is a property reading `group.widget`; serializers expose it via `CharField(read_only=True)`; the runner pane reads `group.widget`. Consistent everywhere.
- **`IN_PROGRESS`/`SUBMITTED`:** defined once in `constants.py`, imported by both `models/attempts.py` and `views/exams.py` (Task 6, Step 3).
- **Slug for runner:** the runner needs the paper slug; the attempt-create response only returns ids, so the landing page stores the slug in `sessionStorage` (Task 12, Step 2) and the runner reads it. (A cleaner future option: add `paper_slug` to the results payload; deferred to keep the API matching the spec.)
- **Palette `allAnswered`:** test mode allows partial submit, so the runner passes `allAnswered={true}` (Task 12, Step 3) and gates real submission behind the confirm dialog.
- **Spec coverage:** every model, endpoint, seeding requirement, and frontend route in the spec maps to a task (models 2–3, grading 2/4/6, API 6, seeding 8, frontend 9–14, testing 2–9 + 15).
