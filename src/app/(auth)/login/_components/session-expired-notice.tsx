"use client";

import { useSearchParams } from "next/navigation";
import { SESSION_EXPIRED_MESSAGE, SESSION_EXPIRED_PARAM } from "@/lib/session-expiry";

// The expiry toast is lost in the reload to /login, so the login page repeats it
export function SessionExpiredNotice() {
  const searchParams = useSearchParams();
  if (!searchParams.has(SESSION_EXPIRED_PARAM)) return null;

  return (
    <p
      role="status"
      className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-400"
    >
      {SESSION_EXPIRED_MESSAGE}
    </p>
  );
}
