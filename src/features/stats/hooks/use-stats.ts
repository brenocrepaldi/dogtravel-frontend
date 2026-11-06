import { useQuery } from "@tanstack/react-query";
import { StatsApi } from "../api/stats.api";

export function useClientStats() {
  return useQuery({
    queryKey: ["stats", "client"],
    queryFn: StatsApi.getClientStats,
    staleTime: 60_000,
  });
}

export function useWalkerStats() {
  return useQuery({
    queryKey: ["stats", "walker"],
    queryFn: StatsApi.getWalkerStats,
    staleTime: 60_000,
  });
}
