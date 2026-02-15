import React, { useState } from "react";
import { localApi } from "@/api/localApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function Practice() {
  const [showDuration, setShowDuration] = useState(false);
  const [duration, setDuration] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();
  const cultivationId = searchParams.get("id");

  const today = format(new Date(), "yyyy-MM-dd");

  const { data: practices, isLoading } = useQuery({
    queryKey: ["practices", cultivationId],
    queryFn: () => {
      if (cultivationId) {
        return localApi.entities.Practice.filter({ cultivation_id: cultivationId }, "-date", 7);
      }
      return localApi.entities.Practice.list("-date", 7);
    },
    enabled: !!cultivationId,
  });

  const { data: cultivation } = useQuery({
    queryKey: ["cultivation", cultivationId],
    queryFn: async () => {
      if (cultivationId) {
        const all = await localApi.entities.Cultivation.list();
        return all.filter(c => c.id === cultivationId);
      }
      return localApi.entities.Cultivation.list();
    },
  });

  const todayPractice = practices?.find((p) => p.date === today && p.cultivation_id === cultivationId);
  const userCultivation = cultivation?.[0];

  const createPracticeMutation = useMutation({
    mutationFn: async (practiced) => {
      const practiceData = {
        cultivation_id: cultivationId,
        date: today,
        practiced,
        ...(practiced && duration ? { duration_minutes: parseInt(duration) } : {}),
      };

      await localApi.entities.Practice.create(practiceData);

      if (practiced && userCultivation) {
        await localApi.entities.Cultivation.update(userCultivation.id, {
          total_days_practiced: (userCultivation.total_days_practiced || 0) + 1,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practices", cultivationId] });
      queryClient.invalidateQueries({ queryKey: ["cultivation", cultivationId] });
      setConfirmed(true);
    },
  });

  const handlePracticed = () => {
    if (showDuration) {
      createPracticeMutation.mutate(true);
    } else {
      setShowDuration(true);
    }
  };

  const handleNotPracticed = () => {
    createPracticeMutation.mutate(false);
  };

  const handleSkipDuration = () => {
    createPracticeMutation.mutate(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#8a8680] text-sm tracking-wide">Loading...</div>
      </div>
    );
  }

  // Already logged today
  if (todayPractice) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-[#e8e4dc] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <p className="text-[#8a8680] text-xs tracking-[0.3em] uppercase mb-6">
            {format(new Date(), "EEEE, MMMM d")}
          </p>

          <h1 className="font-serif text-2xl mb-8">
            {todayPractice.practiced
              ? "Practice recorded."
              : "Rest recorded."}
          </h1>

          {todayPractice.practiced && todayPractice.duration_minutes && (
            <p className="text-[#8a8680] mb-8">
              {todayPractice.duration_minutes} minutes
            </p>
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

  // Confirmation screen
  if (confirmed) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-[#e8e4dc] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="font-serif text-2xl mb-12">Practice recorded.</h1>

          <Link to={createPageUrl("Dashboard")}>
            <button className="text-[#8a8680] text-sm tracking-wider hover:text-[#e8e4dc] transition-colors duration-500">
              Return to cultivation
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e8e4dc] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md w-full"
      >
        <p className="text-[#8a8680] text-xs tracking-[0.3em] uppercase mb-6">
          {format(new Date(), "EEEE, MMMM d")}
        </p>

        <AnimatePresence mode="wait">
          {!showDuration ? (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="font-serif text-2xl md:text-3xl mb-16">
                Did you practice today?
              </h1>

              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <motion.button
                  onClick={handlePracticed}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  disabled={createPracticeMutation.isPending}
                  className="px-12 py-4 border border-[#7c9a82]/40 text-[#7c9a82] 
                             tracking-wider text-sm uppercase
                             hover:bg-[#7c9a82]/10 transition-colors duration-500
                             disabled:opacity-50"
                >
                  Practiced
                </motion.button>

                <motion.button
                  onClick={handleNotPracticed}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  disabled={createPracticeMutation.isPending}
                  className="px-12 py-4 border border-[#3a3a3a] text-[#8a8680] 
                             tracking-wider text-sm uppercase
                             hover:bg-[#2a2a2a] transition-colors duration-500
                             disabled:opacity-50"
                >
                  Did Not Practice
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="duration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="font-serif text-xl mb-8">
                Duration (optional)
              </h2>

              <div className="mb-12">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Minutes"
                  className="w-32 bg-transparent border-b border-[#3a3a3a] 
                             text-center text-lg py-2 
                             focus:outline-none focus:border-[#7c9a82]/50
                             placeholder:text-[#4a4a4a] transition-colors duration-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <motion.button
                  onClick={handlePracticed}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  disabled={createPracticeMutation.isPending}
                  className="px-12 py-4 border border-[#7c9a82]/40 text-[#7c9a82] 
                             tracking-wider text-sm uppercase
                             hover:bg-[#7c9a82]/10 transition-colors duration-500
                             disabled:opacity-50"
                >
                  {createPracticeMutation.isPending ? "Recording..." : "Record"}
                </motion.button>

                <motion.button
                  onClick={handleSkipDuration}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  disabled={createPracticeMutation.isPending}
                  className="px-12 py-4 text-[#8a8680] 
                             tracking-wider text-sm
                             hover:text-[#e8e4dc] transition-colors duration-500
                             disabled:opacity-50"
                >
                  Skip
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-16">
          <Link to={createPageUrl(`Dashboard?id=${cultivationId}`)}>
            <button className="text-[#8a8680] text-xs tracking-wider hover:text-[#e8e4dc] transition-colors duration-500">
              Return
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
