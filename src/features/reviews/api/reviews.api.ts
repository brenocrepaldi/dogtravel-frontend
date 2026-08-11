import type { WalkReview } from "@/types";
import api, { isApiConfigured } from "@/services/api";

// Module-level mutable store — lazily populated via dynamic import so
// mock-data.ts never reaches the client bundle when a real API is configured.
let reviewsStore: WalkReview[] | null = null;

async function getReviewsStore(): Promise<WalkReview[]> {
  if (!reviewsStore) {
    const { walkReviews } = await import("@/lib/mock-data");
    reviewsStore = [...walkReviews];
  }
  return reviewsStore;
}

export const ReviewsApi = {
  getByWalkId: async (walkId: string): Promise<WalkReview | null> => {
    if (!isApiConfigured) {
      const store = await getReviewsStore();
      return store.find((r) => r.walkId === walkId) ?? null;
    }
    return api
      .get<WalkReview | null>(`/walks/${walkId}/review`)
      .then((r) => r.data)
      .catch(() => null);
  },

  submit: async (walkId: string, payload: { rating: number; comment: string; walkerId?: string }): Promise<WalkReview> => {
    const { walkerId, ...reviewPayload } = payload;
    if (!isApiConfigured) {
      const store = await getReviewsStore();
      const existing = store.find((r) => r.walkId === walkId);
      if (existing) {
        reviewsStore = store.map((r) =>
          r.walkId === walkId ? { ...r, ...reviewPayload } : r
        );
        return { ...existing, ...reviewPayload };
      }
      const newReview: WalkReview = {
        walkId,
        walkerId: walkerId ?? "",
        rating: reviewPayload.rating,
        comment: reviewPayload.comment,
        createdAt: new Date().toISOString(),
      };
      reviewsStore = [newReview, ...store];
      return newReview;
    }
    return api
      .post<WalkReview>(`/walks/${walkId}/review`, reviewPayload)
      .then((r) => r.data);
  },

  update: async (walkId: string, payload: { rating: number; comment: string }): Promise<WalkReview> => {
    if (!isApiConfigured) {
      const store = await getReviewsStore();
      reviewsStore = store.map((r) =>
        r.walkId === walkId ? { ...r, ...payload } : r
      );
      return reviewsStore.find((r) => r.walkId === walkId)!;
    }
    return api
      .patch<WalkReview>(`/walks/${walkId}/review`, payload)
      .then((r) => r.data);
  },
};
