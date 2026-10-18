"use client";

import { useWalks } from "@/features/walks/hooks/use-walks";
import { ActiveWalkBanner } from "../_components/active-walk-banner";

export function DashboardActiveWalk() {
  const { data: walks = [] } = useWalks("client");
  return <ActiveWalkBanner walk={walks.find((w) => w.status === "in_progress")} />;
}
