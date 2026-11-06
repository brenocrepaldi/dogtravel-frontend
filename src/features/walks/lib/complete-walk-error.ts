import { isAxiosError } from "axios";

export interface CompleteWalkError {
  code?: string;
  remainingSeconds?: number;
  distanceMeters?: number;
}

/** Reads the error payload the API returns when completing a walk fails. */
export function readCompleteWalkError(err: unknown): CompleteWalkError {
  if (!isAxiosError<CompleteWalkError & { error?: string }>(err)) return {};
  const data = err.response?.data;
  return {
    code: data?.error,
    remainingSeconds: data?.remainingSeconds,
    distanceMeters: data?.distanceMeters,
  };
}
