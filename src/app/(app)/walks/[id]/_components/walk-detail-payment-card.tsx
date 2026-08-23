import { CheckCircle2, Clock, CreditCard, Info, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { ManagedPaymentMethod, WalkStatus } from '@/types';
import { toMoney } from './walk-detail-helpers';

export function CardBrandBadge({ brand }: { brand: string | null }) {
  const b = (brand ?? '').toLowerCase();
  if (b === 'visa') return (
    <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-white shadow-sm">
      <span className="text-[13px] font-black italic tracking-tight text-blue-700">VISA</span>
    </div>
  );
  if (b === 'mastercard') return (
    <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-white shadow-sm">
      <div className="relative flex items-center">
        <div className="h-5 w-5 rounded-full bg-red-500" />
        <div className="-ml-2 h-5 w-5 rounded-full bg-amber-400 opacity-90" />
      </div>
    </div>
  );
  if (b === 'elo') return (
    <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-black shadow-sm">
      <span className="text-[11px] font-bold tracking-wide text-yellow-400">elo</span>
    </div>
  );
  if (b === 'amex' || b === 'american express') return (
    <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-blue-600 shadow-sm">
      <span className="text-[9px] font-bold tracking-wider text-white">AMEX</span>
    </div>
  );
  if (b === 'hipercard') return (
    <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-red-600 shadow-sm">
      <span className="text-[9px] font-bold tracking-tight text-white">HIPER</span>
    </div>
  );
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted">
      <CreditCard className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

export function PaymentCard({
  price,
  paymentMethod,
}: {
  price: number;
  paymentMethod?: ManagedPaymentMethod;
}) {
  const isCard = paymentMethod?.type === 'credit_card' || paymentMethod?.type === 'debit_card';
  const isPix = paymentMethod?.type === 'pix';
  const typeLabel =
    paymentMethod?.type === 'credit_card' ? 'Cartão de crédito'
    : paymentMethod?.type === 'debit_card' ? 'Cartão de débito'
    : 'Pix';

  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div className="border-b border-border/60 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">Pagamento</h2>
      </div>
      <CardContent className="p-5 space-y-4">

        {/* Total */}
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5">
          <span className="text-sm font-semibold text-foreground">Total pago</span>
          <span className="text-xl font-bold text-primary">{toMoney(price)}</span>
        </div>

        {/* Payment method detail */}
        {paymentMethod ? (
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Forma de pagamento
            </p>

            {isCard && (
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3.5">
                <CardBrandBadge brand={paymentMethod.brand} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {typeLabel} &nbsp;••••&nbsp;{paymentMethod.label}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 text-xs text-muted-foreground">
                    {paymentMethod.holderName && (
                      <span className="truncate">{paymentMethod.holderName}</span>
                    )}
                    {paymentMethod.expiresAt && (
                      <span className="shrink-0">· Vence {paymentMethod.expiresAt}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isPix && (
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3.5">
                <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-lg bg-[#32bcad] shadow-sm">
                  <span className="text-[11px] font-bold tracking-wide text-white">PIX</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Pix</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {paymentMethod.label}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Forma de pagamento não disponível</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}

export function EarningCard({ price, status }: { price: number; status: WalkStatus }) {
  const isConfirmed = status === 'completed';
  const isActive = status === 'in_progress';
  const isPending = status === 'accepted' || status === 'pending';
  const isCancelled = status === 'cancelled';

  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div className="border-b border-border/60 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">Ganho</h2>
      </div>
      <CardContent className="p-5 space-y-4">
        <div
          className={cn(
            'rounded-xl border px-5 py-4 space-y-0.5',
            isConfirmed
              ? 'border-emerald-500/20 bg-emerald-500/[0.07]'
              : isActive
                ? 'border-primary/20 bg-primary/[0.05]'
                : isCancelled
                  ? 'border-border/60 bg-muted/40'
                  : 'border-border/60 bg-muted/30',
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {isConfirmed ? 'Valor recebido' : isCancelled ? 'Valor previsto' : 'Seu ganho'}
          </p>
          <p
            className={cn(
              'text-3xl font-bold tracking-tight',
              isConfirmed
                ? 'text-emerald-600 dark:text-emerald-400'
                : isActive
                  ? 'text-primary'
                  : 'text-foreground',
            )}
          >
            {toMoney(price)}
          </p>
          <div className="flex items-center gap-1.5 pt-0.5">
            <TrendingUp
              className={cn('h-3 w-3', isConfirmed ? 'text-emerald-500' : 'text-muted-foreground')}
            />
            <p className="text-[11px] text-muted-foreground">valor bruto do passeio</p>
          </div>
        </div>

        {isConfirmed && (
          <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.07] px-3.5 py-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Pagamento confirmado
              </p>
              <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70">
                Creditado na sua conta
              </p>
            </div>
          </div>
        )}

        {isActive && (
          <div className="flex items-center gap-2.5 rounded-lg border border-primary/15 bg-primary/[0.06] px-3.5 py-2.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <p className="text-xs font-semibold text-primary">Passeio em andamento</p>
          </div>
        )}

        {isPending && (
          <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/40 px-3.5 py-2.5">
            <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Creditado ao concluir o passeio</p>
          </div>
        )}

        {isCancelled && (
          <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/40 px-3.5 py-2.5">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Cancelado — sem cobrança ao cliente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
