"use client";

import { CheckCircle2, Landmark, Lock, Pencil, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hideDocument } from "@/lib/cpf";
import type { WalkerBankAccount } from "@/types";

const ACCOUNT_TYPE_LABEL: Record<WalkerBankAccount["accountType"], string> = {
  checking: "Conta corrente",
  savings: "Conta poupança",
};

/**
 * Phones only: the saved account read back as a card, with editing one tap away. The form
 * is hidden until then, so a walker checking where the money goes reads four lines instead
 * of scanning seven inputs.
 */
export function BankAccountSummary({
  account,
  onEdit,
}: {
  account: WalkerBankAccount;
  onEdit: () => void;
}) {
  return (
    <div className="mb-0 space-y-4 md:hidden">
      {/* The account, laid out like the card it pays into: bank on top, numbers in the
          middle, holder at the bottom. */}
      <section
        aria-label="Conta de repasse"
        className="rounded-2xl border border-primary/20 bg-primary/[0.05] p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">{account.bankName}</p>
            <p className="text-sm text-muted-foreground">{ACCOUNT_TYPE_LABEL[account.accountType]}</p>
          </div>
        </div>

        <dl className="mt-4 flex gap-8">
          <div>
            <dt className="text-xs text-muted-foreground">Agência</dt>
            <dd className="text-lg font-semibold tabular-nums text-foreground">{account.branch}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Conta</dt>
            <dd className="truncate text-lg font-semibold tabular-nums text-foreground">
              {account.accountNumber}
            </dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-primary/15 pt-3">
          <p className="truncate text-sm font-medium text-foreground">{account.holderName}</p>
          <p className="text-sm tabular-nums text-muted-foreground">
            {hideDocument(account.holderDocument)}
          </p>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Cadastrada para os seus repasses
        </p>
      </section>

      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Zap className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Chave PIX</p>
          {account.pixKey ? (
            <p className="truncate text-sm text-muted-foreground">{account.pixKey}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma chave cadastrada</p>
          )}
        </div>
      </div>

      <Button type="button" variant="outline" className="h-11 w-full gap-2 rounded-lg" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
        Editar dados bancários
      </Button>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Usados só para enviar o valor dos seus passeios.
      </p>
    </div>
  );
}
