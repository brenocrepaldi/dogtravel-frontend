import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientProfile } from "@/types";
import { clientInitials } from "./client-detail-helpers";

export function ReviewCard({ review }: { review: ClientProfile["reviews"][number] }) {
  const date = new Date(review.createdAt).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={cn(
      "rounded-xl border border-border/60 bg-card p-4",
      "transition-all duration-300 hover:border-border hover:shadow-sm",
    )}>
      <div className="flex items-start gap-3">
        {review.walkerAvatarUrl ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/40">
            <Image src={review.walkerAvatarUrl} alt={review.walkerName} fill sizes="40px" className="object-cover" />
          </div>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
            {clientInitials(review.walkerName || "?")}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-foreground leading-none">{review.walkerName}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Passeador avaliado</p>
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground">{date}</span>
          </div>

          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i < review.rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted-foreground/30",
                )}
              />
            ))}
            <span className="ml-1.5 text-xs font-semibold text-foreground">{review.rating.toFixed(1)}</span>
          </div>

          {review.comment && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed border-l-2 border-border/60 pl-3 italic">
              &ldquo;{review.comment}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
