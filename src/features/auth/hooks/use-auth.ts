import { useMutation } from "@tanstack/react-query";
import { getSession, signOut } from "next-auth/react";
import { AuthApi } from "../api/auth.api";
import { REFRESH_ERROR } from "@/lib/auth-refresh";
import type { RegisterDto } from "@/types";

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      // An expired session has nothing left to revoke, and calling the API with
      // it would show the "session expired" toast while the user is logging out.
      const session = await getSession();
      if (session?.error !== REFRESH_ERROR) {
        // Best-effort server-side revocation. If it fails (network error, 401,
        // etc.) we still clear the client session so the user is not stuck.
        try {
          await AuthApi.logout();
        } catch {
          // intentionally ignored
        }
      }
      await signOut({ callbackUrl: "/login" });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (dto: RegisterDto) => AuthApi.register(dto),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => AuthApi.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      AuthApi.resetPassword(token, password),
  });
}
