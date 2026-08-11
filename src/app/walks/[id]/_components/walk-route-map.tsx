"use client";

import { Loader2 } from "lucide-react";
import Map, { Marker, Layer, Source } from "react-map-gl/mapbox";
import { useWalkRoute } from "@/features/tracking/hooks/use-tracking";

export default function WalkRouteMap({ walkId }: { walkId: string }) {
  const { data: route, isLoading } = useWalkRoute(walkId);

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-muted/20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="mt-2 text-xs text-muted-foreground">Carregando rota...</p>
      </div>
    );
  }

  if (!route || route.length === 0) return null;

  const lngs   = route.map(([lng]) => lng);
  const lats   = route.map(([, lat]) => lat);
  const bounds: [[number, number], [number, number]] = [
    [Math.min(...lngs) - 0.0015, Math.min(...lats) - 0.0015],
    [Math.max(...lngs) + 0.0015, Math.max(...lats) + 0.0015],
  ];

  const [startLng, startLat] = route[0]!;
  const [endLng,   endLat]   = route[route.length - 1]!;

  const geojson = {
    type: "FeatureCollection" as const,
    features: [
      {
        type:       "Feature" as const,
        geometry:   { type: "LineString" as const, coordinates: route },
        properties: {},
      },
    ],
  };

  return (
    <div className="relative w-full h-full">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{ bounds, fitBoundsOptions: { padding: 52 } }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        scrollZoom={false}
      >
        {/* Route: white halo behind primary line */}
        <Source id="walk-route" type="geojson" data={geojson}>
          <Layer
            id="route-halo"
            type="line"
            paint={{ "line-color": "#ffffff", "line-width": 7, "line-opacity": 0.7 }}
          />
          <Layer
            id="route-line"
            type="line"
            paint={{ "line-color": "#6366f1", "line-width": 4, "line-opacity": 0.95 }}
          />
        </Source>

        {/* Start marker */}
        <Marker longitude={startLng} latitude={startLat} anchor="center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[11px] font-bold text-white shadow-md">
            A
          </div>
        </Marker>

        {/* End marker */}
        <Marker longitude={endLng} latitude={endLat} anchor="center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-500 text-[11px] font-bold text-white shadow-md">
            B
          </div>
        </Marker>
      </Map>
    </div>
  );
}
