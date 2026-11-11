import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, PawPrint, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import type { WalkRecord } from "@/types";

/** The soonest accepted walk scheduled from today onwards, if any. */
export function findNextWalk(walks: readonly WalkRecord[], now: Date): WalkRecord | undefined {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return walks
    .filter((w) => w.status === "accepted" && new Date(w.scheduledAt).getTime() >= startOfToday)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
}

/** What the walker has next: the dogs, the tutor, when and where. */
export function NextWalkCard({ walk, isLoading }: { walk?: WalkRecord; isLoading: boolean }) {
  if (isLoading) return <Skeleton className="h-[120px] rounded-2xl" />;

  if (!walk) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-border/60 px-4 py-6 text-center">
        <p className="text-sm font-semibold text-foreground">Nenhum passeio agendado</p>
        <p className="text-xs text-muted-foreground">Os pedidos que você aceitar aparecem aqui.</p>
      </div>
    );
  }

  const pets = walk.pets?.length ? walk.pets : walk.petNames.map((name) => ({ name, photoUrl: null }));
  const shown = pets.slice(0, 3);

  return (
    <Link
      href={`/walks/${walk.id}`}
      className="group block rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-colors active:bg-muted/30"
    >
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 items-center">
          {shown.map((pet, i) => (
            <div
              key={`${pet.name}-${i}`}
              className={cn(
                "relative h-11 w-11 overflow-hidden rounded-full bg-amber-100 ring-2 ring-card",
                i > 0 && "-ml-3",
              )}
              style={{ zIndex: shown.length - i }}
            >
              {pet.photoUrl ? (
                <Image src={pet.photoUrl} alt={pet.name} fill sizes="44px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <PawPrint className="h-5 w-5 text-amber-600" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{walk.petNames.join(" & ")}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">Tutor: {walk.clientName}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{formatBRL(walk.price)}</p>
          <p className="text-[10px] text-muted-foreground">ganho estimado</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-xs text-foreground">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="first-letter:uppercase">{walk.dateLabel}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-xs text-foreground">
          <Timer className="h-3.5 w-3.5 text-muted-foreground" />
          {walk.durationMinutes} min
        </span>
        {walk.startAddress && (
          <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-xs text-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{walk.startAddress}</span>
          </span>
        )}
      </div>
    </Link>
  );
}
