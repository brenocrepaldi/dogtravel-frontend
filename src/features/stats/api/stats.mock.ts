import { clientStats, walkerStats } from "@/lib/mock/mock-data";
import type { ClientStats, WalkerStats } from "@/types";

// Mock backend, loaded only when no real API is configured.
export const statsMock = {
  getClientStats: async (): Promise<ClientStats> => ({ ...clientStats }),
  getWalkerStats: async (): Promise<WalkerStats> => ({ ...walkerStats }),
};
