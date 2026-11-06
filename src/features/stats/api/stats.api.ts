import type { ClientStats, WalkerStats } from "@/types";
import api, { isApiConfigured } from "@/services/api";

export const StatsApi = {
  getClientStats: async (): Promise<ClientStats> => {
    if (!isApiConfigured) {
      const { clientStats } = await import("@/lib/mock-data");
      return { ...clientStats };
    }
    return api.get<ClientStats>("/me/stats").then((r) => r.data);
  },

  getWalkerStats: async (): Promise<WalkerStats> => {
    if (!isApiConfigured) {
      const { walkerStats } = await import("@/lib/mock-data");
      return { ...walkerStats };
    }
    return api.get<WalkerStats>("/walkers/me/stats").then((r) => r.data);
  },
};
