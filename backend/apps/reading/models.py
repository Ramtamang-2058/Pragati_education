# apps/reading/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class ReadingTest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration_minutes = models.IntegerField(default=60)
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='intermediate'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'reading_tests'


class Passage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    test = models.ForeignKey(ReadingTest, on_delete=models.CASCADE, related_name='passages')
    title = models.CharField(max_length=255)
    content = models.TextField()
    order = models.IntegerField(default=0)
    word_count = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['order']
        unique_together = ['test', 'order']
        db_table = 'passages'


class Question(models.Model):
    QUESTION_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false_not_given', 'True/False/Not Given'),
        ('yes_no_not_given', 'Yes/No/Not Given'),
        ('matching_headings', 'Matching Headings'),
        ('sentence_completion', 'Sentence Completion'),
        ('summary_completion', 'Summary Completion'),
        ('short_answer', 'Short Answer'),
        ('matching_information', 'Matching Information'),
        ('matching_features', 'Matching Features'),
        ('diagram_labeling', 'Diagram Labeling'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    passage = models.ForeignKey(Passage, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=50, choices=QUESTION_TYPES)
    number = models.IntegerField()
    points = models.FloatField(default=1.0, validators=[MinValueValidator(0.1)])
    explanation = models.TextField(blank=True)

    # Metadata for different question types
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['number']
        unique_together = ['passage', 'number']
        db_table = 'questions'


class Answer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    content = models.TextField()
    is_correct = models.BooleanField(default=False)
    explanation = models.TextField(blank=True)

    class Meta:
        db_table = 'answers'


class TestSession(models.Model):
    STATUS_CHOICES = [
        ('started', 'Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='test_sessions')
    test = models.ForeignKey(ReadingTest, on_delete=models.CASCADE, related_name='sessions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='started')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)

    class Meta:
        db_table = 'test_sessions'
        unique_together = ['user', 'test', 'started_at']


class UserAnswer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(TestSession, on_delete=models.CASCADE, related_name='user_answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_content = models.TextField()
    is_correct = models.BooleanField(null=True, blank=True)
    score = models.FloatField(default=0.0)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_answers'
        unique_together = ['session', 'question']