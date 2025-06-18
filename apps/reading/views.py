from rest_framework.views import APIView
from rest_framework.response import Response
from apps.reading.models import MultipleChoiceQuestion
from apps.reading.serializers import MultipleChoiceQuestionSerializer

class MultipleChoiceQuestionListAPIView(APIView):
    def get(self, request):
        questions = MultipleChoiceQuestion.objects.all()
        serializer = MultipleChoiceQuestionSerializer(questions, many=True)
        return Response(serializer.data)
