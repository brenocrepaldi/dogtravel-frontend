"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, PawPrint, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDogs } from "@/features/dogs/hooks/use-dogs";

function PetAvatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  if (photoUrl) {
    return (
      <div className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-2 ring-border/30">
        <Image src={photoUrl} alt={name} fill sizes="48px" className="object-cover" />
      </div>
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
      <PawPrint className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    </div>
  );
}

export function DashboardDogs() {
  const { data: pets = [] } = useDogs();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {pets.map((pet) => (
        <Link key={pet.id} href={`/dogs?edit=${pet.id}`}>
          <div className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all duration-150 hover:border-border hover:bg-accent/40">
            <PetAvatar name={pet.name} photoUrl={pet.photoUrl} />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{pet.name}</p>
              <p className="truncate text-xs text-muted-foreground">{pet.breed}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                {pet.age} {pet.age === 1 ? "ano" : "anos"}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
          </div>
        </Link>
      ))}

      <Link href="/dogs?add=true">
        <div className="group flex items-center gap-4 rounded-xl border border-dashed border-border/60 p-4 transition-all duration-150 hover:border-primary/40 hover:bg-primary/[0.02]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-border/60 transition-colors group-hover:border-primary/40">
            <Plus className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
          <span className={cn("text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground")}>
            Adicionar cão
          </span>
        </div>
      </Link>
    </div>
  );
}
