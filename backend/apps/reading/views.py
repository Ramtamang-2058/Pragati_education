# apps/reading/serializers.py
from rest_framework import serializers
from .models import ReadingTest, Passage, Question, Answer, TestSession, UserAnswer


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'content', 'explanation']


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'number', 'points', 'metadata', 'answers']


class PassageSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Passage
        fields = ['id', 'title', 'content', 'order', 'word_count', 'questions']


class ReadingTestSerializer(serializers.ModelSerializer):
    passages = PassageSerializer(many=True, read_only=True)

    class Meta:
        model = ReadingTest
        fields = ['id', 'title', 'description', 'duration_minutes', 'difficulty_level', 'passages']


class TestSessionSerializer(serializers.ModelSerializer):
    test = ReadingTestSerializer(read_only=True)

    class Meta:
        model = TestSession
        fields = ['id', 'test', 'status', 'started_at', 'completed_at', 'score', 'total_questions', 'correct_answers']