import type { WalkLocation } from "@/types";
import api, { isApiConfigured } from "@/services/api";

// The in-memory mock lives in tracking.mock.ts and is loaded dynamically so it
// (and mock-data) never reaches the client bundle when a real API is configured.
export const TrackingApi = {
  getLocation: async (walkId: string): Promise<WalkLocation | null> => {
    if (!isApiConfigured) {
      const { trackingMock } = await import("./tracking.mock");
      return trackingMock.getLocation(walkId);
    }
    return api
      .get<WalkLocation>(`/walks/${walkId}/location`)
      .then((r) => r.data)
      .catch(() => null);
  },

  // Walker reports their GPS position
  updateLocation: async (walkId: string, lat: number, lng: number): Promise<void> => {
    if (!isApiConfigured) {
      const { trackingMock } = await import("./tracking.mock");
      return trackingMock.updateLocation(walkId, lat, lng);
    }
    await api.patch(`/walks/${walkId}/location`, { lat, lng });
  },

  // Returns the full recorded GPS trail for a completed walk
  getRoute: async (walkId: string): Promise<[number, number][]> => {
    if (!isApiConfigured) {
      const { trackingMock } = await import("./tracking.mock");
      return trackingMock.getRoute(walkId);
    }
    return api
      .get<[number, number][]>(`/walks/${walkId}/route`)
      .then((r) => r.data);
  },
};
