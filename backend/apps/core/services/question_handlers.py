# core/services/question_handlers.py
from typing import Any, Dict, List
from core.interfaces.question_handler import QuestionHandlerInterface


class MultipleChoiceHandler(QuestionHandlerInterface):
    def validate_answer(self, answer: Any) -> bool:
        return isinstance(answer, (str, int)) and answer is not None

    def calculate_score(self, answer: Any, correct_answer: Any) -> float:
        return 1.0 if str(answer).lower() == str(correct_answer).lower() else 0.0

    def format_answer(self, answer: Any) -> Dict[str, Any]:
        return {
            'type': 'multiple_choice',
            'value': answer,
            'formatted': str(answer)
        }


class TrueFalseNotGivenHandler(QuestionHandlerInterface):
    VALID_ANSWERS = ['true', 'false', 'not given', 't', 'f', 'ng']

    def validate_answer(self, answer: Any) -> bool:
        return str(answer).lower() in self.VALID_ANSWERS

    def calculate_score(self, answer: Any, correct_answer: Any) -> float:
        normalized_answer = self._normalize_answer(str(answer).lower())
        normalized_correct = self._normalize_answer(str(correct_answer).lower())
        return 1.0 if normalized_answer == normalized_correct else 0.0

    def _normalize_answer(self, answer: str) -> str:
        mapping = {
            'true': 'true', 't': 'true',
            'false': 'false', 'f': 'false',
            'not given': 'not given', 'ng': 'not given'
        }
        return mapping.get(answer.lower(), answer)

    def format_answer(self, answer: Any) -> Dict[str, Any]:
        return {
            'type': 'true_false_not_given',
            'value': answer,
            'normalized': self._normalize_answer(str(answer).lower())
        }


# Factory for question handlers
class QuestionHandlerFactory:
    _handlers = {
        'multiple_choice': MultipleChoiceHandler,
        'true_false_not_given': TrueFalseNotGivenHandler,
        'yes_no_not_given': TrueFalseNotGivenHandler,  # Similar logic
        # Add more handlers...
    }

    @classmethod
    def get_handler(cls, question_type: str) -> QuestionHandlerInterface:
        handler_class = cls._handlers.get(question_type)
        if not handler_class:
            raise ValueError(f"No handler found for question type: {question_type}")
        return handler_class()

