import type { User } from "@/types";

// In-memory mock backend, loaded only when no real API is configured.
let myProfileStore: Partial<User> = {
  id: "1",
  name: "Breno Crepaldi",
  email: "client@example.com",
  role: "client",
  createdAt: "2024-01-01T00:00:00Z",
};

export const profileMock = {
  get: async (): Promise<Partial<User>> => ({ ...myProfileStore }),

  update: async (data: Partial<Omit<User, "id" | "role" | "createdAt">>): Promise<void> => {
    myProfileStore = { ...myProfileStore, ...data };
  },

  uploadAvatar: (file: File): Promise<{ avatarUrl: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const avatarUrl = reader.result as string;
        myProfileStore = { ...myProfileStore, avatarUrl };
        resolve({ avatarUrl });
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    }),

  deleteAvatar: async (): Promise<void> => {
    myProfileStore = { ...myProfileStore, avatarUrl: undefined };
  },
};
