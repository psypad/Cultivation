import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import SetupCultivation from "@/components/cultivation/SetupCultivation";

export default function CultivationSelector() {
  const [showNewCultivation, setShowNewCultivation] = useState(false);

  const { data: cultivations, isLoading, refetch } = useQuery({
    queryKey: ["cultivations-all"],
    queryFn: () => base44.entities.Cultivation.list("-created_date"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#8a8680] text-sm tracking-wide">Loading...</div>
      </div>
    );
  }

  if (showNewCultivation || !cultivations || cultivations.length === 0) {
    return (
      <SetupCultivation
        onComplete={() => {
          refetch();
          setShowNewCultivation(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e8e4dc] p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        <header className="mb-12 text-center">
          <p className="text-[#8a8680] text-xs tracking-[0.3em] uppercase mb-3">
            Your Cultivation Paths
          </p>
          <h1 className="font-serif text-2xl md:text-3xl">Select Your Path</h1>
        </header>

        <section className="space-y-4 mb-12">
          {cultivations.map((cultivation) => (
            <Link
              key={cultivation.id}
              to={createPageUrl(`Dashboard?id=${cultivation.id}`)}
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className="bg-[#242424] border border-[#3a3a3a] rounded-sm p-6 
                           hover:border-[#7c9a82]/40 transition-colors duration-500"
              >
                <h2 className="font-serif text-xl mb-2">
                  {cultivation.dao_name}
                </h2>
                <div className="flex items-center gap-4 text-sm text-[#8a8680]">
                  <span>{cultivation.current_realm}</span>
                  <span>·</span>
                  <span>{cultivation.realm_phase}</span>
                  <span>·</span>
                  <span>{cultivation.total_days_practiced || 0} days</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </section>

        <section className="text-center">
          <motion.button
            onClick={() => setShowNewCultivation(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="px-8 py-3 border border-[#7c9a82]/40 text-[#7c9a82] 
                       tracking-wider text-sm uppercase inline-flex items-center gap-2
                       hover:bg-[#7c9a82]/10 transition-colors duration-500"
          >
            <Plus className="w-4 h-4" />
            Begin New Path
          </motion.button>
        </section>
      </motion.div>
    </div>
  );
}