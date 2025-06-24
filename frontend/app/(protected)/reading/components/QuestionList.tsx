"use client";
import { ResourceTab, resourcesMap } from "./ResourceComponent";

type QuestionStatus = "completed" | "inProgress" | "notStarted";

interface Question {
  id: number;
  status: QuestionStatus;
  score?: number;
}

interface QuestionListProps {
  questionType: string;
  level: "easy" | "medium" | "hard";
  onStartTest?: (questionId: number) => void;
  onContinueTest?: (questionId: number) => void;
  onViewResults?: (questionId: number) => void;
  onQuestionClick?: (questionId: number) => void;
}

export const QuestionList = ({ 
  questionType, 
  level,
  onStartTest,
  onContinueTest,
  onViewResults,
  onQuestionClick 
}: QuestionListProps) => {
  // Mock data - replace with real data from your backend
  const questions: Question[] = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    status: Math.random() < 0.3 
      ? "completed" 
      : Math.random() < 0.5 
        ? "inProgress" 
        : "notStarted",
    score: Math.random() < 0.3 ? Math.floor(Math.random() * 100) : undefined,
  }));

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

  const getActionButton = (status: QuestionStatus, questionId: number) => {
    switch (status) {
      case "completed":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewResults?.(questionId);
            }}
            className="mt-1 text-[10px] font-medium text-red-600 hover:text-red-700"
          >
            View Results
          </button>
        );
      case "inProgress":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContinueTest?.(questionId);
            }}
            className="mt-1 text-[10px] font-medium text-yellow-600 hover:text-yellow-700"
          >
            Continue Test
          </button>
        );
      default:
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartTest?.(questionId);
            }}
            className="mt-1 text-[10px] font-medium text-gray-500 hover:text-gray-700"
          >
            Start Test
          </button>
        );
    }
  };

  const resource = resourcesMap[questionType];

  return (
    <div>
      {/* Resources tab above the question grid */}
      {resource && (
        <ResourceTab videoUrl={resource.videoUrl} downloadUrl={resource.downloadUrl} />
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {questions.map((question) => (
          <div
            key={question.id}
            onClick={() => onQuestionClick?.(question.id)}
            className={`w-24 h-24 border-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer
              ${getStatusStyle(question.status)}
              ${question.status !== "notStarted" 
                ? "hover:scale-110 hover:shadow-xl transform duration-200" 
                : "opacity-60"
              }
            `}
          >
            <span className="text-xl mb-1">{getStatusIcon(question.status)}</span>
            <div className="text-lg font-semibold">
              {question.id}
            </div>
            {question.status === "completed" && question.score !== undefined && (
              <span className="text-xs font-medium">{question.score}%</span>
            )}
            {getActionButton(question.status, question.id)}
          </div>
        ))}
      </div>
    </div>
  );
};
