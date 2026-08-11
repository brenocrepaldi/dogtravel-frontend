'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
  MessageSquare,
  Navigation,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCompleteWalk } from '@/features/walks/hooks/use-walk-actions';
import { useCountdown } from '@/features/tracking/hooks/use-countdown';
import { haversineMeters } from '@/lib/geo';
import type { WalkRecord } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCountdown(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

const RADIUS_M = 300;

// ─── Types ────────────────────────────────────────────────────────────────────

type GpsState =
  | { status: 'loading' }
  | { status: 'ok'; lat: number; lng: number; distanceM: number }
  | { status: 'far'; lat: number; lng: number; distanceM: number }
  | { status: 'unavailable' };

// ─── Component ────────────────────────────────────────────────────────────────

export function WalkInProgressPanel({ walk }: { walk: WalkRecord }) {
  const { mutate: completeWalk, isPending: completing } = useCompleteWalk();

  // ── Countdown ───────────────────────────────────────────────────────────────
  const { remaining: remainingSeconds, progress, done: timeReady } = useCountdown(
    walk.startedAt,
    walk.durationMinutes,
  );

  // ── GPS ─────────────────────────────────────────────────────────────────────
  const [gps, setGps] = useState<GpsState>({ status: 'loading' });
  const gpsRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) { setGps({ status: 'unavailable' }); return; }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        gpsRef.current = { lat, lng };
        if (walk.startLat == null || walk.startLng == null) {
          setGps({ status: 'ok', lat, lng, distanceM: 0 });
          return;
        }
        const distanceM = Math.round(haversineMeters(walk.startLat, walk.startLng, lat, lng));
        setGps(distanceM <= RADIUS_M
          ? { status: 'ok', lat, lng, distanceM }
          : { status: 'far', lat, lng, distanceM });
      },
      () => setGps({ status: 'unavailable' }),
      { enableHighAccuracy: true, maximumAge: 10_000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [walk.startLat, walk.startLng]);

  // ── Confirm dialog ──────────────────────────────────────────────────────────
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Complete action ──────────────────────────────────────────────────────────
  const handleComplete = (skipGps = false) => {
    const coords = !skipGps && gpsRef.current ? gpsRef.current : undefined;
    completeWalk(
      { walkId: walk.id, coords },
      {
        onError: (err: any) => {
          const code = err?.response?.data?.error;
          const remaining = err?.response?.data?.remainingSeconds as number | undefined;
          const distM = err?.response?.data?.distanceMeters as number | undefined;
          if (code === 'WALK_DURATION_NOT_REACHED') {
            toast.error('Tempo insuficiente', {
              description: `Aguarde mais ${formatCountdown(remaining ?? 60)} para concluir.`,
            });
          } else if (code === 'WALK_END_TOO_FAR') {
            toast.error('Muito longe do ponto de partida', {
              description: `Você está a ${distM}m. Aproxime-se a menos de ${RADIUS_M}m.`,
            });
          } else {
            toast.error('Erro ao concluir passeio', { description: 'Tente novamente.' });
          }
        },
      },
    );
  };

  const canComplete = timeReady && (gps.status === 'ok' || gps.status === 'unavailable');
  const blockReason =
    !timeReady ? 'Aguarde o tempo restante'
    : gps.status === 'far' ? `Retorne ao ponto de partida (${gps.distanceM}m)`
    : gps.status === 'loading' ? 'Obtendo localização…'
    : null;

  return (
    <>
      <Card className="overflow-hidden py-0 gap-0 ring-1 ring-emerald-500/20">
        {/* ── Accent bar ───────────────────────────────────────────────────── */}
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />

        {/* ── Header row ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 border-b border-border/60 bg-emerald-500/[0.04] px-5 py-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
              Em andamento
            </span>
            <span className="hidden sm:block text-sm text-muted-foreground truncate">
              · {walk.petNames.join(' & ')} · {walk.clientName}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/walks/${walk.id}/chat`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Chat</span>
            </Link>
            <Link
              href={`/walks/${walk.id}/tracking`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
            >
              <Navigation className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mapa ao vivo</span>
            </Link>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <CardContent className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-y-0 sm:divide-x divide-border/60 p-0">

          {/* ── Left: Countdown ─────────────────────────────────────────────── */}
          <div className="flex flex-col justify-center gap-4 px-6 py-6">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {timeReady ? 'Tempo cumprido' : 'Tempo restante'}
              </p>
            </div>

            <div className="flex items-end gap-3">
              <p
                className={cn(
                  'font-mono text-6xl font-bold leading-none tracking-tight tabular-nums',
                  timeReady
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-foreground',
                )}
              >
                {timeReady ? '00:00' : formatCountdown(remainingSeconds)}
              </p>
              {timeReady && (
                <CheckCircle2 className="mb-1 h-6 w-6 text-emerald-500" />
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000 ease-linear',
                    timeReady
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-primary to-primary/80',
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {walk.durationMinutes} min contratados
              </p>
            </div>
          </div>

          {/* ── Right: Location + Actions ─────────────────────────────────── */}
          <div className="flex flex-col justify-between gap-5 px-6 py-6">
            {/* Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ponto de partida
                </p>
              </div>
              <p className="text-sm leading-snug text-foreground">{walk.startAddress}</p>

              {/* GPS status */}
              <div>
                {gps.status === 'loading' && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Obtendo localização…
                  </div>
                )}
                {gps.status === 'ok' && walk.startLat != null && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-400 w-fit">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    Dentro do raio de conclusão
                  </div>
                )}
                {gps.status === 'far' && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-800/50 dark:bg-rose-900/20 dark:text-rose-400 w-fit">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {gps.distanceM}m de distância · máx {RADIUS_M}m
                  </div>
                )}
                {gps.status === 'unavailable' && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-400 w-fit">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    GPS indisponível
                  </div>
                )}
              </div>
            </div>

            {/* Complete button */}
            <div className="space-y-2">
              {blockReason && (
                <p className="text-xs text-muted-foreground">{blockReason}</p>
              )}
              <Button
                className={cn(
                  'w-full gap-2 font-semibold transition-all',
                  canComplete
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                    : 'opacity-60',
                )}
                disabled={completing || !canComplete}
                onClick={() => {
                  if (gps.status === 'unavailable') setShowConfirm(true);
                  else handleComplete(false);
                }}
              >
                {completing
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <CheckCircle2 className="h-4 w-4" />}
                Concluir passeio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── GPS unavailable confirmation ──────────────────────────────────────── */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>GPS indisponível</DialogTitle>
            <DialogDescription>
              Não foi possível verificar sua localização. O passeio normalmente deve
              ser encerrado no ponto de partida. Deseja concluir mesmo assim?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => { setShowConfirm(false); handleComplete(true); }}
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
