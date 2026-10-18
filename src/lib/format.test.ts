import { describe, expect, it } from "vitest";
import { formatBRL, getGreeting, getInitials } from "./format";

describe("formatBRL", () => {
  it("formats with two decimals and a comma, matching the existing toFixed output", () => {
    expect(formatBRL(55)).toBe("R$ 55,00");
    expect(formatBRL(24.5)).toBe("R$ 24,50");
  });

  it("formats zero with cents", () => {
    expect(formatBRL(0)).toBe("R$ 0,00");
  });
});

describe("getInitials", () => {
  it("takes the first letter of the first two words, uppercased", () => {
    expect(getInitials("João Vitor Barbosa")).toBe("JV");
    expect(getInitials("ana paula")).toBe("AP");
  });

  it("returns a single letter for a single name", () => {
    expect(getInitials("Ana")).toBe("A");
  });
});

describe("getGreeting", () => {
  const at = (hour: number, minute = 0) => new Date(2026, 9, 18, hour, minute);

  it("says Bom dia before noon", () => {
    expect(getGreeting(at(0))).toBe("Bom dia");
    expect(getGreeting(at(11, 59))).toBe("Bom dia");
  });

  it("says Boa tarde from noon until 18h", () => {
    expect(getGreeting(at(12))).toBe("Boa tarde");
    expect(getGreeting(at(17, 59))).toBe("Boa tarde");
  });

  it("says Boa noite from 18h", () => {
    expect(getGreeting(at(18))).toBe("Boa noite");
    expect(getGreeting(at(23, 59))).toBe("Boa noite");
  });
});
