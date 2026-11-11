"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { WalkRequest } from "@/types";
import { useAcceptWalk, useDeclineWalk } from "./use-walk-actions";

/** Accept/decline a walk request with the walker-facing feedback toasts. */
export function useWalkRequestActions(walkerProfileId: string) {
  const router = useRouter();
  const { data: session } = useSession();
  const { mutate: acceptWalk, isPending: isAccepting } = useAcceptWalk();
  const { mutate: declineWalk, mutateAsync: declineWalkAsync, isPending: isDeclining } = useDeclineWalk();
  const [isDecliningAll, setIsDecliningAll] = useState(false);

  function accept(request: WalkRequest) {
    const walkerName = session?.user?.name ?? "Passeador";
    acceptWalk(
      { request, walkerName, walkerId: walkerProfileId },
      {
        onSuccess: () => {
          toast.success("Passeio aceito!", {
            description: `${request.clientName} foi notificado. Veja em Meus passeios.`,
            action: { label: "Ver passeios", onClick: () => router.push("/walks") },
          });
        },
        onError: () => {
          toast.error("Erro ao aceitar o passeio.", {
            description: "Tente novamente. Se o problema persistir, recarregue a página.",
          });
        },
      },
    );
  }

  function decline(request: WalkRequest) {
    declineWalk(request.id, {
      onSuccess: () => {
        toast("Passeio recusado", { description: `Pedido de ${request.clientName} devolvido para a fila.` });
      },
    });
  }

  /** Declines every request in the list ("limpar todos"); each goes back to the queue for other walkers. */
  async function declineAll(requests: readonly WalkRequest[]) {
    if (requests.length === 0) return;
    setIsDecliningAll(true);
    const results = await Promise.allSettled(requests.map((r) => declineWalkAsync(r.id)));
    setIsDecliningAll(false);
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === 0) {
      toast("Pedidos limpos", {
        description: `${requests.length} pedido${requests.length > 1 ? "s" : ""} devolvido${requests.length > 1 ? "s" : ""} para a fila.`,
      });
    } else {
      toast.error("Não foi possível limpar todos os pedidos.", {
        description: `${failed} de ${requests.length} continuam na lista. Tente novamente.`,
      });
    }
  }

  return { accept, decline, declineAll, isAccepting, isDeclining, isDecliningAll };
}
