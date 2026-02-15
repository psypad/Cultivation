import React from "react";

const REALM_ORDER = [
  "Mortal",
  "Qi Condensation",
  "Foundation Establishment",
  "Core Formation",
  "Nascent Soul",
  "Spirit Severing",
  "Dao Seeking",
  "Immortal Ascension",
];

export default function RealmIndicator({ realm, phase }) {
  const realmIndex = REALM_ORDER.indexOf(realm);

  return (
    <div className="text-center">
      <p className="text-[#8a8680] text-xs tracking-[0.2em] uppercase mb-4">
        Current Realm
      </p>
      
      <h2 className="font-serif text-xl md:text-2xl mb-2">{realm}</h2>
      
      <p className="text-[#7c9a82] text-sm tracking-wider">
        {phase} Stage
      </p>

      {/* Realm Progress Indicator */}
      <div className="mt-8 flex justify-center items-center gap-2">
        {REALM_ORDER.map((r, i) => (
          <div
            key={r}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i < realmIndex
                ? "bg-[#7c9a82]/60"
                : i === realmIndex
                ? "bg-[#7c9a82] w-3 h-3"
                : "bg-[#3a3a3a]"
            }`}
            title={r}
          />
        ))}
      </div>
    </div>
  );
}