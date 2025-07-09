import React, { useState, useEffect } from 'react';

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
  videoUrl?: string;
  downloadUrl?: string;
  onCorrectAnswer?: () => void;
}

const Question = ({ 
  question_number,
  passage,
  question_stem,
  options,
  explanation,
  videoUrl,
  downloadUrl,
  onCorrectAnswer
}: QuestionProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Reset input and feedback when question changes
  useEffect(() => {
    setInputValue('');
    setFeedback(null);
    setShowExplanation(false);
  }, [question_number]);

  const handleSubmit = () => {
    const answer = inputValue.trim().toLowerCase();
    const correctOption = options.find(opt => opt.is_correct);
    if (!correctOption) {
      setFeedback(null);
      return;
    }
    // Accept either letter or text as correct answer
    if (
      answer === correctOption.letter.trim().toLowerCase() ||
      answer === correctOption.text.trim().toLowerCase()
    ) {
      setFeedback("Correct answer!");
      if (onCorrectAnswer) onCorrectAnswer();
    } else {
      setFeedback("Incorrect answer.");
    }
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Question {question_number}</h2>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-800 whitespace-pre-wrap">{questionData.passage}</p>
        </div>

        <div className="mb-6">
          <p className="font-semibold mb-4">{question_stem}</p>
          
          {/* Show options as non-selectable */}
          <div className="space-y-3 mb-4">
            {options.map((option) => (
              <div
                key={option.letter}
                className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50 flex items-center"
              >
                <span className="font-medium mr-2">{option.letter}.</span>
                {option.text}
              </div>
            ))}
          </div>

          {/* Input for user answer */}
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg mb-2"
            placeholder="Type your answer here..."
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              setFeedback(null);
            }}
          />
          {feedback && (
            <div className={`mb-2 font-semibold ${feedback === "Correct answer!" ? "text-green-600" : "text-red-600"}`}>
              {feedback}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showExplanation ? 'Hide' : 'Show'} Explanation
          </button>
          
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Submit
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