import React from "react";

const TREND_MESSAGES = {
  Increasing: "Consistency has increased this period.",
  Decreasing: "Consistency decreased slightly this period.",
  Stable: "Consistency has remained steady.",
};

export default function TrendDescriptor({ trend, window }) {
  return (
    <div className="bg-[#242424] rounded-sm p-6 inline-block">
      <p className="text-[#8a8680] text-xs tracking-wider uppercase mb-2">
        {window}-Day Trend
      </p>
      <p className="font-serif text-lg mb-2">{trend}</p>
      <p className="text-[#8a8680] text-sm">{TREND_MESSAGES[trend]}</p>
    </div>
  );
}