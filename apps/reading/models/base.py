from abc import ABCMeta, abstractmethod

from django.db import models


class QuestionBase(models.Model, metaclass=ABCMeta):
    DIFFICULTY_LEVELS = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    title = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True

    @abstractmethod
    def get_question_text(self):
        pass
