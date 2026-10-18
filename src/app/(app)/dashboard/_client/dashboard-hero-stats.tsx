"use client";

import { useClientStats } from "@/features/stats/hooks/use-stats";

export function DashboardHeroStats() {
  const { data: stats } = useClientStats();

  return (
    <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/10">
      <div className="px-4 py-2 text-right lg:px-5 lg:py-3">
        <p className="text-xl font-bold leading-none lg:text-2xl">{stats?.totalWalks ?? "—"}</p>
        <p className="mt-0.5 text-xs text-primary-foreground/60">passeios</p>
      </div>
      <div className="h-px bg-white/10" />
      <div className="px-4 py-2 text-right lg:px-5 lg:py-3">
        <p className="text-xl font-bold leading-none lg:text-2xl">
          {stats ? `${stats.rating.toFixed(1)} ★` : "—"}
        </p>
        <p className="mt-0.5 text-xs text-primary-foreground/60">avaliação</p>
      </div>
    </div>
  );
}
