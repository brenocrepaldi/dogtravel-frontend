'use client';

import Map, { Marker } from 'react-map-gl/mapbox';
import { useSession } from 'next-auth/react';
import { MapPin } from 'lucide-react';
import { useWalkLocation, useLocationBroadcast } from '@/features/tracking/hooks/use-tracking';
import { DogMarker } from '@/components/common/dog-marker';

type Pet = { name: string; photoUrl?: string | null };

interface Props {
  walkId: string;
  startLat?: number | null;
  startLng?: number | null;
  pets?: Pet[];
  walkerAvatarUrl?: string | null;
}

export default function WalkLiveMap({ walkId, startLat, startLng, pets = [], walkerAvatarUrl }: Props) {
  const { data: session } = useSession();
  const isWalker = session?.user?.role === 'walker';

  const { data: location } = useWalkLocation(walkId);

  useLocationBroadcast(walkId, isWalker);

  const lat = location?.lat ?? startLat ?? -23.55;
  const lng = location?.lng ?? startLng ?? -46.63;

  return (
    <div className="relative w-full h-full">
      <Map
        key={`${lat},${lng}`}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{ longitude: lng, latitude: lat, zoom: 16 }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        scrollZoom={false}
        dragPan={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
      >
        {/* Start point pin */}
        {startLat != null && startLng != null && (
          <Marker longitude={startLng} latitude={startLat} anchor="bottom">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-md">
              <MapPin className="h-3.5 w-3.5 text-white" />
            </div>
          </Marker>
        )}

        {/* Live walker position — dog photo or emoji fallback */}
        {location && (
          <Marker longitude={location.lng} latitude={location.lat} anchor="center">
            <DogMarker pets={pets} walkerAvatarUrl={walkerAvatarUrl} size="sm" />
          </Marker>
        )}
      </Map>
    </div>
  );
}
