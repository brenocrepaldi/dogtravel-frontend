import type { User } from "@/types";
import api, { isApiConfigured } from "@/services/api";

// The in-memory mock lives in profile.mock.ts and is loaded dynamically so it
// never reaches the client bundle when a real API is configured.
export const ProfileApi = {
  get: async (): Promise<Partial<User>> => {
    if (!isApiConfigured) {
      const { profileMock } = await import("./profile.mock");
      return profileMock.get();
    }
    return api.get<Partial<User>>("/profile").then((r) => r.data);
  },

  update: async (data: Partial<Omit<User, "id" | "role" | "createdAt">>): Promise<void> => {
    if (!isApiConfigured) {
      const { profileMock } = await import("./profile.mock");
      return profileMock.update(data);
    }
    await api.patch("/profile", data);
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    if (!isApiConfigured) {
      const { profileMock } = await import("./profile.mock");
      return profileMock.uploadAvatar(file);
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
      const { profileMock } = await import("./profile.mock");
      return profileMock.deleteAvatar();
    }
    await api.delete("/profile/avatar");
  },
};
