import React from "react";

const STATE_DESCRIPTIONS = {
  Advancing: "Cultivation is progressing steadily",
  Stagnating: "Cultivation has entered a plateau",
  Recovering: "Returning to the path after absence",
};

export default function StateIndicator({ state }) {
  return (
    <div>
      <p className="text-[#8a8680] text-xs tracking-[0.2em] uppercase mb-3">
        Cultivation State
      </p>
      
      <p className="font-serif text-lg mb-2">{state}</p>
      
      <p className="text-[#8a8680] text-sm">
        {STATE_DESCRIPTIONS[state]}
      </p>
    </div>
  );
}