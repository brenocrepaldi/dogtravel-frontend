"use client";

import Link from "next/link";
import { ChevronRight, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWalkerById } from "@/features/walkers/hooks/use-walkers";
import { WalkerAvatar } from "@/app/(app)/walkers/_components/walker-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PICK_WALKER_HREF } from "./walk-request-draft";

const BANNER = "rounded-xl border border-primary/20 bg-primary/[0.05]";

/**
 * Top of step 1. By default the request goes to every walker, so this only invites the
 * client to pick one, on the walkers page they already know. Once a walker is picked the
 * same slot shows who gets the request, with a way to change or drop them.
 */
export function WalkerInviteBanner({
  selectedWalkerId,
  onBeforePick,
  onClear,
}: {
  selectedWalkerId: string | null;
  /** Runs right before leaving for the walkers page (the form parks its draft here). */
  onBeforePick: () => void;
  onClear: () => void;
}) {
  const { data: walker, isLoading } = useWalkerById(selectedWalkerId ?? "");

  if (!selectedWalkerId) {
    return (
      <Link
        href={PICK_WALKER_HREF}
        onClick={onBeforePick}
        data-keeps-draft
        className={cn(
          BANNER,
          "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary/[0.08] active:bg-primary/[0.1]",
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-4 w-4 text-primary" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-foreground">Qualquer passeador disponível pode aceitar.</span>
          <span className="block text-sm font-semibold text-primary">Escolher um específico</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-primary" aria-hidden />
      </Link>
    );
  }

  if (isLoading || !walker) return <Skeleton className="h-[92px] rounded-xl" />;

  const firstName = walker.name.split(" ")[0];
  // Text actions under the name rather than beside it: at 360-390px a row of buttons next to
  // the avatar would truncate the name and the "only X gets it" line, the point of the banner.
  const action = "-my-1.5 cursor-pointer py-1.5 text-sm font-semibold text-primary hover:underline";

  return (
    <div className={cn(BANNER, "flex items-start gap-3 p-3")}>
      <WalkerAvatar
        name={walker.name}
        avatarUrl={walker.avatarUrl}
        sizes="44px"
        className="h-11 w-11 rounded-xl"
        initialsClassName="text-sm"
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <span className="truncate">{walker.name}</span>
          {walker.verified && (
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Verificado" />
          )}
        </p>
        <p className="text-sm text-muted-foreground">Só {firstName} recebe o pedido.</p>
        <div className="mt-2 flex items-center gap-5">
          <Link href={PICK_WALKER_HREF} onClick={onBeforePick} data-keeps-draft className={action}>
            Trocar
          </Link>
          <button type="button" onClick={onClear} className={action}>
            Abrir para todos
          </button>
        </div>
      </div>
    </div>
  );
}
