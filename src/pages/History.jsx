import React, { useState } from "react";
import { localApi } from "@/api/localApi";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { subDays, eachDayOfInterval, isSameDay } from "date-fns";
import PracticeDensityChart from "@/components/history/PracticeDensityChart";
import TrendDescriptor from "@/components/history/TrendDescriptor";

export default function History() {
  const [windowDays, setWindowDays] = useState(90);

  const [searchParams] = useSearchParams();
  const cultivationId = searchParams.get("id");

  const { data: practices, isLoading } = useQuery({
    queryKey: ["practices", windowDays, cultivationId],
    queryFn: () => {
      if (cultivationId) {
        return localApi.entities.Practice.filter({ cultivation_id: cultivationId }, "-date", windowDays);
      }
      return localApi.entities.Practice.list("-date", windowDays);
    },
    enabled: !!cultivationId,
  });

  const calculateStats = () => {
    if (!practices) return { density: 0, practicedDays: 0, trend: "Stable" };

    const cutoff = subDays(new Date(), windowDays);
    const recentPractices = practices.filter(
      (p) => new Date(p.date) >= cutoff && p.practiced
    );
    const density = Math.round((recentPractices.length / windowDays) * 100);

    // Calculate trend by comparing first half to second half
    const midpoint = subDays(new Date(), Math.floor(windowDays / 2));
    const firstHalf = practices.filter(
      (p) => new Date(p.date) < midpoint && new Date(p.date) >= cutoff && p.practiced
    ).length;
    const secondHalf = practices.filter(
      (p) => new Date(p.date) >= midpoint && p.practiced
    ).length;

    const halfWindow = Math.floor(windowDays / 2);
    const firstDensity = firstHalf / halfWindow;
    const secondDensity = secondHalf / halfWindow;

    let trend = "Stable";
    if (secondDensity > firstDensity + 0.1) trend = "Increasing";
    else if (secondDensity < firstDensity - 0.1) trend = "Decreasing";

    return { density, practicedDays: recentPractices.length, trend };
  };

  const { density, practicedDays, trend } = calculateStats();

  const generateDayData = () => {
    if (!practices) return [];

    const days = eachDayOfInterval({
      start: subDays(new Date(), windowDays - 1),
      end: new Date(),
    });

    return days.map((day) => {
      const practice = practices.find((p) =>
        isSameDay(new Date(p.date), day)
      );
      return {
        date: day,
        practiced: practice?.practiced || false,
        logged: !!practice,
      };
    });
  };

  const dayData = generateDayData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#8a8680] text-sm tracking-wide">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e8e4dc] p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <header className="mb-12 text-center">
          <p className="text-[#8a8680] text-xs tracking-[0.3em] uppercase mb-3">
            Practice History
          </p>
          <h1 className="font-serif text-2xl">Long-Term Persistence</h1>
        </header>

        {/* Window Selector */}
        <section className="mb-12 flex justify-center gap-8">
          {[30, 90, 180].map((w) => (
            <button
              key={w}
              onClick={() => setWindowDays(w)}
              className={`text-sm tracking-wider transition-colors duration-500 ${
                windowDays === w
                  ? "text-[#7c9a82]"
                  : "text-[#8a8680] hover:text-[#e8e4dc]"
              }`}
            >
              {w} days
            </button>
          ))}
        </section>

        {/* Density Visualization */}
        <section className="mb-12">
          <PracticeDensityChart data={dayData} />
        </section>

        {/* Stats */}
        <section className="mb-12 grid grid-cols-2 gap-8 text-center">
          <div>
            <p className="text-[#8a8680] text-xs tracking-wider uppercase mb-2">
              Practice Density
            </p>
            <p className="font-serif text-3xl">{density}%</p>
          </div>
          <div>
            <p className="text-[#8a8680] text-xs tracking-wider uppercase mb-2">
              Days Practiced
            </p>
            <p className="font-serif text-3xl">{practicedDays}</p>
          </div>
        </section>

        {/* Trend */}
        <section className="mb-16 text-center">
          <TrendDescriptor trend={trend} window={windowDays} />
        </section>

        {/* Navigation */}
        <section className="text-center">
          <Link to={createPageUrl(`Dashboard?id=${cultivationId}`)}>
            <button className="text-[#8a8680] text-sm tracking-wider hover:text-[#e8e4dc] transition-colors duration-500">
              Return to cultivation
            </button>
          </Link>
        </section>
      </motion.div>
    </div>
  );
}
