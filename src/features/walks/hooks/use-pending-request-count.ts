"use client";

import { useSession } from "next-auth/react";
import { useWalkerAvailability, useWalkerProfile } from "@/features/walkers/hooks/use-walkers";
import { useWalkRequests } from "./use-walks";

/**
 * How many walk requests are waiting for this walker, for the nav badges.
 * Zero for clients and while the walker is unavailable — the same rule the
 * dashboard and the inbox use to show the list — so the badge never promises
 * requests the walker can't see.
 */
export function usePendingRequestCount(): number {
  const { data: session } = useSession();
  const isWalker = session?.user?.role === "walker";

  const { data: walkerProfile } = useWalkerProfile({ enabled: isWalker });
  const { data: available = false } = useWalkerAvailability(isWalker ? (walkerProfile?.id ?? "") : "");
  const { data: requests = [] } = useWalkRequests({ enabled: isWalker && available });

  return isWalker && available ? requests.length : 0;
}
