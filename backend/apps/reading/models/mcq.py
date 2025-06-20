# apps/reading/models/mcq.py
from django.db import models
from .base import QuestionBase


class MultipleChoiceQuestion(QuestionBase):
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1, choices=[
        ('A', 'Option A'),
        ('B', 'Option B'),
        ('C', 'Option C'),
        ('D', 'Option D')
    ])

    def get_type(self):
        return "mcq"

    def get_question_text(self):
        return self.question_text

    def __str__(self):
        return f"MCQ: {self.question_text[:50]}..."
