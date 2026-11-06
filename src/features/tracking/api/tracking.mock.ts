import { walkLocations, walkRoutes, liveTrackingRoute } from "@/lib/mock/mock-data";
import type { WalkLocation } from "@/types";

// In-memory mock backend, loaded only when no real API is configured.
let locationStore: Record<string, WalkLocation> | null = null;

function getLocationStore(): Record<string, WalkLocation> {
  if (!locationStore) {
    locationStore = { ...walkLocations };
  }
  return locationStore;
}

export const trackingMock = {
  getLocation: async (walkId: string): Promise<WalkLocation | null> => {
    const store = getLocationStore();
    return store[walkId] ?? null;
  },

  updateLocation: async (walkId: string, lat: number, lng: number): Promise<void> => {
    const store = getLocationStore();
    store[walkId] = { walkId, lat, lng, updatedAt: new Date().toISOString() };
  },

  getRoute: async (walkId: string): Promise<[number, number][]> =>
    walkRoutes[walkId] ?? liveTrackingRoute,
};
