"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useWalkById } from "@/features/walks/hooks/use-walks";
import { useWalkerById } from "@/features/walkers/hooks/use-walkers";
import { useReview } from "@/features/reviews/hooks/use-reviews";
import { WalkReviewForm } from "./_components/walk-review-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalkReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: walk, isLoading: walkLoading } = useWalkById(id);
  const { data: walker, isLoading: walkerLoading } = useWalkerById(walk?.walkerId ?? "");
  const { data: existingReview, isLoading: reviewLoading } = useReview(id);

  const isLoading = walkLoading || walkerLoading || reviewLoading;

  if (isLoading) {
    return (
      <div className="space-y-8 pb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!walk || !walker) {
    notFound();
  }

  return (
    <WalkReviewForm
      walkId={walk.id}
      walkerId={walk.walkerId ?? ""}
      walkDate={walk.dateLabel}
      walkerName={walker.name}
      petNames={walk.petNames}
      existingReview={existingReview ?? undefined}
    />
  );
}
