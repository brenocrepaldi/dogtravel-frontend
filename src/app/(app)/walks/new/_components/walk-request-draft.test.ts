import { beforeEach, describe, expect, it } from "vitest";
import { DRAFT_MAX_AGE_MS, saveWalkRequestDraft, takeWalkRequestDraft } from "./walk-request-draft";

const draft = { selectedPetIds: ["p1", "p2"], notes: "Puxa a coleira", selectedWalkerId: "w1" };

describe("walk request draft", () => {
  beforeEach(() => sessionStorage.clear());

  it("gives back the saved draft once, then nothing", () => {
    saveWalkRequestDraft(draft, 1_000);

    expect(takeWalkRequestDraft(2_000)).toEqual(draft);
    expect(takeWalkRequestDraft(2_000)).toBeNull();
  });

  it("drops a draft that was abandoned for too long", () => {
    saveWalkRequestDraft(draft, 1_000);

    expect(takeWalkRequestDraft(1_000 + DRAFT_MAX_AGE_MS + 1)).toBeNull();
  });

  it("ignores a malformed entry", () => {
    sessionStorage.setItem("dogtravel:walk-request-draft", "{not json");

    expect(takeWalkRequestDraft()).toBeNull();
  });
});
