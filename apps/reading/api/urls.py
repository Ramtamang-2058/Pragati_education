from django.urls import path
from apps.reading.api.views import MultipleChoiceQuestionListAPIView

urlpatterns = [
    path('mcq/', MultipleChoiceQuestionListAPIView.as_view(), name='mcq-list'),
]
