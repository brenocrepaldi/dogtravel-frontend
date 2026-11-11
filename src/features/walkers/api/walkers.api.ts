import type { EarningsParams, PaymentHistoryItem, WalkerBankAccount, WalkerProfile, WalkerProfileUpdate, WalkerPublicReview } from "@/types";
import api, { isApiConfigured } from "@/services/api";

// The in-memory mock lives in walkers.mock.ts and is loaded dynamically so it
// (and mock-data) never reaches the client bundle when a real API is configured.

export interface WalkerFilters {
  query?: string;
  size?: string;
}

export interface WalkerAvailabilityFilters {
  date: string;
  time: string;
  durationMinutes: number;
}

export const WalkersApi = {
  list: async (filters?: WalkerFilters): Promise<WalkerProfile[]> => {
    if (!isApiConfigured) {
      const { walkersMock } = await import("./walkers.mock");
      return walkersMock.list(filters);
    }
    return api
      .get<WalkerProfile[]>("/walkers", { params: filters })
      .then((r) => r.data);
  },

  getReviews: async (walkerId: string): Promise<WalkerPublicReview[]> => {
    if (!isApiConfigured) {
      const { walkersMock } = await import("./walkers.mock");
      return walkersMock.getReviews(walkerId);
    }
    return api
      .get<WalkerPublicReview[]>(`/walkers/${walkerId}/reviews`)
      .then((r) => r.data);
  },

  getById: async (id: string): Promise<WalkerProfile | undefined> => {
    if (!isApiConfigured) {
      const { walkersMock } = await import("./walkers.mock");
      return walkersMock.getById(id);
    }
    return api.get<WalkerProfile>(`/walkers/${id}`).then((r) => r.data);
  },

  getMe: async (): Promise<WalkerProfile | null> => {
    if (!isApiConfigured) {
      const { walkersMock } = await import("./walkers.mock");
      return walkersMock.getMe();
    }
    return api.get<WalkerProfile>("/walkers/me").then((r) => r.data);
  },

  updateMe: async (data: WalkerProfileUpdate): Promise<void> => {
    if (!isApiConfigured) {
      const { walkersMock } = await import("./walkers.mock");
      return walkersMock.updateMe(data);
    }
    const payload = {
      ...data,
      ...(data.availability !== undefined && {
        availability: JSON.stringify(data.availability),
      }),
    };
    await api.patch("/walkers/me", payload);
  },

  getEarnings: async (params?: EarningsParams): Promise<PaymentHistoryItem[]> => {
    if (!isApiConfigured) {
      const { walkersMock } = await import("./walkers.mock");
      return walkersMock.getEarnings();
    }
    return api
      .get<PaymentHistoryItem[]>("/walkers/me/earnings", { params })
      .then((r) => r.data);
  },

  getBankAccount: async (): Promise<WalkerBankAccount> => {
    if (!isApiConfigured) {
      const { walkersMock } = await import("./walkers.mock");
      return walkersMock.getBankAccount();
    }
    return api.get<WalkerBankAccount>("/walkers/me/bank-account").then((r) => r.data);
  },

  updateBankAccount: async (data: WalkerBankAccount): Promise<void> => {
    if (!isApiConfigured) {
      const { walkersMock } = await import("./walkers.mock");
      return walkersMock.updateBankAccount(data);
    }
    await api.patch("/walkers/me/bank-account", data);
  },

  getAvailability: async (walkerId: string): Promise<boolean> => {
    if (!isApiConfigured) {
      const { walkersMock } = await import("./walkers.mock");
      return walkersMock.getAvailability(walkerId);
    }
    return api
      .get<{ available: boolean }>(`/walkers/${walkerId}/availability`)
      .then((r) => r.data.available);
  },

  updateAvailability: async (walkerId: string, available: boolean): Promise<void> => {
    if (!isApiConfigured) {
      const { walkersMock } = await import("./walkers.mock");
      return walkersMock.updateAvailability(walkerId, available);
    }
    await api.patch(`/walkers/${walkerId}/availability`, { available });
  },

  getAvailable: async (filters: WalkerAvailabilityFilters): Promise<WalkerProfile[]> => {
    if (!isApiConfigured) {
      const { walkersMock } = await import("./walkers.mock");
      return walkersMock.getAvailable();
    }
    return api
      .get<WalkerProfile[]>("/walkers/available", { params: filters })
      .then((r) => r.data);
  },
};
