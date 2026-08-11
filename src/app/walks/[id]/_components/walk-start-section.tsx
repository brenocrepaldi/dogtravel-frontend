'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  MapPin,
  PlayCircle,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStartWalk } from '@/features/walks/hooks/use-walk-actions';
import { isApiConfigured } from '@/services/api';
import { haversineMeters } from '@/lib/geo';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_ATTEMPTS   = 3;
const LOCKOUT_MS     = 2 * 60 * 1000;
const WINDOW_MINUTES = 15;
const RADIUS_METERS  = 300;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCountdown(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── OTP Input ────────────────────────────────────────────────────────────────

function OtpInput({
  value,
  onChange,
  disabled,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  // Auto-focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(idx: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const arr   = [...value.padEnd(4, ' ')];
    arr[idx]    = digit || ' ';
    const next  = arr.join('').replace(/ /g, '');
    onChange(next);
    if (digit && idx < 3) inputRefs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (value[idx]) {
        const arr = [...value.padEnd(4, ' ')];
        arr[idx]  = ' ';
        onChange(arr.join('').replace(/ /g, ''));
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    onChange(pasted);
    const nextFocus = Math.min(pasted.length, 3);
    inputRefs.current[nextFocus]?.focus();
  }

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            'w-14 h-16 text-center text-2xl font-bold rounded-lg border-2 bg-background outline-none transition-all duration-150',
            'focus:ring-2',
            hasError
              ? 'border-destructive/60 focus:border-destructive focus:ring-destructive/20 text-destructive'
              : 'border-border hover:border-primary/40 focus:border-primary focus:ring-primary/20',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        />
      ))}
    </div>
  );
}

// ─── Geo status chip ──────────────────────────────────────────────────────────

type GeoStatus = 'checking' | 'near' | 'far' | 'unavailable' | 'simulated';

function GeoChip({ status }: { status: GeoStatus }) {
  if (status === 'checking') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Verificando sua localização...
      </div>
    );
  }
  if (status === 'near') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
        <MapPin className="h-3 w-3 shrink-0" />
        Você está próximo ao local de início ✓
      </div>
    );
  }
  if (status === 'simulated') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
        <MapPin className="h-3 w-3 shrink-0" />
        Localização: modo de desenvolvimento
      </div>
    );
  }
  if (status === 'unavailable') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
        <MapPin className="h-3 w-3 shrink-0" />
        Localização indisponível — verifique as permissões
      </div>
    );
  }
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  walkId:      string;
  scheduledAt: string;
  startLat?:   number;
  startLng?:   number;
}

