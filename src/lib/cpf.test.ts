import { describe, expect, it } from "vitest";
import { isValidCPF, maskCPF } from "./cpf";

describe("maskCPF", () => {
  it("formats progressively while typing", () => {
    expect(maskCPF("529")).toBe("529");
    expect(maskCPF("5299")).toBe("529.9");
    expect(maskCPF("529982")).toBe("529.982");
    expect(maskCPF("5299822")).toBe("529.982.2");
    expect(maskCPF("529982247")).toBe("529.982.247");
    expect(maskCPF("5299822472")).toBe("529.982.247-2");
    expect(maskCPF("52998224725")).toBe("529.982.247-25");
  });

  it("ignores non-digits and drops digits beyond the 11th", () => {
    expect(maskCPF("529.982.247-25")).toBe("529.982.247-25");
    expect(maskCPF("abc529x982y247z25")).toBe("529.982.247-25");
    expect(maskCPF("5299822472599")).toBe("529.982.247-25");
  });

  it("returns an empty string for empty or non-numeric input", () => {
    expect(maskCPF("")).toBe("");
    expect(maskCPF("abc")).toBe("");
  });
});

describe("isValidCPF", () => {
  it("accepts valid CPFs, with or without punctuation", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
    expect(isValidCPF("52998224725")).toBe(true);
    expect(isValidCPF("111.444.777-35")).toBe(true);
  });

  it("rejects a wrong check digit", () => {
    expect(isValidCPF("529.982.247-26")).toBe(false);
    expect(isValidCPF("529.982.247-35")).toBe(false);
  });

  it("rejects the wrong length", () => {
    expect(isValidCPF("")).toBe(false);
    expect(isValidCPF("529.982.247")).toBe(false);
    expect(isValidCPF("529982247255")).toBe(false);
  });

  it("rejects sequences of the same digit", () => {
    for (let d = 0; d <= 9; d++) {
      expect(isValidCPF(String(d).repeat(11))).toBe(false);
    }
  });
});
