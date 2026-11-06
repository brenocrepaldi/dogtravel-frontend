export const DURATION_BASE_PRICE: Record<number, number> = {
  15: 12,
  30: 18,
  45: 24,
  60: 27,
};

export const EXTRA_PET_FEE = 4;
export const PLATFORM_AND_SAFETY_FEE_RATE = 0.08;
export const FIRST_RIDE_DISCOUNT_RATE = 0.15;

// Sentinel ID for the instant PIX payment option — replaced by a real charge ID from the payments API.
export const PIX_INSTANT_ID = "pix_instant";
