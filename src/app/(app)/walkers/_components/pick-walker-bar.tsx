import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * Shown on /walkers?pick=1: the client left step 1 of a walk request to choose who gets it.
 * "Voltar" returns to the request as it was (the form restores its parked draft).
 */
export function PickWalkerBar() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/[0.05] py-2 pr-2 pl-4">
      <UserCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
      <p className="min-w-0 flex-1 text-sm font-medium text-foreground">
        Escolha o passeador do seu pedido
      </p>
      <Link
        href="/walks/new"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 shrink-0 text-primary")}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Voltar
      </Link>
    </div>
  );
}
