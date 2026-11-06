import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/api", () => ({ default: { get: vi.fn() }, isApiConfigured: false }));

import { WalksApi } from "./walks.api";

describe("WalksApi.getRequestById (mock mode)", () => {
  it("builds the detail, including the dogs, from the seeded request", async () => {
    const detail = await WalksApi.getRequestById("req-2");

    expect(detail.id).toBe("req-2");
    expect(detail.dogs.map((d) => d.name)).toEqual(detail.petNames);
    expect(detail.dogs).toHaveLength(2);
    expect(detail.dogs[0]).toMatchObject({ id: detail.petIds[0], name: "Mel", breed: "Poodle" });
  });

  it("falls back to default dog data for pets that are not in the seed", async () => {
    const detail = await WalksApi.getRequestById("req-2");
    expect(detail.dogs[1]).toMatchObject({ name: "Bob", breed: "SRD" });
  });

  it("rejects when the request does not exist", async () => {
    await expect(WalksApi.getRequestById("nope")).rejects.toThrow("not found");
  });
});
