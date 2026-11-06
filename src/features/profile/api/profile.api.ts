import type { User } from "@/types";
import api, { isApiConfigured } from "@/services/api";

// Module-level mutable store — used only when API is not configured
let myProfileStore: Partial<User> = {
  id: "1",
  name: "Breno Crepaldi",
  email: "client@example.com",
  role: "client",
  createdAt: "2024-01-01T00:00:00Z",
};

export const ProfileApi = {
  get: async (): Promise<Partial<User>> => {
    if (!isApiConfigured) {
      return { ...myProfileStore };
    }
    return api.get<Partial<User>>("/profile").then((r) => r.data);
  },

  update: async (data: Partial<Omit<User, "id" | "role" | "createdAt">>): Promise<void> => {
    if (!isApiConfigured) {
      myProfileStore = { ...myProfileStore, ...data };
      return;
    }
    await api.patch("/profile", data);
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    if (!isApiConfigured) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const avatarUrl = reader.result as string;
          myProfileStore = { ...myProfileStore, avatarUrl };
          resolve({ avatarUrl });
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
    }
    const form = new FormData();
    form.append("avatar", file);
    return api
      .post<{ avatarUrl: string }>("/profile/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  deleteAvatar: async (): Promise<void> => {
    if (!isApiConfigured) {
      myProfileStore = { ...myProfileStore, avatarUrl: undefined };
      return;
    }
    await api.delete("/profile/avatar");
  },
};
