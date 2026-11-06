import { pets } from "@/lib/mock/mock-data";
import type { Pet } from "@/types";

// In-memory mock backend, loaded only when no real API is configured.
// Not thread-safe across requests.
let dogsStore: Pet[] | null = null;

function getDogsStore(): Pet[] {
  if (!dogsStore) {
    dogsStore = [...pets];
  }
  return dogsStore;
}

export const dogsMock = {
  list: async (): Promise<Pet[]> => [...getDogsStore()],

  create: async (pet: Omit<Pet, "id">): Promise<Pet> => {
    const store = getDogsStore();
    const maxId = store.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
    const newPet: Pet = { ...pet, id: String(maxId + 1) };
    dogsStore = [...store, newPet];
    return newPet;
  },

  update: async (id: string, data: Partial<Omit<Pet, "id">>): Promise<Pet> => {
    const store = getDogsStore();
    dogsStore = store.map((p) => (p.id === id ? { ...p, ...data } : p));
    const updated = dogsStore.find((p) => p.id === id);
    if (!updated) throw new Error("Pet não encontrado");
    return updated;
  },

  remove: async (id: string): Promise<void> => {
    const store = getDogsStore();
    dogsStore = store.filter((p) => p.id !== id);
  },
};