export function WalkStartSection({ walkId, scheduledAt, startLat, startLng }: Props) {
  const router = useRouter();
  const { mutate: startWalk, isPending } = useStartWalk();

  // ── Time ──────────────────────────────────────────────────────────────────
  const [secsToWindow, setSecsToWindow] = useState(0);

  useEffect(() => {
    function tick() {
      const windowStart = new Date(scheduledAt).getTime() - WINDOW_MINUTES * 60_000;
      setSecsToWindow(Math.max(0, Math.ceil((windowStart - Date.now()) / 1000)));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [scheduledAt]);

  const isTimeReady = secsToWindow === 0;

  // ── Geolocation ───────────────────────────────────────────────────────────
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('checking');
  const withinRange = geoStatus !== 'far';

  useEffect(() => {
    if (!isApiConfigured) {
      setGeoStatus('simulated');
      return;
    }
    if (!startLat || !startLng || !navigator.geolocation) {
      setGeoStatus('unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = haversineMeters(
          pos.coords.latitude,
          pos.coords.longitude,
          startLat,
          startLng,
        );
        setGeoStatus(dist <= RADIUS_METERS ? 'near' : 'far');
      },
      () => setGeoStatus('unavailable'),
      { timeout: 10_000, enableHighAccuracy: true },
    );
  }, [startLat, startLng]);

  const canStart = isTimeReady && withinRange;

  // ── Lockout ───────────────────────────────────────────────────────────────
  const [lockedUntil,  setLockedUntil]  = useState<number | null>(null);
  const [lockSecsLeft, setLockSecsLeft] = useState(0);
  const [attempts,     setAttempts]     = useState(0);

  useEffect(() => {
    if (!lockedUntil) return;
    function tick() {
      const left = Math.max(0, Math.ceil((lockedUntil! - Date.now()) / 1000));
      setLockSecsLeft(left);
      if (left === 0) { setLockedUntil(null); setAttempts(0); }
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const isLocked = !!lockedUntil && Date.now() < lockedUntil;

  // ── Modal ─────────────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [code,      setCode]      = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  function openModal() {
    setCode('');
    setCodeError(null);
    setShowModal(true);
  }

  function closeModal() {
    if (isPending) return;
    setShowModal(false);
    setCode('');
    setCodeError(null);
  }

  function handleSubmit() {
    if (code.length < 4 || isPending) return;
    setCodeError(null);

    startWalk({ walkId, code }, {
      onSuccess: () => {
        closeModal();
        toast.success('Passeio iniciado!', {
          description: 'O cliente foi notificado. Bom passeio!',
        });
        router.push(`/walks/${walkId}/tracking`);
      },
      onError: () => {
        const next = attempts + 1;
        setAttempts(next);
        setCode('');
        if (next >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_MS);
          setShowModal(false);
          toast.error('Muitas tentativas incorretas', {
            description: 'Aguarde 2 minutos para tentar novamente.',
          });
        } else {
          const left = MAX_ATTEMPTS - next;
          setCodeError(
            `Código incorreto. ${left} tentativa${left > 1 ? 's' : ''} restante${left > 1 ? 's' : ''}.`,
          );
        }
      },
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLocked) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
          <Lock className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <p className="text-sm font-semibold text-destructive">Acesso temporariamente bloqueado</p>
          <p className="mt-0.5 text-xs text-destructive/70">
            Muitas tentativas incorretas. Tente novamente em {fmtCountdown(lockSecsLeft)}.
          </p>
        </div>
      </div>
    );
  }

  if (!isTimeReady) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-5 py-5 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Aguardando janela de início</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Botão disponível 15 min antes do horário agendado
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold tabular-nums text-primary">{fmtCountdown(secsToWindow)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">até liberar</p>
          </div>
        </div>
        <GeoChip status={geoStatus} />
      </div>
    );
  }

  if (geoStatus === 'far') {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
            <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              Você está longe do local de início
            </p>
            <p className="mt-0.5 text-xs text-amber-600/70 dark:text-amber-400/70">
              Aproxime-se a até {RADIUS_METERS} m do endereço para iniciar o passeio
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/[0.08] to-emerald-500/[0.03] px-5 py-5 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/20">
              <PlayCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Tudo pronto para iniciar
              </p>
              <p className="mt-0.5 text-xs text-emerald-600/70 dark:text-emerald-400/70">
                Peça o código de 4 dígitos ao cliente e confirme o início
              </p>
            </div>
          </div>
          <Button
            onClick={openModal}
            size="lg"
            className="shrink-0 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer rounded-lg"
          >
            <KeyRound className="h-4 w-4" />
            Iniciar passeio
          </Button>
        </div>
        <GeoChip status={geoStatus} />
      </div>

      {/* ── Code modal ──────────────────────────────────────────────────────── */}
      <Dialog open={showModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent showCloseButton={false} className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">Código de verificação</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Peça o código de 4 dígitos ao cliente
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <OtpInput
              value={code}
              onChange={setCode}
              disabled={isPending}
              hasError={!!codeError}
            />

            {codeError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                <p className="text-xs text-destructive">{codeError}</p>
              </div>
            )}
          </div>

          <div className="-mx-4 -mb-4 flex flex-col gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              className="cursor-pointer"
              onClick={closeModal}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              className="gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              disabled={code.length < 4 || isPending}
              onClick={handleSubmit}
            >
              {isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CheckCircle2 className="h-4 w-4" />}
              {isPending ? 'Verificando...' : 'Confirmar início'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
