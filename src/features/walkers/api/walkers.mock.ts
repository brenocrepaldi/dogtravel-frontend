import {
  walkers,
  walkerAvailability,
  walkerBankAccountDefault,
  walkerEarningsHistory,
  walkerPublicReviews,
} from "@/lib/mock/mock-data";
import type { PaymentHistoryItem, WalkerBankAccount, WalkerProfile, WalkerProfileUpdate, WalkerPublicReview } from "@/types";
import type { WalkerFilters } from "./walkers.api";

// In-memory mock backend, loaded only when no real API is configured.
let availabilityStore: Record<string, boolean> | null = null;
let myWalkerProfileStore: WalkerProfile | null = null;
let myBankAccountStore: WalkerBankAccount | null = null;

function getAvailabilityStore(): Record<string, boolean> {
  if (!availabilityStore) {
    availabilityStore = { ...walkerAvailability };
  }
  return availabilityStore;
}

function getBankAccountStore(): WalkerBankAccount {
  if (!myBankAccountStore) {
    myBankAccountStore = { ...walkerBankAccountDefault };
  }
  return myBankAccountStore;
}

export const walkersMock = {
  list: async (filters?: WalkerFilters): Promise<WalkerProfile[]> => {
    if (!filters) return walkers;

    const { query = "", size = "" } = filters;
    return walkers.filter((w) => {
      const textSource =
        `${w.name} ${w.location} ${w.tags.join(" ")} ${w.behaviorExpertise.join(" ")}`.toLowerCase();
      const matchesQuery = !query.trim() || textSource.includes(query.toLowerCase());
      const matchesSize = !size || w.supportedSizes.includes(size as WalkerProfile["supportedSizes"][number]);
      return matchesQuery && matchesSize;
    });
  },

  getReviews: async (walkerId: string): Promise<WalkerPublicReview[]> =>
    walkerPublicReviews[walkerId] ?? [],

  getById: async (id: string): Promise<WalkerProfile | undefined> =>
    walkers.find((w) => w.id === id),

  getMe: async (): Promise<WalkerProfile | null> => {
    if (myWalkerProfileStore) return myWalkerProfileStore;
    return walkers[0] ? { ...walkers[0] } : null;
  },

  updateMe: async (data: WalkerProfileUpdate): Promise<void> => {
    const base = myWalkerProfileStore ?? walkers[0];
    if (base) myWalkerProfileStore = { ...base, ...data };
  },

  getEarnings: async (): Promise<PaymentHistoryItem[]> => [...walkerEarningsHistory],

  getBankAccount: async (): Promise<WalkerBankAccount> => ({ ...getBankAccountStore() }),

  updateBankAccount: async (data: WalkerBankAccount): Promise<void> => {
    myBankAccountStore = { ...data };
  },

  getAvailability: async (walkerId: string): Promise<boolean> => {
    const store = getAvailabilityStore();
    return store[walkerId] ?? false;
  },

  updateAvailability: async (walkerId: string, available: boolean): Promise<void> => {
    const store = getAvailabilityStore();
    store[walkerId] = available;
  },

  getAvailable: async (): Promise<WalkerProfile[]> => {
    const store = getAvailabilityStore();
    return walkers.filter((w) => store[w.id] === true);
  },
};
