"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, Lock, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useWalkRequests } from "@/features/walks/hooks/use-walks";
import { useWalkRequestActions } from "@/features/walks/hooks/use-walk-request-actions";
import { useAvailabilityToggle } from "@/features/walkers/hooks/use-availability-toggle";
import { RequestsOfflineState, RequestsWaitingState } from "./_components/requests-states";
import { WalkRequestCard } from "./_components/walk-request-card";

function subtitle(canToggle: boolean, available: boolean, count: number): string {
  if (!canToggle) return "Conclua seu perfil para receber pedidos.";
  if (!available) return "Você está indisponível.";
  if (count === 0) return "Nenhum pedido aguardando.";
  return `${count} pedido${count > 1 ? "s" : ""} aguardando sua resposta.`;
}

/** The walker's inbox of pending walk requests, behind the bell in the bottom nav. */
export default function WalkRequestsPage() {
  const router = useRouter();
  const {
    walkerProfileId,
    available,
    canToggle,
    isLoading: availabilityLoading,
    isUpdating,
    toggle,
  } = useAvailabilityToggle();
  const { data: requests = [], isLoading, isError, refetch, isRefetching } = useWalkRequests();
  const { accept, decline, isAccepting } = useWalkRequestActions(walkerProfileId);

  // Soonest walk first: that's the one the walker has to decide on now.
  const sorted = [...requests].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );
  const loading = isLoading || availabilityLoading;
  const online = available && canToggle;

  return (
    <div className="space-y-5 pb-8 md:space-y-8">
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
              Pedidos
            </h1>
            {loading ? (
              <Skeleton className="mt-1.5 h-4 w-48" />
            ) : (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {subtitle(canToggle, available, sorted.length)}
              </p>
            )}
          </div>

          {/* Availability: the same switch as the dashboard hero, compact. */}
          {!loading && (
            <div
              className={cn(
                "flex h-11 shrink-0 items-center gap-2.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
                online
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-border/60 bg-card text-muted-foreground",
              )}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {online && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={cn(
                    "relative inline-flex h-2 w-2 rounded-full",
                    online ? "bg-emerald-500" : "bg-muted-foreground/40",
                  )}
                />
              </span>
              {!canToggle ? "Bloqueado" : available ? "Disponível" : "Indisponível"}
              {canToggle ? (
                <Switch
                  checked={available}
                  onCheckedChange={toggle}
                  disabled={isUpdating}
                  aria-label="Disponível para passeios"
                  className="data-checked:bg-emerald-500"
                />
              ) : (
                <button
                  type="button"
                  onClick={toggle}
                  aria-label="Ver o que falta para ficar disponível"
                  className="cursor-pointer"
                >
                  <Lock className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
        <Separator className="mt-6 hidden md:block" />
      </div>

      {loading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : !online ? (
        <RequestsOfflineState canToggle={canToggle} onActivate={toggle} explainWhenLocked />
      ) : isError ? (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/[0.04] p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="min-w-0 flex-1 text-sm text-foreground">Não foi possível carregar os pedidos.</p>
          <Button variant="outline" className="h-11 shrink-0 sm:h-10" onClick={() => refetch()} disabled={isRefetching}>
            <RotateCw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
            Tentar de novo
          </Button>
        </div>
      ) : sorted.length === 0 ? (
        <RequestsWaitingState />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {sorted.map((req) => (
            <WalkRequestCard
              key={req.id}
              request={req}
              onOpen={() => router.push(`/walk-requests/${req.id}`)}
              onAccept={() => accept(req)}
              onDecline={() => decline(req)}
              isAccepting={isAccepting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
