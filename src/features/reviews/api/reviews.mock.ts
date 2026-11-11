import { walkReviews } from "@/lib/mock/mock-data";
import type { WalkReview } from "@/types";

// In-memory mock backend, loaded only when no real API is configured.
let reviewsStore: WalkReview[] | null = null;

function getReviewsStore(): WalkReview[] {
  if (!reviewsStore) {
    reviewsStore = [...walkReviews];
  }
  return reviewsStore;
}

export const reviewsMock = {
  getByWalkId: async (walkId: string): Promise<WalkReview | null> => {
    const store = getReviewsStore();
    return store.find((r) => r.walkId === walkId) ?? null;
  },

  submit: async (
    walkId: string,
    payload: { rating: number; comment: string; walkerId?: string }
  ): Promise<WalkReview> => {
    const { walkerId, ...reviewPayload } = payload;
    const store = getReviewsStore();
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
  },

  update: async (
    walkId: string,
    payload: { rating: number; comment: string }
  ): Promise<WalkReview> => {
    const store = getReviewsStore();
    reviewsStore = store.map((r) =>
      r.walkId === walkId ? { ...r, ...payload } : r
    );
    return reviewsStore.find((r) => r.walkId === walkId)!;
  },
};
