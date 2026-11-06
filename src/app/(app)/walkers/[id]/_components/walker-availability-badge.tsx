"use client";

import { cn } from "@/lib/utils";
import { formatAvailabilityLabel } from "@/lib/availability";
import { useWalkerAvailability } from "@/features/walkers/hooks/use-walkers";
import type { AvailabilitySlot } from "@/types";

interface Props {
  walkerId: string;
  scheduleLabel: AvailabilitySlot[];
}

export function WalkerAvailabilityBadge({ walkerId, scheduleLabel }: Props) {
  const { data: available, isLoading } = useWalkerAvailability(walkerId);

  if (isLoading) {
    return (
      <div className="h-7 w-28 rounded-lg bg-muted animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border/50 px-3 py-2">
      <span
        className={cn(
          "relative flex h-2 w-2 shrink-0",
        )}
      >
        {available && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            available ? "bg-emerald-500" : "bg-muted-foreground/40",
          )}
        />
      </span>
      <span className="text-xs text-muted-foreground">
        {available ? (
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">Disponível agora</span>
        ) : (
          formatAvailabilityLabel(scheduleLabel)
        )}
      </span>
    </div>
  );
}
