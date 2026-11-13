"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Search, ShieldCheck, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOTTOM_SHEET_ON_MOBILE } from "@/lib/sheet";
import { useWalkers } from "@/features/walkers/hooks/use-walkers";
import { WalkerAvatar } from "@/app/(app)/walkers/_components/walker-avatar";
import { EmptyState } from "@/components/common/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { WalkerProfile } from "@/types";

/** Rating and area; a walker with no reviews yet reads "Novo" instead of a 0.0 rating. */
export function WalkerMeta({ walker }: { walker: WalkerProfile }) {
  return (
    <p className="flex items-center gap-1 text-sm text-muted-foreground">
      {walker.reviews > 0 ? (
        <>
          <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">{walker.rating.toFixed(1)}</span>
          <span>({walker.reviews})</span>
        </>
      ) : (
        <span className="font-medium text-primary">Novo</span>
      )}
      {walker.location && <span className="truncate">· {walker.location}</span>}
    </p>
  );
}

const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/**
 * Lets the client pick the walker for this request without leaving the request flow
 * (leaving it would throw away what they already filled in).
 */
export function WalkerPickerSheet({
  open,
  onOpenChange,
  selectedWalkerId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedWalkerId: string | null;
  onSelect: (walker: WalkerProfile) => void;
}) {
  const { data: walkers = [], isLoading, isError, refetch } = useWalkers();
  const [query, setQuery] = useState("");
  // On a phone, focusing the search box on open would raise the keyboard over the list the
  // client most likely just wants to scroll; focus the list instead and let them tap search.
  const listRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return walkers;
    return walkers.filter((w) => normalize(`${w.name} ${w.location}`).includes(q));
  }, [walkers, query]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="center"
        initialFocus={(openType) => (openType === "touch" ? listRef.current : true)}
        className={cn(
          "flex max-h-[80dvh] flex-col gap-0 overflow-hidden border-border/60 p-0 sm:max-w-lg",
          BOTTOM_SHEET_ON_MOBILE,
        )}
      >
        <div className="shrink-0 space-y-3 border-b border-border/50 px-5 pt-5 pb-4 pr-14 max-md:px-4 max-md:pt-4">
          <SheetHeader className="space-y-0.5 p-0 text-left">
            <SheetTitle className="text-base font-semibold">Escolher passeador</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              O pedido vai só para quem você escolher.
            </SheetDescription>
          </SheetHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou bairro"
              aria-label="Buscar passeador"
              autoComplete="off"
              enterKeyHint="search"
              className="h-11 pl-9 max-md:text-base"
            />
          </div>
        </div>

        <div
          ref={listRef}
          tabIndex={-1}
          className="flex-1 overflow-y-auto overscroll-contain px-2 py-2 outline-none pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
        >
          {isLoading ? (
            <div className="space-y-2 p-2" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              icon={Users}
              title="Não foi possível carregar os passeadores"
              description="Verifique sua conexão e tente novamente."
              actionLabel="Tentar novamente"
              onAction={() => refetch()}
            />
          ) : visible.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nenhum passeador encontrado para “{query.trim()}”.
            </p>
          ) : (
            <ul className="space-y-1">
              {visible.map((walker) => {
                const selected = walker.id === selectedWalkerId;
                return (
                  <li key={walker.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(walker)}
                      aria-pressed={selected}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        selected ? "bg-primary/[0.07]" : "hover:bg-accent/60 active:bg-accent",
                      )}
                    >
                      <WalkerAvatar
                        name={walker.name}
                        avatarUrl={walker.avatarUrl}
                        sizes="48px"
                        className="h-12 w-12 rounded-xl"
                        initialsClassName="text-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          <span className="truncate">{walker.name}</span>
                          {walker.verified && (
                            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Verificado" />
                          )}
                        </p>
                        <WalkerMeta walker={walker} />
                      </div>
                      {selected && <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
