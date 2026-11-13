import { describe, expect, it } from "vitest";
import { parseSection, summarizeProfile, type SectionKey, type SectionSummary } from "./profile-sections";

const byKey = (form: Parameters<typeof summarizeProfile>[0]) =>
  Object.fromEntries(summarizeProfile(form).map((s) => [s.key, s])) as Record<SectionKey, SectionSummary>;

describe("parseSection", () => {
  it("accepts only known sections", () => {
    expect(parseSection("horarios")).toBe("horarios");
    expect(parseSection("banco")).toBeNull();
    expect(parseSection(null)).toBeNull();
  });
});

describe("summarizeProfile", () => {
  it("marks essentials as missing and optionals as empty on a blank profile", () => {
    const s = byKey({});
    expect([s.sobre.state, s.local.state, s.horarios.state, s.portes.state]).toEqual([
      "missing", "missing", "missing", "missing",
    ]);
    expect([s.especialidades.state, s.tags.state]).toEqual(["empty", "empty"]);
  });

  it("reads each filled section back in one line", () => {
    const s = byKey({
      description: "  Passeio com calma.  ",
      location: "Pinheiros, São Paulo",
      serviceArea: "Vila Madalena",
      availability: [
        { day: "monday", start: "07:00", end: "18:00" },
        { day: "tuesday", start: "07:00", end: "18:00" },
      ],
      supportedSizes: ["large", "small"],
      behaviorExpertise: ["filhote"],
      tags: ["Pontual", "Calmo"],
    });
    expect(s.sobre.summary).toBe("Passeio com calma.");
    expect(s.local.summary).toBe("Pinheiros, São Paulo · atende Vila Madalena");
    expect(s.horarios.summary).toBe("Seg e Ter 07:00–18:00");
    expect(s.portes.summary).toBe("Pequeno, Grande");
    expect(s.especialidades.summary).toBe("Filhotes");
    expect(s.tags.summary).toBe("Pontual, Calmo");
    expect(Object.values(s).every((x) => x.state === "done")).toBe(true);
  });

  it("flags a working day without hours as incomplete", () => {
    const s = byKey({ availability: [{ day: "friday", start: "07:00", end: "" }] });
    expect(s.horarios).toMatchObject({ state: "incomplete", summary: "Sex sem horário" });
  });

  it("keeps the service area visible while the location is still missing", () => {
    expect(byKey({ serviceArea: "Perdizes" }).local).toMatchObject({
      state: "missing",
      summary: "Atende Perdizes",
    });
  });
});
