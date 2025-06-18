"use client";
import React, { useState } from "react";
import LevelSelector from "./components/LevelSelector";
import topics from "./Topics.json";
import introductionQuestions from "./IntroductionQuestions.json";
import monologueQuestions from "./MonologueQuestion.json";
import discussionQuestions from "./DiscussionQuestion.json";
import SpeakTest from "./components/speaktest";

type Level = "easy" | "medium" | "hard";

interface QuestionSet {
  topic: string;
  questions: string[];
}

interface DiscussionQuestionSet {
  topic: string;
  questions: { monologue_question: string; follow_up_questions: string[] }[];
  monologue_question_followups: { monologue_question: string; follow_up_questions: string[] }[];
}

const page = () => {
  const [currentLevel, setCurrentLevel] = useState<Level>("easy");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const levelKeyMap: Record<Level, keyof typeof topics> = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  };
  const levelTopics = topics[levelKeyMap[currentLevel]] || [];
  const findQuestions = <T extends { topic: string }>(arr: T[], topic: string | null): T | undefined =>
    arr.find((item) => item.topic === topic);

  const selectedIntro = findQuestions(introductionQuestions, selectedTopic);

  // Get the first introduction question for the selected topic
  const firstIntroQuestion = selectedIntro?.questions?.[0];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 py-12">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Part 1</h1>
        <div className="text-gray-500 mb-8">Introduction and Interview</div>
        <LevelSelector
          onSelectLevel={setCurrentLevel}
          currentLevel={currentLevel}
        />
        {!selectedTopic ? (
          <div>
            <h2 className="text-lg font-semibold capitalize mb-2">
              {currentLevel} Topics
            </h2>
            <ul className="list-disc ml-6 space-y-1">
              {levelTopics.map((topic) => (
                <li key={topic}>
                  <button
                    className={`text-left w-full ${
                      selectedTopic === topic
                        ? "font-bold text-red-600 underline"
                        : "text-gray-800 hover:text-red-500"
                    }`}
                    onClick={() => setSelectedTopic(topic)}
                  >
                    {topic}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <SpeakTest
            selectedTopic={selectedTopic}
            firstIntroQuestion={firstIntroQuestion}
            onBack={() => setSelectedTopic(null)}
          />
        )}
      </div>
    </div>
  );
};

export default page;