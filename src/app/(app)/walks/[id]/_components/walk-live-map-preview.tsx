'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Expand, Loader2, MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWalkLocation } from '@/features/tracking/hooks/use-tracking';

const WalkLiveMapDynamic = dynamic(() => import('./walk-live-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/30">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <p className="text-xs text-muted-foreground">Carregando mapa…</p>
    </div>
  ),
});

interface Props {
  walkId: string;
  startLat?: number | null;
  startLng?: number | null;
  petNames: string[];
  pets?: { name: string; photoUrl?: string | null }[];
  walkerAvatarUrl?: string | null;
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 5) return 'agora mesmo';
  if (diff < 60) return `há ${diff}s`;
  return `há ${Math.floor(diff / 60)}min`;
}

export function WalkLiveMapPreview({ walkId, startLat, startLng, petNames, pets, walkerAvatarUrl }: Props) {
  const { data: location } = useWalkLocation(walkId);

  return (
    <Card className="overflow-hidden py-0 gap-0 ring-1 ring-primary/10">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <h2 className="text-sm font-semibold text-foreground">Localização ao vivo</h2>
          {location && (
            <span className="hidden sm:inline text-xs text-muted-foreground">
              · atualizado {timeAgo(location.updatedAt)}
            </span>
          )}
        </div>
        <Link
          href={`/walks/${walkId}/tracking`}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'gap-1.5 text-muted-foreground hover:text-foreground',
          )}
        >
          <Expand className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Tela cheia</span>
        </Link>
      </div>

      {/* ── Map area ───────────────────────────────────────────────────── */}
      <div className="group relative h-[220px] overflow-hidden cursor-default">
        <WalkLiveMapDynamic walkId={walkId} startLat={startLat} startLng={startLng} pets={pets} walkerAvatarUrl={walkerAvatarUrl} />

        {/* Hover overlay — wrapper is non-interactive; only the pill is clickable */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/20">
          <Link
            href={`/walks/${walkId}/tracking`}
            aria-label="Abrir mapa em tela cheia"
            className="pointer-events-auto flex translate-y-1 cursor-pointer items-center gap-2 rounded-xl border border-border/60 bg-background/90 px-4 py-2.5 text-sm font-medium text-foreground opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Navigation className="h-4 w-4 text-primary" />
            Ver mapa completo
          </Link>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-5 py-2.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {location
            ? `Passeando com ${petNames.join(' & ')}`
            : 'Aguardando sinal GPS…'}
        </div>
        {location && (
          <span className="text-xs text-muted-foreground">
            {timeAgo(location.updatedAt)}
          </span>
        )}
      </div>
    </Card>
  );
}
