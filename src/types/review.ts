export interface WalkReview {
  walkId: string;
  walkerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  walkId: string;
  authorId: string;
  targetId: string;
  rating: number; // 1–5
  comment?: string;
  createdAt: string;
}
