"use client";

import { useSession } from "next-auth/react";
import { useWalkRequests } from "./use-walks";

/**
 * How many walk requests are waiting for this walker, for the nav badges.
 * Zero for clients. Counted while offline too, since the inbox keeps showing
 * the requests already received.
 */
export function usePendingRequestCount(): number {
  const { data: session } = useSession();
  const isWalker = session?.user?.role === "walker";

  const { data: requests = [] } = useWalkRequests({ enabled: isWalker });

  return isWalker ? requests.length : 0;
}
