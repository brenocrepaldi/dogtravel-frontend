import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { ClientProfile } from "@/types";

export function ClientRatingProfileCard({ client }: { client: ClientProfile }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
      <CardContent className="p-5 space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Star className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Perfil de avaliador</p>
            <p className="text-[11px] text-muted-foreground">Como este cliente avalia passeadores</p>
          </div>
        </div>

        {/* Average prominent */}
        <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
          <span className="text-3xl font-bold text-primary">{client.avgRatingGiven.toFixed(1)}</span>
          <div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("h-3.5 w-3.5", i < Math.round(client.avgRatingGiven) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30")} />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{client.reviews.length} avaliação{client.reviews.length > 1 ? "ões" : ""}</p>
          </div>
        </div>

        {/* Star breakdown */}
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = client.reviews.filter((r) => r.rating === star).length;
            const pct = client.reviews.length > 0 ? (count / client.reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground w-6 shrink-0">
                  {star}<Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground w-4 text-right shrink-0">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Tendência */}
        <div className={cn(
          "rounded-lg border px-3 py-2.5",
          client.avgRatingGiven >= 4.5
            ? "border-emerald-500/20 bg-emerald-500/5"
            : client.avgRatingGiven >= 3.5
            ? "border-amber-500/20 bg-amber-500/5"
            : "border-rose-500/20 bg-rose-500/5",
        )}>
          <p className={cn("text-xs font-semibold",
            client.avgRatingGiven >= 4.5 ? "text-emerald-700 dark:text-emerald-400"
            : client.avgRatingGiven >= 3.5 ? "text-amber-700 dark:text-amber-400"
            : "text-rose-700 dark:text-rose-400"
          )}>
            {client.avgRatingGiven >= 4.5
              ? "Avaliador generoso"
              : client.avgRatingGiven >= 3.5
              ? "Avaliador equilibrado"
              : "Avaliador criterioso"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {client.avgRatingGiven >= 4.5
              ? "Tende a valorizar bem o serviço prestado"
              : client.avgRatingGiven >= 3.5
              ? "Avalia com base no desempenho real"
              : "Espera um alto nível de serviço"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
