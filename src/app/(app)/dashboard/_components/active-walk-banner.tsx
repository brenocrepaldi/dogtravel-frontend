import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { WalkRecord } from "@/types";

export function ActiveWalkBanner({ walk }: { walk?: WalkRecord }) {
  if (!walk) return null;

  return (
    <Link
      href={`/walks/${walk.id}/tracking`}
      className="group flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3.5 transition-colors hover:bg-emerald-500/12 lg:px-5 lg:py-4"
    >
      <span className="relative flex h-3 w-3 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">Passeio em andamento</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {walk.petNames.join(", ")} · {walk.durationMinutes} min
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        Acompanhar
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
