from django.db import models

class Question(models.Model):
    question_type = models.CharField(max_length=100)
    level = models.CharField(max_length=10, choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')])
    passage = models.TextField()
    question_stem = models.TextField()
    explanation = models.TextField()
    status = models.CharField(max_length=20, choices=[('completed', 'Completed'), ('inProgress', 'In Progress'), ('notStarted', 'Not Started')])
    score = models.IntegerField(null=True, blank=True)

class Option(models.Model):
    question = models.ForeignKey(Question, related_name='options', on_delete=models.CASCADE)
    letter = models.CharField(max_length=1)
    text = models.TextField()
    is_correct = models.BooleanField(default=False)