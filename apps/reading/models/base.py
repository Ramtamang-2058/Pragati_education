from django.db import models
from abc import ABC

class QuestionBase(models.Model, ABC):
    DIFFICULTY_LEVELS = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    title = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True  # OCP: other types can extend this
