import { describe, expect, it } from "vitest";
import { resolveSheetSnap } from "./map-bottom-sheet";

describe("resolveSheetSnap", () => {
  it("keeps the current state after a small, slow drag", () => {
    expect(resolveSheetSnap({ expanded: false, dy: -20, velocity: -0.1 })).toBe(false);
    expect(resolveSheetSnap({ expanded: true, dy: 20, velocity: 0.1 })).toBe(true);
  });

  it("flips the state after a long drag", () => {
    expect(resolveSheetSnap({ expanded: false, dy: -60, velocity: -0.1 })).toBe(true);
    expect(resolveSheetSnap({ expanded: true, dy: 60, velocity: 0.1 })).toBe(false);
  });

  it("follows a fast flick even over a short distance", () => {
    expect(resolveSheetSnap({ expanded: false, dy: -10, velocity: -0.8 })).toBe(true);
    expect(resolveSheetSnap({ expanded: true, dy: -60, velocity: 0.8 })).toBe(false);
  });
});
