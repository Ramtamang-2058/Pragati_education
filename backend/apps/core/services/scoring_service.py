# core/services/scoring_service.py
class ScoringService:
    def calculate_test_score(self, session: TestSession) -> Dict[str, Any]:
        user_answers = session.user_answers.all()

        total_score = sum(answer.score for answer in user_answers)
        total_questions = user_answers.count()
        correct_answers = user_answers.filter(is_correct=True).count()

        # IELTS band score calculation (simplified)
        percentage = (total_score / total_questions) * 100 if total_questions > 0 else 0
        band_score = self._calculate_band_score(percentage)

        return {
            'total_score': total_score,
            'total_questions': total_questions,
            'correct_answers': correct_answers,
            'percentage': percentage,
            'band_score': band_score,
            'detailed_answers': [
                {
                    'question_id': str(answer.question.id),
                    'user_answer': answer.answer_content,
                    'is_correct': answer.is_correct,
                    'score': answer.score
                }
                for answer in user_answers
            ]
        }

    def _calculate_band_score(self, percentage: float) -> float:
        # Simplified IELTS band score mapping
        if percentage >= 90:
            return 9.0
        elif percentage >= 80:
            return 8.0
        elif percentage >= 70:
            return 7.0
        elif percentage >= 60:
            return 6.0
        elif percentage >= 50:
            return 5.0
        elif percentage >= 40:
            return 4.0
        elif percentage >= 30:
            return 3.0
        elif percentage >= 20:
            return 2.0
        else:
            return 1.0