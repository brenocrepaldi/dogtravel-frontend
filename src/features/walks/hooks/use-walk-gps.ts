"use client";

import { useEffect, useRef, useState } from "react";
import { haversineMeters } from "@/lib/geo";

export type GpsState =
  | { status: "loading" }
  | { status: "ok"; lat: number; lng: number; distanceM: number }
  | { status: "far"; lat: number; lng: number; distanceM: number }
  | { status: "unavailable" };

/**
 * Watches the device position and reports how far it is from the walk's start
 * point. `gpsRef` always holds the latest coordinates for use in event handlers.
 */
export function useWalkGps(
  startLat: number | null | undefined,
  startLng: number | null | undefined,
  radiusM: number,
) {
  const [gps, setGps] = useState<GpsState>({ status: "loading" });
  const gpsRef = useRef<{ lat: number; lng: number } | null>(null);

  // Derived instead of set from the effect: a browser without the Geolocation
  // API never leaves the "loading" state otherwise.
  const unsupported = typeof navigator !== "undefined" && !navigator.geolocation;

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        gpsRef.current = { lat, lng };

        if (startLat == null || startLng == null) {
          setGps({ status: "ok", lat, lng, distanceM: 0 });
          return;
        }

        const distanceM = Math.round(haversineMeters(startLat, startLng, lat, lng));
        setGps(
          distanceM <= radiusM
            ? { status: "ok", lat, lng, distanceM }
            : { status: "far", lat, lng, distanceM },
        );
      },
      () => setGps({ status: "unavailable" }),
      { enableHighAccuracy: true, maximumAge: 10_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [startLat, startLng, radiusM]);

  return { gps: unsupported ? ({ status: "unavailable" } as const) : gps, gpsRef };
}
