"use client";

import Image from "next/image";
import {
  BadgeCheck,
  BadgePercent,
  Camera,
  Check,
  CheckCircle2,
  CreditCard,
  Calendar,
  Clock,
  Dog,
  FileText,
  Loader2,
  MapPin,
  MessageSquare,
  PawPrint,
  ShieldCheck,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FlowActions } from "@/components/common/flow-actions";
import { PIX_INSTANT_ID } from "@/config/pricing";
import { useDogs } from "@/features/dogs/hooks/use-dogs";
import { usePaymentMethods } from "@/features/payments/hooks/use-payments";
import { useWalkerById } from "@/features/walkers/hooks/use-walkers";
import type { WalkFormData } from "../walk-request-form";

function fmt(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 last:pb-0">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

interface Props {
  data: WalkFormData;
  updateData: (partial: Partial<WalkFormData>) => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
}

export function StepConfirm({ data, onBack, onSubmit, submitting }: Props) {
  const { data: pets = [] } = useDogs();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const { data: selectedWalker } = useWalkerById(data.selectedWalkerId ?? '');

  const selectedPets = data.selectedPetIds
    .map((id) => pets.find((pet) => pet.id === id))
    .filter(Boolean) as typeof pets;

  const methodLabel =
    data.selectedMethodId === PIX_INSTANT_ID
      ? "PIX — QR Code após confirmação"
      : data.selectedMethodId
        ? (() => {
            const m = paymentMethods.find((method) => method.id === data.selectedMethodId);
            return m ? `${m.brand} ${m.label}` : "—";
          })()
        : "—";

  const dateLabel = data.date
    ? new Date(data.date + "T" + (data.time || "00:00")).toLocaleString("pt-BR", {
        weekday: "long",
        day:     "2-digit",
        month:   "long",
        hour:    "2-digit",
        minute:  "2-digit",
      })
    : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Confirmar pedido</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Revise as informações antes de solicitar o passeio.
          </p>
        </div>
      </div>

      <Separator />

      {/* Summary rows */}
      <div className="divide-y divide-border/60">
        {/* Cães — com avatars */}
        <div className="flex items-start gap-3 py-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
            <Dog className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Cães</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {selectedPets.map((pet) => (
                <div key={pet.id} className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 ring-1 ring-border/30">
                    {pet.photoUrl ? (
                      <Image src={pet.photoUrl} alt={pet.name} fill sizes="32px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-amber-500/10 flex items-center justify-center">
                        <PawPrint className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">{pet.name}</span>
                </div>
              ))}
              {selectedPets.length === 0 && <span className="text-sm text-muted-foreground">—</span>}
            </div>
          </div>
        </div>
        <SummaryRow icon={Calendar}   label="Data e horário"     value={dateLabel} />
        <SummaryRow icon={Clock}      label="Duração"            value={`${data.durationMinutes} minutos`} />
        <SummaryRow icon={MapPin}     label="Local de partida"   value={data.address || "—"} />
        {selectedWalker && (
          <div className="flex items-start gap-3 py-3 last:pb-0">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Passeador solicitado
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-sm font-medium text-foreground">{selectedWalker.name}</p>
                {selectedWalker.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />}
              </div>
            </div>
          </div>
        )}
        <SummaryRow icon={CreditCard} label="Forma de pagamento" value={methodLabel} />
        {data.notes && (
          <SummaryRow icon={FileText} label="Observações" value={data.notes} />
        )}
      </div>

      <Separator />

      {/* Price highlight */}
      {data.estimatedPrice !== null && (
        <div className="space-y-2.5">
          {data.isFirstRide && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <BadgePercent className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Desconto de primeira contratação
                </p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                  15% aplicado no valor total deste pedido
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-4">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">{fmt(data.estimatedPrice)}</span>
          </div>
        </div>
      )}

      {/* Guarantees */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Garantias deste passeio
        </p>
        <div className="space-y-2.5">
          <p className="flex items-center gap-2.5 text-sm text-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            Passeador com identidade e antecedentes verificados
          </p>
          <p className="flex items-center gap-2.5 text-sm text-foreground">
            <Camera className="h-4 w-4 text-primary shrink-0" />
            Fotos, vídeos e rastreamento GPS durante o trajeto
          </p>
          <p className="flex items-center gap-2.5 text-sm text-foreground">
            <MessageSquare className="h-4 w-4 text-primary shrink-0" />
            Chat ativo e suporte durante todo o passeio
          </p>
        </div>
      </div>

      {/* Terms */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        Ao confirmar, você concorda com os{" "}
        <a href="#" className="text-primary underline underline-offset-2">
          termos de uso
        </a>{" "}
        e autoriza a cobrança automática após a conclusão do passeio.
      </p>

      <FlowActions
        showBack
        onBack={onBack}
        primaryLabel="Concluir solicitação"
        onPrimary={onSubmit}
        primaryDisabled={submitting}
        primaryLoading={submitting}
        primaryVariant="success"
        primaryIcon={
          submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />
        }
      />
    </div>
  );
}
