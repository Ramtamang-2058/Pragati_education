import React from "react";

// Resource map for question types or question IDs
export const resourcesMap: Record<
  string,
  { videoUrl: string; downloadUrl: string }
> = {
  "Multiple Choice Questions": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_1",
    downloadUrl: "/downloads/multiple-choice.pdf",
  },
  "Identifying Information": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_2",
    downloadUrl: "/downloads/identifying-information.pdf",
  },
  "Identifying Writer's Views": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_3",
    downloadUrl: "/downloads/identifying-writers-views.pdf",
  },
  "Matching Headings": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_4",
    downloadUrl: "/downloads/matching-headings.pdf",
  },
  "Matching Information": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_5",
    downloadUrl: "/downloads/matching-information.pdf",
  },
  "Matching Features": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_6",
    downloadUrl: "/downloads/matching-features.pdf",
  },
  "Matching Sentence Endings": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_7",
    downloadUrl: "/downloads/matching-sentence-endings.pdf",
  },
  "Sentence Completion": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_8",
    downloadUrl: "/downloads/sentence-completion.pdf",
  },
  "Summary Completion": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_9",
    downloadUrl: "/downloads/summary-completion.pdf",
  },
  "Note/Table/Flowchart Completion": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_10",
    downloadUrl: "/downloads/note-table-flowchart-completion.pdf",
  },
  "Diagram Label Completion": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_11",
    downloadUrl: "/downloads/diagram-label-completion.pdf",
  },
  "Short-Answer Questions": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_12",
    downloadUrl: "/downloads/short-answer.pdf",
  }
// ,
//   "Random": {
//     videoUrl: "https://www.youtube.com/embed/VIDEO_ID_13",
//     downloadUrl: "/downloads/random.pdf",
//   },
//   "Test": {
//     videoUrl: "https://www.youtube.com/embed/VIDEO_ID_14",
//     downloadUrl: "/downloads/test.pdf",
//   },
  // Add more as needed
};

interface ResourceTabProps {
  videoUrl?: string;
  downloadUrl?: string;
}

export const ResourceTab: React.FC<ResourceTabProps> = ({
  videoUrl,
  downloadUrl,
}) => {
  if (!videoUrl && !downloadUrl) return null;
  return (
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
  );
};
