"use client";
import React, { useState } from "react";
import { ListeningResourceTab, listeningResourcesMap } from "./components/ResourceComponent";

const listeningTypes = [
  "Multiple Choice",
  "Matching",
  "Plan / Map / Diag  ram Labelling",
  "Form / Note / Table / Flow-Chart",
  "Sentence Completion",
  "Short-Answer Questions",
  "Diagram Labelling (no options)",
  "Flow-Chart Completion",
  "Table Completion",
  "Summary Completion",
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
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-300 hover:bg-gray-50"
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
};

const QuestionGrid = ({
  onStart,
  onContinue,
  onView,
}: {
  onStart: (id: number) => void;
  onContinue: (id: number) => void;
  onView: (id: number) => void;
}) => {
  const statuses = ["completed", "inProgress", "notStarted"] as const;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {Array.from({ length: 30 }, (_, i) => {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
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
                  ? "bg-white border-blue-500 text-blue-700 shadow-blue-100 shadow-lg"
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
                className="mt-1 text-[10px] font-medium text-blue-600 hover:text-blue-700"
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
      <div className="w-8 h-8 border-2 rounded-lg flex items-center justify-center border-blue-500 text-blue-700 bg-white">
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

  const handleTypeSelect = (type: string) => setSelectedType(type);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 p-6 shadow-lg z-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Listening Practice
        </h2>
        <LevelSelector
          currentLevel={currentLevel}
          onSelectLevel={setCurrentLevel}
        />
        <div className="flex flex-col gap-2 mt-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Question Types
          </h3>
          {listeningTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeSelect(type)}
              className={`text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700
                hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2
                focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200
                ${selectedType === type ? "bg-blue-100 text-blue-700" : ""}
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
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedType}
                  </h2>
                  <p className="text-gray-600 capitalize flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Level: {currentLevel}
                  </p>
                </div>
                {/* Resources tab for listening */}
                <ListeningResourceTab
                  videoUrl={listeningResourcesMap[selectedType]?.videoUrl}
                  downloadUrl={listeningResourcesMap[selectedType]?.downloadUrl}
                />
                <StatusLegend />
                <QuestionGrid
                  onStart={(id) => {
                    alert(`Start Listening Question ${id}`);
                  }}
                  onContinue={(id) => {
                    alert(`Continue Listening Question ${id}`);
                  }}
                  onView={(id) => {
                    alert(`View Results for Listening Question ${id}`);
                  }}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Select a question type and difficulty level from the sidebar to
                  begin practice
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