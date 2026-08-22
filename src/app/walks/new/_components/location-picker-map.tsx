'use client';

import { useState } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import { MapPin } from 'lucide-react';

interface Props {
  lat: number;
  lng: number;
  onDragEnd: (lat: number, lng: number) => void;
}

export default function LocationPickerMap({ lat, lng, onDragEnd }: Props) {
  const [viewState, setViewState] = useState({
    longitude: lng,
    latitude: lat,
    zoom: 15,
  });

  return (
    <Map
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      style={{ width: '100%', height: '100%' }}
      attributionControl={false}
      cooperativeGestures
    >
      <Marker
        longitude={lng}
        latitude={lat}
        draggable
        anchor="bottom"
        onDragEnd={(e) => onDragEnd(e.lngLat.lat, e.lngLat.lng)}
      >
        <div className="w-9 h-9 bg-primary text-primary-foreground rounded-full border-2 border-white flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing">
          <MapPin className="w-4 h-4" />
        </div>
      </Marker>
    </Map>
  );
}
