'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
import { useWalkerEarnings } from '@/features/walkers/hooks/use-walkers';
import { useWalkerStats } from '@/features/stats/hooks/use-stats';
import type { EarningsParams, PaymentHistoryItem } from '@/types';

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
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(PERIOD_LABELS) as PeriodPreset[]).map((preset) => (
        <button
          key={preset}
          onClick={() => onChange(preset)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150',
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

            <div className="flex items-center gap-1.5 rounded-lg bg-primary-foreground/10 px-3 py-2">
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
          className="w-full rounded-md gap-1.5"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          Solicitar saque
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Earning row ──────────────────────────────────────────────────────────────

function EarningRow({ item }: { item: PaymentHistoryItem }) {
  return (
    <Link href={`/walks/${item.walkId}`}>
      <div className="group flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors duration-150 cursor-pointer">
        <div className="w-9 h-9 rounded-xl bg-primary/8 ring-1 ring-primary/15 flex items-center justify-center shrink-0 text-xs font-semibold text-primary">
          {item.description.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-foreground">{item.description}</span>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.date)}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
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

  return (
    <div className="flex flex-col gap-8 pb-8 lg:flex-row lg:items-start lg:gap-10">
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <header className="space-y-1.5">
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
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <History className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Histórico de ganhos
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <PeriodFilter value={period} onChange={setPeriod} />

          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-16 rounded-2xl border border-border/60 bg-card text-muted-foreground">
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
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          )}

          {!isLoading && !isError && history.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-12 rounded-2xl border border-border/60 bg-card text-center">
              <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
                <WalletCards className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Nenhum ganho ainda</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Seus ganhos aparecerão aqui após concluir passeios.
                </p>
              </div>
            </div>
          )}

          {!isLoading && !isError && history.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/50">
              {history.map((item: PaymentHistoryItem) => (
                <EarningRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="w-full shrink-0 lg:w-72 lg:sticky lg:top-37 lg:self-start">
        <EarningsSidebar />
      </aside>
    </div>
  );
}
