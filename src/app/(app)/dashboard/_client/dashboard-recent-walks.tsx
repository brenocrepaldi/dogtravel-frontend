"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalks } from "@/features/walks/hooks/use-walks";
import type { WalkStatus } from "@/types";
import { WalkListAvatar } from "../_components/walk-list-avatar";

const statusConfig: Record<WalkStatus, { label: string; className: string }> = {
  pending:     { label: "Aguardando",   className: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400" },
  accepted:    { label: "Confirmado",   className: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400" },
  in_progress: { label: "Em andamento", className: "bg-primary/10 text-primary border-primary/20" },
  completed:   { label: "Concluído",    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400" },
  cancelled:   { label: "Cancelado",    className: "bg-muted text-muted-foreground border-border/60" },
};

export function DashboardRecentWalks() {
  const { data: walks = [], isLoading } = useWalks("client");
  // Only walks that have a walker: cancelled ones and requests still looking
  // for a walker stay in /walks, not on the dashboard.
  const recent = walks
    .filter((walk) => walk.status !== "cancelled" && walk.participants.some((p) => p.role === "walker"))
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  if (recent.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 py-8 text-center">
        <p className="text-sm font-semibold text-foreground">Nenhum passeio ainda</p>
        <p className="text-xs text-muted-foreground">Solicite seu primeiro passeio!</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div className="divide-y divide-border/50">
        {recent.map((walk) => {
          const s = statusConfig[walk.status];
          const walkerParticipant = walk.participants.find((p) => p.role === "walker");
          const walkerName = walkerParticipant?.name ?? "Passeador";

          return (
            <Link key={walk.id} href={`/walks/${walk.id}`}>
              <div className="group flex items-center gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-muted/30 sm:gap-4 sm:px-5 sm:py-4">
                <WalkListAvatar
                  main={{ name: walkerName, photoUrl: walk.walkerAvatarUrl, kind: "person" }}
                  corner={walk.pets?.[0] ? { ...walk.pets[0], kind: "dog" } : undefined}
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {walkerName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {walk.petNames.join(" & ")} · {walk.dateLabel}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <span className="text-sm font-bold tabular-nums text-foreground">
                    {formatBRL(walk.price)}
                  </span>
                  <span className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium sm:order-first sm:px-2.5 sm:text-[11px]",
                    s.className
                  )}>
                    {s.label}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
