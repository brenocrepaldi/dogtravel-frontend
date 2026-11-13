"use client";

import { useState } from "react";
import { ShieldCheck, UserCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWalkerById } from "@/features/walkers/hooks/use-walkers";
import { WalkerAvatar } from "@/app/(app)/walkers/_components/walker-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WalkerMeta, WalkerPickerSheet } from "./walker-picker-sheet";

function ChoiceCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex cursor-pointer flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all duration-200",
        "hover:border-primary/60 hover:bg-primary/5",
        selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-background",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="block text-xs leading-relaxed text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

/**
 * "Quem vai passear?": send the request to every walker (the first to accept takes it) or
 * direct it at one walker the client picks. A directed request reaches only that walker; if
 * they decline, the client chooses whether to open it to everyone or cancel.
 */
export function WalkerChoice({
  selectedWalkerId,
  onChange,
}: {
  selectedWalkerId: string | null;
  onChange: (walkerId: string | null) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data: walker, isLoading } = useWalkerById(selectedWalkerId ?? "");
  const directed = Boolean(selectedWalkerId);
  const firstName = walker?.name.split(" ")[0];

  return (
    <section className="space-y-3" aria-labelledby="walker-choice-title">
      <div>
        <h3 id="walker-choice-title" className="text-base font-semibold text-foreground">
          Quem vai passear?
        </h3>
        <p className="text-sm text-muted-foreground">Envie para todos ou escolha um passeador.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ChoiceCard
          icon={Users}
          title="Qualquer passeador"
          description="O primeiro disponível aceita."
          selected={!directed}
          onClick={() => onChange(null)}
        />
        <ChoiceCard
          icon={UserCheck}
          title="Escolher passeador"
          description="Só quem você escolher recebe."
          selected={directed}
          onClick={() => setPickerOpen(true)}
        />
      </div>

      {directed &&
        (isLoading || !walker ? (
          <Skeleton className="h-[68px] rounded-xl" />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/[0.04] p-3">
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
                <WalkerMeta walker={walker} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 shrink-0 text-primary"
                onClick={() => setPickerOpen(true)}
              >
                Trocar
              </Button>
            </div>
            <p className="px-1 text-xs leading-relaxed text-muted-foreground">
              Só {firstName} recebe o pedido. Se não puder, você decide se abre para todos ou cancela.
            </p>
          </div>
        ))}

      <WalkerPickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedWalkerId={selectedWalkerId}
        onSelect={(picked) => {
          onChange(picked.id);
          setPickerOpen(false);
        }}
      />
    </section>
  );
}
