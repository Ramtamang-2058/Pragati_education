# core/services/test_service.py
from typing import Dict, Any, List
from django.utils import timezone
from apps.reading.models import TestSession, UserAnswer, Question
from core.interfaces.test_service import TestServiceInterface
from core.services.scoring_service import ScoringService


class TestService(TestServiceInterface):
    def __init__(self):
        self.scoring_service = ScoringService()

    def create_test_session(self, user_id: int, test_id: str) -> Dict:
        session = TestSession.objects.create(
            user_id=user_id,
            test_id=test_id,
            status='started'
        )

        return {
            'session_id': str(session.id),
            'test_id': test_id,
            'started_at': session.started_at.isoformat(),
            'duration_minutes': session.test.duration_minutes
        }

    def submit_answer(self, session_id: str, question_id: str, answer: Any) -> bool:
        try:
            session = TestSession.objects.get(id=session_id)
            question = Question.objects.get(id=question_id)

            # Get appropriate handler for question type
            handler = QuestionHandlerFactory.get_handler(question.question_type)

            if not handler.validate_answer(answer):
                return False

            # Calculate score
            correct_answer = question.answers.filter(is_correct=True).first()
            score = handler.calculate_score(answer, correct_answer.content if correct_answer else None)

            # Save user answer
            user_answer, created = UserAnswer.objects.update_or_create(
                session=session,
                question=question,
                defaults={
                    'answer_content': str(answer),
                    'score': score,
                    'is_correct': score > 0
                }
            )

            # Update session status
            session.status = 'in_progress'
            session.save()

            return True

        except Exception as e:
            # Log error
            return False

    def finish_test(self, session_id: str) -> Dict:
        session = TestSession.objects.get(id=session_id)

        # Calculate final score
        result = self.scoring_service.calculate_test_score(session)

        # Update session
        session.status = 'completed'
        session.completed_at = timezone.now()
        session.score = result['total_score']
        session.correct_answers = result['correct_answers']
        session.total_questions = result['total_questions']
        session.save()

        return result