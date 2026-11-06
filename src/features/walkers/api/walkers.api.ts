import type { EarningsParams, PaymentHistoryItem, WalkerBankAccount, WalkerProfile, WalkerProfileUpdate, WalkerPublicReview } from "@/types";
import api, { isApiConfigured } from "@/services/api";

// Module-level mutable stores — lazily populated via dynamic import so
// mock-data.ts never reaches the client bundle when a real API is configured.
let availabilityStore: Record<string, boolean> | null = null;
let myWalkerProfileStore: WalkerProfile | null = null;
let myBankAccountStore: WalkerBankAccount | null = null;

async function getAvailabilityStore(): Promise<Record<string, boolean>> {
  if (!availabilityStore) {
    const { walkerAvailability } = await import("@/lib/mock-data");
    availabilityStore = { ...walkerAvailability };
  }
  return availabilityStore;
}

async function getBankAccountStore(): Promise<WalkerBankAccount> {
  if (!myBankAccountStore) {
    const { walkerBankAccountDefault } = await import("@/lib/mock-data");
    myBankAccountStore = { ...walkerBankAccountDefault };
  }
  return myBankAccountStore;
}

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
      const { walkers } = await import("@/lib/mock-data");
      if (!filters) return walkers;

      const { query = "", size = "" } = filters;
      return walkers.filter((w) => {
        const textSource =
          `${w.name} ${w.location} ${w.tags.join(" ")} ${w.behaviorExpertise.join(" ")}`.toLowerCase();
        const matchesQuery = !query.trim() || textSource.includes(query.toLowerCase());
        const matchesSize = !size || w.supportedSizes.includes(size as WalkerProfile["supportedSizes"][number]);
        return matchesQuery && matchesSize;
      });
    }
    return api
      .get<WalkerProfile[]>("/walkers", { params: filters })
      .then((r) => r.data);
  },

  getReviews: async (walkerId: string): Promise<WalkerPublicReview[]> => {
    if (!isApiConfigured) {
      const { walkerPublicReviews } = await import("@/lib/mock-data");
      return walkerPublicReviews[walkerId] ?? [];
    }
    return api
      .get<WalkerPublicReview[]>(`/walkers/${walkerId}/reviews`)
      .then((r) => r.data);
  },

  getById: async (id: string): Promise<WalkerProfile | undefined> => {
    if (!isApiConfigured) {
      const { walkers } = await import("@/lib/mock-data");
      return walkers.find((w) => w.id === id);
    }
    return api.get<WalkerProfile>(`/walkers/${id}`).then((r) => r.data);
  },

  getMe: async (): Promise<WalkerProfile | null> => {
    if (!isApiConfigured) {
      if (myWalkerProfileStore) return myWalkerProfileStore;
      const { walkers } = await import("@/lib/mock-data");
      return walkers[0] ? { ...walkers[0] } : null;
    }
    return api.get<WalkerProfile>("/walkers/me").then((r) => r.data);
  },

  updateMe: async (data: WalkerProfileUpdate): Promise<void> => {
    if (!isApiConfigured) {
      const { walkers } = await import("@/lib/mock-data");
      const base = myWalkerProfileStore ?? walkers[0];
      if (base) myWalkerProfileStore = { ...base, ...data };
      return;
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
      const { walkerEarningsHistory } = await import("@/lib/mock-data");
      return [...walkerEarningsHistory];
    }
    return api
      .get<PaymentHistoryItem[]>("/walkers/me/earnings", { params })
      .then((r) => r.data);
  },

  getBankAccount: async (): Promise<WalkerBankAccount> => {
    if (!isApiConfigured) {
      return { ...(await getBankAccountStore()) };
    }
    return api.get<WalkerBankAccount>("/walkers/me/bank-account").then((r) => r.data);
  },

  updateBankAccount: async (data: WalkerBankAccount): Promise<void> => {
    if (!isApiConfigured) {
      myBankAccountStore = { ...data };
      return;
    }
    await api.patch("/walkers/me/bank-account", data);
  },

  getAvailability: async (walkerId: string): Promise<boolean> => {
    if (!isApiConfigured) {
      const store = await getAvailabilityStore();
      return store[walkerId] ?? false;
    }
    return api
      .get<{ available: boolean }>(`/walkers/${walkerId}/availability`)
      .then((r) => r.data.available);
  },

  updateAvailability: async (walkerId: string, available: boolean): Promise<void> => {
    if (!isApiConfigured) {
      const store = await getAvailabilityStore();
      store[walkerId] = available;
      return;
    }
    await api.patch(`/walkers/${walkerId}/availability`, { available });
  },

  getAvailable: async (filters: WalkerAvailabilityFilters): Promise<WalkerProfile[]> => {
    if (!isApiConfigured) {
      const [{ walkers }, store] = await Promise.all([
        import("@/lib/mock-data"),
        getAvailabilityStore(),
      ]);
      return walkers.filter((w) => store[w.id] === true);
    }
    return api
      .get<WalkerProfile[]>("/walkers/available", { params: filters })
      .then((r) => r.data);
  },
};
