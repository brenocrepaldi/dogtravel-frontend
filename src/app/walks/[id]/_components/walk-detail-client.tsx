'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  MapPin,
  MessageSquare,
  PawPrint,
  Route,
  Star,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useWalkById } from '@/features/walks/hooks/use-walks';
import { useWalkerById } from '@/features/walkers/hooks/use-walkers';
import { useReview } from '@/features/reviews/hooks/use-reviews';
import { usePaymentMethods } from '@/features/payments/hooks/use-payments';
import { WalkRouteMapClient } from './walk-route-map-client';
import { WalkPets } from './walk-pets';
import { WalkStartSection } from './walk-start-section';
import { ClientCodeBanner } from './client-code-banner';
import { WalkInProgressPanel } from './walk-inprogress-panel';
import { WalkClientInProgressPanel } from './walk-client-inprogress-panel';
import { WalkLiveMapPreview } from './walk-live-map-preview';
import { WalkDetailSkeleton } from './walk-detail-skeleton';
import { TimelineCard, InfoRow } from './walk-timeline-card';
import { WalkerCard } from './walk-detail-walker-card';
import { ClientCard } from './walk-detail-client-card';
import { PaymentCard, EarningCard } from './walk-detail-payment-card';
import { toMoney } from './walk-detail-helpers';
import { PIX_INSTANT_ID } from '@/config/pricing';
import type { WalkStatus, ManagedPaymentMethod } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  WalkStatus,
  { label: string; variant: 'warning' | 'info' | 'default' | 'success' | 'destructive' }
