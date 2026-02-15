import React from "react";
import { localApi } from "@/api/localApi";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { differenceInDays, subDays } from "date-fns";

import RealmIndicator from "@/components/cultivation/RealmIndicator";
import StateIndicator from "@/components/cultivation/StateIndicator";
import ProgressArc from "@/components/cultivation/ProgressArc";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cultivationId = searchParams.get("id");

  const { data: cultivation, isLoading: cultivationLoading } = useQuery({
    queryKey: ["cultivation", cultivationId],
    queryFn: async () => {
      if (cultivationId) {
        const all = await localApi.entities.Cultivation.list();
        return all.filter(c => c.id === cultivationId);
      }
      return localApi.entities.Cultivation.list();
    },
  });

  const { data: practices } = useQuery({
    queryKey: ["practices", cultivationId],
    queryFn: () => {
      if (cultivationId) {
        return localApi.entities.Practice.filter({ cultivation_id: cultivationId }, "-date", 180);
      }
      return localApi.entities.Practice.list("-date", 180);
    },
    enabled: !!cultivationId,
  });

  const userCultivation = cultivation?.[0];

  const calculateDensity = (days) => {
    if (!practices || practices.length === 0) return 0;
    const cutoff = subDays(new Date(), days);
    const recentPractices = practices.filter(
      (p) => new Date(p.date) >= cutoff && p.practiced
    );
    return Math.round((recentPractices.length / days) * 100);
  };

  const density90 = calculateDensity(90);
  const density180 = calculateDensity(180);

  const daysOnPath = userCultivation?.cultivation_started
    ? differenceInDays(new Date(), new Date(userCultivation.cultivation_started))
    : 0;

  if (cultivationLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#8a8680] text-sm tracking-wide">Loading...</div>
      </div>
    );
  }

  if (!cultivationId) {
    navigate(createPageUrl("CultivationSelector"));
    return null;
  }

  if (!userCultivation) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8a8680] mb-6">Cultivation path not found.</p>
          <Link to={createPageUrl("CultivationSelector")}>
            <button className="text-[#7c9a82]">Return to paths</button>
          </Link>
        </div>
      </div>
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
        {/* Dao Name */}
        <header className="mb-16 text-center">
          <p className="text-[#8a8680] text-xs tracking-[0.3em] uppercase mb-3">
            Cultivating the Dao of
          </p>
          <h1 className="font-serif text-2xl md:text-3xl tracking-wide">
            {userCultivation.dao_name}
          </h1>
        </header>

        {/* Current Realm */}
        <section className="mb-16">
          <RealmIndicator
            realm={userCultivation.current_realm}
            phase={userCultivation.realm_phase}
          />
        </section>

        {/* Cultivation State */}
        <section className="mb-16 text-center">
          <StateIndicator state={userCultivation.cultivation_state} />
        </section>

        {/* Progress Visualization */}
        <section className="mb-16">
          <ProgressArc
            density={density90}
            phase={userCultivation.realm_phase}
          />
        </section>

        {/* Time Metrics */}
        <section className="mb-20 grid grid-cols-2 gap-8 text-center">
          <div>
            <p className="text-[#8a8680] text-xs tracking-wider uppercase mb-2">
              Days on Path
            </p>
            <p className="font-serif text-3xl">{daysOnPath}</p>
          </div>
          <div>
            <p className="text-[#8a8680] text-xs tracking-wider uppercase mb-2">
              Total Practiced
            </p>
            <p className="font-serif text-3xl">
              {userCultivation.total_days_practiced || 0}
            </p>
          </div>
        </section>

        {/* Practice Density */}
        <section className="mb-20 text-center">
          <p className="text-[#8a8680] text-xs tracking-wider uppercase mb-4">
            Practice Density
          </p>
          <div className="flex justify-center gap-12">
            <div>
              <p className="font-serif text-2xl mb-1">{density90}%</p>
              <p className="text-[#8a8680] text-xs">90 days</p>
            </div>
            <div>
              <p className="font-serif text-2xl mb-1">{density180}%</p>
              <p className="text-[#8a8680] text-xs">180 days</p>
            </div>
          </div>
        </section>

        {/* Primary Action */}
        <section className="text-center mb-12">
          <Link to={createPageUrl(`Practice?id=${cultivationId}`)}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="px-12 py-4 border border-[#7c9a82]/40 text-[#7c9a82] 
                         tracking-wider text-sm uppercase
                         hover:bg-[#7c9a82]/10 transition-colors duration-500"
            >
              Log Practice
            </motion.button>
          </Link>
        </section>

        {/* Return to Selector */}
        <section className="text-center">
          <Link to={createPageUrl("CultivationSelector")}>
            <button className="text-[#8a8680] text-xs tracking-wider hover:text-[#e8e4dc] transition-colors duration-500">
              All paths
            </button>
          </Link>
        </section>
      </motion.div>
    </div>
  );
}