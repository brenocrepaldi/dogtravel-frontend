import { ClipboardList, PawPrint } from "lucide-react";

/** Shown while the walker is unavailable (or can't be yet: profile incomplete). */
export function RequestsOfflineState({
  canToggle,
  onActivate,
}: {
  canToggle: boolean;
  onActivate: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 p-4 lg:flex-col lg:py-10 lg:text-center">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted lg:h-12 lg:w-12">
        <ClipboardList className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          Você está offline
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground lg:mx-auto lg:max-w-[260px]">
          {!canToggle
            ? "Conclua seu perfil para poder receber pedidos de passeio."
            : "Ative sua disponibilidade para começar a receber pedidos."}
        </p>
      </div>
      {canToggle && (
        <button
          type="button"
          onClick={onActivate}
          className="h-11 shrink-0 cursor-pointer rounded-lg border border-primary/20 bg-primary/8 px-4 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 lg:mt-1 lg:h-auto lg:py-1.5"
        >
          <span className="lg:hidden">Ativar</span>
          <span className="hidden lg:inline">Ativar disponibilidade</span>
        </button>
      )}
    </div>
  );
}

/** Shown while the walker is available and nothing is waiting. */
export function RequestsWaitingState() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 lg:flex-col lg:gap-4 lg:py-10 lg:text-center">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center lg:h-12 lg:w-12">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
          <PawPrint className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          Você está online
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground lg:mx-auto lg:max-w-[260px]">
          Aguardando novos pedidos de passeio. Você será notificado assim que
          chegarem.
        </p>
      </div>
      <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground/70 lg:flex">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        Disponível para receber pedidos
      </div>
    </div>
  );
}
