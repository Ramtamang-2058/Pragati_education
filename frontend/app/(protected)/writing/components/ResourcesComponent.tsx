import React from "react";

// Map writing types to resources (update as needed)
export const writingResourcesMap: Record<
  string,
  { videoUrl: string; downloadUrl: string }
> = {
  "Line Graphs": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_1",
    downloadUrl: "/downloads/line-graphs.pdf",
  },
  "Bar Charts": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_2",
    downloadUrl: "/downloads/bar-charts.pdf",
  },
  "Pie Charts": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_3",
    downloadUrl: "/downloads/pie-charts.pdf",
  },
  "Tables": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_4",
    downloadUrl: "/downloads/tables.pdf",
  },
  "Process Diagrams / Flowcharts": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_5",
    downloadUrl: "/downloads/process-diagrams.pdf",
  },
  "Maps or Plans (Before and After / Comparisons)": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_6",
    downloadUrl: "/downloads/maps-or-plans.pdf",
  },
  "Mixed/Combination Charts (e.g., bar + line, pie + table)": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_7",
    downloadUrl: "/downloads/mixed-combination-charts.pdf",
  },
  "Mechanism Diagrams": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_8",
    downloadUrl: "/downloads/mechanism-diagrams.pdf",
  },
  "Life/Natural Cycles": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_9",
    downloadUrl: "/downloads/life-natural-cycles.pdf",
  },
  "Production Processes": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_10",
    downloadUrl: "/downloads/production-processes.pdf",
  },
  "Device/Structure Comparisons": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_11",
    downloadUrl: "/downloads/device-structure-comparisons.pdf",
  },
  "Opinion (Agree/Disagree)": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_12",
    downloadUrl: "/downloads/opinion.pdf",
  },
  "Discussion + Opinion": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_13",
    downloadUrl: "/downloads/discussion-opinion.pdf",
  },
  "Problem/Cause + Solution": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_14",
    downloadUrl: "/downloads/problem-cause-solution.pdf",
  },
  "Advantages & Disadvantages": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_15",
    downloadUrl: "/downloads/advantages-disadvantages.pdf",
  },
  "Two-Part/Double Questions": {
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_16",
    downloadUrl: "/downloads/two-part-double-questions.pdf",
  },
  // Add more as needed
};

interface WritingResourceTabProps {
  videoUrl?: string;
  downloadUrl?: string;
}

export const WritingResourceTab: React.FC<WritingResourceTabProps> = ({
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
