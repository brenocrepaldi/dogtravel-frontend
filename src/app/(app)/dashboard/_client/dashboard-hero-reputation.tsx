"use client";

import { useClientStats } from "@/features/stats/hooks/use-stats";
import { HeroReputation } from "../_components/hero-reputation";

export function DashboardHeroReputation({ className }: { className?: string }) {
  const { data: stats } = useClientStats();
  return <HeroReputation rating={stats?.rating} totalWalks={stats?.totalWalks} className={className} />;
}
