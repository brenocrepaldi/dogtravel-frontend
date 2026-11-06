import type { WalkReview } from "@/types";
import api, { isApiConfigured } from "@/services/api";

// The in-memory mock lives in reviews.mock.ts and is loaded dynamically so it
// (and mock-data) never reaches the client bundle when a real API is configured.
export const ReviewsApi = {
  getByWalkId: async (walkId: string): Promise<WalkReview | null> => {
    if (!isApiConfigured) {
      const { reviewsMock } = await import("./reviews.mock");
      return reviewsMock.getByWalkId(walkId);
    }
    return api
      .get<WalkReview | null>(`/walks/${walkId}/review`)
      .then((r) => r.data)
      .catch(() => null);
  },

  submit: async (walkId: string, payload: { rating: number; comment: string; walkerId?: string }): Promise<WalkReview> => {
    if (!isApiConfigured) {
      const { reviewsMock } = await import("./reviews.mock");
      return reviewsMock.submit(walkId, payload);
    }
    const reviewPayload = { rating: payload.rating, comment: payload.comment };
    return api
      .post<WalkReview>(`/walks/${walkId}/review`, reviewPayload)
      .then((r) => r.data);
  },

  update: async (walkId: string, payload: { rating: number; comment: string }): Promise<WalkReview> => {
    if (!isApiConfigured) {
      const { reviewsMock } = await import("./reviews.mock");
      return reviewsMock.update(walkId, payload);
    }
    return api
      .patch<WalkReview>(`/walks/${walkId}/review`, payload)
      .then((r) => r.data);
  },
};
