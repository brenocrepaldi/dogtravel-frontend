"use client";

import { Star, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalkerReviews } from "@/features/walkers/hooks/use-walkers";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  rating,
  comment,
  clientName,
  createdAt,
}: {
  rating: number;
  comment: string | null;
  clientName: string;
  createdAt: string;
}) {
  const date = new Date(createdAt).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-[11px] font-semibold text-muted-foreground">
              {clientName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{clientName}</p>
            <p className="text-[11px] text-muted-foreground">{date}</p>
          </div>
        </div>
        <StarRating rating={rating} />
      </div>
      {comment && (
        <p className="text-sm text-muted-foreground leading-relaxed pl-9">{comment}</p>
      )}
    </div>
  );
}

export function WalkerReviewsSection({ walkerId }: { walkerId: string }) {
  const { data: reviews, isLoading } = useWalkerReviews(walkerId);

  if (isLoading) {
    return (
      <Card className="overflow-hidden pt-1">
        <div className="px-5 pt-5 flex items-center gap-2.5">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Separator className="mt-4" />
        <CardContent className="pb-5 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-7 h-7 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
              <Skeleton className="h-3 w-full ml-9" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!reviews || reviews.length === 0) return null;

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <Card className="overflow-hidden pt-1">
      <div className="px-5 pt-5 pb-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-semibold">Avaliações dos clientes</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {avg.toFixed(1)} de média · {reviews.length}{" "}
            {reviews.length === 1 ? "avaliação" : "avaliações"}
          </p>
        </div>
      </div>
      <Separator />
      <CardContent className="pb-5 space-y-4 pt-4">
        {reviews.map((review, i) => (
          <div key={review.id}>
            <ReviewCard
              rating={review.rating}
              comment={review.comment}
              clientName={review.clientName}
              createdAt={review.createdAt}
            />
            {i < reviews.length - 1 && <div className="h-px bg-border/40 mt-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
