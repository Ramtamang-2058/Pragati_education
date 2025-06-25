"use client";
import { useState, useEffect } from "react";
import { ResourceTab, resourcesMap } from "./ResourceComponent";
import Question from "./Question";

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

// Track status and score per question type and question number
type StatusMap = Record<
  string, // questionType
  Record<number, { status: QuestionStatus; score?: number }>
>;

export const QuestionList = ({
  questionType,
  level,
  onStartTest,
  onContinueTest,
  onViewResults,
  onQuestionClick,
}: QuestionListProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [mcqQuestions, setMcqQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Track status/score for each question type and question number
  const [questionStatus, setQuestionStatus] = useState<StatusMap>({});

  // Load MCQ questions from JSON when needed
  useEffect(() => {
    if (questionType === "Multiple Choice Questions") {
      setLoading(true);
      import("./Questions/Multiple_Choice.json")
        .then((mod) => {
          // mod.default is the JSON object
          const questions = mod.default?.[level] || [];
          setMcqQuestions(questions);
        })
        .finally(() => setLoading(false));
    }
  }, [questionType, level]);

  // Build questions array as before, but use per-type status/score
  const questions: (Question & {
    question_number: number;
    passage: string;
    question_stem: string;
    options: { letter: string; text: string; is_correct?: boolean }[];
    explanation: string;
  })[] =
    questionType === "Multiple Choice Questions"
      ? mcqQuestions.map((q, idx) => {
          const qNum = q.question_number ?? idx + 1;
          const statusObj = questionStatus[questionType]?.[qNum] || {
            status: "notStarted",
          };
          return {
            id: qNum,
            status: statusObj.status,
            score: statusObj.score,
            question_number: qNum,
            passage: q.passage,
            question_stem: q.question_stem,
            options: q.options,
            explanation: q.explanation,
          };
        })
      : Array.from({ length: 30 }, (_, i) => {
          const qNum = i + 1;
          const statusObj = questionStatus[questionType]?.[qNum] || {
            status: "notStarted",
          };
          return {
            id: qNum,
            status: statusObj.status,
            score: statusObj.score,
            question_number: qNum,
            passage: `Sample passage for question ${qNum}`,
            question_stem: `What is the answer to question ${qNum}?`,
            options: [
              { letter: "A", text: "Option A" },
              { letter: "B", text: "Option B" },
              { letter: "C", text: "Option C" },
              { letter: "D", text: "Option D" },
            ],
            explanation: `Explanation for question ${qNum}.`,
          };
        });

  // When a question is opened, mark as inProgress if not completed
  useEffect(() => {
    if (selectedQuestion !== null) {
      setQuestionStatus((prev) => {
        const prevType = prev[questionType] || {};
        const current = prevType[selectedQuestion];
        if (current?.status === "completed") return prev;
        return {
          ...prev,
          [questionType]: {
            ...prevType,
            [selectedQuestion]: { ...current, status: "inProgress" },
          },
        };
      });
    }
  }, [selectedQuestion, questionType]);

  // Handler for correct answer submission
  const handleQuestionCompleted = (question_number: number, score?: number) => {
    setQuestionStatus((prev) => {
      const prevType = prev[questionType] || {};
      return {
        ...prev,
        [questionType]: {
          ...prevType,
          [question_number]: { status: "completed", score },
        },
      };
    });
  };

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

  if (selectedQuestion !== null) {
    const q = questions[selectedQuestion - 1];
    const options =
      q.options?.map((opt: any) => ({
        letter: opt.letter,
        text: opt.text,
        is_correct: opt.is_correct ?? false,
      })) || [];
    return (
      <div>
        <button
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setSelectedQuestion(null)}
        >
          ← Back to List
        </button>
        <Question
          question_number={q.question_number}
          passage={q.passage}
          question_stem={q.question_stem}
          options={options}
          explanation={q.explanation}
          onCorrectAnswer={() => handleQuestionCompleted(q.question_number)}
        />
        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            onClick={() => setSelectedQuestion(selectedQuestion - 1)}
            disabled={selectedQuestion <= 1}
          >
            ← Previous Question
          </button>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            onClick={() => setSelectedQuestion(selectedQuestion + 1)}
            disabled={selectedQuestion >= questions.length}
          >
            Next Question →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Show resources only in the question list/grid view */}
      {resourcesMap[questionType] && (
        <ResourceTab
          videoUrl={resourcesMap[questionType].videoUrl}
          downloadUrl={resourcesMap[questionType].downloadUrl}
        />
      )}
      {loading && questionType === "Multiple Choice Questions" ? (
        <div className="text-center py-8 text-gray-500">Loading questions...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {questions.map((question) => (
            <div
              key={question.id}
              className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer transition-all duration-200 ${getStatusStyle(
                question.status
              )}`}
              onClick={() => setSelectedQuestion(question.id)}
            >
              <div className="text-lg font-semibold">{question.id}</div>
              {question.status === "completed" && question.score !== undefined && (
                <span className="text-xs font-medium">{question.score}%</span>
              )}
              {getActionButton(question.status, question.id)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionList;