// app/(protected)/reading/components/QuestionList.tsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type QuestionStatus = "completed" | "inProgress" | "notStarted";

interface Question {
  id: number;
  status: QuestionStatus;
  score?: number;
}

interface QuestionListProps {
  questionType: string;
  level: "easy" | "medium" | "hard";
}

export const QuestionList = ({ questionType, level }: QuestionListProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:8000/api/questions/', {
          params: { level, question_type: questionType },
        });
        setQuestions(response.data);
      } catch (err) {
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [level, questionType]);

  const getStatusStyle = (status: QuestionStatus) => {
    switch (status) {
      case "completed":
        return "bg-white border-red-500 text-red-700 shadow-red-100 shadow-lg";
      case "inProgress":
        return "bg-white border-yellow-500 text-yellow-700 shadow-yellow-100 shadow-lg";
      default:
        return "bg-gray-50 border-gray-200 text-gray-400";
    }
  };

  const getStatusIcon = (status: QuestionStatus) => {
    switch (status) {
      case "completed":
        return "✓";
      case "inProgress":
        return "⚠️";
      default:
        return "•";
    }
  };

  const handleQuestionClick = (questionId: number) => {
    router.push(`/reading/question/${questionId}`);
  };

  if (loading) return <div className="text-center py-8">Loading questions...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {questions.map((question) => (
        <div
          key={question.id}
          onClick={() => handleQuestionClick(question.id)}
          className={`w-24 h-24 border-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer
            ${getStatusStyle(question.status)}
            ${question.status !== "notStarted" ? "hover:scale-105 hover:shadow-xl" : "opacity-60"}
          `}
        >
          <span className="text-xl mb-1">{getStatusIcon(question.status)}</span>
          <div className="text-lg font-semibold">{question.id}</div>
          {question.status === "completed" && question.score !== undefined && (
            <span className="text-xs font-medium">{question.score}%</span>
          )}
        </div>
      ))}
    </div>
  );
};