> = {
  pending: { label: 'Aguardando', variant: 'warning' },
  accepted: { label: 'Confirmado', variant: 'info' },
  in_progress: { label: 'Em andamento', variant: 'default' },
  completed: { label: 'Concluído', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

// ─── Main client component ────────────────────────────────────────────────────

export function WalkDetailClient({ walkId }: { walkId: string }) {
  const { data: session } = useSession();
  const isWalker = session?.user?.role === 'walker';

  const { data: walk, isLoading: walkLoading } = useWalkById(walkId);
  const { data: walker } = useWalkerById(walk?.walkerId ?? '', { enabled: !!walk?.walkerId });
  const { data: review } = useReview(walkId);
  const { data: paymentMethods = [] } = usePaymentMethods();

  if (walkLoading) return <WalkDetailSkeleton />;

  if (!walk) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <p className="text-sm text-muted-foreground">Passeio não encontrado.</p>
        <Link
          href="/walks"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Voltar para meus passeios
        </Link>
      </div>
    );
  }

  const pixInstantMethod: ManagedPaymentMethod = {
    id: PIX_INSTANT_ID,
    type: 'pix',
    brand: null,
    label: 'Pagamento instantâneo via QR Code',
    holderName: '',
    expiresAt: '--',
    isDefault: false,
    status: 'active',
  };

  const paymentMethod: ManagedPaymentMethod | undefined =
    walk.paymentMethodId === PIX_INSTANT_ID
      ? pixInstantMethod
      : paymentMethods.find((m) => m.id === walk.paymentMethodId);
  const statusCfg = STATUS_CONFIG[walk.status] ?? STATUS_CONFIG.pending;

  const isInProgress = walk.status === 'in_progress';
  const isCompleted = walk.status === 'completed';
  const isCancelled = walk.status === 'cancelled';
  const isAccepted = walk.status === 'accepted';
  const hasRoute = walk.distanceKm > 0;

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/walks"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              '-ml-2 text-muted-foreground hover:text-foreground',
            )}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Meus passeios
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-foreground">
              Passeio com{' '}
              <span className="text-primary">
                {walk.petNames.length > 1
                  ? `${walk.petNames.slice(0, -1).join(', ')} & ${walk.petNames[walk.petNames.length - 1]}`
                  : walk.petNames[0] ?? '…'}
              </span>
            </h1>
            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {isWalker
              ? `${walk.clientName} · ${walk.dateLabel}`
              : `${walk.petNames.join(' & ')} · ${walk.dateLabel}`}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {isWalker ? (
            <>
              {isAccepted && (
                <Link
                  href={`/walks/${walk.id}/chat`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  Chat com cliente
                </Link>
              )}
            </>
          ) : (
            <>
              {isCancelled && (
                <Link
                  href="/walks/new"
                  className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
                >
                  Solicitar novo passeio
                </Link>
              )}
              {(isAccepted || walk.status === 'pending') && (
                <Link
                  href={`/walks/${walk.id}/chat`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  Abrir chat
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Banners ────────────────────────────────────────────────────────── */}

      {isWalker && isInProgress && <WalkInProgressPanel walk={walk} />}

      {!isWalker && isInProgress && (
        <WalkClientInProgressPanel walk={walk} walker={walker} />
      )}

      {!isWalker && isCompleted && !review && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.08] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <Star className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Como foi o passeio?
              </p>
              <p className="mt-0.5 text-xs text-amber-600/70 dark:text-amber-400/70">
                Sua avaliação ajuda outros tutores a escolherem o melhor passeador
              </p>
            </div>
          </div>
          <Link
            href={`/walks/${walk.id}/review`}
            className={cn(
              buttonVariants({ size: 'sm' }),
              'shrink-0 border-0 bg-amber-500 text-white hover:bg-amber-600',
            )}
          >
            Avaliar
          </Link>
        </div>
      )}

      {!isWalker && isCompleted && review && (
        <div className="flex items-start gap-4 rounded-xl border border-border bg-muted/30 px-5 py-4">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <Star className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">Sua avaliação</p>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3.5 w-3.5',
                      i < review.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted-foreground/30',
                    )}
                  />
                ))}
              </div>
            </div>
            {review.comment && (
              <p className="mt-0.5 text-sm text-muted-foreground">&quot;{review.comment}&quot;</p>
            )}
          </div>
        </div>
      )}

      {isWalker && isCompleted && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.10] to-emerald-500/[0.03] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Passeio concluído
              </p>
              <p className="mt-0.5 text-xs text-emerald-600/70 dark:text-emerald-400/70">
                {toMoney(walk.price)} creditado
                {hasRoute ? ` · ${walk.distanceKm.toFixed(1)} km percorridos` : ''}
                {` · ${walk.durationMinutes} min`}
              </p>
            </div>
          </div>
          {review && (
            <div className="shrink-0 flex flex-col items-end gap-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3.5 w-3.5',
                      i < review.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted-foreground/30',
                    )}
                  />
                ))}
              </div>
              <p className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60">
                avaliação do cliente
              </p>
            </div>
          )}
        </div>
      )}

      {isCancelled && (
        <div className="rounded-xl border border-border bg-muted/40 px-5 py-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Passeio cancelado</span>
            {walk.notes ? ` — ${walk.notes}` : '.'}
          </p>
        </div>
      )}

      {isWalker && isAccepted && (
        <WalkStartSection
          walkId={walk.id}
          scheduledAt={walk.scheduledAt}
          startLat={walk.startLat}
          startLng={walk.startLng}
        />
      )}

      {!isWalker && isAccepted && walk.startCode && (
        <ClientCodeBanner code={walk.startCode} />
      )}

      {/* ── Layout A — com trajeto GPS ──────────────────────────────────── */}
      {hasRoute ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {isInProgress && (
              <WalkLiveMapPreview
                walkId={walk.id}
                startLat={walk.startLat}
                startLng={walk.startLng}
                petNames={walk.petNames}
                pets={walk.pets}
                walkerAvatarUrl={walk.walkerAvatarUrl}
              />
            )}
            <Card className="overflow-hidden py-0 gap-0">
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Trajeto percorrido</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {walk.distanceKm.toFixed(1)} km · {walk.startAddress}
                    {walk.endAddress ? ` → ${walk.endAddress}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Início
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    Fim
                  </span>
                </div>
              </div>
              <div className="relative h-[280px] sm:h-[340px]">
                <WalkRouteMapClient walkId={walk.id} />
              </div>
            </Card>

            <Card className="overflow-hidden py-0 gap-0">
              <div className="border-b border-border/60 px-5 py-3.5">
                <h2 className="text-sm font-semibold text-foreground">Informações</h2>
              </div>
              <CardContent className="divide-y divide-border/60 p-0">
                <InfoRow icon={Calendar} label="Data e horário" value={walk.dateLabel} />
                <InfoRow icon={Timer} label="Duração" value={`${walk.durationMinutes} minutos`} />
                <InfoRow
                  icon={Route}
                  label="Distância"
                  value={`${walk.distanceKm.toFixed(1)} km`}
                />
                <InfoRow icon={MapPin} label="Saída" value={walk.startAddress} />
                {walk.endAddress && (
                  <InfoRow icon={MapPin} label="Destino" value={walk.endAddress} />
                )}
                {walk.petNames.length > 0 && (
                  <div className="flex items-start gap-3 px-5 py-4">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <PawPrint className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Cães
                      </p>
                      <div className="mt-3">
                        <WalkPets petNames={walk.petNames} pets={walk.pets} />
                      </div>
                    </div>
                  </div>
                )}
                {walk.notes && !isCancelled && (
                  <div className="flex items-start gap-3 px-5 py-4">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Observações
                      </p>
                      <p className="mt-0.5 text-sm text-foreground">{walk.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <TimelineCard timeline={walk.timeline} isLive={isWalker && isInProgress} />
          </div>

          <div className="space-y-5">
            {isWalker ? (
              <ClientCard
                walkId={walk.id}
                clientId={walk.clientId}
                clientName={walk.clientName}
                clientAvatarUrl={walk.clientAvatarUrl}
                petNames={walk.petNames}
                address={walk.startAddress}
                showChat={isInProgress || isAccepted}
              />
            ) : (
              walker && <WalkerCard walker={walker} compact />
            )}
            {isWalker ? (
              <EarningCard price={walk.price} status={walk.status} />
            ) : (
              <PaymentCard price={walk.price} paymentMethod={paymentMethod} />
            )}
          </div>
        </div>
      ) : (
        /* ── Layout B — sem trajeto GPS ──────────────────────────────────── */
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {isInProgress && (
              <WalkLiveMapPreview
                walkId={walk.id}
                startLat={walk.startLat}
                startLng={walk.startLng}
                petNames={walk.petNames}
                pets={walk.pets}
                walkerAvatarUrl={walk.walkerAvatarUrl}
              />
            )}
            <Card className="overflow-hidden py-0 gap-0">
              <div className="border-b border-border/60 px-5 py-4">
                <h2 className="text-sm font-semibold text-foreground">Detalhes do passeio</h2>
              </div>
              <CardContent className="divide-y divide-border/60 p-0">
                <InfoRow icon={Calendar} label="Data e horário" value={walk.dateLabel} />
                <InfoRow icon={Timer} label="Duração" value={`${walk.durationMinutes} minutos`} />
                <InfoRow icon={MapPin} label="Local de partida" value={walk.startAddress} />
                {walk.notes && !isCancelled && (
                  <div className="flex items-start gap-3 px-5 py-4">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Observações
                      </p>
                      <p className="mt-0.5 text-sm text-foreground">{walk.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <TimelineCard timeline={walk.timeline} isLive={isWalker && isInProgress} />
          </div>

          <div className="space-y-5">
            {isWalker ? (
              <ClientCard
                walkId={walk.id}
                clientId={walk.clientId}
                clientName={walk.clientName}
                clientAvatarUrl={walk.clientAvatarUrl}
                petNames={walk.petNames}
                address={walk.startAddress}
                showChat={isInProgress || isAccepted}
              />
            ) : (
              walker && <WalkerCard walker={walker} />
            )}

            <Card className="overflow-hidden py-0 gap-0">
              <div className="border-b border-border/60 px-5 py-4">
                <h2 className="text-sm font-semibold text-foreground">Cães</h2>
              </div>
              <CardContent className="p-5">
                <WalkPets petNames={walk.petNames} pets={walk.pets} />
              </CardContent>
            </Card>

            {isWalker ? (
              <EarningCard price={walk.price} status={walk.status} />
            ) : (
              <PaymentCard price={walk.price} paymentMethod={paymentMethod} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
