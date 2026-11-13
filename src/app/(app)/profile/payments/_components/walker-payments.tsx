'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button, TOUCH_TARGET } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  History,
  Loader2,
  TrendingUp,
  Wallet,
  WalletCards,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useWalkerEarnings } from '@/features/walkers/hooks/use-walkers';
import { useWalkerStats } from '@/features/stats/hooks/use-stats';
import { useWalks } from '@/features/walks/hooks/use-walks';
import { WalkListAvatar } from '@/components/common/walk-list-avatar';
import type { EarningsParams, PaymentHistoryItem, WalkRecord } from '@/types';

// ─── Period filter ────────────────────────────────────────────────────────────

type PeriodPreset = 'this_month' | 'last_month' | 'last_3_months' | 'all';

const PERIOD_LABELS: Record<PeriodPreset, string> = {
  this_month: 'Este mês',
  last_month: 'Mês anterior',
  last_3_months: 'Últimos 3 meses',
  all: 'Tudo',
};

function toIsoDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function periodToParams(preset: PeriodPreset): EarningsParams {
  const now = new Date();
  if (preset === 'this_month') {
    return { from: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)), to: toIsoDate(now) };
  }
  if (preset === 'last_month') {
    const firstOfLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastOfLast = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: toIsoDate(firstOfLast), to: toIsoDate(lastOfLast) };
  }
  if (preset === 'last_3_months') {
    return { from: toIsoDate(new Date(now.getFullYear(), now.getMonth() - 3, 1)), to: toIsoDate(now) };
  }
  return {};
}

