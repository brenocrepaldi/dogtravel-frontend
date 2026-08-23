'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  BadgeCheck,
  CheckCircle2,
  MessageSquare,
  Navigation,
  PawPrint,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCountdown } from '@/features/tracking/hooks/use-countdown';
import type { WalkRecord, WalkerProfile } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatElapsed(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  walk: WalkRecord;
  walker?: WalkerProfile;
}

export function WalkClientInProgressPanel({ walk, walker }: Props) {
  const totalSeconds = walk.durationMinutes * 60;
  const { remaining, progress, done } = useCountdown(walk.startedAt, walk.durationMinutes);
  const elapsed = totalSeconds - remaining;

  return (
    <Card className="overflow-hidden py-0 gap-0 ring-1 ring-emerald-500/20">
      {/* ── Accent bar ───────────────────────────────────────────────────── */}
      <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />

      {/* ── Header ───────────────────────────────────────────────────────── */}
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
            · {walk.petNames.join(' & ')} com {walker?.name ?? 'o passeador'}
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
            className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'gap-1.5')}
          >
            <Navigation className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Acompanhar</span>
          </Link>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <CardContent className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-y-0 sm:divide-x divide-border/60 p-0">

        {/* ── Left: Elapsed time ───────────────────────────────────────── */}
        <div className="flex flex-col justify-center gap-4 px-6 py-6">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {done ? 'Tempo cumprido' : 'Tempo de passeio'}
            </p>
          </div>

          <div className="flex items-end gap-3">
            <p className={cn(
              'font-mono text-6xl font-bold leading-none tracking-tight tabular-nums',
              done ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground',
            )}>
              {formatElapsed(elapsed)}
            </p>
            {done && <CheckCircle2 className="mb-1 h-6 w-6 text-emerald-500" />}
          </div>

          <div className="space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000 ease-linear',
                  done ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-primary/80',
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {walk.durationMinutes} min contratados
            </p>
          </div>
        </div>

        {/* ── Right: Walker info ────────────────────────────────────────── */}
        <div className="flex flex-col justify-center gap-4 px-6 py-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Seu passeador
            </p>

            {walker ? (
              <div className="flex items-center gap-3">
                {walker.avatarUrl ? (
                  <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl">
                    <Image src={walker.avatarUrl} alt={walker.name} fill sizes="52px" className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                    {initials(walker.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-foreground truncate">{walker.name}</p>
                    {walker.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {walker.trustChecks.identityVerified && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-500" />
                        Identidade verificada
                      </div>
                    )}
                    {walker.trustChecks.backgroundCheck && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-500" />
                        Antecedentes verificados
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-13 w-13 shrink-0 rounded-xl bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-lg border border-emerald-200/60 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-400">
              <PawPrint className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {walk.petNames.length > 1
                ? `${walk.petNames.join(' & ')} estão em boas mãos`
                : `${walk.petNames[0]} está em boas mãos`}
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
