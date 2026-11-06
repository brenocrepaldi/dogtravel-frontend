'use client';

import { KeyRound } from 'lucide-react';

interface Props {
  code: string;
}

export function ClientCodeBanner({ code }: Props) {
  const digits = code.padStart(4, '0').split('');

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/[0.05] px-5 py-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <KeyRound className="h-4.5 w-4.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Código de início do passeio</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Informe este código ao passeador quando ele chegar
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        {digits.map((digit, i) => (
          <div
            key={i}
            className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-primary/30 bg-background text-2xl font-bold tracking-widest text-primary shadow-sm"
          >
            {digit}
          </div>
        ))}
      </div>
    </div>
  );
}
