from django.urls import path

from apps.reading.api.views.mcq import (
    MultipleChoiceQuestionListAPIView,
    MCQProgressListAPIView,
    QuestionDetailView,
    QuestionSubmitView,
    QuestionListView
)

urlpatterns = [
    path('mcq/', MultipleChoiceQuestionListAPIView.as_view(), name='mcq-list'),
    path("mcq-progress/", MCQProgressListAPIView.as_view(), name="mcq-progress"),
    path('questions/', QuestionListView.as_view(), name='question-list'),
    path('questions/<int:pk>/', QuestionDetailView.as_view(), name='question-detail'),
    path('questions/<int:pk>/submit/', QuestionSubmitView.as_view(), name='question-submit'),

]
