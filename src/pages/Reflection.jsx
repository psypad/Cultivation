import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";

export default function Reflection() {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: today });

  const [searchParams] = useSearchParams();
  const cultivationId = searchParams.get("id");

  const { data: practices, isLoading } = useQuery({
    queryKey: ["practices-month", cultivationId],
    queryFn: () => {
      if (cultivationId) {
        return base44.entities.Practice.filter({ cultivation_id: cultivationId }, "-date", 31);
      }
      return base44.entities.Practice.list("-date", 31);
    },
    enabled: !!cultivationId,
  });

  const { data: cultivation } = useQuery({
    queryKey: ["cultivation", cultivationId],
    queryFn: async () => {
      if (cultivationId) {
        const all = await base44.entities.Cultivation.list();
        return all.filter(c => c.id === cultivationId);
      }
      return base44.entities.Cultivation.list();
    },
  });

  const userCultivation = cultivation?.[0];

  const monthPractices = practices?.filter((p) =>
    isSameMonth(new Date(p.date), today)
  ) || [];

  const practicedDays = monthPractices.filter((p) => p.practiced).length;
  const density = daysInMonth.length > 0
    ? Math.round((practicedDays / daysInMonth.length) * 100)
    : 0;

  const getReassurance = () => {
    if (density >= 70) {
      return "This level of consistency is excellent for long-term progress.";
    } else if (density >= 50) {
      return "This level of consistency is sufficient for long-term progress.";
    } else if (density >= 30) {
      return "Some practice is better than none. The path continues.";
    } else {
      return "Every return to the path matters. Continue when ready.";
    }
  };

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
        className="max-w-lg mx-auto"
      >
        <header className="mb-16 text-center">
          <p className="text-[#8a8680] text-xs tracking-[0.3em] uppercase mb-3">
            Monthly Reflection
          </p>
          <h1 className="font-serif text-2xl">
            {format(today, "MMMM yyyy")}
          </h1>
        </header>

        {/* Month Stats */}
        <section className="mb-16 grid grid-cols-2 gap-8 text-center">
          <div>
            <p className="text-[#8a8680] text-xs tracking-wider uppercase mb-2">
              Days Practiced
            </p>
            <p className="font-serif text-3xl">{practicedDays}</p>
            <p className="text-[#8a8680] text-xs mt-1">
              of {daysInMonth.length} days
            </p>
          </div>
          <div>
            <p className="text-[#8a8680] text-xs tracking-wider uppercase mb-2">
              Practice Density
            </p>
            <p className="font-serif text-3xl">{density}%</p>
          </div>
        </section>

        {/* Cultivation State */}
        {userCultivation && (
          <section className="mb-16 text-center">
            <p className="text-[#8a8680] text-xs tracking-wider uppercase mb-2">
              Cultivation State
            </p>
            <p className="font-serif text-xl">{userCultivation.cultivation_state}</p>
          </section>
        )}

        {/* Month Calendar */}
        <section className="mb-16">
          <div className="bg-[#242424] rounded-sm p-6">
            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map((day, index) => {
                const practice = monthPractices.find(
                  (p) => p.date === format(day, "yyyy-MM-dd")
                );
                return (
                  <div
                    key={index}
                    className={`aspect-square rounded-sm flex items-center justify-center text-xs ${
                      practice?.practiced
                        ? "bg-[#7c9a82] text-[#1a1a1a]"
                        : practice
                        ? "bg-[#3a3a3a] text-[#8a8680]"
                        : "bg-[#2a2a2a] text-[#4a4a4a]"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Reassurance */}
        <section className="mb-16 text-center">
          <p className="text-[#8a8680] text-sm leading-relaxed max-w-xs mx-auto">
            {getReassurance()}
          </p>
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