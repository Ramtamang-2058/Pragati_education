"use client";
import { LevelSelector } from "./LevelSelector";

const questionTypes = [
	"Multiple Choice Questions",
	"Identifying Information",
	"Identifying Writer's Views",
	"Matching Headings",
	"Matching Information",
	"Matching Features",
	"Matching Sentence Endings",
	"Sentence Completion",
	"Summary Completion",
	"Note/Table/Flowchart Completion",
	"Diagram Label Completion",
	"Short-Answer Questions",
	"Random",
	"Test",
];

interface NavigationProps {
	onSelect: (type: string) => void;
	onSelectLevel: (level: "easy" | "medium" | "hard") => void;
	currentLevel: "easy" | "medium" | "hard";
}

export const Navigation = ({ onSelect, onSelectLevel, currentLevel }: NavigationProps) => {
	return (
		<div className="w-72 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 p-6 shadow-lg">
			<h2 className="text-2xl font-bold mb-6 text-gray-800">Reading Practice</h2>
			<LevelSelector onSelectLevel={onSelectLevel} currentLevel={currentLevel} />
			<div className="flex flex-col gap-2 mt-6">
				<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Question Types</h3>
				{questionTypes.map((type) => (
					<button
						key={type}
						onClick={() => onSelect(type)}
						className="text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 
              hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
					>
						{type}
					</button>
				))}
			</div>
		</div>
	);
};