"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, PawPrint } from "lucide-react";
import { useDogs } from "@/features/dogs/hooks/use-dogs";
import { DOG_SIZE_LABEL } from "@/lib/pets";
import { cn } from "@/lib/utils";
import { FlowActions } from "@/components/common/flow-actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WalkFormData } from "../walk-request-form";

interface Props {
  data: WalkFormData;
  updateData: (partial: Partial<WalkFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel?: () => void;
}

export function StepPets({ data, updateData, onNext, onCancel }: Props) {
  const { data: pets = [] } = useDogs();

  function togglePet(id: string) {
    const already = data.selectedPetIds.includes(id);
    updateData({
      selectedPetIds: already ? data.selectedPetIds.filter((petId) => petId !== id) : [...data.selectedPetIds, id],
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Quais cães vão passear?</h2>
        <p className="text-sm text-muted-foreground">Selecione os pets para validar compatibilidade com o passeador.</p>
      </div>

      {pets.length === 0 ? (
        <p className="text-muted-foreground text-sm py-6 text-center">
          Nenhum cão cadastrado. Adicione um na aba{" "}
          <Link href="/profile" className="text-primary underline">
            Perfil
          </Link>
          .
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pets.map((pet) => {
            const selected = data.selectedPetIds.includes(pet.id);
            return (
              <button
                key={pet.id}
                type="button"
                onClick={() => togglePet(pet.id)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer",
                  "hover:border-primary/60 hover:bg-primary/5",
                  selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-background"
                )}
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 ring-1 ring-border/30">
                  {pet.photoUrl ? (
                    <Image src={pet.photoUrl} alt={pet.name} fill sizes="80px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-amber-500/10 flex items-center justify-center">
                      <PawPrint className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="font-semibold text-sm">{pet.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {pet.breed} · {pet.age} {pet.age === 1 ? "ano" : "anos"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                      Porte {DOG_SIZE_LABEL[pet.size]}
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all mt-1",
                    selected ? "bg-primary border-primary" : "border-border"
                  )}
                >
                  {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Observações */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-sm font-medium">
          Observações para o passeador
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Ex: Rex puxa bastante a coleira, evite ruas movimentadas no início..."
          value={data.notes}
          onChange={(e) => updateData({ notes: e.target.value })}
          maxLength={300}
        />
        {data.notes.length > 0 && (
          <p className="text-right text-[11px] text-muted-foreground">
            {data.notes.length}/300
          </p>
        )}
      </div>

      <FlowActions
        showBack={false}
        onCancel={onCancel}
        primaryLabel="Continuar"
        primaryIcon={<ArrowRight className="h-4 w-4" />}
        onPrimary={onNext}
        primaryDisabled={data.selectedPetIds.length === 0}
      />
    </div>
  );
}
