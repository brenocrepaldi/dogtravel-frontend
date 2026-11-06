"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, PawPrint, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDogs } from "@/features/dogs/hooks/use-dogs";

const trackClass =
  "no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0";
const itemClass = "w-28 shrink-0 snap-start lg:w-auto";

function PetPhoto({ name, photoUrl }: { name: string; photoUrl?: string }) {
  return (
    <div className="relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-500/10 ring-1 ring-border/30 lg:w-12">
      {photoUrl ? (
        <Image src={photoUrl} alt={name} fill sizes="(min-width: 1024px) 48px, 96px" className="object-cover" />
      ) : (
        <PawPrint className="h-6 w-6 text-amber-600 dark:text-amber-400 lg:h-5 lg:w-5" />
      )}
    </div>
  );
}

export function DashboardDogs() {
  const { data: pets = [], isLoading } = useDogs();

  if (isLoading) {
    return (
      <div className={trackClass}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[150px] w-28 shrink-0 rounded-2xl lg:h-20 lg:w-auto lg:rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className={trackClass}>
      {pets.map((pet) => (
        <Link key={pet.id} href={`/dogs?edit=${pet.id}`} className={itemClass}>
          <div className="group flex h-full flex-col gap-2.5 rounded-2xl border border-border/60 bg-card p-2 transition-all duration-150 hover:border-border hover:bg-accent/40 lg:flex-row lg:items-center lg:gap-4 lg:rounded-xl lg:p-4">
            <PetPhoto name={pet.name} photoUrl={pet.photoUrl} />
            <div className="min-w-0 flex-1 px-1 pb-1 lg:p-0">
              <p className="truncate text-sm font-semibold text-foreground">{pet.name}</p>
              <p className="truncate text-xs text-muted-foreground">{pet.breed}</p>
              <p className="mt-0.5 hidden text-[11px] text-muted-foreground/70 lg:block">
                {pet.age} {pet.age === 1 ? "ano" : "anos"}
              </p>
            </div>
            <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground lg:block" />
          </div>
        </Link>
      ))}

      <Link href="/dogs?add=true" className={itemClass}>
        <div className="group flex h-full flex-col gap-2.5 rounded-2xl border border-dashed border-border/60 p-2 transition-all duration-150 hover:border-primary/40 hover:bg-primary/[0.02] lg:flex-row lg:items-center lg:gap-4 lg:rounded-xl lg:p-4">
          <div className="flex aspect-square w-full shrink-0 items-center justify-center rounded-xl border border-dashed border-border/60 transition-colors group-hover:border-primary/40 lg:w-12">
            <Plus className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary lg:h-4 lg:w-4" />
          </div>
          <span className="px-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground lg:p-0">
            Adicionar cão
          </span>
        </div>
      </Link>
    </div>
  );
}
