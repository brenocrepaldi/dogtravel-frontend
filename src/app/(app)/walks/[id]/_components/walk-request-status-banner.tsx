"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Hourglass, UserX, Users } from "lucide-react";
import { useCancelWalk, useOpenWalk } from "@/features/walks/hooks/use-walk-actions";
import { Button } from "@/components/ui/button";
import type { WalkRecord } from "@/types";

/**
 * Client side of a request directed at one walker: while waiting it says who has it, and
 * once that walker declines it hands the decision back to the client (open it to every
 * walker, or cancel).
 */
export function WalkRequestStatusBanner({
  walk,
  walkerName,
}: {
  walk: WalkRecord;
  walkerName: string | null;
}) {
  const openWalk = useOpenWalk();
  const cancelWalk = useCancelWalk();
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  if (walk.status !== "pending") return null;
  if (walk.requestMode !== "directed" && walk.requestMode !== "declined") return null;

  const name = walkerName ?? "O passeador escolhido";
  const busy = openWalk.isPending || cancelWalk.isPending;

  function handleOpen() {
    openWalk.mutate(walk.id, {
      onSuccess: () => toast.success("Pedido aberto para todos os passeadores."),
      onError: () => toast.error("Não foi possível abrir o pedido. Tente novamente."),
    });
  }

  function handleCancel() {
    cancelWalk.mutate(walk.id, {
      onSuccess: () => toast.success("Pedido cancelado."),
      onError: () => toast.error("Não foi possível cancelar o pedido. Tente novamente."),
    });
  }

  if (walk.requestMode === "directed") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/[0.05] px-4 py-3.5 sm:px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Hourglass className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Aguardando {name} responder</p>
          <p className="text-sm text-muted-foreground">O pedido foi enviado só para {name.split(" ")[0]}.</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 text-primary max-sm:w-full"
          onClick={handleOpen}
          disabled={busy}
        >
          Abrir para todos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
          <UserX className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{name} não pode fazer este passeio</p>
          <p className="text-sm text-muted-foreground">
            Abra o pedido para todos os passeadores ou cancele.
          </p>
        </div>
      </div>

      {confirmingCancel ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <p className="text-sm font-medium text-foreground sm:mr-auto sm:self-center">
            Cancelar este pedido?
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:h-9"
            onClick={() => setConfirmingCancel(false)}
            disabled={busy}
          >
            Voltar
          </Button>
          <Button
            type="button"
            className="h-11 bg-destructive text-white hover:bg-destructive/90 sm:h-9"
            onClick={handleCancel}
            disabled={busy}
          >
            Sim, cancelar
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:h-9"
            onClick={() => setConfirmingCancel(true)}
            disabled={busy}
          >
            Cancelar pedido
          </Button>
          <Button type="button" className="h-11 gap-2 sm:h-9" onClick={handleOpen} disabled={busy}>
            <Users className="h-4 w-4" />
            Abrir para todos
          </Button>
        </div>
      )}
    </div>
  );
}
