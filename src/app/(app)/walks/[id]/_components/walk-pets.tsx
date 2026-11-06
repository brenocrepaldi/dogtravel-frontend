"use client";

import Image from "next/image";
import { PawPrint } from "lucide-react";
import { useDogs } from "@/features/dogs/hooks/use-dogs";

interface WalkPetsProps {
  petNames: string[];
  pets?: { name: string; photoUrl?: string | null }[];
}

export function WalkPets({ petNames, pets: petsProp }: WalkPetsProps) {
  const { data: allPets = [] } = useDogs();

  const pets = petsProp
    ? petsProp
    : petNames.map((name) => ({
        name,
        photoUrl: allPets.find((p) => p.name === name)?.photoUrl,
      }));

  return (
    <div className="flex flex-wrap gap-3">
      {pets.map(({ name, photoUrl }) => (
        <div key={name} className="flex flex-col items-center gap-1.5">
          <div className="relative h-14 w-14 overflow-hidden rounded-xl ring-1 ring-border/40">
            {photoUrl ? (
              <Image src={photoUrl} alt={name} fill sizes="56px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-amber-500/10">
                <PawPrint className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-foreground">{name}</span>
        </div>
      ))}
    </div>
  );
}
