'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
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

const MAX_ATTEMPTS   = 3;
const LOCKOUT_MS     = 2 * 60 * 1000;
const WINDOW_MINUTES = 15;
const RADIUS_METERS  = 300;

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

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

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
    inputRefs.current[Math.min(pasted.length, 3)]?.focus();
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
            'w-14 h-16 text-center text-2xl font-bold rounded-lg border-2 bg-background outline-none transition-all duration-150 focus:ring-2',
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

interface Props {
  walkId:      string;
  scheduledAt: string;
  startLat?:   number;
  startLng?:   number;
}

export function WalkStartButton({ walkId, scheduledAt, startLat, startLng }: Props) {
  // ── Time window ────────────────────────────────────────────────────────────
  const [isTimeReady, setIsTimeReady] = useState(false);

  useEffect(() => {
    function tick() {
      const windowStart = new Date(scheduledAt).getTime() - WINDOW_MINUTES * 60_000;
      setIsTimeReady(Date.now() >= windowStart);
    }
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, [scheduledAt]);

  // ── Geolocation ────────────────────────────────────────────────────────────
  const [withinRange, setWithinRange] = useState(false);

  useEffect(() => {
    if (!isApiConfigured) { setWithinRange(true); return; }
    if (!startLat || !startLng || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = haversineMeters(pos.coords.latitude, pos.coords.longitude, startLat, startLng);
        setWithinRange(dist <= RADIUS_METERS);
      },
      () => {},
      { timeout: 10_000, enableHighAccuracy: true },
    );
  }, [startLat, startLng]);

  const canStart = isTimeReady && withinRange;

  // ── Lockout ────────────────────────────────────────────────────────────────
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

  // ── Modal ──────────────────────────────────────────────────────────────────
  const router  = useRouter();
  const { mutate: startWalk, isPending } = useStartWalk();
  const [showModal, setShowModal] = useState(false);
  const [code,      setCode]      = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  function openModal()  { setCode(''); setCodeError(null); setShowModal(true); }
  function closeModal() { if (isPending) return; setShowModal(false); setCode(''); setCodeError(null); }

  function handleSubmit() {
    if (code.length < 4 || isPending) return;
    setCodeError(null);
    startWalk({ walkId, code }, {
      onSuccess: () => {
        closeModal();
        toast.success('Passeio iniciado!', { description: 'O cliente foi notificado. Bom passeio!' });
        router.push(`/walks/${walkId}/tracking`);
      },
      onError: () => {
        const next = attempts + 1;
        setAttempts(next);
        setCode('');
        if (next >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_MS);
          setShowModal(false);
          toast.error('Muitas tentativas incorretas', { description: 'Aguarde 2 minutos para tentar novamente.' });
        } else {
          const left = MAX_ATTEMPTS - next;
          setCodeError(`Código incorreto. ${left} tentativa${left > 1 ? 's' : ''} restante${left > 1 ? 's' : ''}.`);
        }
      },
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!canStart) return null;

  if (isLocked) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        <Lock className="h-3.5 w-3.5 shrink-0" />
        Bloqueado — {Math.ceil(lockSecsLeft / 60)} min restantes
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={cn(
          buttonVariants({ size: 'lg' }),
          'w-full rounded-lg gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0 cursor-pointer',
        )}
      >
        <KeyRound className="h-3.5 w-3.5" />
        Iniciar passeio
      </button>

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
            <OtpInput value={code} onChange={setCode} disabled={isPending} hasError={!!codeError} />
            {codeError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                <p className="text-xs text-destructive">{codeError}</p>
              </div>
            )}
          </div>

          <div className="-mx-4 -mb-4 flex flex-col gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
            <Button variant="ghost" className="cursor-pointer" onClick={closeModal} disabled={isPending}>
              Cancelar
            </Button>
            <Button
              className="gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              disabled={code.length < 4 || isPending}
              onClick={handleSubmit}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isPending ? 'Verificando...' : 'Confirmar início'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
