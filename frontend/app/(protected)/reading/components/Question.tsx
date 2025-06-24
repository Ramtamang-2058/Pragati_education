import React, { useState } from 'react';

interface Option {
  letter: string;
  text: string;
  is_correct: boolean;
}

interface QuestionProps {
  question_number: number;
  passage: string;
  question_stem: string;
  options: Option[];
  explanation: string;
  videoUrl?: string;
  downloadUrl?: string;
}

const Question = ({ 
  question_number,
  passage,
  question_stem,
  options,
  explanation,
  videoUrl,
  downloadUrl
}: QuestionProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleOptionClick = (letter: string) => {
    setSelectedOptions(prev => 
      prev.includes(letter)
        ? prev.filter(l => l !== letter)
        : [...prev, letter]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Question {question_number}</h2>
        
        {/* Resources section */}
        {(videoUrl || downloadUrl) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Resources</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {videoUrl && (
                <div className="w-full md:w-2/3">
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-2">
                    <iframe
                      width="100%"
                      height="315"
                      src={videoUrl}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
              {downloadUrl && (
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                  <a
                    href={downloadUrl}
                    download
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                  >
                    Download Printable Materials
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-800">{passage}</p>
        </div>

        <div className="mb-6">
          <p className="font-semibold mb-4">{question_stem}</p>
          
          <div className="space-y-3">
            {options.map((option) => (
              <div
                key={option.letter}
                onClick={() => handleOptionClick(option.letter)}
                className={`p-3 rounded-lg cursor-pointer border-2 transition-colors
                  ${selectedOptions.includes(option.letter)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                  }`}
              >
                <span className="font-medium mr-2">{option.letter}.</span>
                {option.text}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showExplanation ? 'Hide' : 'Show'} Explanation
          </button>
          
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Submit
          </button>
        </div>

        {showExplanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-800">{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Question;