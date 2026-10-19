import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
    accessToken?: string;
    /** Set when the JWT refresh cycle fails — triggers redirect to /login in api.ts interceptor. */
    error?: string;
  }

  interface User {
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: string;
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    /** Unix timestamp (seconds) matching the access token's exp claim. */
    expiresAt?: number;
    /** Set when refreshing the access token failed; the session can't be revived. */
    error?: string;
  }
}
