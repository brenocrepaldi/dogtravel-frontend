import type { UserRole } from "./common";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface LoginResponseDto {
  accessToken: string;
  /** Backend always rotates and returns a new refresh token on every login/refresh. */
  refreshToken: string;
  /** Unix timestamp (seconds) when the accessToken expires — always returned by backend. */
  expiresAt: number;
  user: User;
}

export interface ClientProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  memberSince: string;
  totalWalks: number;
  totalDogs: number;
  avgRatingGiven: number;
  dogs: {
    id: string;
    name: string;
    breed: string;
    age: number;
    size: string;
    gender: string;
    photoUrl?: string | null;
    notes?: string | null;
  }[];
  reviews: {
    walkId: string;
    rating: number;
    comment: string | null;
    walkerName: string;
    walkerAvatarUrl: string | null;
    scheduledAt: string;
    createdAt: string;
  }[];
}
