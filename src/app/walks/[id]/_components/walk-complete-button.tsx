'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, MapPin, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const RADIUS_M = 300;

// ─── Types ────────────────────────────────────────────────────────────────────

type GpsState =
  | { status: 'loading' }
  | { status: 'ok'; lat: number; lng: number; distanceM: number }
  | { status: 'far'; lat: number; lng: number; distanceM: number }
  | { status: 'unavailable' };

// ─── Component ────────────────────────────────────────────────────────────────

export function WalkCompleteButton({ walk }: { walk: WalkRecord }) {
  const { mutate: completeWalk, isPending: completing } = useCompleteWalk();

  // ── Countdown ───────────────────────────────────────────────────────────────
  const { remaining: remainingSeconds, done: timeReady } = useCountdown(
    walk.startedAt,
    walk.durationMinutes,
  );

  // ── GPS ─────────────────────────────────────────────────────────────────────
  const [gps, setGps] = useState<GpsState>({ status: 'loading' });
  const gpsRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGps({ status: 'unavailable' });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        gpsRef.current = { lat, lng };

        if (walk.startLat == null || walk.startLng == null) {
          setGps({ status: 'ok', lat, lng, distanceM: 0 });
          return;
        }

        const distanceM = Math.round(haversineMeters(walk.startLat, walk.startLng, lat, lng));
        setGps(
          distanceM <= RADIUS_M
            ? { status: 'ok', lat, lng, distanceM }
            : { status: 'far', lat, lng, distanceM },
        );
      },
      () => setGps({ status: 'unavailable' }),
      { enableHighAccuracy: true, maximumAge: 10_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [walk.startLat, walk.startLng]);

  // ── GPS unavailable confirmation dialog ─────────────────────────────────────
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
              description: `Você está a ${distM}m. Aproxime-se a menos de ${RADIUS_M}m para encerrar.`,
            });
          } else {
            toast.error('Erro ao concluir passeio', {
              description: 'Tente novamente em instantes.',
            });
          }
        },
      },
    );
  };

  const blocked = completing || !timeReady || gps.status === 'far' || gps.status === 'loading';

  return (
    <div className="flex flex-col gap-2">
      {/* ── Status chips ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {/* Time chip */}
        {!timeReady ? (
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-400">
            <Timer className="h-3.5 w-3.5" />
            <span>{formatCountdown(remainingSeconds)} restantes</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Tempo cumprido</span>
          </div>
        )}

        {/* Location chip */}
        {gps.status === 'loading' && (
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Obtendo localização…</span>
          </div>
        )}
        {gps.status === 'ok' && walk.startLat != null && (
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-400">
            <MapPin className="h-3.5 w-3.5" />
            <span>No ponto de partida</span>
          </div>
        )}
        {gps.status === 'far' && (
          <div className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-800/50 dark:bg-rose-900/20 dark:text-rose-400">
            <MapPin className="h-3.5 w-3.5" />
            <span>{gps.distanceM}m do ponto · máx {RADIUS_M}m</span>
          </div>
        )}
        {gps.status === 'unavailable' && (
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>GPS indisponível</span>
          </div>
        )}
      </div>

      {/* ── Button ───────────────────────────────────────────────────────────── */}
      <Button
        size="sm"
        disabled={blocked}
        onClick={() => {
          if (gps.status === 'unavailable') {
            setShowConfirm(true);
          } else {
            handleComplete(false);
          }
        }}
        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {completing
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <CheckCircle2 className="h-4 w-4" />}
        Concluir passeio
      </Button>

      {/* ── GPS unavailable confirmation ──────────────────────────────────────── */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>GPS indisponível</DialogTitle>
            <DialogDescription>
              Não foi possível verificar sua localização. O passeio normalmente deve ser
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
                handleComplete(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Concluir mesmo assim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
