import type { PaginationParams } from "./common";

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

export interface PriceBreakdown {
  baseRate: number;       // per-minute rate
  durationMinutes: number;
  subtotal: number;
  platformFee: number;    // platform cut
  total: number;
  currency: string;
}

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

export interface EarningsParams extends PaginationParams {
  from?: string;
  to?: string;
}
