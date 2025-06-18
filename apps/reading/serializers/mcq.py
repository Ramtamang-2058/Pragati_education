from rest_framework import serializers

from apps.reading.models import MultipleChoiceQuestion


class MultipleChoiceQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MultipleChoiceQuestion
        fields = '__all__'
