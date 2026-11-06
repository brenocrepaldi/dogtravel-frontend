"use client";

import dynamic from "next/dynamic";
import { TrackingLoader } from "./tracking-loader";

// react-leaflet relies on window, must disable SSR
// This must be done inside a Client Component wrapper
const MapTrackerDynamic = dynamic(() => import("./map-tracker"), {
  ssr: false,
  loading: () => <TrackingLoader label="Carregando mapa…" />,
});

export function ClientMap({ walkId }: { walkId: string }) {
  return <MapTrackerDynamic walkId={walkId} />;
}
