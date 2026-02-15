import React from "react";
import { format } from "date-fns";

export default function PracticeDensityChart({ data }) {
  // Group by weeks for display
  const weeksCount = Math.ceil(data.length / 7);
  const weeks = [];

  for (let i = 0; i < weeksCount; i++) {
    weeks.push(data.slice(i * 7, (i + 1) * 7));
  }

  return (
    <div className="bg-[#242424] rounded-sm p-6">
      <div className="flex flex-wrap gap-1 justify-center">
        {data.map((day, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-sm transition-colors duration-300 ${
              day.practiced
                ? "bg-[#7c9a82]"
                : day.logged
                ? "bg-[#3a3a3a]"
                : "bg-[#2a2a2a]"
            }`}
            title={`${format(day.date, "MMM d, yyyy")}${
              day.practiced ? " - Practiced" : day.logged ? " - Rest" : ""
            }`}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center items-center gap-6 text-xs text-[#8a8680]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#7c9a82]" />
          <span>Practiced</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#2a2a2a]" />
          <span>No entry</span>
        </div>
      </div>
    </div>
  );
}