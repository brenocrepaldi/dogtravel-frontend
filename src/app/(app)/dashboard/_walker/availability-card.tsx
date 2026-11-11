"use client";

import Link from "next/link";
import { Bell, ChevronRight, PawPrint, Power, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AvailabilityCardProps {
  available: boolean;
  canToggle: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  requestCount: number;
  onToggle: () => void;
  className?: string;
}

/**
 * The walker's "am I working?" control on phones, out of the hero and within
 * thumb reach. Each state says what it means and offers the one next step:
 * finish the profile, go online, or see the requests waiting.
 */
export function AvailabilityCard({
  available,
  canToggle,
  isLoading,
  isUpdating,
  requestCount,
  onToggle,
  className,
}: AvailabilityCardProps) {
  if (isLoading) return <Skeleton className={cn("h-[76px] rounded-2xl", className)} />;

  if (!canToggle) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4",
          className,
        )}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
          <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Perfil incompleto</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Conclua a verificação para receber pedidos.</p>
        </div>
        <Button variant="outline" className="h-11 shrink-0 border-amber-500/30" onClick={onToggle}>
          Ver pendências
        </Button>
      </div>
    );
  }

  if (!available) {
    return (
      <div className={cn("space-y-3.5 rounded-2xl border border-border/60 bg-card p-4", className)}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Power className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Você está offline</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Fique online para receber pedidos de passeio.</p>
          </div>
        </div>
        <Button className="h-12 w-full text-sm font-semibold" onClick={onToggle} disabled={isUpdating}>
          <Power className="h-4 w-4" />
          Ficar online
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.08] via-card to-card",
        className,
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20 motion-reduce:hidden" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <PawPrint className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Você está online</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Recebendo pedidos de passeio.</p>
        </div>
        {/* 44px hit area around a large switch. */}
        <button
          type="button"
          role="switch"
          aria-checked={available}
          aria-label="Disponível para passeios"
          onClick={onToggle}
          disabled={isUpdating}
          className="-mr-1.5 flex h-11 shrink-0 cursor-pointer items-center px-1.5 disabled:opacity-60"
        >
          <span className="relative h-7 w-12 rounded-full bg-emerald-500 transition-colors">
            <span className="absolute left-[calc(100%-1.625rem)] top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-all" />
          </span>
        </button>
      </div>

      {requestCount > 0 && (
        <Link
          href="/walk-requests"
          className="flex min-h-11 items-center gap-2 border-t border-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/[0.06] dark:text-emerald-400"
        >
          <Bell className="h-4 w-4" />
          <span className="flex-1">
            {requestCount} pedido{requestCount > 1 ? "s" : ""} aguardando sua resposta
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
