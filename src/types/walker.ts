import type { DogSize } from "./pet";

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
