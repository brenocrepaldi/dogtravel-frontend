"use client";

import { useClientStats } from "@/features/stats/hooks/use-stats";

export function DashboardHeroStats() {
  const { data: stats } = useClientStats();

  return (
    <div className="flex gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:flex-col sm:gap-0">
      <div className="flex-1 px-5 py-3 text-center sm:text-right">
        <p className="text-2xl font-bold leading-none">{stats?.totalWalks ?? "—"}</p>
        <p className="mt-0.5 text-xs text-primary-foreground/60">passeios</p>
      </div>
      <div className="w-px bg-white/10 sm:h-px sm:w-auto" />
      <div className="flex-1 px-5 py-3 text-center sm:text-right">
        <p className="text-2xl font-bold leading-none">
          {stats ? `${stats.rating.toFixed(1)} ★` : "—"}
        </p>
        <p className="mt-0.5 text-xs text-primary-foreground/60">avaliação</p>
      </div>
    </div>
  );
}
