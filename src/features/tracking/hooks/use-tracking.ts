import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession } from "next-auth/react";
import type { Socket } from "socket.io-client";
import { createSocket } from "@/lib/socket";
import { TrackingApi } from "../api/tracking.api";
import type { WalkLocation } from "@/types";

// A watcher is considered to have "lost signal" when no location update has
// arrived for this long — e.g. the walker minimized the app or lost network.
const STALE_THRESHOLD_MS = 15_000;

export function useWalkLocation(walkId: string) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!walkId) return;

    let cancelled = false;

    (async () => {
      const session = await getSession();
      const token = session?.accessToken;
      if (!token || cancelled) return;

      const socket = createSocket("/tracking", token);
      socketRef.current = socket;

      socket.on("connect", () => {
        setConnected(true);
        socket.emit("watch-walk", walkId);
      });

      socket.on("disconnect", () => setConnected(false));

      socket.on("location-updated", (location: WalkLocation) => {
        queryClient.setQueryData(["tracking", walkId], location);
      });
    })();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [walkId, queryClient]);

  const query = useQuery({
    queryKey: ["tracking", walkId],
    queryFn: () => TrackingApi.getLocation(walkId),
    enabled: Boolean(walkId),
    // Socket subscription above keeps this fresh in real time; poll only
    // as a fallback while the socket isn't connected.
    refetchInterval: connected ? false : 5_000,
    staleTime: 0,
  });

  const isStale = Boolean(
    query.data?.updatedAt && now - new Date(query.data.updatedAt).getTime() > STALE_THRESHOLD_MS,
  );

  return { ...query, isStale, connected };
}

export function useWalkRoute(walkId: string) {
  return useQuery({
    queryKey: ["tracking", walkId, "route"],
    queryFn: () => TrackingApi.getRoute(walkId),
    enabled: Boolean(walkId),
  });
}

/**
 * Used by the walker during an active walk to continuously broadcast their GPS
 * position to the backend. Starts watching when `active` is true and stops on
 * unmount or when `active` becomes false. Sends over the WebSocket when
 * connected, falling back to REST otherwise.
 */
export function useLocationBroadcast(walkId: string, active: boolean) {
  const watchIdRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!active || !walkId) return;

    let cancelled = false;

    (async () => {
      const session = await getSession();
      const token = session?.accessToken;
      if (!token || cancelled) return;

      const socket = createSocket("/tracking", token);
      socketRef.current = socket;
    })();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [walkId, active]);

  useEffect(() => {
    if (!active || !walkId || typeof navigator === "undefined") return;

    if (!navigator.geolocation) {
      console.warn("[tracking] Geolocation API not available in this browser.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const socket = socketRef.current;
        if (socket?.connected) {
          socket.emit("update-location", {
            walkId,
            lat: coords.latitude,
            lng: coords.longitude,
          });
          return;
        }
        // Socket not connected yet (or reconnecting) — fall back to REST
        // so location updates never silently stop.
        TrackingApi.updateLocation(walkId, coords.latitude, coords.longitude).catch(() => {
          // Silent fail — next position update will retry automatically
        });
      },
      (err) => {
        console.warn("[tracking] Geolocation error:", err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 10_000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [walkId, active]);
}
