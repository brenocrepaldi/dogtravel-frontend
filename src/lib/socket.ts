import { io, type Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";

export function createSocket(namespace: "/chat" | "/tracking", token: string): Socket {
  return io(`${WS_URL}${namespace}`, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    randomizationFactor: 0.5,
    transports: ["websocket", "polling"],
  });
}
