import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** "★ 4,5 · 3 passeios" under the hero greeting: the user's reputation at a glance. */
export function HeroReputation({
  rating,
  totalWalks,
  className,
}: {
  rating?: number;
  totalWalks?: number;
  className?: string;
}) {
  return (
    <Link
      href="/profile"
      className={cn("inline-flex min-h-6 items-center gap-1.5 text-sm text-primary-foreground/80", className)}
    >
      <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
      <span className="font-semibold text-primary-foreground">
        {rating !== undefined ? rating.toFixed(1).replace(".", ",") : "—"}
      </span>
      <span className="text-primary-foreground/40">·</span>
      {totalWalks !== undefined ? `${totalWalks} passeio${totalWalks === 1 ? "" : "s"}` : "—"}
    </Link>
  );
}
