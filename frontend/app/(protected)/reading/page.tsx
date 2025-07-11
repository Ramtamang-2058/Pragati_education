// app/(protected)/reading/page.tsx
"use client";
import React, { useState } from "react";
import { Navigation } from "./components/Navigation";
import { QuestionList } from "./components/QuestionList";
import { StatusLegend } from "./components/StatusLegend";

const Page = () => {
  const [currentLevel, setCurrentLevel] = useState<"easy" | "medium" | "hard">("medium");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleQuestionTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  const handleLevelSele`ct = (level: "easy" | "medium" | "hard") => {
    setCurrentLevel(level);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navigation
        onSelect={handleQuestionTypeSelect}
        onSelectLevel={handleLevelSelect}
        currentLevel={currentLevel}
        currentType={selectedType}
      />
      <main className="ml-72 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            {selectedType ? (
              <>
                <div className="mb-8 border-b pb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedType}</h2>
                  <p className="text-gray-600 capitalize flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Level: {currentLevel}
                  </p>
                </div>
                <StatusLegend />
                <QuestionList questionType={selectedType} level={currentLevel} />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Select a question type and difficulty level from the sidebar to begin practice
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