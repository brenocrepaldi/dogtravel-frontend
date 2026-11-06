import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardHero({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 px-5 py-5 text-primary-foreground lg:px-8 lg:py-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-16 right-8 h-72 w-72 rounded-full bg-white/[0.03]" />
      <PawPrint className="pointer-events-none absolute bottom-3 right-5 h-24 w-24 text-white/[0.07] lg:h-32 lg:w-32" />
      <div className="relative">{children}</div>
    </div>
  );
}
