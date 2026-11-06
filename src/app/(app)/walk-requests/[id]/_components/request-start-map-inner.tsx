'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Map, { Marker, type MapRef } from 'react-map-gl/mapbox';

interface Props {
  lat: number;
  lng: number;
  walkerLat?: number | null;
  walkerLng?: number | null;
  walkerAvatarUrl?: string | null;
  walkerName?: string;
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function RequestStartMapInner({
  lat, lng, walkerLat, walkerLng, walkerAvatarUrl, walkerName,
}: Props) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const hasWalker = typeof walkerLat === 'number' && typeof walkerLng === 'number';

  // Fit bounds to show both pins once map is ready and walker position is known
  useEffect(() => {
    if (!mapLoaded || !hasWalker || !mapRef.current) return;
    mapRef.current.fitBounds(
      [
        [Math.min(lng, walkerLng!), Math.min(lat, walkerLat!)],
        [Math.max(lng, walkerLng!), Math.max(lat, walkerLat!)],
      ],
      { padding: 80, duration: 800, maxZoom: 15 },
    );
  }, [mapLoaded, hasWalker, walkerLat, walkerLng, lat, lng]);

  return (
    <Map
      ref={mapRef}
      initialViewState={{ longitude: lng, latitude: lat, zoom: 14 }}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      style={{ width: '100%', height: '100%' }}
      attributionControl={false}
      onLoad={() => setMapLoaded(true)}
    >
      {/* Walk start — pulsing green circle */}
      <Marker longitude={lng} latitude={lat} anchor="center">
        <div className="relative flex items-center justify-center">
          <span className="absolute h-10 w-10 animate-ping rounded-full bg-emerald-500/35" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-lg shadow-emerald-500/40">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        </div>
      </Marker>

      {/* Walker position — clean avatar bubble, no animation */}
      {hasWalker && (
        <Marker longitude={walkerLng!} latitude={walkerLat!} anchor="center">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-[3px] border-white shadow-lg shadow-black/20">
            {walkerAvatarUrl ? (
              <Image src={walkerAvatarUrl} alt={walkerName ?? 'Você'} fill sizes="48px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
                {walkerName ? getInitials(walkerName) : '?'}
              </div>
            )}
          </div>
        </Marker>
      )}
    </Map>
  );
}
