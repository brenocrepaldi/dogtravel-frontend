'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const LocationPickerMapInner = dynamic(() => import('./location-picker-map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center gap-2 bg-muted/30 animate-pulse h-full w-full rounded-xl text-muted-foreground text-sm">
      <Loader2 className="h-4 w-4 animate-spin" />
      Carregando mapa...
    </div>
  ),
});

interface Props {
  lat: number;
  lng: number;
  onDragEnd: (lat: number, lng: number) => void;
}

export function LocationPickerClient({ lat, lng, onDragEnd }: Props) {
  return <LocationPickerMapInner lat={lat} lng={lng} onDragEnd={onDragEnd} />;
}
