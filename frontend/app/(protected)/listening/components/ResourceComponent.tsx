import React from "react";

// Map listening types to resources (update as needed)
export const listeningResourcesMap: Record<
  string,
  { videoUrl: string; downloadUrl: string }
> = {
  "Multiple Choice": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_1",
    downloadUrl: "/downloads/listening-multiple-choice.pdf",
  },
  "Matching": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_2",
    downloadUrl: "/downloads/listening-matching.pdf",
  },
  "Plan / Map / Diagram Labelling": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_3",
    downloadUrl: "/downloads/listening-plan-map-diagram.pdf",
  },
  "Form / Note / Table / Flow-Chart": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_4",
    downloadUrl: "/downloads/listening-form-note-table-flowchart.pdf",
  },
  "Sentence Completion": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_5",
    downloadUrl: "/downloads/listening-sentence-completion.pdf",
  },
  "Short-Answer Questions": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_6",
    downloadUrl: "/downloads/listening-short-answer.pdf",
  },
  "Diagram Labelling (no options)": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_7",
    downloadUrl: "/downloads/listening-diagram-labelling.pdf",
  },
  "Flow-Chart Completion": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_8",
    downloadUrl: "/downloads/listening-flow-chart-completion.pdf",
  },
  "Table Completion": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_9",
    downloadUrl: "/downloads/listening-table-completion.pdf",
  },
  "Summary Completion": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_10",
    downloadUrl: "/downloads/listening-summary-completion.pdf",
  },
  // Add more as needed
};

interface ListeningResourceTabProps {
  videoUrl?: string;
  downloadUrl?: string;
}

export const ListeningResourceTab: React.FC<ListeningResourceTabProps> = ({
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
