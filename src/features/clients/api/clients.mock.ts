import type { ClientProfile } from "@/types";

// Mock backend, loaded only when no real API is configured.
export const clientsMock = {
  getById: async (clientId: string): Promise<ClientProfile> => ({
    id: clientId,
    name: "Cliente Demo",
    avatarUrl: null,
    memberSince: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    totalWalks: 4,
    totalDogs: 1,
    avgRatingGiven: 4.8,
    dogs: [
      { id: "d1", name: "Thor", breed: "Golden Retriever", age: 3, size: "large", gender: "male", photoUrl: null },
    ],
    reviews: [],
  }),
};
