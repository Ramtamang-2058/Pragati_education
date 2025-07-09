from rest_framework.response import Response
from rest_framework.views import APIView

from apps.reading.models import MultipleChoiceQuestion
from apps.reading.serializers import MultipleChoiceQuestionSerializer


class MultipleChoiceQuestionListAPIView(APIView):
    def get(self, request):
        questions = MultipleChoiceQuestion.objects.all()
        serializer = MultipleChoiceQuestionSerializer(questions, many=True)
        return Response(serializer.data)


class MCQProgressListAPIView(APIView):
    def get(self, request):
        level = request.GET.get("level")
        qtype = request.GET.get("type")
        # user = request.user

        # 👇 COMMENTED OUT: Real DB logic to be added later
        # progress = MCQProgress.objects.filter(user=user, question__difficulty=level)

        # ✅ Dummy data for testing
        dummy_progress = [
            {"id": i + 1, "status": "completed" if i % 3 == 0 else "inProgress" if i % 3 == 1 else "notStarted",
             "score": 80 + (i % 10) if i % 3 == 0 else None}
            for i in range(30)
        ]

        return Response(dummy_progress)

# reading/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.reading.tests import DUMMY_QUESTIONS
from apps.reading.api.serializers.serializers import QuestionSerializer
from django.http import Http404

class QuestionListView(APIView):
    def get(self, request):
        level = request.query_params.get('level')
        question_type = request.query_params.get('question_type')
        status_param = request.query_params.get('status')

        questions = DUMMY_QUESTIONS
        if level:
            questions = [q for q in questions if q['level'] == level]
        if question_type:
            questions = [q for q in questions if q['question_type'] == question_type]
        if status_param:
            questions = [q for q in questions if q['status'] == status_param]

        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

class QuestionDetailView(APIView):
    def get_object(self, pk):
        for question in DUMMY_QUESTIONS:
            if question['id'] == pk:
                return question
        raise Http404

    def get(self, request, pk):
        question = self.get_object(pk)
        serializer = QuestionSerializer(question)
        return Response(serializer.data)

class QuestionSubmitView(APIView):
    def get_object(self, pk):
        for question in DUMMY_QUESTIONS:
            if question['id'] == pk:
                return question
        raise Http404

    def post(self, request, pk):
        question = self.get_object(pk)
        selected_options = request.data.get('selected_options', [])

        correct_options = [opt['letter'] for opt in question['options'] if opt['is_correct']]
        is_correct = set(selected_options) == set(correct_options)

        score = 100 if is_correct else 0
        question['status'] = 'completed'
        question['score'] = score

        serializer = QuestionSerializer(question)
        return Response({'score': score}, status=status.HTTP_200_OK)