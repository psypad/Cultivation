import React from "react";

const PHASE_PROGRESS = {
  Early: 0.125,
  Mid: 0.375,
  Late: 0.625,
  Peak: 0.875,
};

export default function ProgressArc({ phase }) {
  const phaseProgress = PHASE_PROGRESS[phase] || 0.125;
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - phaseProgress);

  return (
    <div className="flex flex-col items-center">
      <p className="text-[#8a8680] text-xs tracking-[0.2em] uppercase mb-6">
        Realm Progress
      </p>

      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#2a2a2a"
            strokeWidth="2"
          />

          {/* Progress arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#7c9a82"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
            opacity="0.6"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-2xl">{phase}</span>
        </div>
      </div>

      <p className="mt-6 text-[#8a8680] text-xs">
        Progress within current realm
      </p>
    </div>
  );
}