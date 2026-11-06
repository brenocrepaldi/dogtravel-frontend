/**
 * Global TypeScript types and interfaces for DogTravel.
 */

// ─── User Roles ───────────────────────────────────────────────────────────────
export type UserRole = "client" | "walker";

// ─── Walk Domain (formerly in mock-data) ─────────────────────────────────────

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

export interface WalkReview {
  walkId: string;
  walkerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

// ─── Walker Domain ────────────────────────────────────────────────────────────

export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface AvailabilitySlot {
  day: DayKey;
  start: string; // "07:00"
  end: string;   // "19:00"
}

export interface WalkerCertification {
  title: string;
  verified: boolean;
}

export interface WalkerProfile {
  id: string;
  name: string;
  avatarUrl?: string | null;
  rating: number;
  reviews: number;
  location: string;
  serviceArea: string;
  description: string;
  tags: string[];
  verified: boolean;
  availability: AvailabilitySlot[];
  completedWalks: number;
  joinedAt: string;
  trustChecks: {
    identityVerified: boolean;
    backgroundCheck: boolean;
  };
  certifications: WalkerCertification[];
  supportedSizes: DogSize[];
  behaviorExpertise: string[];
}

export interface WalkerProfileUpdate {
  description?: string;
  location?: string;
  serviceArea?: string;
  availability?: AvailabilitySlot[];
  tags?: string[];
  supportedSizes?: DogSize[];
  behaviorExpertise?: string[];
}

export interface WalkerPublicReview {
  id: string;
  walkId: string;
  rating: number;
  comment: string | null;
  clientName: string;
  createdAt: string;
}

export interface WalkerBankAccount {
  bankName: string;
  accountType: 'checking' | 'savings';
  branch: string;
  accountNumber: string;
  holderName: string;
  holderDocument: string;
  pixKey?: string;
}

// ─── Payment Domain (extended) ────────────────────────────────────────────────

export interface ManagedPaymentMethod {
  id: string;
  type: PaymentMethodType;
  brand: string | null;
  label: string;
  holderName: string;
  expiresAt: string;
  isDefault: boolean;
  status: "active" | "expired";
}

export interface PaymentHistoryItem {
  id: string;
  walkId: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  methodId: string | null;
  description: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────
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

// ─── Pet ──────────────────────────────────────────────────────────────────────
export type DogSize = "small" | "medium" | "large" | "giant";
export type DogGender = "male" | "female";

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  age: number;
  size: DogSize;
  gender: DogGender;
  photoUrl?: string;
  notes?: string;
}

// ─── Walk ─────────────────────────────────────────────────────────────────────
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

// ─── Geolocation ──────────────────────────────────────────────────────────────
export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  walkId: string;
  authorId: string;
  targetId: string;
  rating: number; // 1–5
  comment?: string;
  createdAt: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  walkId: string;
  senderId: string;
  text: string;
  sentAt: string;
  read: boolean;
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export interface Payment {
  id: string;
  walkId: string;
  clientId: string;
  walkerId: string;
  amount: number; // in cents (BRL)
  currency: string; // "BRL"
  status: PaymentStatus;
  methodId?: string;
  paidAt?: string;
  createdAt: string;
}

// ─── Payment Method ───────────────────────────────────────────────────────────
export type PaymentMethodType = "credit_card" | "debit_card" | "pix";

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  /** Last 4 digits for cards, or "PIX" key label */
  label: string;
  brand?: string; // "visa" | "mastercard" | etc.
  isDefault: boolean;
  createdAt: string;
}

// ─── Price Breakdown ──────────────────────────────────────────────────────────
export interface PriceBreakdown {
  baseRate: number;       // per-minute rate
  durationMinutes: number;
  subtotal: number;
  platformFee: number;    // platform cut
  total: number;
  currency: string;
}

// ─── Document Verification ───────────────────────────────────────────────────

export type DocStatus = "idle" | "pending" | "verified" | "rejected";

export interface WalkerCertDocument {
  id: string;
  title: string;
  fileName: string;
  status: DocStatus;
}

// ─── Document Verification Status (full, from API) ───────────────────────────
export interface DocumentsStatus {
  identity: DocStatus;
  background: DocStatus;
  certificates: WalkerCertDocument[];
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface ClientStats {
  totalWalks: number;
  rating: number;
  totalReviews: number;
}

export interface WalkerStats {
  totalWalks: number;
  walksThisMonth: number;
  rating: number;
  totalReviews: number;
  earningsToday: number;
  earningsMonth: number;
}

// ─── Walk Location (GPS) ──────────────────────────────────────────────────────
export interface WalkLocation {
  walkId: string;
  lat: number;
  lng: number;
  updatedAt: string;
}

// ─── Auth DTOs ────────────────────────────────────────────────────────────────
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

// ─── Earnings ─────────────────────────────────────────────────────────────────
export interface EarningsSummary {
  totalEarned: number;
  totalWalks: number;
  pendingPayout: number;
  currency: string;
  breakdown: {
    period: string;
    amount: number;
    walks: number;
  }[];
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

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

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface EarningsParams extends PaginationParams {
  from?: string;
  to?: string;
}
