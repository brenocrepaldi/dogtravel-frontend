import type { GeoLocation } from "./common";

export interface WalkRequestDog {
  id: string;
  name: string;
  breed: string;
  age: number;
  size: string;
  gender: string;
  photoUrl: string | null;
  notes: string | null;
}

export interface WalkRequestDetail {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatarUrl: string | null;
  clientMemberSince: string;
  petNames: string[];
  petIds: string[];
  dogs: WalkRequestDog[];
  durationMinutes: number;
  price: number;
  scheduledAt: string;
  scheduledLabel: string;
  startAddress: string;
  startLat: number | null;
  startLng: number | null;
  receivedMinutes: number;
}

export interface WalkRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatarUrl: string | null;
  petNames: string[];
  petIds: string[];
  petPhotos: { id: string; photoUrl: string | null }[];
  durationMinutes: number;
  price: number;
  scheduledAt: string;
  scheduledLabel: string;
  startAddress: string;
  receivedMinutes: number;
}

export interface WalkParticipant {
  id: string;
  name: string;
  role: "client" | "walker";
  phone?: string;
}

export interface WalkTimelineEvent {
  id: string;
  label: string;
  at: string;
  state: "done" | "current" | "pending";
  note?: string;
}

export interface WalkRecord {
  id: string;
  walkerId: string | null;
  clientId?: string;
  clientName: string;
  clientAvatarUrl?: string | null;
  walkerAvatarUrl?: string | null;
  petIds?: string[];
  petNames: string[];
  pets?: { name: string; photoUrl?: string | null }[];
  status: WalkStatus;
  dateLabel: string;
  scheduledAt: string;
  durationMinutes: number;
  price: number;
  distanceKm: number;
  startAddress: string;
  endAddress?: string;
  notes?: string;
  paymentMethodId?: string;
  participants: WalkParticipant[];
  timeline: WalkTimelineEvent[];
  startCode?: string;
  startedAt?: string | null;
  startLat?: number;
  startLng?: number;
  hasReview?: boolean;
}

export type WalkStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Walk {
  id: string;
  clientId: string;
  walkerId?: string;
  petIds: string[];
  status: WalkStatus;
  scheduledAt: string;
  durationMinutes: number;
  startLocation: GeoLocation;
  endLocation?: GeoLocation;
  price: number;
  paymentMethodId?: string;
  paymentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalkLocation {
  walkId: string;
  lat: number;
  lng: number;
  updatedAt: string;
}

/**
 * Payload sent by the client to create a new walk request (POST /walks).
 * Contains only client-supplied fields — the backend derives id, status,
 * clientName, dateLabel, distanceKm, participants, and timeline from
 * the JWT session and its own state.
 */
export interface CreateWalkDto {
  petIds: string[];
  petNames: string[];
  scheduledAt: string;
  durationMinutes: number;
  price: number;
  startAddress: string;
  paymentMethodId: string;
  walkerId?: string;
  lat?: number;
  lng?: number;
  notes?: string;
}

export interface WalkEstimateDto {
  petIds: string[];
  durationMinutes: number;
  location: GeoLocation;
}

export interface WalkEstimateRequest {
  durationMinutes: number;
  petCount: number;
  isFirstRide: boolean;
}

export interface WalkEstimateResult {
  durationBase: number;
  extraPetFee: number;
  platformAndSafetyFee: number;
  firstRideDiscount: number;
  total: number;
}
