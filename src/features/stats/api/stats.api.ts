import type { ClientStats, WalkerStats } from "@/types";
import api, { isApiConfigured } from "@/services/api";

export const StatsApi = {
  getClientStats: async (): Promise<ClientStats> => {
    if (!isApiConfigured) {
      const { statsMock } = await import("./stats.mock");
      return statsMock.getClientStats();
    }
    return api.get<ClientStats>("/me/stats").then((r) => r.data);
  },

  getWalkerStats: async (): Promise<WalkerStats> => {
    if (!isApiConfigured) {
      const { statsMock } = await import("./stats.mock");
      return statsMock.getWalkerStats();
    }
    return api.get<WalkerStats>("/walkers/me/stats").then((r) => r.data);
  },
};
