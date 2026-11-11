"use client";

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
  const { mutate: declineWalk, isPending: isDeclining } = useDeclineWalk();

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

  return { accept, decline, isAccepting, isDeclining };
}
