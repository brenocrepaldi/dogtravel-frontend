"use client";

import { Dog, Calendar, MapPin, CreditCard, Clock, BadgePercent } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDogs } from "@/features/dogs/hooks/use-dogs";
import { usePaymentMethods } from "@/features/payments/hooks/use-payments";
import type { WalkFormData } from "./walk-request-form";

function fmt(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Props {
  data: WalkFormData;
  currentStep: number;
}

function Row({
  icon: Icon,
  label,
  value,
  dimmed,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  dimmed?: boolean;
}) {
  return (
    <div className={cn("flex items-start gap-2.5 py-2", dimmed && "opacity-40")}>
      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xs font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

/**
 * Sticky summary panel shown to the right of the step form.
 * Updates in real-time as the user fills in each step.
 */
export function WalkSummary({ data, currentStep }: Props) {
  const { data: pets = [] } = useDogs();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const petNames =
    data.selectedPetIds.length > 0
      ? data.selectedPetIds
          .map((id) => pets.find((pet) => pet.id === id)?.name ?? id)
          .join(", ")
      : null;

  const dateLabel =
    data.date && data.time
      ? new Date(data.date + "T" + data.time).toLocaleString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : data.date
      ? new Date(data.date + "T00:00").toLocaleDateString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })
      : null;

  const method = data.selectedMethodId
    ? paymentMethods.find((paymentMethod) => paymentMethod.id === data.selectedMethodId)
    : null;

  return (
    <div className="rounded-2xl border border-border bg-background shadow-sm p-5 space-y-4">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Resumo do pedido
        </p>
      </div>

      <div className="divide-y divide-border">
        <Row
          icon={Dog}
          label="Cães"
          value={petNames ?? "Nenhum selecionado"}
          dimmed={!petNames}
        />
        <Row
          icon={Calendar}
          label="Data e horário"
          value={dateLabel ?? "Não selecionado"}
          dimmed={!dateLabel}
        />
        <Row
          icon={Clock}
          label="Duração"
          value={`${data.durationMinutes} minutos`}
          dimmed={currentStep < 1}
        />
        <Row
          icon={MapPin}
          label="Local"
          value={data.address || "Não informado"}
          dimmed={!data.address}
        />
        <Row
          icon={CreditCard}
          label="Pagamento"
          value={method ? `${method.brand ? `${method.brand} ` : ''}${method.label}` : "Não selecionado"}
          dimmed={!method}
        />
        <Row
          icon={BadgePercent}
          label="Oferta"
          value={data.isFirstRide ? "Desconto de primeira contratação ativo" : "Sem desconto aplicado"}
          dimmed={!data.isFirstRide}
        />
      </div>

      {/* Price */}
      {data.estimatedPrice !== null ? (
        <div className="rounded-xl bg-primary/5 border border-primary/20 px-3 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Total estimado</span>
          <span className="text-base font-bold text-primary">{fmt(data.estimatedPrice)}</span>
        </div>
      ) : (
        <div className="rounded-xl bg-muted/50 border border-border px-3 py-3 text-center">
          <p className="text-xs text-muted-foreground">Preço calculado no passo 4</p>
        </div>
      )}

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Progresso</span>
          <span>{currentStep + 1}/6</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / 6) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
