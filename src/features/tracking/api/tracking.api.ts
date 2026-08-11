import type { WalkLocation } from "@/types";
import api, { isApiConfigured } from "@/services/api";

// Module-level mutable store — lazily populated via dynamic import so
// mock-data.ts never reaches the client bundle when a real API is configured.
let locationStore: Record<string, WalkLocation> | null = null;

async function getLocationStore(): Promise<Record<string, WalkLocation>> {
  if (!locationStore) {
    const { walkLocations } = await import("@/lib/mock-data");
    locationStore = { ...walkLocations };
  }
  return locationStore;
}

export const TrackingApi = {
  getLocation: async (walkId: string): Promise<WalkLocation | null> => {
    if (!isApiConfigured) {
      const store = await getLocationStore();
      return store[walkId] ?? null;
    }
    return api
      .get<WalkLocation>(`/walks/${walkId}/location`)
      .then((r) => r.data)
      .catch(() => null);
  },

  // Walker reports their GPS position
  updateLocation: async (walkId: string, lat: number, lng: number): Promise<void> => {
    if (!isApiConfigured) {
      const store = await getLocationStore();
      store[walkId] = { walkId, lat, lng, updatedAt: new Date().toISOString() };
      return;
    }
    await api.patch(`/walks/${walkId}/location`, { lat, lng });
  },

  // Returns the full recorded GPS trail for a completed walk
  getRoute: async (walkId: string): Promise<[number, number][]> => {
    if (!isApiConfigured) {
      const { walkRoutes, liveTrackingRoute } = await import("@/lib/mock-data");
      return walkRoutes[walkId] ?? liveTrackingRoute;
    }
    return api
      .get<[number, number][]>(`/walks/${walkId}/route`)
      .then((r) => r.data);
  },
};
