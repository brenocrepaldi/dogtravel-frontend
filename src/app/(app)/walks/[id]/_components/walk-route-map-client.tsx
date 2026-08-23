"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const WalkRouteMapDynamic = dynamic(() => import("./walk-route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center bg-muted/20 animate-pulse">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <p className="mt-2 text-xs text-muted-foreground">Carregando mapa...</p>
    </div>
  ),
});

export function WalkRouteMapClient({ walkId }: { walkId: string }) {
  return <WalkRouteMapDynamic walkId={walkId} />;
}
