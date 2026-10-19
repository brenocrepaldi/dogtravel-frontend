import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { REFRESH_ERROR } from "@/lib/auth-refresh";

const SESSION_EXPIRED_MESSAGE = "Sua sessão expirou. Faça login novamente.";
const REDIRECT_DELAY_MS = 1500;

// A page usually fires several requests at once, so a dead session fails all
// of them together — only the first one warns the user and signs out.
let sessionExpiredHandled = false;

export async function handleSessionExpired(): Promise<void> {
  if (sessionExpiredHandled) return;
  sessionExpiredHandled = true;

  toast.error(SESSION_EXPIRED_MESSAGE);
  try {
    // Clears the session cookie so /login doesn't send the user back to /dashboard
    await signOut({ redirect: false });
  } catch {
    // The proxy also clears a dead session cookie, so /login still renders
  }
  setTimeout(() => {
    // Full reload on purpose: no router here, and it drops the dead session's client state
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }, REDIRECT_DELAY_MS);
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const session = await getSession();

      // If the JWT callback flagged a refresh failure, stop here instead of
      // sending a request that will certainly return 401.
      if (session?.error === REFRESH_ERROR) {
        void handleSessionExpired();
        return Promise.reject(new Error(REFRESH_ERROR));
      }

      const token = session?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      void handleSessionExpired();
    }
    return Promise.reject(error);
  }
);

export const isApiConfigured = !!process.env.NEXT_PUBLIC_API_URL;

export default api;
