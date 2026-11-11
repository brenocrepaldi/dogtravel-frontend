import Image from "next/image";
import { PawPrint } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ClientProfile } from "@/types";
import { GENDER_LABEL } from "./client-detail-helpers";

export function ClientDogNotesCard({ client }: { client: ClientProfile }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-amber-400/60 via-amber-500 to-amber-400/40" />
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 shrink-0">
            <PawPrint className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Observações dos cães</p>
            <p className="text-[11px] text-muted-foreground">Informações importantes para o passeio</p>
          </div>
        </div>

        {client.dogs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">Nenhum cão cadastrado</p>
        ) : (
          <div className="space-y-3">
            {client.dogs.map((dog) => (
              <div key={dog.id} className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                    {dog.photoUrl ? (
                      <Image src={dog.photoUrl} alt={dog.name} fill sizes="32px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-amber-500/10">
                        <PawPrint className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{dog.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{dog.breed} · {GENDER_LABEL[dog.gender] ?? dog.gender}</p>
                  </div>
                </div>
                {dog.notes ? (
                  <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-amber-400/50 pl-2.5 italic">
                    {dog.notes}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground/60 italic">Sem observações especiais</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
