// app/(protected)/reading/components/StatusLegend.tsx
"use client";

export const StatusLegend = () => {
  const statuses = [
    { label: "Completed", color: "border-red-500 text-red-700 bg-white", icon: "✓" },
    { label: "In Progress", color: "border-yellow-500 text-yellow-700 bg-white", icon: "⚠️" },
    { label: "Not Started", color: "border-gray-200 text-gray-400 bg-gray-50", icon: "•" },
  ];

  return (
    <div className="flex flex-wrap gap-4 items-center mb-8">
      {statuses.map(({ label, color, icon }) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center text-sm ${color}`}>
            {icon}
          </div>
          <span className="text-sm text-gray-600 font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
};