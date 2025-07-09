// app/(protected)/reading/results/page.tsx
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  question_type: string;
  level: string;
  status: "completed" | "inProgress" | "notStarted";
  score?: number;
}

const ResultsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:8000/api/questions/', {
          params: { status: "completed" },
        });
        setQuestions(response.data);
      } catch (err) {
        setError("Failed to load results. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <div className="text-center py-8">Loading results...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Results</h2>
          <button
            onClick={() => router.push('/reading')}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Back to Practice
          </button>
        </div>
        {questions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No completed questions yet. Start practicing!</p>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="p-4 border border-gray-200 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">Question {question.id}: {question.question_type}</p>
                  <p className="text-sm text-gray-600">Level: {question.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">Score: {question.score}%</p>
                  <button
                    onClick={() => router.push(`/reading/question/${question.id}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;