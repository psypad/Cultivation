import React, { useState } from "react";
import { localApi } from "@/api/localApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, differenceInDays } from "date-fns";

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

const PHASE_ORDER = ["Early", "Mid", "Late", "Peak"];

const REALM_REQUIREMENTS = {
  "Mortal": { days: 30, density: 40 },
  "Qi Condensation": { days: 60, density: 50 },
  "Foundation Establishment": { days: 90, density: 55 },
  "Core Formation": { days: 120, density: 60 },
  "Nascent Soul": { days: 180, density: 65 },
  "Spirit Severing": { days: 270, density: 70 },
  "Dao Seeking": { days: 365, density: 75 },
};

export default function Breakthrough() {
  const [attemptResult, setAttemptResult] = useState(null);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const cultivationId = urlParams.get("id");

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

  const { data: practices, isLoading: practicesLoading } = useQuery({
    queryKey: ["practices-all", cultivationId],
    queryFn: () => {
      if (cultivationId) {
        return localApi.entities.Practice.filter({ cultivation_id: cultivationId }, "-date", 365);
      }
      return localApi.entities.Practice.list("-date", 365);
    },
    enabled: !!cultivationId,
  });

  const userCultivation = cultivation?.[0];

  const calculateDensity90 = () => {
    if (!practices) return 0;
    const cutoff = subDays(new Date(), 90);
    const recentPractices = practices.filter(
      (p) => new Date(p.date) >= cutoff && p.practiced
    );
    return Math.round((recentPractices.length / 90) * 100);
  };

  const density90 = calculateDensity90();

  const getNextStage = () => {
    if (!userCultivation) return null;

    const currentPhaseIndex = PHASE_ORDER.indexOf(userCultivation.realm_phase);
    const currentRealmIndex = REALM_ORDER.indexOf(userCultivation.current_realm);

    if (currentPhaseIndex < PHASE_ORDER.length - 1) {
      return {
        realm: userCultivation.current_realm,
        phase: PHASE_ORDER[currentPhaseIndex + 1],
        isNewRealm: false,
      };
    } else if (currentRealmIndex < REALM_ORDER.length - 1) {
      return {
        realm: REALM_ORDER[currentRealmIndex + 1],
        phase: "Early",
        isNewRealm: true,
      };
    }
    return null;
  };

  const nextStage = getNextStage();

  const requirements = userCultivation
    ? REALM_REQUIREMENTS[userCultivation.current_realm] || { days: 30, density: 40 }
    : { days: 30, density: 40 };

  const meetsRequirements =
    (userCultivation?.total_days_practiced || 0) >= requirements.days &&
    density90 >= requirements.density;

  const breakthroughMutation = useMutation({
    mutationFn: async () => {
      // Calculate success probability based on how much they exceed requirements
      const daysExcess = Math.max(0, (userCultivation.total_days_practiced || 0) - requirements.days);
      const densityExcess = Math.max(0, density90 - requirements.density);
      
      // Base 50% chance, +2% per extra day, +1% per extra density point, capped at 85%
      const successChance = Math.min(85, 50 + (daysExcess * 0.5) + (densityExcess * 1));
      const success = Math.random() * 100 < successChance;

      if (success && nextStage) {
        await localApi.entities.Cultivation.update(userCultivation.id, {
          current_realm: nextStage.realm,
          realm_phase: nextStage.phase,
          last_breakthrough_attempt: format(new Date(), "yyyy-MM-dd"),
        });
      } else {
        await localApi.entities.Cultivation.update(userCultivation.id, {
          last_breakthrough_attempt: format(new Date(), "yyyy-MM-dd"),
        });
      }

      return success;
    },
    onSuccess: (success) => {
      setAttemptResult(success ? "success" : "failure");
      queryClient.invalidateQueries({ queryKey: ["cultivation"] });
    },
  });

  if (cultivationLoading || practicesLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#8a8680] text-sm tracking-wide">Loading...</div>
      </div>
    );
  }

  if (!userCultivation) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-[#e8e4dc] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-[#8a8680] mb-6">No cultivation path found.</p>
          <Link to={createPageUrl("Dashboard")}>
            <button className="text-[#7c9a82]">Begin cultivation</button>
          </Link>
        </div>
      </div>
    );
  }

  if (!nextStage) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-[#e8e4dc] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="font-serif text-2xl mb-6">Immortal Ascension</h1>
          <p className="text-[#8a8680] mb-8">
            You have reached the peak of cultivation.
          </p>
          <Link to={createPageUrl("Dashboard")}>
            <button className="text-[#7c9a82]">Return</button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Result screen
  if (attemptResult) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-[#e8e4dc] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          {attemptResult === "success" ? (
            <>
              <p className="text-[#8a8680] text-xs tracking-[0.3em] uppercase mb-6">
                Breakthrough Successful
              </p>
              <h1 className="font-serif text-2xl mb-4">
                {nextStage.realm}
              </h1>
              <p className="text-[#7c9a82] mb-8">{nextStage.phase} Stage</p>
              <p className="text-[#8a8680] text-sm mb-12">
                A new realm opens before you.
              </p>
            </>
          ) : (
            <>
              <p className="text-[#8a8680] text-xs tracking-[0.3em] uppercase mb-6">
                Breakthrough Attempted
              </p>
              <h1 className="font-serif text-2xl mb-8">
                Foundation unstable.
              </h1>
              <p className="text-[#8a8680] text-sm mb-12">
                Continue cultivation.
              </p>
            </>
          )}

          <Link to={createPageUrl(`Dashboard?id=${cultivationId}`)}>
            <button className="text-[#8a8680] text-sm tracking-wider hover:text-[#e8e4dc] transition-colors duration-500">
              Return to cultivation
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e8e4dc] p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg mx-auto"
      >
        <header className="mb-12 text-center">
          <p className="text-[#8a8680] text-xs tracking-[0.3em] uppercase mb-3">
            Attempt Breakthrough
          </p>
          <h1 className="font-serif text-2xl">
            {nextStage.isNewRealm ? nextStage.realm : `${userCultivation.current_realm} — ${nextStage.phase}`}
          </h1>
        </header>

        {/* Current Stats */}
        <section className="mb-12 bg-[#242424] rounded-sm p-6">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <p className="text-[#8a8680] text-xs tracking-wider uppercase mb-2">
                Total Practiced
              </p>
              <p className="font-serif text-2xl">
                {userCultivation.total_days_practiced || 0}
                <span className="text-[#8a8680] text-sm ml-1">days</span>
              </p>
              <p className="text-xs text-[#8a8680] mt-1">
                Required: {requirements.days}
              </p>
            </div>
            <div>
              <p className="text-[#8a8680] text-xs tracking-wider uppercase mb-2">
                90-Day Density
              </p>
              <p className="font-serif text-2xl">
                {density90}
                <span className="text-[#8a8680] text-sm ml-1">%</span>
              </p>
              <p className="text-xs text-[#8a8680] mt-1">
                Required: {requirements.density}%
              </p>
            </div>
          </div>
        </section>

        {/* Warning */}
        <section className="mb-12 text-center">
          <p className="text-[#8a8680] text-sm leading-relaxed">
            Breakthrough is not guaranteed and may fail.
            <br />
            Stronger foundations increase the chance of success.
          </p>
        </section>

        {/* Requirements Status */}
        {!meetsRequirements && (
          <section className="mb-12 text-center">
            <p className="text-[#8a8680] text-sm">
              Foundation insufficient for breakthrough attempt.
            </p>
          </section>
        )}

        {/* Action */}
        <section className="text-center">
          <motion.button
            onClick={() => breakthroughMutation.mutate()}
            disabled={!meetsRequirements || breakthroughMutation.isPending}
            whileHover={meetsRequirements ? { scale: 1.02 } : {}}
            whileTap={meetsRequirements ? { scale: 0.98 } : {}}
            transition={{ duration: 0.3 }}
            className={`px-12 py-4 border tracking-wider text-sm uppercase transition-colors duration-500 ${
              meetsRequirements
                ? "border-[#7c9a82]/40 text-[#7c9a82] hover:bg-[#7c9a82]/10"
                : "border-[#3a3a3a] text-[#4a4a4a] cursor-not-allowed"
            }`}
          >
            {breakthroughMutation.isPending
              ? "Attempting..."
              : "Attempt Breakthrough"}
          </motion.button>
        </section>

        {/* Return */}
        <section className="mt-12 text-center">
          <Link to={createPageUrl(`Dashboard?id=${cultivationId}`)}>
            <button className="text-[#8a8680] text-xs tracking-wider hover:text-[#e8e4dc] transition-colors duration-500">
              Return
            </button>
          </Link>
        </section>
      </motion.div>
    </div>
  );
}