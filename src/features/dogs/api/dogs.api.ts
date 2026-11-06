import type { Pet } from "@/types";
import api, { isApiConfigured } from "@/services/api";

// The in-memory mock lives in dogs.mock.ts and is loaded dynamically so it
// (and mock-data) never reaches the client bundle when a real API is configured.
export const DogsApi = {
  list: async (): Promise<Pet[]> => {
    if (!isApiConfigured) {
      const { dogsMock } = await import("./dogs.mock");
      return dogsMock.list();
    }
    return api.get<Pet[]>("/dogs").then((r) => r.data);
  },

  create: async (pet: Omit<Pet, "id">): Promise<Pet> => {
    if (!isApiConfigured) {
      const { dogsMock } = await import("./dogs.mock");
      return dogsMock.create(pet);
    }
    return api.post<Pet>("/dogs", pet).then((r) => r.data);
  },

  update: async (id: string, data: Partial<Omit<Pet, "id">>): Promise<Pet> => {
    if (!isApiConfigured) {
      const { dogsMock } = await import("./dogs.mock");
      return dogsMock.update(id, data);
    }
    return api.patch<Pet>(`/dogs/${id}`, data).then((r) => r.data);
  },

  remove: async (id: string): Promise<void> => {
    if (!isApiConfigured) {
      const { dogsMock } = await import("./dogs.mock");
      return dogsMock.remove(id);
    }
    await api.delete(`/dogs/${id}`);
  },
};
