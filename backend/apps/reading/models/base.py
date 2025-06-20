# apps/reading/models/base.py
from django.db import models
from abc import abstractmethod


class QuestionBase(models.Model):
    """
    Abstract base class for all question types.
    Uses Django's abstract model instead of ABCMeta.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True  # This makes it an abstract Django model

    @abstractmethod
    def get_type(self):
        """Return the type of question"""
        pass

    @abstractmethod
    def get_question_text(self):
        """Return the question text"""
        pass