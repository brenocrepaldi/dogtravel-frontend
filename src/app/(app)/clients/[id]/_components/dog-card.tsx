import Image from "next/image";
import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientProfile } from "@/types";
import { GENDER_LABEL, SIZE_COLOR, SIZE_LABEL } from "./client-detail-helpers";

export function DogCard({ dog }: { dog: ClientProfile["dogs"][number] }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-all duration-200 hover:border-border hover:shadow-sm">
      {/* Square avatar */}
      <div className="relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-amber-500/8">
        {dog.photoUrl ? (
          <Image
            src={dog.photoUrl}
            alt={dog.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PawPrint className="h-7 w-7 text-amber-400/70" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="truncate text-sm font-semibold text-foreground">{dog.name}</p>
        <p className="truncate text-xs text-muted-foreground">{dog.breed}</p>
        <div className="flex flex-wrap gap-1">
          <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold", SIZE_COLOR[dog.size] ?? "bg-muted text-muted-foreground")}>
            {SIZE_LABEL[dog.size] ?? dog.size}
          </span>
          <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {GENDER_LABEL[dog.gender] ?? dog.gender}
          </span>
          <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {dog.age} {dog.age === 1 ? "ano" : "anos"}
          </span>
        </div>
      </div>
    </div>
  );
}
