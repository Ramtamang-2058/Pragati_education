# core/interfaces/question_handler.py
from abc import ABC, abstractmethod
from typing import Any, Dict


class QuestionHandlerInterface(ABC):
    @abstractmethod
    def validate_answer(self, answer: Any) -> bool:
        pass

    @abstractmethod
    def calculate_score(self, answer: Any, correct_answer: Any) -> float:
        pass

    @abstractmethod
    def format_answer(self, answer: Any) -> Dict[str, Any]:
        pass


# core/interfaces/scoring_strategy.py
class ScoringStrategyInterface(ABC):
    @abstractmethod
    def calculate_test_score(self, answers: List[Dict]) -> Dict[str, Any]:
        pass


# core/interfaces/test_service.py
class TestServiceInterface(ABC):
    @abstractmethod
    def create_test_session(self, user_id: int, test_id: int) -> Dict:
        pass

    @abstractmethod
    def submit_answer(self, session_id: str, question_id: int, answer: Any) -> bool:
        pass

    @abstractmethod
    def finish_test(self, session_id: str) -> Dict:
        pass