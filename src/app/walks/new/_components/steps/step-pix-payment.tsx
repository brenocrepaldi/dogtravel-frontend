"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Smartphone, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { WalkFormData } from "../walk-request-form";

// Mock PIX key shown to the client during checkout — will come from the payments API.
const PIX_MOCK_KEY = "pagamentos@dogtravel.com.br";

// ── Mock QR Code (SVG) ──────────────────────────────────────────────────────

function MockQrCode() {
  const S = 25;

  function finder(r: number, c: number, or_: number, oc: number): boolean | null {
    const dr = r - or_, dc = c - oc;
    if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return null;
    if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return true;
    if (dr === 1 || dr === 5 || dc === 1 || dc === 5) return false;
    return true; // inner 3×3 square
  }

  function cell(r: number, c: number): boolean {
    const tl = finder(r, c, 0, 0);
    if (tl !== null) return tl;
    const tr = finder(r, c, 0, S - 7);
    if (tr !== null) return tr;
    const bl = finder(r, c, S - 7, 0);
    if (bl !== null) return bl;
    // data area — deterministic pseudo-random
    return ((r * 11 + c * 7 + (r ^ c) * 3) % 4 !== 0);
  }

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="w-full h-full text-foreground">
      {Array.from({ length: S }, (_, r) =>
        Array.from({ length: S }, (_, c) =>
          cell(r, c) ? (
            <rect key={`${r}-${c}`} x={c} y={r} width={0.88} height={0.88} rx={0.1} fill="currentColor" />
          ) : null,
        ),
      )}
    </svg>
  );
}

// ── Component ───────────────────────────────────────────────────────────────

interface Props {
  data:   WalkFormData;
  onDone: () => void;
}

function fmt(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function StepPixPayment({ data, onDone }: Props) {
  const [copied, setCopied] = useState(false);

  function copyKey() {
    navigator.clipboard.writeText(PIX_MOCK_KEY).catch(() => {});
    setCopied(true);
    toast.success("Chave PIX copiada!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Passeio solicitado!</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Conclua o pagamento PIX para confirmar o pedido.
          </p>
        </div>
      </div>

      <Separator />

      {/* PIX label + expiry */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Smartphone className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Pagar com PIX</p>
          <p className="text-xs text-muted-foreground">Escaneie o QR Code ou copie a chave</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 shrink-0">
          <Timer className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">29:59</span>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="rounded-2xl border-2 border-border bg-background p-5 w-52 h-52">
          <MockQrCode />
        </div>
      </div>

      {/* PIX key + copy */}
      <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Chave PIX
        </p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-mono text-foreground flex-1 truncate">{PIX_MOCK_KEY}</p>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="gap-1.5 shrink-0 cursor-pointer"
            onClick={copyKey}
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copiado!" : "Copiar"}
          </Button>
        </div>
      </div>

      {/* Amount */}
      {data.estimatedPrice !== null && (
        <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-4">
          <span className="text-sm font-semibold text-foreground">Valor a pagar</span>
          <span className="text-2xl font-bold text-primary">{fmt(data.estimatedPrice)}</span>
        </div>
      )}

      {/* CTA */}
      <Button
        type="button"
        className="w-full cursor-pointer"
        size="lg"
        onClick={onDone}
      >
        Já realizei o pagamento
      </Button>

      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        O pagamento PIX é processado em instantes. Você receberá uma confirmação assim que identificado.
      </p>
    </div>
  );
}
