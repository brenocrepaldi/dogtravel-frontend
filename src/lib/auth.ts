import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { refreshTokenIfNeeded } from "@/lib/auth-refresh";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const isApiConfigured = !!process.env.NEXT_PUBLIC_API_URL;

// ─── NextAuth config ──────────────────────────────────────────────────────────
// Built per call: NextAuth passes the request to the /api/auth/* route
// handlers, which can save the rotated session cookie, and `undefined` to
// auth() in Server Components, which can't. Refreshing there would rotate the
// refresh token on the backend and then discard the new one.

export const { handlers, auth, signIn, signOut } = NextAuth((req) => {
  const canRefresh = req !== undefined;

  return {
    providers: [
      Credentials({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Senha", type: "password" },
        },
        async authorize(credentials) {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) return null;

          if (isApiConfigured) {
            try {
              const { AuthApi } = await import("@/features/auth/api/auth.api");
              const result = await AuthApi.login(parsed.data.email, parsed.data.password);
              return {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                expiresAt: result.expiresAt,
              };
            } catch {
              return null;
            }
          }

          // Development fallback — role derived from email
          if (parsed.data.email.includes("client")) {
            return { id: "1", name: "Usuário Teste", email: parsed.data.email, role: "client" };
          }
          if (parsed.data.email.includes("walker")) {
            return { id: "1", name: "Carlos Silva", email: parsed.data.email, role: "walker" };
          }
          return null;
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        // ── Initial sign-in: persist tokens from the authorize callback ────────
        if (user) {
          token.role = user.role ?? "";
          token.id = user.id;
          const u = user as typeof user & {
            accessToken?: string;
            refreshToken?: string;
            expiresAt?: number;
          };
          if (u.accessToken) token.accessToken = u.accessToken;
          if (u.refreshToken) token.refreshToken = u.refreshToken;
          // expiresAt is the JWT exp claim (Unix seconds). Always provided by backend.
          token.expiresAt = u.expiresAt;
          return token;
        }

        // ── Dev mode without real API — skip refresh logic ──────────────────
        if (!isApiConfigured) return token;

        return refreshTokenIfNeeded(token, { canRefresh });
      },

      async session({ session, token }) {
        if (session.user) {
          session.user.role = token.role as string;
          session.user.id = token.id as string;
        }
        session.accessToken = token.accessToken;
        if (token.error) session.error = token.error;
        return session;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
    session: {
      strategy: "jwt",
      // Align with backend refresh token lifetime so the session cookie never
      // outlives the refresh token, preventing misleading "session active" state.
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
});
