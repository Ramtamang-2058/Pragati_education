// app/(protected)/reading/question/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";

interface Option {
  letter: string;
  text: string;
  is_correct: boolean;
}

interface QuestionData {
  id: number;
  passage: string;
  question_stem: string;
  options: Option[];
  explanation: string;
  status: "completed" | "inProgress" | "notStarted";
  score?: number;
}

const QuestionPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:8000/api/questions/${id}/`);
        setQuestionData(response.data);
        if (response.data.status === "inProgress" || response.data.status === "completed") {
          // Optionally load previously selected options from backend
        }
      } catch (err) {
        setError("Failed to load question. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  const handleOptionClick = (letter: string) => {
    setSelectedOptions((prev) =>
      prev.includes(letter) ? prev.filter((l) => l !== letter) : [...prev, letter]
    );
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0) {
      alert("Please select at least one option.");
      return;
    }
    try {
      setSubmitStatus("submitting");
      const response = await axios.post(`http://localhost:8000/api/questions/${id}/submit/`, {
        selected_options: selectedOptions,
      });
      setQuestionData((prev) => prev ? { ...prev, score: response.data.score, status: "completed" } : prev);
      setSubmitStatus("success");
      alert(`Score: ${response.data.score}%`);
    } catch (err) {
      setSubmitStatus("error");
      alert("Failed to submit answer. Please try again.");
    }
  };

  const handleNextQuestion = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/questions/', {
        params: { level: questionData?.level, question_type: questionData?.question_type },
      });
      const questions = response.data;
      const currentIndex = questions.findIndex((q: QuestionData) => q.id === parseInt(id as string));
      if (currentIndex < questions.length - 1) {
        router.push(`/reading/question/${questions[currentIndex + 1].id}`);
      } else {
        router.push('/reading');
      }
    } catch (err) {
      alert("Failed to load next question.");
    }
  };

  if (loading) return <div className="text-center py-8">Loading question...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!questionData) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Question {questionData.id}</h2>
          <button
            onClick={() => router.push('/reading')}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Back to Questions
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-800 whitespace-pre-wrap">{questionData.passage}</p>
        </div>

        <div className="mb-6">
          <p className="font-semibold mb-4">{questionData.question_stem}</p>
          <div className="space-y-3">
            {questionData.options.map((option) => (
              <div
                key={option.letter}
                onClick={() => handleOptionClick(option.letter)}
                className={`p-3 rounded-lg cursor-pointer border-2 transition-colors
                  ${selectedOptions.includes(option.letter)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                  }`}
              >
                <span className="font-medium mr-2">{option.letter}.</span>
                {option.text}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showExplanation ? "Hide" : "Show"} Explanation
          </button>
          <div className="space-x-4">
            {questionData.status !== "completed" && (
              <button
                onClick={handleSubmit}
                disabled={submitStatus === "submitting"}
                className={`px-6 py-2 rounded-lg text-white
                  ${submitStatus === "submitting" ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {submitStatus === "submitting" ? "Submitting..." : "Submit"}
              </button>
            )}
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700"
            >
              Next Question
            </button>
          </div>
        </div>

        {showExplanation && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-800">{questionData.explanation}</p>
          </div>
        )}

        {questionData.status === "completed" && questionData.score !== undefined && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 font-semibold">Your Score: {questionData.score}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPage;