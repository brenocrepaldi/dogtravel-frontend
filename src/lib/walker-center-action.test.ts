import { describe, expect, it } from "vitest";
import { walkerCenterAction } from "./walker-center-action";

const now = new Date(2026, 10, 11, 14, 0); // 11 Nov 2026, 14:00 local
const at = (d: number, h: number) => new Date(2026, 10, d, h, 0).toISOString();
const walk = (id: string, status: string, scheduledAt: string) => ({ id, status, scheduledAt }) as const;

describe("walkerCenterAction", () => {
  it("points at the requests inbox when there is nothing going on", () => {
    expect(walkerCenterAction([], now)).toEqual({ kind: "requests", href: "/walk-requests", label: "Pedidos" });
  });

  it("points at live tracking while a walk is in progress, over everything else", () => {
    const walks = [walk("a", "accepted", at(11, 15)), walk("b", "in_progress", at(11, 13))];
    expect(walkerCenterAction(walks, now)).toEqual({ kind: "live", href: "/walks/b/tracking", label: "Ao vivo" });
  });

  it("points at the soonest accepted walk scheduled for today", () => {
    const walks = [walk("late", "accepted", at(11, 18)), walk("soon", "accepted", at(11, 15))];
    expect(walkerCenterAction(walks, now)).toEqual({ kind: "today", href: "/walks/soon", label: "Hoje" });
  });

  it("still counts an accepted walk from earlier today that hasn't started", () => {
    expect(walkerCenterAction([walk("x", "accepted", at(11, 9))], now).href).toBe("/walks/x");
  });

  it("ignores accepted walks on other days and walks in other states", () => {
    const walks = [
      walk("tomorrow", "accepted", at(12, 9)),
      walk("yesterday", "accepted", at(10, 9)),
      walk("done", "completed", at(11, 10)),
      walk("pending", "pending", at(11, 16)),
    ];
    expect(walkerCenterAction(walks, now).kind).toBe("requests");
  });
});
