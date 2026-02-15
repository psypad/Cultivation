import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function SetupCultivation({ onComplete }) {
  const [daoName, setDaoName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!daoName.trim()) return;

    setIsSubmitting(true);
    await base44.entities.Cultivation.create({
      dao_name: daoName.trim(),
      current_realm: "Mortal",
      realm_phase: "Early",
      cultivation_state: "Advancing",
      total_days_practiced: 0,
      cultivation_started: format(new Date(), "yyyy-MM-dd"),
    });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e8e4dc] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        <p className="text-[#8a8680] text-xs tracking-[0.3em] uppercase mb-6">
          Begin Your Path
        </p>
        
        <h1 className="font-serif text-2xl md:text-3xl mb-12">
          What Dao do you seek to cultivate?
        </h1>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div>
            <input
              type="text"
              value={daoName}
              onChange={(e) => setDaoName(e.target.value)}
              placeholder="e.g., Systems Mastery, Written Word, Physical Form"
              className="w-full bg-transparent border-b border-[#3a3a3a] 
                         text-center text-lg py-4 
                         focus:outline-none focus:border-[#7c9a82]/50
                         placeholder:text-[#4a4a4a] transition-colors duration-500"
            />
          </div>

          <motion.button
            type="submit"
            disabled={!daoName.trim() || isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="px-12 py-4 border border-[#7c9a82]/40 text-[#7c9a82] 
                       tracking-wider text-sm uppercase
                       hover:bg-[#7c9a82]/10 transition-colors duration-500
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Beginning..." : "Begin Cultivation"}
          </motion.button>
        </form>

        <p className="mt-16 text-[#8a8680] text-sm leading-relaxed max-w-xs mx-auto">
          The path of cultivation is measured in years, not days. 
          Choose something worth a lifetime of practice.
        </p>
      </motion.div>
    </div>
  );
}