'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  History,
  Loader2,
  Receipt,
  AlertTriangle,
  WalletCards,
} from 'lucide-react';
import { usePaymentHistory, usePaymentMethods } from '@/features/payments/hooks/use-payments';
import type { PaymentHistoryItem, ManagedPaymentMethod } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: number) {
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

const STATUS_LABEL: Record<PaymentHistoryItem['status'], string> = {
  paid: 'Pago',
  pending: 'Pendente',
  failed: 'Falha',
};

// ─── Payment methods sidebar ──────────────────────────────────────────────────

function PaymentMethodsSidebar() {
  const { data: methods = [], isLoading } = usePaymentMethods();
  const defaultMethod = methods.find((m: ManagedPaymentMethod) => m.isDefault) ?? methods[0];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Forma de pagamento</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Cartão usado nos seus passeios
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3.5 min-h-[72px]">
          {isLoading ? (
            <div className="flex items-center gap-2 animate-pulse">
              <div className="w-9 h-6 rounded-md bg-muted" />
              <div className="space-y-1.5">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-2.5 w-32 rounded bg-muted" />
              </div>
            </div>
          ) : defaultMethod ? (
            <>
              <p className="text-sm font-medium mb-2 text-muted-foreground">Cartão padrão</p>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-6 rounded-md bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-3.5 h-3.5 text-primary/70" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {defaultMethod.brand ? `${defaultMethod.brand} ` : ''}{defaultMethod.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {defaultMethod.holderName}
                    {defaultMethod.type !== 'pix' && ` · expira ${defaultMethod.expiresAt}`}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhum cartão cadastrado.</p>
          )}
        </div>

        <Button
          variant="default"
          size="sm"
          className="w-full py-4"
          render={<Link href="/profile/payment-methods" />}
        >
          Gerenciar formas de pagamento
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Transaction row ──────────────────────────────────────────────────────────

function TransactionRow({ item }: { item: PaymentHistoryItem }) {
  return (
    <Link href={`/walks/${item.walkId}`}>
      <div className="group flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors duration-150 cursor-pointer">
        <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 text-muted-foreground group-hover:bg-muted transition-colors">
          <Receipt className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground truncate">
              {item.description}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.date)}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {item.status === 'paid' && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              {STATUS_LABEL[item.status]}
            </div>
          )}
          {item.status === 'pending' && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
              {STATUS_LABEL[item.status]}
            </div>
          )}
          {item.status === 'failed' && (
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-[11px] font-medium text-red-700 dark:text-red-400">
              {STATUS_LABEL[item.status]}
            </div>
          )}
          <span className="text-sm font-bold text-foreground tabular-nums">
            {formatAmount(item.amount)}
          </span>
          <div className="flex w-7 h-7 rounded-lg border border-border/50 bg-muted/40 items-center justify-center text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-primary/5 hover:border-primary/30 hover:text-primary">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ClientPayments() {
  const { data: history = [], isLoading, isError, refetch } = usePaymentHistory();

  return (
    <div className="flex flex-col gap-8 pb-8 lg:flex-row lg:items-start lg:gap-10">
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <header className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
                  Pagamentos
                </h1>
                <p className="text-sm text-muted-foreground">
                  Acompanhe suas transações e métodos de pagamento.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <History className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Histórico de transações
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-16 rounded-2xl border border-border/60 bg-card text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Carregando transações...</span>
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
                  Não foi possível buscar o histórico de transações.
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
                <p className="text-sm font-semibold text-foreground">Nenhuma transação ainda</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Suas transações aparecerão aqui após o primeiro passeio.
                </p>
              </div>
            </div>
          )}

          {!isLoading && !isError && history.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/50">
              {history.map((item: PaymentHistoryItem) => (
                <TransactionRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="w-full shrink-0 lg:w-72 lg:sticky lg:top-37 lg:self-start">
        <PaymentMethodsSidebar />
      </aside>
    </div>
  );
}
