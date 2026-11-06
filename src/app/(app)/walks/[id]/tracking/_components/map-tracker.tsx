'use client';

import { useRef, useState } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  MessageSquare,
  PawPrint,
  Phone,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWalkLocation, useLocationBroadcast } from '@/features/tracking/hooks/use-tracking';
import { useWalkById } from '@/features/walks/hooks/use-walks';
import { useCompleteWalk } from '@/features/walks/hooks/use-walk-actions';
import { useCountdown } from '@/features/tracking/hooks/use-countdown';
import { haversineMeters } from '@/lib/geo';
import { DogMarker } from '@/components/common/dog-marker';
import { TrackingLoader } from './tracking-loader';
import { TRACKING_STATUS } from './tracking-status';

// ─── Types ────────────────────────────────────────────────────────────────────

type Pet = { name: string; photoUrl?: string | null };

interface ApiError {
  response?: {
    data?: {
      error?: string;
      remainingSeconds?: number;
      distanceMeters?: number;
    };
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RADIUS_M = 300;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatCountdown(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function PetsRow({ pets, durationMinutes }: { pets: Pet[]; durationMinutes?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 px-5 py-3">
      {pets.map((pet, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-amber-200/80 bg-amber-50 shadow-sm">
            {pet.photoUrl ? (
              <Image src={pet.photoUrl} alt={pet.name} fill sizes="36px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <PawPrint className="h-3.5 w-3.5 text-amber-500" />
              </div>
            )}
          </div>
          <span className="text-sm font-semibold text-foreground">{pet.name}</span>
        </div>
      ))}
      {durationMinutes ? (
        <p className="ml-auto text-xs text-muted-foreground md:hidden">Passeio de {durationMinutes} min</p>
      ) : null}
    </div>
  );
}

interface ProgressSectionProps {
  startAddress?: string;
  startedAt?: string | null;
  remaining: number;
  progress: number;
  timeDone: boolean;
}

function ProgressSection({ startAddress, startedAt, remaining, progress, timeDone }: ProgressSectionProps) {
  return (
    <div className="space-y-2.5 px-5 py-3">
      {startAddress && (
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground md:text-[11px] md:leading-normal md:font-semibold md:uppercase md:tracking-wider">
              <span className="md:hidden">Partida e chegada</span>
              <span className="hidden md:inline">Ponto de partida e chegada</span>
            </p>
            <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">{startAddress}</p>
          </div>
        </div>
      )}

      {startedAt && (
        <div className="space-y-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000 ease-linear',
                timeDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-primary/70',
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-end">
            {timeDone ? (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                Tempo cumprido
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {formatCountdown(remaining)} restantes
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MapTracker({ walkId }: { walkId: string }) {
  const { data: session } = useSession();
  const { data: walk } = useWalkById(walkId);
  const { data: location, isLoading, isStale: signalLost } = useWalkLocation(walkId);
  const { mutate: completeWalk, isPending: completing } = useCompleteWalk();

  const isWalker = session?.user?.role === 'walker';
  const isInProgress = walk?.status === 'in_progress';
  const status = TRACKING_STATUS[walk?.status ?? 'in_progress'];

  useLocationBroadcast(walkId, isWalker && isInProgress);

  const pets: Pet[] = walk?.pets?.length
    ? walk.pets
    : (walk?.petNames?.map((name) => ({ name })) ?? []);

  const walkerParticipant = walk?.participants.find((p) => p.role === 'walker');
  const walkerName = walkerParticipant?.name ?? 'Passeador';
  const walkerPhone = walkerParticipant?.phone ?? null;

  const clientParticipant = walk?.participants.find((p) => p.role === 'client');
  const clientPhone = clientParticipant?.phone ?? null;

  const { remaining, progress, done: timeDone } = useCountdown(walk?.startedAt, walk?.durationMinutes);

  // ── Complete walk ──────────────────────────────────────────────────────────
  const [showConfirm, setShowConfirm] = useState(false);
  const pendingCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const handleCompleteError = (err: unknown) => {
    const e = err as ApiError;
    const code = e?.response?.data?.error;
    const secs = e?.response?.data?.remainingSeconds;
    const distM = e?.response?.data?.distanceMeters;
    if (code === 'WALK_DURATION_NOT_REACHED') {
      toast.error('Tempo insuficiente', {
        description: `Aguarde mais ${formatCountdown(secs ?? 60)} para concluir.`,
      });
    } else if (code === 'WALK_END_TOO_FAR') {
      toast.error('Muito longe do ponto de partida', {
        description: `Você está a ${distM}m. Aproxime-se a menos de ${RADIUS_M}m.`,
      });
    } else {
      toast.error('Erro ao concluir passeio', { description: 'Tente novamente.' });
    }
  };

  const handleCompleteClick = () => {
    if (!navigator.geolocation) {
      setShowConfirm(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (walk?.startLat != null && walk?.startLng != null) {
          const dist = haversineMeters(walk.startLat, walk.startLng, lat, lng);
          if (dist > RADIUS_M) {
            toast.error('Muito longe do ponto de partida', {
              description: `Você está a ${Math.round(dist)}m. Aproxime-se a menos de ${RADIUS_M}m para finalizar.`,
            });
            return;
          }
        }
        completeWalk({ walkId, coords: { lat, lng } }, { onError: handleCompleteError });
      },
      () => {
        pendingCoordsRef.current = null;
        setShowConfirm(true);
      },
      { enableHighAccuracy: true, timeout: 8_000 },
    );
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) return <TrackingLoader label="Localizando o passeador…" />;

  const hasLocation = !!location;
  const mapLat = location?.lat ?? walk?.startLat ?? -23.55;
  const mapLng = location?.lng ?? walk?.startLng ?? -46.63;
  // On mobile the bottom card covers the lower half of the map: centre the
  // marker in the visible area above it. Client-only component, so window is safe.
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const mapPadding = { top: 0, left: 0, right: 0, bottom: isMobile ? 300 : 0 };

  return (
    <>
      <div className="relative h-full w-full flex-1">

        {/* ── Map ─────────────────────────────────────────────────── */}
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{
            longitude: mapLng,
            latitude: mapLat,
            zoom: hasLocation ? 17 : 15,
            padding: mapPadding,
          }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          attributionControl={false}
        >
          {walk?.startLat != null && walk?.startLng != null && (
            <Marker longitude={walk.startLng} latitude={walk.startLat} anchor="bottom">
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-md">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="whitespace-nowrap rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow backdrop-blur-sm">
                  Partida
                </div>
              </div>
            </Marker>
          )}

          {location && (
            <Marker longitude={location.lng} latitude={location.lat} anchor="center">
              <DogMarker pets={pets} walkerAvatarUrl={walk?.walkerAvatarUrl} size="lg" />
            </Marker>
          )}
        </Map>

        {/* ── Lost-signal banner — client only, walker already sees its own GPS status ── */}
        {hasLocation && signalLost && !isWalker && (
          <div className="pointer-events-none absolute inset-x-0 top-[calc(4.25rem+env(safe-area-inset-top))] z-[600] flex justify-center px-3 md:top-[calc(1rem+env(safe-area-inset-top))] md:px-4">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50/95 px-3.5 py-2 text-xs font-semibold text-amber-800 shadow-lg backdrop-blur-md dark:border-amber-800/50 dark:bg-amber-900/90 dark:text-amber-300">
              <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
              <span className="md:hidden">Sinal perdido · posição pode estar desatualizada</span>
              <span className="hidden md:inline">
                Sinal do passeador perdido — última posição pode estar desatualizada
              </span>
            </div>
          </div>
        )}

        {/* ── No-location overlay ────────────────────────────────── */}
        {!hasLocation && (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-white/20 bg-background/90 px-6 py-5 text-center shadow-xl backdrop-blur-md">
              <PawPrint className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-semibold text-foreground">Aguardando localização…</p>
              <p className="max-w-[220px] text-xs leading-relaxed text-muted-foreground">
                O mapa será atualizado assim que o passeador enviar sua posição
              </p>
            </div>
          </div>
        )}

        {/* ── Top bar ─────────────────────────────────────────────── */}
        <div className="pointer-events-none absolute left-4 right-4 top-[calc(1rem+env(safe-area-inset-top))] z-[1000] flex items-center gap-2.5">
          <Link
            href={`/walks/${walkId}`}
            aria-label="Voltar"
            className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-background/85 shadow-lg backdrop-blur-md text-muted-foreground transition-colors hover:text-foreground md:h-10 md:w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div
            className={cn(
              'pointer-events-auto flex h-11 shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-background/85 px-4 py-2.5 shadow-lg backdrop-blur-md md:h-auto',
              timeDone && isInProgress && 'border-emerald-500/40 bg-emerald-500/10',
            )}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              {status.live && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              )}
              <span className={cn('relative inline-flex h-2 w-2 rounded-full', status.dotClass)} />
            </span>
            <span className="text-sm font-semibold text-foreground">{status.label}</span>

            {isInProgress && walk?.startedAt && (
              <>
                <span className="h-4 w-px bg-border/60" />
                {timeDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    'font-mono text-sm font-bold tabular-nums',
                    timeDone ? 'text-emerald-600' : 'text-foreground',
                  )}
                >
                  {timeDone ? '00:00' : formatCountdown(remaining)}
                </span>
                {walk?.durationMinutes && (
                  <span className="hidden border-l border-border/50 pl-2 text-xs text-muted-foreground md:inline">
                    {walk.durationMinutes}min
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Bottom card ─────────────────────────────────────────── */}
        <div className="pointer-events-none absolute bottom-[calc(2.25rem+env(safe-area-inset-bottom))] left-3 right-3 z-[1000] flex justify-center md:bottom-[calc(1rem+env(safe-area-inset-bottom))] md:left-4 md:right-4">
          {isWalker ? (

            /* ── Walker card ─────────────────────────────────────── */
            <div className="pointer-events-auto w-full max-w-lg divide-y divide-border/40 rounded-2xl border border-white/20 bg-background/95 shadow-xl backdrop-blur-md overflow-hidden">

              {/* 1 — Pets */}
              <PetsRow pets={pets} durationMinutes={walk?.durationMinutes} />

              {/* 2 — Location + progress */}
              <ProgressSection
                startAddress={walk?.startAddress}
                startedAt={walk?.startedAt}
                remaining={remaining}
                progress={progress}
                timeDone={timeDone}
              />

              {/* 3 — Actions */}
              <div className="space-y-2 px-5 py-3">
                <div className={cn('grid gap-2', clientPhone ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2')}>
                  <Link
                    href={`/walks/${walkId}`}
                    className={cn(buttonVariants({ variant: 'outline' }), 'hidden gap-2 md:inline-flex')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Link>
                  {clientPhone && (
                    <Link
                      href={`tel:${clientPhone}`}
                      className={cn(
                        buttonVariants({ variant: 'outline' }),
                        'h-11 gap-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:text-white md:h-10',
                      )}
                    >
                      <Phone className="h-4 w-4" />
                      Ligar
                    </Link>
                  )}
                  <Link
                    href={`/walks/${walkId}/chat`}
                    className={cn(buttonVariants({ variant: 'outline' }), 'h-11 gap-2 md:h-10')}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </Link>
                </div>

                <Button
                  className={cn(
                    'h-12 w-full gap-2 text-base font-semibold transition-all md:h-10 md:text-sm',
                    timeDone
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-muted text-muted-foreground hover:bg-muted',
                  )}
                  disabled={completing || !timeDone}
                  onClick={handleCompleteClick}
                >
                  {completing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : timeDone ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Timer className="h-4 w-4" />
                  )}
                  {completing
                    ? 'Concluindo…'
                    : timeDone
                      ? 'Concluir passeio'
                      : 'Disponível no final do passeio'}
                </Button>
              </div>
            </div>

          ) : (

            /* ── Client card — mesma estrutura 3-seções do walker ── */
            <div className="pointer-events-auto w-full max-w-lg divide-y divide-border/40 rounded-2xl border border-white/20 bg-background/95 shadow-xl backdrop-blur-md overflow-hidden">

              {/* 1 — Walker identity (espelho da seção de pets) */}
              <div className="flex items-center gap-3 px-5 py-3">
                {walk?.walkerAvatarUrl ? (
                  <div className="relative h-9 w-9 shrink-0">
                    <Image
                      src={walk.walkerAvatarUrl}
                      alt={walkerName}
                      fill
                      sizes="36px"
                      className="rounded-full border-2 border-primary/20 object-cover shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
                    {initials(walkerName)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{walkerName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    Passeando com {walk?.petNames?.join(' & ') ?? '…'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Ao vivo
                </div>
              </div>

              {/* 2 — Location + progress (componente idêntico ao walker) */}
              <ProgressSection
                startAddress={walk?.startAddress}
                startedAt={walk?.startedAt}
                remaining={remaining}
                progress={progress}
                timeDone={timeDone}
              />

              {/* 3 — Actions */}
              <div
                className={cn(
                  'grid gap-2 px-5 py-3',
                  walkerPhone ? 'grid-cols-2' : 'grid-cols-1',
                )}
              >
                {walkerPhone && (
                  <Link
                    href={`tel:${walkerPhone}`}
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'h-11 gap-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:text-white md:h-10',
                    )}
                  >
                    <Phone className="h-4 w-4" />
                    <span className="md:hidden">Ligar</span>
                    <span className="hidden md:inline">Ligar para passeador</span>
                  </Link>
                )}
                <Link
                  href={`/walks/${walkId}/chat`}
                  className={cn(
                    buttonVariants({ variant: walkerPhone ? 'outline' : 'default' }),
                    'h-11 gap-2 md:h-10',
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── GPS unavailable confirmation ──────────────────────────────────────── */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>GPS indisponível</DialogTitle>
            <DialogDescription>
              Não foi possível verificar sua localização. O passeio deve ser
              encerrado no ponto de partida. Deseja concluir mesmo assim?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setShowConfirm(false);
                completeWalk({ walkId }, { onError: handleCompleteError });
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Concluir mesmo assim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
