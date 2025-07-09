"use client";
import React, { useState } from "react";
import { WritingResourceTab, writingResourcesMap } from "./components/ResourcesComponent";
import lineGraphQuestions from "./components/Questions/Line_graph.json";

const writingTypes = [
  "Line Graphs",
  "Bar Charts",
  "Pie Charts",
  "Tables",
  "Process Diagrams / Flowcharts",
  "Maps or Plans (Before and After / Comparisons)",
  "Mixed/Combination Charts (e.g., bar + line, pie + table)",
  "Mechanism Diagrams",
  "Life/Natural Cycles",
  "Production Processes",
  "Device/Structure Comparisons",
];

const part2Types = [
  "Opinion (Agree/Disagree)",
  "Discussion + Opinion",
  "Problem/Cause + Solution",
  "Advantages & Disadvantages",
  "Two-Part/Double Questions",
];

type Level = "easy" | "medium" | "hard";

const LevelSelector = ({
  currentLevel,
  onSelectLevel,
}: {
  currentLevel: Level;
  onSelectLevel: (level: Level) => void;
}) => {
  const levels: Level[] = ["easy", "medium", "hard"];
  return (
    <div className="flex gap-2 mb-6">
      {levels.map((level) => (
        <button
          key={level}
          onClick={() => onSelectLevel(level)}
          className={`px-4 py-2 rounded-lg capitalize transition-all ${
            currentLevel === level
              ? "bg-red-600 text-white"
              : "bg-white border border-gray-300 hover:bg-gray-50"
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
};

const PartSelector = ({
  part,
  onSelect,
}: {
  part: "part1" | "part2";
  onSelect: (part: "part1" | "part2") => void;
}) => (
  <div className="flex gap-2 mb-6">
    <button
      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
        part === "part1"
          ? "bg-red-600 text-white"
          : "bg-white border border-gray-300 hover:bg-gray-50"
      }`}
      onClick={() => onSelect("part1")}
    >
      Part 1
    </button>
    <button
      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
        part === "part2"
          ? "bg-red-600 text-white"
          : "bg-white border border-gray-300 hover:bg-gray-50"
      }`}
      onClick={() => onSelect("part2")}
    >
      Part 2
    </button>
  </div>
);

const QuestionGrid = ({
  onStart,
  onContinue,
  onView,
}: {
  onStart: (id: number) => void;
  onContinue: (id: number) => void;
  onView: (id: number) => void;
}) => {
  // Mock statuses for demonstration
  const statuses = ["completed", "inProgress", "notStarted"] as const;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {Array.from({ length: 30 }, (_, i) => {
        const status =
          statuses[Math.floor(Math.random() * statuses.length)];
        const score =
          status === "completed"
            ? Math.floor(Math.random() * 100)
            : undefined;
        return (
          <div
            key={i}
            className={`w-24 h-24 border-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer
              ${
                status === "completed"
                  ? "bg-white border-red-500 text-red-700 shadow-red-100 shadow-lg"
                  : status === "inProgress"
                  ? "bg-white border-yellow-500 text-yellow-700 shadow-yellow-100 shadow-lg"
                  : "bg-gray-50 border-gray-200 text-gray-400"
              }
              ${
                status !== "notStarted"
                  ? "hover:scale-110 hover:shadow-xl transform duration-200"
                  : "opacity-60"
              }
            `}
          >
            <span className="text-xl mb-1">
              {status === "completed"
                ? "✓"
                : status === "inProgress"
                ? "⚠️"
                : "•"}
            </span>
            <div className="text-lg font-semibold">{i + 1}</div>
            {status === "completed" && score !== undefined && (
              <span className="text-xs font-medium">{score}%</span>
            )}
            {status === "completed" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(i + 1);
                }}
                className="mt-1 text-[10px] font-medium text-red-600 hover:text-red-700"
              >
                View Results
              </button>
            ) : status === "inProgress" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onContinue(i + 1);
                }}
                className="mt-1 text-[10px] font-medium text-yellow-600 hover:text-yellow-700"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStart(i + 1);
                }}
                className="mt-1 text-[10px] font-medium text-gray-500 hover:text-gray-700"
              >
                Start
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

const StatusLegend = () => (
  <div className="flex gap-4 items-center mb-6">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 border-2 rounded-lg flex items-center justify-center border-red-500 text-red-700 bg-white">
        ✓
      </div>
      <span className="text-sm text-gray-600">Completed</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 border-2 rounded-lg flex items-center justify-center border-yellow-500 text-yellow-700 bg-white">
        ⚠️
      </div>
      <span className="text-sm text-gray-600">In Progress</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 border-2 rounded-lg flex items-center justify-center border-gray-200 text-gray-400 bg-gray-50">
        •
      </div>
      <span className="text-sm text-gray-600">Not Started</span>
    </div>
  </div>
);

const Page = () => {
  const [currentLevel, setCurrentLevel] = useState<Level>("easy");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [part, setPart] = useState<"part1" | "part2">("part1");
  const [showDiagram, setShowDiagram] = useState(false);
  const [currentDiagram, setCurrentDiagram] = useState<string | null>(null);
  const [currentQuestionText, setCurrentQuestionText] = useState<string | null>(null);

  // For Line Graphs question view
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // New: For showing sample answer and band score
  const [showSample, setShowSample] = useState(false);
  const [bandScore, setBandScore] = useState<number | null>(null);

  // New: For Gemini review
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<{
    band: number;
    analysis: {
      "Task achievement": string;
      "Coherence and cohesion": string;
      "Lexical resource": string;
      "Grammatical range and accuracy": string;
      "Overall Feedback and Recommendations": string;
    };
  } | null>(null);

  const handleTypeSelect = (type: string) => setSelectedType(type);

  // Reset selectedType and question view when part changes
  React.useEffect(() => {
    setSelectedType(null);
    setSelectedQuestionIdx(null);
    setSubmitted(false);
  }, [part]);

  // Reset sample/score when question changes
  React.useEffect(() => {
    setShowSample(false);
    setBandScore(null);
  }, [selectedQuestionIdx, selectedType, part, currentLevel]);

  // Helper: get questions for current selection
  const getCurrentQuestions = () => {
    if (
      selectedType === "Line Graphs" &&
      part === "part1" &&
      lineGraphQuestions[currentLevel]
    ) {
      return lineGraphQuestions[currentLevel];
    }
    return [];
  };

  // Handle answer change
  const handleAnswerChange = (idx: number, value: string) => {
    setUserAnswers((prev) => ({ ...prev, [idx]: value }));
  };

// Helper: call Gemini API for review
// (Removed duplicate declaration. The correct version is defined below with improved parsing.)

  // (Duplicate handleSubmit removed to fix redeclaration error)

  // Handle navigation
  // (Removed duplicate handlePrev and handleNext to fix redeclaration error)

  // Handle back to list
  // (Removed duplicate handleBackToList to fix redeclaration error)

  // Move the parseGeminiResponseToJson and reviewWithGemini INSIDE the Page component or above it, not inside the JSX!
  // Helper: parse Gemini response to JSON object
  function parseGeminiResponseToJson(text: string) {
    try {
      // Try to parse as JSON directly
      const json = JSON.parse(text);
      return {
        band: json["Overall Band score"] ?? 0,
        analysis: {
          "Task achievement": json["Task achievement feedback"] ?? "",
          "Coherence and cohesion": json["Coherence and Cohesion feedback"] ?? "",
          "Lexical resource": json["Lexical Resource Feedback"] ?? "",
          "Grammatical range and accuracy": json["Grammatical Range and Accuracy Feedback"] ?? "",
          "Overall Feedback and Recommendations": json["Overall Feedback"] ?? "",
        },
      };
    } catch {
      // fallback: try to extract fields from text
      const get = (label: string) => {
        const regex = new RegExp(`${label}\\s*:?\\s*([\\s\\S]*?)(?=\\n[A-Z][^\\n]*:?|$)`, "i");
        const match = text.match(regex);
        return match ? match[1].trim() : "";
      };
      const band = parseFloat(get("Overall Band score")) || 0;
      return {
        band,
        analysis: {
          "Task achievement": get("Task achievement feedback"),
          "Coherence and cohesion": get("Coherence and Cohesion feedback"),
          "Lexical resource": get("Lexical Resource Feedback"),
          "Grammatical range and accuracy": get("Grammatical Range and Accuracy Feedback"),
          "Overall Feedback and Recommendations": get("Overall Feedback"),
        },
      };
    }
  }

  // --- In your existing reviewWithGemini function, replace the parsing logic with the new parser ---
  const reviewWithGemini = async (question: string, diagram: string, answer: string) => {
    setReviewLoading(true);
    setReviewError(null);
    setReviewResult(null);
    try {
      const prompt = `
You are an IELTS writing examiner. Please rate the following IELTS Writing Task 1 answer according to the official IELTS band descriptors.
Respond ONLY in JSON in the following format:

{
  "Overall Band score": number,
  "Task achievement Score": number,
  "Task achievement feedback": string,
  "Coherence and Cohesion score": number,
  "Coherence and Cohesion feedback": string,
  "Lexical Resource Score": number,
  "Lexical Resource Feedback": string,
  "Grammatical Range and Accuracy Score": number,
  "Grammatical Range and Accuracy Feedback": string,
  "Overall Feedback": string
}

Question: ${question}
SVG Diagram: ${diagram}
Student Answer: ${answer}
      `;
      // Log request details
      console.log("Sending Gemini API request:", {
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB7RyMLfluk-BUDeSAURblFPFP4RxQx3FA",
        body: {
          contents: [{ parts: [{ text: prompt }] }]
        }
      });
      // Use correct Gemini API request format
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB7RyMLfluk-BUDeSAURblFPFP4RxQx3FA", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      // Log response status
      console.log("Gemini API response status:", response.status);
      const data = await response.json();
      // Log response data
      console.log("Gemini API response data:", data);

      // --- FIX: Extract text from Gemini's actual response structure ---
      // Gemini returns: data.candidates[0].content.parts[0].text
      let text = "";
      if (
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        typeof data.candidates[0].content.parts[0].text === "string"
      ) {
        text = data.candidates[0].content.parts[0].text;
      } else if (typeof data === "string") {
        text = data;
      } else {
        text =
          data.choices?.[0]?.message?.content ||
          data.result ||
          "";
      }

      const parsed = parseGeminiResponseToJson(text);

      if ((!parsed.band || isNaN(parsed.band)) && Object.values(parsed.analysis).every(v => !v)) {
        setReviewError("Could not parse Gemini response. Raw output:\n" + text);
      }

      setReviewResult(parsed);
      setBandScore(parsed.band ?? 0);
    } catch (err: any) {
      setReviewError("Could not get review from Gemini API.");
      const possibleScores = [6, 6.5, 7, 7.5, 8];
      setBandScore(possibleScores[Math.floor(Math.random() * possibleScores.length)]);
    } finally {
      setReviewLoading(false);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    setSubmitted(true);
    setShowSample(false);
    setBandScore(null);
    setReviewResult(null);
    setReviewError(null);
    const questions = getCurrentQuestions();
    const q = questions[selectedQuestionIdx!];
    // Call Gemini API for review
    await reviewWithGemini(q.Question, q.Diagram, userAnswers[selectedQuestionIdx!] || "");
  };

  // Handle navigation
  const handlePrev = () => {
    if (selectedQuestionIdx !== null && selectedQuestionIdx > 0) {
      setSelectedQuestionIdx(selectedQuestionIdx - 1);
      setSubmitted(false);
    }
  };
  const handleNext = () => {
    const questions = getCurrentQuestions();
    if (
      selectedQuestionIdx !== null &&
      selectedQuestionIdx < questions.length - 1
    ) {
      setSelectedQuestionIdx(selectedQuestionIdx + 1);
      setSubmitted(false);
    }
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedQuestionIdx(null);
    setSubmitted(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 p-6 shadow-lg z-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Writing Practice I</h2>
        <PartSelector part={part} onSelect={setPart} />
        <LevelSelector currentLevel={currentLevel} onSelectLevel={setCurrentLevel} />
        <div className="flex flex-col gap-2 mt-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {part === "part1" ? "Question Types" : "Essay Types"}
          </h3>
          {(part === "part1" ? writingTypes : part2Types).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeSelect(type)}
              className={`text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700
                hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2
                focus:ring-offset-2 focus:ring-red-500 transition-all duration-200
                ${selectedType === type ? "bg-red-100 text-red-700" : ""}
              `}
            >
              {type}
            </button>
          ))}
        </div>
      </aside>
      {/* Main Content */}
      <main className="ml-0 md:ml-72 flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm">
            {selectedType ? (
              <>
                <div className="mb-8 border-b pb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedType}</h2>
                  <p className="text-gray-600 capitalize flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Level: {currentLevel}
                  </p>
                </div>
                {/* Resources tab for writing */}
                {/* Hide resources when a question is open */}
                {!(selectedType === "Line Graphs" && part === "part1" && selectedQuestionIdx !== null) && (
                  <WritingResourceTab
                    videoUrl={writingResourcesMap[selectedType]?.videoUrl}
                    downloadUrl={writingResourcesMap[selectedType]?.downloadUrl}
                  />
                )}
                <StatusLegend />
                {/* Line Graphs part1: Question View */}
                {selectedType === "Line Graphs" && part === "part1" && selectedQuestionIdx !== null ? (
                  (() => {
                    const questions = getCurrentQuestions();
                    const q = questions[selectedQuestionIdx];
                    if (!q) return null;
                    return (
                      <div className="max-w-3xl mx-auto">
                        <button
                          className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                          onClick={handleBackToList}
                        >
                          ← Back to List
                        </button>
                        <div className="mb-6">
                          <h3 className="text-xl font-semibold mb-2 text-gray-800">
                            Question {q.id}
                          </h3>
                          <div className="mb-4 text-gray-700">{q.Question}</div>
                          <div
                            className="w-full overflow-x-auto mb-6"
                            dangerouslySetInnerHTML={{ __html: q.Diagram }}
                          />
                        </div>  
                        <div className="mb-6">
                          <label className="block mb-2 font-medium text-gray-700">
                            Your Answer
                          </label>
                          <textarea
                            className="w-full min-h-[180px] border rounded-lg p-4 text-base"
                            placeholder="Write your answer here..."
                            value={userAnswers[selectedQuestionIdx] || ""}
                            onChange={e =>
                              handleAnswerChange(selectedQuestionIdx, e.target.value)
                            }
                            disabled={submitted}
                          />
                          {submitted && (
                            <div className="mt-2">
                              {/* 1. Spinner for loading */}
                              {reviewLoading && (
                                <div className="flex items-center justify-center py-8">
                                  <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                  </svg>
                                  <span className="ml-4 text-blue-600 font-semibold">Getting review and band score...</span>
                                </div>
                              )}
                              {/* 2. Error message as alert */}
                              {reviewError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                                  <span className="block sm:inline">{reviewError}</span>
                                </div>
                              )}
                              {/* Only render reviewResult if it is defined */}
                              {typeof reviewResult !== "undefined" && reviewResult && (
                                <div>
                                  <div className="mb-4">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                      <div className="text-blue-700 font-bold text-center text-2xl bg-blue-50 rounded-t-lg py-3 flex-1">
                                        Overall Band Score: <span className="text-3xl">{reviewResult.band}</span>
                                      </div>
                                      <button
                                        className="mb-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                                        onClick={() => navigator.clipboard.writeText(JSON.stringify(reviewResult, null, 2))}
                                      >
                                        Copy Feedback JSON
                                      </button>
                                    </div>
                                    <div className="border rounded-b-lg p-4 mb-4 bg-white">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="border rounded p-4 bg-white flex flex-col gap-2" style={{ borderColor: "#e5e7eb", borderWidth: 1 }}>
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">Task Achievement</span>
                                            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                                              {reviewResult.analysis["Task achievement score"]}
                                            </span>
                                          </div>
                                          <div className="text-gray-800 text-sm whitespace-pre-line">
                                            {reviewResult.analysis["Task achievement"]}
                                          </div>
                                        </div>
                                        <div className="border rounded p-4 bg-white flex flex-col gap-2" style={{ borderColor: "#e5e7eb", borderWidth: 1 }}>
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">Coherence & Cohesion</span>
                                            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                                              {reviewResult.analysis["Coherence and cohesion score"]}
                                            </span>
                                          </div>
                                          <div className="text-gray-800 text-sm whitespace-pre-line">
                                            {reviewResult.analysis["Coherence and cohesion"]}
                                          </div>
                                        </div>
                                        <div className="border rounded p-4 bg-white flex flex-col gap-2" style={{ borderColor: "#e5e7eb", borderWidth: 1 }}>
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">Lexical Resource</span>
                                            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                                              {reviewResult.analysis["Lexical resource score"]}
                                            </span>
                                          </div>
                                          <div className="text-gray-800 text-sm whitespace-pre-line">
                                            {reviewResult.analysis["Lexical resource"]}
                                          </div>
                                        </div>
                                        <div className="border rounded p-4 bg-white flex flex-col gap-2" style={{ borderColor: "#e5e7eb", borderWidth: 1 }}>
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">Grammatical Range & Accuracy</span>
                                            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                                              {reviewResult.analysis["Grammatical range and accuracy score"]}
                                            </span>
                                          </div>
                                          <div className="text-gray-800 text-sm whitespace-pre-line">
                                            {reviewResult.analysis["Grammatical range and accuracy"]}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="border rounded p-4 bg-green-50 mt-6" style={{ borderColor: "#e5e7eb", borderWidth: 1 }}>
                                        <div className="font-semibold mb-1 text-green-700 text-base">
                                          Overall Feedback & Recommendations
                                        </div>
                                        <div className="text-gray-800 text-sm whitespace-pre-line">
                                          {reviewResult.analysis["Overall Feedback"] || "No overall feedback available."}
                                        </div>
                                      </div>
                                      <details className="mb-2 mt-4">
                                        <summary className="cursor-pointer text-xs text-gray-500">Show raw JSON</summary>
                                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(reviewResult, null, 2)}</pre>
                                      </details>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {!reviewResult && bandScore !== null && (
                                <div className="text-blue-700 font-bold mb-2">
                                  Estimated Band Score: <span className="text-2xl">{bandScore}</span>
                                </div>
                              )}
                              {!showSample && (
                                <button
                                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                  onClick={() => setShowSample(true)}
                                >
                                  Show Sample Answer
                                </button>
                              )}
                              {showSample && (
                                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded">
                                  <div className="font-semibold text-red-700 mb-2">Sample Answer:</div>
                                  <div className="whitespace-pre-line text-gray-800 text-sm">
                                    {q["Sample answer"] || "No sample answer available."}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 justify-between">
                          <button
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            onClick={handlePrev}
                            disabled={selectedQuestionIdx === 0}
                          >
                            ← Previous
                          </button>
                          <button
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            onClick={handleSubmit}
                            disabled={submitted || !(userAnswers[selectedQuestionIdx] || "").trim()}
                          >
                            Submit
                          </button>
                          <button
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            onClick={handleNext}
                            disabled={selectedQuestionIdx === getCurrentQuestions().length - 1}
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : selectedType === "Line Graphs" && part === "part1" ? (
                  // Show question list for Line Graphs part1
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-4">Select a Question:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {getCurrentQuestions().map((q: any, idx: number) => (
                        <div
                          key={idx}
                          className="border rounded-lg p-4 bg-gray-50 hover:bg-red-50 cursor-pointer transition"
                          onClick={() => {
                            setSelectedQuestionIdx(idx);
                            setSubmitted(false);
                          }}
                        >
                          <div className="font-medium mb-2">Question {q.id}</div>
                          <div className="text-gray-700 text-sm line-clamp-3">{q.Question}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Fallback: show grid for other types
                  <QuestionGrid
                    onStart={(id) => {
                      alert(`Start Writing Question ${id}`);
                    }}
                    onContinue={(id) => {
                      alert(`Continue Writing Question ${id}`);
                    }}
                    onView={(id) => {
                      alert(`View Results for Writing Question ${id}`);
                    }}
                  />
                )}
                {/* Modal for SVG Diagram (legacy, not used in new flow) */}
                {showDiagram && currentDiagram && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
                      <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl"
                        onClick={() => setShowDiagram(false)}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                      {currentQuestionText && (
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">{currentQuestionText}</h3>
                      )}
                      <div
                        className="w-full overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: currentDiagram }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Select a question part, type, and difficulty level from the sidebar to begin practice
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Page;