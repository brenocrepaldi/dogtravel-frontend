import api, { isApiConfigured } from "@/services/api";
import type { ClientProfile } from "@/types";

export const ClientsApi = {
  getById: async (clientId: string): Promise<ClientProfile> => {
    if (!isApiConfigured) {
      return {
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
      };
    }
    return api.get<ClientProfile>(`/clients/${clientId}`).then((r) => r.data);
  },
};
