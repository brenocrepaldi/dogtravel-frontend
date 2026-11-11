import { describe, expect, it } from "vitest";
import type { WalkRecord } from "@/types";
import { findNextWalk } from "./next-walk-card";

const now = new Date(2026, 10, 11, 14, 0);
const walk = (id: string, status: string, d: number, h: number) =>
  ({ id, status, scheduledAt: new Date(2026, 10, d, h).toISOString() }) as WalkRecord;

describe("findNextWalk", () => {
  it("picks the soonest accepted walk from today on, including earlier today", () => {
    const walks = [walk("later", "accepted", 13, 9), walk("morning", "accepted", 11, 8), walk("tomorrow", "accepted", 12, 9)];
    expect(findNextWalk(walks, now)?.id).toBe("morning");
  });

  it("ignores past days and other statuses", () => {
    const walks = [walk("old", "accepted", 10, 9), walk("pending", "pending", 12, 9), walk("done", "completed", 11, 9)];
    expect(findNextWalk(walks, now)).toBeUndefined();
  });
});
