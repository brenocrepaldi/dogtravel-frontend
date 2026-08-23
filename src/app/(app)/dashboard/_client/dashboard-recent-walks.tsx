"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalks } from "@/features/walks/hooks/use-walks";
import type { WalkStatus } from "@/types";

const statusConfig: Record<WalkStatus, { label: string; className: string }> = {
  pending:     { label: "Aguardando",   className: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400" },
  accepted:    { label: "Confirmado",   className: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400" },
  in_progress: { label: "Em andamento", className: "bg-primary/10 text-primary border-primary/20" },
  completed:   { label: "Concluído",    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400" },
  cancelled:   { label: "Cancelado",    className: "bg-muted text-muted-foreground border-border/60" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function DashboardRecentWalks() {
  const { data: walks = [], isLoading } = useWalks("client");
  const recent = walks.slice(0, 3);

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
          const isCancelled = walk.status === "cancelled";
          const walkerParticipant = walk.participants.find((p) => p.role === "walker");
          const walkerName = walkerParticipant?.name ?? "Passeador";

          return (
            <Link key={walk.id} href={`/walks/${walk.id}`}>
              <div className={cn(
                "group flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-muted/30",
                isCancelled && "opacity-50"
              )}>
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-transform duration-150 group-hover:scale-105",
                  isCancelled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                )}>
                  {getInitials(walkerName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{walkerName}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {walk.petNames.join(" & ")} · {walk.dateLabel}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={cn(
                    "hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                    s.className
                  )}>
                    {s.label}
                  </span>
                  {!isCancelled && (
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      R$ {walk.price.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
