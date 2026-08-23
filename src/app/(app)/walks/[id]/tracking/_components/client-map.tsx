"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// react-leaflet relies on window, must disable SSR
// This must be done inside a Client Component wrapper
const MapTrackerDynamic = dynamic(() => import("./map-tracker"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-muted/20 animate-pulse h-full w-full">
      <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
      <div className="text-muted-foreground text-sm font-medium">
        Carregando mapa...
      </div>
    </div>
  ),
});

export function ClientMap({ walkId }: { walkId: string }) {
  return <MapTrackerDynamic walkId={walkId} />;
}
