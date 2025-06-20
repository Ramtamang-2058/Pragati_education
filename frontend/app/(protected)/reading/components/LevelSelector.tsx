// app/(protected)/reading/components/LevelSelector.tsx
"use client";

type Level = "easy" | "medium" | "hard";

interface LevelSelectorProps {
  onSelectLevel: (level: Level) => void;
  currentLevel: Level;
}

export const LevelSelector = ({ onSelectLevel, currentLevel }: LevelSelectorProps) => {
  const levels: Level[] = ["easy", "medium", "hard"];
  
  return (
    <div className="flex gap-2 mb-6">
      {levels.map((level) => (
        <button
          key={level}
          onClick={() => onSelectLevel(level)}
          className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition-all
            ${currentLevel === level
              ? "bg-red-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
};