function PeriodFilter({ value, onChange }: { value: PeriodPreset; onChange: (p: PeriodPreset) => void }) {
  return (
    // Phones: one row that scrolls sideways, edge to edge, with thumb-sized chips.
    <div className="-mx-4 flex gap-2 overflow-x-auto no-scrollbar px-4 py-1 md:mx-0 md:flex-wrap md:gap-1.5 md:overflow-visible md:px-0 md:py-0">
      {(Object.keys(PERIOD_LABELS) as PeriodPreset[]).map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={(e) => {
            onChange(preset);
            // Keep the chosen chip fully in view in the scrolling row.
            e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          }}
          aria-pressed={value === preset}
          className={cn(
            'relative h-9 shrink-0 px-3.5 rounded-lg text-sm font-medium transition-colors duration-150 md:h-auto md:px-3 md:py-1.5 md:text-xs',
            TOUCH_TARGET,
            value === preset
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {PERIOD_LABELS[preset]}
        </button>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: number) {
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

// ─── Earnings sidebar ─────────────────────────────────────────────────────────

function EarningsSidebar() {
  const { data: stats, isLoading } = useWalkerStats();

  return (
    <Card className="overflow-hidden bg-primary border-primary/80">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-foreground/10 flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-primary-foreground">
              Seus ganhos
            </CardTitle>
          </div>
          {/* Phones: today's earnings ride in the header instead of taking a row. */}
          {!isLoading && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary-foreground/10 px-2.5 py-1 text-xs text-primary-foreground/80 md:hidden">
              <TrendingUp className="h-3 w-3 shrink-0" />
              Hoje <span className="font-semibold tabular-nums text-primary-foreground">{formatAmount(stats?.earningsToday ?? 0)}</span>
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-8 w-28 rounded bg-primary-foreground/20" />
            <div className="h-3 w-20 rounded bg-primary-foreground/20" />
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-primary-foreground/60 uppercase tracking-wider">
                Este mês
              </p>
              <p className="text-3xl font-bold tracking-tight text-primary-foreground leading-none">
                {formatAmount(stats?.earningsMonth ?? 0)}
              </p>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg bg-primary-foreground/10 px-3 py-2 max-md:hidden">
              <TrendingUp className="w-3.5 h-3.5 text-primary-foreground/70 shrink-0" />
              <span className="text-xs text-primary-foreground/80">
                Hoje: <span className="font-semibold">{formatAmount(stats?.earningsToday ?? 0)}</span>
              </span>
            </div>
          </>
        )}

        <Button
          variant="secondary"
          size="sm"
          className="w-full rounded-md gap-1.5 max-md:h-11 max-md:text-sm"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          Solicitar saque
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Earning row ──────────────────────────────────────────────────────────────

const STATUS_PILL: Record<PaymentHistoryItem['status'], { label: string; className: string }> = {
  paid: {
    label: 'Concluído',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  pending: {
    label: 'Pendente',
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  failed: {
    label: 'Falha',
    className: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400',
  },
};

/**
 * Phones: the same row as the dashboard's "Últimos passeios" (dog first, tutor in
 * the corner, "+R$" in emerald). md+ keeps the original row. `walk` comes from the
 * walker's cached walks list and may be missing, so everything falls back to the
 * payment's own description.
 */
function EarningRow({ item, walk }: { item: PaymentHistoryItem; walk?: WalkRecord }) {
  const firstPet = walk?.pets?.[0] ?? { name: walk?.petNames[0] ?? item.description, photoUrl: null };
  const pill = STATUS_PILL[item.status];

  return (
    <Link href={`/walks/${item.walkId}`}>
      <div className="group flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors duration-150 cursor-pointer md:gap-4 md:px-5 md:py-4">
        <div className="md:hidden">
          <WalkListAvatar
            main={{ ...firstPet, kind: 'dog' }}
            corner={walk ? { name: walk.clientName, photoUrl: walk.clientAvatarUrl, kind: 'person' } : undefined}
          />
        </div>
        <div className="min-w-0 flex-1 md:hidden">
          <p className="truncate text-sm font-semibold text-foreground">
            {walk ? walk.petNames.join(' & ') : item.description}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {walk ? `${walk.clientName} · ${formatDate(item.date)}` : formatDate(item.date)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 md:hidden">
          <span
            className={cn(
              'text-sm font-bold tabular-nums',
              item.status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground',
            )}
          >
            {item.status === 'paid' ? '+' : ''}
            {formatAmount(item.amount)}
          </span>
          <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium', pill.className)}>
            {pill.label}
          </span>
        </div>

        <div className="max-md:hidden w-9 h-9 rounded-xl bg-primary/8 ring-1 ring-primary/15 flex items-center justify-center shrink-0 text-xs font-semibold text-primary">
          {item.description.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 max-md:hidden">
          <span className="text-sm font-semibold text-foreground">{item.description}</span>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.date)}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 max-md:hidden">
          <div className="text-right">
            <p className="text-sm font-bold text-foreground tabular-nums">
              {formatAmount(item.amount)}
            </p>
            {item.status === 'paid' && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">
                Concluído
              </p>
            )}
            {item.status === 'pending' && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide">
                Pendente
              </p>
            )}
            {item.status === 'failed' && (
              <p className="text-[10px] text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide">
                Falha
              </p>
            )}
          </div>
          <div className="flex w-7 h-7 rounded-lg border border-border/50 bg-muted/40 items-center justify-center text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-primary/5 hover:border-primary/30 hover:text-primary">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WalkerPayments() {
  const [period, setPeriod] = useState<PeriodPreset>('this_month');
  const { data: history = [], isLoading, isError, refetch } = useWalkerEarnings(periodToParams(period));
  const periodTotal = history.reduce((sum, item) => sum + item.amount, 0);

  // Same query (and cache) the bottom nav already keeps for the walker: the dogs'
  // photos for the rows cost no extra request.
  const { data: session } = useSession();
  const userId = session?.user?.id ?? '';
  const { data: walks = [] } = useWalks('walker', userId, { enabled: !!userId });
  const walksById = useMemo(() => new Map(walks.map((w) => [w.id, w])), [walks]);

  return (
    <div className="flex flex-col gap-5 pb-8 md:gap-8 lg:flex-row lg:items-start lg:gap-10">
      {/* Phones: a plain tab title above the balance (no back arrow: this is a bottom-nav tab). */}
      <h1 className="order-first -mb-1 text-2xl font-bold leading-tight tracking-tight text-foreground md:hidden">
        Meus Ganhos
      </h1>
      <div className="flex min-w-0 flex-1 flex-col gap-5 md:gap-8">
        <header className="space-y-1.5 max-md:hidden">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              render={<Link href="/profile" />}
              aria-label="Voltar ao perfil"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                Meus Ganhos
              </h1>
              <p className="text-sm text-muted-foreground">
                Acompanhe seus repasses e histórico de serviços.
              </p>
            </div>
          </div>
        </header>

        <section className="space-y-3 min-w-0">
          <div className="flex items-baseline justify-between gap-3 md:hidden">
            <h2 className="text-sm font-semibold text-foreground">Histórico</h2>
            {!isLoading && !isError && history.length > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold tabular-nums text-foreground">{formatAmount(periodTotal)}</span>
                {' · '}
                {history.length} passeio{history.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 max-md:hidden">
            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <History className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Histórico de ganhos
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <PeriodFilter value={period} onChange={setPeriod} />

          {/* Phones: rows shaped like the list that's coming, not a spinner. */}
          {isLoading && (
            <div className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-card md:hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-16 max-md:hidden rounded-2xl border border-border/60 bg-card text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Carregando ganhos...</span>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-4 py-12 rounded-2xl border border-border/60 bg-card text-center">
              <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Erro ao carregar</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Não foi possível buscar o histórico de ganhos.
                </p>
              </div>
              <Button variant="outline" size="sm" className="max-md:h-11 max-md:px-5" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          )}

          {!isLoading && !isError && history.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-12 rounded-2xl border border-border/60 bg-card text-center">
              <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
                <WalletCards className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="max-md:hidden">
                <p className="text-sm font-semibold text-foreground">Nenhum ganho ainda</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Seus ganhos aparecerão aqui após concluir passeios.
                </p>
              </div>
              {/* Phones: say whether it's this period or ever, and offer the way out. */}
              <div className="px-6 md:hidden">
                <p className="text-sm font-semibold text-foreground">
                  {period === 'all' ? 'Nenhum ganho ainda' : 'Nenhum ganho neste período'}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {period === 'all'
                    ? 'Seus ganhos aparecerão aqui após concluir passeios.'
                    : 'Os passeios concluídos no período escolhido aparecem aqui.'}
                </p>
              </div>
              {period !== 'all' && (
                <Button variant="outline" className="h-11 px-5 md:hidden" onClick={() => setPeriod('all')}>
                  Ver todo o histórico
                </Button>
              )}
            </div>
          )}

          {!isLoading && !isError && history.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/50">
              {history.map((item: PaymentHistoryItem) => (
                <EarningRow key={item.id} item={item} walk={walksById.get(item.walkId)} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* On phones this is the Ganhos tab: the balance is the first thing to see. */}
      <aside className="w-full shrink-0 max-md:order-first lg:w-72 lg:sticky lg:top-37 lg:self-start">
        <EarningsSidebar />
      </aside>
    </div>
  );
}
