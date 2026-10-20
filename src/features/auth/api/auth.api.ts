import api, { isApiConfigured } from "@/services/api";
import type { RegisterDto, LoginResponseDto } from "@/types";

export const AuthApi = {
  register: async (dto: RegisterDto): Promise<void> => {
    if (!isApiConfigured) {
      await new Promise((r) => setTimeout(r, 800));
      return;
    }
    await api.post("/auth/register", dto);
  },

  // Called server-side by NextAuth's authorize callback via raw fetch.
  // Returns the LoginResponseDto shape expected by auth.ts.
  login: async (email: string, password: string): Promise<LoginResponseDto> => {
    const url = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"}/auth/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("INVALID_CREDENTIALS");
    return res.json() as Promise<LoginResponseDto>;
  },

  // Invalidates the server-side session. The Bearer accessToken in the
  // Authorization header is sufficient — the server revokes the associated
  // refresh token. Called before NextAuth's client-side signOut().
  logout: async (): Promise<void> => {
    if (!isApiConfigured) return;
    await api.post("/auth/logout");
  },

  // Triggers the password recovery flow: backend sends a reset e-mail.
  forgotPassword: async (email: string): Promise<void> => {
    if (!isApiConfigured) {
      await new Promise((r) => setTimeout(r, 800));
      return;
    }
    await api.post("/auth/forgot-password", { email });
  },

  // Resets the password using the token received by e-mail.
  resetPassword: async (token: string, password: string): Promise<void> => {
    if (!isApiConfigured) {
      await new Promise((r) => setTimeout(r, 800));
      return;
    }
    await api.post("/auth/reset-password", { token, password });
  },
};
