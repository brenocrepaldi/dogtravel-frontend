"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useWalks } from "@/features/walks/hooks/use-walks";

export function DashboardActiveWalk() {
  const { data: walks = [] } = useWalks("client");
  const activeWalk = walks.find((w) => w.status === "in_progress");

  if (!activeWalk) return null;

  const petNames = activeWalk.petNames.join(", ");

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Passeio em andamento</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {petNames} está sendo passeado · {activeWalk.durationMinutes} min
          </p>
        </div>
      </div>
      <Link
        href={`/walks/${activeWalk.id}/tracking`}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
      >
        <MapPin className="h-3.5 w-3.5" />
        Acompanhar
      </Link>
    </div>
  );
}
