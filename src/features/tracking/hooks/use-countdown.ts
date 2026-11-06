"use client";

import { useEffect, useState } from "react";

export function useCountdown(startedAt?: string | null, durationMinutes?: number) {
  // Derived from the clock on every tick (not seeded once in useState), so the
  // countdown is correct even when the walk loads after the first render.
  const endMs =
    startedAt && durationMinutes
      ? new Date(startedAt).getTime() + durationMinutes * 60 * 1000
      : null;
  const [now, setNow] = useState(() => Date.now());

  const remaining = endMs === null ? 0 : Math.max(0, Math.ceil((endMs - now) / 1000));
  const done = remaining === 0;

  useEffect(() => {
    if (endMs === null) return;
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= endMs) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [endMs]);

  const total = (durationMinutes ?? 0) * 60;
  const progress = total > 0 ? Math.min(100, ((total - remaining) / total) * 100) : 100;

  return { remaining, progress, done };
}
