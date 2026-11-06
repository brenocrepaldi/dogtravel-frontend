"use client";

import { useEffect, useState } from "react";

/**
 * Current time in ms, refreshed every `intervalMs`.
 *
 * The first value is read from the clock in the state initializer, so it is
 * right on the first render; later values are only set from the interval
 * callback. Derive time-based values (countdowns, "is it time yet?") from the
 * returned value instead of calling Date.now() during render or setting state
 * synchronously inside an effect.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
