// What each part of the walker's professional profile is called, how it reads back in one
// line on the phone overview, and whether it's still missing.
import { groupAvailability } from "@/lib/availability";
import { DOG_SIZE_LABEL } from "@/lib/pets";
import type { DogSize, WalkerProfileUpdate } from "@/types";

export const SIZE_OPTIONS: { value: DogSize; label: string }[] = (
  ["small", "medium", "large", "giant"] as const
).map((value) => ({ value, label: DOG_SIZE_LABEL[value] }));

export const EXPERTISE_OPTIONS: { value: string; label: string }[] = [
  { value: "agitado",        label: "Agitados" },
  { value: "reativo",        label: "Reativos" },
  { value: "ansioso",        label: "Ansiosos" },
  { value: "filhote",        label: "Filhotes" },
  { value: "idoso",          label: "Idosos" },
  { value: "medicacao",      label: "Com medicação" },
  { value: "multiplos-caes", label: "Múltiplos cães" },
];

export const SECTION_KEYS = ["sobre", "local", "horarios", "portes", "especialidades", "tags"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_META: Record<SectionKey, { title: string; hint: string; optional: boolean }> = {
  sobre:          { title: "Sobre você",        hint: "O texto que os tutores leem no seu perfil",     optional: false },
  local:          { title: "Localização",       hint: "Onde você está e os bairros que atende",        optional: false },
  horarios:       { title: "Disponibilidade",   hint: "Dias e horários em que você aceita passeios",   optional: false },
  portes:         { title: "Portes atendidos",  hint: "Tamanhos de cão que você aceita passear",       optional: false },
  especialidades: { title: "Especialidades",    hint: "Comportamentos com que você tem experiência",   optional: true },
  tags:           { title: "Tags de destaque",  hint: "Palavras que aparecem no seu card",             optional: true },
};

export function parseSection(value: string | null): SectionKey | null {
  return SECTION_KEYS.find((k) => k === value) ?? null;
}

/** done: filled · missing: essential and empty · incomplete: filled but needs a fix · empty: optional and empty */
export type SectionState = "done" | "missing" | "incomplete" | "empty";

export interface SectionSummary {
  key: SectionKey;
  summary: string | null;
  state: SectionState;
}

function summaryFor(key: SectionKey, form: WalkerProfileUpdate): Omit<SectionSummary, "key"> {
  switch (key) {
    case "sobre": {
      const text = form.description?.trim();
      return text ? { summary: text, state: "done" } : { summary: null, state: "missing" };
    }
    case "local": {
      const location = form.location?.trim();
      const area = form.serviceArea?.trim();
      if (!location) return { summary: area ? `Atende ${area}` : null, state: "missing" };
      return { summary: area ? `${location} · atende ${area}` : location, state: "done" };
    }
    case "horarios": {
      const groups = groupAvailability(form.availability ?? []);
      if (groups.length === 0) return { summary: null, state: "missing" };
      return {
        summary: groups.map((g) => `${g.days} ${g.hours ?? "sem horário"}`).join(" · "),
        state: groups.every((g) => g.hours) ? "done" : "incomplete",
      };
    }
    case "portes": {
      const sizes = form.supportedSizes ?? [];
      if (sizes.length === 0) return { summary: null, state: "missing" };
      return {
        summary: SIZE_OPTIONS.filter((o) => sizes.includes(o.value)).map((o) => o.label).join(", "),
        state: "done",
      };
    }
    case "especialidades": {
      const chosen = EXPERTISE_OPTIONS.filter((o) => form.behaviorExpertise?.includes(o.value));
      return chosen.length
        ? { summary: chosen.map((o) => o.label).join(", "), state: "done" }
        : { summary: null, state: "empty" };
    }
    case "tags": {
      const tags = form.tags ?? [];
      return tags.length ? { summary: tags.join(", "), state: "done" } : { summary: null, state: "empty" };
    }
  }
}

export function summarizeProfile(form: WalkerProfileUpdate): SectionSummary[] {
  return SECTION_KEYS.map((key) => ({ key, ...summaryFor(key, form) }));
}
