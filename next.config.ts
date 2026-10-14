import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "*.gravatar.com",
  },
  {
    protocol: "https",
    hostname: "avatars.githubusercontent.com",
  },
  {
    protocol: "https",
    hostname: "lh3.googleusercontent.com",
  },
  {
    protocol: "https",
    hostname: "i.pravatar.cc",
  },
  {
    protocol: "https",
    hostname: "picsum.photos",
  },
];

// Allow the media storage (MinIO) host — serves avatars, pet photos and
// verification documents — so next/image can optimize them.
if (process.env.NEXT_PUBLIC_MEDIA_URL) {
  const mediaUrl = new URL(process.env.NEXT_PUBLIC_MEDIA_URL);
  remotePatterns.push({
    protocol: mediaUrl.protocol.replace(":", "") as "http" | "https",
    hostname: mediaUrl.hostname,
    port: mediaUrl.port || undefined,
  });
}

// Uploaded files store their full public URL (host baked in) at upload
// time, so switching NEXT_PUBLIC_MEDIA_URL later (e.g. localhost -> a LAN
// IP for phone testing) leaves already-stored URLs pointing at the old
// host. Always also allow plain localhost:9000 (the default dev value) so
// that doesn't 404/crash next/image for files uploaded before the switch.
if (process.env.NEXT_PUBLIC_MEDIA_URL !== "http://localhost:9000") {
  remotePatterns.push({
    protocol: "http",
    hostname: "localhost",
    port: "9000",
  });
}

// Dev-only: Next.js 16 blocks cross-origin requests for its dev assets
// (JS chunks, HMR) unless the requesting origin is explicitly allowlisted —
// needed to test the app from another device (e.g. a phone) on the same
// Wi-Fi via this machine's LAN IP, which NEXT_PUBLIC_APP_URL is set to in
// that case. No effect on production builds.
const allowedDevOrigins: string[] = [];
if (process.env.NEXT_PUBLIC_APP_URL) {
  const appHostname = new URL(process.env.NEXT_PUBLIC_APP_URL).hostname;
  if (appHostname !== "localhost") {
    allowedDevOrigins.push(appHostname);
  }
}

const nextConfig: NextConfig = {
  /**
   * Allow external image domains (used for user avatars, pet photos, map tiles, etc.)
   */
  images: {
    remotePatterns,
  },

  allowedDevOrigins,

  /**
   * Turbopack config (Next.js 16 default bundler).
   * Empty object signals we're aware and opted in.
   */
  turbopack: {},
};

export default nextConfig;
