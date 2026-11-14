/**
 * Step 1 of the walk request survives a round trip to /walkers (where the client picks a
 * walker) by being parked in sessionStorage: saved right before leaving, taken (and
 * cleared) when /walks/new mounts again. Storage can be unavailable (private mode,
 * blocked site data), so every access is best-effort and the flow still works without it.
 */

const STORAGE_KEY = "dogtravel:walk-request-draft";
/** A draft older than this was abandoned; don't resurrect it on some later visit. */
export const DRAFT_MAX_AGE_MS = 30 * 60 * 1000;

/** /walkers in "pick mode": its CTAs choose a walker for the request instead of starting one. */
export const PICK_WALKER_HREF = "/walkers?pick=1";

export interface WalkRequestDraft {
  selectedPetIds: string[];
  notes: string;
  selectedWalkerId: string | null;
}

export function saveWalkRequestDraft(draft: WalkRequestDraft, now = Date.now()) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, savedAt: now }));
  } catch {
    // Storage unavailable: the client just refills step 1 on the way back.
  }
}

export function takeWalkRequestDraft(now = Date.now()): WalkRequestDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);

    const parsed = JSON.parse(raw) as Partial<WalkRequestDraft> & { savedAt?: unknown };
    if (typeof parsed.savedAt !== "number" || now - parsed.savedAt > DRAFT_MAX_AGE_MS) return null;
    if (!Array.isArray(parsed.selectedPetIds)) return null;

    return {
      selectedPetIds: parsed.selectedPetIds.filter((id): id is string => typeof id === "string"),
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
      selectedWalkerId: typeof parsed.selectedWalkerId === "string" ? parsed.selectedWalkerId : null,
    };
  } catch {
    return null;
  }
}
