import { describe, expect, it } from "vitest";
import { groupAvailability } from "./availability";
import type { AvailabilitySlot } from "@/types";

const slot = (day: AvailabilitySlot["day"], start = "07:00", end = "18:00"): AvailabilitySlot => ({
  day,
  start,
  end,
});

describe("groupAvailability", () => {
  it("returns no groups when no day is active", () => {
    expect(groupAvailability([])).toEqual([]);
  });

  it("joins a run of consecutive days with the same hours into a range", () => {
    const week = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
    expect(groupAvailability(week.map((d) => slot(d)))).toEqual([
      { days: "Seg a Sex", hours: "07:00–18:00" },
    ]);
  });

  it("names two consecutive days with 'e' and a single day alone", () => {
    expect(
      groupAvailability([slot("saturday", "08:00", "14:00"), slot("monday"), slot("tuesday")]),
    ).toEqual([
      { days: "Seg e Ter", hours: "07:00–18:00" },
      { days: "Sáb", hours: "08:00–14:00" },
    ]);
  });

  it("splits a run when the hours change or a day is skipped", () => {
    expect(
      groupAvailability([
        slot("monday"),
        slot("tuesday", "09:00", "17:00"),
        slot("thursday", "09:00", "17:00"),
      ]),
    ).toEqual([
      { days: "Seg", hours: "07:00–18:00" },
      { days: "Ter", hours: "09:00–17:00" },
      { days: "Qui", hours: "09:00–17:00" },
    ]);
  });

  it("flags a day whose hours aren't complete", () => {
    expect(groupAvailability([slot("friday", "07:00", "")])).toEqual([
      { days: "Sex", hours: null },
    ]);
  });
});
